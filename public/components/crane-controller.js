//the component that allows the player to control the crane's motions using WASD and SPACE

AFRAME.registerComponent('crane-controller', {
    schema: {
        rotation: {type: 'number', default: -120},
        magnetPosX: {type: 'number', default: 65},
        magnetPosY: {type: 'number', default: 80},
    },
    init: function () {
        const CONTEXT = this;
        CONTEXT.onKeydown = CONTEXT.onKeydown.bind(CONTEXT);
        //const crane1 = document.querySelector('#crane1');
 
        window.addEventListener('keydown', CONTEXT.onKeydown);

        let socket = io();
        socket.on('connect', (userData) => {
            console.log("I have connected to the server!");
        });
        
        socket.on('disconnect', () => {
            console.log("I have disconnected from the server!");
        });
    },

    tick: function () {
        const CONTEXT = this;
        const crane1 = document.querySelector('#crane1');
        const magnet1 = document.querySelector('#crane-magnet1');
        const cable1 = document.querySelector('#magnet-cable1');
        //animate the crane to the new rotation
        crane1.setAttribute('animation', {property: 'rotation', to: {x: 0, y: CONTEXT.data.rotation, z: 0}, dur: 10});

        //animate the magnet to the new position
        magnet1.setAttribute('animation', {property: 'position', to: {x: CONTEXT.data.magnetPosX, y: CONTEXT.data.magnetPosY, z: 0}, dur: 10});

        //update the length of the magnet cable
        cable1.setAttribute('line', {start: {x: 0, y: 0, z: 0}, end: {x: 0, y: 88 - CONTEXT.data.magnetPosY, z: 0}, color: 'black', opacity: 1})
        
    },

    onKeydown: function(evt) {
        //console.log(evt.keyCode) DEBUG KEYCODES
        const CONTEXT = this;
        switch(evt.keyCode) {
            case 87: //W
            if (CONTEXT.data.magnetPosX < 65) {CONTEXT.data.magnetPosX += 1;}
                break;
            case 38: //UP
                if (CONTEXT.data.magnetPosX < 65) {CONTEXT.data.magnetPosX += 1;}
                break;
            case 65: //A
                if (CONTEXT.data.rotation < -75) {CONTEXT.data.rotation += 1;}
                break;
            case 37: //LEFT
                if (CONTEXT.data.rotation < -75) {CONTEXT.data.rotation += 1;}
                break;
            case 83: //S
                if (CONTEXT.data.magnetPosX > 25) {CONTEXT.data.magnetPosX -= 1;}
                break;
            case 40: //DOWN
                if (CONTEXT.data.magnetPosX > 25) {CONTEXT.data.magnetPosX -= 1;}
                break;
            case 68: //D
            if (CONTEXT.data.rotation > -210) {CONTEXT.data.rotation -= 1;}
                break;
            case 39: //RIGHT
                if (CONTEXT.data.rotation > -210) {CONTEXT.data.rotation -= 1;}
                break;
            case 32: //SPACE
                //animate the magnet down to 44 and then back up to 82
                CONTEXT.data.magnetPosY = 44;
                setTimeout(function() {CONTEXT.data.magnetPosY = 82;}, 1000);
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
