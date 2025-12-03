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
        }
    },
    template: `
    <div class="hand">
        <div class="cards-container d-flex justify-content-center flex-wrap gap-2">
            <Card 
                    v-for="(card, index) in hand.cards" 
                    :key="index"
                    :card="card"    
            />
        </div>
        <div class="hand-info d-flex justify-content-center gap-2">
            <span>{{handValue}}</span>
        </div>
    </div>
    `
}