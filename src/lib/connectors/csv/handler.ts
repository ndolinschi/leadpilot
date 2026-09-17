import { parseLeadsCsv } from "@/lib/csv";
import { applyScore } from "@/lib/score";
import type { CompanySettings, Lead } from "@/lib/types";

export interface CsvImportResult {
  ok: boolean;
  count: number;
  leads: Lead[];
  errors: string[];
}

export function handleCsvImport(
  csvContent: string,
  settings: CompanySettings
): CsvImportResult {
  const { leads, errors } = parseLeadsCsv(csvContent, settings);
  const scoredLeads = leads.map((l) => applyScore(l));

  return {
    ok: errors.length === 0 || scoredLeads.length > 0,
    count: scoredLeads.length,
    leads: scoredLeads,
    errors,
  };
}
