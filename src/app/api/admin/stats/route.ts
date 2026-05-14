import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user || !["ADMIN", "SELLER", "FLORIST", "DELIVERY"].includes(session.user.role)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const period = searchParams.get("period") ?? "month";

  const now = new Date();
  let from: Date;

  switch (period) {
    case "day":
      from = new Date(now);
      from.setHours(0, 0, 0, 0);
      break;
    case "week":
      from = new Date(now);
      from.setDate(from.getDate() - 6);
      from.setHours(0, 0, 0, 0);
      break;
    case "year":
      from = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      from = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  const result = await prisma.order.aggregate({
    where: { createdAt: { gte: from }, status: { not: "CANCELLED" } },
    _sum: { total: true },
  });

  return NextResponse.json({ revenue: Number(result._sum.total ?? 0), period });
}
