import React from 'react';
import { Button } from './button';
import { Link } from 'react-router';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
}

export function EmptyState({ icon, title, description, actionText, actionHref }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/50">
      {icon && <div className="mb-4 text-gray-400 [&>svg]:w-12 [&>svg]:h-12">{icon}</div>}
      <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-6 max-w-sm">{description}</p>
      {actionText && actionHref && (
        <Link to={actionHref}>
          <Button className="bg-indigo-600 hover:bg-indigo-700">{actionText}</Button>
        </Link>
      )}
    </div>
  );
}
