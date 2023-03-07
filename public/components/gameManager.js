AFRAME.registerComponent('game-manager', { 
    schema: {
        //all of these variables are shared between the two clients
        gameStarted: {type: 'boolean', default: false},
        gameType: {type: 'string', oneOf: 'collaborative, competitive', default: 'competitive'},
        crane1Dock: {type: 'vec2', default: {x: -211, y: -179}},
        crane2Dock: {type: 'vec2', default: {x: -31, y: 1}},
        crane1Center: {type: 'vec2', default: {x: -111, y: -74}},
        crane2Center: {type: 'vec2', default: {x: 59, y: 106}},
        crane1PutdownAllowed: {type: 'boolean', default: false},
        crane2PutdownAllowed: {type: 'boolean', default: false},
        crane1PickupAllowed: {type: 'boolean', default: true},
        crane2PickupAllowed: {type: 'boolean', default: true},
    },
    init: function () {
        console.log("gameManager component initialized");
        const CONTEXT = this;
        setTimeout( function() { // after 200ms, grab the craneController component (give it time to load) and then set up the socket events for syncing data
            const craneController = document.querySelector('[crane-controller]').components['crane-controller'];

            setInterval( function() {
                craneController.socket.emit('syncGameManager', CONTEXT.data);
            }, 50);

            //RECEIVE SYNC EVENT
            craneController.socket.addEventListener('syncGameManager', (data) => {
                CONTEXT.data = data;
            });
        }, 200);
        //bind functions to the context of the component
        CONTEXT.collaborativeInit = CONTEXT.collaborativeInit.bind(CONTEXT);
        CONTEXT.competitiveInit = CONTEXT.competitiveInit.bind(CONTEXT);

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
        //set the gameStarted variable to true
        CONTEXT.data.gameStarted = true;
    },

    competitiveInit: function () {
        const CONTEXT = this;
        //set the gameStarted variable to true
        CONTEXT.data.gameStarted = true;

    },

    tick: function () {
        const CONTEXT = this;
        const craneController = document.querySelector('[crane-controller]').components['crane-controller'];

        //SET THE PICKUP ZONE VARIABLES
        
        //check if game is started
        if (CONTEXT.data.gameStarted === true) {
            //check gamemode
            if (CONTEXT.data.gameType === "collaborative") {
                //if the crane is #1
                if (craneController.data.craneToControl === 1) {
                    //if the crane is in the dropoff zone, allow the player to drop off cargo
                    if (CONTEXT.data.crane1Dock.x < craneController.data.rotation && CONTEXT.data.crane1Dock.y > craneController.data.rotation) {
                        CONTEXT.data.crane1PickupAllowed = true;
                    } else {
                        CONTEXT.data.crane1PickupAllowed = false; //if it's not in the dropoff zone, no putdown is allowed
                    }
                    //if the crane is in the pickup zone, allow the player to pick up cargo
                    if (CONTEXT.data.crane1Center.x < craneController.data.rotation && CONTEXT.data.crane1Center.y > craneController.data.rotation) {
                        CONTEXT.data.crane1PutdownAllowed = true;
                    } else {
                        CONTEXT.data.crane1PutdownAllowed = false; //if it's not in the pickup zone, no pickup is allowed
                    }
                }

                if (craneController.data.craneToControl === 2) {
                    //if the crane is in the dropoff zone, allow the player to drop off cargo
                    if (CONTEXT.data.crane2Dock.x < craneController.data.rotation && CONTEXT.data.crane2Dock.y > craneController.data.rotation) {
                        CONTEXT.data.crane2PickupAllowed = true;
                    } else {
                        CONTEXT.data.crane2PickupAllowed = false; //if it's not in the dropoff zone, no putdown is allowed
                    }

                    //if the crane is in the pickup zone, allow the player to pick up cargo
                    if (CONTEXT.data.crane2Center.x < craneController.data.rotation && CONTEXT.data.crane2Center.y > craneController.data.rotation) {
                        CONTEXT.data.crane2PutdownAllowed = true;
                    } else {
                        CONTEXT.data.crane2PutdownAllowed = false; //if it's not in the pickup zone, no pickup is allowed
                    }
                }
            }

            //check gamemode
            if (CONTEXT.data.gameType === "competitive") {
                //if the crane is #1
                if(craneController.data.craneToControl === 1) {
                    //if the crane is in the dropoff zone, allow the player to drop off cargo
                    if (CONTEXT.data.crane1Center.x < craneController.data.rotation && CONTEXT.data.crane1Center.y > craneController.data.rotation) {
                        CONTEXT.data.crane1PickupAllowed = true;
                    } else {
                        CONTEXT.data.crane1PickupAllowed = false; //if it's not in the dropoff zone, no putdown is allowed
                    }
                    //if the crane is in the pickup zone, allow the player to pick up cargo
                    if (CONTEXT.data.crane1Dock.x < craneController.data.rotation && CONTEXT.data.crane1Dock.y > craneController.data.rotation) {
                        CONTEXT.data.crane1PutdownAllowed = true;
                    } else {
                        CONTEXT.data.crane1PutdownAllowed = false; //if it's not in the pickup zone, no pickup is allowed
                    }
                }

                //check if the crane is #2
                if (craneController.data.craneToControl === 2) {
                    //if the crane is in the dropoff zone, allow the player to drop off cargo
                    if (CONTEXT.data.crane2Center.x < craneController.data.rotation && CONTEXT.data.crane2Center.y > craneController.data.rotation) {
                        CONTEXT.data.crane2PickupAllowed = true;
                    } else {
                        CONTEXT.data.crane2PickupAllowed = false; //if it's not in the dropoff zone, no putdown is allowed
                    }
                    //if the crane is in the pickup zone, allow the player to pick up cargo
                    if (CONTEXT.data.crane2Dock.x < craneController.data.rotation && CONTEXT.data.crane2Dock.y > craneController.data.rotation) {
                        CONTEXT.data.crane2PutdownAllowed = true;
                    } else {
                        CONTEXT.data.crane2PutdownAllowed = false; //if it's not in the pickup zone, no pickup is allowed
                    }
                }
            }
        }
    }
});