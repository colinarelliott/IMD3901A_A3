//client side socket code

let socket = io();

socket.on('connect', (userData) => {
    console.log("I have connected to the server!");
});