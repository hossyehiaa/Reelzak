import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { DashboardShell } from "@/components/site/dashboard-shell";
import { BriefingForm } from "@/components/site/briefing-form/briefing-form";
import { NewOrderHeader } from "@/components/site/new-order-header";

export default async function NewOrderPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "CLIENT") redirect("/admin");

  return (
    <DashboardShell areaLabel="Client Portal" backHref="/dashboard">
      <NewOrderHeader />
      <BriefingForm />
    </DashboardShell>
  );
}
