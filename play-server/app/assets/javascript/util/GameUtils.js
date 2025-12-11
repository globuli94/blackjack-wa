class GameUtils {
    getHandValue(hand) {
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

    canHit(hand) {
        return this.getHandValue(hand) < 21;
    }

    canDoubleDown(player) {
        return player.hand.cards.length === 2 &&
            this.getHandValue(player.hand) < 21 &&
            player.bet <= player.money;
    }

    getPlayerStateText(state) {
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

    getCsrfToken() {
        return $('input[name="csrfToken"]').val();
    }

    validatePlayerName(name) {
        if (name === '') {
            return { valid: false, message: '⚠️ Bitte gib einen Spielernamen ein!' };
        }
        if (name.length < 2) {
            return { valid: false, message: '⚠️ Der Name muss mindestens 2 Zeichen lang sein!' };
        }
        if (!/^[a-zA-ZäöüÄÖÜß0-9\s]+$/.test(name)) {
            return { valid: false, message: '⚠️ Der Name darf nur Buchstaben, Zahlen und Leerzeichen enthalten!' };
        }
        return { valid: true };
    }

    validateBet(bet, maxBet) {
        if (bet === '') {
            return { valid: false, message: '⚠️ Bitte gib einen Betrag ein!' };
        }
        if (isNaN(bet) || parseInt(bet) <= 0) {
            return { valid: false, message: '⚠️ Bitte gib einen gültigen Betrag ein (nur Zahlen > 0)!' };
        }
        if (parseInt(bet) > maxBet) {
            return { valid: false, message: `💰 Du hast nicht genug Geld für diesen Einsatz!\n\nDein Guthaben: ${maxBet}$\nDein Einsatz: ${bet}$` };
        }
        return { valid: true };
    }
}


