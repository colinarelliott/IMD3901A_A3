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

            //RECEIVE START GAME EVENT
            craneController.socket.addEventListener('startGame', (data) => {
                CONTEXT.data.gameType = data.gameType;
                //set the game started variable
                CONTEXT.data.gameStarted = true;
                //call the initial generation of containers function
                setTimeout( function() { //wait for the data to sync
                    let CHs = document.querySelectorAll('[container-holder]');
                    CHs.forEach( function(CH) {
                        CH.components['container-holder'].firstContainerSpawns();
                    });
                }, 100);
                //remove the menu items
                p1Text.parentNode.removeChild(p1Text);
                collaborativeGame.parentNode.removeChild(collaborativeGame);
                competitiveGame.parentNode.removeChild(competitiveGame);
            });

        }, 200);

        //draw the new game screen
        setTimeout( function() { //wait for craneController to load
            const craneController = document.querySelector('[crane-controller]').components['crane-controller'];
            const camera = document.querySelector('#camera');

            if (craneController.data.craneToControl === 1) {
                //send P1 the new game menu
                let competitiveGame = document.createElement('a-entity');
                competitiveGame.setAttribute('id', 'competitiveGame');
                competitiveGame.setAttribute('class', 'menuItem');
                competitiveGame.setAttribute('geometry', 'primitive: plane; width: 0.075; height: 0.075');
                competitiveGame.setAttribute('material', 'color: #006699; transparent: true; opacity: 0.5');
                competitiveGame.setAttribute('position', '-0.04 0 -0.1');
                competitiveGame.setAttribute('visible', 'true');
                competitiveGame.setAttribute('text', 'value: Competitive Game; align: center; color: #ffffff; width: 0.075; height: 0.075; wrapCount: 20; zOffset: 0.01');
                camera.appendChild(competitiveGame);

                let collaborativeGame = document.createElement('a-entity');
                collaborativeGame.setAttribute('id', 'collaborativeGame');
                collaborativeGame.setAttribute('class', 'menuItem');
                collaborativeGame.setAttribute('geometry', 'primitive: plane; width: 0.075; height: 0.075');
                collaborativeGame.setAttribute('material', 'color: #669900; transparent: true; opacity: 0.5');
                collaborativeGame.setAttribute('position', '0.04 0 -0.1');
                collaborativeGame.setAttribute('visible', 'true');
                collaborativeGame.setAttribute('text', 'value: Collaborative Game; align: center; color: #ffffff; width: 0.075; height: 0.075; wrapCount: 20; zOffset: 0.01');
                camera.appendChild(collaborativeGame);

                let p1Text = document.createElement('a-entity');
                p1Text.setAttribute('id', 'p1Text');
                p1Text.setAttribute('geometry', 'primitive: plane; width: 0.15; height: 0.025');
                p1Text.setAttribute('material', 'color: #000000; transparent: true; opacity: 0.5');
                p1Text.setAttribute('position', '0 0.05 -0.1');
                p1Text.setAttribute('visible', 'true');
                p1Text.setAttribute('text', 'value: Welcome to Cargo Cranes. Please click a game type.; align: center; color: #ffffff; width: 0.075; height: 0.0375; wrapCount: 25; zOffset: 0.01');
                camera.appendChild(p1Text);

                collaborativeGame.addEventListener('click', function() { //when the player clicks the collaborative game button
                    //set the game type
                    CONTEXT.data.gameType = "collaborative";
                    //set the game started variable
                    CONTEXT.data.gameStarted = true;
                    craneController.socket.emit('syncGameManager', CONTEXT.data); //resync the data with the server
                    //call the initial generation of containers function
                    setTimeout( function() { //wait for the data to sync
                        let CHs = document.querySelectorAll('[container-holder]');
                        CHs.forEach( function(CH) {
                            CH.components['container-holder'].firstContainerSpawns(); //all container holders will spawn their first containers
                        });
                    }, 100);
                    //remove the menu items
                    p1Text.parentNode.removeChild(p1Text);
                    collaborativeGame.parentNode.removeChild(collaborativeGame);
                    competitiveGame.parentNode.removeChild(competitiveGame);

                    craneController.socket.emit('startGame', {
                        gameType: CONTEXT.data.gameType
                    }); //tell the server to start the game
                });

                competitiveGame.addEventListener('click', function() { //when the player clicks the competitive game button
                    //set the game type
                    CONTEXT.data.gameType = "competitive";
                    //set the game started variable
                    CONTEXT.data.gameStarted = true;
                    //call the initial generation of containers function
                    setTimeout( function() { //wait for the data to sync
                        let CHs = document.querySelectorAll('[container-holder]');
                        CHs.forEach( function(CH) {
                            CH.components['container-holder'].firstContainerSpawns();
                        });
                    }, 100);
                    //remove the menu items
                    p1Text.parentNode.removeChild(p1Text);
                    collaborativeGame.parentNode.removeChild(collaborativeGame);
                    competitiveGame.parentNode.removeChild(competitiveGame);

                    craneController.socket.emit('startGame', {
                        gameType: CONTEXT.data.gameType
                    }); //tell the server to start the game
                });
            }

            if (craneController.data.craneToControl === 2) { //if the player is crane #2
                //send P2 the new game menu
                let p2Text = document.createElement('a-entity');
                p2Text.setAttribute('id', 'p2Text');
                p2Text.setAttribute('geometry', 'primitive: plane; width: 0.15; height: 0.025');
                p2Text.setAttribute('material', 'color: #000000; transparent: true; opacity: 0.5');
                p2Text.setAttribute('position', '0 0.05 -0.1');
                p2Text.setAttribute('visible', 'true');
                p2Text.setAttribute('text', 'value: Waiting for player 1 to select a game type.; align: center; color: #ffffff; width: 0.075; height: 0.0375; wrapCount: 25; zOffset: 0.01');
                camera.appendChild(p2Text);
            }
        }, 200);
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