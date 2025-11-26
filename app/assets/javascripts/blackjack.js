$(document).ready(function() {
    const webSocketManager = new WebSocketManager((gameState) => {
        updateGame(gameState)
    })

    webSocketManager.connect()
});

function updateGame(game) {
    const container = document.getElementById("blackjack-container");
    container.innerHTML = "";
    container.textContent = JSON.stringify(game, null, 2);
}
