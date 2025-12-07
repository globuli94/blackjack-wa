const Dealer = {
    components: {
        Hand
    },
    props: {
        dealer: {
          type: Object,
          required: true,
        },
        gameUtils: {
            type: Object,
            required: true,
        }
    },
    methods: {

    },
    template: `
        <div class="dealer">
            <p>Dealer</p>
            <div class="hand-info d-flex justify-content-center gap-2">
                <Hand
                    :hand="dealer.hand"
                    :gameUtils="gameUtils"
                />
            </div>
        </div>
    `
}