// a component that allows the crane magnets to pickup the nearest container when dropped.

AFRAME.registerComponent('pickupContainer', { //dependent on the crane-controller component
    schema: {
        //list of all containers
        containers: {type: 'selectorAll', default: '.shippingContainer'},
        cargoShips: {type: 'selectorAll', default: '.cargoShip'},
        pickupAllowed: {type: 'boolean', default: true}
    },
    init: function () {
        console.log("pickupContainer component initialized");
        const CONTEXT = this;
        CONTEXT.pickup = CONTEXT.pickup.bind(CONTEXT);
        CONTEXT.putdown = CONTEXT.putdown.bind(CONTEXT);
    },

    pickup: function (data) {
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
                let crane = document.querySelector('#crane' + magnetNumber);
                let cranePosition = crane.getAttribute('position');
                //loop through all containers and measure the distance between the crane and the container
                for (i = 0; i < CONTEXT.data.containers.length; i++) { //measure each distance between the containers and the crane
                    let container = CONTEXT.data.containers[i];
                    let containerPosition = container.getAttribute('position');
                    //append distances to a list
                    distances.push(Math.sqrt(Math.pow((containerPosition.x - cranePosition.x), 2) + Math.pow((containerPosition.z - cranePosition.z), 2)));
                }

                let minDistance = Math.min.apply(Math, distances); //get the minimum distance 
                let indexOfMinDistance = distances.indexOf(minDistance); //get the index of the minimum distance
                let containerToPickup = CONTEXT.data.containers[indexOfMinDistance]; //get the container that is closest to the crane
                let containerID = containerToPickup.getAttribute('id'); //get the id of the container to pickup

                craneController.pickupContainerEvent({
                    magnetNumber: magnetNumber,
                    containerToPickup: containerID
                }); //trigger the pickupContainerEvent in the crane-controller component
                //END CONTAINER PICKING ALGORITHM

                
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
                    CONTEXT.data.pickupAllowed = false;
                }, 10);
            } else {
                console.log("No containers to pickup");
            }
        } else {
            //get all cargo ships
            const gameManager = document.querySelector('#gameManager').components["game-manager"]; //get the gameManager component
            CONTEXT.cargoShips = document.querySelectorAll('.cargoShip');
            //find the container that is currently held
            let containerToPutdown = document.querySelector('.heldContainer').getAttribute('id');
            
            //put the container down on the nearest cargo ship
            if (gameManager.data.gameType === "competitive") {
                //find the nearest cargo ship
                let crane = document.querySelector('#crane' + data.craneToControl);
                let cranePosition = crane.getAttribute('position');
                let distancesCargo = [];
                for (i = 0; i < CONTEXT.cargoShips.length; i++) {
                    let cargoShip = CONTEXT.cargoShips[i];
                    let cargoShipPosition = cargoShip.getAttribute('position');
                    //append distances to a list
                    distancesCargo.push(Math.sqrt(Math.pow((cargoShipPosition.x - cranePosition.x), 2) + Math.pow((cargoShipPosition.z - cranePosition.z), 2)));
                }

                let minDistance = Math.min.apply(Math, distancesCargo); //get the minimum distance 
                let indexOfMinDistance = distances.indexOf(minDistance); //get the index of the minimum distance
                let cargoShipToTarget = CONTEXT.cargoShips[indexOfMinDistance]; //get the container that is closest to the crane
                let cargoShipID = cargoShipToTarget.getAttribute('id'); //get the id of the container to pickup
                
                craneController.putdownContainerEvent({
                    containerID: containerToPutdown,
                    craneNum: craneController.data.craneToControl,
                    cargoShipID: cargoShipID
                }); //trigger the putdownContainerEvent in the crane-controller component
            }

            //if the game is collaborative, put container down on cargo ship C
            if (gameManager.data.gameType === "collaborative") { 
                const CargoShipC = document.querySelector('#cargoShipC');
                let cargoShipID = CargoShipC.getAttribute('id');

                craneController.putdownContainerEvent({
                    containerID: containerToPutdown,
                    craneNum: craneController.data.craneToControl,
                    cargoShipID: cargoShipID,
                }); //trigger the putdownContainerEvent in the crane-controller component
            }

            /*
            craneController.putdownContainerEvent({
                containerID: containerToPutdown,
                craneNum: craneController.data.craneToControl
            }); //trigger the putdownContainerEvent in the crane-controller component */

            if (craneController.data.craneToControl === 1) {
                //need to make this conditional on gameManager schema variables but I couldn't seem to reference them
                CONTEXT.putdown();
            }

            if (craneController.data.craneToControl === 2) {
                CONTEXT.putdown();
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
                CONTEXT.data.pickupAllowed = false;
            }, 10);
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
    }
});