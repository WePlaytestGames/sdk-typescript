export interface ErrorDetail {
  field: string;
  message: string;
}

export class WPGError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details?: ErrorDetail[];
  readonly requestId?: string;

  constructor(params: {
    code: string;
    message: string;
    status: number;
    details?: ErrorDetail[];
    requestId?: string;
  }) {
    super(params.message);
    this.name = 'WPGError';
    this.code = params.code;
    this.status = params.status;
    this.details = params.details;
    this.requestId = params.requestId;
  }
}
