import path, { join } from 'path';
import AutoLoad, {AutoloadPluginOptions} from '@fastify/autoload';
import { FastifyPluginAsync, FastifyServerOptions } from 'fastify';
import { Server } from 'socket.io';
import fastifyView from '@fastify/view';
export const io = new Server()

export interface AppOptions extends FastifyServerOptions, Partial<AutoloadPluginOptions> {

}
// Pass --options via CLI arguments in command to enable these options.
const options: AppOptions = {
}

const app: FastifyPluginAsync<AppOptions> = async (
    fastify,
    opts
): Promise<void> => {
  // Place here your custom code!
  fastify.register(fastifyView, {
    engine: {
        pug: require("pug"),
        
    },
    root: path.join(__dirname, "../src/views")
  })
  io.on("connection", client=>{
    console.log(`${client.id} CONNECTED`)
  })
  io.attach(fastify.server)
  

fastify.get("/mojo", (req, res)=>{
    return "JOJO"
})

  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  void fastify.register(AutoLoad, {
    dir: join(__dirname, 'plugins'),
    options: opts
  })

  // This loads all plugins defined in routes
  // define your routes in one of these
  void fastify.register(AutoLoad, {
    dir: join(__dirname, 'routes'),
    options: opts
  })

};

export default app;
export { app, options }
