AFRAME.registerComponent('container-holder', { //this component is attached to the cargo ships and holds the container count for each cargo ship
    schema: {
        containerCount: {type: 'number', default: 0},
        containers: {type: 'array', default: []}
    },

    init : function () {
        const CONTEXT = this;
        const craneController = document.querySelector('[crane-controller]').components['crane-controller'];
        const gameManager = document.querySelector('[game-manager]').components['game-manager'];

        CONTEXT.addContainer = CONTEXT.addContainer.bind(CONTEXT);
        CONTEXT.removeContainer = CONTEXT.removeContainer.bind(CONTEXT);
        CONTEXT.updateServer = CONTEXT.updateServer.bind(CONTEXT);
        CONTEXT.containerStateChange = CONTEXT.containerStateChange.bind(CONTEXT);
        CONTEXT.firstContainerSpawns = CONTEXT.firstContainerSpawns.bind(CONTEXT);

        //update the containerCount across all clients for this cargo ship
        craneController.socket.addEventListener('updateContainerCount', function (event) {
            if (event.cargoShipId === CONTEXT.el.id) {
                CONTEXT.data.containerCount = event.containerCount;
            }
        });

        setInterval(CONTEXT.updateServer, 50); //update the server every 50ms
    },

    containerStateChange: function () {
        const CONTEXT = this;
        let destroyAllContainers = document.querySelector('.shippingContainer');

        let cargoShipA = document.querySelector('#cargoShipA');
        let cargoShipB = document.querySelector('#cargoShipB');
        let cargoShipC = document.querySelector('#cargoShipC');

        if (destroyAllContainers !== null) { //if there are containers in the scene
            for (let i = 0; i < destroyAllContainers.length; i++) {
                let c = destroyAllContainers[i];
                c.parentNode.removeChild(c);
            } //destroy all containers
        }

        //create the containers for each cargo ship
        if (CONTEXT.el.id === cargoShipA.id) {
            for (i = 0; i < CONTEXT.data.containerCount; i++) {
                let container = document.createElement('a-entity');
                container.setAttribute('id', 'container' + i); //give the container an id between 0 and 4
                container.setAttribute('class', 'onCargoShip');
                container.setAttribute('position', {x: -0.65+(i*-0.1), y: 0.8, z: -0.1});
                container.setAttribute('rotation', {x: 0, y: 0, z: 0});
                container.setAttribute('scale', {x: 0.02, y: 0.02, z: 0.02});
                container.setAttribute('gltf-model', '#blue-container-model');
                container.setAttribute('material', {color: '#ffffff'});
                scene.appendChild(container);
                CONTEXT.data.containers.push(container);
            }
        }

        if (CONTEXT.el.id === cargoShipB.id) {
            for (i = 0; i < CONTEXT.data.containerCount; i++) {
                let container = document.createElement('a-entity');
                container.setAttribute('id', 'container' + i+5); //give the container an id between 5 and 9
                container.setAttribute('class', 'onCargoShip');
                container.setAttribute('position', {x: -0.65+(i*-0.1), y: 0.75, z: 1});
                container.setAttribute('rotation', {x: 0, y: 0, z: 0});
                container.setAttribute('scale', {x: 0.02, y: 0.02, z: 0.02});
                container.setAttribute('gltf-model', '#blue-container-model');
                container.setAttribute('material', {color: '#ffffff'});
                scene.appendChild(container);
                CONTEXT.data.containers.push(container);
            }
        }

        if (CONTEXT.el.id === cargoShipC.id) {
            for (i = 0; i < CONTEXT.data.containerCount; i++) {
                let container = document.createElement('a-entity');
                container.setAttribute('id', 'container' + i+10); //give the container an id between 10 and 14
                container.setAttribute('class', 'onCargoShip');
                container.setAttribute('position', {x: -0.4+(i*-0.05), y: 0.85, z: 0.43});
                container.setAttribute('rotation', {x: 0, y: 0, z: 0});
                container.setAttribute('scale', {x: 0.02, y: 0.02, z: 0.02});
                container.setAttribute('gltf-model', '#blue-container-model');
                container.setAttribute('material', {color: '#ffffff'});
                scene.appendChild(container);
                CONTEXT.data.containers.push(container); //add each container to the array local to it's cargo ship
            }
        }
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
        //add one to the containerCount
        CONTEXT.data.containerCount++;

        if (!CONTEXT.data.containers.includes(container)) { //if the container is not already in the array 
            CONTEXT.data.containers.push(container); //add the container to the array
        }

        CONTEXT.containerStateChange();
    },

    removeContainer: function () {
        const CONTEXT = this;
        //remove one from the containerCount
        CONTEXT.data.containerCount--;

        CONTEXT.data.containers.pop(); //remove the container from the array
        
        CONTEXT.containerStateChange();
    },

    firstContainerSpawns: function () {
        const CONTEXT = this;
        gameManager = document.querySelector('[game-manager]').components['game-manager'];

        //get the three cargo ships
        let cargoShipA = document.querySelector('#cargoShipA');
        let cargoShipB = document.querySelector('#cargoShipB');
        let cargoShipC = document.querySelector('#cargoShipC');

        //set the container count for each cargo ship based on the game type
        if (gameManager.data.gameType === "collaborative") {
            if (CONTEXT.el.id === cargoShipA.id) {
                CONTEXT.data.containerCount = 5;
            }
            if (CONTEXT.el.id === cargoShipB.id) {
                CONTEXT.data.containerCount = 5;
            }
            if (CONTEXT.el.id === cargoShipC.id) {
                CONTEXT.data.containerCount = 0;
            }
        } else { //if the game is competitive
            if (CONTEXT.el.id === cargoShipA.id) {
                CONTEXT.data.containerCount = 0;
            }
            if (CONTEXT.el.id === cargoShipB.id) {
                CONTEXT.data.containerCount = 0;
            }
            if (CONTEXT.el.id === cargoShipC.id) {
                CONTEXT.data.containerCount = 5;
            }
        }
        CONTEXT.containerStateChange(); //call the containerStateChange function after 100ms

        let addPickupFlag = document.querySelectorAll('.onCargoShip');

        if (addPickupFlag !== null) {
            for (i=0; i<addPickupFlag.length; i++) {
                let c = addPickupFlag[i];
                c.setAttribute('class', 'shippingContainer');
            }
        }
    },
});