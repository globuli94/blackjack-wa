$(document).ready(function() {
    // Prüfe ob wir auf der Game-Seite sind
    const isGamePage = $('.game-container').length > 0;

    if (!isGamePage) {
        console.log('Not on game page, skipping game initialization');
        return;
    }

    console.log('🎰 Blackjack Game Page detected - initializing...');

    // Initialize managers and services
    const gameStateManager = new GameStateManager();
    const gameUtils = new GameUtils();
    const apiService = new APIService(gameUtils);
    const uiRenderer = new UIRenderer(gameStateManager, gameUtils);
    const eventHandlers = new EventHandlers(apiService, uiRenderer, gameUtils, gameStateManager);

    // Set up UI renderer callback for event listeners
    uiRenderer.onPlayerEventListenersAttached = () => {
        eventHandlers.attachPlayerEventListeners();
    };

    // Initialize WebSocket
    const wsManager = new WebSocketManager((gameData) => {
        gameStateManager.setState(gameData);
        uiRenderer.updateGameUI();
    });
    wsManager.connect();

    // Load initial game state via AJAX
    apiService.loadGameState()
        .done((gameState) => {
            console.log('Game state loaded via AJAX:', gameState);
            gameStateManager.setState(gameState);
            uiRenderer.updateGameUI();
        })
        .fail((xhr) => {
            console.error('Error loading game state:', xhr);
        });

    // Attach event listeners
    eventHandlers.attachModalEventListeners();

    // Attach control listeners after initial render
    $(document).on('DOMNodeInserted', '.game-controls', () => {
        eventHandlers.attachControlEventListeners();
    });

    // Initial control listeners (in case controls already exist)
    setTimeout(() => {
        eventHandlers.attachControlEventListeners();
    }, 100);

    console.log('✅ Blackjack game initialization complete');
});