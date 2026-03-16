import { FastifyInstance } from 'fastify';
import { jwtAuth } from '../../middleware/auth.js';
import { listNotificationsSchema } from './notifications.schemas.js';
import * as notificationsService from './notifications.service.js';

export async function notificationRoutes(fastify: FastifyInstance) {
  fastify.addHook('onRequest', jwtAuth);

  fastify.get('/v1/notifications', async (request, reply) => {
    const input = listNotificationsSchema.parse(request.query);
    const result = await notificationsService.listNotifications(request.artistId!, input);
    return reply.send(result);
  });

  fastify.post('/v1/notifications/:id/read', async (request, reply) => {
    const { id } = request.params as { id: string };
    await notificationsService.markAsRead(request.artistId!, id);
    return reply.status(204).send();
  });
}
