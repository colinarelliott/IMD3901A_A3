//this component is used to manage the game state, including the score, the game type, and synchronization between the clients and the server

AFRAME.registerComponent('gameManager', {
    schema: {
        gameType: {type: 'string', oneOf: ['collaborative', 'competitive'], default: 'collaborative'},
        score: {type: 'number', default: 0},
    },
    init: function () {
        const CONTEXT = this;
    }

});