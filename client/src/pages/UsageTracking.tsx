import DashboardLayout from "@/components/DashboardLayout";
import { UsageTrackingDashboard } from "@/components/UsageTrackingDashboard";

export default function UsageTracking() {
  return (
    <DashboardLayout>
      <div className="container py-8">
        <UsageTrackingDashboard />
      </div>
    </DashboardLayout>
  );
}
