$(document).ready(function() {
    
    // Modal Input clearen beim Öffnen
    $('#addPlayerModal').on('show.bs.modal', function() {
        $('#playerName').val('');
    });
    
    $('#addPlayerForm').on('submit', async function(e) {
        e.preventDefault(); // ← MUSS GANZ OBEN STEHEN!
        
        const playerName = $('#playerName').val().trim();
        
        // Check if empty
        if (playerName === '') {
            alert('⚠️ Bitte gib einen Spielernamen ein!');
            $('#playerName').focus();
            return false;
        }
        
        // Check minimum length
        if (playerName.length < 2) {
            alert('⚠️ Der Name muss mindestens 2 Zeichen lang sein!');
            $('#playerName').focus();
            return false;
        }
        
        // Check for special characters (optional)
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

    console.log('🎰 Blackjack jQuery loaded successfully!');
    console.log('📊 Current players:', $('.player').length);
    console.log('🎴 Total cards on table:', $('.card').length);
    
    if ($('.current-player').length > 0) {
        const currentPlayerName = $('.current-player .player-name').text();
        console.log('🎯 Current player:', currentPlayerName);
    }
});