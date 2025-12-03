"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

interface UnauthorizedScreenProps {
  title?: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}

const UnauthorizedScreen: React.FC<UnauthorizedScreenProps> = ({
  title = "Unauthorized",
  description = "You do not have permission to access this area.",
  actionHref = "/",
  actionLabel = "Go to homepage",
  secondaryHref,
  secondaryLabel,
}) => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 text-center px-4">
      <div className="space-y-2">
        <p className="text-sm font-semibold tracking-wider text-red-600 uppercase">
          Access restricted
        </p>
        <h1 className="text-3xl font-semibold text-gray-900">{title}</h1>
        <p className="text-gray-600 max-w-xl mx-auto">{description}</p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button asChild>
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
        {secondaryHref && secondaryLabel ? (
          <Button asChild variant="outline">
            <Link href={secondaryHref}>{secondaryLabel}</Link>
          </Button>
        ) : null}
      </div>
    </div>
  );
};

export default UnauthorizedScreen;

