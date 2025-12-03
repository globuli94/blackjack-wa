const Player = {
    components: {
        Hand
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
        }
    },
    methods: {

    },
    template: `
        <div :class="['player', {'current-player': currentPlayer }]">
            <p class="player-name">{{ player.name }}</p>
            <div class="hand-info d-flex justify-content-center gap-2">
                <Hand
                    :hand="player.hand"
                    :gameUtils="gameUtils"
                />
            </div>
        </div>
    `
}