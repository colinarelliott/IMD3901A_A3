// a component that allows the crane magnets to pickup the nearest container when dropped.

AFRAME.registerComponent('pickupContainer', { //dependent on the crane-controller component
    dependencies: ['crane-controller'],
    schema: {
        //list of all containers
        containers: {type: 'selectorAll', default: '.shippingContainer'}
    },
    init: function () {
        const CONTEXT = this;
        CONTEXT.pickup = CONTEXT.pickup.bind(CONTEXT);
    },

    pickup: function (data) {
        const CONTEXT = this;
        console.log("pickupContainer function called");
        //refresh container list
        CONTEXT.data.containers = document.querySelectorAll('.shippingContainer');
        //add a list for the distances between the crane and the containers
        let distances = [];
        //set the magnet number
        let magnetNumber = data.craneToControl;
        console.log(magnetNumber);
        console.log('pickupContainer event received ' + magnetNumber);
        //get the crane controller component and reparent the closest container to the magnet

        let crane = document.querySelector('#crane' + magnetNumber);
        let cranePosition = crane.getAttribute('position');
        for (i = 0; i < CONTEXT.data.containers.length; i++) { //measure each distance between the containers and the crane
            let container = CONTEXT.data.containers[i];
            let containerPosition = container.getAttribute('position');
            //append distances to a list
            distances.push(Math.sqrt(Math.pow((containerPosition.x - cranePosition.x), 2) + Math.pow((containerPosition.z - cranePosition.z), 2)));
        }
        let containerToPickup = CONTEXT.data.containers[distances.indexOf(Math.min(distances))].getAttribute('id'); //get the index of the minimum distance
        let container = document.querySelector('#' + containerToPickup);
        let magnet = document.querySelector('#magnet' + magnetNumber);
        magnet.append(container);
        //set the container's position to 0,0,0
        container.setAttribute('position', {x: 0, y: 0, z: 0});
        //set the container's rotation to 0,0,0
        container.setAttribute('rotation', {x: 0, y: 0, z: 0});
    },

    tick: function () {
    }
});