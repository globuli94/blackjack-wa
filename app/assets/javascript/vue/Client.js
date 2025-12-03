const { createApp } = Vue;

const Client = {
    components: {
        Navbar,
        Player,
        Dealer,
        PlayerControls,
        GameControls,
    },
    data() {
        return {
            current_idx: null,
            players: [],
            dealer: null,
            deck: null,
            gameState: null,

            wsManager: null,
            gameUtils: null,
            apiService: null,

            newPlayerName: "",
        }
    },
    mounted() {
        // init gameUtil instance
        this.gameUtils = new GameUtils();

        // init apiService
        this.apiService = new APIService(this.gameUtils)

        //create ws instance
        this.wsManager = new WebSocketManager((gameData) => {
            this.updateGameState(gameData)
        });

        // connect to ws
        this.wsManager.connect();
    },
    methods: {
        updateGameState(gameData) {
            this.current_idx = gameData.current_idx;
            this.players = gameData.players || [];
            this.dealer = gameData.dealer;
            this.deck = gameData.deck;
            this.gameState = gameData.state;
        },
        confirmAddPlayer() {
            if (!this.newPlayerName.trim()) return;

            this.apiService.addPlayer(this.newPlayerName);
            this.newPlayerName = "";

            const modal = bootstrap.Modal.getInstance(
                document.getElementById("addPlayerModal")
            );
            modal.hide();
        }
    },
    computed: {
        currentPlayer() {
            return this.players[this.current_idx]
        }
    },
    template: `
        <div class="p-4 bg-green-700 min-h-screen text-white d-flex flex-column">
            <!-- Navbar -->
            <Navbar v-if="apiService"
                :apiService="apiService"
            />
        
            <!-- Game Controls -->
            <div class="mt-4 game-controls justify-content-center">
                <div class="col-auto">
                    <GameControls v-if="apiService"
                        :apiService="apiService"
                        :gameState="gameState"
                        :players="players"
                    />
                </div>
            </div>
            
            <!-- Dealer Section -->
            <div v-if="dealer" class="mt-1 row justify-content-center">
                <Dealer
                    :dealer="dealer"
                    :gameUtils="gameUtils"
                />
            </div>

            <!-- Players Section -->
            <div v-if="players.length > 0">
                <div class="row player-section justify-content-center gx-3 gy-3">
                    <div v-for="player in players" :key="player.name" class="col-auto">
                        <Player
                            :player="player"
                            :gameUtils="gameUtils"
                            :currentPlayer="player == currentPlayer"
                        />
                    </div>
                </div>
            </div>
        
            <!-- Gap between players and controls -->
            <div class="mt-4 row player-actions justify-content-center">
                <div class="col-auto">
                    <PlayerControls v-if="currentPlayer && gameState && gameUtils && apiService"
                        :player="currentPlayer"
                        :gameState="gameState"
                        :gameUtils="gameUtils"
                        :apiService="apiService"
                    />
                </div>
            </div>
        </div>
        
        <!-- add player modal -->
        <div class="modal fade" id="addPlayerModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content text-dark">
    
                    <div class="modal-header">
                        <h5 class="modal-title">Spieler hinzufügen</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
    
                    <div class="modal-body">
                        <input v-model="newPlayerName" type="text" class="form-control" placeholder="Name eingeben">
                    </div>
    
                    <div class="modal-footer">
                        <button class="btn btn-secondary" data-bs-dismiss="modal">Abbrechen</button>
                        <button class="btn btn-primary" @click="confirmAddPlayer">Hinzufügen</button>
                    </div>
    
                </div>
            </div>
        </div>
    `
}
createApp(Client).mount('#app')