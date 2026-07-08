import { isAxiosError } from 'axios';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (isAxiosError(error)) {
    const body = error.response?.data;
    const message =
      typeof body === 'object' && body && 'message' in body
        ? String((body as { message: string }).message)
        : error.message || `Request failed (${error.response?.status ?? 'network'})`;

    return new ApiError(message, error.response?.status ?? 0, body);
  }

  if (error instanceof Error) {
    return new ApiError(error.message, 0);
  }

  return new ApiError('An unexpected error occurred', 0);
}
