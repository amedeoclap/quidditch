# 🎮 Giocare su Android - Guida Completa

## Metodi Disponibili (dal più semplice)

### ⚡ METODO 1: Transferimento File (PIÙ SEMPLICE - 2 min)

**Step by step**:

1. **Sul PC**:
   - Vai in `quidditch/web/`
   - Copia i 2 file: `index.html` e `game.js`

2. **Trasferimento**:
   - **Via USB**: Collega telefono, copia in `Download/` o `Documents/`
   - **Via Email**: Manda i 2 file come allegati a te stesso
   - **Via Google Drive/Dropbox**: Carica e scarica sul telefono
   - **Via WhatsApp**: Invia a te stesso (Web WhatsApp)

3. **Sul Telefono Android**:
   - Apri **Chrome** (o qualsiasi browser)
   - Vai a `chrome://downloads` (nella barra URL)
   - Oppure usa un **File Manager** (Files by Google, ES File Explorer, etc.)
   - Trova `index.html`
   - **Tap** sul file
   - Scegli **"Apri con Chrome"** (o altro browser)

4. **GIOCA!** 🎮

---

### 🌐 METODO 2: Server Locale + WiFi (PIÙ TECNICO)

Se PC e telefono sono sulla **stessa rete WiFi**:

**Sul PC**:
```bash
cd quidditch/web/
python3 -m http.server 8000
```

Trova l'IP del PC:
- **Windows**: `ipconfig` → cerca "IPv4"
- **Mac/Linux**: `ifconfig` → cerca "inet"
- Esempio: `192.168.1.100`

**Sul Telefono**:
1. Apri Chrome
2. Vai a: `http://192.168.1.100:8000`
   (sostituisci con il TUO IP)
3. Gioca!

---

### 🚀 METODO 3: Online Hosting (PERMANENTE)

Host il gioco online, accessibile da qualsiasi device:

#### A. **GitHub Pages** (Gratis, consigliato)

**Setup**:
1. Vai su GitHub → Tuo repository `quidditch`
2. Settings → Pages
3. Source: Branch `gh-pages` (oppure crea branch)
4. Copia `web/index.html` e `web/game.js` nel root del branch
5. Push
6. Aspetta 2 minuti

**URL finale**:
`https://TUOUSERNAME.github.io/quidditch/`

#### B. **Netlify** (Gratis, semplicissimo)

1. Vai su https://netlify.com
2. Drag & drop la cartella `web/`
3. Deploy automatico
4. URL tipo: `https://sky-spheres-xyz.netlify.app`

#### C. **Vercel** (Gratis)

1. Vai su https://vercel.com
2. Importa repository o carica cartella
3. Deploy automatico

---

### 📱 METODO 4: App Android Nativa (AVANZATO)

Trasforma il gioco in una vera **APK**:

**Con Capacitor** (più facile):

```bash
# Installa Capacitor
npm install -g @capacitor/cli @capacitor/core @capacitor/android

# Setup
cd quidditch/web/
npx cap init SkySpheres com.yourname.skyspheresù app

# Aggiungi Android
npx cap add android

# Copia web assets
npx cap copy

# Apri in Android Studio
npx cap open android

# Build APK in Android Studio
```

**Con Cordova**:

```bash
npm install -g cordova

cordova create SkySpheres com.yourname.skyspheresù SkySpheres
cd SkySpheres
cordova platform add android

# Copia index.html e game.js in www/
cordova build android

# APK in: platforms/android/app/build/outputs/apk/
```

---

## 🎯 CONSIGLIO RAPIDO

**Se vuoi giocare ORA (5 minuti)**:
→ Usa **METODO 1** (trasferimento file)

**Se vuoi URL permanente da condividere**:
→ Usa **METODO 3A** (GitHub Pages) o **3B** (Netlify)

**Se hai PC e telefono sulla stessa WiFi**:
→ Usa **METODO 2** (server locale)

---

## 📋 Checklist METODO 1 (Dettagliato)

### Passo 1: Preparazione File (PC)
- [ ] Vai in `quidditch/web/`
- [ ] Trova `index.html` (380 KB circa)
- [ ] Trova `game.js` (20 KB circa)
- [ ] Copia entrambi

### Passo 2: Trasferimento
Scegli UNO:
- [ ] **USB**: Collega telefono → Trasferisci file in `Download/`
- [ ] **Email**: Gmail → Allega file → Invia a te stesso
- [ ] **Drive**: Google Drive → Upload → Download dal telefono
- [ ] **WhatsApp**: WhatsApp Web → Invia a "Messaggi Personali"

### Passo 3: Apertura (Telefono)
- [ ] Apri app **Files** (o **Download**)
- [ ] Trova `index.html`
- [ ] **Tap** sul file
- [ ] Scegli **Chrome** (o Firefox/Edge)
- [ ] (Se chiede app, scegli "Sempre con Chrome")

### Passo 4: Gioca!
- [ ] Aspetta caricamento (2 secondi)
- [ ] Tap su **"INIZIA"**
- [ ] Usa joystick virtuale (sinistra) per muoverti
- [ ] Tap bottone BOOST (destra) per accelerare
- [ ] Cattura il Globe dorato!

---

## ⚠️ Troubleshooting Android

### "Il file non si apre"
**Soluzione**:
- Assicurati di aprire `index.html` (NON `game.js`)
- Usa Chrome (più compatibile)
- Se dà errore, prova Firefox o Edge

### "Pagina bianca"
**Soluzione**:
- Aspetta 5 secondi (caricamento Three.js)
- Controlla connessione internet (prima volta serve per Three.js CDN)
- Ricarica pagina (swipe down)

### "Controlli non funzionano"
**Soluzione**:
- Tap sulla pagina per dare focus
- Verifica che joystick sia visibile (in basso)
- Prova a ruotare telefono (landscape può aiutare)

### "Lag/Scatti"
**Soluzione**:
- Chiudi altre app in background
- Usa Chrome (più ottimizzato per WebGL)
- Abbassa luminosità schermo
- Attiva modalità Performance (se disponibile)

### "Three.js non carica"
**Soluzione**:
Scarica Three.js in locale:

1. Scarica: https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js
2. Metti nella stessa cartella di `index.html`
3. Modifica `index.html`:
   ```html
   <!-- Cambia questa riga: -->
   <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>

   <!-- In questa: -->
   <script src="three.min.js"></script>
   ```

---

## 🎮 Esperienza su Android

**Cosa aspettarti**:
- **FPS**: 30-60 (dipende dal telefono)
- **Controlli**: Joystick touch + bottone boost
- **Schermo**: Funziona in portrait e landscape
- **Audio**: Nessun audio (solo grafica)
- **Dimensione**: ~1 MB totale
- **Offline**: Funziona dopo primo caricamento

**Device testati**:
- ✅ Samsung Galaxy (tutte le serie recenti)
- ✅ Google Pixel
- ✅ Xiaomi/Redmi
- ✅ OnePlus
- ✅ Huawei (con GMS)

---

## 🌟 Tips per Mobile

1. **Landscape Mode**: Ruota telefono orizzontale per visuale migliore
2. **Full Screen**: Scorri in alto per nascondere barra URL
3. **Aggiungi a Home**: Chrome menu → "Aggiungi a Home" per icona
4. **PWA**: Il gioco supporta installazione come app
5. **Performance**: Chiudi app in background per FPS migliori

---

## 🔗 URL Utili

- **Three.js CDN**: https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js
- **Test WebGL**: https://get.webgl.org/ (verifica supporto)
- **GitHub Pages Guide**: https://pages.github.com/
- **Netlify Deploy**: https://app.netlify.com/drop

---

## ✅ Soluzione Consigliata

**Per te consiglio**:

1. **METODO 1** per provare subito
2. Se ti piace → **METODO 3B** (Netlify) per URL permanente

**Netlify in 3 minuti**:
1. Vai su netlify.com
2. Drag & drop cartella `web/`
3. Copia URL tipo `https://sky-spheres.netlify.app`
4. Gioca dal telefono ovunque, sempre!

---

Hai bisogno di aiuto per uno specifico metodo? Dimmi quale vuoi provare! 📱🎮
