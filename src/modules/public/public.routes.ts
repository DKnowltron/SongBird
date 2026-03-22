import { FastifyInstance } from 'fastify';
import { searchSchema, paginationSchema } from './public.schemas.js';
import * as publicService from './public.service.js';

export async function publicRoutes(fastify: FastifyInstance) {
  // GET /v1/public/songs/:isrc — Song page by ISRC
  fastify.get('/v1/public/songs/:isrc', async (request, reply) => {
    const { isrc } = request.params as { isrc: string };
    const result = await publicService.getSongByIsrc(isrc);
    return reply.send(result);
  });

  // GET /v1/public/artists/:id — Artist public profile
  fastify.get('/v1/public/artists/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const result = await publicService.getArtistPublic(id);
    return reply.send(result);
  });

  // GET /v1/public/search — Search tracks and artists
  fastify.get('/v1/public/search', async (request, reply) => {
    const input = searchSchema.parse(request.query);
    const result = await publicService.searchPublic(input.q, input.filter, input.page, input.per_page);
    return reply.send(result);
  });

  // GET /v1/public/featured — Most recently verified story
  fastify.get('/v1/public/featured', async (request, reply) => {
    const result = await publicService.getFeatured();
    return reply.send(result);
  });

  // GET /v1/public/recent — Recent tracks with stories or content
  fastify.get('/v1/public/recent', async (request, reply) => {
    const input = paginationSchema.parse(request.query);
    const result = await publicService.getRecent(input.page, input.per_page);
    return reply.send(result);
  });
}
