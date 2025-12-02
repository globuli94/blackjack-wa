$(document).ready(function() {
    // Prüfe ob wir auf der Game-Seite sind
    const isGamePage = $('.game-container').length > 0;
    if (!isGamePage) {
        console.log('Not on game page, skipping game initialization');
        return;
    } else {
        console.log('blackjack game page detected - initializing...');
    }

    // Initialize managers and services
    const gameStateManager = new GameStateManager();
    const gameUtils = new GameUtils();
    const apiService = new APIService(gameUtils);
    const uiRenderer = new UIRenderer(gameStateManager, gameUtils);
    const eventHandlers = new EventHandlers(apiService, uiRenderer, gameUtils, gameStateManager);

    // Initialize WebSocket
    const wsManager = new WebSocketManager((gameData) => {
        gameStateManager.setState(gameData);
        uiRenderer.updateGameUI();
    });
    wsManager.connect();

    // Attach event listeners ONCE (they use delegation, so they persist)
    eventHandlers.attachModalEventListeners();
    eventHandlers.attachPlayerEventListeners(); // Attach once, not in callback

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