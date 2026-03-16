import { FastifyInstance } from 'fastify';
import { jwtAuth } from '../../middleware/auth.js';
import { rejectStorySchema } from './stories.schemas.js';
import * as storiesService from './stories.service.js';

export async function storyRoutes(fastify: FastifyInstance) {
  fastify.addHook('onRequest', jwtAuth);

  fastify.post('/v1/tracks/:track_id/stories', async (request, reply) => {
    const { track_id } = request.params as { track_id: string };
    const data = await request.file();
    if (!data) {
      return reply.status(400).send({ message: 'Audio file required' });
    }

    const buffer = await data.toBuffer();
    const transcript = (data.fields.transcript as { value?: string } | undefined)?.value;

    const result = await storiesService.createStory(
      request.artistId!,
      track_id,
      buffer,
      data.filename,
      transcript,
    );
    return reply.status(201).send(result);
  });

  fastify.get('/v1/stories/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const result = await storiesService.getStory(request.artistId!, id);
    return reply.send(result);
  });

  fastify.put('/v1/stories/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = await request.file();
    if (!data) {
      return reply.status(400).send({ message: 'Audio file required' });
    }

    const buffer = await data.toBuffer();
    const transcript = (data.fields.transcript as { value?: string } | undefined)?.value;

    const result = await storiesService.updateStory(
      request.artistId!,
      id,
      buffer,
      data.filename,
      transcript,
    );
    return reply.send(result);
  });

  fastify.delete('/v1/stories/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    await storiesService.deleteStory(request.artistId!, id);
    return reply.status(204).send();
  });

  fastify.post('/v1/stories/:id/verify', async (request, reply) => {
    const { id } = request.params as { id: string };
    const result = await storiesService.verifyStory(request.artistId!, id);
    return reply.send(result);
  });

  fastify.post('/v1/stories/:id/reject', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = rejectStorySchema.parse(request.body);
    const result = await storiesService.rejectStory(request.artistId!, id, body.reason);
    return reply.send(result);
  });

  fastify.post('/v1/stories/:id/publish', async (request, reply) => {
    const { id } = request.params as { id: string };
    const result = await storiesService.publishStory(request.artistId!, id);
    return reply.send(result);
  });
}
