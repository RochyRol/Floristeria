import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) redirect("/login");
  if (!["ADMIN", "SELLER", "FLORIST", "DELIVERY"].includes(session.user.role)) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-[#F8F6F2] flex">
      <AdminSidebar role={session.user.role} />
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        <AdminHeader session={session} />
        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
