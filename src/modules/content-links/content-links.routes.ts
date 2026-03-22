import { FastifyInstance } from 'fastify';
import { jwtAuth } from '../../middleware/auth.js';
import {
  createContentLinkSchema,
  updateContentLinkSchema,
  listContentLinksSchema,
} from './content-links.schemas.js';
import * as contentLinksService from './content-links.service.js';

export async function contentLinkRoutes(fastify: FastifyInstance) {
  // Public: list approved content links for a track (no auth needed)
  fastify.get('/v1/tracks/:track_id/content', async (request, reply) => {
    const { track_id } = request.params as { track_id: string };
    const input = listContentLinksSchema.parse(request.query);
    const result = await contentLinksService.listContentLinks(track_id, input);
    return reply.send(result);
  });

  // Authenticated: add a content link to a track
  fastify.post('/v1/tracks/:track_id/content', { preHandler: jwtAuth }, async (request, reply) => {
    const { track_id } = request.params as { track_id: string };
    const input = createContentLinkSchema.parse(request.body);
    const result = await contentLinksService.createContentLink(track_id, request.artistId!, input);
    return reply.status(201).send(result);
  });

  // Authenticated: update a content link
  fastify.put('/v1/content-links/:id', { preHandler: jwtAuth }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const input = updateContentLinkSchema.parse(request.body);
    const result = await contentLinksService.updateContentLink(id, request.artistId!, input);
    return reply.send(result);
  });

  // Authenticated: delete a content link
  fastify.delete('/v1/content-links/:id', { preHandler: jwtAuth }, async (request, reply) => {
    const { id } = request.params as { id: string };
    await contentLinksService.deleteContentLink(id, request.artistId!);
    return reply.status(204).send();
  });

  // Admin: approve a content link
  fastify.post('/v1/content-links/:id/approve', { preHandler: jwtAuth }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const result = await contentLinksService.approveContentLink(id);
    return reply.send(result);
  });

  // Admin: list pending links
  fastify.get('/v1/content-links/pending', { preHandler: jwtAuth }, async (request, reply) => {
    const { page, per_page } = request.query as { page?: string; per_page?: string };
    const result = await contentLinksService.listPendingLinks(
      parseInt(page || '1', 10),
      parseInt(per_page || '20', 10),
    );
    return reply.send(result);
  });
}
