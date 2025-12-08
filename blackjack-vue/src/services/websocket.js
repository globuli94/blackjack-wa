export class WebSocketManager {
  constructor(onMessageCallback) {
    this.socket = null
    this.onMessageCallback = onMessageCallback
  }

  connect() {
    const wsUrl = `ws://localhost:9000/websocket`

    console.log('Connecting to WebSocket...', wsUrl)
    this.socket = new WebSocket(wsUrl)

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