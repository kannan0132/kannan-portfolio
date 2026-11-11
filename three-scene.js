/**
 * Kannan A — 3D Cyber & Cloud Infrastructure Visualization Engine
 * Powered by Three.js
 */

(function () {
  'use strict';

  // Wait for DOM and Three.js to be available
  window.addEventListener('DOMContentLoaded', init3D);

  function init3D() {
    if (typeof THREE === 'undefined') {
      console.warn('Three.js not loaded. Falling back gracefully to CSS animations.');
      return;
    }

    try {
      initBackgroundConstellation();
      initHero3DCore();
    } catch (err) {
      console.error('Error initializing 3D canvas:', err);
    }
  }

  /* ==========================================================================
     1. BACKGROUND 3D CONSTELLATION & CYBER PARTICLES
     ========================================================================== */
  function initBackgroundConstellation() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: window.devicePixelRatio < 2, // antialias on standard screens
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x080d18, 0); // Transparent to show dark background

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.z = 700;

    // Create 3D particles with varying colors
    const particleCount = window.innerWidth < 768 ? 450 : 900;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const velocities = [];

    const color1 = new THREE.Color(0xe2e8f0); // Platinum / Silver
    const color2 = new THREE.Color(0x94a3b8); // Slate / Titanium Grey
    const color3 = new THREE.Color(0xffffff); // Starlight White

    const spreadX = 1400;
    const spreadY = 1200;
    const spreadZ = 900;

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * spreadX;
      positions[i * 3 + 1] = (Math.random() - 0.5) * spreadY;
      positions[i * 3 + 2] = (Math.random() - 0.5) * spreadZ;

      // Color selection
      const rand = Math.random();
      const chosenColor = rand > 0.6 ? color1 : rand > 0.25 ? color2 : color3;
      colors[i * 3] = chosenColor.r;
      colors[i * 3 + 1] = chosenColor.g;
      colors[i * 3 + 2] = chosenColor.b;

      velocities.push({
        x: (Math.random() - 0.5) * 0.35,
        y: (Math.random() - 0.5) * 0.35,
        z: (Math.random() - 0.5) * 0.25
      });
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Particle sprite using canvas
    function createGlowTexture() {
      const pCanvas = document.createElement('canvas');
      pCanvas.width = 32;
      pCanvas.height = 32;
      const ctx = pCanvas.getContext('2d');
      const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      grad.addColorStop(0, 'rgba(255,255,255,1)');
      grad.addColorStop(0.3, 'rgba(226,232,240,0.85)');
      grad.addColorStop(0.7, 'rgba(148,163,184,0.25)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(16, 16, 16, 0, Math.PI * 2);
      ctx.fill();
      return new THREE.CanvasTexture(pCanvas);
    }

    const material = new THREE.PointsMaterial({
      size: 5,
      map: createGlowTexture(),
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Mouse tracking with smooth lerp
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    window.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX - windowHalfX) * 0.45;
      mouseY = (e.clientY - windowHalfY) * 0.45;
    }, { passive: true });

    // Scroll parallax
    let scrollY = window.scrollY;
    window.addEventListener('scroll', () => {
      scrollY = window.scrollY;
    }, { passive: true });

    // Resize handling
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }, { passive: true });

    // Animation Loop
    let clock = new THREE.Clock();

    function animate() {
      requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Smooth camera interpolation
      targetX += (mouseX - targetX) * 0.04;
      targetY += (mouseY - targetY) * 0.04;
      camera.position.x = targetX;
      camera.position.y = -targetY + (scrollY * 0.15);
      camera.lookAt(scene.position);

      // Rotate particle network
      particles.rotation.y = elapsedTime * 0.04;
      particles.rotation.x = Math.sin(elapsedTime * 0.02) * 0.08;

      // Gentle movement for particles
      const posArray = geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        posArray[i * 3 + 1] += velocities[i].y;
        posArray[i * 3] += velocities[i].x;

        // Boundary wrap
        if (posArray[i * 3 + 1] > spreadY / 2) posArray[i * 3 + 1] = -spreadY / 2;
        if (posArray[i * 3 + 1] < -spreadY / 2) posArray[i * 3 + 1] = spreadY / 2;
        if (posArray[i * 3] > spreadX / 2) posArray[i * 3] = -spreadX / 2;
        if (posArray[i * 3] < -spreadX / 2) posArray[i * 3] = spreadX / 2;
      }
      geometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    }

    animate();
  }

  /* ==========================================================================
     2. HERO 3D INTERACTIVE CYBER-CLOUD CORE
     ========================================================================== */
  function initHero3DCore() {
    const heroCanvas = document.getElementById('hero-3d-canvas');
    if (!heroCanvas) return;

    const parent = heroCanvas.parentElement;
    const width = parent.clientWidth || 360;
    const height = parent.clientHeight || 420;

    const renderer = new THREE.WebGLRenderer({
      canvas: heroCanvas,
      alpha: true,
      antialias: true
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.z = 180;

    // Group to hold all 3D components
    const cloudCoreGroup = new THREE.Group();
    scene.add(cloudCoreGroup);

    function updateCorePosition() {
      const isDesktop = window.innerWidth > 992;
      cloudCoreGroup.position.x = isDesktop ? -70 : 0;
    }
    updateCorePosition();

    // 1. Hologram Central Icosahedron (Cloud Core Node)
    const icosaGeo = new THREE.IcosahedronGeometry(36, 1);
    const icosaMat = new THREE.MeshBasicMaterial({
      color: 0xe2e8f0,
      wireframe: true,
      transparent: true,
      opacity: 0.7
    });
    const icosaCore = new THREE.Mesh(icosaGeo, icosaMat);
    cloudCoreGroup.add(icosaCore);

    // 2. Inner Glowing Octahedron
    const octGeo = new THREE.OctahedronGeometry(22, 0);
    const octMat = new THREE.MeshBasicMaterial({
      color: 0x94a3b8,
      wireframe: true,
      transparent: true,
      opacity: 0.85
    });
    const octCore = new THREE.Mesh(octGeo, octMat);
    cloudCoreGroup.add(octCore);

    // 3. Holographic Orbital Rings
    const ring1Geo = new THREE.TorusGeometry(52, 1.2, 8, 48);
    const ring1Mat = new THREE.MeshBasicMaterial({
      color: 0xcbd5e1,
      transparent: true,
      opacity: 0.45
    });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.rotation.x = Math.PI / 3;
    cloudCoreGroup.add(ring1);

    const ring2Geo = new THREE.TorusGeometry(62, 0.8, 8, 48);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: 0x64748b,
      transparent: true,
      opacity: 0.35
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.y = Math.PI / 4;
    ring2.rotation.x = -Math.PI / 6;
    cloudCoreGroup.add(ring2);

    // 4. Orbiting Satellite Nodes (representing EC2 / RDS / ALB packets)
    const satellites = [];
    const satCount = 4;
    for (let i = 0; i < satCount; i++) {
      const satGeo = new THREE.SphereGeometry(3.5, 8, 8);
      const satMat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0xffffff : 0x94a3b8,
        wireframe: false
      });
      const sat = new THREE.Mesh(satGeo, satMat);
      sat.userData = {
        radius: 68 + i * 8,
        speed: 0.8 + i * 0.3,
        angle: (i * Math.PI * 2) / satCount,
        inclination: (i * Math.PI) / 4
      };
      cloudCoreGroup.add(sat);
      satellites.push(sat);
    }

    // Interactive Hover & Tilt
    let targetRotX = 0;
    let targetRotY = 0;
    let rotX = 0;
    let rotY = 0;

    parent.addEventListener('mousemove', (e) => {
      const rect = parent.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      targetRotY = x * 1.5;
      targetRotX = y * 1.5;
    });

    parent.addEventListener('mouseleave', () => {
      targetRotX = 0;
      targetRotY = 0;
    });

    // Resize observer
    const resizeObserver = new ResizeObserver(() => {
      const w = parent.clientWidth || 360;
      const h = parent.clientHeight || 420;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      updateCorePosition();
    });
    resizeObserver.observe(parent);

    // Render loop
    const clock = new THREE.Clock();

    function renderHero() {
      requestAnimationFrame(renderHero);

      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Smooth tilt towards cursor
      rotX += (targetRotX - rotX) * 0.08;
      rotY += (targetRotY - rotY) * 0.08;

      cloudCoreGroup.rotation.x = rotX;
      cloudCoreGroup.rotation.y = rotY + time * 0.25;

      // Internal rotations
      icosaCore.rotation.x += delta * 0.4;
      icosaCore.rotation.y += delta * 0.6;

      octCore.rotation.x -= delta * 0.5;
      octCore.rotation.z += delta * 0.7;

      ring1.rotation.z += delta * 0.2;
      ring2.rotation.z -= delta * 0.25;

      // Orbit satellites
      satellites.forEach((sat) => {
        sat.userData.angle += delta * sat.userData.speed;
        const rad = sat.userData.radius;
        const ang = sat.userData.angle;
        const inc = sat.userData.inclination;

        sat.position.x = rad * Math.cos(ang);
        sat.position.y = rad * Math.sin(ang) * Math.cos(inc);
        sat.position.z = rad * Math.sin(ang) * Math.sin(inc);
      });

      renderer.render(scene, camera);
    }

    renderHero();
  }
})();

