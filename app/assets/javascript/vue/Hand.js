const Hand = {
    components: { Card },
    props: {
        hand: { type: Object, required: true, default: () => ({ cards: [] }) },
        gameUtils: { type: Object, required: true }
    },
    computed: {
        handValue() {
            const value = this.gameUtils.getHandValue(this.hand)
            if(value === 21) {
                return "Blackjack"
            }

            if(value > 21) {
                return "Bust"
            }

            return this.gameUtils.getHandValue(this.hand)
        },
        paddedCards() {
            if (!this.hand || !this.hand.cards) return []
            if (this.hand.cards.length === 1) {
                return [...this.hand.cards, {rank: "blank", suit: "blank" }]
            }
            return this.hand.cards
        }
    },
    template: `
    <div class="hand" style="position: relative; display: inline-block;">
      <div class="cards-container d-flex justify-content-center flex-wrap">
        <div class="hand-value-wrapper" style="position: relative; display: flex; align-items: flex-end;">
          <div v-if="handValue > 0 || handValue === 'Blackjack' || handValue === 'Bust'" class="hand-value">
            {{ handValue }}
          </div>
          <Card
            v-for="(card, index) in paddedCards"
            :key="index"
            :card="card"
            class="overlap-card"
            :style="{ 
              zIndex: index, 
              marginLeft: index === 0 ? '0' : 'clamp(-40px, -3vw, -20px)' 
            }"
          />
        </div>
      </div>
    </div>
  `
}