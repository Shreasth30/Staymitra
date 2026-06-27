"use client";

import { usePathname } from "next/navigation";

export function HeaderWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboardOrAdmin =
    pathname?.startsWith("/admin") || pathname?.startsWith("/dashboard");

  if (isDashboardOrAdmin) {
    return null;
  }

  return <>{children}</>;
}

export function FooterWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboardOrAdmin =
    pathname?.startsWith("/admin") || pathname?.startsWith("/dashboard");

  if (isDashboardOrAdmin) {
    return null;
  }

  return <>{children}</>;
}
