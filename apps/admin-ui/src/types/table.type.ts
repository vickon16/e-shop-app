import type { DataTableConfig } from "@/components/data-table/data.table-config";
import type { ColumnSort, Row, RowData } from "@tanstack/react-table";
import { type TSelect } from ".";

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    label?: string;
    placeholder?: string;
    variant?: FilterVariant;
    options?: Option[];
    range?: [number, number];
    unit?: string;
    icon?: React.FC<React.SVGProps<SVGSVGElement>>;
  }
}

export type FilterVariant = DataTableConfig["filterVariants"][number];

export interface Option extends TSelect {
  count?: number;
  icon?: React.FC<React.SVGProps<SVGSVGElement>>;
}

export interface ExtendedColumnSort<TData> extends Omit<ColumnSort, "id"> {
  id: Extract<keyof TData, string>;
}

export interface TDataTableRowAction<TData> {
  row: Row<TData>;
  variant: "update" | "cancel";
}

// Team member Table types
