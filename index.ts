import fastify from 'fastify'
import pino from 'pino';

const server = fastify({
    logger: pino({
        level: "info"
    })
})

server.get("/", (req, res)=>{
    return "Hello"
})
server.get('/ping', async (request, reply) => {
  return 'pong dawg\n'
})

server.listen({ port: 8000, host: "0.0.0.0" }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
})