"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Users,
  PhoneCall,
  CalendarClock,
  ShieldCheck,
  ArrowLeft,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/properties", label: "Properties", icon: Building2 },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/callbacks", label: "Callbacks", icon: PhoneCall },
  { href: "/admin/visits", label: "Visits", icon: CalendarClock },
  { href: "/admin/approvals", label: "Approvals", icon: ShieldCheck },
];

interface AdminSidebarProps {
  userName: string | null;
}

export function AdminSidebar({ userName }: AdminSidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-4 left-4 z-[60] flex h-10 w-10 items-center justify-center rounded-xl bg-[#0f1629] border border-white/10 text-white shadow-lg lg:hidden"
        aria-label="Toggle admin menu"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-[49] bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-[50] flex w-[272px] flex-col bg-[#0a0e1a] border-r border-white/[0.06] transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Branding */}
        <div className="flex items-center gap-3 px-6 pt-6 pb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 shadow-lg shadow-sky-500/20">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-[15px] font-bold text-white tracking-tight">Staymitra</p>
            <p className="text-[11px] font-semibold text-sky-400/80 uppercase tracking-widest">Admin Console</p>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-5 my-4 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                  active
                    ? "bg-sky-500/15 text-sky-400 shadow-sm shadow-sky-500/5"
                    : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
                }`}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                    active
                      ? "bg-sky-500/20 text-sky-400"
                      : "bg-white/[0.04] text-slate-500 group-hover:text-slate-300"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <span className="flex-1">{item.label}</span>
                {active && (
                  <ChevronRight className="h-3.5 w-3.5 text-sky-400/60" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-white/[0.06] px-4 py-4 space-y-3">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-300 hover:bg-white/[0.04] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Site
          </Link>
          {userName && (
            <div className="px-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Logged in as</p>
              <p className="text-xs font-semibold text-slate-400 truncate mt-0.5">{userName}</p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
