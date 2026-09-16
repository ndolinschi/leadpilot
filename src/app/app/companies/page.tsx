"use client";

import { PluginGate } from "@/components/plugin-gate";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useLeadsStore } from "@/store/leads-store";
import { t } from "@/lib/i18n";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function CompaniesPage() {
  const lang = useLeadsStore((s) => s.settings.language);
  const companies = useLeadsStore((s) => s.companies);
  const leads = useLeadsStore((s) => s.leads);
  const hydrated = useLeadsStore((s) => s.hydrated);
  const i18n = t(lang);
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return companies
      .map((c) => ({
        ...c,
        leadCount: leads.filter((l) => l.companyId === c.id || l.company === c.name)
          .length,
      }))
      .filter(
        (c) =>
          !qq ||
          c.name.toLowerCase().includes(qq) ||
          c.industry.toLowerCase().includes(qq) ||
          c.country.toLowerCase().includes(qq)
      )
      .sort((a, b) => b.leadCount - a.leadCount || a.name.localeCompare(b.name));
  }, [companies, leads, q]);

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
          {rows.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">
              {i18n.companiesPage.empty}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{i18n.app.company}</TableHead>
                  <TableHead>{i18n.companiesPage.industry}</TableHead>
                  <TableHead>{i18n.companiesPage.country}</TableHead>
                  <TableHead>{i18n.companiesPage.size}</TableHead>
                  <TableHead>{i18n.nav.leads}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((c) => {
                  const firstLead = leads.find(
                    (l) => l.companyId === c.id || l.company === c.name
                  );
                  return (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">
                        {firstLead ? (
                          <Link
                            href={`/app/leads/${firstLead.id}`}
                            className="hover:underline"
                          >
                            {c.name}
                          </Link>
                        ) : (
                          c.name
                        )}
                        {c.domain && (
                          <div className="text-xs text-muted-foreground">
                            {c.domain}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{c.industry}</Badge>
                      </TableCell>
                      <TableCell>{c.country}</TableCell>
                      <TableCell>{c.size.toLocaleString()}</TableCell>
                      <TableCell>
                        {c.leadCount} {i18n.companiesPage.leads}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  </PluginGate>
  );
}
