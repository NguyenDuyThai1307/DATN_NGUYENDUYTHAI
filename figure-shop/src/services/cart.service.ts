import { prisma } from "@/lib/prisma";
import { getCouponByCode, getCouponValidationError } from "@/services/coupon.service";
import { calculateOrderPricing } from "@/services/pricing.service";

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

  return prisma.cart.findUnique({
    where: {
      id: cart.id,
    },
    include: {
      coupon: true,
      items: {
        include: {
          product: {
            include: {
              promotion: true,
              images: {
                orderBy: {
                  sortOrder: "asc",
                },
              },
              brand: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });
}

export async function addProductToCart(userId: string, productId: string) {
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
    return prisma.cartItem.update({
      where: {
        id: existingItem.id,
      },
      data: {
        quantity: existingItem.quantity + 1,
      },
    });
  }

  return prisma.cartItem.create({
    data: {
      cartId: cart.id,
      productId,
      quantity: 1,
    },
  });
}

export async function updateCartItemQuantity(
  userId: string,
  itemId: string,
  quantity: number,
) {
  const cart = await getOrCreateCart(userId);

  if (quantity <= 0) {
    return prisma.cartItem.delete({
      where: {
        id: itemId,
        cartId: cart.id,
      },
    });
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
    throw new Error("Cart is empty");
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
    throw new Error("Coupon not found");
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