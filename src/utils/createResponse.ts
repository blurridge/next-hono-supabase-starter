export const RESPONSE_STATUS = {
  SUCCESS: 'success',
  FAIL: 'fail',
} as const;

export type ResponseStatus = (typeof RESPONSE_STATUS)[keyof typeof RESPONSE_STATUS];

export type ResponseType<T = unknown> = {
  status: ResponseStatus;
  message: string;
  data: T | null;
};

export const createResponse = <T>(status: ResponseStatus, message: string, data: T | null = null): ResponseType<T> => {
  return {
    status,
    message,
    data,
  };
};
