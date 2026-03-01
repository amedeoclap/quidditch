# Sky Spheres - Mobile Fantasy Sports Game

Un videogioco mobile fantasy basato su sport aereo con meccaniche innovative ispirate a sport magici.

## 🎮 **GIOCA SUBITO NEL BROWSER!** ⚡

**🆕 VERSIONE 3.2 QUIDDITCH - VERO QUIDDITCH DA HARRY POTTER!** 🧙‍♂️

### 🔥 v3.2 True Quidditch (CONSIGLIATA) ⭐⭐⭐⭐⭐

**MECCANICHE AUTENTICHE DA HARRY POTTER!**

1. Vai nella cartella **`web/`**
2. **Doppio click su `index-quidditch.html`**
3. **Destiny Hood Ceremony** 🎩
4. **Scegli il tuo ruolo** (Seeker/Beater/Chaser/Keeper)
5. **GIOCA con le VERE regole del Quidditch!**

**✅ NOVITÀ v3.2 - TRUE QUIDDITCH:**
- 💥 **Bludger AGGRESSIVI**: Inseguono e stordiscono giocatori per 3 secondi!
- ⚔️ **Beater colpisce Bludger**: Reindirizza verso avversari (non solo butta via)
- 🏈 **Chaser ruba Quaffle**: Placcaggio e furto palla realistico
- 🛡️ **Keeper blocca fisicamente**: Intercetta e respinge tiri
- 😵 **Sistema Stun**: 3 secondi di stordimento con animazione spin
- 🏆 **Cattura Snitch = Game Over**: +150 punti e vittoria immediata!
- 👥 **Team 7v7 corretto**: 1 Seeker, 2 Beaters, 3 Chasers, 1 Keeper per squadra

**Direttamente dai Libri:**
- Bludger che scelgono bersagli e attaccano attivamente
- Beater deve colpire Bludger verso nemici, non eliminarli
- Chaser può rubare Quaffle con contrasti fisici
- Keeper difende area goal con corpo

👉 **[Guida v3.2 QUIDDITCH →](web/QUIDDITCH_v3.2.md)** ⭐ **LEGGI QUESTA!**

---

### 🎮 v3.1 Improved (Alternativa)

**Versione precedente con AI attiva ma meccaniche semplificate:**

1. Vai nella cartella **`web/`**
2. **Doppio click su `index-improved.html`**

✅ Controlli mobile completi, AI gioca, giocatori animati
⚠️ Meccaniche Quidditch semplificate (Bludger non aggressivi)

👉 **[Guida v3.1 IMPROVED →](web/IMPROVED_v3.1.md)**

---

### 🎩 v3.0 Complete (Alternativa)

**Versione precedente con AI base:**

1. Vai nella cartella **`web/`**
2. **Doppio click su `index-complete.html`**

⚠️ Nota: AI si muove ma non interagisce, controlli mobile limitati

👉 **[Guida v3.0 →](web/COMPLETE_GAME.md)**

---

### ✨ v2.0 Enhanced (Alternativa Base)

**Versione semplificata senza AI:**

1. Vai nella cartella **`web/`**
2. **Doppio click su `index.html`**

Funzionalità: Audio, Particelle, Classifica, Settings

👉 **[Guida v2.0 →](web/VERSIONE_2.0_FIXED.md)**

---

**Controlli (v3.1 e v3.2)**:
- **Mobile**: Joystick (X/Z) + ▲▼ (Y) + Boost ⚡
- **PC**: WASD + Spazio/Ctrl + Shift

**Obiettivo**: Gioca il tuo ruolo, lavora con AI, segui le regole del Quidditch!

### 📖 Documentazione

- 🧙‍♂️ **[VERSIONE 3.2 QUIDDITCH - Guida →](web/QUIDDITCH_v3.2.md)** ⭐⭐⭐ **CONSIGLIATA!**
- 🔥 **[VERSIONE 3.1 IMPROVED - Guida →](web/IMPROVED_v3.1.md)**
- 🎮 **[VERSIONE 3.0 Complete - Guida →](web/COMPLETE_GAME.md)**
- 🔧 **[VERSIONE 2.0.1 - Bug Fix →](web/VERSIONE_2.0_FIXED.md)**
- 📱 **[Guida Android →](ANDROID_GUIDE.md)**

---

## 🎮 Concept del Gioco

**Sky Spheres** è un gioco di sport aereo ambientato in un'arena sospesa nel cielo, dove i giocatori competono in squadre pilotando Sky Gliders (alianti magici).

### Terminologia Originale
- **Arena**: Campo da gioco aereo sospeso (ispirato al Quidditch pitch)
- **Sky Glider**: Veicolo volante magico (ispirato alla scopa)
- **Radiant Globe**: Sfera dorata luminosa che termina la partita (ispirato al Golden Snitch)
- **Score Orb**: Sfera da lanciare negli anelli per segnare punti (ispirato alla Quaffle)
- **Strike Sphere**: Sfere veloci e aggressive (ispirato ai Bludgers)
- **Destiny Hood**: Cappello magico parlante che assegna i ruoli

### 🎭 Ruoli di Gioco

1. **Seeker** (Cercatore): Insegue e cattura il Radiant Globe
2. **Beater** (Battitore): Colpisce Strike Spheres per proteggere i compagni
3. **Chaser** (Cacciatore): Lancia Score Orbs negli anelli per segnare
4. **Keeper** (Portiere): Difende gli anelli della propria squadra

## 🏗️ Struttura del Progetto

```
Assets/
├── Scripts/
│   ├── Core/           # Game Manager, scene management, save system
│   ├── Gameplay/       # Meccaniche di gioco, ruoli, oggetti
│   ├── UI/             # Interfacce utente, HUD, menu
│   ├── AI/             # Intelligenza artificiale avversari
│   ├── Player/         # Controlli giocatore, input touch
│   └── Utils/          # Utility e helper classes
├── Scenes/             # Scene Unity (Menu, Game, Training)
├── Prefabs/            # Prefab riutilizzabili
├── Materials/          # Materiali e shader
├── UI/                 # Sprite e asset UI
└── Audio/              # Musica e effetti sonori
```

## 🎯 Features Principali

### Sistema Destiny Hood
All'inizio di ogni partita, il **Destiny Hood** (cappello magico parlante) assegna casualmente un ruolo al giocatore con dialoghi ironici e personalizzati.

### Modalità di Gioco
- **Story Mode**: Campagna single-player con difficoltà crescente
- **Quick Match**: Partita veloce contro AI
- **Multiplayer**: Sfide online 1v1 o squadre
- **Training Arena**: Allenamento con il Destiny Hood

### Sistema di Progressione
- Punti esperienza (XP) e livelli
- Skill tree per ogni ruolo
- Personalizzazione: skin per Sky Gliders, divise, effetti
- Achievement e premi giornalieri
- Classifiche globali

### Controlli Mobile
- **Swipe**: Movimento e cambio direzione
- **Tap**: Azione principale (cattura, colpo, lancio)
- **Hold**: Accelerazione
- **Double Tap**: Manovra evasiva

## 🎨 Stile Artistico

- Grafica 3D cartoon-style
- Colori vivaci e saturi
- Effetti particellari magici
- Animazioni fluide e responsive
- UI minimale e intuitiva

## 🛠️ Tecnologie

- **Engine**: Unity 2021+
- **Linguaggio**: C#
- **Piattaforme**: iOS, Android
- **Networking**: Unity Netcode / Photon (per multiplayer)
- **Input System**: Unity New Input System per touch

## 📱 Requisiti Tecnici

- iOS 12.0+
- Android 7.0+ (API Level 24)
- 2GB RAM minimo
- Supporto OpenGL ES 3.0 / Metal

## 🚀 Quick Start

1. Apri il progetto in Unity 2021 o superiore
2. Apri la scena `Assets/Scenes/MainMenu.unity`
3. Premi Play per testare
4. Per build mobile: File > Build Settings > iOS/Android

## 📝 Status / Roadmap

### ✅ Completato (v1.0 - Core)
- [x] Struttura base del progetto Unity
- [x] Sistema Destiny Hood con dialoghi ironici
- [x] 4 Ruoli di gioco completamente implementati
  - [x] Seeker Controller
  - [x] Beater Controller
  - [x] Chaser Controller
  - [x] Keeper Controller
- [x] Controlli touch mobile ottimizzati
- [x] Sistema di fisica di volo
- [x] AI base per avversari con state machine
- [x] Sistema di progressione (XP, livelli, skill tree)
- [x] Sistema di salvataggio e achievement
- [x] Game Manager e gestione stati
- [x] UI/HUD completo
- [x] Oggetti di gameplay (Radiant Globe, Score Orb, Strike Sphere)
- [x] Utility systems (Object Pooler, Camera Follow, Audio Manager)
- [x] Documentazione completa (README, GDD, Unity Setup Guide)

### 🚧 In Sviluppo (v1.1)
- [ ] Modelli 3D custom per personaggi
- [ ] Effetti particellari avanzati
- [ ] Audio implementation (musica, SFX)
- [ ] Story Mode con 50 livelli
- [ ] Sistema di skin e personalizzazione

### 📅 Pianificato (v2.0+)
- [ ] Multiplayer online (Photon/Mirror)
- [ ] Sistema di matchmaking
- [ ] Tournament mode
- [ ] Leaderboard globali
- [ ] Sistema monetizzazione (IAP)
- [ ] Localizzazione multilingua (EN, IT, ES, FR, DE)
- [ ] Integrazione social (share, inviti)
- [ ] Analytics e metrics tracking

## 🎵 Audio Design

- Musica orchestrale epica fantasy
- Cori da stadio reattivi al punteggio
- Effetti sonori per volo, colpi, catture
- Doppiaggio per Destiny Hood

## 📄 Licenza

Questo progetto è stato creato come esempio educativo. Non include riferimenti diretti a proprietà intellettuali protette da copyright.

---

**Nota**: Tutti i nomi, meccaniche e narrativa sono stati creati per essere originali e non violare copyright esistenti.
