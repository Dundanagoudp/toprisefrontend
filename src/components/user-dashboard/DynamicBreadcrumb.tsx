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
export function DynamicBreadcrumb({ customLabels = {}, showDashboard = true }: { customLabels?: Record<string, string>; showDashboard?: boolean }) {
  const pathname = usePathname();
  const segments = pathname.replace(/^\/+/, '').split('/');
  // Show breadcrumb for /user/dashboard and its subpages
  if (segments[0] !== 'user' || segments[1] !== 'dashboard') return null;
  const subItems = segments.slice(2).map((seg, idx) => {
     const label = customLabels[seg]
      || (/^[0-9a-f]{24}$/i.test(seg) ? "Loading..." : toTitle(seg));
    const href = '/user/dashboard/' + segments.slice(2, 2 + idx + 1).join('/');
    return { label, href, segment: seg };
  }).filter(item => {
    // Skip segments with empty custom labels (explicitly set to empty string)
    if (customLabels[item.segment] === '') {
      return false;
    }
    // Skip empty or loading labels
    if (!item.label || item.label.trim() === '' || item.label === 'Loading...') {
      return false;
    }
    return true;
  }); // Keep segment property for determining clickable links
  
  const items = showDashboard 
    ? [{ label: 'Dashboard', href: '/user/dashboard' }, ...subItems]
    : subItems;
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, idx) => {
          // Check if this item should be clickable
          // Don't make it clickable if the next item exists and looks like an ID
          const nextItem = items[idx + 1];
          const shouldBeClickable = idx !== items.length - 1 && (!nextItem || !/^[0-9a-f]{24}$/i.test(nextItem.segment || ''));

          return (
            <React.Fragment key={item.href}>
              <BreadcrumbItem>
                {idx === items.length - 1 || !shouldBeClickable ? (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={item.href}>{item.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {idx < items.length - 1 && <BreadcrumbSeparator className="hidden md:block" />}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
} 