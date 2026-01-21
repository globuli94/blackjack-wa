<template>
  <div class="history-content">
    <q-card class="history-card">
      <q-card-section>
        <h1 class="text-h3 text-center q-mb-lg">
          Die Geschichte des Blackjack: Von Vingt-et-un zum Casino-Klassiker
        </h1>

        <q-separator class="q-my-lg" />

        <h2 class="text-h5 q-mb-md">Woher kommt der Name „Blackjack"?</h2>
        <p class="text-body1">
          Nachdem im frühen 18. Jahrhundert das Kartenspiel mit nach Amerika gebracht wurde und 1931 diese Art des Zeitvertreibs in Nevada legalisiert worden ist, steigerte sich die Popularität rasend schnell.
        </p>
        <p class="text-body1">
          Vor allem, weil die Casinobetreiber eine besonders hohe Auszahlung von 10:1 angeboten haben, wenn der Spieler seine 21 Punkte mit dem Pik Ass und <strong>einem schwarzen Buben</strong> (egal ob Kreuz oder Pik) erzielte.
        </p>
        <p class="text-body1">
          Dies führte letztlich auch zur Entstehung des Namens <strong>„Blackjack"</strong>.
        </p>

        <q-separator class="q-my-lg" />

        <h2 class="text-h5 q-mb-md">Die Ursprünge im 18. Jahrhundert</h2>
        <p class="text-body1">
          Die Geschichte des Blackjack reicht bis ins 18. Jahrhundert zurück. Es gibt Vermutungen, dass das Spiel von verschiedenen älteren Kartenspielen wie dem spanischen „Trente-un", dem italienischen „Sette de Mezzo" und dem französischen „Quinze" beeinflusst wurde.
          Doch das Vingt-et-un setzte sich aufgrund des erforderlichen Geschicks gegenüber reinem Glück durch.
        </p>

        <q-separator class="q-my-lg" />

        <h2 class="text-h5 q-mb-md">Der Weg nach Amerika und die Entwicklung zu "21"</h2>
        <p class="text-body1">
          Im 19. Jahrhundert brachten französische Einwanderer das Spiel nach Amerika, wo es den Namen „21" erhielt. Obwohl die Regeln in den Händen des Dealers lagen, fand das Spiel schnell Anklang, da es lediglich ein Kartendeck erforderte und somit einfach zu verbreiten war.
        </p>
        <p class="text-body1">
          Als das Glücksspiel in Nevada legalisiert wurde, suchten Casinos nach Wegen, die Spieler anzulocken. Zu diesem Zweck wurden oft spezielle Bonusauszahlungen eingeführt. Eine dieser Boni war eine 10:1-Auszahlung, wenn ein Spieler mit den ersten beiden Karten ein Ass und einen schwarzen Buben (engl. <strong>Jack</strong>) – also Pik Bube oder Kreuz Bube – erhielt.
        </p>
        <p class="text-body1">
          Diese spezielle Kombination wurde als <strong>"Blackjack"</strong> bekannt und der Name blieb hängen, auch nachdem die ursprüngliche 10:1-Bonusauszahlung wieder abgeschafft oder modifiziert wurde.
        </p>

        <q-separator class="q-my-lg" />

        <h2 class="text-h5 q-mb-md">Blackjack heute</h2>
        <p class="text-body1">
          Heute ist Blackjack das meistgespielte Karten-Glücksspiel in Casinos weltweit. Es ist bekannt für sein einfaches Regelwerk (Ziel ist 21) und die Möglichkeit für Spieler, durch Entscheidungen den Spielausgang zu beeinflussen – ein entscheidender Unterschied zu reinen Glücksspielen wie Roulette.
        </p>

        <q-separator class="q-my-lg" />

        <h2 class="text-h5 q-mb-md">Beliebte Varianten des Blackjack</h2>
        <p class="text-body1">
          Bis heute haben sich verschiedene Varianten des Spiels etabliert, die in vielen Casinos zu finden sind. Dabei unterscheidet sich das Regelwerk meistens nur in einigen Kleinigkeiten. Wir stellen Ihnen die verbreitetsten Varianten im kurzen Überblick vor:
        </p>

        <h3 class="text-h6 q-mt-md q-mb-sm">Klassisches Blackjack</h3>
        <p class="text-body1">
          Die klassische Version des Kartenspiels is in Casinos am häufigsten zu finden. Hierbei wird das Spiel mit zwei bis vier Decks gespielt. Den Spielern ist es bei dieser Version erlaubt, zu Verdoppeln und zu Splitten. Für den Dealer gilt die Regel, eine weitere Karte aufzunehmen, wenn dieser eine Soft 17 hält.
        </p>

        <h3 class="text-h6 q-mt-md q-mb-sm">Europäisches Blackjack</h3>
        <p class="text-body1">
          Diese Variante wird in vielen Fällen lediglich mit zwei Decks gespielt. Bei einer Soft 17 nimmt der Dealer keine weitere Karte auf. Spieler dürfen nur bei einem Handwert von insgesamt 9, 10 oder 11 verdoppeln. Treffen sowohl der Dealer als auch der Spieler einen Blackjack, wird dies als unentschieden gewertet.
        </p>

        <h3 class="text-h6 q-mt-md q-mb-sm">Pantoon</h3>
        <p class="text-body1">
          Pantoon, oder auch Spanische 21 genannt, ist eine Blackjack-Version, bei der die ersten beiden Karten des Dealers nicht offen aufgedeckt werden. Um diesen Nachteil auszuhebeln, fallen die Gewinnquoten für den Spieler deutlich höher aus. Wenn ein Handwert von 15 noch nicht erreicht ist, muss der Spieler eine weitere Karte ziehen.
        </p>

        <h2 class="text-h5 q-mt-lg q-mb-md">Zusammenfassung:</h2>
        <q-list bordered separator class="rounded-borders">
          <q-item>
            <q-item-section>
              <q-item-label><strong>Ursprung:</strong> Französisches "Vingt-et-un" (18. Jh.)</q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <q-item-label><strong>USA:</strong> Verbreitung als "Blackjack"</q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <q-item-label><strong>Namensgebung:</strong> Entstand durch eine spezielle Bonuszahlung für ein Ass und einen schwarzen Buben.</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
//
</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.history-content {
  animation: fadeIn 0.4s ease-out;
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
}

.history-card {
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  color: white;
}

.history-card :deep(.q-card-section) {
  color: white;
}

h1, h2, h3 {
  color: #fbbf24;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

h1 {
  color: white;
  font-weight: 700;
}

h2 {
  color: #fbbf24;
  font-weight: 600;
}

h3 {
  color: #fcd34d;
  font-weight: 500;
}

.text-body1 {
  line-height: 1.8;
  margin-bottom: 1rem;
  color: rgba(255, 255, 255, 0.9);
}

.history-card :deep(.q-separator) {
  background: rgba(255, 255, 255, 0.2);
}

.history-card :deep(.q-list) {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}

.history-card :deep(.q-item) {
  color: white;
}

.history-card :deep(.q-item-label strong) {
  color: #fbbf24;
}

/* Mobile Responsive */
@media (max-width: 600px) {
  .history-content {
    padding: 1.5rem; /* Increased from 2rem */
    font-size: 1.25rem; /* Increased base font size */
  }

  h1 {
    font-size: 2rem !important; /* Larger heading */
  }

  h2 {
    font-size: 1.75rem !important; /* Larger heading */
  }

  .text-body1 {
    font-size: 1.25rem !important; /* Increased from 1.1rem */
  }
}
</style>
