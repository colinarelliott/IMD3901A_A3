//the component that allows the player to control the crane's motions using WASD and SPACE

AFRAME.registerComponent('crane-controller', {
    schema: {
        rotation: {type: 'number', default: -90},
        magnetPosX: {type: 'number', default: 67},
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
        magnet1.setAttribute('position', CONTEXT.data.magnetPosX + ' 82 0');
    },

    onKeydown: function(evt) {
        const CONTEXT = this;
        switch(evt.keyCode) {
            case 87: //W
                CONTEXT.data.magnetPosX += 1;
                break;
            case 38: //UP
                CONTEXT.data.magnetPosX += 1;
                break;
            case 65: //A
                CONTEXT.data.rotation += 1;
                break;
            case 37: //LEFT
                CONTEXT.data.rotation += 1;
                break;
            case 83: //S
                CONTEXT.data.magnetPosX -= 1;
                break;
            case 40: //DOWN
                CONTEXT.data.magnetPosX -= 1;
                break;
            case 68: //D
                CONTEXT.data.rotation -= 1;
                break;
            case 39: //RIGHT
                CONTEXT.data.rotation -= 1;
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
