# Sky Spheres - Game Design Document

## 📖 Documento di Design Completo

**Versione**: 1.0
**Data**: 2024
**Piattaforme**: iOS, Android
**Genere**: Sports Fantasy Mobile Game

---

## 1. Concept Generale

### 1.1 Pitch Elevator

*Sky Spheres* è un videogioco mobile di sport aereo fantasy dove i giocatori competono in squadre pilotando veicoli volanti magici, catturando sfere luminose e segnando punti in arena sospese nel cielo. Ispirato alle meccaniche del Quidditch ma con narrativa e design completamente originali.

### 1.2 Unique Selling Points (USP)

- **Destiny Hood System**: Un cappello magico parlante ironico assegna ruoli casuali, garantendo varietà e replay value
- **4 Ruoli Distinti**: Gameplay completamente diverso per ogni ruolo
- **Controlli Touch Innovativi**: Swipe, tap, hold ottimizzati per mobile
- **Progressione Profonda**: Skill tree separati per ogni ruolo
- **Narrativa Originale**: Evita copyright usando nomi e concetti originali

---

## 2. Meccaniche Core

### 2.1 Ruoli di Gioco

#### SEEKER (Cercatore)
**Obiettivo**: Catturare il Radiant Globe
**Punteggio**: 150 punti (termina la partita)

**Abilità**:
- Velocità massima superiore (+30%)
- Detection range esteso (50m)
- Quick Dash: scatto rapido verso il Globe (costa 30 stamina)

**Gameplay Loop**:
1. Rileva il Radiant Globe
2. Insegui usando predizione della traiettoria
3. Esegui manovre evasive per evitare Strike Spheres
4. Cattura progressiva (hold tap per 1 secondo)
5. VITTORIA

**Skill Tree**:
- Speed: +1 m/s per livello (max 10)
- Agility: +5% turn speed per livello
- Detection: +5m detection range per livello
- Stamina: +10 max stamina per livello
- Quick Dash: -5% stamina cost per livello

---

#### BEATER (Battitore)
**Obiettivo**: Colpire Strike Spheres per proteggere compagni
**Punteggio**: Difensivo (non segna direttamente)

**Abilità**:
- Hit Range esteso (8m)
- Charge system: hold per caricare colpo (max 2s)
- Spin Attack: colpo ad area 360° (costa 40 stamina)

**Gameplay Loop**:
1. Rileva Strike Sphere in arrivo
2. Posizionamento ottimale
3. Timing del colpo (perfect hit = bonus)
4. Deflect verso nemici
5. Combo system (hit consecutive)

**Skill Tree**:
- Power: +5% hit force per livello
- Range: +0.5m hit range per livello
- Timing: +10% perfect hit window per livello
- Stamina: +10 max stamina per livello
- Cooldown: -5% hit cooldown per livello

---

#### CHASER (Cacciatore)
**Obiettivo**: Lanciare Score Orbs negli anelli per segnare
**Punteggio**: 10 punti per goal (x2 se perfect shot)

**Abilità**:
- Trajectory preview durante mira
- Aim assist automatico
- Curved Shot: tiro con effetto curva (costa 30 stamina)

**Gameplay Loop**:
1. Raccogliere Score Orb
2. Posizionamento strategico
3. Mira verso anello (aim assist)
4. Charge throw (hold)
5. Release al momento giusto
6. GOAL!

**Skill Tree**:
- Accuracy: +5% aim assist per livello
- Power: +2 m/s throw force per livello
- Charge Speed: -5% charge time per livello
- Stamina: +10 max stamina per livello
- Pass: +10% pass accuracy per livello

---

#### KEEPER (Portiere)
**Obiettivo**: Difendere i 3 anelli del proprio team
**Punteggio**: Difensivo (previene goal)

**Abilità**:
- Save Range esteso (6m)
- Dive: tuffo rapido (costa 20 stamina)
- Super Save: area protetta 3s (costa 50 stamina)

**Gameplay Loop**:
1. Posizionamento tra gli anelli
2. Track Score Orbs nemici
3. Predire traiettoria
4. Dive al momento giusto
5. PARATA!

**Skill Tree**:
- Reflexes: +10% save success rate per livello
- Range: +0.5m save range per livello
- Positioning: +10% movement speed per livello
- Stamina: +10 max stamina per livello
- Dive: -5% dive stamina cost per livello

---

### 2.2 Oggetti di Gioco

#### Radiant Globe (Golden Wisp)
- **Comportamento**: Vola erraticamente, evita inseguitori
- **Velocità**: 8-15 m/s (aumenta quando inseguito)
- **Punti**: 150 (termina partita)
- **Spawn**: Centro arena, respawn dopo cattura
- **Effetti**: Trail dorato, pulse glow

#### Score Orb
- **Comportamento**: Passivo, raccolto e lanciato
- **Fisica**: Realistica con gravità e drag
- **Punti**: 10 (base), 20 (perfect shot), 30 (anello alto)
- **Respawn**: 2s dopo goal o out of bounds
- **Colore**: Cambia in base al team possessore

#### Strike Sphere (Shadow Ball)
- **Comportamento**: Aggressivo, insegue giocatori
- **Velocità**: 12-20 m/s
- **Danno**: 2s stun + knockback
- **Target**: Casuale, cambia ogni 5s
- **Deflect**: Può essere deviato dai Beater
- **AI**: Predizione movimento, evasion

---

### 2.3 Arena e Ambiente

#### Campo da Gioco
- **Dimensioni**: 100m x 60m x 50m (L x W x H)
- **Stile**: Piattaforma flottante nel cielo
- **Anelli**: 3 per team (alto, medio, basso)
  - Alto: 15m altezza, 3m diametro, x3 punti
  - Medio: 10m altezza, 4m diametro, x2 punti
  - Basso: 5m altezza, 5m diametro, x1 punti
- **Bounds**: Invisible walls che rimbalzano oggetti
- **Spalti**: Pubblico animato reattivo al punteggio

#### Atmosfera
- **Skybox**: Cielo fantasy con nuvole magiche
- **Illuminazione**: Dinamica con sole/tramonto/notte
- **Particelle**: Magia ambientale, vento, energia
- **Musica**: Orchestrale epica con cori da stadio

---

## 3. Progressione e Economia

### 3.1 Sistema di Livelli

**Formula XP**:
```
XP_required = 100 * (1.5 ^ (level - 1))
```

**Livelli**:
- Livello 1-10: Tutorial e learning
- Livello 11-25: Intermediate
- Livello 26-50: Advanced
- Livello 51+: Expert

**Rewards per Level Up**:
- Coins: level * 10
- Skill Points: 3 per role attivo
- Unlock: Skin/Abilità ogni 5 livelli

### 3.2 Valute

#### Coins (Monete d'Oro)
- **Guadagno**:
  - Vittoria: 50 coins
  - Sconfitta: 20 coins
  - Pareggio: 30 coins
  - Daily login: 10-50 coins
  - Achievement: 100-1000 coins
- **Uso**:
  - Unlock skin: 500-5000 coins
  - Boost temporanei: 100 coins
  - Retry partita: 50 coins

#### Gems (Gemme)
- **Guadagno**:
  - Level up: 5 gems
  - Achievement: 10-50 gems
  - IAP: 100 gems = $0.99
- **Uso**:
  - Skin premium: 100-500 gems
  - Skill reset: 50 gems
  - Energy refill: 20 gems

### 3.3 Skill Tree

**Ogni ruolo ha 5 skill**, ognuna upgradabile 10 volte:

**Costi Skill Points**:
- Livello 1: 1 SP
- Livello 2: 2 SP
- Livello 3: 3 SP
- ...
- Livello 10: 10 SP

**Totale per maxare una skill**: 55 SP
**Totale per maxare un ruolo**: 275 SP

### 3.4 Achievement System

**Categorie**:
1. **Prima Volta** (First Time)
   - Prima vittoria: 100 coins
   - Primo goal: 50 coins
   - Prima cattura Globe: 200 coins

2. **Maestria** (Mastery)
   - 10 catture Globe: 500 coins, 20 gems
   - 50 goal segnati: 500 coins, 20 gems
   - 100 parate: 500 coins, 20 gems

3. **Collezionista** (Collector)
   - Unlock 10 skin: 300 coins, 15 gems
   - Max skill tree: 1000 coins, 50 gems

4. **Serie** (Streaks)
   - 5 vittorie consecutive: 250 coins, 10 gems
   - 10 vittorie consecutive: 500 coins, 25 gems

5. **Perfezionista** (Perfectionist)
   - Partita perfetta (no goal subiti): 300 coins, 15 gems
   - 10 perfect shot in partita: 400 coins, 20 gems

---

## 4. Modalità di Gioco

### 4.1 Quick Match
- **Descrizione**: Partita veloce 1v1 contro AI
- **Durata**: 5 minuti
- **Difficoltà**: Selezionabile (Easy/Medium/Hard/Expert)
- **Rewards**: Standard

### 4.2 Story Mode
- **Capitoli**: 5 capitoli, 10 livelli ciascuno
- **Progressione**: Lineare con boss fight
- **Narrativa**: Torneo del Destiny Hood
- **Rewards**: Bonus coins/gems, unlock skin esclusive
- **Difficoltà**: Crescente

**Esempio Struttura**:
- **Capitolo 1: Rookie League**
  - Livelli 1-10: Tutorial + facili partite
  - Boss: Veteran Seeker
- **Capitolo 2: Silver Division**
  - Livelli 11-20: Difficoltà media
  - Boss: Master Beater Duo
- **Capitolo 3: Gold Division**
  - Livelli 21-30: Hard
  - Boss: Elite Chaser Team
- **Capitolo 4: Diamond League**
  - Livelli 31-40: Expert
  - Boss: Legendary Keeper
- **Capitolo 5: Champion's Cup**
  - Livelli 41-50: Extreme
  - Final Boss: The Destiny Hood Team

### 4.3 Training Arena
- **Scopo**: Pratica skill senza pressione
- **Features**:
  - Target practice
  - Timing drills
  - Mini-quiz del Destiny Hood
  - No time limit
- **Rewards**: Bonus XP (50% del normale)

### 4.4 Multiplayer Online
- **1v1 Ranked**: Matchmaking ELO-based
- **2v2 Team**: Squadre cooperative
- **Tournament**: Eventi settimanali
- **Rewards**: Coins/gems aumentati, skin esclusive

---

## 5. Controlli e UI/UX

### 5.1 Touch Controls

#### Movimento
- **Swipe continuo**: Direzione volo
- **Swipe verticale**: Su/giù
- **Magnitude**: Intensità movimento

#### Azioni
- **Tap singolo**: Azione primaria (cattura, colpo, lancio, parata)
- **Double tap**: Manovra evasiva / dash
- **Hold**: Boost / Charge azione
- **Pinch out (2 dita)**: Boost alternativo

#### Zone UI
- **Top 20%**: UI permanente (score, timer)
- **Bottom 15%**: Controlli hint, pulsanti
- **Centro 65%**: Touch area attiva

### 5.2 HUD Design

**Top Bar**:
```
[Blue Score] [Timer] [Red Score]
    150         3:24       120
```

**Bottom Left**:
```
[Stamina Bar]
[Role Icon + Name]
```

**Bottom Right**:
```
[Action Cooldown]
[Charge Indicator]
```

**Center Notifications**:
```
+10 GOAL!
RADIANT GLOBE CAPTURED!
PERFECT HIT!
```

### 5.3 Menu Navigation

**Main Menu**:
```
╔════════════════╗
║  SKY SPHERES   ║
╠════════════════╣
║   [PLAY]       ║
║ [PROGRESSION]  ║
║   [SHOP]       ║
║  [SETTINGS]    ║
║   [QUIT]       ║
╠════════════════╣
║ Level 15       ║
║ 1250 💰 50 💎  ║
╚════════════════╝
```

---

## 6. Destiny Hood System

### 6.1 Personalità

Il Destiny Hood ha una personalità **ironica, sagace e leggermente sarcastica**. Fa battute sui giocatori ma in modo affettuoso.

**Tono**:
- 60% ironico/sarcastico
- 30% incoraggiante
- 10% misterioso

### 6.2 Dialoghi per Ruolo

**Esempi già implementati**:
- Seeker: "Ah! Vedo velocità nei tuoi riflessi... o forse è solo nervosismo?"
- Beater: "Battitore! Perfetto per chi risolve i problemi... a colpi di mazza!"
- Chaser: "Precisione e lavoro di squadra! Sei tu o è il tuo curriculum falso?"
- Keeper: "Portiere! Per chi preferisce stare fermo... ma con stile!"

### 6.3 Modalità Training Quiz

**Domande**:
1. "Velocità o precisione?" → +Speed o +Accuracy
2. "Difesa o attacco?" → +Defense o +Offense stat
3. "Squadra o gloria personale?" → Team bonus o Solo bonus

**Rewards**: +5-10 XP, +10 coins

---

## 7. Monetizzazione

### 7.1 Modello Business

**Free-to-Play** con IAP opzionali

### 7.2 In-App Purchases

**Starter Packs**:
- Beginner Pack: $2.99 (500 coins, 100 gems, 1 skin)
- Pro Pack: $9.99 (2000 coins, 500 gems, 3 skin)

**Currency**:
- 100 gems: $0.99
- 500 gems: $4.99 (best value)
- 1000 gems: $9.99

**Premium Pass** (stagionale):
- $4.99/mese
- Doppio XP
- Skin esclusive
- Daily gems bonus

### 7.3 Ads (Opzionali)

**Rewarded Ads**:
- Doppio reward partita: +50 coins
- Energy refill: full stamina
- Retry partita: free retry

**Frequenza**: Max 1 ad ogni 5 minuti

---

## 8. Arte e Audio

### 8.1 Stile Visivo

**Direction**: 3D Cartoon Fantasy
**Palette**:
- Primari: Blu elettrico, Rosso fuoco, Oro brillante
- Secondari: Viola magico, Verde smeraldo
- Neutri: Grigio pietra, Bianco nuvola

**Character Design**:
- Proporzioni stilizzate (chibi-like)
- Effetti magici vistosi
- Animazioni fluide ed exaggerate

### 8.2 Audio Design

**Musica**:
- Main Menu: Orchestrale epica maestosa (120 BPM)
- Gameplay: Orchestrale battle dinamica (140 BPM)
- Victory: Fanfare trionfale
- Defeat: Tono minor melanconico

**SFX**:
- Volo: Whoosh costante
- Colpo: Thud metallico + magic sparkle
- Goal: Crowd cheer + magic chime
- Cattura Globe: Celestial bells + explosion
- UI: Click delicati

**Voice**:
- Destiny Hood: Voce narrante inglese/italiana
- Announcer: Voci da stadio per eventi chiave

---

## 9. Roadmap Tecnica

### Phase 1: Core Gameplay (Settimane 1-4)
- [x] Setup progetto Unity
- [x] Implementazione 4 ruoli
- [x] Fisica di volo base
- [x] Controlli touch
- [x] AI base
- [ ] Testing gameplay core

### Phase 2: Systems (Settimane 5-8)
- [x] Destiny Hood system
- [x] Progressione e XP
- [x] Save/Load system
- [x] Achievement
- [ ] Audio implementation
- [ ] VFX particles

### Phase 3: Content (Settimane 9-12)
- [ ] Story Mode 50 livelli
- [ ] 20+ skin
- [ ] Sound design completo
- [ ] Modelli 3D custom
- [ ] Arena variations

### Phase 4: Polish & Multiplayer (Settimane 13-16)
- [ ] Multiplayer networking
- [ ] Matchmaking
- [ ] Leaderboard
- [ ] Tournament system
- [ ] IAP implementation

### Phase 5: Beta & Release (Settimane 17-20)
- [ ] Closed beta testing
- [ ] Bug fixing
- [ ] Performance optimization
- [ ] Localization (EN, IT, ES, FR, DE)
- [ ] Soft launch
- [ ] Global release

---

## 10. Metrics & Analytics

### KPI da Tracciare

**Engagement**:
- DAU (Daily Active Users)
- Session length (target: 15-20 min)
- Retention D1/D7/D30

**Monetization**:
- ARPU (Average Revenue Per User)
- Conversion rate IAP
- Ad revenue per user

**Gameplay**:
- Ruolo più giocato
- Win rate per ruolo
- Tempo medio partita
- Drop-off rate per livello

**Social**:
- Share rate
- Multiplayer engagement
- Tournament participation

---

## 11. Conclusioni

Sky Spheres offre un'esperienza mobile unica di sport aereo fantasy, combinando:
- Meccaniche profonde e diverse per 4 ruoli
- Progressione coinvolgente e personalizzabile
- Personalità tramite il Destiny Hood
- Controlli touch ottimizzati
- Free-to-play fair (no pay-to-win)

**Target Audience**: Giocatori mobile 13-35 anni, fan di sport games e fantasy

**USP Finale**: "Il primo gioco di sport aereo dove il tuo destino è deciso da un cappello magico ironico!"

---

**Documento vivo** - Soggetto ad aggiornamenti durante sviluppo

*Fine GDD v1.0*
