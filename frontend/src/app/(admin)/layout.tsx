export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // In a real app, check role=admin here
  return <>{children}</>;
}
