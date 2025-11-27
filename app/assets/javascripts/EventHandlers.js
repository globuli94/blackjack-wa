class EventHandlers {
    constructor(apiService, uiRenderer, gameUtils, gameStateManager) {
        this.apiService = apiService;
        this.uiRenderer = uiRenderer;
        this.gameUtils = gameUtils;
        this.gameStateManager = gameStateManager;
    }

    attachControlEventListeners() {
        const controls = $('.game-controls');

        // Remove old delegated handlers
        controls.off('click', '.control-start');
        controls.off('click', '.control-reset');
        controls.off('click', '.control-add-player');

        controls.on('click', '.control-start', () => {
            this.apiService.startGame()
                .done(() => console.log('Start game request sent'))
                .fail(xhr => alert('❌ Fehler beim Starten'));
        });

        controls.on('click', '.control-reset', () => {
            if (confirm('Reset game?')) {
                this.apiService.initializeGame()
                    .done(() => console.log('Reset game request sent'))
                    .fail(xhr => alert('❌ Fehler beim Zurücksetzen'));
            }
        });

        controls.on('click', '.control-add-player', () => {
            // optional extra logic; Bootstrap’s data attributes still fire
        });
    }

    attachPlayerEventListeners() {
        // Use event delegation on the player-section container
        // This way listeners work even when DOM is replaced
        
        // Remove old listeners first to avoid duplicates
        $('.player-section').off('keypress', '.bet-input');
        $('.player-section').off('keydown', '.bet-input');
        $('.player-section').off('click', '.action-stand');
        $('.player-section').off('click', '.action-hit');
        $('.player-section').off('click', '.action-double');
        $('.player-section').off('click', '.action-leave');

        // Bet Input - Event delegation
        $('.player-section').on('keypress', '.bet-input', (e) => {
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

        $('.player-section').on('keydown', '.bet-input', (e) => {
            if (e.which != 8 && e.which != 0 && e.which != 13 && (e.which < 48 || e.which > 57)) {
                return false;
            }
        });

        // Stand - Event delegation
        $('.player-section').on('click', '.action-stand', () => {
            this.apiService.stand()
                .done(() => console.log('Stand request sent'))
                .fail((xhr) => {
                    alert('❌ Fehler: ' + (xhr.responseJSON?.message || 'Unbekannter Fehler'));
                });
        });

        // Hit - Event delegation
        $('.player-section').on('click', '.action-hit', () => {
            this.apiService.hit()
                .done(() => console.log('Hit request sent'))
                .fail((xhr) => {
                    alert('❌ Fehler: ' + (xhr.responseJSON?.message || 'Unbekannter Fehler'));
                });
        });

        // Double Down - Event delegation
        $('.player-section').on('click', '.action-double', (e) => {
            const player = $(e.target).closest('.player');
            const currentBet = parseInt(player.find('.money-bet-display span:last').text());

            if (confirm(`�� Möchtest du deinen Einsatz verdoppeln?\n\nAktueller Einsatz: ${currentBet}$\nNeuer Einsatz: ${currentBet * 2}$\n\nDu bekommst danach nur noch EINE Karte!`)) {
                this.apiService.doubleDown()
                    .done(() => console.log('Double down request sent'))
                    .fail((xhr) => {
                        alert('❌ Fehler: ' + (xhr.responseJSON?.message || 'Unbekannter Fehler'));
                    });
            }
        });

        // Leave Player - Event delegation
        $('.player-section').on('click', '.action-leave', (e) => {
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
        // Clear input when modal opens
        $('#addPlayerModal').on('show.bs.modal', () => {
            $('#playerName').val('');
        });

        // Clean up backdrop after modal is fully hidden
        $('#addPlayerModal').on('hidden.bs.modal', () => {
            // Ensure backdrop is removed
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open');
            $('body').css('padding-right', '');
            // Reset modal display
            $('#addPlayerModal').css('display', 'none');
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
                    // Hide modal - cleanup will happen in hidden.bs.modal event
                    $('#addPlayerModal').modal('hide');
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