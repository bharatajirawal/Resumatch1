import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function RecruiterVerificationBadge({ trustInfo }: { trustInfo: any }) {
  if (!trustInfo) return null;

  const isVerified = trustInfo.is_verified || trustInfo.score >= 80;

  if (!isVerified) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1 cursor-help">
            <ShieldCheck className="w-4 h-4 text-green-500 fill-green-500/10" />
            <span className="text-xs font-bold text-green-500/90 tracking-tight">Verified Recruiter</span>
          </div>
        </TooltipTrigger>
        <TooltipContent className="bg-zinc-900 border-zinc-800 p-3 max-w-xs">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-green-500" />
              <p className="font-bold text-sm text-white">Trust Rating: {trustInfo.score}%</p>
            </div>
            <p className="text-xs text-zinc-400">
              This recruiter has been verified through company email, LinkedIn, and website checks. Safe to apply.
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
