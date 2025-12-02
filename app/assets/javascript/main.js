$(document).ready(function() {
    
    // Prüfe ob wir auf der Game-Seite sind
    const isGamePage = $('.game-container').length > 0;
    
    if (!isGamePage) {
        console.log('Not on game page, skipping game initialization');
        return;
    }
    
    console.log('🎰 Blackjack Game Page detected - initializing...');
    
    // ====================================
    // GAME STATE MANAGEMENT
    // ====================================
    let currentGameState = null;

    // CSRF Token Helper
    function getCsrfToken() {
        return $('input[name="csrfToken"]').val();
    }

    // ====================================
    // INITIAL LOAD
    // ====================================
    loadGameState();

    function loadGameState() {
        console.log('Loading initial game state...');
        $.get('/api/gameState')
            .done(function(gameState) {
                console.log('Game state loaded:', gameState);
                updateGameUI(gameState);
            })
            .fail(function(xhr) {
                console.error('Error loading game state:', xhr);
                alert('❌ Fehler beim Laden des Spiels');
            });
    }

    // ====================================
    // UI UPDATE FUNCTIONS
    // ====================================
    function updateGameUI(response) {
        if (response.gameState) {
            currentGameState = response.gameState;
        } else {
            currentGameState = response;
        }
        
        console.log('Updating UI with state:', currentGameState.state);
        
        updatePlayers(currentGameState.players);
        updateDealer(currentGameState.dealer);
        updateGameControls(currentGameState.state);
        
        console.log('✅ Game state updated');
        console.log('📊 Players:', currentGameState.players.length);
        console.log('🎴 Total cards:', currentGameState.deck?.cards?.length || 'unknown');
    }

    function updatePlayers(players) {
        const playerSection = $('.player-section');
        playerSection.empty();
        
        if (!players || players.length === 0) {
            console.log('No players to display');
            return;
        }
        
        players.forEach((player, index) => {
            const isCurrentPlayer = index === currentGameState.current_idx;
            const playerHtml = createPlayerCard(player, isCurrentPlayer);
            playerSection.append(playerHtml);
        });
        
        attachPlayerEventListeners();
        
        // Focus bet input for current player
        if ($('.current-player input.bet-input').length > 0) {
            $('.current-player input.bet-input').focus();
        }
    }

    function createPlayerCard(player, isCurrent) {
        const currentClass = isCurrent && 
            (currentGameState.state === 'Betting' || currentGameState.state === 'Started') 
            ? 'current-player' : '';
        
        return `
            <div class="col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
                <div class="player ${currentClass}" data-player-name="${player.name}">
                    <p class="player-name">${player.name}</p>
                    
                    <div class="cards-container d-flex justify-content-center flex-wrap gap-2">
                        ${player.hand.cards.map(card => createCardHtml(card)).join('')}
                    </div>
                    
                    <div class="hand-info d-flex justify-content-center gap-2">
                        ${player.hand.cards.length > 0 ? `
                            <span>${getHandValue(player.hand)}</span>
                            <span>${getPlayerStateText(player.state)}</span>
                        ` : ''}
                    </div>
                    
                    <div class="money-bet-display d-flex justify-content-center align-items-center gap-2 mt-1">
                        <span>${player.money}</span>
                        <img class="dollars-icon" src="/assets/images/icons/dollars.png" alt="Dollars">
                        <span>${player.bet}</span>
                        <img class="chip-icon" src="/assets/images/icons/casino-chip.png" alt="Chip">
                    </div>
                    
                    <div class="player-actions d-flex flex-wrap justify-content-center gap-2 mt-2">
                        ${createPlayerActions(player, isCurrent)}
                    </div>
                </div>
            </div>
        `;
    }

    function createCardHtml(card) {
        let imagePath;
        if (card.rank === 'blank') {
            imagePath = '/assets/images/deck_pngs/back.png';
        } else {
            const rank = card.rank === 'J' ? 'Jack' :
                        card.rank === 'Q' ? 'Queen' :
                        card.rank === 'K' ? 'King' :
                        card.rank === 'A' ? 'Ace' : card.rank;
            imagePath = `/assets/images/deck_pngs/${card.suit}${rank}.png`;
        }
        
        return `
            <div class="card">
                <img src="${imagePath}" alt="card">
            </div>
        `;
    }

    function getPlayerStateText(state) {
        const stateTexts = {
            'Blackjack': '- Blackjack',
            'Standing': '- Standing',
            'Busted': '- Busted',
            'WON': '- you won',
            'LOST': '- you lost',
            'DoubledDown': '- Doubled Down'
        };
        return stateTexts[state] || '';
    }

    function getHandValue(hand) {
        let value = 0;
        let aces = 0;
        
        hand.cards.forEach(card => {
            if (card.rank === 'A') {
                aces++;
                value += 11;
            } else if (['K', 'Q', 'J'].includes(card.rank)) {
                value += 10;
            } else {
                value += parseInt(card.rank);
            }
        });
        
        while (value > 21 && aces > 0) {
            value -= 10;
            aces--;
        }
        
        return value;
    }

    function canHit(hand) {
        return getHandValue(hand) < 21;
    }

    function canDoubleDown(player) {
        return player.hand.cards.length === 2 && 
               getHandValue(player.hand) < 21 && 
               player.bet <= player.money;
    }

    function createPlayerActions(player, isCurrent) {
        let html = '';
        
        // Betting Form (kein Submit-Button mehr!)
        if (currentGameState.state === 'Betting' && isCurrent) {
            html += `
                <div class="bet-form-container d-flex gap-2 flex-grow-1">
                    <input type="number" 
                           class="bet-input form-control flex-grow-1" 
                           placeholder="Enter bet" 
                           style="min-width:80px; max-width:150px;"
                           min="1"
                           max="${player.money}"
                           data-player="${player.name}">
                </div>
            `;
        }
        
        // Game Actions
        if (currentGameState.state === 'Started' && isCurrent) {
            html += `
                <button class="btn btn-primary action-stand" title="🛑 Keine weitere Karte nehmen">Stand</button>
            `;
            
            if (canHit(player.hand)) {
                html += `
                    <button class="btn btn-warning action-hit" title="🎴 Nimm eine weitere Karte">Hit</button>
                `;
            }
            
            if (canDoubleDown(player)) {
                html += `
                    <button class="btn btn-danger action-double" title="💰 Verdopple deinen Einsatz (nur 1 Karte)">Double Down</button>
                `;
            }
        }
        
        // Leave Button
        html += `
            <button class="btn btn-secondary action-leave" data-player="${player.name}" title="👋 Spiel verlassen">
                <i class="bi bi-box-arrow-left"></i>
            </button>
        `;
        
        return html;
    }

    function updateDealer(dealer) {
        const dealerSection = $('.dealer-section');
        
        if (!dealer || dealer.hand.cards.length === 0) {
            dealerSection.empty();
            return;
        }
        
        const cards = dealer.hand.cards.map(card => createCardHtml(card)).join('');
        
        const blankCard = dealer.hand.cards.length === 1 
            ? createCardHtml({rank: 'blank', suit: 'blank'}) 
            : '';
        
        dealerSection.html(`
            <div class="dealer">
                <p>Dealer</p>
                <div class="card-container">
                    ${cards}
                    ${blankCard}
                </div>
                ${dealer.hand.cards.length > 0 ? `<p>Value: ${getHandValue(dealer.hand)}</p>` : ''}
            </div>
        `);
    }

    function updateGameControls(gameState) {
        const gameControls = $('.game-controls');
        gameControls.empty();
        
        console.log('Updating game controls for state:', gameState);
        console.log('Players count:', currentGameState.players.length);
        
        // Start Game Button
        if (gameState === 'Initialized' && currentGameState.players.length > 0) {
            console.log('Adding START button');
            gameControls.append(`
                <button class="button control-start" type="button" title="Spiel starten">
                    <i class="bi bi-play-fill"></i>
                </button>
            `);
        }
        
        // Add Player Button
        if (gameState === 'Initialized') {
            console.log('Adding ADD PLAYER button');
            gameControls.append(`
                <button type="button" class="button control-add-player" data-bs-toggle="modal" data-bs-target="#addPlayerModal" title="Spieler hinzufügen">
                    <i class="bi bi-person-plus-fill"></i>
                </button>
            `);
        }
        
        // Reset Button
        console.log('Adding RESET button');
        gameControls.append(`
            <button class="button control-reset" type="button" title="Spiel zurücksetzen">
                <i class="bi bi-arrow-counterclockwise"></i>
            </button>
        `);
        
        attachControlEventListeners();
    }

    // ====================================
    // EVENT LISTENERS - GAME CONTROLS
    // ====================================
    function attachControlEventListeners() {
        $('.control-start').off('click').on('click', function() {
            console.log('Start game clicked');
            $.get('/api/startGame')
                .done(function(response) {
                    if (response.success) {
                        updateGameUI(response);
                    }
                })
                .fail(function(xhr) {
                    console.error('Start game error:', xhr);
                    alert('❌ Fehler beim Starten: ' + (xhr.responseJSON?.message || 'Unbekannter Fehler'));
                });
        });
        
        $('.control-reset').off('click').on('click', function() {
            if (confirm('🔄 Möchtest du das Spiel wirklich neu starten?')) {
                console.log('Reset game clicked');
                $.get('/api/initializeGame')
                    .done(function(response) {
                        if (response.success) {
                            updateGameUI(response);
                        }
                    })
                    .fail(function(xhr) {
                        console.error('Reset game error:', xhr);
                        alert('❌ Fehler beim Zurücksetzen: ' + (xhr.responseJSON?.message || 'Unbekannter Fehler'));
                    });
            }
        });
    }

    // ====================================
    // EVENT LISTENERS - PLAYER ACTIONS
    // ====================================
    function attachPlayerEventListeners() {
        // Bet Input - Enter drücken zum Wetten (KEIN Submit-Button!)
        $('.bet-input').off('keypress').on('keypress', function(e) {
            if (e.which === 13) { // Enter key
                e.preventDefault();
                const bet = $(this).val().trim();
                const maxBet = parseInt($(this).attr('max'));
                
                // Validierung
                if (bet === '') {
                    alert('⚠️ Bitte gib einen Betrag ein!');
                    return;
                }
                
                if (isNaN(bet) || parseInt(bet) <= 0) {
                    alert('⚠️ Bitte gib einen gültigen Betrag ein (nur Zahlen > 0)!');
                    $(this).val('').focus();
                    return;
                }
                
                if (parseInt(bet) > maxBet) {
                    alert(`💰 Du hast nicht genug Geld für diesen Einsatz!\n\nDein Guthaben: ${maxBet}$\nDein Einsatz: ${bet}$`);
                    return;
                }
                
                submitBet(bet);
            }
        });
        
        // Nur Zahlen erlauben
        $('.bet-input').off('keydown').on('keydown', function(e) {
            if (e.which != 8 && e.which != 0 && e.which != 13 && (e.which < 48 || e.which > 57)) {
                return false;
            }
        });
        
        // Stand
        $('.action-stand').off('click').on('click', function() {
            $.get('/api/stand')
                .done(function(response) {
                    if (response.success) {
                        updateGameUI(response);
                    }
                })
                .fail(function(xhr) {
                    alert('❌ Fehler: ' + (xhr.responseJSON?.message || 'Unbekannter Fehler'));
                });
        });
        
        // Hit
        $('.action-hit').off('click').on('click', function() {
            $.get('/api/hit')
                .done(function(response) {
                    if (response.success) {
                        updateGameUI(response);
                    }
                })
                .fail(function(xhr) {
                    alert('❌ Fehler: ' + (xhr.responseJSON?.message || 'Unbekannter Fehler'));
                });
        });
        
        // Double Down
        $('.action-double').off('click').on('click', function() {
            const player = $(this).closest('.player');
            const currentBet = parseInt(player.find('.money-bet-display span:last').text());
            
            if (confirm(`🎲 Möchtest du deinen Einsatz verdoppeln?\n\nAktueller Einsatz: ${currentBet}$\nNeuer Einsatz: ${currentBet * 2}$\n\nDu bekommst danach nur noch EINE Karte!`)) {
                $.get('/api/doubleDown')
                    .done(function(response) {
                        if (response.success) {
                            updateGameUI(response);
                        }
                    })
                    .fail(function(xhr) {
                        alert('❌ Fehler: ' + (xhr.responseJSON?.message || 'Unbekannter Fehler'));
                    });
            }
        });
        
        // Leave Player
        $('.action-leave').off('click').on('click', function() {
            const playerName = $(this).closest('.player').find('.player-name').text();
            
            if (confirm(`👋 Möchtest du das Spiel wirklich verlassen, ${playerName}?`)) {
                $.get('/api/leavePlayer')
                    .done(function(response) {
                        if (response.success) {
                            updateGameUI(response);
                        }
                    })
                    .fail(function(xhr) {
                        alert('❌ Fehler: ' + (xhr.responseJSON?.message || 'Unbekannter Fehler'));
                    });
            }
        });
    }

    function submitBet(bet) {
        console.log('Submitting bet:', bet);
        $.ajax({
            url: '/api/bet',
            method: 'POST',
            data: {
                BetForm: bet,
                csrfToken: getCsrfToken()
            }
        }).done(function(response) {
            if (response.success) {
                updateGameUI(response);
            }
        }).fail(function(xhr) {
            console.error('Bet error:', xhr);
            alert('❌ Fehler beim Setzen: ' + (xhr.responseJSON?.message || 'Unbekannter Fehler'));
        });
    }

    // ====================================
    // ADD PLAYER MODAL
    // ====================================
    $('#addPlayerModal').on('show.bs.modal', function() {
        $('#playerName').val('');
    });
    
    $('#addPlayerForm').on('submit', function(e) {
        e.preventDefault();
        
        const playerName = $('#playerName').val().trim();
        
        // Validierung
        if (playerName === '') {
            alert('⚠️ Bitte gib einen Spielernamen ein!');
            $('#playerName').focus();
            return false;
        }
        
        if (playerName.length < 2) {
            alert('⚠️ Der Name muss mindestens 2 Zeichen lang sein!');
            $('#playerName').focus();
            return false;
        }
        
        if (!/^[a-zA-ZäöüÄÖÜß0-9\s]+$/.test(playerName)) {
            alert('⚠️ Der Name darf nur Buchstaben, Zahlen und Leerzeichen enthalten!');
            return false;
        }

        const csrfToken = $('#addPlayerForm input[name="csrfToken"]').val();
        
        console.log('Adding player:', playerName);
        $.ajax({
            url: '/api/addPlayer',
            method: 'POST',
            data: {
                PlayerForm: playerName,
                csrfToken: csrfToken
            }
        }).done(function(response) {
            console.log('Player added successfully:', response);
            if (response.success) {
                updateGameUI(response);
                
                // Close modal and clear input
                const modal = bootstrap.Modal.getInstance(document.getElementById('addPlayerModal'));
                modal.hide();
                $('#playerName').val('');
            }
        }).fail(function(xhr) {
            console.error('Add player error:', xhr);
            alert('❌ Fehler beim Hinzufügen: ' + (xhr.responseJSON?.message || 'Unbekannter Fehler'));
        });
    });

    console.log('✅ Blackjack game initialization complete');
});