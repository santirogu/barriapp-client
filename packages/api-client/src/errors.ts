import { resolveErrorMessage, type ApiErrorBody } from '@barriapp/shared';

/**
 * Typed error thrown by the HTTP client for any non-2xx response. Carries the
 * stable `code` to switch on, a user-facing `message`, the HTTP `status`, the
 * `X-Request-ID` (for bug reports), and optional validation `details`.
 */
export class ApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details?: unknown;
  readonly requestId?: string;

  constructor(params: {
    code: string;
    message: string;
    status: number;
    details?: unknown;
    requestId?: string;
  }) {
    super(params.message);
    this.name = 'ApiError';
    this.code = params.code;
    this.status = params.status;
    this.details = params.details;
    this.requestId = params.requestId;
  }

  /** True when the access token is invalid/expired and a refresh should run. */
  get isInvalidToken(): boolean {
    return this.status === 401 && this.code === 'invalid_token';
  }

  static fromResponse(
    status: number,
    body: unknown,
    requestId?: string,
  ): ApiError {
    const typed = body as ApiErrorBody | undefined;
    const code = typed?.error?.code ?? `http_${status}`;
    return new ApiError({
      code,
      message: resolveErrorMessage(typed),
      status,
      details: typed?.error?.details,
      requestId,
    });
  }
}
