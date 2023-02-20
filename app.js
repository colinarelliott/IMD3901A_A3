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
io.once('connection', (socket) => {
    playerCount++;
    socket.join('p1');
    console.log("Player count: " + playerCount);
    console.log('P1 has connected');
    socket.broadcast.to('p1').emit('welcome', playerCount);

    socket.on('updateCrane2', (data) => {
        socket.broadcast.to('p2').emit('updateCrane2', data);
    });

    socket.on('disconnect', () => {
        playerCount--;
        console.log("Player count: " + playerCount);
        console.log('P1 has disconnected');
    });
});

//player 2 connects
io.once('connection', (socket) => {
    playerCount++;
    socket.join('p2');
    console.log("Player count: " + playerCount);
    console.log('P2 has connected');
    socket.broadcast.to('p2').emit('welcome', playerCount);

    socket.on('updateCrane1', (data) => {
        socket.broadcast.to('p1').emit('updateCrane1', data);
    });

    socket.on('disconnect', () => {
        playerCount--;
        console.log("Player count: " + playerCount);
        console.log('P2 has disconnected');
    });
});

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