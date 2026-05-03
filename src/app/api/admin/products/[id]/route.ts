import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  slug: z.string().min(2).optional(),
  tagline: z.string().optional(),
  description: z.string().min(10).optional(),
  basePrice: z.number().min(0).optional(),
  categoryId: z.string().nullable().optional(),
  stock: z.number().min(0).optional(),
  active: z.boolean().optional(),
  featured: z.boolean().optional(),
  images: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  occasionIds: z.array(z.string()).optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || !["ADMIN", "SELLER"].includes(session.user.role)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const data = updateSchema.parse(body);

    const { occasionIds, ...rest } = data;

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...rest,
        ...(occasionIds !== undefined && {
          occasions: {
            deleteMany: {},
            create: occasionIds.map((oid) => ({ occasionId: oid })),
          },
        }),
      },
    });

    return NextResponse.json(product);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { id } = await params;
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error al eliminar" }, { status: 500 });
  }
}
