import { FastifyInstance } from 'fastify';
import { registerSchema, loginSchema } from './auth.schemas.js';
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
}
