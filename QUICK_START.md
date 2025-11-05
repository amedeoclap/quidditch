# Quick Start - Gioca Subito!

## Setup Rapido (15 minuti)

### 1. Installa Unity

1. Scarica **Unity Hub**: https://unity.com/download
2. Installa **Unity 2021.3 LTS** (o superiore)
3. Durante l'installazione, aggiungi moduli:
   - ✅ Android Build Support
   - ✅ iOS Build Support (se hai Mac)

### 2. Crea il Progetto

1. Apri Unity Hub
2. Click **New Project**
3. Seleziona template **3D (URP)** o **3D Core**
4. Nome: `SkySpheres`
5. Location: scegli dove vuoi
6. Click **Create Project**

### 3. Importa gli Script

**IMPORTANTE**: Gli script sono già nella cartella del repository!

1. Nel tuo progetto Unity, vai a `Assets/`
2. Copia l'intera cartella `Scripts/` dal repository in `Assets/Scripts/`
3. Unity compilerà automaticamente

### 4. Installa TextMeshPro

1. In Unity, vai a `Window > TextMeshPro > Import TMP Essential Resources`
2. Click **Import**

### 5. Crea la Scena di Test Minimalista

#### A. Crea Oggetti Base

**Hierarchy > Click destro:**

```
Scene
├── Managers (Empty GameObject)
│   └── [Add Component] Game Manager
│   └── [Add Component] Progression System
│   └── [Add Component] Destiny Hood
│
├── Player (Create > 3D Object > Capsule)
│   └── [Add Component] Rigidbody
│   └── [Add Component] Seeker Controller
│   └── [Add Component] Touch Input Controller
│   └── [Tag: Player]
│
├── RadiantGlobe (Create > 3D Object > Sphere)
│   └── [Add Component] Rigidbody
│   └── [Add Component] Radiant Globe
│   └── [Layer: RadiantGlobe]
│   └── Scale: (0.5, 0.5, 0.5)
│   └── Material: Giallo/Oro
│
├── Ground (Create > 3D Object > Plane)
│   └── Scale: (10, 1, 10)
│   └── Position: (0, -5, 0)
│
└── Main Camera
    └── Position: (0, 10, -15)
    └── Rotation: (25, 0, 0)
```

#### B. Configura i Layer

1. `Edit > Project Settings > Tags and Layers`
2. Aggiungi questi layer:
   - Layer 8: `Player`
   - Layer 10: `RadiantGlobe`

3. Assegna layer:
   - Player GameObject → Layer `Player`
   - RadiantGlobe → Layer `RadiantGlobe`

#### C. Configura i Component

**Player (Seeker Controller)**:
- Detection Range: 50
- Capture Range: 3
- Radiant Globe Layer: seleziona `RadiantGlobe`

**Touch Input Controller**:
- Player Controller: trascina Player stesso

**Radiant Globe**:
- Player Layer: seleziona `Player`
- Move Speed: 8
- Max Speed: 15

**Game Manager**:
- Destiny Hood: trascina il GameObject Destiny Hood

### 6. Test Keyboard in Editor

1. Click **Play** ▶️
2. Controlli:
   - **WASD**: Movimento orizzontale
   - **Spazio**: Vola su
   - **Ctrl**: Vola giù
   - **E**: Cattura (quando vicino al Globe)
   - **Shift**: Boost

### 7. Build per Android (Opzionale)

Se vuoi provarlo su telefono:

1. `File > Build Settings`
2. Seleziona **Android**
3. Click **Switch Platform**
4. `Player Settings`:
   - Package Name: `com.tuonome.skyspherestest`
   - Minimum API Level: 24
5. Collega telefono via USB
6. Click **Build And Run**

---

## 🎯 Cosa Funziona in Questa Versione Minimalista

✅ Movimento del player (volo)
✅ Inseguimento del Radiant Globe
✅ Cattura del Globe (termina partita)
✅ Controlli touch su mobile
✅ Controlli keyboard in editor

❌ Non inclusi (per ora):
- UI/HUD
- Altri ruoli (Beater, Chaser, Keeper)
- AI nemici
- Punteggio visivo
- Menu

---

## 🐛 Troubleshooting

### "Script non compila"
- Verifica di aver copiato TUTTA la cartella Scripts/
- Window > Package Manager > Install TextMeshPro

### "Player non si muove"
- Verifica che Touch Input Controller abbia il riferimento a Player Controller
- In editor, usa WASD + Spazio/Ctrl

### "Non cattura il Globe"
- Verifica layer `RadiantGlobe` sia assegnato
- Premi E quando sei vicino (< 3m)
- Check Inspector: Seeker Controller > Radiant Globe Layer

### "Globe non si muove"
- Verifica che Rigidbody abbia:
  - Use Gravity: ❌ OFF
  - Drag: 0.5

---

## 🚀 Prossimo Passo

Una volta che funziona questa versione base, puoi:

1. Leggere `UNITY_SETUP.md` per la versione completa
2. Aggiungere UI/HUD
3. Aggiungere altri ruoli
4. Creare modelli 3D custom
5. Aggiungere effetti particellari

---

**Tempo totale**: 15-20 minuti per avere qualcosa di giocabile! 🎮
