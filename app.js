const express = require('express');
const app = express();
const http = require('http');
const { SocketAddress } = require('net');
const server = http.createServer(app);
//SOCKET.IO server
const io = require('socket.io')(server);

const LISTEN_PORT = 8080;

app.get('/', function(req, res) {
    res.sendFile('index.html', {root:__dirname+'/public/'});
});

//socket.io connection event
io.on('connection', (socket) => {
    console.log(socket.id + " is connected.");

    socket.on('disconnect', () => {
        console.log(socket.id + " has disconnected.");
    });
});

app.use(express.static(__dirname + '/public'));
server.listen(LISTEN_PORT);
console.log('Listening to port ' + LISTEN_PORT);