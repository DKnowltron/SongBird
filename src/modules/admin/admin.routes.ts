import { FastifyInstance } from 'fastify';
import { adminAuth } from '../../middleware/auth.js';
import { listModerationSchema, rejectModerationSchema, createPartnerSchema } from './admin.schemas.js';
import * as adminService from './admin.service.js';

export async function adminRoutes(fastify: FastifyInstance) {
  fastify.addHook('onRequest', adminAuth);

  fastify.get('/v1/admin/moderation', async (request, reply) => {
    const input = listModerationSchema.parse(request.query);
    const result = await adminService.listModeration(input);
    return reply.send(result);
  });

  fastify.post('/v1/admin/moderation/:story_id/approve', async (request, reply) => {
    const { story_id } = request.params as { story_id: string };
    const result = await adminService.approveStory(request.artistId!, story_id);
    return reply.send(result);
  });

  fastify.post('/v1/admin/moderation/:story_id/reject', async (request, reply) => {
    const { story_id } = request.params as { story_id: string };
    const body = rejectModerationSchema.parse(request.body);
    const result = await adminService.rejectModeration(request.artistId!, story_id, body.reason);
    return reply.send(result);
  });

  fastify.get('/v1/admin/partners', async (_request, reply) => {
    const result = await adminService.listPartners();
    return reply.send(result);
  });

  fastify.post('/v1/admin/partners', async (request, reply) => {
    const input = createPartnerSchema.parse(request.body);
    const result = await adminService.createPartner(request.artistId!, input);
    return reply.status(201).send(result);
  });

  fastify.get('/v1/admin/stats', async (_request, reply) => {
    const result = await adminService.getStats();
    return reply.send(result);
  });
}
