class APIService {
    constructor(gameUtils) {
        this.gameUtils = gameUtils;
    }

    loadGameState() {
        return $.get('/api/gameState');
    }

    startGame() {
        return $.get('/api/startGame');
    }

    initializeGame() {
        return $.get('/api/initializeGame');
    }

    hit() {
        return $.get('/api/hit');
    }

    stand() {
        return $.get('/api/stand');
    }

    doubleDown() {
        return $.get('/api/doubleDown');
    }

    leavePlayer() {
        return $.get('/api/leavePlayer');
    }

    bet(betAmount) {
        return $.ajax({
            url: '/api/bet',
            method: 'POST',
            data: {
                BetForm: betAmount,
                csrfToken: this.gameUtils.getCsrfToken()
            }
        });
    }

    addPlayer(playerName) {
        return $.ajax({
            url: '/api/addPlayer',
            method: 'POST',
            data: {
                PlayerForm: playerName,
                csrfToken: this.gameUtils.getCsrfToken()
            }
        });
    }
}