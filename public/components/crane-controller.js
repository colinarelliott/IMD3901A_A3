//the component that allows the player to control the crane's motions using WASD and SPACE
//and, using socket.io, sends data about the cranes position to the server, which then sends it to the other player
//receives the data from the other player and updates the other crane's position

AFRAME.registerComponent('crane-controller', {
    schema: {
        craneToControl: {type: 'number', default: 1}, //the crane that this player controls
        rotation: {type: 'number', default: -120}, //the rotation of the crane
        magnetPosX: {type: 'number', default: 65}, //the x position of the magnet (relative, parented to the crane)
        magnetPosY: {type: 'number', default: 80}, //the y position of the magnet (relative, parented to the crane)
        otherRotation: {type: 'number', default: 120}, //the rotation of the other crane
        otherMagnetPosX: {type: 'number', default: 65}, //the x position of the other magnet (relative, parented to the crane)
        otherMagnetPosY: {type: 'number', default: 80}, //the y position of the other magnet (relative, parented to the crane)
    },
    init: function () {
        const CONTEXT = this;
        //bind the functions to the context of the component
        CONTEXT.onKeydown = CONTEXT.onKeydown.bind(CONTEXT); //this function will be executed on keydown
        CONTEXT.onKeyup = CONTEXT.onKeyup.bind(CONTEXT); //this function will be executed on keyup
 
        window.addEventListener('keydown', CONTEXT.onKeydown); //add the keydown event listener
        window.addEventListener('keyup', CONTEXT.onKeyup); //add the keyup event listener

        let socket = io(); //connect to the server

        //debug connect and disconnect logs
        socket.on('connect', (userData) => {
            console.log("I have connected to the server!");
        });
        
        socket.on('disconnect', () => {
            console.log("I have disconnected from the server!");
        });

        //receive welcome event from the server with player number, set the craneToControl variable to the player number
        socket.on('welcome', (playerCount) => {
            console.log("Welcome to the server! There are " + playerCount + " player(s) online.");
            CONTEXT.data.craneToControl = playerCount;
            console.log("You are player " + CONTEXT.data.craneToControl);
        });
    },

    tick: function () {
        const CONTEXT = this;

        //instantiate crane controls for both cranes
        let crane = document.querySelector('#crane'+CONTEXT.data.craneToControl);
        let magnet = document.querySelector('#crane-magnet'+CONTEXT.data.craneToControl);
        let cable = document.querySelector('#magnet-cable'+CONTEXT.data.craneToControl);
        let otherCrane = document.querySelector('#crane'+(CONTEXT.data.craneToControl+1));
        let otherMagnet = document.querySelector('#crane-magnet'+(CONTEXT.data.craneToControl+1));
        let otherCable = document.querySelector('#magnet-cable'+(CONTEXT.data.craneToControl+1));

        //if this is player two, swap the cranes
        if (CONTEXT.data.craneToControl === 2) {
            crane = document.querySelector('#crane'+CONTEXT.data.craneToControl);
            magnet = document.querySelector('#crane-magnet'+CONTEXT.data.craneToControl);
            cable = document.querySelector('#magnet-cable'+CONTEXT.data.craneToControl);
            otherCrane = document.querySelector('#crane'+(CONTEXT.data.craneToControl-1));
            otherMagnet = document.querySelector('#crane-magnet'+(CONTEXT.data.craneToControl-1));
            otherCable = document.querySelector('#magnet-cable'+(CONTEXT.data.craneToControl-1));
            otherCraneNum = CONTEXT.data.craneToControl-1;
        }

        //animate the crane to the new rotation
        crane.setAttribute('animation', {property: 'rotation', to: {x: 0, y: CONTEXT.data.rotation, z: 0}, dur: 10});

        //animate the magnet to the new position
        magnet.setAttribute('animation', {property: 'position', to: {x: CONTEXT.data.magnetPosX, y: CONTEXT.data.magnetPosY, z: 0}, dur: 50});

        //update the length of the magnet cable
        cable.setAttribute('line', {start: {x: 0, y: 0, z: 0}, end: {x: 0, y: 88 - CONTEXT.data.magnetPosY, z: 0}, color: 'black', opacity: 1});

        //update the other crane's rotation
        otherCrane.setAttribute('animation', {property: 'rotation', to: {x: 0, y: CONTEXT.data.otherRotation, z: 0}, dur: 10});

        //update the other crane's magnet position
        otherMagnet.setAttribute('animation', {property: 'position', to: {x: CONTEXT.data.otherMagnetPosX, y: CONTEXT.data.otherMagnetPosY, z: 0}, dur: 50});

        //update the other crane's magnet cable length
        otherCable.setAttribute('line', {start: {x: 0, y: 0, z: 0}, end: {x: 0, y: 88 - CONTEXT.data.otherMagnetPosY, z: 0}, color: 'black', opacity: 1});
    },

    onKeydown: function(evt) {
        const CONTEXT = this;
        //switch on the keycode, determine correct action and move crane accordingly
        switch(evt.keyCode) {
            case 87: //W
            if (CONTEXT.data.magnetPosX < 65) {
                    CONTEXT.data.magnetPosX += 1;
                }
                break;
            case 38: //UP
                if (CONTEXT.data.magnetPosX < 65) {
                    CONTEXT.data.magnetPosX += 1;
                }
                break;
            case 65: //A
                if (CONTEXT.data.rotation < -75) {
                    CONTEXT.data.rotation += 1;
                }
                break;
            case 37: //LEFT
                if (CONTEXT.data.rotation < -75) {
                    CONTEXT.data.rotation += 1;
                }
                break;
            case 83: //S
                if (CONTEXT.data.magnetPosX > 25) {
                    CONTEXT.data.magnetPosX -= 1;
                }
                break;
            case 40: //DOWN
                if (CONTEXT.data.magnetPosX > 25) {
                    CONTEXT.data.magnetPosX -= 1;
                }
                break;
            case 68: //D
            if (CONTEXT.data.rotation > -210) {
                CONTEXT.data.rotation -= 1;
            }
                break;
            case 39: //RIGHT
                if (CONTEXT.data.rotation > -210) {
                    CONTEXT.data.rotation -= 1;
                }
                break;
            case 32: //SPACE
                //animate the magnet down to 44 and then back up to 82
                CONTEXT.data.magnetPosY = 44;
                break;
            default:
                //do nothing if the key pressed is not one of the above
                break;
        }
    },

    //currently just a special case for the magnet so you can hold it down
    onKeyup: function(evt) {
        const CONTEXT = this;
        switch(evt.keyCode) { 
            case 32: //SPACE
                //animate the magnet back up to 82
                CONTEXT.data.magnetPosY = 82;
                break;
            default:
                //do nothing if the key pressed is not one of the above
                break;
        }
    },

    //because this is called at the beginning of the game, it messes up the player number distribution...
    update: function (event) {
        const CONTEXT = this;
        let socket = io();

        //send an updateCrane event to the server when the crane's data is updated with the crane this player is controlling and the data
        socket.emit("updateCrane"+CONTEXT.data.craneToControl, CONTEXT.data);
        
        //after 10ms, listen for an updateCrane event from the server and update the data
        setTimeout(function() {
            socket.on("updateCrane"+CONTEXT.data.craneToControl, function(data) {
                CONTEXT.data = data;
            });
        }, 10); // after 10ms to make sure this happens after the emit
    },

    remove: function() {
        //if the crane-controller is removed, remove all event listeners and socket listeners
        let socket = io();
        socket.removeAllListeners();
        CONTEXT.removeEventListeners();
    }
});
