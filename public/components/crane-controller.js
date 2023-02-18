//the component that allows the player to control the crane's motions using WASD and SPACE

AFRAME.registerComponent('crane-controller', {
    schema: {
        rotation: {type: 'number', default: 0},
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
        crane1.setAttribute('rotation', {x: 0, y: CONTEXT.data.rotation, z: 0});
    },

    onKeydown: function(evt) {
        const CONTEXT = this;

        if (evt.keyCode === 87 || evt.keyCode === 38) { //W or UP
        }

        if (evt.keyCode === 65 || evt.keyCode === 37) { //A or LEFT
            CONTEXT.data.rotation += 1;
        }

        if (evt.keyCode === 83 || evt.keyCode === 40) { //S or DOWN
        }

        if (evt.keyCode === 68 || evt.keyCode === 39) { //D or RIGHT
            CONTEXT.data.rotation -= 1;
        }

        if (evt.keyCode === 32) { //SPACE
        }
    },

    remove: function() {
        CONTEXT.removeEventListeners();
    }
});
