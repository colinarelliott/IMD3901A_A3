//BEGIN COMPONENT
// a component that allows the crane magnets to pickup the nearest container when dropped.

AFRAME.registerComponent('pickupContainer', { //dependent on the crane-controller component
    schema: {
        //list of all containers
        containers: {type: 'selectorAll', default: '.shippingContainer'},
        cargoShips: {type: 'selectorAll', default: '.cargoShip'},
        pickupAllowed: {type: 'boolean', default: true},
        putdownAllowed: {type: 'boolean', default: false},
    },
    init: function () {
        console.log("pickupContainer component initialized");
        const CONTEXT = this;
        CONTEXT.pickup = CONTEXT.pickup.bind(CONTEXT);
        CONTEXT.putdown = CONTEXT.putdown.bind(CONTEXT);
    },

    pickup: function (data) {
        //TRYING TO FIGURE OUT HOW TO CONSTRICT PICKUP TO ONLY IN VALID ZONES
        const CONTEXT = this;
        const craneController = document.querySelector('[crane-controller]').components['crane-controller']; //get the crane-controller component
        //check if the pickup is allowed
        if (CONTEXT.data.pickupAllowed === true) {
            console.log("pickupContainer function called");
            //refresh container list
            CONTEXT.data.containers = document.querySelectorAll('.shippingContainer');
            console.log(CONTEXT.data.containers);
            //add a list for the distances between the crane and the containers
            if (CONTEXT.data.containers.length > 0) {
                let distances = [];
                //set the magnet number
                let magnetNumber = data.craneToControl;
                console.log('pickupContainer event received ' + magnetNumber);
                //get the crane controller component and reparent the closest container to the magnet

                //CONTAINER PICKING ALGORITHM (currently grabs closest container to the crane base, should really be the magnet location)

                //loop through all containers and measure the distance between the crane and the container
                for (i = 0; i < CONTEXT.data.containers.length; i++) { //measure each distance between the containers and the crane
                    let container = CONTEXT.data.containers[i];
                    let containerPosition = container.getAttribute('position');
                    let craneMagnetPosition = document.querySelector('#crane-magnet' + magnetNumber).getAttribute('position'); //get the position of the crane magnet
                    //append distances to a list
                    distances.push(Math.sqrt(Math.pow((containerPosition.x - craneMagnetPosition.x), 2) + Math.pow((containerPosition.z - craneMagnetPosition.z), 2)));
                }

                console.log(distances);

                let minDistance = Math.min.apply(Math, distances); //get the minimum distance 
                let indexOfMinDistance = distances.indexOf(minDistance); //get the index of the minimum distance
                let containerToPickup = CONTEXT.data.containers[indexOfMinDistance]; //get the container that is closest to the crane
                let containerID = containerToPickup.getAttribute('id'); //get the id of the container to pickup

                //END CONTAINER PICKING ALGORITHM

                //send pickup event to server via crane-controller component //trigger the pickupContainerEvent in the crane-controller component
                
                //trigger a function in the crane-controller component to move the crane to the container and send an event to the server
                let container = document.querySelector('#' + containerID);
                let magnet = document.querySelector('#crane-magnet' + magnetNumber);
                console.log("Pickup executed: |" +magnetNumber+"|"+containerID+"|");
                let copy = container.cloneNode(true);
                //parent the copy to the magnet
                magnet.appendChild(copy);
                //remove the original container
                container.parentNode.removeChild(container);
                
                setTimeout(function () { //reset the copy's position, rotation, and scale
                    copy.setAttribute('position', {x: 0, y: -14, z: 0});
                    copy.setAttribute('rotation', {x: 0, y: 0, z: 0});
                    copy.setAttribute('scale', {x: 5, y: 5, z: 5});
                    copy.setAttribute('gltf-model', 'assets/models/blue-container.gltf'); //has to be an absolute reference, # doesn't work
                    copy.setAttribute('class', 'heldContainer'); //remove class so it doesn't get picked up again
                }, 10);

                craneController.pickupContainerEvent({
                    magnetNumber: magnetNumber,
                    containerToPickup: containerID
                });

                CONTEXT.data.pickupAllowed = false;
            } else {
                console.log("No containers to pickup");
            }
        } else {
            //get all cargo ships
            const gameManager = document.querySelector('#gameManager').components["game-manager"]; //get the gameManager component
            CONTEXT.cargoShips = document.querySelectorAll('.cargoShip');
            let cargoShipID = "";
            //find the container that is currently held
            let containerToPutdown = document.querySelector('.heldContainer').getAttribute('id');
            
            //put the container down on the nearest cargo ship
            if (gameManager.data.gameType === "competitive") {
                //find the nearest cargo ship
                let craneMagnet = document.querySelector('#crane-magnet' + data.craneToControl);
                let craneMagnetPosition = craneMagnet.getAttribute('position');
                let distancesCargo = [];
                for (i = 0; i < CONTEXT.cargoShips.length; i++) {
                    let cargoShip = CONTEXT.cargoShips[i];
                    let cargoShipPosition = cargoShip.getAttribute('position');
                    //append distances to a list
                    distancesCargo.push(Math.sqrt(Math.pow((cargoShipPosition.x - craneMagnetPosition.x), 2) + Math.pow((cargoShipPosition.z - craneMagnetPosition.z), 2)));
                }
                let minDistance = Math.min.apply(Math, distancesCargo); //get the minimum distance 
                let indexOfMinDistance = distances.indexOf(minDistance); //get the index of the minimum distance
                let cargoShipToTarget = CONTEXT.cargoShips[indexOfMinDistance]; //get the container that is closest to the crane
                cargoShipID = cargoShipToTarget.getAttribute('id'); //get the id of the container to pickup
            }

            //if the game is collaborative, put container down on cargo ship C
            if (gameManager.data.gameType === "collaborative") { 
                const CargoShipC = document.querySelector('#cargoShipC');
                cargoShipID = CargoShipC.getAttribute('id');
            }

            craneController.putdownContainerEvent({
                containerID: containerToPutdown,
                craneNum: craneController.data.craneToControl,
                cargoShipID: cargoShipID,
            }); //trigger the putdownContainerEvent in the crane-controller component
            
            if (craneController.data.craneToControl === 1) {
                if (gameManager.data.crane1PutdownAllowed === true) {
                    CONTEXT.putdown();
                    gameManager.data.crane1PutdownAllowed = false;
                }
            }

            if (craneController.data.craneToControl === 2) {
                if (gameManager.data.crane2PutdownAllowed === true) {
                    CONTEXT.putdown();
                    gameManager.data.crane2PutdownAllowed = false;
                }
            }
            
        }
    },

    pickupSpecified: function (data) {
        const CONTEXT = this;
        if (CONTEXT.data.pickupAllowed === true) {
            let container = document.querySelector('#' + data.containerID);
            let magnet = document.querySelector('#crane-magnet' + data.craneNum);
            let copy = container.cloneNode(true);
            //parent the copy to the magnet
            magnet.appendChild(copy);
            //remove the original container
            container.parentNode.removeChild(container);
            console.log("Specific pickup executed: |" + data.craneNum + "|" + data.containerID + "|");

            setTimeout(function () { //reset the copy's position, rotation, and scale
                copy.setAttribute('position', {x: 0, y: -14, z: 0});
                copy.setAttribute('rotation', {x: 0, y: 0, z: 0});
                copy.setAttribute('scale', {x: 5, y: 5, z: 5});
                copy.setAttribute('class', 'heldContainer'); //remove class so it doesn't get picked up again
                copy.setAttribute('gltf-model', '#blue-container-model'); //has to be an absolute reference, # doesn't work
            }, 10);

            craneController.pickupContainerEvent({
                magnetNumber: magnetNumber,
                containerToPickup: containerID
            });
            CONTEXT.data.pickupAllowed = false;
        } else {
            craneController.putdownContainerEvent({
                containerID: data.containerID
            }); //trigger the putdownContainerEvent in the crane-controller component
        }

    },

    putdown: function (data) {
        const CONTEXT = this;
        const gameManager = document.querySelector('#gameManager').components["game-manager"]; //get the gameManager component
        let container = document.querySelector('.heldContainer');

        if (gameManager.data.gameType === "collaborative") {
            let cargoShipToTarget = document.querySelector('#cargoShipC'); //STATIC to COLLABORATIVE MODE for now
            console.log("Putdown executed: |" + container.parentNode.getAttribute('id') + "|" + container.getAttribute('id') + "|");
            if (container !== null) {
                cargoShipToTarget.components["container-holder"].addContainer(container);
                CONTEXT.data.pickupAllowed = true;
            }
        }

        if (gameManager.data.gameType === "competitive") { 
        }
    },

    putdownSpecified: function (data) {
        const CONTEXT = this;
        let cargoShipID = data.cargoShipID;
        let cargoShip = document.querySelector('#' + cargoShipID);
        let containerHolder = cargoShip.components["container-holder"];
        let container = document.querySelector('#' + data.containerID);
        console.log("Specific putdown executed: |" + data.containerID + "|");
        if (container !== null) {
            containerHolder.addContainer(container);
            CONTEXT.data.pickupAllowed = true;
        }
    },

    tick: function () {
        const CONTEXT = this;
        CONTEXT.data.putdownAllowed = !CONTEXT.data.pickupAllowed; //if pickup is allowed, putdown is not allowed, and vice versa

        const craneController = document.querySelector('#crane-controller').components["crane-controller"];
        const gameManager = document.querySelector('#gameManager').components["game-manager"]; //get the gameManager component

        //REPORT if crane is allowed to pickup to the gameManager to be synced

        //if the crane is crane 1 and pickup is allowed
        if (craneController.data.craneToControl === 1 && CONTEXT.data.pickupAllowed === true) {
            gameManager.data.crane1PickupAllowed = true; //set the crane1PickupAllowed to true in the gameManager
            gameManager.data.crane1PutdownAllowed = false; //set the crane1PutdownAllowed to false in the gameManager
        }
        //if the crane is crane 2 and pickup is allowed
        if (craneController.data.craneToControl === 2 && CONTEXT.data.pickupAllowed === true) {
            gameManager.data.crane2PickupAllowed = true; //set the crane2PickupAllowed to true in the gameManager
            gameManager.data.crane2PutdownAllowed = false; //set the crane2PutdownAllowed to false in the gameManager
        }
        //if the crane is crane 1 and pickup is not allowed
        if (craneController.data.craneToControl === 1 && CONTEXT.data.pickupAllowed === false) {
            gameManager.data.crane1PickupAllowed = false; //set the crane1PickupAllowed to false in the gameManager
            gameManager.data.crane1PutdownAllowed = true; //set the crane1PutdownAllowed to true in the gameManager
        }
        //if the crane is crane 2 and pickup is not allowed
        if (craneController.data.craneToControl === 2 && CONTEXT.data.pickupAllowed === false) {
            gameManager.data.crane2PickupAllowed = false; //set the crane2PickupAllowed to false in the gameManager
            gameManager.data.crane2PutdownAllowed = true; //set the crane2PutdownAllowed to true in the gameManager
        }
    }
});