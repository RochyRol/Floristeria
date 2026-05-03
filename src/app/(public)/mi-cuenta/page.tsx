import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AccountClient } from "@/components/account/account-client";

export const metadata: Metadata = {
  title: "Mi cuenta",
};

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: {
      items: true,
      statusHistory: { orderBy: { timestamp: "asc" } },
    },
  });

  return <AccountClient session={session} orders={JSON.parse(JSON.stringify(orders))} />;
}
