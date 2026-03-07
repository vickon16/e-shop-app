// components/ui/data-table.tsx
"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import DataTableSkeleton from "./data-table-skeleton";

export interface DataTablePlainColumn<T> {
  key: keyof T;
  label: string;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
}

interface DataTablePlainProps<T> {
  columns: DataTablePlainColumn<T>[];
  data: T[];
  maxHeight?: string;
  className?: string;
  isLoadingTable?: boolean;
}

export function DataTablePlain<T extends object>({
  columns,
  data,
  maxHeight = "600px",
  className = "",
  isLoadingTable = false,
}: DataTablePlainProps<T>) {
  return isLoadingTable ? (
    <DataTableSkeleton
      cellWidths={["10rem", "30rem", "10rem", "10rem", "6rem", "6rem", "6rem"]}
      shrinkZero
    />
  ) : (
    <div
      className={`grid w-full [&>div]:border [&>div]:rounded [&>div]:max-h-(--max-h) ${className}`}
      style={{ "--max-h": maxHeight } as React.CSSProperties}
    >
      <Table>
        <TableHeader>
          <TableRow className="*:whitespace-nowrap sticky top-0 bg-background after:content-[''] after:inset-x-0 after:h-px after:bg-border after:absolute after:bottom-0">
            {columns.map((col) => (
              <TableHead key={String(col.key)}>{col.label}</TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody className="overflow-hidden">
          {data.map((row, i) => (
            <TableRow key={i} className="odd:bg-muted/50 *:whitespace-nowrap">
              {columns.map((col) => (
                <TableCell key={String(col.key)}>
                  {col.render
                    ? col.render(row[col.key], row)
                    : String(row[col.key])}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
