import AdminShell from "@/components/admin/AdminShell";

export const metadata = {
  title: "Staff ERP & Management | M S Fitness",
  description: "Secure gym management, fee versioning, expiry tracking, and receipts.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminShell>{children}</AdminShell>;
}
