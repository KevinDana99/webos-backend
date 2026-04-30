export const httpStatus = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export function success<T>(data: T, statusCode: number = 200): { status: number; data: T } {
  return { status: statusCode, data };
}

export function error(message: string, statusCode: number = 500): { status: number; error: { message: string } } {
  return { status: statusCode, error: { message } };
}