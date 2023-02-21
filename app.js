const express = require('express');
const app = express();
const http = require('http');
const { SocketAddress } = require('net');
const server = http.createServer(app);
//SOCKET.IO server-side.
const io = require('socket.io')(server);

const LISTEN_PORT = 8080;

app.get('/', function(req, res) {
    res.sendFile('index.html', {root:__dirname+'/public/'});
});

let playerCount = 0;

//player 1 connects
io.on('connection', (socket) => {
    playerCount++;
    console.log("Player count: " + playerCount);
    console.log('P' + playerCount + ' has connected');
    socket.emit('welcome', playerCount);

    /*socket.on('updateCrane2', (data) => {
        socket.broadcast.to('p2').emit('updateCrane2', data);
    });*/

    socket.on('updateCrane2', (data) => {
        console.log("received updateCrane2"+
        "\n rotation: "+data.rotation);
        socket.broadcast.emit('updateCrane2', data);
    });
    
    socket.on('updateCrane1', (data) => {
        console.log("received updateCrane1"+data);
        socket.broadcast.emit('updateCrane1', data);
    });

    socket.on('disconnect', () => {
        console.log('P'+playerCount+' has disconnected');
        playerCount--;
        console.log("Player count: " + playerCount);
    });
});



 /* P2 Code
io.on('connection', (socket2) => {
    playerCount++;
    socket2.join('p2');
    console.log("Player count: " + playerCount);
    console.log('P2 has connected');
    socket2.emit('welcome', playerCount);

    socket2.on('updateCrane1', (data) => {
        socket2.broadcast.to('p1').emit('updateCrane1', data);
    });

    socket2.on('disconnect', () => {
        playerCount--;
        console.log("Player count: " + playerCount);
        console.log('P2 has disconnected');
    });
}); */

/*
//custom socket.io events
io.on('connect', (socket) => {
    playerCount++;
    console.log("Player count: " + playerCount);
    socket.emit('welcome', playerCount);

    socket.on('magnetForward', (arg) => {
        console.log(arg);
    });
    socket.on('magnetBackward', (arg) => {
        console.log(arg);
    });
    socket.on('craneLeft', (arg) => {
        console.log(arg);
    });
    socket.on('craneRight', (arg) => {
        console.log(arg);
    });
    socket.on('magnetDown', (arg) => {
        console.log(arg);
    });
    socket.on('magnetUp', (arg) => {
        console.log(arg);
    });

    socket.on('updateCrane1', (data) => {
        //socket.broadcast.emit('updateCrane1', data);
    });

    socket.on('updateCrane2', (data) => {
        //socket.broadcast.emit('updateCrane2', data);
    });

    socket.on('disconnect', () => {
        playerCount--;
        console.log("Player count: " + playerCount);
        console.log('A user has disconnected');
    });
});*/

app.use(express.static(__dirname + '/public'));
server.listen(LISTEN_PORT);
console.log('Listening to port ' + LISTEN_PORT);