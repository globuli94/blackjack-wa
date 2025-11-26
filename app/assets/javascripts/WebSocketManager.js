class WebSocketManager {

    constructor(onMessageCallback) {
        this.socket = null;
        this.onMessageCallback = onMessageCallback;
        this.reconnectDelay = 3000;
    }

    connect() {
        console.log("connecting to websocket...")
        this.socket = new WebSocket('ws://localhost:9000/websocket');

        this.socket.onopen = () => {
            console.log("✅ WebSocket connection opened!");
        }

        this.socket.onmessage = (event) => {
            if (event.data === "ping") return;

            try {
                const gameData = JSON.parse(event.data);
                console.log("📨 WebSocket update received:", gameData);
                this.onMessageCallback(gameData);  // works correctly
            } catch (error) {
                console.error("❌ Error parsing WebSocket message:", error);
            }
        }

        this.socket.onerror = (error) => {
            console.error("❌ WebSocket error:", error);
        }

        this.socket.onclose = (event) => {
            console.log("⚠️ WebSocket closed:", event);
        }
    }
}