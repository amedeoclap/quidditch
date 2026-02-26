// ===== SKY SPHERES - v3.1 IMPROVED =====
// Mobile controls + Active AI + Stylized players

// ===== ENUMS =====
const PlayerRole = {
    SEEKER: 'seeker',
    BEATER: 'beater',
    CHASER: 'chaser',
    KEEPER: 'keeper'
};

const Team = {
    STORM: 'storm',
    FLAME: 'flame'
};

// ===== STYLIZED PLAYER MODEL =====
class StylizedPlayer {
    constructor(team) {
        this.group = new THREE.Group();
        const color = team === Team.STORM ? 0x00CED1 : 0xFF6B35;

        // Head
        const headGeo = new THREE.SphereGeometry(0.3, 12, 12);
        const mat = new THREE.MeshStandardMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 0.3
        });

        this.head = new THREE.Mesh(headGeo, mat);
        this.head.position.y = 1.5;
        this.head.castShadow = true;
        this.group.add(this.head);

        // Body
        const bodyGeo = new THREE.CylinderGeometry(0.25, 0.3, 1, 8);
        this.body = new THREE.Mesh(bodyGeo, mat.clone());
        this.body.position.y = 0.7;
        this.body.castShadow = true;
        this.group.add(this.body);

        // Arms
        const armGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.8, 6);
        this.leftArm = new THREE.Mesh(armGeo, mat.clone());
        this.leftArm.position.set(-0.4, 0.9, 0);
        this.leftArm.rotation.z = Math.PI / 6;
        this.leftArm.castShadow = true;
        this.group.add(this.leftArm);

        this.rightArm = new THREE.Mesh(armGeo, mat.clone());
        this.rightArm.position.set(0.4, 0.9, 0);
        this.rightArm.rotation.z = -Math.PI / 6;
        this.rightArm.castShadow = true;
        this.group.add(this.rightArm);

        // Legs
        const legGeo = new THREE.CylinderGeometry(0.1, 0.08, 0.7, 6);
        this.leftLeg = new THREE.Mesh(legGeo, mat.clone());
        this.leftLeg.position.set(-0.15, -0.15, 0);
        this.leftLeg.castShadow = true;
        this.group.add(this.leftLeg);

        this.rightLeg = new THREE.Mesh(legGeo, mat.clone());
        this.rightLeg.position.set(0.15, -0.15, 0);
        this.rightLeg.castShadow = true;
        this.group.add(this.rightLeg);

        // Glow
        const light = new THREE.PointLight(color, 1, 10);
        light.position.y = 1;
        this.group.add(light);

        this.animTime = 0;
    }

    animate(moving, delta) {
        if (!moving) {
            // Idle animation
            this.animTime += delta * 2;
            this.leftArm.rotation.z = Math.PI / 6 + Math.sin(this.animTime) * 0.1;
            this.rightArm.rotation.z = -Math.PI / 6 - Math.sin(this.animTime) * 0.1;
            return;
        }

        // Moving animation
        this.animTime += delta * 8;

        // Arms swing
        this.leftArm.rotation.z = Math.PI / 6 + Math.sin(this.animTime) * 0.3;
        this.rightArm.rotation.z = -Math.PI / 6 - Math.sin(this.animTime) * 0.3;

        // Legs swing
        this.leftLeg.rotation.x = Math.sin(this.animTime) * 0.4;
        this.rightLeg.rotation.x = -Math.sin(this.animTime) * 0.4;

        // Body bounce
        this.body.position.y = 0.7 + Math.abs(Math.sin(this.animTime * 2)) * 0.05;
        this.head.position.y = 1.5 + Math.abs(Math.sin(this.animTime * 2)) * 0.05;
    }
}

// ===== DESTINY HOOD =====
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
}

// ===== AI PLAYER =====
class AIPlayer {
    constructor(id, role, team, scene) {
        this.id = id;
        this.role = role;
        this.team = team;
        this.model = new StylizedPlayer(team);
        this.mesh = this.model.group;
        this.velocity = new THREE.Vector3();
        this.target = null;
        this.state = 'idle';
        this.heldOrb = null;
        this.actionCooldown = 0;

        this.mesh.position.set(
            (Math.random() - 0.5) * 30,
            5 + Math.random() * 5,
            (Math.random() - 0.5) * 30
        );

        this.createNameTag(scene);
        scene.add(this.mesh);
    }

    createNameTag(scene) {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        ctx.fillRect(0, 0, 256, 64);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 28px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${this.role.toUpperCase()}`, 128, 42);

        const texture = new THREE.CanvasTexture(canvas);
        const spriteMat = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(spriteMat);
        sprite.scale.set(2, 0.5, 1);
        sprite.position.y = 2.5;
        this.mesh.add(sprite);
    }

    update(delta, gameState) {
        if (!this.mesh) return;

        this.actionCooldown = Math.max(0, this.actionCooldown - delta);

        switch (this.role) {
            case PlayerRole.SEEKER:
                this.updateSeeker(gameState, delta);
                break;
            case PlayerRole.BEATER:
                this.updateBeater(gameState, delta);
                break;
            case PlayerRole.CHASER:
                this.updateChaser(gameState, delta);
                break;
            case PlayerRole.KEEPER:
                this.updateKeeper(gameState, delta);
                break;
        }

        // Apply physics
        this.mesh.position.add(this.velocity);
        this.velocity.multiplyScalar(0.87);

        // Bounds
        const BOUNDS = { x: 40, y: 25, z: 40 };
        this.mesh.position.x = Math.max(-BOUNDS.x, Math.min(BOUNDS.x, this.mesh.position.x));
        this.mesh.position.y = Math.max(2, Math.min(BOUNDS.y, this.mesh.position.y));
        this.mesh.position.z = Math.max(-BOUNDS.z, Math.min(BOUNDS.z, this.mesh.position.z));

        // Rotation
        const moving = this.velocity.length() > 0.02;
        if (moving) {
            const targetRot = Math.atan2(this.velocity.x, this.velocity.z);
            this.mesh.rotation.y += (targetRot - this.mesh.rotation.y) * 0.15;
        }

        // Animate
        this.model.animate(moving, delta);
    }

    updateSeeker(gameState, delta) {
        if (!gameState.globe || !gameState.globe.mesh) return;

        const globePos = gameState.globe.mesh.position;
        const dist = this.mesh.position.distanceTo(globePos);

        // Try to capture
        if (dist < 3 && this.actionCooldown === 0) {
            this.captureGlobe(gameState);
            return;
        }

        // Chase with boost when close
        const speed = dist < 15 ? 0.25 : 0.15;
        const dir = new THREE.Vector3()
            .subVectors(globePos, this.mesh.position)
            .normalize();
        this.velocity.add(dir.multiplyScalar(speed));
    }

    updateBeater(gameState, delta) {
        if (!gameState.strikeSpheres || gameState.strikeSpheres.length === 0) {
            this.patrol();
            return;
        }

        // Find nearest strike sphere
        const nearest = this.findNearest(gameState.strikeSpheres.map(s => s.mesh));
        if (nearest) {
            const dist = this.mesh.position.distanceTo(nearest.position);

            if (dist < 2 && this.actionCooldown === 0) {
                // Hit it!
                this.hitStrikeSphere(nearest, gameState);
            } else if (dist < 20) {
                // Chase it
                const dir = new THREE.Vector3()
                    .subVectors(nearest.position, this.mesh.position)
                    .normalize();
                this.velocity.add(dir.multiplyScalar(0.2));
            }
        }
    }

    updateChaser(gameState, delta) {
        // If holding orb, go to goal
        if (this.heldOrb) {
            this.goToGoal(gameState);
            this.checkScoring(gameState);
            return;
        }

        // Try to pick up orb
        if (gameState.scoreOrbs && gameState.scoreOrbs.length > 0) {
            const availableOrbs = gameState.scoreOrbs.filter(o => !o.held);
            if (availableOrbs.length > 0) {
                const nearest = this.findNearest(availableOrbs.map(o => o.mesh));
                if (nearest) {
                    const dist = this.mesh.position.distanceTo(nearest.position);

                    if (dist < 2) {
                        // Pick it up
                        const orb = gameState.scoreOrbs.find(o => o.mesh === nearest);
                        if (orb && !orb.held) {
                            orb.held = true;
                            orb.holder = this;
                            this.heldOrb = orb;
                        }
                    } else {
                        // Chase it
                        const dir = new THREE.Vector3()
                            .subVectors(nearest.position, this.mesh.position)
                            .normalize();
                        this.velocity.add(dir.multiplyScalar(0.18));
                    }
                }
            }
        }
    }

    updateKeeper(gameState, delta) {
        // Stay near home goal
        const goalZ = this.team === Team.STORM ? -35 : 35;
        const home = new THREE.Vector3(0, 10, goalZ);
        const dist = this.mesh.position.distanceTo(home);

        if (dist > 5) {
            const dir = new THREE.Vector3()
                .subVectors(home, this.mesh.position)
                .normalize();
            this.velocity.add(dir.multiplyScalar(0.18));
        }

        // Intercept incoming chasers
        if (gameState.allPlayers) {
            const opponents = gameState.allPlayers.filter(p =>
                p.team !== this.team &&
                p.role === PlayerRole.CHASER &&
                p.heldOrb
            );

            if (opponents.length > 0) {
                const nearest = this.findNearest(opponents.map(o => o.mesh));
                if (nearest) {
                    const oppDist = this.mesh.position.distanceTo(nearest.position);
                    if (oppDist < 8) {
                        // Intercept
                        const dir = new THREE.Vector3()
                            .subVectors(nearest.position, this.mesh.position)
                            .normalize();
                        this.velocity.add(dir.multiplyScalar(0.25));
                    }
                }
            }
        }
    }

    captureGlobe(gameState) {
        this.actionCooldown = 3;
        const points = 150;
        gameState.teamScores[this.team] += points;

        showNotification(`🎉 ${this.team.toUpperCase()} SEEKER cattura il Globe! +${points}pts`);

        // Reset globe
        if (gameState.globe && gameState.globe.mesh) {
            setTimeout(() => {
                gameState.globe.mesh.position.set(
                    (Math.random() - 0.5) * 30,
                    10 + Math.random() * 10,
                    (Math.random() - 0.5) * 30
                );
            }, 3000);
        }
    }

    hitStrikeSphere(sphereMesh, gameState) {
        this.actionCooldown = 1;

        // Launch sphere away
        const dir = new THREE.Vector3()
            .subVectors(sphereMesh.position, this.mesh.position)
            .normalize();

        const sphere = gameState.strikeSpheres.find(s => s.mesh === sphereMesh);
        if (sphere) {
            sphere.velocity.copy(dir.multiplyScalar(0.5));
        }
    }

    goToGoal(gameState) {
        // Go to opponent goal
        const goalZ = this.team === Team.STORM ? 35 : -35;
        const goalPos = new THREE.Vector3(0, 12, goalZ);

        const dir = new THREE.Vector3()
            .subVectors(goalPos, this.mesh.position)
            .normalize();
        this.velocity.add(dir.multiplyScalar(0.22));

        // Orb follows
        if (this.heldOrb && this.heldOrb.mesh) {
            this.heldOrb.mesh.position.copy(this.mesh.position);
            this.heldOrb.mesh.position.y += 1;
        }
    }

    checkScoring(gameState) {
        if (!this.heldOrb || !gameState.goalRings) return;

        const opponentTeam = this.team === Team.STORM ? Team.FLAME : Team.STORM;
        const opponentRings = gameState.goalRings.filter(r => r.team === opponentTeam);

        for (let ring of opponentRings) {
            if (ring.checkScore(this.heldOrb)) {
                // GOAL!
                gameState.teamScores[this.team] += 10;
                showNotification(`🎯 ${this.team.toUpperCase()} GOAL! +10pts`);

                // Reset orb
                this.heldOrb.held = false;
                this.heldOrb.holder = null;
                this.heldOrb.mesh.position.set(0, 10, 0);
                this.heldOrb = null;
                this.actionCooldown = 2;
                break;
            }
        }
    }

    findNearest(objects) {
        if (!objects || objects.length === 0) return null;

        let nearest = null;
        let minDist = Infinity;

        objects.forEach(obj => {
            if (!obj) return;
            const dist = this.mesh.position.distanceTo(obj.position);
            if (dist < minDist) {
                minDist = dist;
                nearest = obj;
            }
        });

        return nearest;
    }

    patrol() {
        if (Math.random() < 0.03) {
            this.velocity.add(new THREE.Vector3(
                (Math.random() - 0.5) * 0.25,
                (Math.random() - 0.5) * 0.12,
                (Math.random() - 0.5) * 0.25
            ));
        }
    }
}

// ===== GAME OBJECTS =====
class ScoreOrb {
    constructor(scene) {
        const geometry = new THREE.SphereGeometry(0.4, 16, 16);
        const material = new THREE.MeshStandardMaterial({
            color: 0xFF1744,
            emissive: 0xFF1744,
            emissiveIntensity: 0.6,
            metalness: 0.8,
            roughness: 0.2
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(
            (Math.random() - 0.5) * 20,
            8 + Math.random() * 4,
            (Math.random() - 0.5) * 20
        );
        this.mesh.castShadow = true;

        const light = new THREE.PointLight(0xFF1744, 1.5, 12);
        this.mesh.add(light);

        scene.add(this.mesh);
        this.held = false;
        this.holder = null;
    }

    update(delta) {
        if (!this.held) {
            this.mesh.rotation.y += delta * 2;
            const pulse = 1 + Math.sin(Date.now() * 0.003) * 0.1;
            this.mesh.scale.set(pulse, pulse, pulse);
        }
    }
}

class StrikeSphere {
    constructor(scene) {
        const geometry = new THREE.SphereGeometry(0.35, 12, 12);
        const material = new THREE.MeshStandardMaterial({
            color: 0x212121,
            emissive: 0xFF0000,
            emissiveIntensity: 0.4,
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

    update(delta) {
        this.mesh.position.add(this.velocity);
        this.mesh.rotation.x += delta * 3;
        this.mesh.rotation.y += delta * 3;

        // Bounce
        const BOUNDS = { x: 40, y: 25, z: 40 };
        if (Math.abs(this.mesh.position.x) > BOUNDS.x) this.velocity.x *= -0.9;
        if (this.mesh.position.y < 2 || this.mesh.position.y > BOUNDS.y) this.velocity.y *= -0.9;
        if (Math.abs(this.mesh.position.z) > BOUNDS.z) this.velocity.z *= -0.9;

        this.velocity.multiplyScalar(0.99);
    }
}

class GoalRing {
    constructor(scene, position, team) {
        this.team = team;
        const color = team === Team.STORM ? 0x00CED1 : 0xFF6B35;

        const geometry = new THREE.TorusGeometry(3, 0.25, 16, 32);
        const material = new THREE.MeshStandardMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 0.6,
            metalness: 0.8,
            roughness: 0.2
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(position);
        this.mesh.rotation.x = Math.PI / 2;

        const light = new THREE.PointLight(color, 2, 18);
        this.mesh.add(light);

        scene.add(this.mesh);
    }

    checkScore(orb) {
        if (!orb || !orb.mesh) return false;
        const distance = this.mesh.position.distanceTo(orb.mesh.position);
        return distance < 3.2;
    }

    update(delta) {
        this.mesh.rotation.z += delta * 0.5;
    }
}

// ===== MAIN GAME =====
let scene, camera, renderer;
let player, playerModel, globe;
let playerVelocity, globeVelocity;
let playerRole = null;
let playerTeam = null;
let playerHeldOrb = null;
let aiPlayers = [];
let scoreOrbs = [];
let strikeSpheres = [];
let goalRings = [];
let gameStarted = false;
let gameTime = 0;
let teamScores = { storm: 0, flame: 0 };

// Controls
let joystickActive = false;
let joystickDirection = { x: 0, y: 0 };
let isBoosting = false;
let verticalInput = 0; // -1 down, 0 none, +1 up

// Destiny Hood
let destinyHood = new DestinyHood();

const BOUNDS = { x: 40, y: 25, z: 40 };

// ===== API =====
window.gameAPI = {
    startCeremony: startCeremony,
    selectRole: selectRole,
    skipCeremony: skipCeremony
};

function startCeremony() {
    const ceremonyScreen = document.getElementById('ceremonyScreen');
    if (ceremonyScreen) {
        ceremonyScreen.style.display = 'flex';

        const greetingEl = document.getElementById('hoodGreeting');
        if (greetingEl) {
            greetingEl.textContent = destinyHood.getGreeting();
        }

        setTimeout(() => {
            const roleSelection = document.getElementById('roleSelection');
            if (roleSelection) roleSelection.style.display = 'block';
        }, 3000);
    }
}

function selectRole(role) {
    playerRole = role;
    playerTeam = Math.random() < 0.5 ? Team.STORM : Team.FLAME;

    const announcement = destinyHood.getRoleAnnouncement(role);
    const greetingEl = document.getElementById('hoodGreeting');
    if (greetingEl) greetingEl.textContent = announcement;

    const roleSelection = document.getElementById('roleSelection');
    if (roleSelection) roleSelection.style.display = 'none';

    setTimeout(() => {
        const ceremonyScreen = document.getElementById('ceremonyScreen');
        if (ceremonyScreen) ceremonyScreen.style.display = 'none';
        initGame();
    }, 3000);
}

function skipCeremony() {
    const roles = [PlayerRole.SEEKER, PlayerRole.BEATER, PlayerRole.CHASER, PlayerRole.KEEPER];
    playerRole = roles[Math.floor(Math.random() * roles.length)];
    playerTeam = Math.random() < 0.5 ? Team.STORM : Team.FLAME;

    const ceremonyScreen = document.getElementById('ceremonyScreen');
    if (ceremonyScreen) ceremonyScreen.style.display = 'none';
    initGame();
}

function initGame() {
    if (typeof THREE === 'undefined') {
        alert('Three.js non caricato. Serve connessione internet.');
        return;
    }

    // Hide/show screens
    const startScreen = document.getElementById('startScreen');
    const gameCanvas = document.getElementById('gameCanvas');
    const hud = document.getElementById('hud');
    const mobileControls = document.getElementById('mobileControls');

    if (startScreen) startScreen.style.display = 'none';
    if (gameCanvas) gameCanvas.style.display = 'block';
    if (hud) hud.style.display = 'block';
    if (mobileControls) mobileControls.style.display = 'flex';

    // Init vectors
    playerVelocity = new THREE.Vector3();
    globeVelocity = new THREE.Vector3();

    // Scene
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
    const groundGeo = new THREE.PlaneGeometry(200, 200);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x4a7c59 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -5;
    ground.receiveShadow = true;
    scene.add(ground);

    createArena();
    createPlayer();
    createGlobe();
    createAIPlayers();
    createScoreOrbs(3);
    createStrikeSpheres(2);
    createGoalRings();
    setupControls();

    gameStarted = true;
    updateRoleDisplay();
    animate();
}

function createArena() {
    // Platforms
    const platformGeo = new THREE.CylinderGeometry(5, 5, 1, 32);
    const platformMat = new THREE.MeshStandardMaterial({ color: 0x8B7355 });

    const centerPlatform = new THREE.Mesh(platformGeo, platformMat);
    centerPlatform.position.set(0, 8, 0);
    centerPlatform.castShadow = true;
    centerPlatform.receiveShadow = true;
    scene.add(centerPlatform);

    const positions = [
        [20, 10, 20], [-20, 10, 20], [20, 10, -20], [-20, 10, -20],
        [0, 12, 30], [0, 12, -30], [30, 12, 0], [-30, 12, 0]
    ];

    positions.forEach(pos => {
        const platform = new THREE.Mesh(platformGeo, platformMat.clone());
        platform.position.set(...pos);
        platform.castShadow = true;
        platform.receiveShadow = true;
        scene.add(platform);
    });

    // Pillars
    const pillarGeo = new THREE.CylinderGeometry(0.5, 0.5, 30, 8);
    const pillarPositions = [
        [40, 15, 40], [-40, 15, 40], [40, 15, -40], [-40, 15, -40],
        [40, 15, 0], [-40, 15, 0], [0, 15, 40], [0, 15, -40]
    ];

    pillarPositions.forEach(pos => {
        const mat = new THREE.MeshStandardMaterial({
            color: 0xFFD700,
            emissive: 0xFFD700,
            emissiveIntensity: 0.5
        });
        const pillar = new THREE.Mesh(pillarGeo, mat);
        pillar.position.set(...pos);
        scene.add(pillar);
    });
}

function createPlayer() {
    playerModel = new StylizedPlayer(playerTeam);
    player = playerModel.group;
    player.position.set(0, 10, playerTeam === Team.STORM ? -20 : 20);
    scene.add(player);
}

function createGlobe() {
    const geometry = new THREE.SphereGeometry(0.6, 32, 32);
    const material = new THREE.MeshStandardMaterial({
        color: 0xFFD700,
        emissive: 0xFFD700,
        emissiveIntensity: 0.9,
        metalness: 1,
        roughness: 0.1
    });

    globe = { mesh: new THREE.Mesh(geometry, material) };
    globe.mesh.position.set(15, 15, 15);
    globe.mesh.castShadow = true;
    scene.add(globe.mesh);

    const light = new THREE.PointLight(0xFFD700, 3, 25);
    globe.mesh.add(light);

    globeVelocity.set(
        (Math.random() - 0.5) * 0.15,
        (Math.random() - 0.5) * 0.08,
        (Math.random() - 0.5) * 0.15
    );
}

function createAIPlayers() {
    const roles = [PlayerRole.BEATER, PlayerRole.CHASER, PlayerRole.KEEPER];
    const opponentRoles = [PlayerRole.SEEKER, PlayerRole.BEATER, PlayerRole.CHASER, PlayerRole.KEEPER];

    roles.forEach(role => {
        const ai = new AIPlayer(`ai_team_${role}`, role, playerTeam, scene);
        aiPlayers.push(ai);
    });

    const opponentTeam = playerTeam === Team.STORM ? Team.FLAME : Team.STORM;
    opponentRoles.forEach(role => {
        const ai = new AIPlayer(`ai_opp_${role}`, role, opponentTeam, scene);
        aiPlayers.push(ai);
    });
}

function createScoreOrbs(count) {
    for (let i = 0; i < count; i++) {
        scoreOrbs.push(new ScoreOrb(scene));
    }
}

function createStrikeSpheres(count) {
    for (let i = 0; i < count; i++) {
        strikeSpheres.push(new StrikeSphere(scene));
    }
}

function createGoalRings() {
    const stormPositions = [
        new THREE.Vector3(-8, 10, -38),
        new THREE.Vector3(0, 13, -38),
        new THREE.Vector3(8, 10, -38)
    ];

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
    const upButton = document.getElementById('upButton');
    const downButton = document.getElementById('downButton');

    if (!joystick || !boostButton) return;

    const handle = joystick.querySelector('.joystick-handle');
    if (!handle) return;

    // Joystick
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
        const distance = Math.min(Math.sqrt(deltaX * deltaX + deltaY * deltaY), 40);
        const angle = Math.atan2(deltaY, deltaX);

        handle.style.transform = `translate(calc(-50% + ${Math.cos(angle) * distance}px), calc(-50% + ${Math.sin(angle) * distance}px))`;

        joystickDirection.x = Math.cos(angle) * (distance / 40);
        joystickDirection.y = Math.sin(angle) * (distance / 40);
    });

    joystick.addEventListener('touchend', () => {
        joystickActive = false;
        handle.style.transform = 'translate(-50%, -50%)';
        joystickDirection.x = 0;
        joystickDirection.y = 0;
    });

    // Boost
    boostButton.addEventListener('touchstart', (e) => {
        e.preventDefault();
        isBoosting = true;
        boostButton.style.transform = 'scale(0.9)';
    });

    boostButton.addEventListener('touchend', () => {
        isBoosting = false;
        boostButton.style.transform = 'scale(1)';
    });

    // Up button
    if (upButton) {
        upButton.addEventListener('touchstart', (e) => {
            e.preventDefault();
            verticalInput = 1;
            upButton.style.transform = 'scale(0.9)';
        });

        upButton.addEventListener('touchend', () => {
            verticalInput = 0;
            upButton.style.transform = 'scale(1)';
        });
    }

    // Down button
    if (downButton) {
        downButton.addEventListener('touchstart', (e) => {
            e.preventDefault();
            verticalInput = -1;
            downButton.style.transform = 'scale(0.9)';
        });

        downButton.addEventListener('touchend', () => {
            verticalInput = 0;
            downButton.style.transform = 'scale(1)';
        });
    }
}

function updatePlayer(delta) {
    if (!player) return;

    const speed = isBoosting ? 0.35 : 0.2;

    // Horizontal movement
    if (joystickActive) {
        playerVelocity.x += joystickDirection.x * speed;
        playerVelocity.z += joystickDirection.y * speed;
    }

    // Vertical movement
    if (verticalInput !== 0) {
        playerVelocity.y += verticalInput * speed * 0.7;
    }

    // Apply physics
    player.position.add(playerVelocity);
    playerVelocity.multiplyScalar(0.85);

    // Bounds
    player.position.x = Math.max(-BOUNDS.x, Math.min(BOUNDS.x, player.position.x));
    player.position.y = Math.max(2, Math.min(BOUNDS.y, player.position.y));
    player.position.z = Math.max(-BOUNDS.z, Math.min(BOUNDS.z, player.position.z));

    // Rotation
    const moving = playerVelocity.length() > 0.02;
    if (moving) {
        const targetRot = Math.atan2(playerVelocity.x, playerVelocity.z);
        player.rotation.y += (targetRot - player.rotation.y) * 0.12;
    }

    // Animate
    if (playerModel) {
        playerModel.animate(moving, delta);
    }

    // Orb follows if chaser
    if (playerRole === PlayerRole.CHASER && playerHeldOrb && playerHeldOrb.mesh) {
        playerHeldOrb.mesh.position.copy(player.position);
        playerHeldOrb.mesh.position.y += 1.5;
    }
}

function updateGlobe(delta) {
    if (!globe || !globe.mesh) return;

    const time = Date.now() * 0.001;

    globeVelocity.x += Math.sin(time * 0.7) * 0.01;
    globeVelocity.y += Math.cos(time * 0.5) * 0.005;
    globeVelocity.z += Math.sin(time * 0.9) * 0.01;

    // Evade all players
    const allPlayers = [player, ...aiPlayers.map(ai => ai.mesh)].filter(p => p);
    allPlayers.forEach(p => {
        const dist = globe.mesh.position.distanceTo(p.position);
        if (dist < 18) {
            const evasion = new THREE.Vector3()
                .subVectors(globe.mesh.position, p.position)
                .normalize();
            globeVelocity.add(evasion.multiplyScalar(0.02));
        }
    });

    globe.mesh.position.add(globeVelocity);

    if (globeVelocity.length() > 0.3) {
        globeVelocity.normalize().multiplyScalar(0.3);
    }

    // Bounds
    ['x', 'y', 'z'].forEach(axis => {
        const bound = axis === 'y' ? BOUNDS.y : (axis === 'x' ? BOUNDS.x : BOUNDS.z);
        const min = axis === 'y' ? 2 : -bound;
        const max = bound;

        if (globe.mesh.position[axis] < min || globe.mesh.position[axis] > max) {
            globeVelocity[axis] *= -1;
            globe.mesh.position[axis] = Math.max(min, Math.min(max, globe.mesh.position[axis]));
        }
    });

    globe.mesh.rotation.y += delta * 2;
    const pulse = 1 + Math.sin(time * 3) * 0.1;
    globe.mesh.scale.set(pulse, pulse, pulse);
}

function updateAI(delta) {
    const gameState = {
        globe: globe,
        scoreOrbs: scoreOrbs,
        strikeSpheres: strikeSpheres,
        goalRings: goalRings,
        teamScores: teamScores,
        allPlayers: aiPlayers.concat([{
            mesh: player,
            team: playerTeam,
            role: playerRole,
            heldOrb: playerHeldOrb
        }])
    };

    aiPlayers.forEach(ai => ai.update(delta, gameState));
}

function updateObjects(delta) {
    scoreOrbs.forEach(orb => orb.update(delta));
    strikeSpheres.forEach(sphere => sphere.update(delta));
    goalRings.forEach(ring => ring.update(delta));
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
    if (!player || !globe || !globe.mesh) return;

    const dist = player.position.distanceTo(globe.mesh.position);
    const distEl = document.getElementById('distance');
    if (distEl) distEl.textContent = `🎯 ${dist.toFixed(1)}m`;

    const minutes = Math.floor(gameTime / 60);
    const seconds = Math.floor(gameTime % 60);
    const timerEl = document.getElementById('timer');
    if (timerEl) timerEl.textContent = `⏱️ ${minutes}:${seconds.toString().padStart(2, '0')}`;

    const scoreEl = document.getElementById('teamScores');
    if (scoreEl) scoreEl.textContent = `⚡ Storm: ${teamScores.storm} | 🔥 Flame: ${teamScores.flame}`;
}

function updateRoleDisplay() {
    const roleEl = document.getElementById('playerRole');
    if (roleEl && playerRole) {
        const teamIcon = playerTeam === Team.STORM ? '⚡' : '🔥';
        const teamName = playerTeam === Team.STORM ? 'STORM' : 'FLAME';
        roleEl.textContent = `${teamIcon} ${teamName} ${playerRole.toUpperCase()}`;
    }
}

function checkPlayerActions() {
    if (!player) return;

    // Seeker: capture globe
    if (playerRole === PlayerRole.SEEKER && globe && globe.mesh) {
        const dist = player.position.distanceTo(globe.mesh.position);
        if (dist < 3) {
            teamScores[playerTeam] += 150;
            showNotification(`🎉 HAI CATTURATO IL GLOBE! +150pts`);

            setTimeout(() => {
                globe.mesh.position.set(
                    (Math.random() - 0.5) * 30,
                    10 + Math.random() * 10,
                    (Math.random() - 0.5) * 30
                );
            }, 3000);
        }
    }

    // Chaser: pick up orb or score
    if (playerRole === PlayerRole.CHASER) {
        if (!playerHeldOrb) {
            // Try to pick up
            const availableOrbs = scoreOrbs.filter(o => !o.held);
            availableOrbs.forEach(orb => {
                const dist = player.position.distanceTo(orb.mesh.position);
                if (dist < 2.5) {
                    orb.held = true;
                    orb.holder = 'player';
                    playerHeldOrb = orb;
                }
            });
        } else {
            // Try to score
            const opponentTeam = playerTeam === Team.STORM ? Team.FLAME : Team.STORM;
            const opponentRings = goalRings.filter(r => r.team === opponentTeam);

            opponentRings.forEach(ring => {
                if (ring.checkScore(playerHeldOrb)) {
                    teamScores[playerTeam] += 10;
                    showNotification(`🎯 GOAL! +10pts`);

                    playerHeldOrb.held = false;
                    playerHeldOrb.holder = null;
                    playerHeldOrb.mesh.position.set(0, 10, 0);
                    playerHeldOrb = null;
                }
            });
        }
    }

    // Beater: hit strike spheres
    if (playerRole === PlayerRole.BEATER) {
        strikeSpheres.forEach(sphere => {
            const dist = player.position.distanceTo(sphere.mesh.position);
            if (dist < 2) {
                const dir = new THREE.Vector3()
                    .subVectors(sphere.mesh.position, player.position)
                    .normalize();
                sphere.velocity.copy(dir.multiplyScalar(0.5));
                showNotification(`⚔️ HIT!`);
            }
        });
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

    const delta = 1/60;
    gameTime += delta;

    updatePlayer(delta);
    updateGlobe(delta);
    updateAI(delta);
    updateObjects(delta);
    updateCamera();
    updateHUD();
    checkPlayerActions();

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
