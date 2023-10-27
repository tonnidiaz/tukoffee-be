import { FastifyPluginAsync, FastifyReply } from 'fastify'

const root: FastifyPluginAsync = async (fastify, opts,): Promise<void> => {
  fastify.get('/', async function (req, res) {
   return res.view("index.pug")
  });

}

export default root;
