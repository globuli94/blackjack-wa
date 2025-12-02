class UIRenderer {
    constructor(gameStateManager, gameUtils) {
        this.gameStateManager = gameStateManager;
        this.gameUtils = gameUtils;
        this.onPlayerEventListenersAttached = null;
    }

    updateGameUI() {
        const gameState = this.gameStateManager.getState();
        if (!gameState) return;

        console.log('Updating UI with state:', gameState.state);

        this.updatePlayers(gameState.players);
        this.updateDealer(gameState.dealer);
        this.updateGameControls(gameState.state);

        console.log('✅ Game state updated');
        console.log('📊 Players:', gameState.players.length);
        console.log('🎴 Total cards:', gameState.deck?.cards?.length || 'unknown');
    }

    updatePlayers(players) {
        const playerSection = $('.player-section');
        playerSection.empty();

        if (!players || players.length === 0) {
            console.log('No players to display');
            return;
        }

        const currentIdx = this.gameStateManager.getCurrentPlayerIndex();
        const gameState = this.gameStateManager.getGameState();

        players.forEach((player, index) => {
            const isCurrentPlayer = index === currentIdx;
            const playerHtml = this.createPlayerCard(player, isCurrentPlayer, gameState);
            playerSection.append(playerHtml);
        });

        if (this.onPlayerEventListenersAttached) {
            this.onPlayerEventListenersAttached();
        }

        // Focus bet input for current player
        if ($('.current-player input.bet-input').length > 0) {
            $('.current-player input.bet-input').focus();
        }
    }

    createPlayerCard(player, isCurrent, gameState) {
        const currentClass = isCurrent &&
        (gameState === 'Betting' || gameState === 'Started')
            ? 'current-player' : '';

        return `
            <div class="col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
                <div class="player ${currentClass}" data-player-name="${player.name}">
                    <p class="player-name">${player.name}</p>
                    
                    <div class="cards-container d-flex justify-content-center flex-wrap gap-2">
                        ${player.hand.cards.map(card => this.createCardHtml(card)).join('')}
                    </div>
                    
                    <div class="hand-info d-flex justify-content-center gap-2">
                        ${player.hand.cards.length > 0 ? `
                            <span>${this.gameUtils.getHandValue(player.hand)}</span>
                            <span>${this.gameUtils.getPlayerStateText(player.state)}</span>
                        ` : ''}
                    </div>
                    
                    <div class="money-bet-display d-flex justify-content-center align-items-center gap-2 mt-1">
                        <span>${player.money}</span>
                        <img class="dollars-icon" src="/assets/images/icons/dollars.png" alt="Dollars">
                        <span>${player.bet}</span>
                        <img class="chip-icon" src="/assets/images/icons/casino-chip.png" alt="Chip">
                    </div>
                    
                    <div class="player-actions d-flex flex-wrap justify-content-center gap-2 mt-2">
                        ${this.createPlayerActions(player, isCurrent, gameState)}
                    </div>
                </div>
            </div>
        `;
    }

    createCardHtml(card) {
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

    createPlayerActions(player, isCurrent, gameState) {
        let html = '';

        // Betting Form
        if (gameState === 'Betting' && isCurrent) {
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
        if (gameState === 'Started' && isCurrent) {
            html += `
                <button class="btn btn-primary action-stand" title="🛑 Keine weitere Karte nehmen">Stand</button>
            `;

            if (this.gameUtils.canHit(player.hand)) {
                html += `
                    <button class="btn btn-warning action-hit" title="🎴 Nimm eine weitere Karte">Hit</button>
                `;
            }

            if (this.gameUtils.canDoubleDown(player)) {
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

    updateDealer(dealer) {
        const dealerSection = $('.dealer-section');

        if (!dealer || dealer.hand.cards.length === 0) {
            dealerSection.empty();
            return;
        }

        const cards = dealer.hand.cards.map(card => this.createCardHtml(card)).join('');

        const blankCard = dealer.hand.cards.length === 1
            ? this.createCardHtml({rank: 'blank', suit: 'blank'})
            : '';

        dealerSection.html(`
            <div class="dealer">
                <p>Dealer</p>
                <div class="card-container">
                    ${cards}
                    ${blankCard}
                </div>
                ${dealer.hand.cards.length > 0 ? `<p>Value: ${this.gameUtils.getHandValue(dealer.hand)}</p>` : ''}
            </div>
        `);
    }

    updateGameControls(gameState) {
        const gameControls = $('.game-controls');
        gameControls.empty();

        const players = this.gameStateManager.getPlayers();
        console.log('Updating game controls for state:', gameState);
        console.log('Players count:', players.length);

        // Start Game Button
        if (gameState === 'Initialized' && players.length > 0) {
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
    }
}