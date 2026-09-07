import { prisma } from "@/lib/prisma";
import { StorefrontError } from "@/lib/storefront-error";
import { getCouponByCode, getCouponValidationError } from "@/services/coupon.service";
import { calculateOrderPricing } from "@/services/pricing.service";
import {
  productPromotionInclude,
  withEffectiveProductPromotion,
} from "@/services/promotion.service";

export async function getOrCreateCart(userId: string) {
  const existingCart = await prisma.cart.findUnique({
    where: {
      userId,
    },
  });

  if (existingCart) {
    return existingCart;
  }

  return prisma.cart.create({
    data: {
      userId,
    },
  });
}

export async function getCartByUserId(userId: string) {
  const cart = await getOrCreateCart(userId);

  const detailedCart = await prisma.cart.findUnique({
    where: {
      id: cart.id,
    },
    include: {
      coupon: true,
      items: {
        include: {
          product: {
            include: {
              ...productPromotionInclude,
              images: {
                orderBy: {
                  sortOrder: "asc",
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!detailedCart) {
    return null;
  }

  const now = new Date();

  return {
    ...detailedCart,
    items: detailedCart.items.map((item) => ({
      ...item,
      product: withEffectiveProductPromotion(item.product, now),
    })),
  };
}

export async function addProductToCart(
  userId: string,
  productId: string,
  quantity = 1,
) {
  if (quantity < 1 || quantity > 99) {
    throw new StorefrontError("Số lượng sản phẩm không hợp lệ");
  }

  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
    select: {
      name: true,
      status: true,
      type: true,
      stock: true,
    },
  });

  if (!product) {
    throw new StorefrontError("Sản phẩm không tồn tại", 404);
  }

  if (product.status !== "ACTIVE") {
    throw new StorefrontError("Sản phẩm hiện không mở bán", 409);
  }

  const cart = await getOrCreateCart(userId);

  const existingItem = await prisma.cartItem.findUnique({
    where: {
      cartId_productId: {
        cartId: cart.id,
        productId,
      },
    },
  });

  if (existingItem) {
    const nextQuantity = existingItem.quantity + quantity;

    if (product.type === "IN_STOCK" && nextQuantity > product.stock) {
      throw new StorefrontError(
        `${product.name} chỉ còn ${product.stock} sản phẩm`,
        409,
      );
    }

    return prisma.cartItem.update({
      where: {
        id: existingItem.id,
      },
      data: {
        quantity: nextQuantity,
      },
    });
  }

  if (product.type === "IN_STOCK" && quantity > product.stock) {
    throw new StorefrontError(
      `${product.name} chỉ còn ${product.stock} sản phẩm`,
      409,
    );
  }

  return prisma.cartItem.create({
    data: {
      cartId: cart.id,
      productId,
      quantity,
    },
  });
}

export async function updateCartItemQuantity(
  userId: string,
  itemId: string,
  quantity: number,
) {
  const cart = await getOrCreateCart(userId);

  const cartItem = await prisma.cartItem.findFirst({
    where: {
      id: itemId,
      cartId: cart.id,
    },
    include: {
      product: {
        select: {
          name: true,
          status: true,
          type: true,
          stock: true,
        },
      },
    },
  });

  if (!cartItem) {
    throw new StorefrontError("Sản phẩm không có trong giỏ hàng", 404);
  }

  if (quantity <= 0) {
    return prisma.cartItem.delete({
      where: {
        id: itemId,
        cartId: cart.id,
      },
    });
  }

  if (quantity > 99) {
    throw new StorefrontError("Số lượng sản phẩm không được vượt quá 99");
  }

  if (cartItem.product.status !== "ACTIVE") {
    throw new StorefrontError("Sản phẩm hiện không mở bán", 409);
  }

  if (
    cartItem.product.type === "IN_STOCK" &&
    quantity > cartItem.product.stock
  ) {
    throw new StorefrontError(
      `${cartItem.product.name} chỉ còn ${cartItem.product.stock} sản phẩm`,
      409,
    );
  }

  return prisma.cartItem.update({
    where: {
      id: itemId,
      cartId: cart.id,
    },
    data: {
      quantity,
    },
  });
}

export async function removeCartItem(userId: string, itemId: string) {
  const cart = await getOrCreateCart(userId);

  const cartItem = await prisma.cartItem.findFirst({
    where: {
      id: itemId,
      cartId: cart.id,
    },
    select: {
      id: true,
    },
  });

  if (!cartItem) {
    throw new StorefrontError("Sản phẩm không có trong giỏ hàng", 404);
  }

  return prisma.cartItem.delete({
    where: {
      id: itemId,
      cartId: cart.id,
    },
  });
}

export async function applyCouponToCart(userId: string, code: string) {
  const cart = await getCartByUserId(userId);

  if (!cart || cart.items.length === 0) {
    throw new Error("Giỏ hàng đang trống");
  }

  const pricing = calculateOrderPricing(
    cart.items.map((item) => ({
      unitPrice: item.product.price,
      quantity: item.quantity,
      promotion: item.product.promotion,
    })),
  );

  const amountAfterProductDiscount =
    pricing.subtotal - pricing.productDiscountAmount;

  const coupon = await getCouponByCode(code);

  if (!coupon) {
    throw new Error("Không tìm thấy coupon");
  }

  const validationError = getCouponValidationError(
    coupon,
    amountAfterProductDiscount,
  );

  if (validationError) {
    throw new Error(validationError);
  }

  return prisma.cart.update({
    where: {
      id: cart.id,
    },
    data: {
      couponId: coupon.id,
    },
    include: {
      coupon: true,
    },
  });
}

export async function removeCouponFromCart(userId: string) {
  const cart = await getOrCreateCart(userId);

  return prisma.cart.update({
    where: {
      id: cart.id,
    },
    data: {
      couponId: null,
    },
  });
}
