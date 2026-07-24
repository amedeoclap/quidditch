// ===== SKY SPHERES v3.2 - TRUE QUIDDITCH MECHANICS =====
// Based on Harry Potter books - Complete Quidditch rules

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

const PlayerState = {
    NORMAL: 'normal',
    STUNNED: 'stunned',
    HOLDING_QUAFFLE: 'holding_quaffle'
};

// ===== STYLIZED PLAYER =====
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

    animate(moving, delta, stunned = false) {
        if (stunned) {
            // Stunned animation - spin
            this.group.rotation.x = Math.sin(Date.now() * 0.01) * 0.3;
            this.group.rotation.z = Math.cos(Date.now() * 0.01) * 0.3;
            return;
        }

        this.group.rotation.x = 0;
        this.group.rotation.z = 0;

        if (!moving) {
            this.animTime += delta * 2;
            this.leftArm.rotation.z = Math.PI / 6 + Math.sin(this.animTime) * 0.1;
            this.rightArm.rotation.z = -Math.PI / 6 - Math.sin(this.animTime) * 0.1;
            return;
        }

        this.animTime += delta * 8;
        this.leftArm.rotation.z = Math.PI / 6 + Math.sin(this.animTime) * 0.3;
        this.rightArm.rotation.z = -Math.PI / 6 - Math.sin(this.animTime) * 0.3;
        this.leftLeg.rotation.x = Math.sin(this.animTime) * 0.4;
        this.rightLeg.rotation.x = -Math.sin(this.animTime) * 0.4;
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

// ===== BLUDGER (STRIKE SPHERE) - AGGRESSIVE AI =====
class Bludger {
    constructor(scene, id) {
        this.id = id;
        const geometry = new THREE.SphereGeometry(0.35, 12, 12);
        const material = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            emissive: 0xFF0000,
            emissiveIntensity: 0.6,
            metalness: 1,
            roughness: 0.2
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(
            (Math.random() - 0.5) * 30,
            8 + Math.random() * 10,
            (Math.random() - 0.5) * 30
        );
        this.mesh.castShadow = true;

        this.velocity = new THREE.Vector3();
        this.target = null; // Current target player
        this.targetChangeTimer = 0;

        const light = new THREE.PointLight(0xFF0000, 1.5, 12);
        this.mesh.add(light);

        scene.add(this.mesh);
    }

    update(delta, allPlayers) {
        this.targetChangeTimer -= delta;

        // Change target every 3-5 seconds or if no target
        if (!this.target || this.targetChangeTimer <= 0) {
            this.target = this.selectRandomTarget(allPlayers);
            this.targetChangeTimer = 3 + Math.random() * 2;
        }

        // Chase target AGGRESSIVELY
        if (this.target && this.target.mesh) {
            const dir = new THREE.Vector3()
                .subVectors(this.target.mesh.position, this.mesh.position)
                .normalize();

            // Bludger is FAST and aggressive
            this.velocity.add(dir.multiplyScalar(0.025));

            // Check collision with target
            const dist = this.mesh.position.distanceTo(this.target.mesh.position);
            if (dist < 1.5) {
                this.hitPlayer(this.target);
                // Bounce away
                this.velocity.multiplyScalar(-0.5);
                this.targetChangeTimer = 0; // Find new target immediately
            }
        }

        // Apply velocity
        this.mesh.position.add(this.velocity);

        // Speed limit
        if (this.velocity.length() > 0.4) {
            this.velocity.normalize().multiplyScalar(0.4);
        }

        // Bounds with bounce
        const BOUNDS = { x: 40, y: 25, z: 40 };
        ['x', 'y', 'z'].forEach(axis => {
            const bound = axis === 'y' ? BOUNDS.y : BOUNDS.x;
            const min = axis === 'y' ? 2 : -bound;
            const max = bound;

            if (this.mesh.position[axis] < min || this.mesh.position[axis] > max) {
                this.velocity[axis] *= -0.8;
                this.mesh.position[axis] = Math.max(min, Math.min(max, this.mesh.position[axis]));
            }
        });

        // Rotation
        this.mesh.rotation.x += delta * 4;
        this.mesh.rotation.y += delta * 4;

        // Drag
        this.velocity.multiplyScalar(0.98);
    }

    selectRandomTarget(allPlayers) {
        const validPlayers = allPlayers.filter(p => p && p.mesh && p.state !== PlayerState.STUNNED);
        if (validPlayers.length === 0) return null;
        return validPlayers[Math.floor(Math.random() * validPlayers.length)];
    }

    hitPlayer(player) {
        if (player.state === PlayerState.STUNNED) return;

        player.state = PlayerState.STUNNED;
        player.stunnedTimer = 3; // 3 seconds stunned

        showNotification(`💥 ${player.team.toUpperCase()} ${player.role.toUpperCase()} COLPITO!`);

        // Drop Quaffle if holding
        if (player.heldQuaffle) {
            player.heldQuaffle.held = false;
            player.heldQuaffle.holder = null;
            player.heldQuaffle = null;
        }
    }

    // Beater redirects bludger
    redirectToTarget(targetPosition) {
        const dir = new THREE.Vector3()
            .subVectors(targetPosition, this.mesh.position)
            .normalize();

        this.velocity.copy(dir.multiplyScalar(0.6)); // Fast redirect
        this.targetChangeTimer = 2; // Briefly chase new direction
    }
}

// ===== QUAFFLE (SCORE ORB) =====
class Quaffle {
    constructor(scene) {
        const geometry = new THREE.SphereGeometry(0.35, 16, 16);
        const material = new THREE.MeshStandardMaterial({
            color: 0xDC143C,
            emissive: 0xDC143C,
            emissiveIntensity: 0.5,
            metalness: 0.6,
            roughness: 0.3
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(0, 10, 0);
        this.mesh.castShadow = true;

        const light = new THREE.PointLight(0xDC143C, 1.5, 12);
        this.mesh.add(light);

        scene.add(this.mesh);
        this.held = false;
        this.holder = null;
    }

    update(delta) {
        if (!this.held) {
            this.mesh.rotation.y += delta * 2;
            const pulse = 1 + Math.sin(Date.now() * 0.003) * 0.08;
            this.mesh.scale.set(pulse, pulse, pulse);
        }
    }

    drop(position) {
        this.held = false;
        this.holder = null;
        this.mesh.position.copy(position);
    }
}

// ===== AI PLAYER =====
class AIPlayer {
    constructor(id, role, team, scene) {
        this.id = id;
        this.role = role;
        this.team = team;
        this.state = PlayerState.NORMAL;
        this.stunnedTimer = 0;

        this.model = new StylizedPlayer(team);
        this.mesh = this.model.group;
        this.velocity = new THREE.Vector3();

        this.heldQuaffle = null;
        this.actionCooldown = 0;

        // Starting positions based on role
        const startZ = team === Team.STORM ? -25 : 25;
        const positions = {
            seeker: [0, 12, startZ],
            keeper: [0, 10, startZ + (team === Team.STORM ? -10 : 10)],
            beater: [(Math.random() - 0.5) * 20, 10, startZ],
            chaser: [(Math.random() - 0.5) * 15, 10, startZ + 5]
        };

        this.mesh.position.set(...(positions[role] || [0, 10, 0]));

        this.createNameTag(scene);
        scene.add(this.mesh);
    }

    createNameTag(scene) {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 72;
        const ctx = canvas.getContext('2d');

        // Team colors: Storm = cyan, Flame = orange
        const isStorm = this.team === Team.STORM;
        const teamColor = isStorm ? '#00CED1' : '#FF6B35';
        const teamIcon = isStorm ? '⚡' : '🔥';

        // Background colored by team
        ctx.fillStyle = 'rgba(0,0,0,0.75)';
        ctx.fillRect(0, 0, 256, 72);
        // Colored border to identify team clearly
        ctx.strokeStyle = teamColor;
        ctx.lineWidth = 6;
        ctx.strokeRect(3, 3, 250, 66);

        // Team icon + role text in team color
        ctx.fillStyle = teamColor;
        ctx.font = 'bold 30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${teamIcon} ${this.role.toUpperCase()}`, 128, 48);

        const texture = new THREE.CanvasTexture(canvas);
        const spriteMat = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(spriteMat);
        sprite.scale.set(2.4, 0.65, 1);
        sprite.position.y = 2.5;
        this.mesh.add(sprite);
    }

    update(delta, gameState) {
        if (!this.mesh) return;

        this.actionCooldown = Math.max(0, this.actionCooldown - delta);

        // Handle stunned state
        if (this.state === PlayerState.STUNNED) {
            this.stunnedTimer -= delta;
            if (this.stunnedTimer <= 0) {
                this.state = PlayerState.NORMAL;
            }
            this.model.animate(false, delta, true);
            return; // Can't do anything while stunned
        }

        // Role-specific behavior
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

        // Physics
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
        this.model.animate(moving, delta, this.state === PlayerState.STUNNED);

        // Quaffle follows if holding
        if (this.heldQuaffle && this.heldQuaffle.mesh) {
            this.heldQuaffle.mesh.position.copy(this.mesh.position);
            this.heldQuaffle.mesh.position.y += 1.2;
        }
    }

    updateSeeker(gameState, delta) {
        if (!gameState.snitch || !gameState.snitch.mesh) return;

        const snitch = gameState.snitch.mesh;
        const dist = this.mesh.position.distanceTo(snitch.position);

        // Try to capture - MOLTO DIFFICILE (deve essere vicinissimo)
        if (dist < 1.2 && this.actionCooldown === 0) {
            this.captureSnitch(gameState);
            return;
        }

        // Chase - RALLENTATO per dare tempo al giocatore
        const speed = dist < 15 ? 0.15 : 0.10;
        const dir = new THREE.Vector3()
            .subVectors(snitch.position, this.mesh.position)
            .normalize();
        this.velocity.add(dir.multiplyScalar(speed));
    }

    updateBeater(gameState, delta) {
        if (!gameState.bludgers || gameState.bludgers.length === 0) return;

        // Find nearest bludger
        let nearestBludger = null;
        let minDist = Infinity;

        gameState.bludgers.forEach(bludger => {
            const dist = this.mesh.position.distanceTo(bludger.mesh.position);
            if (dist < minDist) {
                minDist = dist;
                nearestBludger = bludger;
            }
        });

        if (nearestBludger) {
            // If close enough, HIT IT towards nearest opponent
            if (minDist < 2 && this.actionCooldown === 0) {
                const opponent = this.findNearestOpponent(gameState);
                if (opponent) {
                    nearestBludger.redirectToTarget(opponent.mesh.position);
                    showNotification(`⚔️ ${this.team.toUpperCase()} BEATER colpisce!`);
                    this.actionCooldown = 1.5;
                }
            } else if (minDist < 15) {
                // Chase bludger
                const dir = new THREE.Vector3()
                    .subVectors(nearestBludger.mesh.position, this.mesh.position)
                    .normalize();
                this.velocity.add(dir.multiplyScalar(0.22));
            }
        }
    }

    updateChaser(gameState, delta) {
        const quaffle = gameState.quaffle;
        if (!quaffle) return;

        // If holding quaffle, go to goal
        if (this.heldQuaffle) {
            this.goToGoal(gameState);
            this.checkScoring(gameState);
            return;
        }

        // Try to get quaffle
        if (quaffle.held && quaffle.holder && quaffle.holder.team !== this.team) {
            // Try to TACKLE opponent with quaffle
            const dist = this.mesh.position.distanceTo(quaffle.holder.mesh.position);
            if (dist < 2.5 && this.actionCooldown === 0) {
                // STEAL!
                quaffle.holder.heldQuaffle = null;
                quaffle.held = true;
                quaffle.holder = this;
                this.heldQuaffle = quaffle;
                showNotification(`🏈 ${this.team.toUpperCase()} CHASER ruba la palla!`);
                this.actionCooldown = 1;
            } else if (dist < 20) {
                // Chase opponent
                const dir = new THREE.Vector3()
                    .subVectors(quaffle.holder.mesh.position, this.mesh.position)
                    .normalize();
                this.velocity.add(dir.multiplyScalar(0.2));
            }
        } else if (!quaffle.held) {
            // Pick up free quaffle
            const dist = this.mesh.position.distanceTo(quaffle.mesh.position);
            if (dist < 2) {
                quaffle.held = true;
                quaffle.holder = this;
                this.heldQuaffle = quaffle;
            } else {
                // Go to quaffle
                const dir = new THREE.Vector3()
                    .subVectors(quaffle.mesh.position, this.mesh.position)
                    .normalize();
                this.velocity.add(dir.multiplyScalar(0.2));
            }
        }
    }

    updateKeeper(gameState, delta) {
        // Stay near home goals
        const goalZ = this.team === Team.STORM ? -35 : 35;
        const homePos = new THREE.Vector3(0, 12, goalZ);
        const dist = this.mesh.position.distanceTo(homePos);

        // Try to INTERCEPT incoming quaffle shots
        const quaffle = gameState.quaffle;
        if (quaffle && quaffle.held && quaffle.holder && quaffle.holder.team !== this.team) {
            const opponent = quaffle.holder;
            const oppDist = this.mesh.position.distanceTo(opponent.mesh.position);

            // If opponent is close to our goals, INTERCEPT
            if (oppDist < 12) {
                const dir = new THREE.Vector3()
                    .subVectors(opponent.mesh.position, this.mesh.position)
                    .normalize();
                this.velocity.add(dir.multiplyScalar(0.3)); // Fast intercept

                // Try to block/tackle
                if (oppDist < 2 && this.actionCooldown === 0) {
                    opponent.heldQuaffle = null;
                    quaffle.held = false;
                    quaffle.holder = null;
                    quaffle.drop(this.mesh.position);
                    showNotification(`🛡️ ${this.team.toUpperCase()} KEEPER blocca!`);
                    this.actionCooldown = 1.5;
                }
                return;
            }
        }

        // Return to home position
        if (dist > 6) {
            const dir = new THREE.Vector3()
                .subVectors(homePos, this.mesh.position)
                .normalize();
            this.velocity.add(dir.multiplyScalar(0.2));
        }
    }

    captureSnitch(gameState) {
        if (gameEnded) return; // Evita game-over multipli
        gameEnded = true;
        this.actionCooldown = 3;
        const points = 150;
        gameState.teamScores[this.team] += points;

        showNotification(`🎉 ${this.team.toUpperCase()} SEEKER cattura il Boccino! +${points}pts\n\nFINE PARTITA!`);

        // Game over
        setTimeout(() => {
            showGameOver(gameState.teamScores);
        }, 3000);
    }

    goToGoal(gameState) {
        const goalZ = this.team === Team.STORM ? 35 : -35;
        const goalPos = new THREE.Vector3(0, 12, goalZ);

        const dir = new THREE.Vector3()
            .subVectors(goalPos, this.mesh.position)
            .normalize();
        this.velocity.add(dir.multiplyScalar(0.24));
    }

    checkScoring(gameState) {
        if (!this.heldQuaffle || !gameState.goalRings) return;

        const opponentTeam = this.team === Team.STORM ? Team.FLAME : Team.STORM;
        const opponentRings = gameState.goalRings.filter(r => r.team === opponentTeam);

        for (let ring of opponentRings) {
            if (ring.checkScore(this.heldQuaffle)) {
                gameState.teamScores[this.team] += 10;
                showNotification(`🎯 ${this.team.toUpperCase()} GOAL! +10pts`);

                this.heldQuaffle.drop(new THREE.Vector3(0, 10, 0));
                this.heldQuaffle = null;
                this.actionCooldown = 2;
                break;
            }
        }
    }

    findNearestOpponent(gameState) {
        const opponents = gameState.allPlayers.filter(p =>
            p && p.team !== this.team && p.state !== PlayerState.STUNNED
        );

        if (opponents.length === 0) return null;

        let nearest = null;
        let minDist = Infinity;

        opponents.forEach(opp => {
            const dist = this.mesh.position.distanceTo(opp.mesh.position);
            if (dist < minDist) {
                minDist = dist;
                nearest = opp;
            }
        });

        return nearest;
    }
}

// ===== GOAL RING =====
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

    checkScore(quaffle) {
        if (!quaffle || !quaffle.mesh) return false;
        const distance = this.mesh.position.distanceTo(quaffle.mesh.position);
        return distance < 3.2;
    }

    update(delta) {
        this.mesh.rotation.z += delta * 0.5;
    }
}

// ===== GLOBAL GAME STATE =====
let scene, camera, renderer;
let player, playerModel, snitch;
let playerVelocity, snitchVelocity;
let playerRole = null;
let playerTeam = null;
let playerState = PlayerState.NORMAL;
let playerStunnedTimer = 0;
let playerHeldQuaffle = null;

let aiPlayers = [];
let bludgers = []; // 2 Bludgers
let quaffle = null; // 1 Quaffle
let goalRings = [];

let gameStarted = false;
let gameEnded = false;
let gameTime = 0;
let teamScores = { storm: 0, flame: 0 };

// Controls
let joystickActive = false;
let joystickDirection = { x: 0, y: 0 };
let isBoosting = false;
let verticalInput = 0;
let actionPressed = false; // Pulsante AZIONE per Beater/Keeper/Chaser

// Keyboard controls
let keysPressed = {
    w: false, a: false, s: false, d: false,
    space: false, shift: false, ctrl: false,
    e: false // Tasto AZIONE
};

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

    const startScreen = document.getElementById('startScreen');
    const gameCanvas = document.getElementById('gameCanvas');
    const hud = document.getElementById('hud');
    const mobileControls = document.getElementById('mobileControls');

    if (startScreen) startScreen.style.display = 'none';
    if (gameCanvas) gameCanvas.style.display = 'block';
    if (hud) hud.style.display = 'block';
    if (mobileControls) mobileControls.style.display = 'flex';

    playerVelocity = new THREE.Vector3();
    snitchVelocity = new THREE.Vector3();

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
    createSnitch(); // Golden Snitch
    createQuaffle(); // 1 Quaffle
    createBludgers(); // 2 Bludgers
    createAIPlayers();
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
    const startZ = playerTeam === Team.STORM ? -20 : 20;
    player.position.set(0, 10, startZ);

    // "TU" marker above the player so you always know who you control
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 96;
    const ctx = canvas.getContext('2d');
    const isStorm = playerTeam === Team.STORM;
    const teamColor = isStorm ? '#00CED1' : '#FF6B35';
    const teamIcon = isStorm ? '⚡' : '🔥';

    ctx.fillStyle = teamColor;
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 5;
    ctx.strokeText(`▼ TU ${teamIcon}`, 128, 42);
    ctx.fillText(`▼ TU ${teamIcon}`, 128, 42);
    ctx.font = 'bold 26px Arial';
    ctx.fillStyle = 'white';
    ctx.strokeText(`${playerRole.toUpperCase()}`, 128, 78);
    ctx.fillText(`${playerRole.toUpperCase()}`, 128, 78);

    const texture = new THREE.CanvasTexture(canvas);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, depthTest: false }));
    sprite.scale.set(3, 1.1, 1);
    sprite.position.y = 3.2;
    sprite.renderOrder = 999;
    player.add(sprite);

    scene.add(player);
}

function createSnitch() {
    const geometry = new THREE.SphereGeometry(0.5, 32, 32);
    const material = new THREE.MeshStandardMaterial({
        color: 0xFFD700,
        emissive: 0xFFD700,
        emissiveIntensity: 0.9,
        metalness: 1,
        roughness: 0.1
    });

    snitch = { mesh: new THREE.Mesh(geometry, material) };
    snitch.mesh.position.set(15, 15, 15);
    snitch.mesh.castShadow = true;
    scene.add(snitch.mesh);

    const light = new THREE.PointLight(0xFFD700, 3, 25);
    snitch.mesh.add(light);

    snitchVelocity.set(
        (Math.random() - 0.5) * 0.15,
        (Math.random() - 0.5) * 0.08,
        (Math.random() - 0.5) * 0.15
    );
}

function createQuaffle() {
    quaffle = new Quaffle(scene);
}

function createBludgers() {
    bludgers.push(new Bludger(scene, 1));
    bludgers.push(new Bludger(scene, 2));
}

function createAIPlayers() {
    // Create AI for remaining positions
    // Seeker: 1 per team (2 total, including player if player is Seeker)
    // Beater: 2 per team (4 total)
    // Chaser: 3 per team (6 total)
    // Keeper: 1 per team (2 total)

    const teamRoles = {
        seeker: 1,
        beater: 2,
        chaser: 3,
        keeper: 1
    };

    // Player team - fill missing roles (ESCLUDE il ruolo del giocatore)
    const playerTeamNeeds = { ...teamRoles };
    playerTeamNeeds[playerRole]--; // Toglie 1 perché il giocatore riempie quel ruolo

    Object.keys(playerTeamNeeds).forEach(role => {
        for (let i = 0; i < playerTeamNeeds[role]; i++) {
            aiPlayers.push(new AIPlayer(`ai_${playerTeam}_${role}_${i}`, role, playerTeam, scene));
        }
    });

    // Opponent team - all roles (squadra completa)
    const opponentTeam = playerTeam === Team.STORM ? Team.FLAME : Team.STORM;
    Object.keys(teamRoles).forEach(role => {
        for (let i = 0; i < teamRoles[role]; i++) {
            aiPlayers.push(new AIPlayer(`ai_${opponentTeam}_${role}_${i}`, role, opponentTeam, scene));
        }
    });

    // Verifica composizione: ogni squadra deve avere esattamente 1 Seeker
    const countSeekers = (team) => {
        let n = aiPlayers.filter(ai => ai.team === team && ai.role === PlayerRole.SEEKER).length;
        if (playerRole === PlayerRole.SEEKER && playerTeam === team) n++;
        return n;
    };
    console.log(`Squadre create — ${playerTeam.toUpperCase()}: ${countSeekers(playerTeam)} seeker | ${opponentTeam.toUpperCase()}: ${countSeekers(opponentTeam)} seeker`);
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
    const actionButton = document.getElementById('actionButton');
    const upButton = document.getElementById('upButton');
    const downButton = document.getElementById('downButton');

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

    boostButton.addEventListener('touchstart', (e) => {
        e.preventDefault();
        isBoosting = true;
        boostButton.style.transform = 'scale(0.9)';
    });

    boostButton.addEventListener('touchend', () => {
        isBoosting = false;
        boostButton.style.transform = 'scale(1)';
    });

    // Action button (for Beater, Keeper, Chaser actions)
    if (actionButton) {
        actionButton.addEventListener('touchstart', (e) => {
            e.preventDefault();
            actionPressed = true;
            actionButton.style.transform = 'scale(0.9)';
        });

        actionButton.addEventListener('touchend', () => {
            actionPressed = false;
            actionButton.style.transform = 'scale(1)';
        });
    }

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

    // Keyboard controls
    window.addEventListener('keydown', (e) => {
        switch(e.key.toLowerCase()) {
            case 'w': keysPressed.w = true; break;
            case 'a': keysPressed.a = true; break;
            case 's': keysPressed.s = true; break;
            case 'd': keysPressed.d = true; break;
            case ' ': keysPressed.space = true; isBoosting = true; e.preventDefault(); break;
            case 'shift': keysPressed.shift = true; isBoosting = true; break;
            case 'control': keysPressed.ctrl = true; break;
            case 'e': keysPressed.e = true; actionPressed = true; e.preventDefault(); break;
        }
    });

    window.addEventListener('keyup', (e) => {
        switch(e.key.toLowerCase()) {
            case 'w': keysPressed.w = false; break;
            case 'a': keysPressed.a = false; break;
            case 's': keysPressed.s = false; break;
            case 'd': keysPressed.d = false; break;
            case ' ': keysPressed.space = false; isBoosting = false; break;
            case 'shift': keysPressed.shift = false; isBoosting = false; break;
            case 'control': keysPressed.ctrl = false; break;
            case 'e': keysPressed.e = false; actionPressed = false; break;
        }
    });
}

function updatePlayer(delta) {
    if (!player) return;

    // Handle stunned
    if (playerState === PlayerState.STUNNED) {
        playerStunnedTimer -= delta;
        if (playerStunnedTimer <= 0) {
            playerState = PlayerState.NORMAL;
        }
        if (playerModel) {
            playerModel.animate(false, delta, true);
        }
        return;
    }

    // VELOCITÀ AUMENTATA per controlli più fluidi
    const speed = isBoosting ? 0.5 : 0.3;

    // Joystick controls
    if (joystickActive) {
        playerVelocity.x += joystickDirection.x * speed;
        playerVelocity.z += joystickDirection.y * speed;
    }

    // Keyboard controls (WASD)
    if (keysPressed.a) playerVelocity.x -= speed;
    if (keysPressed.d) playerVelocity.x += speed;
    if (keysPressed.w) playerVelocity.z -= speed;
    if (keysPressed.s) playerVelocity.z += speed;

    // Vertical controls (Space/Ctrl or buttons)
    if (keysPressed.space) {
        playerVelocity.y += speed * 0.8;
    }
    if (keysPressed.ctrl) {
        playerVelocity.y -= speed * 0.8;
    }
    if (verticalInput !== 0) {
        playerVelocity.y += verticalInput * speed * 0.8;
    }

    player.position.add(playerVelocity);
    // DAMPING RIDOTTO per movimento più fluido (0.85 → 0.88)
    playerVelocity.multiplyScalar(0.88);

    player.position.x = Math.max(-BOUNDS.x, Math.min(BOUNDS.x, player.position.x));
    player.position.y = Math.max(2, Math.min(BOUNDS.y, player.position.y));
    player.position.z = Math.max(-BOUNDS.z, Math.min(BOUNDS.z, player.position.z));

    const moving = playerVelocity.length() > 0.02;
    if (moving) {
        const targetRot = Math.atan2(playerVelocity.x, playerVelocity.z);
        player.rotation.y += (targetRot - player.rotation.y) * 0.12;
    }

    if (playerModel) {
        playerModel.animate(moving, delta, false);
    }

    // Quaffle follows if Chaser holding
    if (playerRole === PlayerRole.CHASER && playerHeldQuaffle && playerHeldQuaffle.mesh) {
        playerHeldQuaffle.mesh.position.copy(player.position);
        playerHeldQuaffle.mesh.position.y += 1.5;
    }
}

function updateSnitch(delta) {
    if (!snitch || !snitch.mesh) return;

    const time = Date.now() * 0.001;

    snitchVelocity.x += Math.sin(time * 0.7) * 0.01;
    snitchVelocity.y += Math.cos(time * 0.5) * 0.005;
    snitchVelocity.z += Math.sin(time * 0.9) * 0.01;

    // Evade all seekers - MOLTO AGILE!
    const allPlayers = [
        { mesh: player, role: playerRole, team: playerTeam, state: playerState },
        ...aiPlayers
    ];

    const seekers = allPlayers.filter(p => p.role === PlayerRole.SEEKER && p.state !== PlayerState.STUNNED);

    seekers.forEach(seeker => {
        const dist = snitch.mesh.position.distanceTo(seeker.mesh.position);
        // Detect seekers from further away (25 invece di 18)
        if (dist < 25) {
            const evasion = new THREE.Vector3()
                .subVectors(snitch.mesh.position, seeker.mesh.position)
                .normalize();
            // Evasion più forte quando molto vicino
            const evasionForce = dist < 10 ? 0.05 : 0.03;
            snitchVelocity.add(evasion.multiplyScalar(evasionForce));
        }
    });

    snitch.mesh.position.add(snitchVelocity);

    // Max speed aumentata per renderlo più veloce
    if (snitchVelocity.length() > 0.4) {
        snitchVelocity.normalize().multiplyScalar(0.4);
    }

    ['x', 'y', 'z'].forEach(axis => {
        const bound = axis === 'y' ? BOUNDS.y : BOUNDS.x;
        const min = axis === 'y' ? 2 : -bound;
        const max = bound;

        if (snitch.mesh.position[axis] < min || snitch.mesh.position[axis] > max) {
            snitchVelocity[axis] *= -1;
            snitch.mesh.position[axis] = Math.max(min, Math.min(max, snitch.mesh.position[axis]));
        }
    });

    snitch.mesh.rotation.y += delta * 2;
    const pulse = 1 + Math.sin(time * 3) * 0.1;
    snitch.mesh.scale.set(pulse, pulse, pulse);
}

function updateAI(delta) {
    const allPlayers = [
        { mesh: player, role: playerRole, team: playerTeam, state: playerState, heldQuaffle: playerHeldQuaffle },
        ...aiPlayers
    ];

    const gameState = {
        snitch: snitch,
        quaffle: quaffle,
        bludgers: bludgers,
        goalRings: goalRings,
        teamScores: teamScores,
        allPlayers: allPlayers
    };

    aiPlayers.forEach(ai => ai.update(delta, gameState));
}

function updateBludgers(delta) {
    const allPlayers = [
        { mesh: player, role: playerRole, team: playerTeam, state: playerState },
        ...aiPlayers
    ];

    bludgers.forEach(bludger => bludger.update(delta, allPlayers));

    // Check if player got hit
    bludgers.forEach(bludger => {
        if (playerState !== PlayerState.STUNNED) {
            const dist = player.position.distanceTo(bludger.mesh.position);
            if (dist < 1.5) {
                playerState = PlayerState.STUNNED;
                playerStunnedTimer = 3;
                if (playerHeldQuaffle) {
                    playerHeldQuaffle.drop(player.position);
                    playerHeldQuaffle = null;
                }
                showNotification(`💥 SEI STATO COLPITO DA UN BLUDGER!`);
            }
        }
    });
}

function updateQuaffle(delta) {
    if (quaffle) {
        quaffle.update(delta);
    }
}

function updateGoalRings(delta) {
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
    if (!player) return;

    // Distanza pertinente al ruolo
    const distEl = document.getElementById('distance');
    if (distEl) {
        let target = null, label = '';
        if (playerRole === PlayerRole.CHASER && quaffle && quaffle.mesh && !playerHeldQuaffle) {
            target = quaffle.mesh; label = '🏈 Quaffle';
        } else if (snitch && snitch.mesh) {
            target = snitch.mesh; label = '🎯 Boccino';
        }
        if (target) {
            const dist = player.position.distanceTo(target.position);
            distEl.textContent = `${label}: ${dist.toFixed(1)}m`;
        }
    }

    const minutes = Math.floor(gameTime / 60);
    const seconds = Math.floor(gameTime % 60);
    const timerEl = document.getElementById('timer');
    if (timerEl) timerEl.textContent = `⏱️ ${minutes}:${seconds.toString().padStart(2, '0')}`;

    const scoreEl = document.getElementById('teamScores');
    if (scoreEl) scoreEl.textContent = `⚡ Storm: ${teamScores.storm} | 🔥 Flame: ${teamScores.flame}`;
}

function updateRoleDisplay() {
    const teamIcon = playerTeam === Team.STORM ? '⚡' : '🔥';
    const teamName = playerTeam === Team.STORM ? 'STORM' : 'FLAME';

    const roleEl = document.getElementById('playerRole');
    if (roleEl && playerRole) {
        roleEl.textContent = `${teamIcon} ${teamName} ${playerRole.toUpperCase()}`;
    }

    // Objective hint - tells the player exactly what to do and which key
    const hintEl = document.getElementById('objectiveHint');
    if (hintEl && playerRole) {
        const objectives = {
            seeker: `🎯 SEEKER: insegui e tocca il <b>Boccino d'Oro</b> per vincere la partita! (+150 pt)`,
            beater: `⚔️ BEATER: avvicinati a un <b>Bludger</b> e premi <span class="obj-action">E / AZIONE</span> per scagliarlo contro un avversario!`,
            chaser: `🏈 CHASER: prendi la <b>Quaffle</b> e portala negli anelli avversari per segnare (+10 pt). Premi <span class="obj-action">E / AZIONE</span> per rubarla!`,
            keeper: `🛡️ KEEPER: resta vicino ai tuoi anelli e premi <span class="obj-action">E / AZIONE</span> per bloccare i tiri avversari!`
        };
        hintEl.innerHTML = objectives[playerRole] || '';
    }
}

function checkPlayerActions() {
    if (!player || playerState === PlayerState.STUNNED || gameEnded) return;

    // Riconciliazione: se un avversario ci ha rubato la Quaffle, rilasciala
    if (playerHeldQuaffle && quaffle && quaffle.holder && quaffle.holder.mesh !== player) {
        playerHeldQuaffle = null;
    }

    // SEEKER: capture snitch (guardia gameEnded evita game-over multipli)
    if (playerRole === PlayerRole.SEEKER && snitch && snitch.mesh) {
        const dist = player.position.distanceTo(snitch.mesh.position);
        if (dist < 2.5) {
            gameEnded = true;
            teamScores[playerTeam] += 150;
            showNotification(`🎉 HAI CATTURATO IL BOCCINO D'ORO! +150pts\n\nFINE PARTITA!`);

            setTimeout(() => {
                showGameOver(teamScores);
            }, 3000);
        }
    }

    // CHASER: pick up or score
    if (playerRole === PlayerRole.CHASER && quaffle) {
        if (!playerHeldQuaffle) {
            // Try to pick up or steal
            if (quaffle.held && quaffle.holder && quaffle.holder.team !== playerTeam) {
                // Steal requires pressing action (E / AZIONE)
                const dist = player.position.distanceTo(quaffle.holder.mesh.position);
                if (dist < 2.5 && actionPressed) {
                    quaffle.holder.heldQuaffle = null;
                    quaffle.held = true;
                    quaffle.holder = { mesh: player, team: playerTeam };
                    playerHeldQuaffle = quaffle;
                    showNotification(`🏈 HAI RUBATO LA QUAFFLE!`);
                    actionPressed = false;
                }
            } else if (!quaffle.held) {
                // Free quaffle picked up automatically on touch
                const dist = player.position.distanceTo(quaffle.mesh.position);
                if (dist < 2.5) {
                    quaffle.held = true;
                    quaffle.holder = { mesh: player, team: playerTeam };
                    playerHeldQuaffle = quaffle;
                    showNotification(`🏈 HAI PRESO LA QUAFFLE! Vai agli anelli avversari!`);
                }
            }
        } else {
            // Try to score
            const opponentTeam = playerTeam === Team.STORM ? Team.FLAME : Team.STORM;
            const opponentRings = goalRings.filter(r => r.team === opponentTeam);

            opponentRings.forEach(ring => {
                if (ring.checkScore(playerHeldQuaffle)) {
                    teamScores[playerTeam] += 10;
                    showNotification(`🎯 GOAL! +10pts`);

                    playerHeldQuaffle.drop(new THREE.Vector3(0, 10, 0));
                    playerHeldQuaffle = null;
                }
            });
        }
    }

    // BEATER: hit bludgers (MANUALE con tasto E o pulsante)
    if (playerRole === PlayerRole.BEATER && bludgers.length > 0 && actionPressed) {
        bludgers.forEach(bludger => {
            const dist = player.position.distanceTo(bludger.mesh.position);
            if (dist < 3.5) { // Raggio aumentato per facilitare
                // Find nearest opponent
                const opponents = aiPlayers.filter(ai => ai.team !== playerTeam && ai.state !== PlayerState.STUNNED);
                if (opponents.length > 0) {
                    let nearest = opponents[0];
                    let minDist = player.position.distanceTo(nearest.mesh.position);

                    opponents.forEach(opp => {
                        const d = player.position.distanceTo(opp.mesh.position);
                        if (d < minDist) {
                            minDist = d;
                            nearest = opp;
                        }
                    });

                    bludger.redirectToTarget(nearest.mesh.position);
                    showNotification(`⚔️ HAI COLPITO IL BLUDGER!`);
                    actionPressed = false; // Prevent spam
                }
            }
        });
    }

    // KEEPER: block shots (MANUALE con tasto E o pulsante AZIONE)
    if (playerRole === PlayerRole.KEEPER && actionPressed && quaffle && quaffle.held && quaffle.holder && quaffle.holder.team !== playerTeam) {
        const dist = player.position.distanceTo(quaffle.holder.mesh.position);
        if (dist < 3) { // raggio aumentato per facilitare il blocco
            if (quaffle.holder.heldQuaffle) {
                quaffle.holder.heldQuaffle = null;
            }
            quaffle.drop(player.position);
            showNotification(`🛡️ HAI BLOCCATO IL TIRO!`);
            actionPressed = false;
        }
    }
}

function showNotification(message) {
    const notif = document.getElementById('notification');
    if (notif) {
        notif.textContent = message;
        notif.classList.add('show');
        setTimeout(() => notif.classList.remove('show'), 2500);
    }
}

function showGameOver(scores) {
    const winner = scores.storm > scores.flame ? 'STORM' : 'FLAME';
    const winnerIcon = scores.storm > scores.flame ? '⚡' : '🔥';

    const gameOver = document.createElement('div');
    gameOver.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.95);z-index:9999;display:flex;flex-direction:column;justify-content:center;align-items:center;color:white;';

    gameOver.innerHTML = `
        <h1 style="font-size:72px;margin-bottom:30px;">${winnerIcon} VITTORIA ${winner}! ${winnerIcon}</h1>
        <p style="font-size:36px;margin:20px;">⚡ Storm: ${scores.storm} pts</p>
        <p style="font-size:36px;margin:20px;">🔥 Flame: ${scores.flame} pts</p>
        <button onclick="location.reload()" style="font-size:28px;padding:20px 50px;margin-top:40px;background:#FFD700;border:none;border-radius:30px;cursor:pointer;">
            🔄 GIOCA ANCORA
        </button>
    `;

    document.body.appendChild(gameOver);
}

function animate() {
    if (!gameStarted) return;
    requestAnimationFrame(animate);

    const delta = 1/60;
    gameTime += delta;

    updatePlayer(delta);
    updateSnitch(delta);
    updateAI(delta);
    updateBludgers(delta);
    updateQuaffle(delta);
    updateGoalRings(delta);
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
