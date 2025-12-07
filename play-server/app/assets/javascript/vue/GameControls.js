const GameControls = {
    props: {
        apiService: {
            type: Object,
            required: true
        },
        gameState: {
            type: String,
            required: false
        },
        players: {
            type: Array,
            required: true
        }
    },
    computed: {
        canStart() {
            return this.gameState === "Initialized" && this.players.length > 0;
        },
        canAddPlayer() {
            return this.gameState === "Initialized";
        }
    },
    methods: {
        startGame() {
            this.apiService.startGame();
        },
        addPlayer(name) {
            this.apiService.addPlayer(name);
        },
        resetGame() {
            this.apiService.initializeGame();
        }
    },
    template: `
        <div class="game-controls justify-content-center gap-2" style="justify-content: center">
            <button v-if="canStart" class="button control-start" type="button" title="Spiel starten" @click="startGame">
                    <i class="bi bi-play-fill"></i>
            </button>
            
            <button v-if="canAddPlayer" type="button" class="button control-add-player" data-bs-toggle="modal" data-bs-target="#addPlayerModal" title="Spieler hinzufügen">
                    <i class="bi bi-person-plus-fill"></i>
            </button>

            <button class="button control-reset" type="button" title="Spiel zurücksetzen" @click="resetGame">
                <i class="bi bi-arrow-counterclockwise"></i>
            </button>
        </div>
    `
}