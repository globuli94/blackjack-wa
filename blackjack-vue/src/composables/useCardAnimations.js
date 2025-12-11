/**
 * Card animations composable for Vue 3
 * Converts jQuery-based animations to Vue 3 compatible functions
 */
export function useCardAnimations() {
  /**
   * Deal card animation - card appears from top with rotation
   */
  const dealCard = (element, delay = 0, callback = null) => {
    if (!element) return

    // Set initial state
    element.style.opacity = '0'
    element.style.transform = 'translateY(-100px) rotate(-10deg) scale(0.5)'
    element.style.transition = 'none'

    setTimeout(() => {
      element.style.transition = 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)'
      element.style.opacity = '1'
      element.style.transform = 'translateY(0) rotate(0deg) scale(1)'

      if (callback) {
        setTimeout(callback, 800)
      }
    }, delay)
  }

  /**
   * Flip card animation - 3D flip effect
   */
  const flipCard = (element, newImageSrc, callback = null) => {
    if (!element) return

    const img = element.querySelector('img')
    if (!img) return

    element.style.transition = 'transform 0.6s'
    element.style.transformStyle = 'preserve-3d'

    // Flip to 90deg (edge view)
    element.style.transform = 'rotateY(90deg)'

    setTimeout(() => {
      // Change image at edge
      if (img) {
        img.src = newImageSrc
      }

      // Flip to 180deg (show new face)
      element.style.transform = 'rotateY(180deg)'

      setTimeout(() => {
        element.style.transform = 'rotateY(0deg)'
        if (callback) {
          setTimeout(callback, 300)
        }
      }, 300)
    }, 300)
  }

  /**
   * Slide in animation from left or right
   */
  const slideIn = (element, direction = 'left', delay = 0) => {
    if (!element) return

    const translateX = direction === 'left' ? '-150px' : '150px'

    element.style.opacity = '0'
    element.style.transform = `translateX(${translateX}) scale(0.8)`
    element.style.transition = 'none'

    setTimeout(() => {
      element.style.transition = 'all 0.9s ease-out'
      element.style.opacity = '1'
      element.style.transform = 'translateX(0) scale(1)'
    }, delay)
  }

  /**
   * Bounce animation
   */
  const bounce = (element) => {
    if (!element) return

    element.style.animation = 'cardBounce 0.8s ease'

    setTimeout(() => {
      element.style.animation = ''
    }, 600)
  }

  /**
   * Glow effect with different colors
   */
  const glow = (element, color = 'gold', duration = 2000) => {
    if (!element) return

    const glowColors = {
      gold: '0 0 20px rgba(230, 196, 92, 0.8)',
      green: '0 0 20px rgba(31, 163, 74, 0.8)',
      red: '0 0 20px rgba(220, 53, 69, 0.8)',
      blue: '0 0 20px rgba(13, 110, 253, 0.8)',
    }

    element.style.boxShadow = glowColors[color] || glowColors.gold
    element.style.transition = 'box-shadow 0.3s ease-in-out'

    if (duration > 0) {
      setTimeout(() => {
        element.style.boxShadow = 'none'
      }, duration)
    }
  }

  /**
   * Shake animation
   */
  const shake = (element) => {
    if (!element) return

    element.style.animation = 'cardShake 0.5s ease'

    setTimeout(() => {
      element.style.animation = ''
    }, 500)
  }

  /**
   * Fade out animation
   */
  const fadeOut = (element, delay = 0, callback = null) => {
    if (!element) return

    setTimeout(() => {
      element.style.transition = 'all 0.5s ease-out'
      element.style.opacity = '0'
      element.style.transform = 'scale(0.5) rotate(10deg)'

      setTimeout(() => {
        if (element.parentNode) {
          element.remove()
        }
        if (callback) callback()
      }, 500)
    }, delay)
  }

  /**
   * Pulse animation (continuous)
   */
  const pulse = (element) => {
    if (!element) return

    element.style.animation = 'cardPulse 1.5s ease-in-out infinite'
  }

  /**
   * Stop all animations
   */
  const stopAnimations = (element) => {
    if (!element) return

    element.style.animation = ''
    element.style.transition = ''
    element.style.transform = ''
    element.style.boxShadow = ''
  }

  /**
   * Deal multiple cards with staggered delay
   */
  const dealMultipleCards = (elements, delayBetween = 200, callback = null) => {
    if (!elements || elements.length === 0) return

    elements.forEach((card, index) => {
      dealCard(
        card,
        index * delayBetween,
        index === elements.length - 1 ? callback : null
      )
    })
  }

  /**
   * Shuffle effect - cards move randomly then return
   */
  const shuffleEffect = (containerElement) => {
    if (!containerElement) return

    const cards = containerElement.querySelectorAll('.playing-card, .card-item')

    cards.forEach((card, index) => {
      const randomX = (Math.random() - 0.5) * 50
      const randomY = (Math.random() - 0.5) * 50
      const randomRotate = (Math.random() - 0.5) * 30

      setTimeout(() => {
        card.style.transition = 'all 0.3s ease'
        card.style.transform = `translate(${randomX}px, ${randomY}px) rotate(${randomRotate}deg)`

        setTimeout(() => {
          card.style.transition = 'all 0.3s ease'
          card.style.transform = 'translate(0, 0) rotate(0deg)'
        }, 300)
      }, index * 50)
    })
  }

  /**
   * Celebrate animation (for Blackjack)
   */
  const celebrate = (element) => {
    if (!element) return

    element.style.animation = 'cardCelebrate 1s ease-in-out'
    glow(element, 'gold', 1000)

    setTimeout(() => {
      element.style.animation = ''
    }, 1000)
  }

  /**
   * Confetti effect
   */
  const confetti = (element) => {
    if (!element || typeof document === 'undefined') return

    const colors = ['#e6c45c', '#1fa34a', '#f5f5f5', '#ffd700']
    const confettiCount = 20

    const rect = element.getBoundingClientRect()
    const startX = rect.left + rect.width / 2
    const startY = rect.top + rect.height / 2

    for (let i = 0; i < confettiCount; i++) {
      const confettiEl = document.createElement('div')
      confettiEl.className = 'confetti'
      const color = colors[Math.floor(Math.random() * colors.length)]
      const angle = (Math.random() * 360) * (Math.PI / 180)
      const distance = 50 + Math.random() * 100
      const endX = startX + Math.cos(angle) * distance
      const endY = startY + Math.sin(angle) * distance

      confettiEl.style.cssText = `
        position: fixed;
        left: ${startX}px;
        top: ${startY}px;
        width: 10px;
        height: 10px;
        background-color: ${color};
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
      `

      document.body.appendChild(confettiEl)

      setTimeout(() => {
        confettiEl.style.transition = 'all 1s ease-out'
        confettiEl.style.left = `${endX}px`
        confettiEl.style.top = `${endY}px`
        confettiEl.style.opacity = '0'
        confettiEl.style.transform = 'scale(0)'

        setTimeout(() => confettiEl.remove(), 1000)
      }, 10)
    }
  }

  return {
    dealCard,
    flipCard,
    slideIn,
    bounce,
    glow,
    shake,
    fadeOut,
    pulse,
    stopAnimations,
    dealMultipleCards,
    shuffleEffect,
    celebrate,
    confetti,
  }
}

