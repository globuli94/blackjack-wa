const PlayerControls = {
    props: {
        player: {
            type: Object,
            required: true
        },
        gameState: {
            type: String,
            required: true
        },
        gameUtils: {
            type: Object,
            required: true
        },
        apiService: {
            type: Object,
            required: true
        }
    },
    emits: ['hit', 'stand', 'bet', 'leave'],
    data() {
        return {
            betAmount: null,
            message: '',
        }
    },
    computed: {
        canHit() {
            return this.gameState === "Started" && this.gameUtils.canHit(this.player.hand)
        },
        canStand() {
            return this.gameState === "Started"
        },
        canBet() {
            return this.gameState === "Betting"
        },
    },
    methods: {
        hit() {
            this.apiService.hit()
        },
        stand() {
            this.apiService.stand()
        },
        bet(amount) {
            const result = this.gameUtils.validateBet(amount, this.player.money);

            if(!result.valid) {
                this.message = result.message;
                return
            }

            this.apiService.bet(amount)
                .done(res => {
                    this.betAmount = null;
                    console.log("Bet success")
                })
                .fail(err => {
                    console.error(err)
                })
        },
        leave() {
            this.apiService.leavePlayer()
        }
    },
    template: `
        <div class="player-actions d-flex justify-content-center gap-2" style="justify-content: center">
            <button v-if="canStand"  type="submit" class="btn btn-primary" @click="stand">Stand</button>
            <button v-if="canHit" type="submit" class="btn btn-warning" @click="hit" >Hit</button>
            
            <div v-if="canBet" class="bet-form-container d-flex gap-2 flex-grow-1">
                <form @submit.prevent="bet(betAmount)" class="d-flex gap-2 flex-grow-1">
                    
                    <input 
                        v-model.number="betAmount"
                        type="text" 
                        placeholder="Enter bet" 
                        class="form-control flex-grow-1" 
                        style="min-width:80px; max-width:150px;"
                    >
                    <button type="submit" class="btn btn-success flex-shrink-0">Bet</button>
                </form>
            </div>
            <div v-if="message" class="alert alert-warning mt-2">
                {{ message }}
            </div>
            
            <button type="submit" class="btn btn-secondary" @click="leave" >
                <i class="bi bi-box-arrow-left"></i>
            </button>
        </div>
    `
}