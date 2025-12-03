const Player = {
    components: {
        Hand
    },
    data(){
        return {
            lastBet: 0,
        }
    },
    watch: {
        'player.bet'(newBet, oldBet) {
            this.lastBet = oldBet; // save the old bet
        }
    },
    props: {
        player: {
            type: Object,
            required: true
        },
        currentPlayer: {
            type: Boolean,
            required: true
        },
        gameUtils: {
            type: Object,
            required: true
        },
    },
    methods: {

    },
    computed: {

    },
    template: `
        <div :class="['player', {'current-player': currentPlayer }]">
            
            <div class="hand-info d-flex justify-content-center gap-2">
                <Hand
                    :hand="player.hand"
                    :gameUtils="gameUtils"
                />
            </div>
            
            <p class="player-name">{{ player.name }}</p>
            <!-- Money -->
            <div class="d-flex align-items-center gap-1">
                <i class="bi bi-bank"></i>
                <p class="mb-0">{{ player.money }}</p>
            </div>
        
            <!-- Bet -->
            <div class="mt-1 d-flex align-items-center gap-1">
                <i class="bi bi-coin"></i>
                <p v-if="player.state === 'Playing' || player.state === 'Blackjack'" class="mb-0">{{ player.bet }}</p>
                <p v-if="player.state === 'WON'" class="mb-0 text-won">
                  +{{ lastBet }}
                </p>
                <p v-if="player.state === 'LOST'" class="mb-0 text-lost">
                  -{{ lastBet }}
                </p>
            </div>
        </div>
    `
}