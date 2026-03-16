import { FastifyInstance } from 'fastify';
import { apiKeyAuth } from '../../middleware/api-key.js';
import { listPartnerStoriesSchema } from './distribution.schemas.js';
import * as distributionService from './distribution.service.js';

export async function distributionRoutes(fastify: FastifyInstance) {
  fastify.addHook('onRequest', apiKeyAuth);

  fastify.get('/v1/partner/stories', async (request, reply) => {
    const input = listPartnerStoriesSchema.parse(request.query);
    const result = await distributionService.listPartnerStories(request.partnerId!, input);
    return reply.send(result);
  });

  fastify.get('/v1/partner/stories/:isrc', async (request, reply) => {
    const { isrc } = request.params as { isrc: string };
    const result = await distributionService.getPartnerStoryByIsrc(request.partnerId!, isrc);
    return reply.send(result);
  });

  fastify.get('/v1/partner/stories/:id/audio', async (request, reply) => {
    const { id } = request.params as { id: string };
    const audioUrl = await distributionService.getStoryAudioRedirect(request.partnerId!, id);
    return reply.redirect(audioUrl);
  });
}
