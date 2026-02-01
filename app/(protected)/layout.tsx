export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Auth check handled by middleware in lib/supabase/proxy.ts
  return <>{children}</>;
}
