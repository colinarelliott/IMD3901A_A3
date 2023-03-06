AFRAME.registerComponent('game-manager', { 
    schema: {
        gameStarted: {type: 'boolean', default: false},
        gameType: {type: 'string', oneOf: 'collaborative, competitive', default: 'collaborative'},
        shipDropoffRotation1: {type: 'vec2', default: {x: -210, y: -180}}, //less than is valid
        shipDropoffRotation2: {type: 'vec2', default: {x: -30, y: 0}}, //less than is valid
        shipDropoff1: {type: 'boolean', default: false},
        shipDropoff2: {type: 'boolean', default: false},
    },
    init: function () {
        console.log("gameManager component initialized");
        const CONTEXT = this;
        //bind functions to the context of the component
        CONTEXT.collaborativeInit = CONTEXT.collaborativeInit.bind(CONTEXT);
        CONTEXT.competitiveInit = CONTEXT.competitiveInit.bind(CONTEXT);
        CONTEXT.spawnContainers = CONTEXT.spawnContainers.bind(CONTEXT);

        CONTEXT.data.gameType = 'collaborative'; //set the game type to collaborative by default
        

        //create a UI that prompts the user to choose between collaborative and competitive gamemodes
        /*
        const gameTypeUI = document.createElement('a-entity');
        gameTypeUI.setAttribute('id', 'gameTypeUI');
        gameTypeUI.setAttribute('position', {x: 0, y: 0, z: 0});
        gameTypeUI.setAttribute('rotation', {x: 0, y: 0, z: 0});
        gameTypeUI.setAttribute('scale', {x: 1, y: 1, z: 1});
        gameTypeUI.setAttribute('geometry', {primitive: 'plane', width: 1, height: 1});
        gameTypeUI.setAttribute('material', {color: '#000000', opacity: 0.5});
        gameTypeUI.setAttribute('text', {value: 'Choose a gamemode', align: 'center', width: 1, color: '#ffffff'});
        CONTEXT.el.appendChild(gameTypeUI);*/

        if (CONTEXT.data.gameType === 'collaborative') {
            CONTEXT.collaborativeInit();
        } 
        if (CONTEXT.data.gameType === 'competitive') {
            CONTEXT.competitiveInit();
        }

    },

    collaborativeInit: function () {
        const CONTEXT = this;
        //get the cargo ships
        const cargoShipA = document.querySelector('#cargoShipA');
        const cargoShipB = document.querySelector('#cargoShipB');
        const cargoShipC = document.querySelector('#cargoShipC');
        //set rotation of crane dependent dropoff zones (a range where the player can drop off cargo)
        CONTEXT.data.shipDropoffRotation1 = {x: -210, y: -180};
        CONTEXT.data.shipDropoffRotation2 = {x: -30, y: 0};

        //set visibility of cargo ships
        cargoShipA.setAttribute('visible', false);
        cargoShipB.setAttribute('visible', false);
        cargoShipC.setAttribute('visible', true);

        //set the gameStarted variable to true
        CONTEXT.data.gameStarted = true;

        CONTEXT.spawnContainers("collaborative");
    },

    competitiveInit: function () {
        const CONTEXT = this;
        //get the cargo ships
        const cargoShipA = document.querySelector('#cargoShipA');
        const cargoShipB = document.querySelector('#cargoShipB');
        const cargoShipC = document.querySelector('#cargoShipC');
        //set rotation of crane dependent dropoff zones (a range where the player can drop off cargo)
        CONTEXT.data.shipDropoffRotation1 = {x: -120, y: -90};
        CONTEXT.data.shipDropoffRotation2 = {x: 60, y: 90};

        //set visibility of cargo ships
        cargoShipA.setAttribute('visible', true);
        cargoShipB.setAttribute('visible', true);
        cargoShipC.setAttribute('visible', false);

        //set the gameStarted variable to true
        CONTEXT.data.gameStarted = true;

        CONTEXT.spawnContainers("competitive");
    },

    spawnContainers: function (gameType) {
        const CONTEXT = this;
        const scene = document.querySelector('#scene');
        if (gameType === 'collaborative') {
            for (let i = 0; i < 5; i++) {
                const container = document.createElement('a-entity');
                container.setAttribute('id', 'container' + i*(Math.floor((Math.random() * (1000)) + 1)));
                container.setAttribute('class', 'shippingContainer');
                container.setAttribute('position', {x: -0.5+(i*-0.1), y: 0.75, z: -0.2});
                container.setAttribute('rotation', {x: 0, y: 0, z: 0});
                container.setAttribute('scale', {x: 0.02, y: 0.02, z: 0.02});
                container.setAttribute('gltf-model', '#blue-container-model');
                container.setAttribute('material', {color: '#ffffff'});
                scene.appendChild(container);
            }

            for (let i = 0; i < 5; i++) {
                const container = document.createElement('a-entity');
                container.setAttribute('id', 'container' + i*(Math.floor((Math.random() * (1000)) + 1)));
                container.setAttribute('class', 'shippingContainer');
                container.setAttribute('position', {x: -0.5+(i*-0.1), y: 0.75, z: 0.9});
                container.setAttribute('rotation', {x: 0, y: 0, z: 0});
                container.setAttribute('scale', {x: 0.02, y: 0.02, z: 0.02});
                container.setAttribute('gltf-model', '#blue-container-model');
                container.setAttribute('material', {color: '#ffffff'});
                scene.appendChild(container);
            }
        }
        if (gameType === 'competitive') {
            for (let i=0; i<10; i++) {
                const container = document.createElement('a-entity');
                container.setAttribute('id', 'container' + i*(Math.floor((Math.random() * (1000)) + 1)));
                container.setAttribute('class', 'shippingContainer');
                container.setAttribute('position', {x: -0.5+(i*-0.1), y: 0.75, z: 0.5});
                container.setAttribute('rotation', {x: 0, y: 0, z: 0});
                container.setAttribute('scale', {x: 0.02, y: 0.02, z: 0.02});
                container.setAttribute('gltf-model', '#blue-container-model');
                container.setAttribute('material', {color: '#ffffff'});
                scene.appendChild(container);
            }
        }
    },


    tick: function () {
        const CONTEXT = this;
        const craneController = document.querySelector('[crane-controller]').components['crane-controller'];
        //check if crane1 is in the correct rotation to drop off cargo
        if (CONTEXT.data.shipDropoffRotation1.x <= craneController.data.rotation && CONTEXT.data.shipDropoffRotation1.y >= craneController.data.rotation) {
            CONTEXT.data.shipDropoff1 = true; } //set the shipDropoff1 variable accordingly
            else { CONTEXT.data.shipDropoff1 = false; 
        }
        //check if crane2 is in the correct rotation to drop off cargo
        if (CONTEXT.data.shipDropoffRotation2.x <= craneController.data.otherRotation && CONTEXT.data.shipDropoffRotation2.y >= craneController.data.rotation) {
            CONTEXT.data.shipDropoff2 = true; } //set the shipDropoff2 variable accordingly
            else { CONTEXT.data.shipDropoff2 = false;
        }
    }
});