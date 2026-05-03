import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  tagline: z.string().optional(),
  description: z.string().min(10),
  basePrice: z.number().min(0),
  categoryId: z.string().nullable().optional(),
  stock: z.number().min(0),
  active: z.boolean(),
  featured: z.boolean(),
  images: z.array(z.string()),
  tags: z.array(z.string()),
  occasionIds: z.array(z.string()),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || !["ADMIN", "SELLER"].includes(session.user.role)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = createSchema.parse(body);

    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        tagline: data.tagline,
        description: data.description,
        basePrice: data.basePrice,
        categoryId: data.categoryId || null,
        stock: data.stock,
        active: data.active,
        featured: data.featured,
        images: data.images,
        tags: data.tags,
        occasions: {
          create: data.occasionIds.map((id) => ({ occasionId: id })),
        },
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error al crear producto" }, { status: 500 });
  }
}
