# 🎮 Sky Spheres - Web Version

Versione **WebGL browser-based** di Sky Spheres che funziona direttamente nel browser!

Costruita con **Three.js** per grafica 3D real-time.

---

## 🚀 Come Giocare (3 Metodi)

### Metodo 1: Doppio Click (Più Semplice) ⭐

1. Vai nella cartella `web/`
2. **Doppio click su `index.html`**
3. Si apre nel browser
4. Click su **"INIZIA"**
5. **GIOCA!** 🎮

**Tempo**: 5 secondi

---

### Metodo 2: Server Locale Python

Se il metodo 1 non funziona per CORS:

```bash
cd web/
python3 -m http.server 8000
```

Poi apri: **http://localhost:8000**

---

### Metodo 3: Live Server (VS Code)

1. Installa estensione "Live Server" in VS Code
2. Click destro su `index.html`
3. "Open with Live Server"

---

## 🎯 Obiettivo

**Insegui e cattura il Radiant Globe dorato** nel minor tempo possibile!

Il Globe:
- ✨ Vola erraticamente nell'arena
- 🏃 Ti evita quando ti avvicini
- 💫 Cambia direzione casualmente
- 🌟 Pulsa e brilla

---

## 🕹️ Controlli

### 🖥️ PC/Laptop (Keyboard)

```
W/A/S/D      = Movimento orizzontale
SPAZIO       = Vola su
CTRL         = Vola giù
SHIFT        = Boost (velocità x2)
```

### 📱 Mobile/Tablet (Touch)

```
JOYSTICK (sinistra)  = Movimento
BOTTONE (destra)     = Boost
```

**Touch supportato** su:
- ✅ iPhone/iPad
- ✅ Android
- ✅ Tablet

---

## 🎨 Features Implementate

### Grafica 3D
- ✅ Player (capsula ciano) con glow
- ✅ Radiant Globe (sfera dorata) con particle trail
- ✅ Arena con ground e skybox
- ✅ Nuvole 3D
- ✅ Ombre dinamiche
- ✅ Fog atmosferico
- ✅ Illuminazione realistica

### Fisica
- ✅ Volo libero in 3D
- ✅ Drag e inerzia
- ✅ Bounds con invisible walls
- ✅ Collision detection

### Gameplay
- ✅ AI del Globe (evasion + erratic movement)
- ✅ Sistema di cattura (< 3m distanza)
- ✅ Timer e tracking distanza
- ✅ Boost system
- ✅ Camera follow smooth

### UI/UX
- ✅ HUD con distanza e timer
- ✅ Start screen
- ✅ Notifiche animate
- ✅ Responsive (desktop + mobile)
- ✅ Controlli touch virtuali

---

## 📊 Statistiche

**Codice**:
- 600+ righe JavaScript
- 200+ righe CSS
- Three.js r128

**Performance**:
- 60 FPS su desktop
- 30+ FPS su mobile
- Ottimizzato per low-end devices

---

## 🎮 Gameplay Tips

1. **Non inseguire direttamente** - Il Globe ti evita!
2. **Usa il Boost** per colpi di velocità
3. **Predici il movimento** - Vai dove sarà, non dove è
4. **Gestisci l'inerzia** - Il volo ha drag realistico
5. **Usa i bounds** - Fallo rimbalzare contro i muri!

---

## 🔧 Troubleshooting

### Il gioco non parte
**Problema**: Schermo nero
**Soluzione**:
- Apri Console (F12) e controlla errori
- Usa server locale (metodo 2)
- Verifica supporto WebGL: https://get.webgl.org/

### Lag/Performance bassa
**Soluzione**:
- Chiudi altre tab del browser
- Usa Chrome/Edge (migliori per WebGL)
- Riduci risoluzione finestra

### Controlli non rispondono
**Soluzione**:
- Click sulla finestra del gioco per focus
- Su mobile: verifica touch funzioni
- Ricarica pagina (F5)

### Globe non si muove
**Soluzione**:
- Aspetta 2-3 secondi dopo "INIZIA"
- Ricarica pagina
- Controlla console per errori

---

## 🌐 Compatibilità Browser

| Browser | Desktop | Mobile |
|---------|---------|--------|
| Chrome | ✅ Perfetto | ✅ Perfetto |
| Edge | ✅ Perfetto | ✅ Perfetto |
| Firefox | ✅ Buono | ✅ Buono |
| Safari | ⚠️ OK | ⚠️ OK |
| Opera | ✅ Buono | ✅ Buono |

**Requisiti**:
- WebGL 1.0+
- JavaScript ES6+
- Touch Events (mobile)

---

## 📱 Installazione PWA (Progressive Web App)

Su mobile puoi "installare" il gioco:

**iOS (Safari)**:
1. Apri in Safari
2. Tap icona Condividi
3. "Aggiungi a Home"
4. Gioca come app!

**Android (Chrome)**:
1. Apri in Chrome
2. Menu (⋮)
3. "Aggiungi a Home"
4. Gioca come app!

---

## 🎯 Record & Leaderboard

Quanto ci metti a catturare il Globe?

**Record da battere**:
- 🥇 **Facile**: 30 secondi
- 🥈 **Medio**: 45 secondi
- 🥉 **Difficile**: 1:00 minuto

Condividi il tuo tempo! 🏆

---

## 🔜 Prossimi Update

Pianificati per v2.0:
- [ ] Multiplayer online
- [ ] Altri ruoli (Beater, Chaser, Keeper)
- [ ] Power-ups
- [ ] Ostacoli dinamici
- [ ] Modalità difficoltà
- [ ] Leaderboard online
- [ ] Soundtrack e SFX
- [ ] Migliori grafiche

---

## 🐛 Bug Noti

- Su Safari iOS, il boost potrebbe avere lag
- Primi secondi possono avere caricamento textures
- Ombre possono essere pesanti su mobile low-end

---

## 💻 Codice Sorgente

Il gioco è **open source**!

File principali:
- `index.html` - Struttura e UI
- `game.js` - Game logic e Three.js
- Nessuna dipendenza esterna (solo Three.js CDN)

**Totale**: ~800 righe di codice

---

## 📞 Support & Feedback

Problemi? Suggerimenti?
- Apri issue su GitHub
- Controlla documentazione completa in `/`

---

## 🎉 Divertiti!

**Sky Spheres Web** è una demo giocabile del gioco completo Unity.

Per l'esperienza completa con tutti i ruoli, AI avanzata, e multiplayer, vedi il progetto Unity principale!

---

**Versione**: 1.0 WebGL
**Engine**: Three.js r128
**Piattaforme**: Browser (Desktop + Mobile)

🌟 **Pronto? Click "INIZIA" e vola!** 🌟
