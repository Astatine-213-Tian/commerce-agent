"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Bot, Package } from "lucide-react";

export function Header() {
  const pathname = usePathname();

  const links = [
    {
      href: "/",
      label: "Agent",
      icon: Bot,
    },
    {
      href: "/product",
      label: "Products",
      icon: Package,
    },
  ];

  return (
    <header className="w-full border-b bg-background">
      <div className="container flex h-14 max-w-screen-2xl items-center px-6">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Bot className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">
              Commerce Assistant
            </span>
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-2 transition-colors hover:text-foreground/80",
                    isActive ? "text-foreground" : "text-foreground/60"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
