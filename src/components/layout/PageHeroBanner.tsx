import { ReactNode } from "react";

interface PageHeroBannerProps {
  image: string;
  alt: string;
  title: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
}

/**
 * Decorative hero banner for dashboard pages.
 * Displays a colorful illustration on the right with a gradient overlay,
 * keeping title/subtitle/action perfectly readable on top.
 */
export function PageHeroBanner({ image, alt, title, subtitle, icon, action }: PageHeroBannerProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-accent/5 to-background shadow-sm">
      {/* Decorative image - only shown on very wide screens, tucked to the far right corner so it never overlaps the action button */}
      <div
        className="absolute inset-y-0 right-0 w-1/4 bg-no-repeat bg-right bg-contain opacity-80 pointer-events-none hidden xl:block"
        style={{ backgroundImage: `url(${image})` }}
        aria-hidden="true"
      />
      {/* Fade overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/80 xl:to-transparent xl:via-background/80" />

      <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 sm:p-6 xl:pr-[28%]">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
            {icon}
            <span className="truncate">{title}</span>
          </h1>
          {subtitle && (
            <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>
          )}
        </div>
        {action && <div className="flex-shrink-0 relative z-10">{action}</div>}
      </div>

      {/* Hidden alt for accessibility */}
      <span className="sr-only">{alt}</span>
    </div>
  );
}
