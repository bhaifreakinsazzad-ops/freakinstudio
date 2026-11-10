import React from 'react';

interface WorkflowStepCardProps {
  step: string;
  title: string;
  desc: string;
}

export const WorkflowStepCard: React.FC<WorkflowStepCardProps> = ({step, title, desc}) => {
  return (
    <div className="flex flex-col p-6 bg-brand-surface/30 rounded-lg border border-brand-border hover:border-brand-highlight/40 transition-colors">
      <div className="text-2xl font-mono font-bold text-brand-highlight mb-2">{step}</div>
      <h3 className="text-lg font-semibold text-brand-light mb-1">{title}</h3>
      <p className="text-sm text-brand-muted leading-relaxed">{desc}</p>
    </div>
  );
};
