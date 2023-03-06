AFRAME.registerComponent('container-holder', {
    schema: {
        containerCount: {type: 'number', default: 0},
    },

    init : function () {
        const CONTEXT = this;
        CONTEXT.data.containerCount = 0;

        CONTEXT.addContainer = CONTEXT.addContainer.bind(CONTEXT);
        CONTEXT.removeContainer = CONTEXT.removeContainer.bind(CONTEXT);

        CONTEXT.el.addEventListener('addContainer', CONTEXT.addContainer);
        CONTEXT.el.addEventListener('removeContainer', CONTEXT.removeContainer);
    },

    tick: function () {
        const CONTEXT = this;
    },

    addContainer: function (container) {
        const CONTEXT = this;
        console.log("container added to "+ CONTEXT.el.id);
        //add one to the containerCount
        CONTEXT.data.containerCount++;
        console.log("container added, total: " + CONTEXT.data.containerCount);

        let containerID = container.getAttribute('id');

        let containerToAdd = document.querySelector('#'+containerID);

        //append the incoming container to the cargo ship
        CONTEXT.el.appendChild(containerToAdd);
    },

    removeContainer: function (containerID) {
        const CONTEXT = this;
        CONTEXT.data.containerCount--;
        console.log("container removed, total: " + CONTEXT.data.containerCount);
    },
});