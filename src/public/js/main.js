var socket = io();
 socket.on('connect', ()=>{
    console.log('CONNECTED')
 })
 socket.on('event', d=>{
    console.log(d)
 })