"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
  isLoggedIn: boolean;
};

export function NavLinks({ isLoggedIn }: Props) {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Home" },
    { href: "/search", label: "Explore" },
    { href: "/blog", label: "Blog" },
    ...(isLoggedIn ? [{ href: "/profile", label: "Profile" }] : []),
  ];

  return (
    <div className="flex items-center gap-1.5">
      {links.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`relative rounded-full px-4 py-1.5 text-[15px] font-medium transition-all duration-300 ${
              isActive
                ? "bg-primary/8 text-primary shadow-sm ring-1 ring-primary/10"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </div>
  );
}
