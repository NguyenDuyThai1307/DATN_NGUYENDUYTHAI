import { prisma } from "@/lib/prisma";

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