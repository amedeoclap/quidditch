# Sky Spheres - Unity Setup Guide

Guida completa per configurare e utilizzare il progetto Unity di Sky Spheres.

## 📋 Requisiti

- **Unity**: 2021.3 LTS o superiore
- **Piattaforme**: iOS, Android
- **Pacchetti Unity richiesti**:
  - TextMeshPro
  - Unity Input System (opzionale ma consigliato)
  - Cinemachine (per camera avanzate)
  - Universal Render Pipeline (URP) per migliori performance mobile

## 🚀 Setup Iniziale

### 1. Crea un nuovo progetto Unity

```bash
# Apri Unity Hub
# Crea nuovo progetto
# Template: 3D Mobile
# Nome: SkySpheres
```

### 2. Importa gli script

Copia tutti gli script dalla cartella `Assets/Scripts/` nel tuo progetto Unity.

Struttura finale:
```
Assets/
├── Scripts/
│   ├── Core/
│   │   ├── GameEnums.cs
│   │   ├── DestinyHood.cs
│   │   ├── GameManager.cs
│   │   └── ProgressionSystem.cs
│   ├── Gameplay/
│   │   ├── RadiantGlobe.cs
│   │   ├── ScoreOrb.cs
│   │   └── StrikeSphere.cs
│   ├── Player/
│   │   ├── PlayerController.cs
│   │   ├── SeekerController.cs
│   │   ├── BeaterController.cs
│   │   ├── ChaserController.cs
│   │   ├── KeeperController.cs
│   │   └── TouchInputController.cs
│   ├── AI/
│   │   ├── BaseAI.cs
│   │   └── SeekerAI.cs
│   └── UI/
│       ├── GameHUD.cs
│       └── MainMenu.cs
```

### 3. Importa TextMeshPro

1. Window > TextMeshPro > Import TMP Essential Resources
2. Window > TextMeshPro > Import TMP Examples & Extras (opzionale)

## 🎮 Creazione delle Scene

### Scene 1: MainMenu

1. **Crea nuova scena**: `Assets/Scenes/MainMenu.unity`

2. **Setup Canvas**:
   ```
   Hierarchy:
   - Canvas (Screen Space - Overlay)
     - MainPanel
       - Title (TextMeshProUGUI)
       - PlayButton (Button)
       - ProgressionButton (Button)
       - ShopButton (Button)
       - SettingsButton (Button)
       - QuitButton (Button)
     - PlayerInfoPanel
       - LevelText (TextMeshProUGUI)
       - CoinsText (TextMeshProUGUI)
       - GemsText (TextMeshProUGUI)
   ```

3. **Aggiungi MainMenu script**:
   - Seleziona Canvas
   - Add Component > Main Menu
   - Assegna i riferimenti ai pannelli e bottoni nell'Inspector

4. **Crea GameObject Manager**:
   ```
   Hierarchy:
   - Managers (Empty GameObject)
     - GameManager (Add Component > Game Manager)
     - ProgressionSystem (Add Component > Progression System)
   ```

### Scene 2: RoleSelection

1. **Crea nuova scena**: `Assets/Scenes/RoleSelection.unity`

2. **Setup scena**:
   ```
   Hierarchy:
   - Canvas
     - DialoguePanel
       - DestinyHoodImage (Image)
       - DialogueText (TextMeshProUGUI)
   - DestinyHood (Empty GameObject)
     - Add Component > Destiny Hood
   ```

3. **Camera e Lighting**:
   - Main Camera: posizione artistica con il cappello magico
   - Directional Light: illuminazione soft

### Scene 3: GameArena

1. **Crea nuova scena**: `Assets/Scenes/GameArena.unity`

2. **Setup Arena**:
   ```
   Hierarchy:
   - Arena
     - Field (Plane, scala 100x1x100)
     - GoalRings_Blue (3 anelli)
       - HighRing (Add GoalRing component, team=Blue, height=3)
       - MidRing (Add GoalRing component, team=Blue, height=2)
       - LowRing (Add GoalRing component, team=Blue, height=1)
     - GoalRings_Red (3 anelli)
       - HighRing (Add GoalRing component, team=Red, height=3)
       - MidRing (Add GoalRing component, team=Red, height=2)
       - LowRing (Add GoalRing component, team=Red, height=1)
     - Bounds (Invisible walls)
   ```

3. **Setup Player**:
   ```
   Hierarchy:
   - Player (Empty GameObject)
     - Model (3D model del giocatore)
     - Add Component > Rigidbody
     - Add Component > Sphere Collider
     - Add Component > Seeker Controller (o altro ruolo)
     - Add Component > Touch Input Controller
   ```

4. **Setup Game Objects**:
   ```
   Hierarchy:
   - GameObjects
     - RadiantGlobe
       - Sphere (golden material)
       - Add Component > Rigidbody
       - Add Component > Sphere Collider
       - Add Component > Radiant Globe
     - ScoreOrb
       - Sphere (red material)
       - Add Component > Rigidbody
       - Add Component > Sphere Collider
       - Add Component > Score Orb
     - StrikeSphere_1
       - Sphere (black material)
       - Add Component > Rigidbody
       - Add Component > Sphere Collider
       - Add Component > Strike Sphere
     - StrikeSphere_2 (duplicate)
   ```

5. **Setup UI**:
   ```
   Hierarchy:
   - Canvas
     - GameHUD (Add Component > Game HUD)
       - ScorePanel
       - TimerPanel
       - StaminaBar
       - ActionIndicator
   ```

6. **Setup Camera**:
   ```
   - Main Camera
     - Position: Dietro e sopra al player
     - Add Component > Cinemachine Virtual Camera (opzionale)
     - Follow: Player Transform
   ```

## 🎨 Materiali e Asset

### Crea materiali di base:

1. **Golden Material** (Radiant Globe):
   - Albedo: Giallo brillante (#FFD700)
   - Metallic: 1
   - Smoothness: 0.9
   - Emission: Giallo (#FFD700), Intensity: 2

2. **Blue Team Material**:
   - Albedo: Blu (#0066FF)
   - Metallic: 0.5
   - Smoothness: 0.6

3. **Red Team Material**:
   - Albedo: Rosso (#FF0000)
   - Metallic: 0.5
   - Smoothness: 0.6

4. **Strike Sphere Material**:
   - Albedo: Nero (#1a1a1a)
   - Metallic: 0.8
   - Smoothness: 0.7

## ⚙️ Configurazione Layers

**Project Settings > Tags and Layers**:

```
Layers:
- Player (Layer 8)
- Enemy (Layer 9)
- RadiantGlobe (Layer 10)
- ScoreOrb (Layer 11)
- StrikeSphere (Layer 12)
- GoalRing (Layer 13)
```

Assegna i layer appropriati a ogni GameObject.

## 📱 Build Settings per Mobile

### iOS Build:

1. **File > Build Settings**
2. Platform: iOS
3. Player Settings:
   - Bundle Identifier: com.yourname.skyspheresù
   - Minimum iOS Version: 12.0
   - Target SDK: Device SDK
   - Architecture: ARM64
   - Camera Usage Description: "Per AR features (opzionale)"

4. **Graphics Settings**:
   - Graphics API: Metal
   - Color Space: Linear
   - Lightmap Encoding: Normal Quality

### Android Build:

1. **File > Build Settings**
2. Platform: Android
3. Player Settings:
   - Package Name: com.yourname.skyspheresù
   - Minimum API Level: 24 (Android 7.0)
   - Target API Level: 33
   - Scripting Backend: IL2CPP
   - Target Architectures: ARM64

4. **Graphics Settings**:
   - Graphics API: OpenGL ES 3 / Vulkan
   - Color Space: Linear
   - Multithreaded Rendering: Enabled

## 🎯 Setup Input System (Opzionale)

Se vuoi usare il New Input System invece dei controlli touch custom:

1. **Install Package**:
   - Window > Package Manager
   - Unity Registry > Input System > Install

2. **Create Input Actions**:
   - Assets > Create > Input Actions
   - Nome: PlayerInputActions
   - Aggiungi Actions:
     - Move (Vector2)
     - Action (Button)
     - Boost (Button)

3. **Genera C# Class**:
   - Seleziona PlayerInputActions
   - Inspector > Generate C# Class
   - Apply

## 🔧 Ottimizzazioni Mobile

### Performance:

1. **Quality Settings** (Edit > Project Settings > Quality):
   - Create preset "Mobile"
   - Pixel Light Count: 1
   - Texture Quality: Half Res
   - Anisotropic Textures: Per Texture
   - Anti Aliasing: 2x Multi Sampling
   - Soft Particles: Disabled
   - Shadows: Hard Shadows Only

2. **Physics** (Edit > Project Settings > Physics):
   - Fixed Timestep: 0.02 (50fps)
   - Maximum Allowed Timestep: 0.1
   - Solver Iterations: 4
   - Solver Velocity Iterations: 1

3. **Time** (Edit > Project Settings > Time):
   - Fixed Timestep: 0.02
   - Maximum Allowed Timestep: 0.333

### Memory:

1. **Texture Import Settings**:
   - Max Size: 1024 o 2048
   - Compression: Automatic/High Quality
   - Generate Mip Maps: Yes

2. **Audio Import Settings**:
   - Load Type: Compressed In Memory (effects)
   - Load Type: Streaming (music)
   - Compression Format: Vorbis (Android), MP3 (iOS)

## 🧪 Testing

### In Editor:

1. Play Mode
2. Usa WASD per movimento
3. Spazio/Ctrl per volo verticale
4. E o Mouse per azione
5. Shift per boost

### Su Device:

1. Build and Run
2. Test controlli touch
3. Test performance con Profiler
4. Test su diversi device

## 📝 Checklist Pre-Release

- [ ] Tutte le scene funzionano
- [ ] Controlli touch responsive
- [ ] AI funziona correttamente
- [ ] Punteggio e timer corretti
- [ ] Sistema di progressione salva/carica
- [ ] Performance 30+ FPS su device target
- [ ] Nessun memory leak
- [ ] Audio funziona
- [ ] UI responsive su diverse risoluzioni
- [ ] Testato su iOS e Android

## 🐛 Troubleshooting

### Script Errors:

**Problema**: Errori di compilazione
**Soluzione**: Verifica che tutti gli using namespace siano corretti

### Performance Issues:

**Problema**: FPS bassi
**Soluzione**:
- Riduci qualità ombre
- Usa Object Pooling per Strike Spheres
- Ottimizza mesh dei modelli

### Touch Input non funziona:

**Problema**: Controlli non rispondono
**Soluzione**:
- Verifica EventSystem nella scena
- Controlla layer UI nei settings
- Debug.Log nei metodi touch

## 📚 Risorse Utili

- [Unity Mobile Optimization](https://docs.unity3d.com/Manual/MobileOptimization.html)
- [TextMeshPro Documentation](https://docs.unity3d.com/Packages/com.unity.textmeshpro@3.0/manual/index.html)
- [Unity Input System](https://docs.unity3d.com/Packages/com.unity.inputsystem@1.0/manual/index.html)

## 🎓 Prossimi Passi

1. **Crea modelli 3D** per giocatori, arena, oggetti
2. **Aggiungi effetti particellari** per magia, colpi, goal
3. **Implementa musica e SFX**
4. **Crea sistema di skin** per personalizzazione
5. **Aggiungi multiplayer** con Photon/Mirror
6. **Implementa IAP** per monetizzazione
7. **Aggiungi analytics** (Unity Analytics/Firebase)

---

**Buon sviluppo!** 🚀✨
