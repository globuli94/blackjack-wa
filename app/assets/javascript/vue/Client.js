const { createApp } = Vue;

const Client = {
    components: {},
    data() {
        return {
            current_idx: null,
            players: [],
            dealer: null,
            deck: null,
            gameState: null,
            wsManager: null,
        }
    },
    mounted() {
        //create ws instance
        this.wsManger = new WebSocketManager((gameData) => {
            this.updateGameState(gameData)
        });

        // connect to ws
        this.wsManger.connect();
    },
    methods: {
        updateGameState(gameData) {
            this.current_idx = gameData.current_idx;
            this.players = gameData.players || [];
            this.dealer = gameData.dealer;
            this.deck = gameData.deck;
            this.gameState = gameData.state;
        }
    },
    template: `
        <div class="p-4 bg-green-700 min-h-screen text-white">
            <h1 class="text-3xl mb-4">Blackjack Client</h1>
            <div v-if="players.length > 0">
                <p>Players: {{ players.length }}</p>
                <div v-for="player in players" :key="player.name">
                    {{ player.name }} - {{ player.money }}$
                </div>
            </div>
        </div>
    `
}

createApp(Client).mount('#app')