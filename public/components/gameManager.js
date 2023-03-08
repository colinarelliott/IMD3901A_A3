AFRAME.registerComponent('game-manager', { 
    schema: {
        //all of these variables are shared between the two clients
        gameStarted: {type: 'boolean', default: false},
        gameType: {type: 'string', oneOf: 'collaborative, competitive', default: 'competitive'},
        crane1Dock: {type: 'vec2', default: {x: -215, y: -175}},
        crane2Dock: {type: 'vec2', default: {x: -35, y: 5}},
        crane1Center: {type: 'vec2', default: {x: -105, y: -70}},
        crane2Center: {type: 'vec2', default: {x: 45, y: 110}},
        crane1PutdownAllowed: {type: 'boolean', default: false},
        crane2PutdownAllowed: {type: 'boolean', default: false},
        crane1PickupAllowed: {type: 'boolean', default: true},
        crane2PickupAllowed: {type: 'boolean', default: true},
        p1Score: {type: 'number', default: 0},
        p2Score: {type: 'number', default: 0},
        timer: {type: 'number', default: 0},
        timerStarted: {type: 'boolean', default: false},
        doOnce: {type: 'boolean', default: true},
    },
    init: function () {
        console.log("gameManager component initialized");
        const CONTEXT = this;
        CONTEXT.startTimer = CONTEXT.startTimer.bind(CONTEXT);
        CONTEXT.stopTimer = CONTEXT.stopTimer.bind(CONTEXT);
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

                if (data.gameType === 'collaborative') {
                    let instructions = document.createElement('a-entity');
                    instructions.setAttribute('id', 'instructions');
                    instructions.setAttribute('geometry', 'primitive: plane; width: 0.15; height: 0.025');
                    instructions.setAttribute('material', 'color: #000000; transparent: true; opacity: 0.5');
                    instructions.setAttribute('position', '0 0.05 -0.1');
                    instructions.setAttribute('visible', 'true');
                    instructions.setAttribute('text', 'value: Try to get all containers onto the center ship as fast as possible.; align: center; baseline: center; anchor: center; color: #ffffff; width: 0.075; height: 0.0375; wrapCount: 30; zOffset: 0.01');
                    camera.appendChild(instructions); //add instructions element to the camera
                }

                if (data.gameType === 'competitive') {
                    let instructions = document.createElement('a-entity');
                    instructions.setAttribute('id', 'instructions');
                    instructions.setAttribute('geometry', 'primitive: plane; width: 0.15; height: 0.025');
                    instructions.setAttribute('material', 'color: #000000; transparent: true; opacity: 0.5');
                    instructions.setAttribute('position', '0 0.05 -0.1');
                    instructions.setAttribute('visible', 'true');
                    instructions.setAttribute('text', 'value: Race to grab the most containers from the center ship.; align: center; baseline: center; anchor: center; color: #ffffff; width: 0.075; height: 0.0375; wrapCount: 30; zOffset: 0.01');
                    camera.appendChild(instructions); //add instructions element to the camera
                }
            });

        }, 200);

        //draw the new game screen
        setTimeout( function() { //wait for craneController to load
            const craneController = document.querySelector('[crane-controller]').components['crane-controller'];
            const camera = document.querySelector('#camera');

            //draw the game menu
            let competitiveGame = document.createElement('a-entity');
            competitiveGame.setAttribute('id', 'competitiveGame');
            competitiveGame.setAttribute('class', 'menuItem');
            competitiveGame.setAttribute('geometry', 'primitive: plane; width: 0.075; height: 0.075');
            competitiveGame.setAttribute('material', 'color: #006699; transparent: true; opacity: 0.5');
            competitiveGame.setAttribute('position', '-0.04 0 -0.1');
            competitiveGame.setAttribute('visible', 'true');
            competitiveGame.setAttribute('text', 'value: Competitive Game; align: center; color: #ffffff; width: 0.075; height: 0.075; wrapCount: 20; zOffset: 0.01');
            camera.appendChild(competitiveGame); //competitive game selection box

            let collaborativeGame = document.createElement('a-entity');
            collaborativeGame.setAttribute('id', 'collaborativeGame');
            collaborativeGame.setAttribute('class', 'menuItem');
            collaborativeGame.setAttribute('geometry', 'primitive: plane; width: 0.075; height: 0.075');
            collaborativeGame.setAttribute('material', 'color: #669900; transparent: true; opacity: 0.5');
            collaborativeGame.setAttribute('position', '0.04 0 -0.1');
            collaborativeGame.setAttribute('visible', 'true');
            collaborativeGame.setAttribute('text', 'value: Collaborative Game; align: center; color: #ffffff; width: 0.075; height: 0.075; wrapCount: 20; zOffset: 0.01');
            camera.appendChild(collaborativeGame); //collaborativeGame selection box

            let p1Text = document.createElement('a-entity');
            p1Text.setAttribute('id', 'p1Text');
            p1Text.setAttribute('geometry', 'primitive: plane; width: 0.15; height: 0.025');
            p1Text.setAttribute('material', 'color: #000000; transparent: true; opacity: 0.5');
            p1Text.setAttribute('position', '0 0.05 -0.1');
            p1Text.setAttribute('visible', 'true');
            p1Text.setAttribute('text', 'value: Welcome to Cargo Cranes. Please click a game type.; align: center; color: #ffffff; width: 0.075; height: 0.0375; wrapCount: 25; zOffset: 0.01');
            camera.appendChild(p1Text); //add p1Text element to the camera (title and welcome)

            collaborativeGame.addEventListener('click', function() { //when the player clicks the collaborative game button
                //set the game type
                CONTEXT.startTimer();
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

                let instructions = document.createElement('a-entity');
                instructions.setAttribute('id', 'instructions');
                instructions.setAttribute('geometry', 'primitive: plane; width: 0.15; height: 0.025');
                instructions.setAttribute('material', 'color: #000000; transparent: true; opacity: 0.5');
                instructions.setAttribute('position', '0 0.05 -0.1');
                instructions.setAttribute('visible', 'true');
                instructions.setAttribute('text', 'value: Try to get all containers onto the center ship as fast as possible.; align: center; baseline: center; anchor: center; color: #ffffff; width: 0.075; height: 0.0375; wrapCount: 30; zOffset: 0.01');
                camera.appendChild(instructions); //add instructions element to the camera

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

                let instructions = document.createElement('a-entity');
                instructions.setAttribute('id', 'instructions');
                instructions.setAttribute('geometry', 'primitive: plane; width: 0.15; height: 0.025');
                instructions.setAttribute('material', 'color: #000000; transparent: true; opacity: 0.5');
                instructions.setAttribute('position', '0 0.05 -0.1');
                instructions.setAttribute('visible', 'true');
                instructions.setAttribute('text', 'value: Race to grab the most containers from the center ship.; align: center; baseline: center; anchor: center; color: #ffffff; width: 0.075; height: 0.0375; wrapCount: 30; zOffset: 0.01');
                camera.appendChild(instructions); //add instructions element to the camera

                craneController.socket.emit('startGame', {
                    gameType: CONTEXT.data.gameType
                }); //tell the server to start the game
            });
        }, 200);
    },

    startTimer: function() {
        const CONTEXT = this;
        setInterval( function() {
            CONTEXT.data.timer++;
        }, 1000);
        CONTEXT.data.timerStarted = true;

        //add timer text
        let timerText = document.createElement('a-entity');
        timerText.setAttribute('id', 'timerText');
        timerText.setAttribute('material', 'color: #000000; transparent: true; opacity: 0.5');
        timerText.setAttribute('position', '0 -0.06 -0.1');
        timerText.setAttribute('visible', 'true');
        timerText.setAttribute('text', 'value: Time: '+CONTEXT.data.timer+'s; align: center; color: #ffffff; width: 0.075; height: 0.0375; wrapCount: 25; zOffset: 0.01');
        document.querySelector('#camera').appendChild(timerText); //add timerText element to the camera
    },

    stopTimer: function() {
        const CONTEXT = this;
        CONTEXT.data.timerStarted = false;
        let timerEndValue = CONTEXT.data.timer;
        CONTEXT.data.timer = 0;
        return timerEndValue;
    },

    tick: function () {
        const CONTEXT = this;
        const craneController = document.querySelector('[crane-controller]').components['crane-controller'];

        //start the timer if timer is true (sync measure)
        if (CONTEXT.doOnce === true) {
            if (craneController.data.craneToControl && CONTEXT.data.timerStarted === true) {
                CONTEXT.startTimer();
                CONTEXT.doOnce = false;
            }
        }

        if (document.querySelector('#timerText') !== null) {
            document.querySelector('#timerText').setAttribute('text', 'value: Time: '+CONTEXT.data.timer+'s; align: center; color: #ffffff; width: 0.075; height: 0.0375; wrapCount: 25; zOffset: 0.01');
        }

        //COLLABORATIVE END CONDITION
        if (CONTEXT.data.gameType === "collaborative") {
            let containerHolder = document.querySelector("#cargoShipC").components['container-holder'];
            if (containerHolder.data.containerCount === 10) {
                CONTEXT.data.gameStarted = false;
                let time = CONTEXT.stopTimer();
                let endText = document.createElement('a-entity'); //add end text
                endText.setAttribute('id', 'endText');
                endText.setAttribute('geometry', 'primitive: plane; width: 0.15; height: 0.025');
                endText.setAttribute('material', 'color: #000000; transparent: true; opacity: 0.5');
                endText.setAttribute('position', '0 0 -0.1');
                endText.setAttribute('visible', 'true');
                endText.setAttribute('text', 'value: Game over. Final time: '+time+'; align: center; baseline: center; anchor: center; color: #ffffff; width: 0.075; height: 0.0375; wrapCount: 30; zOffset: 0.01');
                camera.appendChild(endText);
            }
        }

        //COMPETITIVE END CONDITION
        if (CONTEXT.data.gameType === "competitive") {
            let chA = document.querySelector("#cargoShipA").components['container-holder'];
            let chB = document.querySelector("#cargoShipB").components['container-holder'];

            if ((chA.data.containerCount + chB.data.containerCount) === 5) { //if all containers have been grabbed

                //P1 WINS
                if (chA.data.containerCount > chB.data.containerCount) {
                    let endText = document.createElement('a-entity'); //add end text
                    endText.setAttribute('id', 'endText');
                    endText.setAttribute('geometry', 'primitive: plane; width: 0.15; height: 0.025');
                    endText.setAttribute('material', 'color: #000000; transparent: true; opacity: 0.5');
                    endText.setAttribute('position', '0 0 -0.1');
                    endText.setAttribute('visible', 'true');
                    endText.setAttribute('text', 'value: Game over. P1 wins!; align: center; baseline: center; anchor: center; color: #ffffff; width: 0.075; height: 0.0375; wrapCount: 30; zOffset: 0.01');
                    camera.appendChild(endText);
                }

                //P2 WINS
                if (chB.data.containerCount > chA.data.containerCount) {
                    let endText = document.createElement('a-entity'); //add end text
                    endText.setAttribute('id', 'endText');
                    endText.setAttribute('geometry', 'primitive: plane; width: 0.15; height: 0.025');
                    endText.setAttribute('material', 'color: #000000; transparent: true; opacity: 0.5');
                    endText.setAttribute('position', '0 0 -0.1');
                    endText.setAttribute('visible', 'true');
                    endText.setAttribute('text', 'value: Game over. P2 wins!; align: center; baseline: center; anchor: center; color: #ffffff; width: 0.075; height: 0.0375; wrapCount: 30; zOffset: 0.01');
                    camera.appendChild(endText);
                }
            }
        }

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