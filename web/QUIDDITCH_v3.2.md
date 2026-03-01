# ⚡ SKY SPHERES v3.2 - TRUE QUIDDITCH MECHANICS

## 🎉 MECCANICHE VERE DA HARRY POTTER!

Questa versione implementa le **VERE** regole di Quidditch dai libri di Harry Potter!

### ✅ Tutte le Regole Implementate

#### 1. ⚫ BLUDGERS (Strike Spheres) - 2 in campo

**COMPORTAMENTO VERO:**
- ✅ **AGGRESSIVI**: Inseguono attivamente i giocatori
- ✅ **ATTACCANO**: Volano verso giocatori random ogni 3-5 secondi
- ✅ **COLPISCONO**: Quando collidono con giocatore (< 1.5m)
- ✅ **STUNNANO**: Giocatore colpito è immobilizzato per 3 secondi
- ✅ **DROP QUAFFLE**: Se colpito mentre tiene palla, la perde

**AI Comportamento**:
```javascript
// Bludger seleziona target random
this.target = selectRandomTarget(allPlayers)

// Insegue aggressivamente
velocity += directionToTarget * 0.025  // VELOCE!

// Collisione?
if (distance < 1.5) {
    player.state = STUNNED
    player.stunnedTimer = 3  // secondi

    if (player.heldQuaffle) {
        player.dropQuaffle()  // PERDE LA PALLA!
    }
}
```

**Notifica**:
```
💥 STORM CHASER COLPITO!
💥 SEI STATO COLPITO DA UN BLUDGER!
```

---

#### 2. ⚔️ BEATER (Battitore) - 2 per team

**COMPORTAMENTO VERO:**
- ✅ **Cerca Bludger** più vicino
- ✅ **Si avvicina** al Bludger
- ✅ **COLPISCE quando vicino** (< 2m)
- ✅ **REDIRIGE verso avversario** più vicino
- ✅ **Protegge compagni** colpendo Bludger in arrivo

**Meccanica Colpo**:
```javascript
// Player Beater:
if (role === BEATER) {
    bludgers.forEach(bludger => {
        if (distance < 2) {
            // Trova avversario più vicino
            nearest = findNearestOpponent()

            // REINDIRIZZA BLUDGER!
            bludger.redirectToTarget(nearest.position)

            showNotification("⚔️ HAI COLPITO IL BLUDGER!")
        }
    })
}

// AI Beater:
updateBeater() {
    nearest = findNearestBludger()

    if (distance < 2) {
        opponent = findNearestOpponent()
        bludger.redirectToTarget(opponent.position)
        showNotification("⚔️ STORM BEATER colpisce!")
    }
}
```

**Redirect Meccanica**:
```javascript
redirectToTarget(targetPosition) {
    direction = (targetPosition - position).normalize()
    velocity = direction * 0.6  // Veloce!
    targetChangeTimer = 2  // Insegui nuova direzione
}
```

---

#### 3. 🏈 CHASER (Cacciatore) - 3 per team

**COMPORTAMENTO VERO:**
- ✅ **Raccoglie Quaffle** libera
- ✅ **RUBA Quaffle** da avversario (tackle)
- ✅ **Vola verso goal** avversario
- ✅ **SEGNA attraverso anelli** (+10 punti)
- ✅ **Passa tra compagni** Chaser (AI)

**Meccanica Steal (Rubare)**:
```javascript
// Se avversario ha Quaffle
if (quaffle.held && quaffle.holder.team !== myTeam) {
    distance = distanceTo(quaffle.holder)

    // TACKLE!
    if (distance < 2.5) {
        quaffle.holder.heldQuaffle = null  // Avversario perde
        quaffle.holder = this  // Io prendo
        this.heldQuaffle = quaffle

        showNotification("🏈 STORM CHASER ruba la palla!")
    }
}
```

**Meccanica Goal**:
```javascript
checkScoring() {
    opponentRings = goalRings.filter(team === opponentTeam)

    opponentRings.forEach(ring => {
        if (ring.checkScore(heldQuaffle)) {
            teamScores[myTeam] += 10
            showNotification("🎯 STORM GOAL! +10pts")

            quaffle.drop(center)  // Quaffle al centro
            heldQuaffle = null
        }
    })
}
```

**AI Chaser**:
- Se NON ha Quaffle: Cerca Quaffle libera O ruba da avversario
- Se HA Quaffle: Vola verso goal avversario e segna

---

#### 4. 🛡️ KEEPER (Portiere) - 1 per team

**COMPORTAMENTO VERO:**
- ✅ **Resta vicino ai goal** di casa (3 anelli)
- ✅ **Intercetta Chaser** avversari
- ✅ **BLOCCA fisicamente** quando vicino (< 2m)
- ✅ **FA CADERE Quaffle** dall'avversario

**Meccanica Blocco**:
```javascript
updateKeeper() {
    homePosition = (0, 12, homeGoalZ)

    // Se avversario con Quaffle è vicino ai nostri goal
    if (opponent.heldQuaffle && distance < 12) {
        // INTERCETTA!
        velocity += directionTo(opponent) * 0.3  // VELOCE

        // BLOCCO!
        if (distance < 2) {
            opponent.heldQuaffle = null
            quaffle.drop(myPosition)

            showNotification("🛡️ STORM KEEPER blocca!")
        }
    } else {
        // Torna a casa
        velocity += directionTo(homePosition) * 0.2
    }
}
```

**Player Keeper**:
```javascript
// Se KEEPER e avversario ha Quaffle vicino
if (role === KEEPER && opponent.heldQuaffle) {
    if (distance < 2) {
        opponent.dropQuaffle()
        showNotification("🛡️ HAI BLOCCATO IL TIRO!")
    }
}
```

---

#### 5. 👁️ SEEKER (Cercatore) - 1 per team

**COMPORTAMENTO VERO:**
- ✅ **Insegue Golden Snitch** (Boccino d'Oro)
- ✅ **Snitch EVADE tutti** i Seeker
- ✅ **Cattura = 150 punti**
- ✅ **FINE PARTITA** quando catturato!

**Meccanica Cattura**:
```javascript
// Player Seeker
if (role === SEEKER && distance < 2.5) {
    teamScores[myTeam] += 150

    showNotification("🎉 HAI CATTURATO IL BOCCINO! +150pts\n\nFINE PARTITA!")

    setTimeout(() => {
        showGameOver(teamScores)
    }, 3000)
}

// AI Seeker
captureSnitch() {
    teamScores[team] += 150
    showNotification("🎉 FLAME SEEKER cattura il Boccino!")

    // GAME OVER
    showGameOver(teamScores)
}
```

**Snitch Evasion**:
```javascript
updateSnitch() {
    // Trova tutti i Seeker
    seekers = allPlayers.filter(role === SEEKER && state !== STUNNED)

    // EVADE ognuno
    seekers.forEach(seeker => {
        if (distance < 18) {
            evasion = (snitchPos - seekerPos).normalize()
            velocity += evasion * 0.02
        }
    })
}
```

---

## 📊 Composizione Team (Come Quidditch Vero)

```
STORM TEAM (⚡):
- 1 Seeker
- 2 Beater
- 3 Chaser
- 1 Keeper
TOTALE: 7 giocatori

FLAME TEAM (🔥):
- 1 Seeker
- 2 Beater
- 3 Chaser
- 1 Keeper
TOTALE: 7 giocatori

TOTALE IN CAMPO: 14 giocatori
(Tu + 13 AI)
```

**Oggetti in Gioco (Come Quidditch Vero)**:
- 1 Golden Snitch (Boccino d'Oro) - Dorato, vola veloce
- 2 Bludgers (Bolidi) - Neri con glow rosso, aggressivi
- 1 Quaffle (Pluffa) - Rossa, lanciabile
- 6 Goal Rings (3 per team) - Anelli colorati per team

---

## 🎮 Come Si Gioca

### Inizio Partita

1. **Destiny Hood Ceremony** 🎩
2. **Scegli Ruolo** (Seeker/Beater/Chaser/Keeper)
3. **Assegnazione Team** (Storm o Flame)
4. **PARTITA INIZIA!**

### Durante La Partita

**Controlli Mobile**:
- **Joystick**: Movimento X/Z (orizzontale)
- **▲**: Vola SU (verticale)
- **▼**: Vola GIÙ (verticale)
- **BOOST ⚡**: Velocità aumentata

**Azioni Automatiche** (quando vicino):
- **Seeker**: Cattura Snitch (< 2.5m)
- **Beater**: Colpisce Bludger (< 2m) → redirige verso avversario
- **Chaser**: Raccoglie/Ruba Quaffle (< 2.5m) → Segna attraverso goal
- **Keeper**: Blocca avversario (< 2m) → fa cadere Quaffle

**Stati del Giocatore**:
- **NORMAL**: Può muoversi e agire normalmente
- **STUNNED**: Immobilizzato per 3 secondi (colpito da Bludger)
  - Animazione: Giocatore gira su se stesso
  - Non può muoversi
  - Perde Quaffle se la teneva
  - Dopo 3 secondi torna NORMAL

---

## 🏆 Punteggi

```
Golden Snitch catturato:  +150 punti + FINE PARTITA
Goal (Quaffle in ring):   +10 punti
```

### Condizione Vittoria

La partita FINISCE quando:
1. Un Seeker **cattura il Golden Snitch** (+150 pts)

Chi ha più punti **VINCE**!

**Schermata Game Over**:
```
⚡ VITTORIA STORM! ⚡

⚡ Storm: 170 pts
🔥 Flame: 80 pts

[🔄 GIOCA ANCORA]
```

---

## 🤖 AI Behavior Completa

### AI Movement

**TUTTI gli AI si muovono** attivamente:

```javascript
update(delta, gameState) {
    // Se stunnato: spin animation, no movement
    if (state === STUNNED) {
        stunnedTimer -= delta
        animate(stunned = true)
        return
    }

    // Role-specific behavior
    switch (role) {
        case SEEKER:  updateSeeker()
        case BEATER:  updateBeater()
        case CHASER:  updateChaser()
        case KEEPER:  updateKeeper()
    }

    // Physics
    position += velocity
    velocity *= 0.87  // Drag

    // Animate
    animate(moving, delta)
}
```

### AI Seeker

```javascript
- Chase Snitch con boost se vicino (< 15m)
- Cattura se < 2.5m
- +150 pts al team
- GAME OVER
```

### AI Beater

```javascript
- Cerca Bludger più vicino
- Se < 15m: Insegue
- Se < 2m: COLPISCE
  - Trova avversario più vicino
  - Redirige Bludger verso di lui
  - Cooldown 1.5s
```

### AI Chaser

```javascript
- Se NON ha Quaffle:
  - Se libera: Va a prenderla
  - Se avversario ce l'ha: INSEGUE e RUBA (tackle < 2.5m)

- Se HA Quaffle:
  - Vola verso goal avversario
  - Quaffle lo segue
  - Attraversa anello = GOAL! (+10)
  - Cooldown 2s
```

### AI Keeper

```javascript
- Home position: (0, 12, goalZ)
- Se avversario con Quaffle vicino (< 12m):
  - INTERCETTA (velocità 0.3)
  - BLOCCA se < 2m
  - Quaffle cade
  - Cooldown 1.5s
- Altrimenti:
  - Torna a home position
```

---

## 💥 Sistema Stun

**Quando Bludger Colpisce**:

```javascript
hitPlayer(player) {
    if (player.state === STUNNED) return  // Già stunnato

    player.state = STUNNED
    player.stunnedTimer = 3  // 3 secondi

    // DROP QUAFFLE
    if (player.heldQuaffle) {
        player.heldQuaffle.drop(player.position)
        player.heldQuaffle = null
    }

    // Notifica
    showNotification("💥 STORM CHASER COLPITO!")
}
```

**Effetti Stun**:
- ❌ Non può muoversi
- ❌ Non può agire
- ❌ Perde Quaffle se la teneva
- 🌀 Animazione: Gira su se stesso
- ⏱️ Dura 3 secondi
- ✅ Dopo torna NORMAL

**Animazione Stunned**:
```javascript
animate(moving, delta, stunned) {
    if (stunned) {
        // SPIN ANIMATION
        group.rotation.x = sin(time * 0.01) * 0.3
        group.rotation.z = cos(time * 0.01) * 0.3
        return
    }

    // Normal animation...
}
```

---

## 🎯 Strategie per Ruolo

### 👁️ SEEKER Strategy

```
1. Ignora tutto tranne il Snitch
2. Usa movimento verticale (▲▼) - Snitch vola alto/basso
3. Usa BOOST quando vicino (< 15m)
4. EVITA Bludgers - se colpito perdi tempo prezioso
5. Snitch ti evita - ANTICIPA il movimento
6. Cattura = 150pts = VITTORIA QUASI GARANTITA
```

### ⚔️ BEATER Strategy

```
1. Cerca il Bludger più vicino (sfere nere)
2. AVVICINATI (joystick + vertical)
3. Quando < 2m: COLPISCE AUTOMATICAMENTE
4. Bludger viene mandato verso avversario
5. PROTEGGI i compagni:
   - Se Bludger insegue tuo Chaser → COLPISCILO VIA
   - Se Bludger insegue tuo Seeker → PRIORITÀ MASSIMA
6. Mira a avversari con Quaffle o loro Seeker
```

### 🏈 CHASER Strategy

```
1. Se Quaffle libera:
   - VAI A PRENDERLA (< 2.5m pickup automatico)

2. Se avversario ha Quaffle:
   - INSEGUI
   - TACKLA quando < 2.5m (automatico)
   - RUBA LA PALLA

3. Se TU hai Quaffle:
   - Vola verso goal AVVERSARI
   - Usa BOOST
   - Vola ALTO (▲) per evitare Keeper
   - Attraversa anello centrale (più facile)
   - GOAL automatico se < 3.2m da anello

4. EVITA Bludgers - se colpito PERDI LA PALLA
```

### 🛡️ KEEPER Strategy

```
1. Resta VICINO ai tuoi goal (3 anelli)
2. Posizione: Centro tra i 3 anelli
3. Usa vertical (▲▼) per coprire anello centrale (più alto)

4. Quando avversario con Quaffle si avvicina:
   - INTERCETTA velocemente
   - VAI VERSO DI LUI
   - BLOCCO automatico < 2m
   - Quaffle cade

5. NON inseguire troppo lontano:
   - Max distanza: 12m dai goal
   - Altrimenti torna indietro

6. Priorità difesa:
   - Chaser avversari con Quaffle
   - Ignora Seeker (non tua responsabilità)
```

---

## 🎬 Gameplay Flow

```
[DESTINY HOOD CEREMONY]
         ↓
[SCEGLI RUOLO]
         ↓
[ASSEGNAZIONE TEAM]
         ↓
[PARTITA 7v7]
  - 14 giocatori totali
  - 2 Bludgers aggressivi
  - 1 Quaffle
  - 1 Golden Snitch
         ↓
[GAMEPLAY]
  - Bludgers attaccano
  - Beater colpiscono Bludgers
  - Chaser rubano/segnano
  - Keeper bloccano
  - Seeker inseguono Snitch
         ↓
[SEEKER CATTURA SNITCH]
         ↓
[GAME OVER]
  - Mostra punteggi
  - Dichiara vincitore
  - [GIOCA ANCORA]
```

---

## 📊 Confronto Versioni

| Feature | v3.1 Improved | v3.2 Quidditch |
|---------|---------------|----------------|
| **Bludgers aggressivi** | ❌ | ✅ Inseguono players |
| **Bludgers stunnano** | ❌ | ✅ 3 secondi stun |
| **Beater colpisce** | ⚠️ Solo lancia via | ✅ Redirige verso avversari |
| **Chaser ruba** | ❌ | ✅ Tackle < 2.5m |
| **Keeper blocca** | ❌ | ✅ Intercetta fisicamente |
| **Cattura Snitch = Fine** | ❌ | ✅ Game Over |
| **Sistema Stun** | ❌ | ✅ Con animazione |
| **Quaffle drop** | ❌ | ✅ Quando colpito |
| **Team composition** | ⚠️ Random | ✅ 1/2/3/1 (Quidditch) |
| **AI movement** | ✅ | ✅ |
| **Notifiche azioni** | ✅ | ✅ Enhanced |

---

## 🐛 Bug Fix da v3.1

### ✅ FIXED: AI non interagiva abbastanza

**Prima**:
```javascript
// AI colpiva ma nessun vero effetto
updateBeater() {
    hit(bludger)
    // Bludger solo lanciato via random
}
```

**Dopo**:
```javascript
// AI colpisce E redirige verso avversario
updateBeater() {
    if (distance < 2) {
        opponent = findNearestOpponent()
        bludger.redirectToTarget(opponent.position)  // TARGETING!
        showNotification("⚔️ BEATER colpisce!")
    }
}
```

### ✅ FIXED: Bludgers passivi

**Prima**:
```javascript
// Bludger si muoveva random
update() {
    position += velocity
    velocity += random  // Nessun targeting
}
```

**Dopo**:
```javascript
// Bludger INSEGUE giocatori
update(allPlayers) {
    target = selectRandomTarget(allPlayers)

    direction = (target.position - position).normalize()
    velocity += direction * 0.025  // CHASE!

    if (distance < 1.5) {
        hitPlayer(target)  // STUN!
    }
}
```

### ✅ FIXED: Chaser non poteva rubare

**Prima**:
```javascript
// Chaser solo raccoglieva Quaffle libera
if (!quaffle.held) {
    pickup(quaffle)
}
```

**Dopo**:
```javascript
// Chaser può RUBARE da avversario
if (quaffle.held && quaffle.holder.team !== myTeam) {
    if (distance < 2.5) {
        STEAL(quaffle)  // TACKLE!
        showNotification("🏈 CHASER ruba!")
    }
}
```

### ✅ FIXED: Keeper non bloccava

**Prima**:
```javascript
// Keeper solo si muoveva vicino goal
updateKeeper() {
    moveTowards(homePosition)
}
```

**Dopo**:
```javascript
// Keeper INTERCETTA attivamente
updateKeeper() {
    if (opponent.heldQuaffle && distance < 12) {
        INTERCEPT(opponent)  // Chase!

        if (distance < 2) {
            BLOCK(opponent)  // Quaffle cade!
        }
    }
}
```

---

## 🎮 Come Testare

### Test Checklist

```
✅ Apri index-quidditch.html
✅ Scegli SEEKER
✅ Osserva Bludgers che attaccano
✅ Vedi AI Beater colpire Bludgers
✅ Vedi notifiche quando AI colpiti
✅ Prova a catturare Snitch
✅ Game Over quando catturato

✅ Riavvia come BEATER
✅ Avvicinati a Bludger
✅ Colpisci quando < 2m
✅ Vedi Bludger andare verso avversario
✅ Osserva avversari che vengono colpiti

✅ Riavvia come CHASER
✅ Raccogli Quaffle libera
✅ Vola verso goal avversario
✅ Segna attraverso anello
✅ Prova a rubare da avversario

✅ Riavvia come KEEPER
✅ Resta vicino ai tuoi goal
✅ Intercetta Chaser avversario
✅ Bloccalo quando vicino
✅ Vedi Quaffle cadere
```

---

## 📖 Riferimenti Harry Potter

### Dal Libro "Quidditch Through the Ages"

**Bludgers**:
> "The two Bludgers are bewitched to fly around trying to knock players off their brooms. Beaters must hit them toward the opposing team."

✅ **IMPLEMENTATO**: Bludgers inseguono players e li stunnano

**Beaters**:
> "Beaters defend their team by hitting Bludgers toward the opposing team to disrupt their play."

✅ **IMPLEMENTATO**: Beater colpisce e redirige Bludgers

**Chasers**:
> "Chasers throw the Quaffle through the opponent's hoops to score ten points."

✅ **IMPLEMENTATO**: Chaser segna goal +10pts

**Keepers**:
> "The Keeper guards the goal hoops, trying to block the Quaffle from going through."

✅ **IMPLEMENTATO**: Keeper intercetta e blocca

**Seekers & Snitch**:
> "The Seeker's job is to catch the Golden Snitch. Catching it earns 150 points and ends the game."

✅ **IMPLEMENTATO**: Seeker cattura Snitch = 150pts + GAME OVER

---

**🎮 APRI `web/index-quidditch.html` E GIOCA IL VERO QUIDDITCH! ⚡**

Ora hai:
- ✅ Bludgers aggressivi che attaccano
- ✅ Sistema stun quando colpiti
- ✅ Beater redirige Bludgers verso avversari
- ✅ Chaser ruba Quaffle con tackle
- ✅ Keeper blocca fisicamente tiri
- ✅ Cattura Snitch = Fine partita
- ✅ AI completamente funzionante per tutti i ruoli
- ✅ 14 giocatori in campo (come Quidditch vero!)
