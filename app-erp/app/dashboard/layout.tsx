import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex min-h-screen text-white"
      style={{
        background:
          "radial-gradient(circle at 90% 10%, #0F3A4D 0%, transparent 60%), #081C27",
      }}
    >
      <Sidebar />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}