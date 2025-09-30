import type { ClientResponse } from 'hono/client';

import { RESPONSE_STATUS, type ResponseType } from './createResponse';

export const parseApiResponse = async <T>(fetchCall: Promise<ClientResponse<T>>): Promise<ResponseType<T>> => {
  try {
    const response = await fetchCall;

    if (!response.ok) {
      const error = await response.text();
      return {
        data: null,
        message: error || 'An error occurred',
        status: RESPONSE_STATUS.FAIL,
      };
    }

    const json = (await response.json()) as ResponseType<T>;
    return {
      data: json.data,
      message: json.message,
      status: json.status,
    };
  } catch (error) {
    return {
      data: null,
      message: error instanceof Error ? error.message : 'An error occurred',
      status: RESPONSE_STATUS.FAIL,
    };
  }
};
