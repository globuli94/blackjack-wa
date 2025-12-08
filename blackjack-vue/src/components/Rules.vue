<template>
  <div class="rules-content">
    <q-card class="rules-card">
      <q-card-section>
        <h1 class="text-h3 text-center q-mb-lg">Blackjack – Spielregeln</h1>

        <q-separator class="q-my-lg" />

        <h2 class="text-h5 q-mb-md">Ziel des Spiels</h2>
        <p class="text-body1">
          Ziel des Spiels ist es, mit zwei oder mehr Karten näher an 21 Punkte heranzukommen als der Dealer, ohne dabei den Wert von 21 Punkten zu überschreiten.
        </p>
        <q-list bordered class="q-my-md">
          <q-item>
            <q-item-section avatar>
              <q-icon name="close" color="negative" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Wenn der Gesamtkartenwert > 21 → bist du sofort raus <strong>„Bust"</strong></q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section avatar>
              <q-icon name="check" color="positive" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Wenn der Gesamtkartenwert > Dealerkarten → Gewinn</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>

        <q-separator class="q-my-lg" />

        <h2 class="text-h5 q-mb-md">Die Werte der einzelnen Karten</h2>
        <q-markup-table flat bordered>
          <thead>
            <tr>
              <th class="text-left">Karte</th>
              <th class="text-left">Wert</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>2–10</td>
              <td>Entspricht der aufgedruckten Zahl (z.B. 2 zählt 2 Punkte)</td>
            </tr>
            <tr>
              <td>Bube (J), Dame (Q), König (K)</td>
              <td>10 Punkte</td>
            </tr>
            <tr>
              <td>Ass (A)</td>
              <td>1 Punkt oder 11 Punkte</td>
            </tr>
          </tbody>
        </q-markup-table>

        <q-separator class="q-my-lg" />

        <h2 class="text-h5 q-mb-md">Spielablauf</h2>
        <q-timeline color="primary">
          <q-timeline-entry
            title="Einsatz setzen"
            icon="paid"
            color="amber"
          >
            Jeder Spieler platziert seinen Einsatz im Einsatzfeld.
          </q-timeline-entry>

          <q-timeline-entry
            title="Austeilen"
            icon="style"
            color="blue"
          >
            Spieler und Dealer erhalten je zwei Karten. Beide Spielerkarten liegen offen, beim Dealer eine offen, eine verdeckt (Hole Card).
          </q-timeline-entry>

          <q-timeline-entry
            title="Spielerzüge"
            icon="touch_app"
            color="green"
          >
            <div>Spieler muss jetzt selber überlegen, wie er seine Hand verbessern will:</div>
            <q-list dense class="q-mt-sm">
              <q-item>
                <q-item-section avatar>
                  <q-icon name="add" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label><strong>Hit:</strong> weitere Karte nehmen</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section avatar>
                  <q-icon name="front_hand" color="negative" />
                </q-item-section>
                <q-item-section>
                  <q-item-label><strong>Stand:</strong> Keine weitere Karte nehmen</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section avatar>
                  <q-icon name="arrow_upward" color="warning" />
                </q-item-section>
                <q-item-section>
                  <q-item-label><strong>Double Down:</strong> Einsatz verdoppeln und nur eine weitere Karte ziehen</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section avatar>
                  <q-icon name="call_split" color="info" />
                </q-item-section>
                <q-item-section>
                  <q-item-label><strong>Split:</strong> Bei zwei gleichwertigen Startkarten diese in zwei separate Hände teilen und einen zweiten Einsatz tätigen</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-timeline-entry>

          <q-timeline-entry
            title="Dealerzüge"
            icon="support_agent"
            color="purple"
          >
            <div>Der Dealer deckt die Hole Card auf und zieht nach festen Regeln:</div>
            <q-list dense class="q-mt-sm">
              <q-item>
                <q-item-section>
                  <q-item-label><strong>Wenn Kartenwert ≤ 16:</strong> Eine weitere Karte ziehen</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label><strong>Wenn Kartenwert ≥ 17:</strong> stehenbleiben</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-timeline-entry>

          <q-timeline-entry
            title="Gewinn/Verlust"
            icon="emoji_events"
            color="orange"
          >
            Die Handwerte werden verglichen. Wer näher an 21 liegt, gewinnt. Bei Gleichstand erhält der Spieler seinen Einsatz zurück.
          </q-timeline-entry>
        </q-timeline>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
//
</script>

<style scoped>
.rules-content {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
}

.rules-card {
  background: rgba(255, 255, 255, 0.95);
  color: #1a1a1a;
}

h1, h2 {
  color: #0f766e;
}

.text-body1 {
  line-height: 1.8;
  margin-bottom: 1rem;
}
</style>
