import React from 'react';
import { Leaf } from 'lucide-react';
interface EcoScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}
export function EcoScoreBadge({
  score,
  size = 'md',
  showLabel = false
}: EcoScoreBadgeProps) {
  // Determine color based on score
  let colorClass = 'bg-slate-100 text-slate-700 border-slate-200';
  let iconColor = 'text-slate-500';
  if (score >= 80) {
    colorClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    iconColor = 'text-emerald-500';
  } else if (score >= 50) {
    colorClass = 'bg-amber-50 text-amber-700 border-amber-200';
    iconColor = 'text-amber-500';
  } else if (score > 0) {
    colorClass = 'bg-red-50 text-red-700 border-red-200';
    iconColor = 'text-red-500';
  }
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base font-semibold'
  };
  const iconSizes = {
    sm: 'w-3 h-3 mr-1',
    md: 'w-4 h-4 mr-1.5',
    lg: 'w-5 h-5 mr-2'
  };
  if (score === 0) {
    return (
      <div
        className={`inline-flex items-center border rounded-full ${colorClass} ${sizes[size]}`}>
        
        <span className="font-medium">Pending Eco Rating</span>
      </div>);

  }
  return (
    <div
      className={`inline-flex items-center border rounded-full ${colorClass} ${sizes[size]}`}>
      
      <Leaf className={`${iconSizes[size]} ${iconColor}`} />
      <span className="font-bold">{score}</span>
      {showLabel && <span className="ml-1 opacity-80 font-medium">/100</span>}
    </div>);

}