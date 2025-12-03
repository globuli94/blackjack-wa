const Hand = {
    components: {
        Card
    },
    props: {
        hand: {
            type:Object,
            required: true
        },
        gameUtils: {
            type: Object,
            required: true
        }
    },
    computed: {
        handValue() {
            return this.gameUtils.getHandValue(this.hand)
        },
        paddedCards() {
            if(this.hand.cards.length === 1) {
                return [...this.hand.cards ,{rank: "blank", suit: "blank"}]
            }
            return this.hand.cards
        },
    },
    template: `
    <div class="hand">
        <div class="cards-container d-flex justify-content-center flex-wrap gap-2">
            <Card 
                    v-for="(card, index) in paddedCards" 
                    :key="index"
                    :card="card"    
            />
        </div>
        <div v-if="handValue > 0" class="hand-info d-flex justify-content-center gap-2">
            <span>{{handValue}}</span>
        </div>
    </div>
    `
}