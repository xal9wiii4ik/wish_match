import axios from "axios";

import type { ApiErrorShape } from "@/types";

export class ApiError extends Error {
  readonly status: number;
  readonly field_errors: Record<string, string>;

  constructor(shape: ApiErrorShape) {
    super(shape.message);
    this.name = "ApiError";
    this.status = shape.status;
    this.field_errors = shape.field_errors;
  }
}

interface FastApiValidationItem {
  loc: (string | number)[];
  msg: string;
}

function extract_field_errors(detail: unknown): Record<string, string> {
  const field_errors: Record<string, string> = {};
  if (!Array.isArray(detail)) {
    return field_errors;
  }
  for (const raw of detail as FastApiValidationItem[]) {
    const location = raw.loc ?? [];
    const field = location[location.length - 1];
    if (typeof field === "string") {
      field_errors[field] = raw.msg;
    }
  }
  return field_errors;
}

function extract_message(detail: unknown, fallback: string): string {
  if (typeof detail === "string") {
    return detail;
  }
  if (Array.isArray(detail) && detail.length > 0) {
    const first = detail[0] as FastApiValidationItem;
    return first.msg ?? fallback;
  }
  return fallback;
}

export function normalize_error(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (axios.isAxiosError(error)) {
    const status = error.response?.status ?? 0;
    const detail = (error.response?.data as { detail?: unknown } | undefined)
      ?.detail;
    const fallback =
      status === 0
        ? "Не удалось соединиться с сервером"
        : "Что-то пошло не так. Попробуйте ещё раз.";

    return new ApiError({
      status,
      message: extract_message(detail, fallback),
      field_errors: extract_field_errors(detail),
    });
  }

  return new ApiError({
    status: 0,
    message: error instanceof Error ? error.message : "Неизвестная ошибка",
    field_errors: {},
  });
}
