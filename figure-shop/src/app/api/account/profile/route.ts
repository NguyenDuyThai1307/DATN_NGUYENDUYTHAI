import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateProfileSchema } from "@/validations/auth.schema";

export async function PATCH(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 },
    );
  }

  const body = await request.json();
  const parsed = updateProfileSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "Invalid profile data",
        errors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: user.id,
    },
    data: parsed.data,
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
    },
  });

  return NextResponse.json({
    message: "Profile updated successfully",
    user: updatedUser,
  });
}
