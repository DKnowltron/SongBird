import { FastifyInstance } from 'fastify';
import { registerSchema, loginSchema, refreshTokenSchema, oauthCallbackSchema } from './auth.schemas.js';
import * as authService from './auth.service.js';

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/v1/auth/register', async (request, reply) => {
    const input = registerSchema.parse(request.body);
    const result = await authService.register(input);
    return reply.status(201).send(result);
  });

  fastify.post('/v1/auth/login', async (request, reply) => {
    const input = loginSchema.parse(request.body);
    const result = await authService.login(input);
    return reply.status(200).send(result);
  });

  fastify.post('/v1/auth/refresh', async (request, reply) => {
    const input = refreshTokenSchema.parse(request.body);
    const result = await authService.refreshSession(input);
    return reply.status(200).send(result);
  });

  fastify.post('/v1/auth/oauth/callback', async (request, reply) => {
    const input = oauthCallbackSchema.parse(request.body);
    const result = await authService.handleOAuthCallback(input);
    return reply.status(200).send(result);
  });
}
