import SLAViolationsDashboard from "@/components/user-dashboard/sla-violations/SLAViolationsDashboard";

export default function SLAViolationsPage() {
  return (
    <div className="flex-1 p-4 md:p-6 bg-gray-50 min-h-screen">
      <SLAViolationsDashboard />
    </div>
  );
}
