import React from 'react';
import Link from 'next/link';

interface FeatureCardProps {
  code: string;
  title: string;
  desc: string;
  highlight: string;
  count?: number;
  href?: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  code,
  title,
  desc,
  highlight,
  count,
  href,
}) => {
  const cardBody = (
    <div className="group relative h-full rounded-xl border border-brand-border bg-brand-surface/40 p-6 transition-colors duration-200 hover:border-brand-highlight/50 hover:bg-brand-surface/70 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3 text-xs font-mono">
          <span className="text-brand-highlight font-bold uppercase tracking-wider">
            Category {code}
          </span>
          {count !== undefined && (
            <span className="text-brand-muted tabular-nums">{count} services</span>
          )}
        </div>
        <h3 className="text-lg font-bold text-brand-light mb-2 group-hover:text-brand-highlight transition-colors">
          {title}
        </h3>
        <p className="text-sm text-brand-muted leading-relaxed mb-4">
          {desc}
        </p>
      </div>
      <p className="text-xs font-mono text-brand-highlight pt-3 border-t border-brand-border/60">
        {highlight}
      </p>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-highlight rounded-xl">
        {cardBody}
      </Link>
    );
  }

  return cardBody;
};
