import { FastifyInstance, FastifyError } from 'fastify';
import { AppError, ValidationError } from '../utils/errors.js';
import { ZodError } from 'zod';

export async function errorHandlerPlugin(fastify: FastifyInstance) {
  fastify.setErrorHandler((error: FastifyError | AppError | ZodError | Error, request, reply) => {
    const requestId = request.id;

    // Zod validation errors
    if (error instanceof ZodError) {
      return reply.status(422).send({
        statusCode: 422,
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: error.issues,
        requestId,
      });
    }

    // Our custom errors
    if (error instanceof AppError) {
      const response: Record<string, unknown> = {
        statusCode: error.statusCode,
        code: error.code,
        message: error.message,
        requestId,
      };

      if (error instanceof ValidationError && error.details) {
        response.details = error.details;
      }

      if (process.env.NODE_ENV === 'development' && error.stack) {
        response.stack = error.stack;
      }

      return reply.status(error.statusCode).send(response);
    }

    // Fastify errors (validation, content type, etc.)
    if ('statusCode' in error && typeof error.statusCode === 'number') {
      return reply.status(error.statusCode).send({
        statusCode: error.statusCode,
        code: (error as FastifyError).code || 'REQUEST_ERROR',
        message: error.message,
        requestId,
      });
    }

    // Unexpected errors
    request.log.error({ err: error, requestId }, 'Unhandled error');

    const response: Record<string, unknown> = {
      statusCode: 500,
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      requestId,
    };

    if (process.env.NODE_ENV === 'development' && error.stack) {
      response.stack = error.stack;
      response.message = error.message;
    }

    return reply.status(500).send(response);
  });
}
