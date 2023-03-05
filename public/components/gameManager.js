AFRAME.registerComponent('gameManager', { 
    schema: {
        gameType: {type: 'string', oneOf: 'collaborative, competitive', default: 'collaborative'},
        shipDropoffRotation1: {type: 'vec2', default: {x: -210, y: -180}}, //less than is valid
        shipDropoffRotation2: {type: 'vec2', default: {x: -30, y: 0}}, //less than is valid
        shipDropoff1: {type: 'boolean', default: false},
        shipDropoff2: {type: 'boolean', default: false},
    },
    init: function () {
        const CONTEXT = this;
        CONTEXT.collaborativeInit = CONTEXT.collaborativeInit.bind(CONTEXT);
        CONTEXT.competitiveInit = CONTEXT.competitiveInit.bind(CONTEXT);

        //create a UI that prompts the user to choose between collaborative and competitive gamemodes
        

        if (CONTEXT.data.gameType === 'collaborative') {
            CONTEXT.collaborativeInit();
        } 
        else {
            CONTEXT.competitiveInit();
        }

    },

    collaborativeInit: function () {
        const CONTEXT = this;
    },

    competitiveInit: function () {
        const CONTEXT = this;
        CONTEXT.data.shipDropoffRotation1 = {x: -120, y: -90};
        CONTEXT.data.shipDropoffRotation2 = {x: 60, y: 90};
    },

    tick: function () {
        const CONTEXT = this;
        const craneController = document.querySelector('[crane-controller]').components['crane-controller'];
        if (CONTEXT.data.shipDropoffRotation1.x <= craneController.data.rotation && CONTEXT.data.shipDropoffRotation1.y >= craneController.data.rotation) {
            CONTEXT.data.shipDropoff1 = true; } 
            else { CONTEXT.data.shipDropoff1 = false; 
        }
        if (CONTEXT.data.shipDropoffRotation2.x <= craneController.data.otherRotation && CONTEXT.data.shipDropoffRotation2.y >= craneController.data.rotation) {
            CONTEXT.data.shipDropoff2 = true; }
            else { CONTEXT.data.shipDropoff2 = false;
        }
    }
});