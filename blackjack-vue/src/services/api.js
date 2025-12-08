import { api } from "src/boot/axios";

const API_BASE = '/api';

const getCsrfToken = () => {
  return document.querySelector('input[name="csrfToken"]')?.value || ''
}

export const gameApi = {
  // Game Control
  initializeGame: () => api.get(`${API_BASE}/initializeGame`),
  startGame: () => api.get(`${API_BASE}/startGame`),
  getGameState: () => api.get(`${API_BASE}/gameState`),

  // Player Management
  addPlayer: (playerName) => {
    const params = new URLSearchParams()
    params.append('PlayerForm', playerName)
    params.append('csrfToken', getCsrfToken())
    return api.post(`${API_BASE}/addPlayer`, params)
  },

  leavePlayer: () => api.get(`${API_BASE}/leavePlayer`),

  // Game Actions
  hit: () => api.get(`${API_BASE}/hit`),
  stand: () => api.get(`${API_BASE}/stand`),
  doubleDown: () => api.get(`${API_BASE}/doubleDown`),

  bet: (amount) => {
    const params = new URLSearchParams()
    params.append('BetForm', amount)
    params.append('csrfToken', getCsrfToken())
    return api.post(`${API_BASE}/bet`, params)
  }
}