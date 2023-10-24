import {Server } from "socket.io";

const io = new Server(); // yes, no server arg here; it's not required
// attach stuff to io
io.on("connection", (client) => {
    console.log("IO CONNECTED");
    
    io.emit("event", "This is event");
    client.on('event', (d)=>{
        console.log(d)
    })
    client.on('comment', data=>{
        console.log('RETURNING THE COMMENT..')

        io.emit('comment', data)
    })
    client.on("rf", d=>{
        console.log("RF:", d);
        setTimeout(()=>{
            console.log('RETURNING THE FAVOUR..')
            io.emit('rf', 'I got you dawg')
        }, 1500)
    })
});



export default io;
