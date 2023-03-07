AFRAME.registerComponent('container-holder', {
    schema: {
        containerCount: {type: 'number', default: 0},
    },

    init : function () {
        const CONTEXT = this;
        const craneController = document.querySelector('[crane-controller]').components['crane-controller'];
        CONTEXT.data.containerCount = 0;
        CONTEXT.addContainer = CONTEXT.addContainer.bind(CONTEXT);
        CONTEXT.removeContainer = CONTEXT.removeContainer.bind(CONTEXT);
        CONTEXT.updateServer = CONTEXT.updateServer.bind(CONTEXT);

        //update the containerCount across all clients for this cargo ship
        craneController.socket.addEventListener('updateContainerCount', function (event) {
            if (event.cargoShipId === CONTEXT.el.id) {
                CONTEXT.data.containerCount = event.containerCount;
            }
        });
        setInterval(CONTEXT.updateServer, 100);
    },

    tick: function () {
        const CONTEXT = this;
    },

    updateServer: function () {
        const CONTEXT = this;
        const craneController = document.querySelector('[crane-controller]').components['crane-controller'];
        let containerCount = CONTEXT.data.containerCount;
        craneController.socket.emit('updateContainerCount', {
            containerCount: containerCount,
            cargoShipId: CONTEXT.el.id
        });
    },

    addContainer: function () {
        const CONTEXT = this;
        console.log("container added to "+ CONTEXT.el.id);
        //add one to the containerCount
        CONTEXT.data.containerCount++;
    },

    removeContainer: function () {
        const CONTEXT = this;
        CONTEXT.data.containerCount--;
        console.log("container removed, total: " + CONTEXT.data.containerCount);
    },
});