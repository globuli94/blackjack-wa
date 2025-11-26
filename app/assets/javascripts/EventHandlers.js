class EventHandlers {
    constructor(apiService, uiRenderer, gameUtils, gameStateManager) {
        this.apiService = apiService;
        this.uiRenderer = uiRenderer;
        this.gameUtils = gameUtils;
        this.gameStateManager = gameStateManager;
    }

    attachControlEventListeners() {
        $('.control-start').off('click').on('click', () => {
            console.log('Start game clicked');
            this.apiService.startGame()
                .done(() => console.log('Start game request sent'))
                .fail((xhr) => {
                    console.error('Start game error:', xhr);
                    alert('❌ Fehler beim Starten: ' + (xhr.responseJSON?.message || 'Unbekannter Fehler'));
                });
        });

        $('.control-reset').off('click').on('click', () => {
            if (confirm('🔄 Möchtest du das Spiel wirklich neu starten?')) {
                console.log('Reset game clicked');
                this.apiService.initializeGame()
                    .done(() => console.log('Reset game request sent'))
                    .fail((xhr) => {
                        console.error('Reset game error:', xhr);
                        alert('❌ Fehler beim Zurücksetzen: ' + (xhr.responseJSON?.message || 'Unbekannter Fehler'));
                    });
            }
        });
    }

    attachPlayerEventListeners() {
        // Bet Input
        $('.bet-input').off('keypress').on('keypress', (e) => {
            if (e.which === 13) {
                e.preventDefault();
                const bet = $(e.target).val().trim();
                const maxBet = parseInt($(e.target).attr('max'));

                const validation = this.gameUtils.validateBet(bet, maxBet);
                if (!validation.valid) {
                    alert(validation.message);
                    if (validation.message.includes('gültigen')) {
                        $(e.target).val('').focus();
                    }
                    return;
                }

                this.submitBet(bet);
            }
        });

        $('.bet-input').off('keydown').on('keydown', (e) => {
            if (e.which != 8 && e.which != 0 && e.which != 13 && (e.which < 48 || e.which > 57)) {
                return false;
            }
        });

        // Stand
        $('.action-stand').off('click').on('click', () => {
            this.apiService.stand()
                .done(() => console.log('Stand request sent'))
                .fail((xhr) => {
                    alert('❌ Fehler: ' + (xhr.responseJSON?.message || 'Unbekannter Fehler'));
                });
        });

        // Hit
        $('.action-hit').off('click').on('click', () => {
            this.apiService.hit()
                .done(() => console.log('Hit request sent'))
                .fail((xhr) => {
                    alert('❌ Fehler: ' + (xhr.responseJSON?.message || 'Unbekannter Fehler'));
                });
        });

        // Double Down
        $('.action-double').off('click').on('click', () => {
            const player = $('.action-double').closest('.player');
            const currentBet = parseInt(player.find('.money-bet-display span:last').text());

            if (confirm(`🎲 Möchtest du deinen Einsatz verdoppeln?\n\nAktueller Einsatz: ${currentBet}$\nNeuer Einsatz: ${currentBet * 2}$\n\nDu bekommst danach nur noch EINE Karte!`)) {
                this.apiService.doubleDown()
                    .done(() => console.log('Double down request sent'))
                    .fail((xhr) => {
                        alert('❌ Fehler: ' + (xhr.responseJSON?.message || 'Unbekannter Fehler'));
                    });
            }
        });

        // Leave Player
        $('.action-leave').off('click').on('click', (e) => {
            const playerName = $(e.target).closest('.player').find('.player-name').text();

            if (confirm(`👋 Möchtest du das Spiel wirklich verlassen, ${playerName}?`)) {
                this.apiService.leavePlayer()
                    .done(() => console.log('Leave player request sent'))
                    .fail((xhr) => {
                        alert('❌ Fehler: ' + (xhr.responseJSON?.message || 'Unbekannter Fehler'));
                    });
            }
        });
    }

    attachModalEventListeners() {
        $('#addPlayerModal').on('show.bs.modal', () => {
            $('#playerName').val('');
        });

        $('#addPlayerForm').on('submit', (e) => {
            e.preventDefault();

            const playerName = $('#playerName').val().trim();
            const validation = this.gameUtils.validatePlayerName(playerName);

            if (!validation.valid) {
                alert(validation.message);
                $('#playerName').focus();
                return false;
            }

            this.apiService.addPlayer(playerName)
                .done((response) => {
                    console.log('Player added successfully:', response);
                    const modal = bootstrap.Modal.getInstance(document.getElementById('addPlayerModal'));
                    modal.hide();
                    $('#playerName').val('');
                })
                .fail((xhr) => {
                    console.error('Add player error:', xhr);
                    alert('❌ Fehler beim Hinzufügen: ' + (xhr.responseJSON?.message || 'Unbekannter Fehler'));
                });
        });
    }

    submitBet(bet) {
        console.log('Submitting bet:', bet);
        this.apiService.bet(bet)
            .done(() => console.log('Bet request sent'))
            .fail((xhr) => {
                console.error('Bet error:', xhr);
                alert('❌ Fehler beim Setzen: ' + (xhr.responseJSON?.message || 'Unbekannter Fehler'));
            });
    }
}