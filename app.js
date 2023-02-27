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

//BEGIN SOCKET.IO CODE

//initialize player counter
let playerCount = 0;

//when a player connects, increment the player counter and log the connection
io.on('connection', (socket) => {
    //ADD AN IF STATEMENT SO THAT ONLY CONNECTIONS INCREMENT THE PLAYER COUNT AND 
    if (playerCount < 2) {
        playerCount++;
        console.log("Player count: " + playerCount);
        console.log('P' + playerCount + ' has connected');
    }
    //send welcome event with player number to the client
    socket.emit('welcome', playerCount);

    //if updateCrane2 event is received, broadcast it to all other clients
    socket.on('updateCrane2', (data) => {
        console.log("updateCrane2 event received");
        socket.broadcast.emit('updateCrane2', data)
    });
    
    //if updateCrane1 event is received, broadcast it to all other clients
    socket.on('updateCrane1', (data) => {
        console.log("updateCrane1 event received");
        socket.broadcast.emit('updateCrane1', data)
    });

    //if disconnect event is received, decrement the player counter and log the disconnection
    socket.on('disconnect', () => {
        if (playerCount > 0) {
            console.log('P'+playerCount+' has disconnected');
            playerCount--;
            console.log("Player count: " + playerCount);
        }
    });
});

//old attempts below just in case I want to go back to them

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

//END SOCKET.IO CODE

app.use(express.static(__dirname + '/public'));
server.listen(LISTEN_PORT);
console.log('Listening to port ' + LISTEN_PORT);