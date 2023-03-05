AFRAME.registerComponent('gameManager', { 
    schema: {
        gameType: {type: 'string', oneOf: 'collaborative, competitive', default: 'collaborative'},
        shipDropoffRotation1: {type: 'number', default: '-180'}, //less than is valid
        shipDropoffRotation2: {type: 'number', default: '0'}, //less than is valid
        ship1Dropoff: {type: 'boolean', default: false},
        ship2Dropoff: {type: 'boolean', default: false},
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
    },

    competitiveInit: function () {
    },

    tick: function () {
        const CONTEXT = this;
    }
});