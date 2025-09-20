"use client";
import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
function toTitle(str: string) {
  return str.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}
export function DynamicBreadcrumb({ customLabels = {} }: { customLabels?: Record<string, string> }) {
  const pathname = usePathname();
  const segments = pathname.replace(/^\/+/, '').split('/');
  // Show breadcrumb for /user/dashboard and its subpages
  if (segments[0] !== 'dealer' || segments[1] !== 'dashboard') return null;
  const items = [
    { label: 'Dashboard', href: '/dealer/dashboard' },
    ...segments.slice(2).map((seg, idx) => {
       const label = customLabels[seg]
        || (/^[0-9a-f]{24}$/i.test(seg) ? "Loading..." : toTitle(seg));
      const href = '/dealer/dashboard' + segments.slice(2, 2 + idx + 1).join('/');
      return { label, href };
    })
  ];
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink asChild>
            <Link href="/dealer/dashboard">Dashboard</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {items.length > 1 && <BreadcrumbSeparator className="hidden md:block" />}
        {items.slice(1).map((item, idx) => (
          <React.Fragment key={item.href}>
            <BreadcrumbItem>
              {idx === items.length - 2 ? (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={item.href}>{item.label}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {idx < items.length - 2 && <BreadcrumbSeparator className="hidden md:block" />}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
} 