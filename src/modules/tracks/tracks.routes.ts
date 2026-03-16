import { FastifyInstance } from 'fastify';
import { parse } from 'csv-parse/sync';
import { jwtAuth } from '../../middleware/auth.js';
import { createTrackSchema, listTracksSchema, searchTracksSchema } from './tracks.schemas.js';
import * as tracksService from './tracks.service.js';

export async function trackRoutes(fastify: FastifyInstance) {
  // All track routes require JWT auth
  fastify.addHook('onRequest', jwtAuth);

  fastify.get('/v1/tracks', async (request, reply) => {
    const input = listTracksSchema.parse(request.query);
    const result = await tracksService.listTracks(request.artistId!, input);
    return reply.send(result);
  });

  fastify.post('/v1/tracks', async (request, reply) => {
    const input = createTrackSchema.parse(request.body);
    const result = await tracksService.createTrack(request.artistId!, input);
    return reply.status(201).send(result);
  });

  fastify.get('/v1/tracks/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const result = await tracksService.getTrack(request.artistId!, id);
    return reply.send(result);
  });

  fastify.post('/v1/tracks/import', async (request, reply) => {
    const data = await request.file();
    if (!data) {
      return reply.status(400).send({ message: 'CSV file required' });
    }

    const buffer = await data.toBuffer();
    const records = parse(buffer, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as Array<{ isrc: string; title: string; album?: string }>;

    const result = await tracksService.importTracks(request.artistId!, records);
    return reply.send(result);
  });

  fastify.post('/v1/tracks/search', async (request, reply) => {
    const input = searchTracksSchema.parse(request.body);
    const result = await tracksService.searchTracks(request.artistId!, input.query, input.type);
    return reply.send(result);
  });
}
