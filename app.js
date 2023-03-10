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

    //BEGIN CUSTOM EVENTS

    //send welcome event with player number to the client
    //WELCOME EVENT
    socket.emit('welcome', playerCount);

    //UPDATE CRANE EVENT
    socket.on('updateCrane', (data) => {
        socket.broadcast.emit('updateCrane', data)
    });

    //PICKUP CONTAINER EVENT
    socket.on('pickupContainer', (data) => {
        socket.broadcast.emit('pickupContainer', data);
        console.log('pickupContainer event received at server');
    });

    //PUTDOWN CONTAINER EVENT
    socket.on('putdownContainer', (data) => {
        socket.broadcast.emit('putdownContainer', data);
        console.log('putdownContainer event received at server');
    });

    //UPDATE CONTAINER COUNT EVENT
    socket.on('updateContainerCount', (data) => {
        socket.broadcast.emit('updateContainerCount', data);
        //console.log('updateContainerCount event received at server');
    });

    //SYNC GAME MANAGERS EVENT
    socket.on('syncGameManager', (data) => {
        socket.broadcast.emit('syncGameManager', data);
        //console.log('syncGameManager event received at server');
        //console.log(data);
    });

    socket.on('startGame', (data) => {
        socket.broadcast.emit('startGame', data);
    });

    //END CUSTOM EVENTS

    //if disconnect event is received, decrement the player counter and log the disconnection
    socket.on('disconnect', () => {
        if (playerCount > 0) {
            console.log('P'+playerCount+' has disconnected');
            playerCount--;
            console.log("Player count: " + playerCount);
        }
    });
});

//END SOCKET.IO CODE

app.use(express.static(__dirname + '/public'));
server.listen(LISTEN_PORT);
console.log('Listening to port ' + LISTEN_PORT);