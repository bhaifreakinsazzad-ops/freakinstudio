import React from 'react';

interface FeatureCardProps {
  code: string;
  title: string;
  desc: string;
  highlight: string;
  count?: number;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({code, title, desc, highlight, count}) => {
  return (
    <div className="group relative rounded-xl border border-brand-border bg-brand-surface/40 p-6 transition-colors duration-300 hover:border-brand-highlight/40 hover:bg-brand-surface/70">
      <div className="flex items-center justify-between mb-3">
        <span className="badge-mono text-brand-highlight">{code}</span>
        {count !== undefined && (
          <span className="font-mono text-xs text-brand-muted">{count} services</span>
        )}
      </div>
      <h3 className="text-lg font-bold text-brand-light mb-2 group-hover:text-brand-highlight transition-colors">
        {title}
      </h3>
      <p className="text-sm text-brand-muted leading-relaxed mb-3">
        {desc}
      </p>
      <p className="text-xs font-mono text-brand-highlight">
        {highlight}
      </p>
    </div>
  );
};
