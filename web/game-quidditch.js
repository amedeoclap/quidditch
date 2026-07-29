// ===== SKY SPHERES v3.5 - MOBILE POLISH =====
// Based on Harry Potter books - Complete Quidditch rules

const GAME_VERSION = '3.5';

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
        const accent = team === Team.STORM ? 0xE7FFFF : 0xFFE1A8;

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
        const bodyGeo = new THREE.CylinderGeometry(0.25, 0.34, 1, 8);
        this.body = new THREE.Mesh(bodyGeo, mat.clone());
        this.body.position.y = 0.7;
        this.body.castShadow = true;
        this.group.add(this.body);

        const sashGeo = new THREE.TorusGeometry(0.34, 0.035, 6, 18);
        const sashMat = new THREE.MeshStandardMaterial({
            color: accent,
            emissive: accent,
            emissiveIntensity: 0.18,
            roughness: 0.4
        });
        this.sash = new THREE.Mesh(sashGeo, sashMat);
        this.sash.position.y = 0.95;
        this.sash.rotation.x = Math.PI / 2.7;
        this.group.add(this.sash);

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
        const BOUNDS = { x: 56, y: 30, z: 56 };
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
        this.patrolTarget = this.createPatrolTarget();

        // Starting positions based on role
        const startZ = team === Team.STORM ? -34 : 34;
        const positions = {
            seeker: [(Math.random() - 0.5) * 38, 15, startZ * 0.4],
            keeper: [0, 12, startZ + (team === Team.STORM ? -14 : 14)],
            beater: [(Math.random() - 0.5) * 48, 13, startZ * 0.55],
            chaser: [(Math.random() - 0.5) * 44, 12, startZ * 0.25]
        };

        this.mesh.position.set(...(positions[role] || [0, 10, 0]));

        this.createNameTag(scene);
        scene.add(this.mesh);
    }

    createPatrolTarget() {
        return new THREE.Vector3(
            (Math.random() - 0.5) * BOUNDS.x * 1.65,
            8 + Math.random() * 14,
            (Math.random() - 0.5) * BOUNDS.z * 1.65
        );
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

        if (this.velocity.length() < 0.03 && this.role !== PlayerRole.KEEPER) {
            if (this.mesh.position.distanceTo(this.patrolTarget) < 6) {
                this.patrolTarget = this.createPatrolTarget();
            }
            const patrolDir = new THREE.Vector3()
                .subVectors(this.patrolTarget, this.mesh.position)
                .normalize();
            this.velocity.add(patrolDir.multiplyScalar(0.04));
        }

        // Physics
        this.mesh.position.add(this.velocity);
        this.velocity.multiplyScalar(0.87);

        // Bounds
        const BOUNDS = { x: 56, y: 30, z: 56 };
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

        if (gameState.gameTime >= SNITCH_UNLOCK_TIME && dist < AI_SNITCH_CAPTURE_DISTANCE && this.actionCooldown === 0) {
            this.captureSnitch(gameState);
            return;
        }

        const speed = dist < 15 ? AI_SEEKER_SPEED_NEAR : AI_SEEKER_SPEED_FAR;
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
let player, playerModel, snitch, snitchIndicator;
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
let snitchTrail = [];

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
let cameraInput = 0;
let cameraYaw = 0;

// Keyboard controls
let keysPressed = {
    w: false, a: false, s: false, d: false,
    space: false, shift: false, ctrl: false,
    e: false // Tasto AZIONE
};

let destinyHood = new DestinyHood();
const BOUNDS = { x: 56, y: 30, z: 56 };
const SNITCH_UNLOCK_TIME = 45;
const PLAYER_BASE_SPEED = 0.18;
const PLAYER_BOOST_SPEED = 0.32;
const SNITCH_CAPTURE_DISTANCE = 2.0;
const AI_SNITCH_CAPTURE_DISTANCE = 0.85;
const AI_SEEKER_SPEED_FAR = 0.045;
const AI_SEEKER_SPEED_NEAR = 0.07;

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
            if (roleSelection) roleSelection.classList.add('visible');
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
    if (roleSelection) roleSelection.classList.remove('visible');

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
    aiPlayers = [];
    bludgers = [];
    goalRings = [];
    snitchTrail = [];
    teamScores = { storm: 0, flame: 0 };
    gameTime = 0;
    gameEnded = false;
    playerHeldQuaffle = null;

    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x73B7FF);
    scene.fog = new THREE.Fog(0x73B7FF, 80, 190);

    // Camera
    const viewport = getViewportSize();
    camera = new THREE.PerspectiveCamera(75, viewport.width / viewport.height, 0.1, 1000);
    camera.position.set(0, 15, 25);

    // Renderer
    const canvas = document.getElementById('gameCanvas');
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(viewport.width, viewport.height, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.outputEncoding = THREE.sRGBEncoding;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.72);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff4d6, 1.05);
    sunLight.position.set(60, 110, 45);
    sunLight.castShadow = true;
    scene.add(sunLight);

    // Ground
    const groundGeo = new THREE.PlaneGeometry(240, 240);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x3E8F63, roughness: 0.85 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -5;
    ground.receiveShadow = true;
    scene.add(ground);

    createArena();
    createSkyDecor();
    createPlayer();
    createSnitch(); // Golden Snitch
    createQuaffle(); // 1 Quaffle
    createBludgers(); // 2 Bludgers
    createAIPlayers();
    createGoalRings();
    setupControls();

    gameStarted = true;
    updateVersionDisplay();
    updateRoleDisplay();
    animate();
}

function updateVersionDisplay() {
    const badge = document.getElementById('versionBadge');
    if (badge) badge.textContent = `v${GAME_VERSION}`;
    const subtitle = document.getElementById('subtitle');
    if (subtitle) subtitle.textContent = `v${GAME_VERSION} - Mobile Polish`;
    document.title = `Sky Spheres v${GAME_VERSION}`;
}

function createSkyDecor() {
    const cloudMat = new THREE.MeshStandardMaterial({
        color: 0xFFFFFF,
        transparent: true,
        opacity: 0.42,
        roughness: 1
    });

    for (let i = 0; i < 18; i++) {
        const cloud = new THREE.Group();
        const blobs = 3 + Math.floor(Math.random() * 3);
        for (let j = 0; j < blobs; j++) {
            const blob = new THREE.Mesh(
                new THREE.SphereGeometry(2.2 + Math.random() * 2.2, 10, 8),
                cloudMat
            );
            blob.position.set(j * 2.4, Math.random() * 0.8, (Math.random() - 0.5) * 2);
            blob.scale.y = 0.42;
            cloud.add(blob);
        }
        cloud.position.set(
            (Math.random() - 0.5) * 150,
            26 + Math.random() * 26,
            (Math.random() - 0.5) * 150
        );
        cloud.rotation.y = Math.random() * Math.PI;
        scene.add(cloud);
    }
}

function createArena() {
    // Platforms
    const platformGeo = new THREE.CylinderGeometry(5, 5, 1, 32);
    const platformMat = new THREE.MeshStandardMaterial({
        color: 0x9B7B4A,
        roughness: 0.6,
        metalness: 0.08
    });

    const centerPlatform = new THREE.Mesh(platformGeo, platformMat);
    centerPlatform.position.set(0, 8, 0);
    centerPlatform.castShadow = true;
    centerPlatform.receiveShadow = true;
    scene.add(centerPlatform);

    const positions = [
        [24, 10, 24], [-24, 10, 24], [24, 10, -24], [-24, 10, -24],
        [0, 12, 42], [0, 12, -42], [42, 12, 0], [-42, 12, 0],
        [42, 14, 42], [-42, 14, 42], [42, 14, -42], [-42, 14, -42]
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
        [56, 15, 56], [-56, 15, 56], [56, 15, -56], [-56, 15, -56],
        [56, 15, 0], [-56, 15, 0], [0, 15, 56], [0, 15, -56]
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

    const lineMat = new THREE.LineBasicMaterial({
        color: 0xF6E38A,
        transparent: true,
        opacity: 0.7
    });
    const fieldShape = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-BOUNDS.x, -4.85, -BOUNDS.z),
        new THREE.Vector3(BOUNDS.x, -4.85, -BOUNDS.z),
        new THREE.Vector3(BOUNDS.x, -4.85, BOUNDS.z),
        new THREE.Vector3(-BOUNDS.x, -4.85, BOUNDS.z),
        new THREE.Vector3(-BOUNDS.x, -4.85, -BOUNDS.z)
    ]);
    scene.add(new THREE.Line(fieldShape, lineMat));

    [-28, 0, 28].forEach(x => {
        const lane = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(x, -4.8, -BOUNDS.z),
            new THREE.Vector3(x, -4.8, BOUNDS.z)
        ]);
        scene.add(new THREE.Line(lane, lineMat));
    });
}

function createPlayer() {
    playerModel = new StylizedPlayer(playerTeam);
    player = playerModel.group;
    const startZ = playerTeam === Team.STORM ? -20 : 20;
    player.position.set(0, 10, startZ);
    cameraYaw = playerTeam === Team.STORM ? 0 : Math.PI;

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
    const geometry = new THREE.SphereGeometry(0.85, 32, 32);
    const material = new THREE.MeshStandardMaterial({
        color: 0xFFD700,
        emissive: 0xFFD700,
        emissiveIntensity: 1.25,
        metalness: 1,
        roughness: 0.1
    });

    snitch = { mesh: new THREE.Mesh(geometry, material) };
    snitch.mesh.position.set(26, 18, 26);
    snitch.mesh.castShadow = true;
    scene.add(snitch.mesh);

    const haloGeo = new THREE.TorusGeometry(1.45, 0.07, 12, 48);
    const haloMat = new THREE.MeshBasicMaterial({
        color: 0xFFF3A0,
        transparent: true,
        opacity: 0.9
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.rotation.x = Math.PI / 2;
    snitch.mesh.add(halo);

    const wingGeo = new THREE.ConeGeometry(0.35, 1.4, 4);
    const wingMat = new THREE.MeshBasicMaterial({
        color: 0xFFF7C7,
        transparent: true,
        opacity: 0.85
    });
    const leftWing = new THREE.Mesh(wingGeo, wingMat);
    leftWing.position.set(-1.25, 0, 0);
    leftWing.rotation.z = Math.PI / 2;
    snitch.mesh.add(leftWing);
    const rightWing = leftWing.clone();
    rightWing.position.x = 1.25;
    rightWing.rotation.z = -Math.PI / 2;
    snitch.mesh.add(rightWing);

    snitchIndicator = createBillboardLabel('▼ BOCCINO', '#FFD700', '#111111');
    snitchIndicator.position.set(0, 3.2, 0);
    snitch.mesh.add(snitchIndicator);

    const light = new THREE.PointLight(0xFFD700, 5, 42);
    snitch.mesh.add(light);

    const trailMat = new THREE.MeshBasicMaterial({
        color: 0xFFD700,
        transparent: true,
        opacity: 0.55
    });
    for (let i = 0; i < 9; i++) {
        const trailDot = new THREE.Mesh(
            new THREE.SphereGeometry(0.18 + i * 0.025, 10, 8),
            trailMat.clone()
        );
        trailDot.material.opacity = 0.42 - i * 0.035;
        trailDot.position.copy(snitch.mesh.position);
        scene.add(trailDot);
        snitchTrail.push(trailDot);
    }

    snitchVelocity.set(
        (Math.random() - 0.5) * 0.06,
        (Math.random() - 0.5) * 0.03,
        (Math.random() - 0.5) * 0.06
    );
}

function createBillboardLabel(text, fill, stroke) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = 'bold 46px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 8;
    ctx.strokeStyle = stroke;
    ctx.fillStyle = fill;
    ctx.strokeText(text, 256, 64);
    ctx.fillText(text, 256, 64);

    const texture = new THREE.CanvasTexture(canvas);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
        map: texture,
        depthTest: false,
        transparent: true
    }));
    sprite.scale.set(7.5, 1.9, 1);
    sprite.renderOrder = 1000;
    return sprite;
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
    const cameraLeftButton = document.getElementById('cameraLeftButton');
    const cameraRightButton = document.getElementById('cameraRightButton');

    if (!joystick || !boostButton) return;
    const handle = joystick.querySelector('.joystick-handle');
    if (!handle) return;

    const getPoint = (e) => e.touches ? e.touches[0] : e;

    const startJoystick = (e) => {
        e.preventDefault();
        joystickActive = true;
        if (joystick.setPointerCapture && e.pointerId !== undefined) {
            joystick.setPointerCapture(e.pointerId);
        }
        const rect = joystick.getBoundingClientRect();
        joystick.dataset.startX = rect.left + rect.width / 2;
        joystick.dataset.startY = rect.top + rect.height / 2;
    };

    const moveJoystick = (e) => {
        if (!joystickActive) return;
        e.preventDefault();
        const touch = getPoint(e);
        const startX = parseFloat(joystick.dataset.startX);
        const startY = parseFloat(joystick.dataset.startY);
        const deltaX = touch.clientX - startX;
        const deltaY = touch.clientY - startY;
        const distance = Math.min(Math.sqrt(deltaX * deltaX + deltaY * deltaY), 40);
        const angle = Math.atan2(deltaY, deltaX);

        handle.style.transform = `translate(calc(-50% + ${Math.cos(angle) * distance}px), calc(-50% + ${Math.sin(angle) * distance}px))`;

        joystickDirection.x = Math.cos(angle) * (distance / 40);
        joystickDirection.y = Math.sin(angle) * (distance / 40);
    };

    const stopJoystick = (e) => {
        if (e) e.preventDefault();
        joystickActive = false;
        handle.style.transform = 'translate(-50%, -50%)';
        joystickDirection.x = 0;
        joystickDirection.y = 0;
    };

    const bindPress = (element, onDown, onUp) => {
        if (!element) return;
        const down = (e) => {
            e.preventDefault();
            if (element.setPointerCapture && e.pointerId !== undefined) {
                element.setPointerCapture(e.pointerId);
            }
            onDown();
        };
        const up = (e) => {
            if (e) e.preventDefault();
            onUp();
        };

        if (window.PointerEvent) {
            element.addEventListener('pointerdown', down);
            element.addEventListener('pointerup', up);
            element.addEventListener('pointercancel', up);
            element.addEventListener('lostpointercapture', up);
        } else {
            element.addEventListener('touchstart', down, { passive: false });
            element.addEventListener('touchend', up, { passive: false });
            element.addEventListener('touchcancel', up, { passive: false });
        }
    };

    if (window.PointerEvent) {
        joystick.addEventListener('pointerdown', startJoystick);
        joystick.addEventListener('pointermove', moveJoystick);
        joystick.addEventListener('pointerup', stopJoystick);
        joystick.addEventListener('pointercancel', stopJoystick);
        joystick.addEventListener('lostpointercapture', stopJoystick);
    } else {
        joystick.addEventListener('touchstart', startJoystick, { passive: false });
        joystick.addEventListener('touchmove', moveJoystick, { passive: false });
        joystick.addEventListener('touchend', stopJoystick, { passive: false });
        joystick.addEventListener('touchcancel', stopJoystick, { passive: false });
    }

    bindPress(
        boostButton,
        () => {
            isBoosting = true;
            boostButton.style.transform = 'scale(0.9)';
        },
        () => {
            isBoosting = false;
            boostButton.style.transform = 'scale(1)';
        }
    );

    // Action button (for Beater, Keeper, Chaser actions)
    bindPress(
        actionButton,
        () => {
            actionPressed = true;
            actionButton.style.transform = 'scale(0.9)';
        },
        () => {
            actionPressed = false;
            actionButton.style.transform = 'scale(1)';
        }
    );

    bindPress(
        upButton,
        () => {
            verticalInput = 1;
            upButton.style.transform = 'scale(0.9)';
        },
        () => {
            verticalInput = 0;
            upButton.style.transform = 'scale(1)';
        }
    );

    bindPress(
        downButton,
        () => {
            verticalInput = -1;
            downButton.style.transform = 'scale(0.9)';
        },
        () => {
            verticalInput = 0;
            downButton.style.transform = 'scale(1)';
        }
    );

    bindPress(
        cameraLeftButton,
        () => {
            cameraInput = -1;
            cameraLeftButton.style.transform = 'scale(0.92)';
        },
        () => {
            cameraInput = 0;
            cameraLeftButton.style.transform = 'scale(1)';
        }
    );

    bindPress(
        cameraRightButton,
        () => {
            cameraInput = 1;
            cameraRightButton.style.transform = 'scale(0.92)';
        },
        () => {
            cameraInput = 0;
            cameraRightButton.style.transform = 'scale(1)';
        }
    );

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
            case 'q': cameraInput = -1; break;
            case 'r': cameraInput = 1; break;
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
            case 'q':
            case 'r':
                cameraInput = 0;
                break;
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

    const speed = isBoosting ? PLAYER_BOOST_SPEED : PLAYER_BASE_SPEED;

    const desiredVelocity = new THREE.Vector3();

    // Joystick controls: direct movement, not accumulating acceleration.
    if (joystickActive) {
        desiredVelocity.x += joystickDirection.x * speed;
        desiredVelocity.z += joystickDirection.y * speed;
    }

    // Keyboard controls (WASD)
    if (keysPressed.a) desiredVelocity.x -= speed;
    if (keysPressed.d) desiredVelocity.x += speed;
    if (keysPressed.w) desiredVelocity.z -= speed;
    if (keysPressed.s) desiredVelocity.z += speed;

    // Vertical controls (Space/Ctrl or buttons)
    if (keysPressed.space) {
        desiredVelocity.y += speed * 0.8;
    }
    if (keysPressed.ctrl) {
        desiredVelocity.y -= speed * 0.8;
    }
    if (verticalInput !== 0) {
        desiredVelocity.y += verticalInput * speed * 0.8;
    }

    const horizontalVelocity = new THREE.Vector3(desiredVelocity.x, 0, desiredVelocity.z);
    horizontalVelocity.applyAxisAngle(new THREE.Vector3(0, 1, 0), cameraYaw);
    desiredVelocity.x = horizontalVelocity.x;
    desiredVelocity.z = horizontalVelocity.z;

    playerVelocity.lerp(desiredVelocity, desiredVelocity.length() > 0 ? 0.55 : 0.75);
    player.position.add(playerVelocity);

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

    snitchVelocity.x += Math.sin(time * 0.7) * 0.004;
    snitchVelocity.y += Math.cos(time * 0.5) * 0.002;
    snitchVelocity.z += Math.sin(time * 0.9) * 0.004;

    // Evade all seekers - MOLTO AGILE!
    const allPlayers = [
        { mesh: player, role: playerRole, team: playerTeam, state: playerState },
        ...aiPlayers
    ];

    const seekers = allPlayers.filter(p => p.role === PlayerRole.SEEKER && p.state !== PlayerState.STUNNED);

    seekers.forEach(seeker => {
        const dist = snitch.mesh.position.distanceTo(seeker.mesh.position);
        if (dist < 18) {
            const evasion = new THREE.Vector3()
                .subVectors(snitch.mesh.position, seeker.mesh.position)
                .normalize();
            const evasionForce = dist < 8 ? 0.025 : 0.012;
            snitchVelocity.add(evasion.multiplyScalar(evasionForce));
        }
    });

    snitch.mesh.position.add(snitchVelocity);

    if (snitchVelocity.length() > 0.18) {
        snitchVelocity.normalize().multiplyScalar(0.18);
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

    snitchTrail.forEach((dot, index) => {
        const lag = 0.1 + index * 0.035;
        dot.position.lerp(snitch.mesh.position, lag);
        const scale = Math.max(0.35, 1 - index * 0.07);
        dot.scale.set(scale, scale, scale);
    });
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
        allPlayers: allPlayers,
        gameTime: gameTime
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

    cameraYaw += cameraInput * 0.045;
    const followDistance = 24;
    const followHeight = 12;
    const offset = new THREE.Vector3(
        Math.sin(cameraYaw) * followDistance,
        followHeight,
        Math.cos(cameraYaw) * followDistance
    );
    const targetPos = new THREE.Vector3().copy(player.position).add(offset);

    camera.position.lerp(targetPos, 0.09);
    camera.lookAt(player.position.x, player.position.y + 2.4, player.position.z);
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

    const hintEl = document.getElementById('objectiveHint');
    if (hintEl && playerRole === PlayerRole.SEEKER) {
        const remaining = Math.ceil(SNITCH_UNLOCK_TIME - gameTime);
        if (remaining > 0) {
            hintEl.innerHTML = `🎯 SEEKER: scalda i motori. Il Boccino sara' catturabile tra <span class="obj-action">${remaining}s</span>.`;
        } else {
            hintEl.innerHTML = `🎯 SEEKER: avvicinati al <b>Boccino d'Oro</b> e premi <span class="obj-action">E / AZIONE</span> per vincere!`;
        }
    }
}

function updateRadar() {
    const radar = document.getElementById('radar');
    if (!radar || !player) return;

    const ctx = radar.getContext('2d');
    const w = radar.width;
    const h = radar.height;
    const cx = w / 2;
    const cy = h / 2;
    const scale = (w * 0.42) / BOUNDS.x;

    ctx.clearRect(0, 0, w, h);

    ctx.fillStyle = 'rgba(5, 16, 30, 0.72)';
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = 'rgba(255, 215, 0, 0.72)';
    ctx.lineWidth = 3;
    ctx.strokeRect(12, 12, w - 24, h - 24);

    ctx.strokeStyle = 'rgba(255,255,255,0.22)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx, 14);
    ctx.lineTo(cx, h - 14);
    ctx.moveTo(14, cy);
    ctx.lineTo(w - 14, cy);
    ctx.stroke();

    const toRadar = (pos) => ({
        x: cx + pos.x * scale,
        y: cy + pos.z * scale
    });

    const drawDot = (pos, color, radius, stroke = null) => {
        const p = toRadar(pos);
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        if (stroke) {
            ctx.lineWidth = 2;
            ctx.strokeStyle = stroke;
            ctx.stroke();
        }
    };

    goalRings.forEach(ring => drawDot(ring.mesh.position, ring.team === Team.STORM ? '#00CED1' : '#FF6B35', 2.2));
    aiPlayers.forEach(ai => drawDot(ai.mesh.position, ai.team === playerTeam ? 'rgba(0,206,209,0.85)' : 'rgba(255,107,53,0.85)', 2.8));
    if (quaffle && quaffle.mesh) drawDot(quaffle.mesh.position, '#DC143C', 4, '#FFFFFF');
    if (snitch && snitch.mesh) {
        const p = toRadar(snitch.mesh.position);
        const pulse = 5 + Math.sin(Date.now() * 0.01) * 1.5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, pulse, 0, Math.PI * 2);
        ctx.fillStyle = '#FFD700';
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    drawDot(player.position, '#FFFFFF', 5, playerTeam === Team.STORM ? '#00CED1' : '#FF6B35');
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
            seeker: `🎯 SEEKER: dopo il countdown, avvicinati al <b>Boccino d'Oro</b> e premi <span class="obj-action">E / AZIONE</span> per vincere! (+150 pt)`,
            beater: `⚔️ BEATER: avvicinati a un <b>Bludger</b> e premi <span class="obj-action">E / AZIONE</span> per scagliarlo contro un avversario!`,
            chaser: `🏈 CHASER: prendi la <b>Quaffle</b> e portala negli anelli avversari per segnare (+10 pt). Premi <span class="obj-action">E / AZIONE</span> per rubarla!`,
            keeper: `🛡️ KEEPER: resta vicino ai tuoi anelli e premi <span class="obj-action">E / AZIONE</span> per bloccare i tiri avversari!`
        };
        hintEl.innerHTML = objectives[playerRole] || '';
    }

    const actionButton = document.getElementById('actionButton');
    if (actionButton && playerRole) {
        const labels = {
            seeker: 'PRENDI<br>✨',
            beater: 'COLPISCI<br>⚔️',
            chaser: 'RUBA<br>🏈',
            keeper: 'PARA<br>🛡️'
        };
        actionButton.innerHTML = labels[playerRole] || 'AZIONE<br>⚔️';
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
        if (gameTime < SNITCH_UNLOCK_TIME) {
            return;
        }
        if (dist < SNITCH_CAPTURE_DISTANCE && actionPressed) {
            gameEnded = true;
            teamScores[playerTeam] += 150;
            showNotification(`🎉 HAI CATTURATO IL BOCCINO D'ORO! +150pts\n\nFINE PARTITA!`);
            actionPressed = false;

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
        notif.textContent = message.replace(/\n+/g, ' ');
        notif.classList.add('show');
        setTimeout(() => notif.classList.remove('show'), 1500);
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
    updateRadar();
    checkPlayerActions();

    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}

function getViewportSize() {
    if (window.visualViewport) {
        return {
            width: Math.round(window.visualViewport.width),
            height: Math.round(window.visualViewport.height)
        };
    }

    return {
        width: window.innerWidth,
        height: window.innerHeight
    };
}

function resizeGame() {
    if (camera && renderer) {
        const viewport = getViewportSize();
        camera.aspect = viewport.width / viewport.height;
        camera.updateProjectionMatrix();
        renderer.setSize(viewport.width, viewport.height, false);
    }
}

window.addEventListener('resize', resizeGame);
window.addEventListener('orientationchange', () => setTimeout(resizeGame, 250));
if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', resizeGame);
}
