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

//custom socket.io events
io.on('connection', (socket) => {
    playerCount++;
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
    
    socket.on('disconnect', () => {
        console.log('A user has disconnected');
    });
});

app.use(express.static(__dirname + '/public'));
server.listen(LISTEN_PORT);
console.log('Listening to port ' + LISTEN_PORT);