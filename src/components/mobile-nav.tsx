"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Menu, X, Home, Search, User, LayoutDashboard, LogIn, UserPlus, LogOut, BookOpen } from "lucide-react";

type MobileNavProps = {
  isLoggedIn: boolean;
  isOwner: boolean;
};

export function MobileNav({ isLoggedIn, isOwner }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close on escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    <div className="md:hidden">
      {/* Hamburger Button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-10 w-10 items-center justify-center rounded-xl text-foreground transition-colors hover:bg-accent"
        aria-label="Open navigation menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Overlay & Drawer in Portal */}
      {mounted && createPortal(
        <>
          {/* Overlay */}
          {open && (
            <div
              className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm animate-fade-in"
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />
          )}

          {/* Drawer */}
          <div
            className={`fixed right-0 top-0 z-[100] flex h-full w-[280px] max-w-[85vw] flex-col bg-background border-l border-border shadow-2xl transition-transform duration-300 ease-out ${
              open ? "translate-x-0" : "translate-x-full"
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <span className="font-display text-lg font-bold tracking-tight">Menu</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                aria-label="Close navigation menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Links */}
            <nav className="flex-1 overflow-y-auto px-3 py-4">
              <div className="flex flex-col gap-1">
                <NavLink href="/" icon={<Home className="h-5 w-5" />} onClick={() => setOpen(false)}>
                  Home
                </NavLink>
                <NavLink href="/search" icon={<Search className="h-5 w-5" />} onClick={() => setOpen(false)}>
                  Explore
                </NavLink>
                <NavLink href="/blog" icon={<BookOpen className="h-5 w-5" />} onClick={() => setOpen(false)}>
                  Blog
                </NavLink>

                {isLoggedIn ? (
                  <>
                    <NavLink href="/profile" icon={<User className="h-5 w-5" />} onClick={() => setOpen(false)}>
                      Profile
                    </NavLink>
                    <NavLink
                      href="/dashboard"
                      icon={<LayoutDashboard className="h-5 w-5" />}
                      onClick={() => setOpen(false)}
                    >
                      {isOwner ? "Dashboard" : "My Requests"}
                    </NavLink>

                    <div className="my-3 border-t border-border" />

                    <form action="/auth/signout" method="post">
                      <button
                        type="submit"
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-[15px] font-medium text-destructive transition-colors hover:bg-destructive/10"
                      >
                        <LogOut className="h-5 w-5" />
                        Sign out
                      </button>
                    </form>
                  </>
                ) : (
                  <>
                    <div className="my-3 border-t border-border" />
                    <NavLink href="/auth/login" icon={<LogIn className="h-5 w-5" />} onClick={() => setOpen(false)}>
                      Log in
                    </NavLink>
                    <Link
                      href="/auth/signup"
                      onClick={() => setOpen(false)}
                      className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-[15px] font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                    >
                      <UserPlus className="h-5 w-5" />
                      Sign up
                    </Link>
                  </>
                )}
              </div>
            </nav>

            {/* Footer */}
            <div className="border-t border-border px-5 py-4">
              <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Staymitra</p>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}

function NavLink({
  href,
  icon,
  children,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 rounded-xl px-4 py-3 text-[15px] font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-foreground active:bg-accent/80"
    >
      {icon}
      {children}
    </Link>
  );
}
