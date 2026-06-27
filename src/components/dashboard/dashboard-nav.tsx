"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import * as Icons from "lucide-react";

type Props = {
  links: { href: string; label: string; icon: string }[];
};

export function DashboardNav({ links }: Props) {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1.5 overflow-x-auto scrollbar-hide md:flex-col">
      {links.map((link) => {
        const Icon = Icons[link.icon as keyof typeof Icons] as React.ElementType;
        const isActive = pathname === link.href;

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all whitespace-nowrap",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            {Icon && <Icon className="h-4 w-4" />}
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
