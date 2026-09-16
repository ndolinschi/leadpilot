"use client";

import { PluginGate } from "@/components/plugin-gate";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Upload, Download } from "lucide-react";
import { useLeadsStore } from "@/store/leads-store";
import { t } from "@/lib/i18n";
import { SAMPLE_CSV, parseLeadsCsv } from "@/lib/csv";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {i18n.importPage.title}
        </h1>
        <p className="text-sm text-muted-foreground">
          {i18n.importPage.subtitle}
        </p>
      </div>

      <Card className="border-border/60 bg-card/70 border-dashed">
        <CardContent className="flex flex-col items-center gap-4 py-12">
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
            <Button render={<label htmlFor="csv" />}>
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
        </CardContent>
      </Card>

      {preview.length > 0 && (
        <Card className="border-border/60 bg-card/70">
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
                    <TableCell className="tabular-nums">
                      {r.score?.toFixed(1)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  </PluginGate>
  );
}
