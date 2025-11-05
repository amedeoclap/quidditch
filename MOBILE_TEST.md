# Test Mobile Rapido

## Build Android in 5 minuti

### Prerequisiti
- Unity già installato con Android Build Support
- Telefono Android con USB debugging attivo

### Steps

1. **Apri Unity Hub** → Crea progetto 3D
2. **Importa Scripts** da questa repo
3. **Crea scena minimalista**:
   - Player (Capsule + Seeker Controller + Touch Input)
   - Globe (Sphere + Radiant Globe)
   - Camera che segue player

4. **Build Settings**:
   ```
   File > Build Settings
   - Platform: Android
   - Switch Platform
   - Add Open Scenes
   ```

5. **Player Settings**:
   ```
   - Company Name: [tuo nome]
   - Product Name: Sky Spheres Test
   - Package Name: com.[tuonome].skyspherestest
   - Minimum API Level: 24 (Android 7.0)
   - Target API Level: 33
   - Scripting Backend: IL2CPP
   - Target Architectures: ARM64 ✅
   ```

6. **Build**:
   ```
   - Collega telefono via USB
   - Build And Run
   - Aspetta compilazione (5-10 min prima volta)
   ```

### Controlli Touch

- **Swipe** ovunque sullo schermo = Movimento
- **Tap** quando vicino al Globe = Cattura
- **Hold** = Boost

### Test

1. Il Globe dorato dovrebbe muoversi erraticamente
2. Swipe per volare e inseguirlo
3. Avvicinati e tap per catturare
4. Quando catturi: "RADIANT GLOBE CATTURATO!" nel log

---

## Debug su Android

**Vedi i log**:
```bash
# Collega telefono via USB
adb logcat -s Unity

# Oppure in Unity:
Window > Analysis > Android Logcat
```

**Performance**:
- Target 30 FPS su device medio
- Se lag: riduci qualità ombre in Settings
