import { FastifyInstance } from 'fastify';
import { jwtAuth } from '../../middleware/auth.js';
import * as dashboardService from './dashboard.service.js';

export async function dashboardRoutes(fastify: FastifyInstance) {
  fastify.addHook('onRequest', jwtAuth);

  fastify.get('/v1/dashboard', async (request, reply) => {
    const result = await dashboardService.getDashboard(request.artistId!);
    return reply.send(result);
  });
}
