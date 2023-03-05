// a component that allows the crane magnets to pickup the nearest container when dropped.

AFRAME.registerComponent('pickupContainer', { //dependent on the crane-controller component
    schema: {
        //list of all containers
        containers: {type: 'selectorAll', default: '.shippingContainer'},
        pickupAllowed: {type: 'boolean', default: true}
    },
    init: function () {
        const CONTEXT = this;
        CONTEXT.pickup = CONTEXT.pickup.bind(CONTEXT);
        CONTEXT.putdown = CONTEXT.putdown.bind(CONTEXT);
    },

    pickup: function (data) {
        const CONTEXT = this;
        //check if the pickup is allowed
        if (CONTEXT.data.pickupAllowed === true) {
            console.log("pickupContainer function called");
            //refresh container list
            CONTEXT.data.containers = document.querySelectorAll('.shippingContainer');
            //add a list for the distances between the crane and the containers
            let distances = [];
            //set the magnet number
            let magnetNumber = data.craneToControl;
            console.log('pickupContainer event received ' + magnetNumber);
            //get the crane controller component and reparent the closest container to the magnet

            //CONTAINER PICKING ALGORITHM
            let crane = document.querySelector('#crane' + magnetNumber);
            let cranePosition = crane.getAttribute('position');
            //loop through all containers and measure the distance between the crane and the container
            for (i = 0; i < CONTEXT.data.containers.length; i++) { //measure each distance between the containers and the crane
                let container = CONTEXT.data.containers[i];
                let containerPosition = container.getAttribute('position');
                //append distances to a list
                distances.push(Math.sqrt(Math.pow((containerPosition.x - cranePosition.x), 2) + Math.pow((containerPosition.z - cranePosition.z), 2)));
            }
            let containerToPickup = CONTEXT.data.containers[distances.indexOf(Math.min(distances))].getAttribute('id'); //get the index of the minimum distance

            //END CONTAINER PICKING ALGORITHM

            console.log("Pickup executed: |" +magnetNumber+"|"+containerToPickup+"|");
            let container = document.querySelector('#' + containerToPickup);
            let magnet = document.querySelector('#crane-magnet' + magnetNumber);
            let copy = container.cloneNode(true);
            //parent the copy to the magnet
            magnet.appendChild(copy);
            //remove the original container
            container.parentNode.removeChild(container);
            
            setTimeout(function () { //reset the copy's position, rotation, and scale
                copy.setAttribute('position', {x: 0, y: -14, z: 0});
                copy.setAttribute('rotation', {x: 0, y: 0, z: 0});
                copy.setAttribute('scale', {x: 5, y: 5, z: 5});
                copy.setAttribute('class', 'heldContainer'); //remove class so it doesn't get picked up again
                CONTEXT.data.pickupAllowed = false;
            }, 10);
        } else {
            CONTEXT.putdown();
        }
    },

    putdown: function () {
        const CONTEXT = this;
        let container = document.querySelector('.heldContainer');
        if (container !== null) {
            container.parentNode.removeChild(container);
            CONTEXT.data.pickupAllowed = true;
        }
    },

    tick: function () {
    }
});