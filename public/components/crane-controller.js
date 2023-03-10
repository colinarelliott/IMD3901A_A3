//the component that allows the player to control the crane's motions using WASD and SPACE
//and, using socket.io, handles events to and from the server to communicate data with the other player

AFRAME.registerComponent('crane-controller', {
    //required components
    dependencies: ['pickupContainer'],
    schema: {
        //the variables in here are specific to each player
        craneToControl: {type: 'number', default: 1}, //the crane that this player controls
        rotation: {type: 'number', default: -120}, //the rotation of the crane
        magnetPosX: {type: 'number', default: 65}, //the x position of the magnet (relative, parented to the crane)
        magnetPosY: {type: 'number', default: 80}, //the y position of the magnet (relative, parented to the crane)
        otherRotation: {type: 'number', default: 60}, //the rotation of the other crane
        otherMagnetPosX: {type: 'number', default: 65}, //the x position of the other magnet (relative, parented to the crane)
        otherMagnetPosY: {type: 'number', default: 80}, //the y position of the other magnet (relative, parented to the crane)
        doOnce: {type: 'boolean', default: true}, //a boolean that is used to only run specific code in the tick function once
    },
    init: function () {
        const CONTEXT = this;
        const pickupContainer = CONTEXT.el.components['pickupContainer']; //get the pickupContainer component
        const gameManager = document.querySelector('[game-manager]').components['game-manager']; //get the gameManager component
        CONTEXT.camera = document.querySelector('#camera'); //get the camera
        //bind the functions to the context of the component
        CONTEXT.onKeydown = CONTEXT.onKeydown.bind(CONTEXT); //this function will be executed on keydown
        CONTEXT.onKeyup = CONTEXT.onKeyup.bind(CONTEXT); //this function will be executed on keyup
        CONTEXT.pickupContainerEvent = CONTEXT.pickupContainerEvent.bind(CONTEXT); //this function will be executed when the pickupContainer event is received
        CONTEXT.putdownContainerEvent = CONTEXT.putdownContainerEvent.bind(CONTEXT); //this function will be executed when the putdownContainer event is received
        CONTEXT.socket = io(); //connect to the server

        window.addEventListener('keydown', CONTEXT.onKeydown); //add the keydown event listener
        window.addEventListener('keyup', CONTEXT.onKeyup); //add the keyup event listener
        CONTEXT.el.addEventListener('pickupContainer', CONTEXT.pickupContainerEvent); //add the pickupContainer event listener
        //debug connect and disconnect logs
        CONTEXT.socket.on('connect', (userData) => {
            console.log("I have connected to the server!");
        });
        
        CONTEXT.socket.on('disconnect', () => {
            console.log("I have disconnected from the server!");
        });

        //receive welcome event from the server with player number, set the craneToControl variable to the player number
        setTimeout( function() {
            CONTEXT.socket.once('welcome', (playerCount) => {
                console.log("You are player " + playerCount);
                //create and append the player number text to the camera
                let playerNumberText = document.createElement('a-entity');
                playerNumberText.setAttribute('id', 'playerNumberText');
                playerNumberText.setAttribute('position', '-0.07 0.075 -0.1');
                playerNumberText.setAttribute('text', 'value: P' + playerCount + '; color: white; align: center; width: 0.2');
                CONTEXT.camera.appendChild(playerNumberText);
                CONTEXT.data.craneToControl = playerCount;
                console.log("You are controlling crane " + CONTEXT.data.craneToControl); 
            });
        }), 100; //wait 100ms before setting up the welcome event listener

        CONTEXT.socket.on('updateCrane', (data) => {
            //update the other crane's position
            if (data.craneToControl === 1 && CONTEXT.data.craneToControl === 2) {
                CONTEXT.data.otherRotation = data.rotation;
                CONTEXT.data.otherMagnetPosX = data.magnetPosX;
                CONTEXT.data.otherMagnetPosY = data.magnetPosY;
            }
            if (data.craneToControl === 2 && CONTEXT.data.craneToControl === 1) {
                CONTEXT.data.otherRotation = data.rotation;
                CONTEXT.data.otherMagnetPosX = data.magnetPosX;
                CONTEXT.data.otherMagnetPosY = data.magnetPosY;
            }
        });

        //receive the pickupContainer event from the server
        CONTEXT.socket.on('pickupContainer', (data) => {

            //if the event is from crane 1 and this player is controlling crane 2, pickup the container with the other crane
            if (data.magnetNumber === 1 && CONTEXT.data.craneToControl === 2) {
                pickupContainer.pickupSpecified( {
                    craneNum: data.magnetNumber,
                    containerID: data.containerToPickup,
                });
            }
            //if the event is from crane 2 and this player is controlling crane 1, pickup the container with the other crane
            if (data.magnetNumber === 2 && CONTEXT.data.craneToControl === 1) {
                pickupContainer.pickupSpecified( {
                    craneNum: data.magnetNumber,
                    containerID: data.containerToPickup,
                });
            }
        });

        CONTEXT.socket.on('putdownContainer', (data) => {
            //if the event is from crane 1 and this player is controlling crane 2, putdown the container with the other crane
            if (data.craneNum === 1 && CONTEXT.data.craneToControl === 2) {
                pickupContainer.putdownSpecified( {
                    containerID: data.containerID,
                    cargoShipID: data.cargoShipID,
                });
            }
            //if the event is from crane 2 and this player is controlling crane 1, putdown the container with the other crane
            if (data.craneNum === 2 && CONTEXT.data.craneToControl === 1) {
                pickupContainer.putdownSpecified( {
                    containerID: data.containerID,
                    cargoShipID: data.cargoShipID,

            });
            }
        });   

        setInterval(function() {
            //update the crane's position to the server
            CONTEXT.socket.emit('updateCrane', CONTEXT.data);
        }, 50); //update the crane's position every 50ms

    },

    tick: function () {
        const CONTEXT = this;

        //instantiate crane controls for both cranes
        let crane = document.querySelector('#crane'+CONTEXT.data.craneToControl);
        let magnet = document.querySelector('#crane-magnet'+CONTEXT.data.craneToControl);
        let cable = document.querySelector('#magnet-cable'+CONTEXT.data.craneToControl);
        let otherCrane = document.querySelector('#crane'+(CONTEXT.data.craneToControl+1));
        let otherMagnet = document.querySelector('#crane-magnet'+(CONTEXT.data.craneToControl+1));
        let otherCable = document.querySelector('#magnet-cable'+(CONTEXT.data.craneToControl+1));

        //if this is player two, swap the cranes
        if (CONTEXT.data.craneToControl === 2) {
            otherCrane = document.querySelector('#crane'+(CONTEXT.data.craneToControl-1));
            otherMagnet = document.querySelector('#crane-magnet'+(CONTEXT.data.craneToControl-1));
            otherCable = document.querySelector('#magnet-cable'+(CONTEXT.data.craneToControl-1));
            otherCraneNum = CONTEXT.data.craneToControl-1;
            
            if (CONTEXT.data.doOnce === true) {
                CONTEXT.data.rotation = 60;
                CONTEXT.data.otherRotation = -120;
                CONTEXT.data.doOnce = false;

                //change the second player's camera position
                CONTEXT.camera.setAttribute('position', '-0.75 1.2 1.3');
                CONTEXT.camera.setAttribute('rotation', '0 0 0');
            }
        }

        //animate the crane to the new rotation
        crane.setAttribute('animation', {
            property: 'rotation',
            to: {x: 0, y: CONTEXT.data.rotation, z: 0},
            dur: 50
        });

        //animate the magnet to the new position
        magnet.setAttribute('animation', {
            property: 'position', 
            to: {x: CONTEXT.data.magnetPosX, y: CONTEXT.data.magnetPosY, z: 0}, 
            dur: 50
        });

        //update the length of the magnet cable
        cable.setAttribute('line', {
            start: {x: 0, y: 0, z: 0}, 
            end: {x: 0, y: 88 - CONTEXT.data.magnetPosY, z: 0}, 
            color: 'black', 
            opacity: 1
        });

        //update the other crane's rotation
        otherCrane.setAttribute('animation', {
            property: 'rotation', 
            to: {x: 0, y: CONTEXT.data.otherRotation, z: 0}, 
            dur: 50
        });

        //update the other crane's magnet position
        otherMagnet.setAttribute('animation', {
            property: 'position', 
            to: {x: CONTEXT.data.otherMagnetPosX, y: CONTEXT.data.otherMagnetPosY, z: 0}, 
            dur: 50
        });

        //update the other crane's magnet cable length
        otherCable.setAttribute('line', {
            start: {x: 0, y: 0, z: 0}, 
            end: {x: 0, y: 88 - CONTEXT.data.otherMagnetPosY, z: 0}, 
            color: 'black', 
            opacity: 1
        });
    },

    onKeydown: function(evt) {
        const CONTEXT = this;
        //switch on the keycode, determine correct action and move crane accordingly
        if (CONTEXT.data.craneToControl === 1) {
            switch(evt.keyCode) {
                case 87: //W
                if (CONTEXT.data.magnetPosX < 65) {
                        CONTEXT.data.magnetPosX += 1;
                    }
                    break;
                case 38: //UP
                    if (CONTEXT.data.magnetPosX < 65) {
                        CONTEXT.data.magnetPosX += 1;
                    }
                    break;
                case 65: //A
                    if (CONTEXT.data.rotation < -75) {
                        CONTEXT.data.rotation += 4;
                    }
                    break;
                case 37: //LEFT
                    if (CONTEXT.data.rotation < -75) {
                        CONTEXT.data.rotation += 4;
                    }
                    break;
                case 83: //S
                    if (CONTEXT.data.magnetPosX > 25) {
                        CONTEXT.data.magnetPosX -= 1;
                    }
                    break;
                case 40: //DOWN
                    if (CONTEXT.data.magnetPosX > 25) {
                        CONTEXT.data.magnetPosX -= 1;
                    }
                    break;
                case 68: //D
                if (CONTEXT.data.rotation > -210) {
                    CONTEXT.data.rotation -= 4;
                }
                    break;
                case 39: //RIGHT
                    if (CONTEXT.data.rotation > -210) {
                        CONTEXT.data.rotation -= 4;
                    }
                    break;
                case 32: //SPACE
                    //animate the magnet down to 44 and then back up to 82
                    CONTEXT.data.magnetPosY = 44;
                    break;
                default:
                    //do nothing if the key pressed is not one of the above
                    break;
            }
        }

        if (CONTEXT.data.craneToControl === 2) { //if this is player 2, invert the controls
            switch(evt.keyCode) {
                case 87: //W
                if (CONTEXT.data.magnetPosX < 65) {
                        CONTEXT.data.magnetPosX += 1;
                    }
                    break;
                case 38: //UP
                    if (CONTEXT.data.magnetPosX < 65) {
                        CONTEXT.data.magnetPosX += 1;
                    }
                    break;
                case 65: //A
                    if (CONTEXT.data.rotation < 120) {
                        CONTEXT.data.rotation += 4;
                    }
                    break;
                case 37: //LEFT
                    if (CONTEXT.data.rotation < 120) {
                        CONTEXT.data.rotation += 4;
                    }
                    break;
                case 83: //S
                    if (CONTEXT.data.magnetPosX > 25) {
                        CONTEXT.data.magnetPosX -= 1;
                    }
                    break;
                case 40: //DOWN
                    if (CONTEXT.data.magnetPosX > 25) {
                        CONTEXT.data.magnetPosX -= 1;
                    }
                    break;
                case 68: //D
                if (CONTEXT.data.rotation > -30) {
                    CONTEXT.data.rotation -= 4;
                }
                    break;
                case 39: //RIGHT
                    if (CONTEXT.data.rotation > -30) {
                        CONTEXT.data.rotation -= 4;
                    }
                    break;
                case 32: //SPACE
                    //animate the magnet down to 44 and then back up to 82
                    CONTEXT.data.magnetPosY = 44;
                    break;
                default:
                    //do nothing if the key pressed is not one of the above
                    break;
            }
        }
    },

    //hold down magnet controls & emit pickup-container event
    onKeyup: function(evt) {
        const CONTEXT = this;
        const pickupContainer = document.querySelector('[pickupContainer]').components.pickupContainer;
        const gameManager = document.querySelector('#gameManager').components['game-manager'];
        switch(evt.keyCode) { 
            case 32: //SPACE
                //animate the magnet back up to 82
                CONTEXT.data.magnetPosY = 82;
                //call pickup or putdown function depending on which is allowed and conditional to the craneToControl
                if (gameManager.data.crane1PickupAllowed === true && CONTEXT.data.craneToControl === 1 || gameManager.data.crane2PickupAllowed === true && CONTEXT.data.craneToControl === 2) {
                    pickupContainer.pickup(CONTEXT.data);
                }
                if (gameManager.data.crane1PutdownAllowed === true && CONTEXT.data.craneToControl === 1 || gameManager.data.crane2PutdownAllowed === true && CONTEXT.data.craneToControl === 2) {
                    pickupContainer.putdown(CONTEXT.data);
                }
                break;
            default:
                //do nothing if the key pressed is not one of the above
                break;
        }
    },

    pickupContainerEvent: function(data) {
        const CONTEXT = this;
        //passthrough from DOM event to socket event
        CONTEXT.socket.emit('pickupContainer', data);
    },

    putdownContainerEvent: function(data) {
        const CONTEXT = this;
        //passthrough from DOM event to socket event
        CONTEXT.socket.emit('putdownContainer', data);
    },

    updateSchema: function (event) {      
    },

    remove: function() {
        //if the crane-controller is removed, remove all event listeners and socket listeners
        socket.removeAllListeners();
        CONTEXT.removeEventListeners();
    }
});