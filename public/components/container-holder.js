AFRAME.registerComponent('container-holder', {
    schema: {
        containerCount: {type: 'number', default: 0},
    },

    init : function () {
        const CONTEXT = this;
        const gameManager = document.querySelector('[game-manager]').components['game-manager'];
        const cargoShipA = document.querySelector('#cargoShipA');
        const cargoShipB = document.querySelector('#cargoShipB');
        const cargoShipC = document.querySelector('#cargoShipC');
 
        if (gameManager.data.gameType === "collaborative") {
            CONTEXT.data.containerCount = 10;

            CONTEXT.el.addEventListener('containerPlaced', function (evt) {
                CONTEXT.data.containerCount += 1;
            });
            CONTEXT.el.addEventListener('containerRemoved', function (evt) {
                CONTEXT.data.containerCount -= 1;
            });
        }

        if (gameManager.data.gameType === "competitive") {
            CONTEXT.data.containerCount = 0;
            CONTEXT.el.addEventListener('containerPlaced', function (evt) {
                CONTEXT.data.containerCount += 1;
            });
            CONTEXT.el.addEventListener('containerRemoved', function (evt) {
                CONTEXT.data.containerCount -= 1;
            });
        }

        if (gameManager.data.gameType === undefined) {
            console.error("No game type specified for container-holder component");
        }
    },
});