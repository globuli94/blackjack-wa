export class WebSocketManager {
  constructor(onMessageCallback, authStore) {
    this.socket = null
    this.onMessageCallback = onMessageCallback
    this.authStore = authStore
    this.setupOnlineListener();
  }

  setupOnlineListener() {
    window.addEventListener('online', () => {
      if (!this.socket || this.socket.readyState === WebSocket.CLOSED) {
        this.connect();
      }
    })

    window.addEventListener('offline', () => {
      this.socket?.close();
    })
  }

  async connect() {
    if(!navigator.onLine) {
      return;
    }

    // Get Firebase token if user is authenticated
    let token = null
    if (this.authStore?.isAuthenticated) {
      token = await this.authStore.getIdToken()
    }

    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:9000/websocket'

    // Append token as query parameter if available
    const wsUrlWithToken = token
      ? `${wsUrl}?token=${encodeURIComponent(token)}`
      : wsUrl

    console.log('Connecting to WebSocket...', wsUrl, token ? 'with auth' : 'without auth')
    this.socket = new WebSocket(wsUrlWithToken)

    this.socket.onopen = () => {
      console.log('✅ WebSocket connected')
      this.requestInitialState()
    }

    this.socket.onmessage = (event) => {
      if (event.data === 'ping') return

      try {
        const gameData = JSON.parse(event.data)
        console.log('📨 Game update:', gameData)
        this.onMessageCallback(gameData)
      } catch (error) {
        console.error('❌ WebSocket parse error:', error)
      }
    }

    this.socket.onerror = (error) => {
      console.error('❌ WebSocket error:', error)
    }

    this.socket.onclose = () => {
      console.log('⚠️ WebSocket closed')

      if (navigator.onLine) {
        setTimeout(() => this.connect(), 1000)
      }
    }
  }

  requestInitialState() {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send('getState')
    }
  }

  disconnect() {
    this.socket?.close()
  }
}
