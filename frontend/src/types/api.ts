export interface Paginated<TItem> {
  items: TItem[];
  total: number;
  page: number;
  page_size: number;
}

export interface ApiErrorShape {
  status: number;
  message: string;
  field_errors: Record<string, string>;
}
