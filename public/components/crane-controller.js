//the component that allows the player to control the crane's motions using WASD and SPACE

AFRAME.registerComponent('crane-controller', {
    schema: {
        craneToControl: {type: 'number', default: 1},
        rotation: {type: 'number', default: -120},
        magnetPosX: {type: 'number', default: 65},
        magnetPosY: {type: 'number', default: 80},
        otherRotation: {type: 'number', default: -120},
        otherMagnetPosX: {type: 'number', default: 65},
        otherMagnetPosY: {type: 'number', default: 80},
        //need to add a second rotation parameter for the other crane
        //find a way to assign the second crane to the second player
    },
    init: function () {
        const CONTEXT = this;
        CONTEXT.onKeydown = CONTEXT.onKeydown.bind(CONTEXT);
        CONTEXT.onKeyup = CONTEXT.onKeyup.bind(CONTEXT);
        //const crane1 = document.querySelector('#crane1');
 
        window.addEventListener('keydown', CONTEXT.onKeydown);
        window.addEventListener('keyup', CONTEXT.onKeyup);

        let socket = io();
        socket.on('connect', (userData) => {
            console.log("I have connected to the server!");
        });
        
        socket.on('disconnect', () => {
            console.log("I have disconnected from the server!");
        });

        socket.on('welcome', (playerCount) => {
            console.log("Welcome to the server! There are " + playerCount + " player(s) online.");
            CONTEXT.data.craneToControl = playerCount;
            console.log("You are player " + CONTEXT.data.craneToControl);
        });

    },

    tick: function () {
        let socket = io();
        const CONTEXT = this;

        //instantiate crane controls for both cranes
        let crane = document.querySelector('#crane'+CONTEXT.data.craneToControl);
        let magnet = document.querySelector('#crane-magnet'+CONTEXT.data.craneToControl);
        let cable = document.querySelector('#magnet-cable'+CONTEXT.data.craneToControl);
        let otherCrane = document.querySelector('#crane'+(CONTEXT.data.craneToControl+1));
        let otherMagnet = document.querySelector('#crane-magnet'+(CONTEXT.data.craneToControl+1));
        let otherCable = document.querySelector('#magnet-cable'+(CONTEXT.data.craneToControl+1));
        let otherCraneNum = CONTEXT.data.craneToControl+1;

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

        //listen for updates from the other crane, update the other crane's position
        socket.on('updateCrane'+(otherCraneNum), (data) => {
            CONTEXT.data.otherRotation = data.rotation;
            CONTEXT.data.otherMagnetPosX = data.magnetPosX;
            CONTEXT.data.otherMagnetPosY = data.magnetPosY; //UNTESTED
        });
    },

    onKeydown: function(evt) {
        let socket = io();
        //console.log(evt.keyCode) DEBUG KEYCODES
        const CONTEXT = this;
        switch(evt.keyCode) {
            case 87: //W
            if (CONTEXT.data.magnetPosX < 65) {
                    CONTEXT.data.magnetPosX += 1;
                    socket.emit("magnetForward", "magnetForward");
                    //send out an update with the new crane position
                    socket.emit("updateCrane"+CONTEXT.data.craneToControl, CONTEXT.data); //UNTESTED
                }
                break;
            case 38: //UP
                if (CONTEXT.data.magnetPosX < 65) {
                    CONTEXT.data.magnetPosX += 1;
                    socket.emit("magnetForward", "magnetForward");
                    //send out an update with the new crane position
                    socket.emit("updateCrane"+CONTEXT.data.craneToControl, CONTEXT.data); //UNTESTED
                }
                break;
            case 65: //A
                if (CONTEXT.data.rotation < -75) {
                    CONTEXT.data.rotation += 1;
                    socket.emit("craneLeft", "craneLeft");
                    //send out an update with the new crane position
                    socket.emit("updateCrane"+CONTEXT.data.craneToControl, CONTEXT.data); //UNTESTED
                }
                break;
            case 37: //LEFT
                if (CONTEXT.data.rotation < -75) {
                    CONTEXT.data.rotation += 1;
                    socket.emit("craneLeft", "craneLeft");}
                    //send out an update with the new crane position
                    socket.emit("updateCrane"+CONTEXT.data.craneToControl, CONTEXT.data); //UNTESTED
                break;
            case 83: //S
                if (CONTEXT.data.magnetPosX > 25) {
                    CONTEXT.data.magnetPosX -= 1;
                    socket.emit("magnetBackward", "magnetBackward");
                    //send out an update with the new crane position
                    socket.emit("updateCrane"+CONTEXT.data.craneToControl, CONTEXT.data); //UNTESTED
                }
                break;
            case 40: //DOWN
                if (CONTEXT.data.magnetPosX > 25) {
                    CONTEXT.data.magnetPosX -= 1;
                    socket.emit("magnetBackward", "magnetBackward");
                    //send out an update with the new crane position
                    socket.emit("updateCrane"+CONTEXT.data.craneToControl, CONTEXT.data); //UNTESTED
                }
                break;
            case 68: //D
            if (CONTEXT.data.rotation > -210) {
                CONTEXT.data.rotation -= 1;
                socket.emit("craneRight", "craneRight");
                //send out an update with the new crane position
                socket.emit("updateCrane"+CONTEXT.data.craneToControl, CONTEXT.data); //UNTESTED
            }
                break;
            case 39: //RIGHT
                if (CONTEXT.data.rotation > -210) {
                    CONTEXT.data.rotation -= 1;
                    socket.emit("craneRight", "craneRight");
                    //send out an update with the new crane position
                    socket.emit("updateCrane"+CONTEXT.data.craneToControl, CONTEXT.data); //UNTESTED
                }
                break;
            case 32: //SPACE
                //animate the magnet down to 44 and then back up to 82
                CONTEXT.data.magnetPosY = 44;
                socket.emit("magnetDown", "magnetDown");
                //send out an update with the new crane position
                socket.emit("updateCrane"+CONTEXT.data.craneToControl, CONTEXT.data); //UNTESTED
                break;
            default:
                //do nothing if the key pressed is not one of the above
                break;
        }
    },

    onKeyup: function(evt) {
        const CONTEXT = this;
        let socket = io();
        switch(evt.keyCode) { 
            case 32: //SPACE
                //animate the magnet back up to 82
                CONTEXT.data.magnetPosY = 82;
                socket.emit("magnetUp", "magnetUp");
                //send out an update with the new crane position
                socket.emit("updateCrane"+CONTEXT.data.craneToControl, CONTEXT.data); //UNTESTED
                break;
            default:
                //do nothing if the key pressed is not one of the above
                break;
        }
    },

    remove: function() {
        CONTEXT.removeEventListeners();
    }
});
