$(document).ready(function() {
    const socket = new WebSocket('ws://localhost:9000/websocket');

    socket.onopen = function(event){
        console.log("✅ WebSocket connection opened!");
    }
    socket.onmessage = function(event){

        if (event.data === "ping") {
            console.log("heartbeat received");
            return;
        }

        const data = event.data;
        console.log(data);            // prints the JSON string
        const gameData = JSON.parse(data);
        console.log(gameData);
        updateGame(gameData);
    }
    socket.onerror = function(error){
        console.error("❌ WebSocket error:", error);
    }
    socket.onclose = function(event) {
        console.log("⚠️ WebSocket closed:", event);
    }

    // Paste your entire jQuery code here
    console.log("Blackjack jQuery loaded successfully!");
});

function updateGame(game) {
    const container = document.getElementById("blackjack-container");
    container.innerHTML = "";
    container.textContent = JSON.stringify(game, null, 2);
}
