class GameStateManager {
    constructor() {
        this.currentGameState = null;
    }

    setState(response) {
        if (response.gameState) {
            this.currentGameState = response.gameState;
        } else {
            this.currentGameState = response;
        }
        return this.currentGameState;
    }

    getState() {
        return this.currentGameState;
    }

    getCurrentPlayerIndex() {
        return this.currentGameState?.current_idx || 0;
    }

    getGameState() {
        return this.currentGameState?.state || 'Unknown';
    }

    getPlayers() {
        return this.currentGameState?.players || [];
    }

    getDealer() {
        return this.currentGameState?.dealer || null;
    }
}