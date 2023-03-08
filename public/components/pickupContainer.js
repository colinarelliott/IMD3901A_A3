//BEGIN COMPONENT
// a component that allows the crane magnets to pickup the nearest container when dropped.

AFRAME.registerComponent('pickupContainer', { //dependent on the crane-controller component
    schema: {
        //list of all containers
        containers: {type: 'selectorAll', default: '.shippingContainer'},
        cargoShips: {type: 'selectorAll', default: '.cargoShip'},
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
        const gameManager = document.querySelector('#gameManager').components['game-manager']; //get the game-manager component
        CONTEXT.data.containers = document.querySelectorAll('.shippingContainer');
        //add a list for the distances between the crane and the containers
        if (CONTEXT.data.containers.length > 0) {
            let distances = [];
            //set the magnet number
            let magnetNumber = data.craneToControl;
            //CONTAINER PICKING ALGORITHM (currently grabs closest container to the crane base, should really be the magnet location)

            //loop through all containers and measure the distance between the crane and the container
            for (i = 0; i < CONTEXT.data.containers.length; i++) { //measure each distance between the containers and the crane
                let container = CONTEXT.data.containers[i];
                let containerPosition = container.getAttribute('position');
                let craneMagnetPosition = document.querySelector('#crane-magnet' + magnetNumber).getAttribute('position'); //get the position of the crane magnet
                //append distances to a list
                distances.push(Math.sqrt(Math.pow((containerPosition.x - craneMagnetPosition.x), 2) + Math.pow((containerPosition.z - craneMagnetPosition.z), 2)));
            }

            let minDistance = Math.min.apply(Math, distances); //get the minimum distance 
            let indexOfMinDistance = distances.indexOf(minDistance); //get the index of the minimum distance
            let containerToPickup = CONTEXT.data.containers[indexOfMinDistance]; //get the container that is closest to the crane
            let containerID = containerToPickup.getAttribute('id'); //get the id of the container to pickup

            //END CONTAINER PICKING ALGORITHM
            
            //ACTUALLY PICKUP THE CONTAINER
            let container = document.querySelector('#' + containerID);
            let magnet = document.querySelector('#crane-magnet' + magnetNumber);

            //DEBUG
            console.log("Pickup executed: |" +magnetNumber+"|"+containerID+"|");
            let copy = container.cloneNode(true);
            //parent the copy to the magnet
            magnet.appendChild(copy);
            //remove the original container
            container.parentNode.removeChild(container);
            // END PICKUP
            
            //reset the copy's position, rotation, and scale, give it the absolute model reference and new class
            setTimeout(function () { //reset the copy's position, rotation, and scale
                copy.setAttribute('position', {x: 0, y: -14, z: 0});
                copy.setAttribute('rotation', {x: 0, y: 0, z: 0});
                copy.setAttribute('scale', {x: 5, y: 5, z: 5});
                copy.setAttribute('gltf-model', 'assets/models/blue-container.gltf'); //has to be an absolute reference, # doesn't work
                copy.setAttribute('class', 'heldContainer'); //remove class so it doesn't get picked up again
            }, 10);

            //send the pickup event to the server
            craneController.socket.emit('pickupContainer', {
                magnetNumber: magnetNumber,
                containerToPickup: containerID
            })

        } else {
            console.log("No containers to pickup");
        }
    },

    //pickup a specific container (used for multiplayer)
    pickupSpecified: function (data) {
        const CONTEXT = this;
        let container = document.querySelector('#' + data.containerID);
        let magnet = document.querySelector('#crane-magnet' + data.craneNum);

        //PICKUP THE CONTAINER
        let copy = container.cloneNode(true);
        //parent the copy to the magnet
        magnet.appendChild(copy);
        //remove the original container
        container.parentNode.removeChild(container);
        console.log("Specific pickup executed: |" + data.craneNum + "|" + data.containerID + "|");
        // END PICKUP

        setTimeout(function () { //reset the copy's position, rotation, and scale, give it the new class and model reference
            copy.setAttribute('position', {x: 0, y: -14, z: 0});
            copy.setAttribute('rotation', {x: 0, y: 0, z: 0});
            copy.setAttribute('scale', {x: 5, y: 5, z: 5});
            copy.setAttribute('class', 'heldContainer'); //remove class so it doesn't get picked up again
            copy.setAttribute('gltf-model', 'assets/models/blue-container.gltf'); //has to be an absolute reference, # doesn't work
        }, 10);

        /*
        craneController.pickupContainerEvent({
            magnetNumber: data.craneNum,
            containerToPickup: containerID
        });*/

    },

    putdown: function (data) {
        const craneController = document.querySelector('[crane-controller]').components["crane-controller"]; //get the craneController component
        const gameManager = document.querySelector('#gameManager').components["game-manager"]; //get the gameManager component

        console.log("putdown executed by P" + data.craneToControl);

        let heldContainers = document.querySelectorAll('.heldContainer');

        let containerToPutdown = null;
        let cargoShipToTarget = null;

        //loop through all held containers and find the one that is being held by the crane that is trying to put it down
        for (i=0; i < heldContainers.length; i++) {
            let hc = heldContainers[i];
            let hcParent = hc.parentNode;
            let hcParentID = hcParent.getAttribute('id');
            if (hcParentID === "crane-magnet1" && data.craneToControl === 1) {
                containerToPutdown = hc;
            }
            if (hcParentID === "crane-magnet2" && data.craneToControl === 2) {
                containerToPutdown = hc;
            }
        }

        console.log("containerToPutdown: " + containerToPutdown.getAttribute('id'));

        //put the container down on the nearest cargo ship if it is a competitive game
        if (gameManager.data.gameType === 'competitive') {
            if (craneController.data.craneToControl === 1) {
                cargoShipToTarget = document.querySelector('#cargoShipA');
            }

            if (craneController.data.craneToControl === 2) {
                cargoShipToTarget = document.querySelector('#cargoShipB');
            }
        }

        //put the container down on the middle if it is a collaborative game
        if (gameManager.data.gameType === 'collaborative') {
            cargoShipToTarget = document.querySelector('#cargoShipC');
            //ADD container to the specific cargo ship
        }

        console.log("cargoShipToTarget: " + cargoShipToTarget.getAttribute('id'));

        //grab the cargoShipID to be forwarded to the server
        let cargoShipID = cargoShipToTarget.getAttribute('id');

        //actually put it on the ship and remove it from the crane
        if (containerToPutdown !== null) {
            craneController.socket.emit('putdownContainer', { //call stack is too large so I had to send the event from here rather than relaying it from the craneController
                containerID: containerToPutdown.getAttribute('id'),
                craneNum: craneController.data.craneToControl,
                cargoShipID: cargoShipID,
            });
            setTimeout(function () {
                cargoShipToTarget.components["container-holder"].addContainer(containerToPutdown);
                containerToPutdown.parentNode.removeChild(containerToPutdown); //remove the container from the crane
                console.log("container put down complete");
            }, 10); //10ms later to make sure it happens after the server is sent the event
        }
    },

    putdownSpecified: function (data) {
        let cargoShipID = data.cargoShipID;
        let cargoShip = document.querySelector('#' + cargoShipID);
        let containerHolder = cargoShip.components["container-holder"];
        let container = document.querySelector('#' + data.containerID);
        console.log("Specific putdown executed: |" + data.containerID + "|");

        //ADD container to the specific cargo ship
        if (container !== null) {
            containerHolder.addContainer(container);
            container.parentNode.removeChild(container); //remove the container from the crane
        }
    },

    tick: function () {
        const CONTEXT = this;

        const craneController = document.querySelector('#crane-controller').components["crane-controller"];
        const gameManager = document.querySelector('#gameManager').components["game-manager"]; //get the gameManager component

        //REPORT if crane is allowed to pickup to the gameManager to be synced

        //if the crane is crane 1 and pickup is allowed
        if (craneController.data.craneToControl === 1 && CONTEXT.data.pickupAllowed === true) {
            gameManager.data.crane1PickupAllowed = true; //set the crane1PickupAllowed to true in the gameManager
        }
        //if the crane is crane 2 and pickup is allowed
        if (craneController.data.craneToControl === 2 && CONTEXT.data.pickupAllowed === true) {
            gameManager.data.crane2PickupAllowed = true; //set the crane2PickupAllowed to true in the gameManager
        }
        //if the crane is crane 1 and pickup is not allowed
        if (craneController.data.craneToControl === 1 && CONTEXT.data.pickupAllowed === false) {
            gameManager.data.crane1PickupAllowed = false; //set the crane1PickupAllowed to false in the gameManager
        }
        //if the crane is crane 2 and pickup is not allowed
        if (craneController.data.craneToControl === 2 && CONTEXT.data.pickupAllowed === false) {
            gameManager.data.crane2PickupAllowed = false; //set the crane2PickupAllowed to false in the gameManager
        }

        //if there is a heldContainer on the crane, set it's pickupAllowed to false
        if (document.querySelector('.heldContainer') !== null && document.querySelector('.heldContainer').parentNode.getAttribute('id') === 'crane-magnet1') {
            gameManager.data.crane1PickupAllowed = false;
        }
        if (document.querySelector('.heldContainer') !== null && document.querySelector('.heldContainer').parentNode.getAttribute('id') === 'crane-magnet2') {
            gameManager.data.crane2PickupAllowed = false;
        }
    }
});