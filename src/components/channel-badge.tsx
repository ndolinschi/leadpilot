"use client";

import { Badge } from "@/components/ui/badge";
import type { Channel } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Mail, Phone, Link2, MessageCircle } from "lucide-react";

const META: Record<Channel, { icon: typeof Mail; className: string; label: string }> = {
  email: { icon: Mail, className: "bg-sky-50 text-sky-700 border-sky-200", label: "Email" },
  call: { icon: Phone, className: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "Call" },
  linkedin: { icon: Link2, className: "bg-blue-50 text-blue-700 border-blue-200", label: "LinkedIn" },
  messenger: { icon: MessageCircle, className: "bg-zinc-50 text-zinc-700 border-zinc-200", label: "Messenger" },
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
