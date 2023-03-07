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
        /*
        //get all the children of the cargo ship
        let children = CONTEXT.el.children;
        //loop through the children
        for (let i = 0; i < children.length; i++) {
            //show the containers on the ship
            children[i].setAttribute('visible', true);
            //set the position of the containers on the ship
            children[i].setAttribute('position', {x: 0, y: 0.5, z: 0});
        }*/
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

    addContainer: function (container) {
        const CONTEXT = this;
        console.log("container added to "+ CONTEXT.el.id);
        //add one to the containerCount
        CONTEXT.data.containerCount++;
        console.log("container added, total: " + CONTEXT.data.containerCount);

        let containerID = container.getAttribute('id');

        let containerToAdd = document.querySelector('#'+containerID);
        let copy = containerToAdd.cloneNode(true);
        setTimeout(function () {
            copy.setAttribute('class', 'containerOnShip');
            copy.setAttribute('scale', {x: 1, y: 1, z: 1});
            copy.setAttribute('position', {x: 0, y: 5, z: 0});
            copy.setAttribute('rotation', {x: 0, y: 0, z: 0});
            copy.setAttribute('gltf-model', 'assets/models/blue-container.gltf');
            //append the incoming container to the cargo ship
            CONTEXT.el.appendChild(copy);
            //remove the incoming container
            containerToAdd.parentNode.removeChild(containerToAdd);
        }, 10);
    },

    removeContainer: function (containerID) {
        const CONTEXT = this;
        CONTEXT.data.containerCount--;
        console.log("container removed, total: " + CONTEXT.data.containerCount);
    },
});