//the component that allows the player to control the crane's motions using WASD and SPACE

AFRAME.registerComponent('crane-controller', {
    schema: {
    },
    init: function () {
        const CONTEXT = this;
        CONTEXT.onKeydown = CONTEXT.onKeydown.bind(CONTEXT);
        const crane1 = document.querySelector('#crane1');

        window.addEventListener('keydown', CONTEXT.onKeydown);
    },

    onKeydown: function(evt) {
        console.log(evt.keyCode);
    },

    remove: function() {
        CONTEXT.removeEventListeners();
    }
});
