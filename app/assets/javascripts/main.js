$(document).ready(function() {
    
// removed js from addplayer
    $('#addPlayerModal').on('show.bs.modal', function() {
        $('#playerName').val('');
    });
    
    $('#addPlayerForm').on('submit', async function(e) {
        e.preventDefault();
        
        const playerName = $('#playerName').val().trim();
        
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
        
        await fetch('/addPlayer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                PlayerForm: playerName,
                csrfToken: csrfToken
            })
        });
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('addPlayerModal'));
        modal.hide();
        location.reload();
    });

    $('form[action="/bet"]').on('submit', function(e) {
        const betValue = $(this).find('input[name="BetForm"]').val().trim();
        
        // Check if empty
        if (betValue === '') {
            e.preventDefault();
            alert('⚠️ Bitte gib einen Betrag ein!');
            $(this).find('input[name="BetForm"]').focus();
            return false;
        }
        
        if (isNaN(betValue) || parseFloat(betValue) <= 0) {
            e.preventDefault();
            alert('⚠️ Bitte gib einen gültigen Betrag ein (nur Zahlen > 0)!');
            $(this).find('input[name="BetForm"]').val('').focus();
            return false;
        }
        
        // Check if player has enough money
        const playerMoney = parseInt($(this).closest('.player').find('.money-bet-display span:first').text());
        if (parseInt(betValue) > playerMoney) {
            e.preventDefault();
            alert('💰 Du hast nicht genug Geld für diesen Einsatz!\n\nDein Guthaben: ' + playerMoney + '$\nDein Einsatz: ' + betValue + '$');
            return false;
        }
    });

    $('form[action="/doubleDown"]').on('submit', function(e) {
        e.preventDefault();
        
        const currentBet = parseInt($(this).closest('.player').find('.money-bet-display span:last').text());
        const playerMoney = parseInt($(this).closest('.player').find('.money-bet-display span:first').text());
        
        if (currentBet > playerMoney) {
            alert('💰 Du hast nicht genug Geld um zu verdoppeln!');
            return false;
        }
        
        if (confirm('🎲 Möchtest du deinen Einsatz verdoppeln?\n\nAktueller Einsatz: ' + currentBet + '$\nNeuer Einsatz: ' + (currentBet * 2) + '$\n\nDu bekommst danach nur noch EINE Karte!')) {
            // Submit form if confirmed
            this.submit();
        }
    });

       $('form[action="/leavePlayer"] button').on('click', function(e) {
        e.preventDefault();
        
        const playerName = $(this).closest('.player').find('.player-name').text();
        
        if (confirm('👋 Möchtest du das Spiel wirklich verlassen, ' + playerName + '?')) {
            $(this).closest('form').submit();
        }
    });
    
    if ($('input[name="BetForm"]').length > 0 && $('.current-player').length > 0) {
        $('.current-player').find('input[name="BetForm"]').focus();
    }

    
    
    
    $('input[name="BetForm"]').on('keypress', function(e) {
        if (e.which != 8 && e.which != 0 && (e.which < 48 || e.which > 57)) {
            return false;
        }
    });


    const tooltips = {
        'Stand': '🛑 Keine weitere Karte nehmen',
        'Hit': '🎴 Nimm eine weitere Karte',
        'Double Down': '💰 Verdopple deinen Einsatz (nur 1 Karte)',
        'Bet': '💵 Setze deinen Einsatz für diese Runde'
    };

    $('.player-actions button, .game-controls button').each(function(){
        const btnText = $(this).text().trim();
        if(tooltips[btnText]){
            $(this).attr('title', tooltips[btnText]);
        }
    })
    
    console.log('🎰 Blackjack jQuery loaded successfully!');
    console.log('📊 Current players:', $('.player').length);
    console.log('🎴 Total cards on table:', $('.card').length);
    
    if ($('.current-player').length > 0) {
        const currentPlayerName = $('.current-player .player-name').text();
        console.log('🎯 Current player:', currentPlayerName);
    }
});