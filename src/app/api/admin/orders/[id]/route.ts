import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || !["ADMIN", "SELLER", "FLORIST", "DELIVERY"].includes(session.user.role)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const { status, note, assignedFloristId, assignedDeliveryId, internalNote } = await req.json();

  try {
    const updates: Record<string, unknown> = {};
    if (status) updates.status = status;
    if (assignedFloristId !== undefined) updates.assignedFloristId = assignedFloristId;
    if (assignedDeliveryId !== undefined) updates.assignedDeliveryId = assignedDeliveryId;
    if (internalNote !== undefined) updates.internalNote = internalNote;

    const order = await prisma.order.update({
      where: { id },
      data: {
        ...updates,
        ...(status && {
          statusHistory: {
            create: {
              status,
              note: note || null,
              changedBy: session.user.id,
            },
          },
        }),
      },
      include: {
        items: true,
        statusHistory: { orderBy: { timestamp: "asc" } },
        customer: { select: { name: true, email: true } },
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  }
}
