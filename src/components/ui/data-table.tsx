"use client";

import * as React from "react";
import {
  type Column,
  type ColumnDef,
  type ColumnFiltersState,
  type ColumnVisibilityState,
  type ReactTable,
  type RowData,
  type SortingState,
  useTable,
  flexRender,
} from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Inbox,
} from "lucide-react";
import { cn } from "@/lib/utils";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { features, type DataTableFeatures } from "@/components/ui/data-table-features";

export interface DataTableColumnHeaderProps<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TData extends RowData = any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TValue = any,
> extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<DataTableFeatures, TData, TValue>;
  title: string;
}

export function DataTableColumnHeader<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TData extends RowData = any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TValue = any,
>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn("text-xs font-semibold", className)}>{title}</div>;
  }

  const sorted = column.getIsSorted();

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        "-ml-2.5 h-8 px-2 text-xs font-semibold hover:bg-muted/60 data-[state=open]:bg-accent",
        className
      )}
      onClick={() => column.toggleSorting(sorted === "asc")}
    >
      <span>{title}</span>
      {sorted === "desc" ? (
        <ArrowDown className="ml-1 size-3.5 text-foreground" />
      ) : sorted === "asc" ? (
        <ArrowUp className="ml-1 size-3.5 text-foreground" />
      ) : (
        <ArrowUpDown className="ml-1 size-3.5 text-muted-foreground/60" />
      )}
    </Button>
  );
}

export interface DataTablePaginationProps<TData extends RowData> {
  table: ReactTable<DataTableFeatures, TData>;
  previousLabel?: string;
  nextLabel?: string;
  showingLabel?: string;
  ofLabel?: string;
  pageLabel?: string;
  itemsZeroLabel?: string;
}

export function DataTablePagination<TData extends RowData>({
  table,
  previousLabel = "Previous",
  nextLabel = "Next",
  showingLabel = "Showing",
  ofLabel = "of",
  pageLabel = "Page",
  itemsZeroLabel = "0 items",
}: DataTablePaginationProps<TData>) {
  const pageIndex = table.state.pagination.pageIndex;
  const pageSize = table.state.pagination.pageSize;
  const pageCount = Math.max(0, table.getPageCount());
  const totalRows = table.getFilteredRowModel().rows.length;

  const start = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
  const end = Math.min((pageIndex + 1) * pageSize, totalRows);
  const currentPage = pageCount === 0 ? 0 : pageIndex + 1;
  const lastPageIndex = Math.max(0, pageCount - 1);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 px-4 py-3 text-xs text-muted-foreground">
      <div>
        {totalRows > 0 ? (
          <>
            {showingLabel}{" "}
            <span className="font-medium text-foreground">{start}</span>–
            <span className="font-medium text-foreground">{end}</span> {ofLabel}{" "}
            <span className="font-medium text-foreground">{totalRows}</span>
          </>
        ) : (
          <span>{itemsZeroLabel}</span>
        )}
      </div>
      <div className="flex items-center gap-4">
        <div className="text-xs">
          {pageLabel}{" "}
          <span className="font-medium text-foreground">{currentPage}</span> {ofLabel}{" "}
          <span className="font-medium text-foreground">{Math.max(1, pageCount)}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon-xs"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            aria-label="First page"
          >
            <ChevronsLeft className="size-3.5" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="mr-1 size-3.5" />
            {previousLabel}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            {nextLabel}
            <ChevronRight className="ml-1 size-3.5" />
          </Button>
          <Button
            variant="outline"
            size="icon-xs"
            onClick={() => table.setPageIndex(lastPageIndex)}
            disabled={!table.getCanNextPage()}
            aria-label="Last page"
          >
            <ChevronsRight className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export interface DataTableProps<TData extends RowData> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<DataTableFeatures, TData, any>[];
  data: TData[];
  pageSize?: number;
  empty?: React.ReactNode;
  emptyState?: React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  filterColumn?: string;
  filterInputPlaceholder?: string;
  className?: string;
  tableClassName?: string;
  initialSorting?: SortingState;
  showPagination?: boolean;
  previousLabel?: string;
  nextLabel?: string;
  showingLabel?: string;
  ofLabel?: string;
  pageLabel?: string;
  itemsZeroLabel?: string;
  onRowClick?: (row: TData) => void;
}

export function DataTable<TData extends RowData>({
  columns,
  data,
  pageSize = 10,
  empty,
  emptyState,
  emptyTitle = "No results found",
  emptyDescription,
  filterColumn,
  filterInputPlaceholder = "Filter...",
  className,
  tableClassName,
  initialSorting = [],
  showPagination = true,
  previousLabel = "Previous",
  nextLabel = "Next",
  showingLabel,
  ofLabel,
  pageLabel,
  itemsZeroLabel,
  onRowClick,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>(initialSorting);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<ColumnVisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize,
  });

  const table = useTable<DataTableFeatures, TData>({
    features,
    columns,
    data,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
  });

  const rows = table.getRowModel().rows;
  const totalRows = table.getFilteredRowModel().rows.length;

  return (
    <div className={cn("w-full overflow-hidden", className)}>
      {filterColumn && (
        <div className="flex items-center p-3">
          <Input
            placeholder={filterInputPlaceholder}
            value={
              (table.getColumn(filterColumn)?.getFilterValue() as string) ?? ""
            }
            onChange={(e) =>
              table.getColumn(filterColumn)?.setFilterValue(e.target.value)
            }
            className="max-w-xs"
          />
        </div>
      )}

      <div className="overflow-x-auto">
        <Table className={tableClassName}>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rows.length > 0 ? (
              rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={cn(
                    "hover:bg-muted/40",
                    onRowClick && "cursor-pointer"
                  )}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-48 text-center p-0"
                >
                  {emptyState ?? empty ?? (
                    <Empty className="border-none py-12">
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <Inbox className="size-5" />
                        </EmptyMedia>
                        <EmptyTitle>{emptyTitle}</EmptyTitle>
                        {emptyDescription && (
                          <EmptyDescription>{emptyDescription}</EmptyDescription>
                        )}
                      </EmptyHeader>
                    </Empty>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {showPagination && totalRows > 0 && (
        <DataTablePagination
          table={table}
          previousLabel={previousLabel}
          nextLabel={nextLabel}
          showingLabel={showingLabel}
          ofLabel={ofLabel}
          pageLabel={pageLabel}
          itemsZeroLabel={itemsZeroLabel}
        />
      )}
    </div>
  );
}
