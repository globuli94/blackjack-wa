class WebSocketManager {

    constructor(onMessageCallback) {
        this.socket = null;
        this.onMessageCallback = onMessageCallback;
    }

    connect() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/websocket`;
        console.log("connecting to websocket...", wsUrl);
        this.socket = new WebSocket(wsUrl);


        //this.socket = new WebSocket('ws://localhost:9000/websocket');

        this.socket.onopen = () => {
            console.log("✅ WebSocket connection opened!");
            this.requestInitialState()
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

    requestInitialState() {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send("getState");
        }
    }
}