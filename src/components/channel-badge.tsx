"use client";

import { Badge } from "@/components/ui/badge";
import type { Channel } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Mail, Phone, Link2, MessageCircle } from "lucide-react";

const META: Record<Channel, { icon: typeof Mail; className: string; label: string }> = {
  email: { icon: Mail, className: "bg-sky-500/15 text-sky-300 border-sky-500/30", label: "Email" },
  call: { icon: Phone, className: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30", label: "Call" },
  linkedin: { icon: Link2, className: "bg-blue-500/15 text-blue-300 border-blue-500/30", label: "LinkedIn" },
  messenger: { icon: MessageCircle, className: "bg-violet-500/15 text-violet-300 border-violet-500/30", label: "Messenger" },
};

export function ChannelBadge({ channel, label }: { channel: Channel; label?: string }) {
  const m = META[channel];
  const Icon = m.icon;
  return (
    <Badge variant="outline" className={cn("gap-1 font-medium capitalize", m.className)}>
      <Icon className="size-3" />
      {label || m.label}
    </Badge>
  );
}
