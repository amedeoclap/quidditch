// ===== SKY SPHERES - COMPLETE GAME =====
// Full implementation with Destiny Hood, 4 roles, AI players, teams, and all mechanics

// ===== GAME ENUMS =====
const PlayerRole = {
    SEEKER: 'seeker',
    BEATER: 'beater',
    CHASER: 'chaser',
    KEEPER: 'keeper'
};

const Team = {
    STORM: 'storm',    // Cyan team
    FLAME: 'flame'     // Orange team
};

// ===== DESTINY HOOD SYSTEM =====
class DestinyHood {
    constructor() {
        this.dialogues = {
            greeting: [
                "Ah, un nuovo volatore! Vediamo dove ti colloco...",
                "Interessante... molto interessante...",
                "Hmm, sento grande potenziale in te!",
                "Benvenuto nelle Sky Spheres! Scopriamo il tuo destino..."
            ],
            seeker: [
                "Occhi acuti e riflessi fulminei! Sarai un magnifico SEEKER!",
                "La gloria del Radiant Globe ti attende! SEEKER sei!",
                "Velocità e precisione... perfetto per un SEEKER!"
            ],
            beater: [
                "Forza e coraggio! Sarai un temibile BEATER!",
                "Proteggerai i tuoi compagni! BEATER è il tuo ruolo!",
                "Potenza pura! BEATER senza dubbio!"
            ],
            chaser: [
                "Agilità e precisione! Un perfetto CHASER!",
                "Segnerai molti punti! CHASER è la tua vocazione!",
                "Mira infallibile! CHASER sei destinato ad essere!"
            ],
            keeper: [
                "Difesa impenetrabile! Sarai un grande KEEPER!",
                "Nessuno passerà mentre tu sei in campo! KEEPER!",
                "Guardiano degli anelli! KEEPER è il tuo destino!"
            ]
        };
    }

    getGreeting() {
        return this.dialogues.greeting[Math.floor(Math.random() * this.dialogues.greeting.length)];
    }

    getRoleAnnouncement(role) {
        return this.dialogues[role][Math.floor(Math.random() * this.dialogues[role].length)];
    }

    performCeremony(onComplete) {
        return {
            greeting: this.getGreeting(),
            announce: (role) => this.getRoleAnnouncement(role),
            complete: onComplete
        };
    }
}

// ===== AI PLAYER CLASS =====
class AIPlayer {
    constructor(id, role, team, scene) {
        this.id = id;
        this.role = role;
        this.team = team;
        this.mesh = null;
        this.velocity = new THREE.Vector3();
        this.target = null;
        this.state = 'idle'; // idle, chasing, defending, attacking

        this.createMesh(scene);
    }

    createMesh(scene) {
        const geometry = new THREE.CapsuleGeometry(0.4, 1.8, 6, 12);
        const color = this.team === Team.STORM ? 0x00CED1 : 0xFF6B35;
        const material = new THREE.MeshStandardMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 0.3,
            metalness: 0.4,
            roughness: 0.6
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(
            (Math.random() - 0.5) * 30,
            5 + Math.random() * 5,
            (Math.random() - 0.5) * 30
        );
        this.mesh.castShadow = true;

        // Add glow
        const light = new THREE.PointLight(color, 0.8, 8);
        this.mesh.add(light);

        // Add name tag
        this.createNameTag(scene);

        scene.add(this.mesh);
    }

    createNameTag(scene) {
        // Canvas for name
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, 256, 64);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${this.role.toUpperCase()}`, 128, 45);

        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(2, 0.5, 1);
        sprite.position.y = 2;
        this.mesh.add(sprite);
    }

    update(delta, gameState) {
        if (!this.mesh) return;

        switch (this.role) {
            case PlayerRole.SEEKER:
                this.updateSeeker(gameState);
                break;
            case PlayerRole.BEATER:
                this.updateBeater(gameState);
                break;
            case PlayerRole.CHASER:
                this.updateChaser(gameState);
                break;
            case PlayerRole.KEEPER:
                this.updateKeeper(gameState);
                break;
        }

        // Apply velocity
        this.mesh.position.add(this.velocity);
        this.velocity.multiplyScalar(0.85);

        // Bounds
        this.mesh.position.x = Math.max(-40, Math.min(40, this.mesh.position.x));
        this.mesh.position.y = Math.max(2, Math.min(25, this.mesh.position.y));
        this.mesh.position.z = Math.max(-40, Math.min(40, this.mesh.position.z));

        // Rotation
        if (this.velocity.length() > 0.01) {
            const targetRot = Math.atan2(this.velocity.x, this.velocity.z);
            this.mesh.rotation.y += (targetRot - this.mesh.rotation.y) * 0.1;
        }
    }

    updateSeeker(gameState) {
        if (!gameState.globe) return;

        // Chase the globe
        const direction = new THREE.Vector3()
            .subVectors(gameState.globe.position, this.mesh.position)
            .normalize();

        this.velocity.add(direction.multiplyScalar(0.15));
    }

    updateBeater(gameState) {
        // Look for strike spheres or defend teammates
        if (gameState.strikeSpheres && gameState.strikeSpheres.length > 0) {
            const nearest = this.findNearest(gameState.strikeSpheres);
            if (nearest && this.mesh.position.distanceTo(nearest.position) < 15) {
                const direction = new THREE.Vector3()
                    .subVectors(nearest.position, this.mesh.position)
                    .normalize();
                this.velocity.add(direction.multiplyScalar(0.2));
            }
        } else {
            // Patrol
            this.patrol();
        }
    }

    updateChaser(gameState) {
        // Chase score orbs or go to goal
        if (gameState.scoreOrbs && gameState.scoreOrbs.length > 0) {
            const orb = this.findNearest(gameState.scoreOrbs);
            if (orb) {
                const direction = new THREE.Vector3()
                    .subVectors(orb.position, this.mesh.position)
                    .normalize();
                this.velocity.add(direction.multiplyScalar(0.18));
            }
        } else {
            // Move towards opponent goal
            const goalZ = this.team === Team.STORM ? 35 : -35;
            const direction = new THREE.Vector3(0, 10, goalZ)
                .sub(this.mesh.position)
                .normalize();
            this.velocity.add(direction.multiplyScalar(0.1));
        }
    }

    updateKeeper(gameState) {
        // Defend goal area
        const goalZ = this.team === Team.STORM ? -35 : 35;
        const homePosition = new THREE.Vector3(0, 10, goalZ);

        const direction = homePosition.sub(this.mesh.position);
        if (direction.length() > 5) {
            direction.normalize();
            this.velocity.add(direction.multiplyScalar(0.15));
        }
    }

    findNearest(objects) {
        let nearest = null;
        let minDist = Infinity;

        objects.forEach(obj => {
            const dist = this.mesh.position.distanceTo(obj.position);
            if (dist < minDist) {
                minDist = dist;
                nearest = obj;
            }
        });

        return nearest;
    }

    patrol() {
        // Simple patrol behavior
        if (Math.random() < 0.02) {
            this.velocity.add(new THREE.Vector3(
                (Math.random() - 0.5) * 0.3,
                (Math.random() - 0.5) * 0.15,
                (Math.random() - 0.5) * 0.3
            ));
        }
    }
}

// ===== SCORE ORB CLASS =====
class ScoreOrb {
    constructor(scene) {
        const geometry = new THREE.SphereGeometry(0.4, 16, 16);
        const material = new THREE.MeshStandardMaterial({
            color: 0xFF1744,
            emissive: 0xFF1744,
            emissiveIntensity: 0.5,
            metalness: 0.8,
            roughness: 0.2
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(0, 10, 0);
        this.mesh.castShadow = true;

        const light = new THREE.PointLight(0xFF1744, 1, 10);
        this.mesh.add(light);

        scene.add(this.mesh);
        this.held = false;
        this.holder = null;
    }

    get position() {
        return this.mesh.position;
    }
}

// ===== STRIKE SPHERE CLASS =====
class StrikeSphere {
    constructor(scene) {
        const geometry = new THREE.SphereGeometry(0.3, 12, 12);
        const material = new THREE.MeshStandardMaterial({
            color: 0x212121,
            emissive: 0xFF0000,
            emissiveIntensity: 0.3,
            metalness: 1,
            roughness: 0.3
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(
            (Math.random() - 0.5) * 40,
            5 + Math.random() * 15,
            (Math.random() - 0.5) * 40
        );
        this.mesh.castShadow = true;

        this.velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 0.3,
            (Math.random() - 0.5) * 0.15,
            (Math.random() - 0.5) * 0.3
        );

        scene.add(this.mesh);
    }

    update() {
        this.mesh.position.add(this.velocity);
        this.mesh.rotation.x += 0.05;
        this.mesh.rotation.y += 0.05;

        // Bounce on bounds
        if (Math.abs(this.mesh.position.x) > 40) this.velocity.x *= -1;
        if (this.mesh.position.y < 2 || this.mesh.position.y > 25) this.velocity.y *= -1;
        if (Math.abs(this.mesh.position.z) > 40) this.velocity.z *= -1;
    }

    get position() {
        return this.mesh.position;
    }
}

// ===== GOAL RING CLASS =====
class GoalRing {
    constructor(scene, position, team) {
        this.team = team;
        const color = team === Team.STORM ? 0x00CED1 : 0xFF6B35;

        // Ring geometry
        const geometry = new THREE.TorusGeometry(3, 0.2, 16, 32);
        const material = new THREE.MeshStandardMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 0.5,
            metalness: 0.7,
            roughness: 0.3
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(position);
        this.mesh.rotation.x = Math.PI / 2;

        const light = new THREE.PointLight(color, 2, 15);
        this.mesh.add(light);

        scene.add(this.mesh);
    }

    checkScore(orb) {
        if (!orb || !orb.mesh) return false;
        const distance = this.mesh.position.distanceTo(orb.position);
        return distance < 3; // Ring radius
    }
}

// ===== MAIN GAME =====
let scene, camera, renderer;
let player, globe;
let playerVelocity, globeVelocity;
let playerRole = null;
let playerTeam = null;
let aiPlayers = [];
let scoreOrbs = [];
let strikeSpheres = [];
let goalRings = [];
let gameStarted = false;
let ceremonyComplete = false;
let gameTime = 0;
let teamScores = { storm: 0, flame: 0 };

// Controls
let joystickActive = false;
let joystickDirection = { x: 0, y: 0 };
let isBoosting = false;

// Destiny Hood
let destinyHood = new DestinyHood();

// Settings
const BOUNDS = { x: 40, y: 25, z: 40 };

// Export API
window.gameAPI = {
    startCeremony: startCeremony,
    selectRole: selectRole,
    skipCeremony: skipCeremony
};

function startCeremony() {
    const ceremonyScreen = document.getElementById('ceremonyScreen');
    if (ceremonyScreen) {
        ceremonyScreen.style.display = 'flex';

        // Animate greeting
        const greetingEl = document.getElementById('hoodGreeting');
        if (greetingEl) {
            greetingEl.textContent = destinyHood.getGreeting();
        }

        // Show role selection after 3 seconds
        setTimeout(() => {
            const roleSelection = document.getElementById('roleSelection');
            if (roleSelection) {
                roleSelection.style.display = 'block';
            }
        }, 3000);
    }
}

function selectRole(role) {
    playerRole = role;

    // Randomly assign team
    playerTeam = Math.random() < 0.5 ? Team.STORM : Team.FLAME;

    // Show announcement
    const announcement = destinyHood.getRoleAnnouncement(role);
    const greetingEl = document.getElementById('hoodGreeting');
    if (greetingEl) {
        greetingEl.textContent = announcement;
    }

    const roleSelection = document.getElementById('roleSelection');
    if (roleSelection) {
        roleSelection.style.display = 'none';
    }

    // Start game after announcement
    setTimeout(() => {
        ceremonyComplete = true;
        const ceremonyScreen = document.getElementById('ceremonyScreen');
        if (ceremonyScreen) {
            ceremonyScreen.style.display = 'none';
        }
        initGame();
    }, 3000);
}

function skipCeremony() {
    // Auto-select random role and team
    const roles = [PlayerRole.SEEKER, PlayerRole.BEATER, PlayerRole.CHASER, PlayerRole.KEEPER];
    playerRole = roles[Math.floor(Math.random() * roles.length)];
    playerTeam = Math.random() < 0.5 ? Team.STORM : Team.FLAME;

    ceremonyComplete = true;
    const ceremonyScreen = document.getElementById('ceremonyScreen');
    if (ceremonyScreen) {
        ceremonyScreen.style.display = 'none';
    }
    initGame();
}

function initGame() {
    if (typeof THREE === 'undefined') {
        alert('Three.js non caricato. Serve connessione internet.');
        return;
    }

    // Hide start screen, show game
    const startScreen = document.getElementById('startScreen');
    const gameCanvas = document.getElementById('gameCanvas');
    const hud = document.getElementById('hud');
    const mobileControls = document.getElementById('mobileControls');

    if (startScreen) startScreen.style.display = 'none';
    if (gameCanvas) gameCanvas.style.display = 'block';
    if (hud) hud.style.display = 'block';
    if (mobileControls) mobileControls.style.display = 'flex';

    // Initialize THREE vectors
    playerVelocity = new THREE.Vector3();
    globeVelocity = new THREE.Vector3();

    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    scene.fog = new THREE.Fog(0x87CEEB, 60, 150);

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 15, 25);

    // Renderer
    const canvas = document.getElementById('gameCanvas');
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 0.8);
    sunLight.position.set(50, 100, 30);
    sunLight.castShadow = true;
    scene.add(sunLight);

    // Ground
    const groundGeometry = new THREE.PlaneGeometry(200, 200);
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x4a7c59 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -5;
    ground.receiveShadow = true;
    scene.add(ground);

    // Create arena
    createArena();

    // Create player
    createPlayer();

    // Create globe (if player is seeker or for all to see)
    createGlobe();

    // Create AI players (7 others to make 8 total)
    createAIPlayers();

    // Create game objects based on mode
    createScoreOrbs(3);
    createStrikeSpheres(2);
    createGoalRings();

    // Setup controls
    setupControls();

    // Start game loop
    gameStarted = true;
    animate();

    // Update HUD with role and team
    updateRoleDisplay();
}

function createArena() {
    // Create floating platforms
    const platformGeometry = new THREE.CylinderGeometry(5, 5, 1, 32);
    const platformMaterial = new THREE.MeshStandardMaterial({
        color: 0x8B7355,
        metalness: 0.3,
        roughness: 0.7
    });

    // Center platform
    const centerPlatform = new THREE.Mesh(platformGeometry, platformMaterial);
    centerPlatform.position.set(0, 8, 0);
    centerPlatform.receiveShadow = true;
    centerPlatform.castShadow = true;
    scene.add(centerPlatform);

    // Side platforms
    const positions = [
        [20, 10, 20], [-20, 10, 20], [20, 10, -20], [-20, 10, -20],
        [0, 12, 30], [0, 12, -30], [30, 12, 0], [-30, 12, 0]
    ];

    positions.forEach(pos => {
        const platform = new THREE.Mesh(platformGeometry, platformMaterial);
        platform.position.set(...pos);
        platform.castShadow = true;
        platform.receiveShadow = true;
        scene.add(platform);
    });

    // Add boundary markers (glowing pillars)
    const pillarGeometry = new THREE.CylinderGeometry(0.5, 0.5, 30, 8);
    const pillarPositions = [
        [40, 15, 40], [-40, 15, 40], [40, 15, -40], [-40, 15, -40],
        [40, 15, 0], [-40, 15, 0], [0, 15, 40], [0, 15, -40]
    ];

    pillarPositions.forEach(pos => {
        const material = new THREE.MeshStandardMaterial({
            color: 0xFFD700,
            emissive: 0xFFD700,
            emissiveIntensity: 0.5
        });
        const pillar = new THREE.Mesh(pillarGeometry, material);
        pillar.position.set(...pos);
        scene.add(pillar);
    });
}

function createPlayer() {
    const geometry = new THREE.CapsuleGeometry(0.5, 2, 8, 16);
    const color = playerTeam === Team.STORM ? 0x00CED1 : 0xFF6B35;
    const material = new THREE.MeshStandardMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 0.5,
        metalness: 0.5,
        roughness: 0.5
    });

    player = new THREE.Mesh(geometry, material);
    player.position.set(0, 10, playerTeam === Team.STORM ? -20 : 20);
    player.castShadow = true;
    scene.add(player);

    const light = new THREE.PointLight(color, 1.5, 12);
    player.add(light);
}

function createGlobe() {
    const geometry = new THREE.SphereGeometry(0.6, 32, 32);
    const material = new THREE.MeshStandardMaterial({
        color: 0xFFD700,
        emissive: 0xFFD700,
        emissiveIntensity: 0.8,
        metalness: 1,
        roughness: 0.1
    });

    globe = new THREE.Mesh(geometry, material);
    globe.position.set(15, 15, 15);
    globe.castShadow = true;
    scene.add(globe);

    const light = new THREE.PointLight(0xFFD700, 3, 25);
    globe.add(light);

    globeVelocity.set(
        (Math.random() - 0.5) * 0.15,
        (Math.random() - 0.5) * 0.08,
        (Math.random() - 0.5) * 0.15
    );
}

function createAIPlayers() {
    // Create 7 AI players (3 teammates + 4 opponents)
    const roles = [PlayerRole.BEATER, PlayerRole.CHASER, PlayerRole.KEEPER];
    const opponentRoles = [PlayerRole.SEEKER, PlayerRole.BEATER, PlayerRole.CHASER, PlayerRole.KEEPER];

    // 3 teammates with remaining roles
    roles.forEach(role => {
        const ai = new AIPlayer(`ai_team_${role}`, role, playerTeam, scene);
        aiPlayers.push(ai);
    });

    // 4 opponents (full team)
    const opponentTeam = playerTeam === Team.STORM ? Team.FLAME : Team.STORM;
    opponentRoles.forEach(role => {
        const ai = new AIPlayer(`ai_opp_${role}`, role, opponentTeam, scene);
        aiPlayers.push(ai);
    });
}

function createScoreOrbs(count) {
    for (let i = 0; i < count; i++) {
        const orb = new ScoreOrb(scene);
        scoreOrbs.push(orb);
    }
}

function createStrikeSpheres(count) {
    for (let i = 0; i < count; i++) {
        const sphere = new StrikeSphere(scene);
        strikeSpheres.push(sphere);
    }
}

function createGoalRings() {
    // Storm goals (bottom)
    const stormPositions = [
        new THREE.Vector3(-8, 10, -38),
        new THREE.Vector3(0, 13, -38),
        new THREE.Vector3(8, 10, -38)
    ];

    // Flame goals (top)
    const flamePositions = [
        new THREE.Vector3(-8, 10, 38),
        new THREE.Vector3(0, 13, 38),
        new THREE.Vector3(8, 10, 38)
    ];

    stormPositions.forEach(pos => {
        goalRings.push(new GoalRing(scene, pos, Team.STORM));
    });

    flamePositions.forEach(pos => {
        goalRings.push(new GoalRing(scene, pos, Team.FLAME));
    });
}

function setupControls() {
    const joystick = document.getElementById('joystick');
    const boostButton = document.getElementById('boostButton');

    if (!joystick || !boostButton) return;

    const handle = joystick.querySelector('.joystick-handle');
    if (!handle) return;

    joystick.addEventListener('touchstart', (e) => {
        e.preventDefault();
        joystickActive = true;
        const rect = joystick.getBoundingClientRect();
        joystick.dataset.startX = rect.left + rect.width / 2;
        joystick.dataset.startY = rect.top + rect.height / 2;
    });

    joystick.addEventListener('touchmove', (e) => {
        if (!joystickActive) return;
        e.preventDefault();
        const touch = e.touches[0];
        const startX = parseFloat(joystick.dataset.startX);
        const startY = parseFloat(joystick.dataset.startY);
        const deltaX = touch.clientX - startX;
        const deltaY = touch.clientY - startY;
        const distance = Math.min(Math.sqrt(deltaX * deltaX + deltaY * deltaY), 35);
        const angle = Math.atan2(deltaY, deltaX);

        handle.style.transform = `translate(calc(-50% + ${Math.cos(angle) * distance}px), calc(-50% + ${Math.sin(angle) * distance}px))`;

        joystickDirection.x = Math.cos(angle) * (distance / 35);
        joystickDirection.y = Math.sin(angle) * (distance / 35);
    });

    joystick.addEventListener('touchend', () => {
        joystickActive = false;
        handle.style.transform = 'translate(-50%, -50%)';
        joystickDirection.x = 0;
        joystickDirection.y = 0;
    });

    boostButton.addEventListener('touchstart', (e) => {
        e.preventDefault();
        isBoosting = true;
    });

    boostButton.addEventListener('touchend', () => {
        isBoosting = false;
    });
}

function updatePlayer() {
    if (!player) return;

    const speed = isBoosting ? 0.4 : 0.2;

    if (joystickActive) {
        playerVelocity.x += joystickDirection.x * speed;
        playerVelocity.z += joystickDirection.y * speed;
    }

    player.position.add(playerVelocity);
    playerVelocity.multiplyScalar(0.85);

    player.position.x = Math.max(-BOUNDS.x, Math.min(BOUNDS.x, player.position.x));
    player.position.y = Math.max(2, Math.min(BOUNDS.y, player.position.y));
    player.position.z = Math.max(-BOUNDS.z, Math.min(BOUNDS.z, player.position.z));

    if (playerVelocity.length() > 0.01) {
        const targetRot = Math.atan2(playerVelocity.x, playerVelocity.z);
        player.rotation.y += (targetRot - player.rotation.y) * 0.1;
    }
}

function updateGlobe() {
    if (!globe) return;

    const time = Date.now() * 0.001;

    globeVelocity.x += Math.sin(time * 0.7) * 0.01;
    globeVelocity.y += Math.cos(time * 0.5) * 0.005;
    globeVelocity.z += Math.sin(time * 0.9) * 0.01;

    // Evade all players
    const allPlayers = [player, ...aiPlayers.map(ai => ai.mesh)].filter(p => p);
    allPlayers.forEach(p => {
        const dist = globe.position.distanceTo(p.position);
        if (dist < 18) {
            const evasion = new THREE.Vector3()
                .subVectors(globe.position, p.position)
                .normalize();
            globeVelocity.add(evasion.multiplyScalar(0.02));
        }
    });

    globe.position.add(globeVelocity);

    if (globeVelocity.length() > 0.3) {
        globeVelocity.normalize().multiplyScalar(0.3);
    }

    // Bounds
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
    const pulse = 1 + Math.sin(time * 3) * 0.1;
    globe.scale.set(pulse, pulse, pulse);
}

function updateAI() {
    const gameState = {
        globe: globe,
        scoreOrbs: scoreOrbs,
        strikeSpheres: strikeSpheres,
        player: player
    };

    aiPlayers.forEach(ai => ai.update(1/60, gameState));
}

function updateStrikeSpheres() {
    strikeSpheres.forEach(sphere => sphere.update());
}

function updateCamera() {
    if (!player) return;

    const targetPos = new THREE.Vector3(
        player.position.x,
        player.position.y + 12,
        player.position.z + 20
    );

    camera.position.lerp(targetPos, 0.05);
    camera.lookAt(player.position.x, player.position.y + 2, player.position.z);
}

function updateHUD() {
    if (!player || !globe) return;

    const dist = player.position.distanceTo(globe.position);
    const distEl = document.getElementById('distance');
    if (distEl) {
        distEl.textContent = `🎯 ${dist.toFixed(1)}m`;
    }

    const minutes = Math.floor(gameTime / 60);
    const seconds = Math.floor(gameTime % 60);
    const timerEl = document.getElementById('timer');
    if (timerEl) {
        timerEl.textContent = `⏱️ ${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    // Update scores
    const scoreEl = document.getElementById('teamScores');
    if (scoreEl) {
        scoreEl.textContent = `⚡ Storm: ${teamScores.storm} | 🔥 Flame: ${teamScores.flame}`;
    }
}

function updateRoleDisplay() {
    const roleEl = document.getElementById('playerRole');
    if (roleEl && playerRole) {
        const teamIcon = playerTeam === Team.STORM ? '⚡' : '🔥';
        const teamName = playerTeam === Team.STORM ? 'STORM' : 'FLAME';
        roleEl.textContent = `${teamIcon} ${teamName} ${playerRole.toUpperCase()}`;
    }
}

function checkGlobeCapture() {
    if (!player || !globe) return;

    const dist = player.position.distanceTo(globe.position);
    if (dist < 3 && playerRole === PlayerRole.SEEKER) {
        // Seeker captured globe!
        const points = 150;
        teamScores[playerTeam] += points;

        showNotification(`🎉 RADIANT GLOBE CATTURATO! +${points} punti!`);

        // Reset globe
        setTimeout(() => {
            globe.position.set(
                (Math.random() - 0.5) * 30,
                10 + Math.random() * 10,
                (Math.random() - 0.5) * 30
            );
        }, 3000);
    }
}

function showNotification(message) {
    const notif = document.getElementById('notification');
    if (notif) {
        notif.textContent = message;
        notif.classList.add('show');
        setTimeout(() => notif.classList.remove('show'), 2000);
    }
}

function animate() {
    if (!gameStarted) return;
    requestAnimationFrame(animate);

    gameTime += 1/60;

    updatePlayer();
    updateGlobe();
    updateAI();
    updateStrikeSpheres();
    updateCamera();
    updateHUD();
    checkGlobeCapture();

    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}

window.addEventListener('resize', () => {
    if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
});
