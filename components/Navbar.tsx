"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navLinks = [
  { href: "/", label: "News Feed", icon: "⚡" },
  { href: "/saved", label: "Saved News", icon: "🔖" },
  { href: "/categories", label: "Categories", icon: "🏷️" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-[#0d1117] border-b border-[#21262d] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-orange-500/20">
              HN
            </div>
            <span className="font-bold text-white text-lg tracking-tight">
              Tech<span className="text-orange-400">Hub</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                    active
                      ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                      : "text-[#8b949e] hover:text-white hover:bg-[#161b22]"
                  }`}
                >
                  <span>{link.icon}</span>
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-[#8b949e] hover:text-white hover:bg-[#161b22] transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <div className="w-5 h-5 flex flex-col justify-center gap-1.5">
              <span className={`block h-0.5 bg-current transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`block h-0.5 bg-current transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
              <span className={`block h-0.5 bg-current transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-[#21262d] bg-[#0d1117] px-4 py-3 flex flex-col gap-1">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                    : "text-[#8b949e] hover:text-white hover:bg-[#161b22]"
                }`}
              >
                <span>{link.icon}</span>
                {link.label}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
