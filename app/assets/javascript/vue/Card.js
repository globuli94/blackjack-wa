const Card = {
    props: {
        card: {
            type: Object,
            required: true
        }
    },
    methods: {
        getCardImage(card) {
            if(!card || card.rank === 'blank') {
                return '/assets/images/deck_pngs/back.png';
            }

            const rank =
                card.rank === 'J' ? 'Jack' :
                card.rank === 'Q' ? 'Queen' :
                card.rank === 'K' ? 'King' :
                card.rank === 'A' ? 'Ace' : card.rank;

            return `/assets/images/deck_pngs/${card.suit}${rank}.png`;
        }
    },
    template:
    `
      <div class="card">
        <img :src="getCardImage(card)">
      </div>  
    `
}