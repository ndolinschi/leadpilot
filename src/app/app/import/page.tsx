"use client";

import { PluginGate } from "@/components/plugin-gate";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import {
  Upload,
  Download,
  FileSpreadsheet,
  Share2,
  Bot,
  Send,
  ArrowRight,
} from "lucide-react";
import { useLeadsStore } from "@/store/leads-store";
import { t } from "@/lib/i18n";
import { SAMPLE_CSV, parseLeadsCsv } from "@/lib/csv";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function ImportPage() {
  const lang = useLeadsStore((s) => s.settings.language);
  const settings = useLeadsStore((s) => s.settings);
  const importCsv = useLeadsStore((s) => s.importCsv);
  const i18n = t(lang);
  const router = useRouter();
  const [preview, setPreview] = useState<
    { name: string; company: string; email: string; score?: number }[]
  >([]);
  const [raw, setRaw] = useState("");

  function onFile(file: File | null) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || "");
      setRaw(text);
      const { leads, errors } = parseLeadsCsv(text, settings);
      if (errors.length) toast.message(errors[0]);
      setPreview(
        leads.slice(0, 8).map((l) => ({
          name: l.name,
          company: l.company,
          email: l.email,
          score: l.score,
        }))
      );
      toast.success(`Parsed ${leads.length} rows`);
    };
    reader.readAsText(file);
  }

  function onImport() {
    if (!raw) {
      toast.error("Choose a CSV first");
      return;
    }
    const { count, errors } = importCsv(raw);
    if (errors.length) toast.message(errors.join("; "));
    toast.success(`Imported ${count} leads`);
    router.push("/app");
  }

  function downloadSample() {
    const blob = new Blob([SAMPLE_CSV], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "leadpilot-sample.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <PluginGate id="import">
      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {i18n.importPage.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {i18n.importPage.subtitle}
          </p>
        </div>

        {/* CSV Ingestion Card */}
        <Card className="border-border/60 bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="size-5 text-[#266df0]" />
                <CardTitle className="text-base">{i18n.importPage.csvActive}</CardTitle>
              </div>
              <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">
                Active
              </Badge>
            </div>
            <CardDescription>{i18n.importPage.csvDesc}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 p-8 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-[#266df0]/10 text-[#266df0]">
                <Upload className="size-5" />
              </div>
              <input
                id="csv"
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => onFile(e.target.files?.[0] ?? null)}
              />
              <div className="flex flex-wrap justify-center gap-2">
                <Button render={<label htmlFor="csv" className="cursor-pointer" />}>
                  {i18n.importPage.choose}
                </Button>
                <Button variant="outline" onClick={downloadSample}>
                  <Download className="size-3.5" />
                  {i18n.importPage.sample}
                </Button>
              </div>
              <p className="max-w-lg text-center text-xs text-muted-foreground">
                {i18n.importPage.hint}
              </p>
            </div>
          </CardContent>
        </Card>

        {preview.length > 0 && (
          <Card className="border-border/60 bg-white">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">{i18n.importPage.preview}</CardTitle>
              <Button onClick={onImport}>{i18n.importPage.import}</Button>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {preview.map((r, i) => (
                    <TableRow key={i}>
                      <TableCell>{r.name}</TableCell>
                      <TableCell>{r.company}</TableCell>
                      <TableCell>{r.email}</TableCell>
                      <TableCell className="tabular-nums font-medium text-blue-600">
                        {r.score?.toFixed(1)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Channel Connectors Grid */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-zinc-900">
                {i18n.importPage.connectorsTitle}
              </h2>
              <p className="text-xs text-muted-foreground">
                {i18n.importPage.connectorsSubtitle}
              </p>
            </div>
            <Button variant="outline" size="sm" render={<Link href="/app/marketplace" />}>
              {i18n.importPage.openMarketplace}
              <ArrowRight className="ml-1.5 size-3.5" />
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Card className="border-border/60 bg-white hover:border-[#266df0]/40 transition-colors">
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                  <Share2 className="size-4 text-blue-600" />
                  <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] hover:bg-blue-50">
                    Marketplace
                  </Badge>
                </div>
                <CardTitle className="text-sm pt-1">{i18n.importPage.fbComing}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-1 text-xs text-muted-foreground flex flex-col justify-between h-24">
                <span>{i18n.importPage.fbDesc}</span>
                <Link
                  href="/app/marketplace"
                  className="text-xs font-medium text-[#266df0] hover:underline flex items-center gap-1 mt-2"
                >
                  Configure in Marketplace <ArrowRight className="size-3" />
                </Link>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-white hover:border-[#266df0]/40 transition-colors">
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                  <Bot className="size-4 text-purple-600" />
                  <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-[10px] hover:bg-purple-50">
                    Live Webhook
                  </Badge>
                </div>
                <CardTitle className="text-sm pt-1">{i18n.importPage.viberComing}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-1 text-xs text-muted-foreground flex flex-col justify-between h-24">
                <span>{i18n.importPage.viberDesc}</span>
                <Link
                  href="/app/marketplace"
                  className="text-xs font-medium text-[#266df0] hover:underline flex items-center gap-1 mt-2"
                >
                  Test Webhook <ArrowRight className="size-3" />
                </Link>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-white hover:border-[#266df0]/40 transition-colors">
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                  <Send className="size-4 text-sky-600" />
                  <Badge className="bg-sky-50 text-sky-700 border-sky-200 text-[10px] hover:bg-sky-50">
                    Live Webhook
                  </Badge>
                </div>
                <CardTitle className="text-sm pt-1">{i18n.importPage.telegramComing}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-1 text-xs text-muted-foreground flex flex-col justify-between h-24">
                <span>{i18n.importPage.telegramDesc}</span>
                <Link
                  href="/app/marketplace"
                  className="text-xs font-medium text-[#266df0] hover:underline flex items-center gap-1 mt-2"
                >
                  Test Webhook <ArrowRight className="size-3" />
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PluginGate>
  );
}
