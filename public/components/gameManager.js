AFRAME.registerComponent('gameManager', { 
    schema: {
        gameType: {type: 'string', oneOf: 'collaborative, competitive', default: 'collaborative'},
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
    }
});