import React from 'react';
import { Badge } from './ui/Badge';
import { CheckCircle2, AlertCircle, Clock, EyeOff } from 'lucide-react';
export type ListingStatus = 'Active' | 'Provisional' | 'Hidden' | 'Expired';
interface StatusBadgeProps {
  status: ListingStatus;
}
export function StatusBadge({ status }: StatusBadgeProps) {
  switch (status) {
    case 'Active':
      return (
        <Badge variant="success" className="flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" /> Active
        </Badge>);

    case 'Provisional':
      return (
        <Badge variant="warning" className="flex items-center gap-1">
          <Clock className="w-3 h-3" /> Provisional
        </Badge>);

    case 'Hidden':
      return (
        <Badge variant="default" className="flex items-center gap-1">
          <EyeOff className="w-3 h-3" /> Hidden
        </Badge>);

    case 'Expired':
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> Expired
        </Badge>);

    default:
      return <Badge>{status}</Badge>;
  }
}