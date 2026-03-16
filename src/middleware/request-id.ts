import { FastifyInstance } from 'fastify';
import { v4 as uuidv4 } from 'uuid';

export async function requestIdPlugin(fastify: FastifyInstance) {
  fastify.addHook('onRequest', async (request) => {
    if (!request.id) {
      (request as unknown as { id: string }).id = uuidv4();
    }
  });
}
