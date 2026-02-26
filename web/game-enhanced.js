// ===== SKY SPHERES - ENHANCED VERSION =====
// Complete game with audio, particles, settings, tutorial, leaderboard

// ===== AUDIO SYSTEM =====
class AudioSystem {
    constructor() {
        this.context = null;
        this.sounds = {};
        this.music = null;
        this.musicVolume = 0.3;
        this.sfxVolume = 0.7;
        this.muted = false;

        try {
            this.context = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Web Audio not supported');
        }
    }

    // Generate simple tones for SFX
    playTone(frequency, duration, type = 'sine', volume = 0.3) {
        if (!this.context || this.muted) return;

        const oscillator = this.context.createOscillator();
        const gainNode = this.context.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.context.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = type;

        gainNode.gain.setValueAtTime(volume * this.sfxVolume, this.context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration);

        oscillator.start(this.context.currentTime);
        oscillator.stop(this.context.currentTime + duration);
    }

    playBoost() {
        this.playTone(200, 0.1, 'sawtooth', 0.2);
        setTimeout(() => this.playTone(400, 0.1, 'sawtooth', 0.2), 50);
    }

    playCapture() {
        // Victory sound
        const notes = [523, 659, 784, 1047]; // C, E, G, C (octave higher)
        notes.forEach((note, i) => {
            setTimeout(() => this.playTone(note, 0.3, 'sine', 0.4), i * 100);
        });
    }

    playWhoosh() {
        this.playTone(100, 0.2, 'sawtooth', 0.15);
    }

    playGlobeNear() {
        this.playTone(800, 0.1, 'sine', 0.1);
    }

    // Background music (simple procedural)
    startMusic() {
        if (!this.context || this.muted) return;

        const playNote = () => {
            if (this.muted) return;

            const scale = [261.63, 293.66, 329.63, 392, 440, 523.25]; // C major scale
            const note = scale[Math.floor(Math.random() * scale.length)];

            this.playTone(note, 0.5, 'sine', 0.05 * this.musicVolume);

            setTimeout(playNote, 500 + Math.random() * 500);
        };

        playNote();
    }

    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
    }

    setSFXVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
    }

    toggleMute() {
        this.muted = !this.muted;
        return this.muted;
    }
}

// ===== PARTICLE SYSTEM =====
class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
    }

    createExplosion(position, color = 0xFFD700, count = 50) {
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const velocities = [];

        for (let i = 0; i < count; i++) {
            positions.push(position.x, position.y, position.z);

            const vel = new THREE.Vector3(
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2
            );
            velocities.push(vel);
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

        const material = new THREE.PointsMaterial({
            color: color,
            size: 0.3,
            transparent: true,
            opacity: 1,
            blending: THREE.AdditiveBlending
        });

        const particleSystem = new THREE.Points(geometry, material);
        this.scene.add(particleSystem);

        // Animate particles
        let life = 1.0;
        const animate = () => {
            if (life <= 0) {
                this.scene.remove(particleSystem);
                geometry.dispose();
                material.dispose();
                return;
            }

            const positions = particleSystem.geometry.attributes.position.array;
            for (let i = 0; i < count; i++) {
                positions[i * 3] += velocities[i].x * 0.1;
                positions[i * 3 + 1] += velocities[i].y * 0.1;
                positions[i * 3 + 2] += velocities[i].z * 0.1;

                velocities[i].y -= 0.05; // Gravity
            }
            particleSystem.geometry.attributes.position.needsUpdate = true;

            life -= 0.02;
            material.opacity = life;

            requestAnimationFrame(animate);
        };
        animate();
    }

    createTrail(object, color = 0x00CED1) {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(60); // 20 points * 3
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const material = new THREE.LineBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.6,
            linewidth: 2
        });

        const trail = new THREE.Line(geometry, material);
        this.scene.add(trail);

        const trailPoints = [];
        for (let i = 0; i < 20; i++) {
            trailPoints.push(object.position.clone());
        }

        // Update function
        trail.update = () => {
            trailPoints.pop();
            trailPoints.unshift(object.position.clone());

            const positions = trail.geometry.attributes.position.array;
            for (let i = 0; i < trailPoints.length; i++) {
                positions[i * 3] = trailPoints[i].x;
                positions[i * 3 + 1] = trailPoints[i].y;
                positions[i * 3 + 2] = trailPoints[i].z;
            }
            trail.geometry.attributes.position.needsUpdate = true;
        };

        return trail;
    }
}

// ===== LEADERBOARD =====
class Leaderboard {
    constructor() {
        this.scores = this.load();
    }

    load() {
        const saved = localStorage.getItem('skySpheres_leaderboard');
        return saved ? JSON.parse(saved) : [];
    }

    save() {
        localStorage.setItem('skySpheres_leaderboard', JSON.stringify(this.scores));
    }

    addScore(time, difficulty = 'normal') {
        this.scores.push({
            time: time,
            difficulty: difficulty,
            date: new Date().toISOString()
        });

        this.scores.sort((a, b) => a.time - b.time);
        this.scores = this.scores.slice(0, 10); // Keep top 10

        this.save();
        return this.getRank(time);
    }

    getRank(time) {
        return this.scores.findIndex(s => s.time === time) + 1;
    }

    getTop10() {
        return this.scores;
    }

    getBestTime() {
        return this.scores.length > 0 ? this.scores[0].time : null;
    }
}

// ===== SETTINGS =====
class Settings {
    constructor() {
        this.data = this.load();
    }

    load() {
        const saved = localStorage.getItem('skySpheres_settings');
        return saved ? JSON.parse(saved) : {
            musicVolume: 0.3,
            sfxVolume: 0.7,
            difficulty: 'normal',
            graphics: 'medium',
            showTutorial: true,
            invertControls: false
        };
    }

    save() {
        localStorage.setItem('skySpheres_settings', JSON.stringify(this.data));
    }

    get(key) {
        return this.data[key];
    }

    set(key, value) {
        this.data[key] = value;
        this.save();
    }
}

// ===== STATS =====
class Stats {
    constructor() {
        this.data = this.load();
    }

    load() {
        const saved = localStorage.getItem('skySpheres_stats');
        return saved ? JSON.parse(saved) : {
            gamesPlayed: 0,
            totalTime: 0,
            captures: 0,
            boostsUsed: 0,
            distanceTraveled: 0
        };
    }

    save() {
        localStorage.setItem('skySpheres_stats', JSON.stringify(this.data));
    }

    increment(key, value = 1) {
        this.data[key] = (this.data[key] || 0) + value;
        this.save();
    }

    get(key) {
        return this.data[key] || 0;
    }
}

// ===== MAIN GAME =====
let scene, camera, renderer;
let player, globe;
let playerVelocity, globeVelocity; // Will be initialized in init()
let gameStarted = false;
let gameTime = 0;
let captured = false;

// Systems
let audio = new AudioSystem();
let particles = null;
let leaderboard = new Leaderboard();
let settings = new Settings();
let stats = new Stats();

// Trails
let playerTrail, globeTrail;

// Mobile controls
let joystickActive = false;
let joystickDirection = { x: 0, y: 0 };
let isBoosting = false;
let lastBoostSound = 0;

// Difficulty multipliers
const DIFFICULTY = {
    easy: { playerSpeed: 0.35, globeSpeed: 0.08, captureDistance: 4 },
    normal: { playerSpeed: 0.25, globeSpeed: 0.12, captureDistance: 3 },
    hard: { playerSpeed: 0.20, globeSpeed: 0.18, captureDistance: 2.5 }
};

// Game constants (will be set based on difficulty)
let PLAYER_SPEED, PLAYER_BOOST, GLOBE_SPEED, CAPTURE_DISTANCE;
const BOUNDS = { x: 40, y: 25, z: 40 };

// Tutorial
let tutorialStep = 0;
let tutorialActive = settings.get('showTutorial');

// Screen shake
let shakeIntensity = 0;

// Export functions for HTML access
window.gameAPI = {
    startGame: startGame,
    toggleSettings: toggleSettings,
    updateSetting: updateSetting,
    skipTutorial: skipTutorial
};

function startGame() {
    if (typeof THREE === 'undefined') {
        alert('Three.js non caricato. Serve connessione internet.');
        return;
    }

    const startScreen = document.getElementById('startScreen');
    const gameCanvas = document.getElementById('gameCanvas');
    const hud = document.getElementById('hud');
    const mobileControls = document.getElementById('mobileControls');

    if (startScreen) startScreen.classList.add('hidden');
    if (gameCanvas) gameCanvas.style.display = 'block';
    if (hud) hud.style.display = 'block';
    if (mobileControls) mobileControls.style.display = 'flex';

    if (tutorialActive) {
        showTutorial();
    }

    init();
    gameStarted = true;
    audio.startMusic();
    animate();
}

function init() {
    // Initialize THREE.js dependent variables
    playerVelocity = new THREE.Vector3();
    globeVelocity = new THREE.Vector3();

    // Set difficulty constants with fallback
    const currentDifficulty = DIFFICULTY[settings.get('difficulty')] || DIFFICULTY.normal;
    PLAYER_SPEED = currentDifficulty.playerSpeed;
    PLAYER_BOOST = currentDifficulty.playerSpeed * 2;
    GLOBE_SPEED = currentDifficulty.globeSpeed;
    CAPTURE_DISTANCE = currentDifficulty.captureDistance;

    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    scene.fog = new THREE.Fog(0x87CEEB, 50, 120);

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 12, 20);

    // Renderer
    const canvas = document.getElementById('gameCanvas');
    const graphicsQuality = settings.get('graphics');
    renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: graphicsQuality !== 'low',
        powerPreference: graphicsQuality === 'high' ? 'high-performance' : 'default'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(graphicsQuality === 'low' ? 1 : Math.min(window.devicePixelRatio, 2));

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 0.8);
    sunLight.position.set(50, 100, 30);
    scene.add(sunLight);

    // Ground with gradient
    const groundGeometry = new THREE.PlaneGeometry(150, 150);
    const groundMaterial = new THREE.MeshLambertMaterial({
        color: 0x4a7c59,
        emissive: 0x2a4c39,
        emissiveIntensity: 0.2
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -5;
    scene.add(ground);

    // Player with glow
    const playerGeometry = new THREE.CapsuleGeometry(0.5, 2, 8, 16);
    const playerMaterial = new THREE.MeshStandardMaterial({
        color: 0x00CED1,
        emissive: 0x00CED1,
        emissiveIntensity: 0.5,
        metalness: 0.3,
        roughness: 0.7
    });
    player = new THREE.Mesh(playerGeometry, playerMaterial);
    player.position.set(0, 3, 0);
    scene.add(player);

    const playerLight = new THREE.PointLight(0x00CED1, 1.5, 10);
    player.add(playerLight);

    // Globe with enhanced materials
    const globeGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const globeMaterial = new THREE.MeshStandardMaterial({
        color: 0xFFD700,
        emissive: 0xFFD700,
        emissiveIntensity: 0.8,
        metalness: 1,
        roughness: 0.1
    });
    globe = new THREE.Mesh(globeGeometry, globeMaterial);
    globe.position.set(15, 12, 15);
    scene.add(globe);

    const globeLight = new THREE.PointLight(0xFFD700, 2, 20);
    globe.add(globeLight);

    // Particle system
    particles = new ParticleSystem(scene);

    // Trails
    if (settings.get('graphics') !== 'low') {
        playerTrail = particles.createTrail(player, 0x00CED1);
        globeTrail = particles.createTrail(globe, 0xFFD700);
    }

    // Initial globe velocity
    globeVelocity.set(
        (Math.random() - 0.5) * GLOBE_SPEED,
        (Math.random() - 0.5) * GLOBE_SPEED * 0.5,
        (Math.random() - 0.5) * GLOBE_SPEED
    );

    setupControls();
    window.addEventListener('resize', onWindowResize);
}

function setupControls() {
    const joystick = document.getElementById('joystick');
    const boostButton = document.getElementById('boostButton');

    if (!joystick || !boostButton) {
        console.warn('Mobile controls not found');
        return;
    }

    const handle = joystick.querySelector('.joystick-handle');
    if (!handle) {
        console.warn('Joystick handle not found');
        return;
    }

    joystick.addEventListener('touchstart', (e) => {
        e.preventDefault();
        joystickActive = true;
        const rect = joystick.getBoundingClientRect();
        const touchStartX = rect.left + rect.width / 2;
        const touchStartY = rect.top + rect.height / 2;
        joystick.dataset.startX = touchStartX;
        joystick.dataset.startY = touchStartY;

        if (navigator.vibrate) navigator.vibrate(10);
    });

    joystick.addEventListener('touchmove', (e) => {
        if (!joystickActive) return;
        e.preventDefault();
        const touch = e.touches[0];
        const touchStartX = parseFloat(joystick.dataset.startX);
        const touchStartY = parseFloat(joystick.dataset.startY);
        const deltaX = touch.clientX - touchStartX;
        const deltaY = touch.clientY - touchStartY;
        const distance = Math.min(Math.sqrt(deltaX * deltaX + deltaY * deltaY), 35);
        const angle = Math.atan2(deltaY, deltaX);

        handle.style.transform = `translate(calc(-50% + ${Math.cos(angle) * distance}px), calc(-50% + ${Math.sin(angle) * distance}px))`;

        const invertMultiplier = settings.get('invertControls') ? -1 : 1;
        joystickDirection.x = Math.cos(angle) * (distance / 35);
        joystickDirection.y = Math.sin(angle) * (distance / 35) * invertMultiplier;
    });

    joystick.addEventListener('touchend', () => {
        joystickActive = false;
        handle.style.transform = 'translate(-50%, -50%)';
        joystickDirection.x = 0;
        joystickDirection.y = 0;

        if (navigator.vibrate) navigator.vibrate(5);
    });

    boostButton.addEventListener('touchstart', (e) => {
        e.preventDefault();
        isBoosting = true;
        boostButton.style.background = 'rgba(255, 215, 0, 0.95)';
        boostButton.style.transform = 'scale(0.95)';

        if (navigator.vibrate) navigator.vibrate(20);
    });

    boostButton.addEventListener('touchend', () => {
        isBoosting = false;
        boostButton.style.background = 'rgba(255, 215, 0, 0.6)';
        boostButton.style.transform = 'scale(1)';
    });
}

function updatePlayer() {
    const speed = isBoosting ? PLAYER_BOOST : PLAYER_SPEED;

    if (isBoosting && Date.now() - lastBoostSound > 500) {
        audio.playBoost();
        lastBoostSound = Date.now();
        stats.increment('boostsUsed');
    }

    if (joystickActive) {
        playerVelocity.x += joystickDirection.x * speed;
        playerVelocity.z += joystickDirection.y * speed;
    }

    const oldPosition = player.position.clone();
    player.position.add(playerVelocity);
    stats.increment('distanceTraveled', player.position.distanceTo(oldPosition));

    playerVelocity.multiplyScalar(0.88);

    player.position.x = Math.max(-BOUNDS.x, Math.min(BOUNDS.x, player.position.x));
    player.position.y = Math.max(0, Math.min(BOUNDS.y, player.position.y));
    player.position.z = Math.max(-BOUNDS.z, Math.min(BOUNDS.z, player.position.z));

    if (playerVelocity.length() > 0.01) {
        const targetRotation = Math.atan2(playerVelocity.x, playerVelocity.z);
        player.rotation.y += (targetRotation - player.rotation.y) * 0.1;
    }

    // Update trail
    if (playerTrail) playerTrail.update();
}

function updateGlobe() {
    const time = Date.now() * 0.001;

    globeVelocity.x += Math.sin(time * 0.7) * 0.008;
    globeVelocity.y += Math.cos(time * 0.5) * 0.004;
    globeVelocity.z += Math.sin(time * 0.9) * 0.008;

    const distanceToPlayer = globe.position.distanceTo(player.position);

    if (distanceToPlayer < 15) {
        const evasionDirection = new THREE.Vector3()
            .subVectors(globe.position, player.position)
            .normalize();
        globeVelocity.add(evasionDirection.multiplyScalar(0.015));
    }

    // Play proximity sound
    if (distanceToPlayer < 8 && Math.random() < 0.02) {
        audio.playGlobeNear();
    }

    globe.position.add(globeVelocity);

    if (globeVelocity.length() > GLOBE_SPEED * 2) {
        globeVelocity.normalize().multiplyScalar(GLOBE_SPEED * 2);
    }

    ['x', 'y', 'z'].forEach(axis => {
        const bound = axis === 'y' ? BOUNDS.y : (axis === 'x' ? BOUNDS.x : BOUNDS.z);
        const min = axis === 'y' ? 2 : -bound;
        const max = bound;

        if (globe.position[axis] < min || globe.position[axis] > max) {
            globeVelocity[axis] *= -1;
            globe.position[axis] = Math.max(min, Math.min(max, globe.position[axis]));
        }
    });

    globe.rotation.y += 0.02;
    const pulse = 1 + Math.sin(time * 3) * 0.08;
    globe.scale.set(pulse, pulse, pulse);

    // Update trail
    if (globeTrail) globeTrail.update();
}

function updateCamera() {
    const targetPosition = new THREE.Vector3(
        player.position.x,
        player.position.y + 10,
        player.position.z + 18
    );

    // Screen shake
    if (shakeIntensity > 0) {
        targetPosition.x += (Math.random() - 0.5) * shakeIntensity;
        targetPosition.y += (Math.random() - 0.5) * shakeIntensity;
        shakeIntensity *= 0.9;
    }

    camera.position.lerp(targetPosition, 0.05);
    camera.lookAt(player.position.x, player.position.y + 1, player.position.z);
}

function updateHUD() {
    if (!player || !globe) return;

    const distance = player.position.distanceTo(globe.position);
    const distanceEl = document.getElementById('distance');
    if (distanceEl) {
        distanceEl.textContent = `🎯 ${distance.toFixed(1)}m`;
    }

    const minutes = Math.floor(gameTime / 60);
    const seconds = Math.floor(gameTime % 60);
    const timerEl = document.getElementById('timer');
    if (timerEl) {
        timerEl.textContent = `⏱️ ${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
}

function checkCapture() {
    const distance = player.position.distanceTo(globe.position);

    if (distance < CAPTURE_DISTANCE && !captured) {
        captured = true;

        // Effects
        particles.createExplosion(globe.position, 0xFFD700, 100);
        shakeIntensity = 0.5;
        audio.playCapture();

        if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 200]);

        // Stats
        stats.increment('captures');
        stats.increment('gamesPlayed');
        stats.increment('totalTime', gameTime);

        // Leaderboard
        const rank = leaderboard.addScore(gameTime, settings.get('difficulty'));

        showNotification('🎉 CATTURATO! 🎉');

        setTimeout(() => {
            const time = `${Math.floor(gameTime / 60)}:${Math.floor(gameTime % 60).toString().padStart(2, '0')}`;
            let message = `Tempo: ${time}`;
            if (rank <= 10) {
                message += `\n🏆 Rank #${rank}!`;
            }
            const bestTime = leaderboard.getBestTime();
            if (bestTime && gameTime === bestTime) {
                message += '\n⭐ NUOVO RECORD!';
            }
            showNotification(message);

            setTimeout(() => {
                showEndScreen(time, rank);
            }, 2500);
        }, 2000);
    }
}

function showEndScreen(time, rank) {
    const endScreen = document.createElement('div');
    endScreen.id = 'endScreen';
    endScreen.innerHTML = `
        <div style="background: rgba(0,0,0,0.95); position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 2000; display: flex; flex-direction: column; justify-content: center; align-items: center; color: white; text-align: center; padding: 20px;">
            <h1 style="font-size: 48px; margin-bottom: 20px;">🎉 Vittoria! 🎉</h1>
            <p style="font-size: 32px; margin: 10px;">Tempo: ${time}</p>
            ${rank <= 10 ? `<p style="font-size: 24px; color: #FFD700;">🏆 Rank #${rank}</p>` : ''}

            <div style="margin: 30px 0; padding: 20px; background: rgba(255,255,255,0.1); border-radius: 15px;">
                <h3 style="margin-bottom: 15px;">📊 Statistiche</h3>
                <p>Partite giocate: ${stats.get('gamesPlayed')}</p>
                <p>Catture totali: ${stats.get('captures')}</p>
                <p>Boost usati: ${stats.get('boostsUsed')}</p>
                <p>Distanza percorsa: ${stats.get('distanceTraveled').toFixed(1)}m</p>
            </div>

            <div style="margin-top: 20px;">
                <button onclick="location.reload()" style="font-size: 24px; padding: 15px 40px; margin: 10px; background: linear-gradient(135deg, #FFD700, #FFA500); border: none; border-radius: 25px; color: #000; font-weight: bold; cursor: pointer;">
                    🔄 Gioca Ancora
                </button>
                <button onclick="showLeaderboard()" style="font-size: 24px; padding: 15px 40px; margin: 10px; background: linear-gradient(135deg, #4a7c59, #2a4c39); border: none; border-radius: 25px; color: #fff; font-weight: bold; cursor: pointer;">
                    🏆 Classifica
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(endScreen);
}

function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.classList.add('show');
    setTimeout(() => {
        notification.classList.remove('show');
    }, 1800);
}

function showTutorial() {
    const tutorial = document.createElement('div');
    tutorial.id = 'tutorialOverlay';
    tutorial.innerHTML = `
        <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0,0,0,0.9); padding: 30px; border-radius: 20px; color: white; text-align: center; z-index: 1500; max-width: 80%;">
            <h2 style="margin-bottom: 20px; color: #FFD700;">📚 Tutorial</h2>
            <p style="font-size: 18px; margin: 15px 0;">
                <strong>Obiettivo:</strong><br>
                Insegui e cattura la sfera dorata!
            </p>
            <p style="font-size: 18px; margin: 15px 0;">
                <strong>Controlli:</strong><br>
                Joystick sinistro = Movimento<br>
                Bottone destro = Boost
            </p>
            <p style="font-size: 16px; margin: 15px 0; color: #FFD700;">
                💡 La sfera ti evita quando ti avvicini!<br>
                Usa il boost per raggiungerla!
            </p>
            <button onclick="skipTutorial()" style="font-size: 20px; padding: 15px 30px; margin-top: 20px; background: linear-gradient(135deg, #FFD700, #FFA500); border: none; border-radius: 25px; color: #000; font-weight: bold; cursor: pointer;">
                ✓ Ho Capito!
            </button>
        </div>
    `;
    document.body.appendChild(tutorial);
}

function skipTutorial() {
    const tutorial = document.getElementById('tutorialOverlay');
    if (tutorial) tutorial.remove();
    settings.set('showTutorial', false);
}

function toggleSettings() {
    const settingsPanel = document.getElementById('settingsPanel');
    if (settingsPanel) {
        settingsPanel.remove();
    } else {
        showSettings();
    }
}

function showSettings() {
    const panel = document.createElement('div');
    panel.id = 'settingsPanel';
    panel.innerHTML = `
        <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0,0,0,0.95); padding: 30px; border-radius: 20px; color: white; z-index: 1500; max-width: 90%; max-height: 80%; overflow-y: auto;">
            <h2 style="margin-bottom: 20px; color: #FFD700;">⚙️ Impostazioni</h2>

            <div style="margin: 20px 0;">
                <label>🎵 Volume Musica: <span id="musicVolumeValue">${Math.round(settings.get('musicVolume') * 100)}%</span></label><br>
                <input type="range" min="0" max="100" value="${settings.get('musicVolume') * 100}" oninput="updateSetting('musicVolume', this.value / 100)" style="width: 100%; margin: 10px 0;">
            </div>

            <div style="margin: 20px 0;">
                <label>🔊 Volume Effetti: <span id="sfxVolumeValue">${Math.round(settings.get('sfxVolume') * 100)}%</span></label><br>
                <input type="range" min="0" max="100" value="${settings.get('sfxVolume') * 100}" oninput="updateSetting('sfxVolume', this.value / 100)" style="width: 100%; margin: 10px 0;">
            </div>

            <div style="margin: 20px 0;">
                <label>🎮 Difficoltà:</label><br>
                <select onchange="updateSetting('difficulty', this.value)" style="width: 100%; padding: 10px; margin: 10px 0; font-size: 16px;">
                    <option value="easy" ${settings.get('difficulty') === 'easy' ? 'selected' : ''}>Facile</option>
                    <option value="normal" ${settings.get('difficulty') === 'normal' ? 'selected' : ''}>Normale</option>
                    <option value="hard" ${settings.get('difficulty') === 'hard' ? 'selected' : ''}>Difficile</option>
                </select>
            </div>

            <div style="margin: 20px 0;">
                <label>🎨 Qualità Grafica:</label><br>
                <select onchange="updateSetting('graphics', this.value)" style="width: 100%; padding: 10px; margin: 10px 0; font-size: 16px;">
                    <option value="low" ${settings.get('graphics') === 'low' ? 'selected' : ''}>Bassa</option>
                    <option value="medium" ${settings.get('graphics') === 'medium' ? 'selected' : ''}>Media</option>
                    <option value="high" ${settings.get('graphics') === 'high' ? 'selected' : ''}>Alta</option>
                </select>
            </div>

            <div style="margin: 20px 0;">
                <label>
                    <input type="checkbox" ${settings.get('invertControls') ? 'checked' : ''} onchange="updateSetting('invertControls', this.checked)">
                    🔄 Inverti Controlli
                </label>
            </div>

            <button onclick="toggleSettings()" style="font-size: 20px; padding: 15px 30px; margin-top: 20px; background: linear-gradient(135deg, #FFD700, #FFA500); border: none; border-radius: 25px; color: #000; font-weight: bold; cursor: pointer; width: 100%;">
                ✓ Chiudi
            </button>
        </div>
    `;
    document.body.appendChild(panel);
}

function updateSetting(key, value) {
    settings.set(key, value);

    // Update displays
    if (key === 'musicVolume') {
        document.getElementById('musicVolumeValue').textContent = `${Math.round(value * 100)}%`;
        audio.setMusicVolume(value);
    } else if (key === 'sfxVolume') {
        document.getElementById('sfxVolumeValue').textContent = `${Math.round(value * 100)}%`;
        audio.setSFXVolume(value);
    } else if (key === 'difficulty') {
        alert('La difficoltà cambierà alla prossima partita');
    } else if (key === 'graphics') {
        alert('La grafica cambierà alla prossima partita');
    }
}

window.showLeaderboard = function() {
    const endScreen = document.getElementById('endScreen');
    if (endScreen) endScreen.remove();

    const leaderboardData = leaderboard.getTop10();
    let rows = '';

    if (leaderboardData.length === 0) {
        rows = '<p>Nessun punteggio ancora!</p>';
    } else {
        rows = '<table style="width: 100%; margin-top: 20px; border-collapse: collapse;">';
        rows += '<tr style="border-bottom: 2px solid #FFD700;"><th>#</th><th>Tempo</th><th>Difficoltà</th></tr>';
        leaderboardData.forEach((score, i) => {
            const minutes = Math.floor(score.time / 60);
            const seconds = Math.floor(score.time % 60);
            const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            const diffStr = {easy: '😊', normal: '🙂', hard: '😤'}[score.difficulty] || '';
            rows += `<tr style="border-bottom: 1px solid #444;"><td>${i + 1}</td><td>${timeStr}</td><td>${diffStr} ${score.difficulty}</td></tr>`;
        });
        rows += '</table>';
    }

    const panel = document.createElement('div');
    panel.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.95); z-index: 2000; display: flex; flex-direction: column; justify-content: center; align-items: center; color: white; padding: 20px; overflow-y: auto;">
            <h1 style="font-size: 36px; margin-bottom: 20px;">🏆 Classifica</h1>
            ${rows}
            <button onclick="this.parentElement.parentElement.remove()" style="font-size: 20px; padding: 15px 30px; margin-top: 30px; background: linear-gradient(135deg, #FFD700, #FFA500); border: none; border-radius: 25px; color: #000; font-weight: bold; cursor: pointer;">
                ← Indietro
            </button>
        </div>
    `;
    document.body.appendChild(panel);
};

function animate() {
    if (!gameStarted) return;
    requestAnimationFrame(animate);

    if (!captured) {
        gameTime += 1/60;
        updatePlayer();
        updateGlobe();
        updateCamera();
        updateHUD();
        checkCapture();
    }

    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
