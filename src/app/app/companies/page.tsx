"use client";

import { PluginGate } from "@/components/plugin-gate";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Building2 } from "lucide-react";
import { useLeadsStore } from "@/store/leads-store";
import { t } from "@/lib/i18n";
import type { Company } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { DataTable, DataTableColumnHeader } from "@/components/ui/data-table";
import { createColumnHelper } from "@tanstack/react-table";
import { type DataTableFeatures } from "@/components/ui/data-table-features";

type CompanyRow = Company & {
  leadCount: number;
  firstLeadId?: string;
};

export default function CompaniesPage() {
  const lang = useLeadsStore((s) => s.settings.language);
  const companies = useLeadsStore((s) => s.companies);
  const leads = useLeadsStore((s) => s.leads);
  const hydrated = useLeadsStore((s) => s.hydrated);
  const i18n = t(lang);
  const [q, setQ] = useState("");

  const rows: CompanyRow[] = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return companies
      .map((c) => {
        const matchingLeads = leads.filter(
          (l) => l.companyId === c.id || l.company === c.name
        );
        return {
          ...c,
          leadCount: matchingLeads.length,
          firstLeadId: matchingLeads[0]?.id,
        };
      })
      .filter(
        (c) =>
          !qq ||
          c.name.toLowerCase().includes(qq) ||
          c.industry.toLowerCase().includes(qq) ||
          c.country.toLowerCase().includes(qq)
      );
  }, [companies, leads, q]);

  const columns = useMemo(() => {
    const columnHelper = createColumnHelper<DataTableFeatures, CompanyRow>();
    return [
      columnHelper.accessor("name", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={i18n.app.company} />
        ),
        cell: ({ row }) => {
          const c = row.original;
          return (
            <div>
              {c.firstLeadId ? (
                <Link
                  href={`/app/leads/${c.firstLeadId}`}
                  className="font-medium hover:underline"
                >
                  {c.name}
                </Link>
              ) : (
                <span className="font-medium">{c.name}</span>
              )}
              {c.domain && (
                <div className="text-xs text-muted-foreground">{c.domain}</div>
              )}
            </div>
          );
        },
        enableSorting: true,
      }),
      columnHelper.accessor("industry", {
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={i18n.companiesPage.industry}
          />
        ),
        cell: ({ getValue }) => (
          <Badge variant="secondary">{getValue()}</Badge>
        ),
        enableSorting: true,
      }),
      columnHelper.accessor("country", {
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={i18n.companiesPage.country}
          />
        ),
        cell: ({ getValue }) => getValue(),
        enableSorting: true,
      }),
      columnHelper.accessor("size", {
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={i18n.companiesPage.size}
          />
        ),
        cell: ({ getValue }) => getValue().toLocaleString(),
        enableSorting: true,
      }),
      columnHelper.accessor("leadCount", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={i18n.nav.leads} />
        ),
        cell: ({ row }) =>
          `${row.original.leadCount} ${i18n.companiesPage.leads}`,
        enableSorting: true,
      }),
    ];
  }, [i18n]);

  if (!hydrated) {
    return <div className="h-72 animate-pulse rounded-xl bg-muted/50" />;
  }

  return (
    <PluginGate id="companies">
      <div className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {i18n.companiesPage.title}
            </h1>
            <p className="text-sm text-muted-foreground">
              {i18n.companiesPage.subtitle}
            </p>
          </div>
          <Input
            className="max-w-xs"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={i18n.app.search}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {rows.length} {i18n.nav.companies.toLowerCase()}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable
              columns={columns}
              data={rows}
              pageSize={10}
              initialSorting={[{ id: "leadCount", desc: true }]}
              previousLabel={i18n.table.previous}
              nextLabel={i18n.table.next}
              showingLabel={i18n.table.showing}
              ofLabel={i18n.table.of}
              pageLabel={i18n.table.page}
              itemsZeroLabel={i18n.table.itemsZero}
              emptyState={
                <Empty className="border-none py-12">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <Building2 className="size-5" />
                    </EmptyMedia>
                    <EmptyTitle>{i18n.companiesPage.empty}</EmptyTitle>
                    {q && (
                      <EmptyDescription>
                        {i18n.companiesPage.emptySearch}
                      </EmptyDescription>
                    )}
                  </EmptyHeader>
                </Empty>
              }
            />
          </CardContent>
        </Card>
      </div>
    </PluginGate>
  );
}
