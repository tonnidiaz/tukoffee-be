import fastify from 'fastify'
import path from 'path';
import pino from 'pino';
import AutoLoad, {AutoloadPluginOptions} from '@fastify/autoload';
import fastifyView from '@fastify/view';
import fastifyStatic from '@fastify/static';

const envToLogger = {
    development: {
      transport: {
        target: 'pino-pretty',
        options: {
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      },
    },
    production: true,
    test: false,
  }
const start = async ()=>{

    const server = fastify({
        logger: envToLogger.development ?? true
    })
    
     //Public dir
     server.register(fastifyStatic, {
            root: path.join(__dirname, 'src/public'),
        }
      )  
      server.register(fastifyView, {
        engine: {
            pug: require("pug"),
            
        },
        root: path.join(__dirname, "src/views")
      })
      // This loads all plugins defined in routes
      // define your routes in one of these
       server.register(AutoLoad, {
        dir: path.join(__dirname, 'src/routes'),
      })

    server.get('/ping', async (request, reply) => {
      return 'pong dawg\n'
    })
return server;    
}

start().then(server=>{
    const HOST = "0.0.0.0";
server.listen({ port: 8000, host: HOST }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
})
}).catch(console.log)
