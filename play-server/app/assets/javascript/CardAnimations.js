

const CardAnimations = {

    dealCard: function(cardElement, delay = 0, callback = null) {
        cardElement.css({
            opacity: 0,
            transform: 'translateY(-100px) rotate(-10deg) scale(0.5)',
            transition: 'none'
        });

        setTimeout(() => {
            cardElement.css({
                transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
                opacity: 1,
                transform: 'translateY(0) rotate(0deg) scale(1)'
            });

            if (callback) {
                setTimeout(callback, 800);
            }
        }, delay);
    },

    flipCard: function(cardElement, newImageSrc, callback = null) {
        const img = cardElement.find('img');

        cardElement.css({
            transition: 'transform 0.6s',
            transformStyle: 'preserve-3d'
        });

        // Flip to 90deg (edge view)
        cardElement.css('transform', 'rotateY(90deg)');

        setTimeout(() => {
            // Change image at edge
            img.attr('src', newImageSrc);

            // Flip to 180deg (show new face)
            cardElement.css('transform', 'rotateY(180deg)');

            setTimeout(() => {
                cardElement.css('transform', 'rotateY(0deg)');
                if (callback) {
                    setTimeout(callback, 300);
                }
            }, 300);
        }, 300);
    },
    
    slideIn: function(cardElement, direction = 'left', delay = 0) {
        const translateX = direction === 'left' ? '-150px' : '150px';

        cardElement.css({
            opacity: 0,
            transform: `translateX(${translateX}) scale(0.8)`,
            transition: 'none'
        });

        setTimeout(() => {
            cardElement.css({
                transition: 'all 0.9s ease-out',
                opacity: 1,
                transform: 'translateX(0) scale(1)'
            });
        }, delay);
    },


    bounce: function(cardElement) {
        cardElement.css({
            animation: 'cardBounce 0.8s ease'
        });

        setTimeout(() => {
            cardElement.css('animation', '');
        }, 600);
    },

    glow: function(cardElement, color = 'gold', duration = 2000) {
        const glowColors = {
            gold: '0 0 20px rgba(230, 196, 92, 0.8)',
            green: '0 0 20px rgba(31, 163, 74, 0.8)',
            red: '0 0 20px rgba(220, 53, 69, 0.8)',
            blue: '0 0 20px rgba(13, 110, 253, 0.8)'
        };

        cardElement.css({
            boxShadow: glowColors[color] || glowColors.gold,
            transition: 'box-shadow 0.3s ease-in-out'
        });

        if (duration > 0) {
            setTimeout(() => {
                cardElement.css('boxShadow', 'none');
            }, duration);
        }
    },

    shake: function(cardElement) {
        cardElement.css({
            animation: 'cardShake 0.5s ease'
        });

        setTimeout(() => {
            cardElement.css('animation', '');
        }, 500);
    },

    fadeOut: function(cardElement, delay = 0, callback = null) {
        setTimeout(() => {
            cardElement.css({
                transition: 'all 0.5s ease-out',
                opacity: 0,
                transform: 'scale(0.5) rotate(10deg)'
            });

            setTimeout(() => {
                cardElement.remove();
                if (callback) callback();
            }, 500);
        }, delay);
    },

    pulse: function(cardElement) {
        cardElement.css({
            animation: 'cardPulse 1.5s ease-in-out infinite'
        });
    },

    stopAnimations: function(cardElement) {
        cardElement.css({
            animation: '',
            transition: '',
            transform: '',
            boxShadow: ''
        });
    },


    dealMultipleCards: function(cardElements, delayBetween = 200, callback = null) {
        cardElements.forEach((card, index) => {
            this.dealCard(card, index * delayBetween,
                index === cardElements.length - 1 ? callback : null
            );
        });
    },

    shuffleEffect: function(containerElement) {
        const cards = containerElement.find('.card');

        cards.each(function(index) {
            const $card = $(this);
            const randomX = (Math.random() - 0.5) * 50;
            const randomY = (Math.random() - 0.5) * 50;
            const randomRotate = (Math.random() - 0.5) * 30;

            setTimeout(() => {
                $card.css({
                    transition: 'all 0.3s ease',
                    transform: `translate(${randomX}px, ${randomY}px) rotate(${randomRotate}deg)`
                });

                setTimeout(() => {
                    $card.css({
                        transition: 'all 0.3s ease',
                        transform: 'translate(0, 0) rotate(0deg)'
                    });
                }, 300);
            }, index * 50);
        });
    },


    celebrate: function(cardElement) {
        cardElement.css({
            animation: 'cardCelebrate 1s ease-in-out'
        });

        this.glow(cardElement, 'gold', 1000);

        setTimeout(() => {
            cardElement.css('animation', '');
        }, 1000);
    },

    confetti: function(cardElement) {
        const colors = ['#e6c45c', '#1fa34a', '#f5f5f5', '#ffd700'];
        const confettiCount = 20;

        const offset = cardElement.offset();
        const width = cardElement.width();
        const height = cardElement.height();

        for (let i = 0; i < confettiCount; i++) {
            const confetti = $('<div class="confetti"></div>');
            const color = colors[Math.floor(Math.random() * colors.length)];
            const startX = offset.left + width / 2;
            const startY = offset.top + height / 2;
            const angle = (Math.random() * 360) * (Math.PI / 180);
            const distance = 50 + Math.random() * 100;
            const endX = startX + Math.cos(angle) * distance;
            const endY = startY + Math.sin(angle) * distance;

            confetti.css({
                position: 'absolute',
                left: startX + 'px',
                top: startY + 'px',
                width: '10px',
                height: '10px',
                backgroundColor: color,
                borderRadius: '50%',
                pointerEvents: 'none',
                zIndex: 9999
            });

            $('body').append(confetti);

            setTimeout(() => {
                confetti.css({
                    transition: 'all 1s ease-out',
                    left: endX + 'px',
                    top: endY + 'px',
                    opacity: 0,
                    transform: 'scale(0)'
                });

                setTimeout(() => confetti.remove(), 1000);
            }, 10);
        }
    }
};

if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes cardBounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-20px); }
        }

        @keyframes cardShake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-10px) rotate(-5deg); }
            75% { transform: translateX(10px) rotate(5deg); }
        }

        @keyframes cardPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }

        @keyframes cardCelebrate {
            0%, 100% { transform: scale(1) rotate(0deg); }
            25% { transform: scale(1.1) rotate(-5deg); }
            50% { transform: scale(1.15) rotate(0deg); }
            75% { transform: scale(1.1) rotate(5deg); }
        }
    `;
    document.head.appendChild(style);
}

// Export for use in main.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CardAnimations;
}
