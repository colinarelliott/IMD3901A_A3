AFRAME.registerComponent('container-holder', {
    schema: {
        containerCount: {type: 'number', default: 0},

    },
    initialize: function () {
        const CONTEXT = this;
        CONTEXT.data.containerCount = 0;
        CONTEXT.el.addEventListener('containerPlaced', function (evt) {
            CONTEXT.data.containerCount += 1;
        });
        CONTEXT.el.addEventListener('containerRemoved', function (evt) {
            CONTEXT.data.containerCount -= 1;
        });
    },
});