"use client";

import { toast } from "sonner";
import { useLeadsStore } from "@/store/leads-store";
import { t } from "@/lib/i18n";
import type { Lang } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SettingsPage() {
  const lang = useLeadsStore((s) => s.settings.language);
  const settings = useLeadsStore((s) => s.settings);
  const updateSettings = useLeadsStore((s) => s.updateSettings);
  const resetDemo = useLeadsStore((s) => s.resetDemo);
  const rescoreAll = useLeadsStore((s) => s.rescoreAll);
  const i18n = t(lang);
  const S = i18n.settingsPage;

  function save() {
    rescoreAll();
    toast.success(S.saved);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{S.title}</h1>
      </div>

      <Card className="border-border/60 bg-card/70">
        <CardHeader>
          <CardTitle className="text-base">{S.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company">{S.company}</Label>
            <Input
              id="company"
              value={settings.companyName}
              onChange={(e) => updateSettings({ companyName: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="voice">{S.voice}</Label>
            <Textarea
              id="voice"
              rows={3}
              value={settings.voice}
              onChange={(e) => updateSettings({ voice: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pitch">{S.pitch}</Label>
            <Textarea
              id="pitch"
              rows={3}
              value={settings.productPitch}
              onChange={(e) => updateSettings({ productPitch: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>{S.language}</Label>
            <Select
              value={settings.language}
              onValueChange={(v) =>
                updateSettings({ language: (v as Lang) || "en" })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue>
                  {settings.language === "ru" ? "Русский" : "English"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ru">Русский</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-sm text-muted-foreground">
            {S.apiNote}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={save}>{S.save}</Button>
            <Button
              variant="outline"
              onClick={() => {
                resetDemo();
                toast.message(S.resetDone);
              }}
            >
              {S.reset}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
