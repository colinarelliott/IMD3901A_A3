//the component that allows the player to control the crane's motions using WASD and SPACE

AFRAME.registerComponent('crane-controller', {
    schema: {
        rotation: {type: 'number', default: -120},
        magnetPosX: {type: 'number', default: 65},
    },
    init: function () {
        const CONTEXT = this;
        CONTEXT.onKeydown = CONTEXT.onKeydown.bind(CONTEXT);
        //const crane1 = document.querySelector('#crane1');

        window.addEventListener('keydown', CONTEXT.onKeydown);
    },

    tick: function () {
        const CONTEXT = this;
        const crane1 = document.querySelector('#crane1');
        const magnet1 = document.querySelector('#crane-magnet1');
        //animate the crane to the new rotation
        crane1.setAttribute('animation', {property: 'rotation', to: {x: 0, y: CONTEXT.data.rotation, z: 0}, dur: 100});

        //animate the magnet to the new position
        magnet1.setAttribute('animation', {property: 'position', to: {x: CONTEXT.data.magnetPosX, y: 82, z: 0}, dur: 100});
    },

    onKeydown: function(evt) {
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
                break;
            default:
                break;
        }
    },

    remove: function() {
        CONTEXT.removeEventListeners();
    }
});
