// ===== SKY SPHERES - Web Game =====
// Three.js based 3D flying game

// Global Variables
let scene, camera, renderer;
let player, globe;
let playerVelocity = new THREE.Vector3();
let globeVelocity = new THREE.Vector3();
let keys = {};
let isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
let touchStartX = 0, touchStartY = 0;
let joystickActive = false;
let joystickDirection = { x: 0, y: 0 };
let isBoosting = false;
let gameStarted = false;
let gameTime = 0;
let captured = false;

// Game Settings
const PLAYER_SPEED = 0.3;
const PLAYER_BOOST = 0.6;
const GLOBE_SPEED = 0.15;
const CAPTURE_DISTANCE = 3;
const BOUNDS = { x: 50, y: 30, z: 50 };

// ===== INITIALIZATION =====

function init() {
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); // Sky blue
    scene.fog = new THREE.Fog(0x87CEEB, 50, 150);

    // Camera
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 15, 25);
    camera.lookAt(0, 5, 0);

    // Renderer
    const canvas = document.getElementById('gameCanvas');
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 0.8);
    sunLight.position.set(50, 100, 30);
    sunLight.castShadow = true;
    sunLight.shadow.camera.left = -50;
    sunLight.shadow.camera.right = 50;
    sunLight.shadow.camera.top = 50;
    sunLight.shadow.camera.bottom = -50;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    scene.add(sunLight);

    // Ground
    const groundGeometry = new THREE.PlaneGeometry(200, 200);
    const groundMaterial = new THREE.MeshStandardMaterial({
        color: 0x4a7c59,
        roughness: 0.8,
        metalness: 0.2
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -5;
    ground.receiveShadow = true;
    scene.add(ground);

    // Arena Boundaries (invisible walls)
    createBoundaries();

    // Clouds
    createClouds();

    // Player (Cyan Capsule)
    createPlayer();

    // Radiant Globe (Golden Sphere)
    createGlobe();

    // Event Listeners
    window.addEventListener('resize', onWindowResize);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);

    if (isMobile) {
        setupMobileControls();
    } else {
        setupDesktopControls();
    }

    // Start Button
    document.getElementById('startButton').addEventListener('click', startGame);
}

// ===== PLAYER =====

function createPlayer() {
    const geometry = new THREE.CapsuleGeometry(0.5, 2, 8, 16);
    const material = new THREE.MeshStandardMaterial({
        color: 0x00CED1, // Cyan
        roughness: 0.5,
        metalness: 0.5
    });
    player = new THREE.Mesh(geometry, material);
    player.position.set(0, 5, 0);
    player.castShadow = true;
    scene.add(player);

    // Player glow
    const glowLight = new THREE.PointLight(0x00CED1, 1, 10);
    player.add(glowLight);
}

// ===== RADIANT GLOBE =====

function createGlobe() {
    const geometry = new THREE.SphereGeometry(0.5, 32, 32);
    const material = new THREE.MeshStandardMaterial({
        color: 0xFFD700, // Gold
        roughness: 0.1,
        metalness: 1,
        emissive: 0xFFD700,
        emissiveIntensity: 0.5
    });
    globe = new THREE.Mesh(geometry, material);
    globe.position.set(15, 15, 15);
    globe.castShadow = true;
    scene.add(globe);

    // Globe glow
    const glowLight = new THREE.PointLight(0xFFD700, 2, 20);
    globe.add(glowLight);

    // Particle trail
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 50;
    const positions = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i++) {
        positions[i] = (Math.random() - 0.5) * 2;
    }
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particlesMaterial = new THREE.PointsMaterial({
        color: 0xFFD700,
        size: 0.1,
        transparent: true,
        opacity: 0.6
    });
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    globe.add(particles);

    // Initial velocity
    globeVelocity.set(
        (Math.random() - 0.5) * GLOBE_SPEED,
        (Math.random() - 0.5) * GLOBE_SPEED * 0.5,
        (Math.random() - 0.5) * GLOBE_SPEED
    );
}

// ===== ENVIRONMENT =====

function createBoundaries() {
    // Invisible walls
    const wallMaterial = new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0
    });

    const walls = [
        { pos: [0, 15, BOUNDS.z], size: [BOUNDS.x * 2, 30, 1] }, // North
        { pos: [0, 15, -BOUNDS.z], size: [BOUNDS.x * 2, 30, 1] }, // South
        { pos: [BOUNDS.x, 15, 0], size: [1, 30, BOUNDS.z * 2] }, // East
        { pos: [-BOUNDS.x, 15, 0], size: [1, 30, BOUNDS.z * 2] }, // West
    ];

    walls.forEach(wall => {
        const geometry = new THREE.BoxGeometry(...wall.size);
        const mesh = new THREE.Mesh(geometry, wallMaterial);
        mesh.position.set(...wall.pos);
        scene.add(mesh);
    });
}

function createClouds() {
    for (let i = 0; i < 20; i++) {
        const cloudGeometry = new THREE.SphereGeometry(3 + Math.random() * 2, 8, 8);
        const cloudMaterial = new THREE.MeshStandardMaterial({
            color: 0xFFFFFF,
            transparent: true,
            opacity: 0.6
        });
        const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
        cloud.position.set(
            (Math.random() - 0.5) * 150,
            20 + Math.random() * 20,
            (Math.random() - 0.5) * 150
        );
        cloud.scale.set(1, 0.5, 1);
        scene.add(cloud);
    }
}

// ===== CONTROLS =====

function setupDesktopControls() {
    // Already handled by keydown/keyup
}

function setupMobileControls() {
    const joystick = document.getElementById('joystick');
    const handle = joystick.querySelector('.joystick-handle');
    const boostButton = document.getElementById('boostButton');

    // Joystick
    joystick.addEventListener('touchstart', (e) => {
        e.preventDefault();
        joystickActive = true;
        const touch = e.touches[0];
        const rect = joystick.getBoundingClientRect();
        touchStartX = rect.left + rect.width / 2;
        touchStartY = rect.top + rect.height / 2;
    });

    joystick.addEventListener('touchmove', (e) => {
        if (!joystickActive) return;
        e.preventDefault();
        const touch = e.touches[0];
        const deltaX = touch.clientX - touchStartX;
        const deltaY = touch.clientY - touchStartY;
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

    // Boost button
    boostButton.addEventListener('touchstart', (e) => {
        e.preventDefault();
        isBoosting = true;
        boostButton.style.background = 'rgba(255, 215, 0, 0.9)';
    });

    boostButton.addEventListener('touchend', (e) => {
        e.preventDefault();
        isBoosting = false;
        boostButton.style.background = 'rgba(255, 215, 0, 0.6)';
    });
}

function onKeyDown(event) {
    keys[event.key.toLowerCase()] = true;
}

function onKeyUp(event) {
    keys[event.key.toLowerCase()] = false;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// ===== GAME LOOP =====

function startGame() {
    document.getElementById('startScreen').classList.add('hidden');
    gameStarted = true;
    gameTime = 0;
    animate();
}

function updatePlayer() {
    const speed = (keys['shift'] || isBoosting) ? PLAYER_BOOST : PLAYER_SPEED;

    // Keyboard controls
    if (keys['w']) playerVelocity.z -= speed;
    if (keys['s']) playerVelocity.z += speed;
    if (keys['a']) playerVelocity.x -= speed;
    if (keys['d']) playerVelocity.x += speed;
    if (keys[' ']) playerVelocity.y += speed; // Space
    if (keys['control']) playerVelocity.y -= speed;

    // Mobile joystick
    if (isMobile && joystickActive) {
        playerVelocity.x += joystickDirection.x * speed;
        playerVelocity.z += joystickDirection.y * speed;
    }

    // Apply velocity with drag
    player.position.add(playerVelocity);
    playerVelocity.multiplyScalar(0.85);

    // Bounds
    player.position.x = THREE.MathUtils.clamp(player.position.x, -BOUNDS.x, BOUNDS.x);
    player.position.y = THREE.MathUtils.clamp(player.position.y, 0, BOUNDS.y);
    player.position.z = THREE.MathUtils.clamp(player.position.z, -BOUNDS.z, BOUNDS.z);

    // Rotation based on movement
    if (playerVelocity.length() > 0.01) {
        const targetRotation = Math.atan2(playerVelocity.x, playerVelocity.z);
        player.rotation.y = THREE.MathUtils.lerp(player.rotation.y, targetRotation, 0.1);
    }
}

function updateGlobe() {
    const time = Date.now() * 0.001;

    // Erratic movement with Perlin-like noise simulation
    globeVelocity.x += (Math.sin(time * 0.7) * 0.01);
    globeVelocity.y += (Math.cos(time * 0.5) * 0.005);
    globeVelocity.z += (Math.sin(time * 0.9) * 0.01);

    // Evasion from player
    const distanceToPlayer = globe.position.distanceTo(player.position);
    if (distanceToPlayer < 20) {
        const evasionDirection = new THREE.Vector3()
            .subVectors(globe.position, player.position)
            .normalize();
        globeVelocity.add(evasionDirection.multiplyScalar(0.02));
    }

    // Apply velocity
    globe.position.add(globeVelocity);

    // Limit speed
    const speed = globeVelocity.length();
    if (speed > GLOBE_SPEED * 2) {
        globeVelocity.normalize().multiplyScalar(GLOBE_SPEED * 2);
    }

    // Bounds with bounce
    if (Math.abs(globe.position.x) > BOUNDS.x) {
        globeVelocity.x *= -1;
        globe.position.x = THREE.MathUtils.clamp(globe.position.x, -BOUNDS.x, BOUNDS.x);
    }
    if (globe.position.y < 2 || globe.position.y > BOUNDS.y) {
        globeVelocity.y *= -1;
        globe.position.y = THREE.MathUtils.clamp(globe.position.y, 2, BOUNDS.y);
    }
    if (Math.abs(globe.position.z) > BOUNDS.z) {
        globeVelocity.z *= -1;
        globe.position.z = THREE.MathUtils.clamp(globe.position.z, -BOUNDS.z, BOUNDS.z);
    }

    // Rotation and pulsing
    globe.rotation.y += 0.02;
    const pulse = 1 + Math.sin(time * 3) * 0.1;
    globe.scale.set(pulse, pulse, pulse);
}

function updateCamera() {
    // Smooth camera follow
    const targetPosition = new THREE.Vector3(
        player.position.x,
        player.position.y + 12,
        player.position.z + 20
    );
    camera.position.lerp(targetPosition, 0.05);
    camera.lookAt(player.position.x, player.position.y + 2, player.position.z);
}

function updateHUD() {
    const distance = player.position.distanceTo(globe.position);
    document.getElementById('distance').textContent = `🎯 Distanza: ${distance.toFixed(1)} m`;

    const minutes = Math.floor(gameTime / 60);
    const seconds = Math.floor(gameTime % 60);
    document.getElementById('timer').textContent = `⏱️ ${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function checkCapture() {
    const distance = player.position.distanceTo(globe.position);
    if (distance < CAPTURE_DISTANCE && !captured) {
        captured = true;
        showNotification('🎉 RADIANT GLOBE CATTURATO! 🎉');

        setTimeout(() => {
            showNotification(`Tempo: ${Math.floor(gameTime / 60)}:${Math.floor(gameTime % 60).toString().padStart(2, '0')}`);
            setTimeout(() => {
                if (confirm('Vuoi giocare ancora?')) {
                    location.reload();
                }
            }, 3000);
        }, 2000);
    }
}

function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.classList.add('show');
    setTimeout(() => {
        notification.classList.remove('show');
    }, 2000);
}

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

// ===== START =====

window.addEventListener('load', init);
