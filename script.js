// script.js

// Registra plugins do GSAP
gsap.registerPlugin(ScrollTrigger, TextPlugin);

document.addEventListener('DOMContentLoaded', () => {
    // =========================
    // Fundo de partículas Three.js
    // =========================
    let scene, camera, renderer, particles, particleMaterial;
    const moodCanvas = document.getElementById('mood-canvas');

    function initThreeJS() {
        // Cria cena, câmera e renderer
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        renderer = new THREE.WebGLRenderer({ canvas: moodCanvas, alpha: true, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);

        // Cria partículas e velocidades
        const particleCount = 150;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 10;
            positions[i + 1] = (Math.random() - 0.5) * 10;
            positions[i + 2] = (Math.random() - 0.5) * 10;
            velocities[i] = (Math.random() - 0.5) * 0.1;
            velocities[i + 1] = (Math.random() - 0.5) * 0.1;
            velocities[i + 2] = (Math.random() - 0.5) * 0.1;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
        particleMaterial = new THREE.PointsMaterial({
            color: 0x4fc3f7,
            size: 0.05,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });
        particles = new THREE.Points(geometry, particleMaterial);
        scene.add(particles);
        camera.position.z = 5;

        // Atualiza tamanho do renderer ao redimensionar janela
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    function animateThreeJS() {
        // Anima partículas Three.js
        requestAnimationFrame(animateThreeJS);
        const positions = particles.geometry.attributes.position.array;
        const velocities = particles.geometry.attributes.velocity.array;

        for (let i = 0; i < positions.length; i += 3) {
            positions[i] += velocities[i];
            positions[i + 1] += velocities[i + 1];
            positions[i + 2] += velocities[i + 2];
            // Rebote nas bordas
            if (positions[i] > 5) positions[i] = -5;
            if (positions[i] < -5) positions[i] = 5;
            if (positions[i + 1] > 5) positions[i + 1] = -5;
            if (positions[i + 1] < -5) positions[i + 1] = 5;
            if (positions[i + 2] > 5) positions[i + 2] = -5;
            if (positions[i + 2] < -5) positions[i + 2] = 5;
        }

        particles.geometry.attributes.position.needsUpdate = true;
        particles.rotation.x += 0.0005;
        particles.rotation.y += 0.001;
        renderer.render(scene, camera);
    }

    initThreeJS();
    animateThreeJS();

    // =========================
    // Menu holográfico e cursor customizado
    // =========================
    const cursor = document.querySelector('.hologram-cursor');
    const cursorFollower = document.querySelector('.hologram-cursor-follower');
    const menuItems = document.querySelectorAll('.hologram-item');
    const connectors = document.querySelectorAll('.hologram-connector');

    // Anima cursor e seguidor
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
        gsap.to(cursorFollower, { left: e.clientX, top: e.clientY, duration: 0.5, ease: 'power2.out' });
    });

    // Efeitos ao passar mouse nos itens do menu
    menuItems.forEach((item, index) => {
        item.addEventListener('mouseenter', () => {
            gsap.to(cursor, { scale: 2, backgroundColor: 'rgba(79, 195, 247, 0.8)', duration: 0.3 });
            gsap.to(cursorFollower, { scale: 0.5, borderColor: 'rgba(79, 195, 247, 0.8)', duration: 0.3 });
            const itemRect = item.getBoundingClientRect();
            const itemCenter = { x: itemRect.left + itemRect.width / 2, y: itemRect.top + itemRect.height / 2 };
            gsap.to(connectors[index], {
                width: Math.sqrt(Math.pow(itemCenter.x - cursor.offsetLeft, 2) + Math.pow(itemCenter.y - cursor.offsetTop, 2)),
                rotation: Math.atan2(cursor.offsetTop - itemCenter.y, cursor.offsetLeft - itemCenter.x) * (180 / Math.PI),
                opacity: 1,
                duration: 0.3
            });
        });

        item.addEventListener('mouseleave', () => {
            gsap.to(cursor, { scale: 1, backgroundColor: 'rgba(79, 195, 247, 0.5)', duration: 0.3 });
            gsap.to(cursorFollower, { scale: 1, borderColor: 'rgba(79, 195, 247, 0.3)', duration: 0.3 });
            gsap.to(connectors[index], { opacity: 0, duration: 0.3 });
        });

        // Clique no menu faz scroll suave para a seção
        item.addEventListener('click', () => {
            menuItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            gsap.to(item, { scale: 1.2, duration: 0.2, yoyo: true, repeat: 1, ease: 'power2.inOut' });
            const target = item.getAttribute('data-section');
            const section = document.getElementById(target);
            if (section) {
                window.scrollTo({ top: section.offsetTop, behavior: 'smooth' });
            }
        });
    });

    // Sincroniza menu com scroll da página
    gsap.utils.toArray('section').forEach(section => {
        ScrollTrigger.create({
            trigger: section,
            start: 'top center',
            end: 'bottom center',
            onToggle: self => {
                if (self.isActive) {
                    menuItems.forEach(item => item.classList.remove('active'));
                    const targetSectionId = section.id;
                    const correspondingItem = document.querySelector(`.hologram-item[data-section="${targetSectionId}"]`);
                    if (correspondingItem) {
                        correspondingItem.classList.add('active');
                    }
                }
            }
        });
    });

    // =========================
    // Partículas DOM holográficas (efeito visual extra)
    // =========================
    const domParticles = [];
    const particleCount = 30;
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'hologram-particle';
        document.body.appendChild(particle);
        domParticles.push({
            element: particle,
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            size: Math.random() * 3 + 1,
            speed: Math.random() * 0.5 + 0.1,
            angle: Math.random() * Math.PI * 2
        });
        gsap.set(particle, {
            position: 'fixed',
            width: '2px',
            height: '2px',
            backgroundColor: 'rgba(79, 195, 247, 0.5)',
            borderRadius: '50%',
            pointerEvents: 'none',
            zIndex: 0
        });
    }

    // Anima partículas DOM
    function animateParticles() {
        domParticles.forEach(particle => {
            particle.x += Math.cos(particle.angle) * particle.speed;
            particle.y += Math.sin(particle.angle) * particle.speed;
            // Rebote nas bordas da tela
            if (particle.x < 0 || particle.x > window.innerWidth) particle.angle = Math.PI - particle.angle;
            if (particle.y < 0 || particle.y > window.innerHeight) particle.angle = -particle.angle;
            gsap.set(particle.element, {
                left: particle.x + 'px',
                top: particle.y + 'px',
                width: particle.size + 'px',
                height: particle.size + 'px'
            });
        });
        requestAnimationFrame(animateParticles);
    }

    animateParticles();

    // =========================
    // Animação da seção Hero
    // =========================
    gsap.set(".hero", { opacity: 0, y: 60 });
    gsap.set(".hero h1", { opacity: 0, y: 30, rotationX: -40, perspective: 1000, transformOrigin: "center" });
    const heroTimeline = gsap.timeline({ defaults: { ease: "power3.out" } });
    heroTimeline.to(".hero", { opacity: 1, y: 0, duration: 1.2 });
    heroTimeline.to(".hero h1", { opacity: 1, y: 0, rotationX: 0, duration: 1.4 }, "-=0.7");
    heroTimeline.to(".hero h1", { rotationY: 40, duration: 2, ease: "power1.inOut", repeat: -1, yoyo: true });
    gsap.set(".hero p", { opacity: 0, xPercent: 100 });
    const heroPTimeline = gsap.timeline({ repeat: -1, delay: 1.5 });
    heroPTimeline
        .fromTo(".hero p", { opacity: 0, xPercent: 100 }, { opacity: 1, xPercent: 0, duration: 1.5, ease: "power2.out" })
        .to(".hero p", { duration: 2 })
        .to(".hero p", { opacity: 0, xPercent: -100, duration: 1.5, ease: "power2.in" })
        .to(".hero p", { xPercent: 100, duration: 0 }, 0);

    // =========================
    // VanillaTilt nos cards de projeto
    // =========================
    VanillaTilt.init(document.querySelectorAll(".project-card"), {
        max: 18,
        speed: 600,
        glare: true,
        "max-glare": 0.4,
        gyroscope: true,
    });

    // =========================
    // Animação dos títulos das seções
    // =========================
    gsap.utils.toArray('.section-title').forEach(title => {
        gsap.set(title, { opacity: 0, y: 20 });
        ScrollTrigger.create({
            trigger: title,
            start: "top 90%",
            end: "bottom top",
            onEnter: () => gsap.to(title, { opacity: 1, y: 0, duration: 1.2, ease: "elastic.out(1, 0.5)" }),
            onLeaveBack: () => gsap.to(title, { opacity: 0, y: 20, duration: 0.6, ease: "power2.in" })
        });
    });

    // =========================
    // Efeito de digitação no terminal da seção Sobre
    // =========================
    const terminalElement = document.querySelector('#sobre .terminal');
    const terminalLines = document.querySelectorAll('#sobre .terminal-line');
    gsap.set(terminalElement, { opacity: 0, y: 30 });
    terminalLines.forEach(line => gsap.set(line, { opacity: 0 }));
    ScrollTrigger.create({
        trigger: terminalElement,
        start: "top 80%",
        onEnter: () => {
            gsap.to(terminalElement, { opacity: 1, y: 0, duration: 1, ease: "power2.out" });
            // Função recursiva para digitar linha por linha
            function typeLine(index) {
                if (index >= terminalLines.length) return;
                const line = terminalLines[index];
                const originalText = line.textContent.trim();
                line.innerHTML = '';
                const span = document.createElement('span');
                span.className = 'visible-text';
                line.appendChild(span);
                const cursor = document.createElement('span');
                cursor.className = 'cursor';
                cursor.textContent = '|';
                line.appendChild(cursor);
                gsap.to(line, { opacity: 1, duration: 0.4 });
                let i = 0;
                function typeChar() {
                    if (i <= originalText.length) {
                        span.textContent = originalText.slice(0, i);
                        i++;
                        const delay = Math.random() * 80 + 30;
                        setTimeout(typeChar, delay);
                    } else {
                        cursor.remove();
                        setTimeout(() => typeLine(index + 1), 500);
                    }
                }
                typeChar();
            }
            typeLine(0);
        },
        onLeaveBack: () => {
            gsap.to(terminalElement, { opacity: 0, y: 30, duration: 0.8, ease: "power2.in" });
            terminalLines.forEach(line => {
                const span = line.querySelector('.visible-text');
                const cursor = line.querySelector('.cursor');
                if (span) span.textContent = "";
                if (!cursor) {
                    const newCursor = document.createElement('span');
                    newCursor.className = 'cursor';
                    newCursor.textContent = '|';
                    line.appendChild(newCursor);
                }
                gsap.set(line, { opacity: 0 });
            });
        }
    });

    // =========================
    // Card flip na seção Sobre
    // =========================
    const sobreCard = document.getElementById('sobreCard');
    let flipTimeout;
    sobreCard.addEventListener('click', () => {
        sobreCard.classList.toggle('flipped');
        clearTimeout(flipTimeout);
        if (sobreCard.classList.contains('flipped')) {
            flipTimeout = setTimeout(() => sobreCard.classList.remove('flipped'), 5000);
        }
    });

    // =========================
    // Animação dos cards de projeto no grid
    // =========================
    gsap.utils.toArray('.project-card').forEach((card, i) => {
        gsap.set(card, { opacity: 0, scale: 0.9, y: 20 });
        ScrollTrigger.create({
            trigger: card,
            start: "top 80%",
            end: "bottom top",
            onEnter: () => gsap.to(card, { opacity: 1, scale: 1, y: 0, duration: 1, delay: i * 0.15, ease: "back.out(1.7)" }),
            onLeaveBack: () => gsap.to(card, { opacity: 0, scale: 0.9, y: 20, duration: 0.5, ease: "power1.in" })
        });
    });

    // =========================
    // Animação do container de skills
    // =========================
    const skillsContainer = document.querySelector(".skills-container");
    if (skillsContainer) {
        gsap.set(skillsContainer, { opacity: 0, y: 30 });
        ScrollTrigger.create({
            trigger: skillsContainer,
            start: "top 80%",
            end: "bottom top",
            onEnter: () => {
                gsap.to(skillsContainer, { opacity: 1, y: 0, duration: 1, ease: "power2.out" });
                gsap.utils.toArray('.skill-progress').forEach(bar => {
                    gsap.to(bar, { width: bar.dataset.width, duration: 1.8, ease: "power3.out" });
                });
            },
            onLeaveBack: () => {
                gsap.to(skillsContainer, { opacity: 0, y: 30, duration: 0.6, ease: "power2.in" });
                gsap.utils.toArray('.skill-progress').forEach(bar => {
                    gsap.to(bar, { width: '0%', duration: 0.6, ease: "power2.in" });
                });
            }
        });
    }

    // =========================
    // Animação dos itens da timeline
    // =========================
    gsap.utils.toArray('.timeline-item').forEach((item, i) => {
        gsap.set(item, { opacity: 0, x: i % 2 === 0 ? -50 : 50 });
        ScrollTrigger.create({
            trigger: item,
            start: "top 85%",
            end: "bottom top",
            onEnter: () => gsap.to(item, { opacity: 1, x: 0, duration: 1, delay: i * 0.3, ease: "power3.out" }),
            onLeaveBack: () => gsap.to(item, { opacity: 0, x: i % 2 === 0 ? -50 : 50, duration: 0.6, ease: "power2.in" })
        });
    });

    // =========================
    // Animação do formulário blueprint
    // =========================
    const blueprintForm = document.querySelector(".blueprint-form");
    if (blueprintForm) {
        gsap.set(blueprintForm, { opacity: 0, y: 50 });
        ScrollTrigger.create({
            trigger: blueprintForm,
            start: "top bottom",
            end: "bottom top",
            onEnter: () => {
                gsap.to(blueprintForm, {
                    opacity: 1,
                    y: 0,
                    duration: 1.2,
                    ease: "power2.out",
                    onComplete: () => {
                        gsap.utils.toArray(".form-group").forEach((group, i) => {
                            gsap.from(group, { opacity: 0, y: 20, duration: 0.6, delay: i * 0.2, ease: "back.out(1.2)" });
                        });
                    }
                });
            },
            onLeaveBack: () => {
                gsap.to(blueprintForm, { opacity: 0, y: 50, duration: 0.8, ease: "power2.in" });
                gsap.utils.toArray(".form-group").forEach((group, i) => {
                    gsap.to(group, { opacity: 0, y: 20, duration: 0.4, delay: (gsap.utils.toArray(".form-group").length - 1 - i) * 0.1, ease: "power1.in" });
                });
            }
        });
    }

    // =========================
    // Validação do formulário
    // =========================
    const form = document.querySelector('.blueprint-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        let isValid = true;
        const inputs = form.querySelectorAll('.form-input');
        inputs.forEach(input => {
            const errorMessage = input.nextElementSibling;
            if (!input.value.trim()) {
                input.classList.add('invalid');
                errorMessage.style.display = 'block';
                isValid = false;
            } else {
                input.classList.remove('invalid');
                errorMessage.style.display = 'none';
            }
            if (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
                input.classList.add('invalid');
                errorMessage.style.display = 'block';
                isValid = false;
            }
        });
        if (isValid) {
            alert('Formulário enviado com sucesso!');
            form.reset();
        }
    });

    // =========================
    // Animação dos links sociais
    // =========================
    const socialLinks = document.querySelector(".social-links");
    if (socialLinks) {
        gsap.set(socialLinks, { opacity: 0, y: 30 });
        ScrollTrigger.create({
            trigger: socialLinks,
            start: "top bottom",
            end: "bottom top",
            onEnter: () => gsap.to(socialLinks, { opacity: 1, y: 0, duration: 1, ease: "power2.out" }),
            onLeaveBack: () => gsap.to(socialLinks, { opacity: 0, y: 30, duration: 0.6, ease: "power2.in" })
        });
    }

    // =========================
    // Dots de navegação lateral
    // =========================
    const sections = gsap.utils.toArray('section');
    const navDots = gsap.utils.toArray('.nav-dot');
    sections.forEach(section => {
        ScrollTrigger.create({
            trigger: section,
            start: "top center",
            end: "bottom center",
            onToggle: self => {
                if (self.isActive) {
                    navDots.forEach(dot => dot.classList.remove('active'));
                    const targetSectionId = section.id;
                    const correspondingDot = document.querySelector(`.nav-dot[data-section="${targetSectionId}"]`);
                    if (correspondingDot) {
                        correspondingDot.classList.add('active');
                    }
                }
            }
        });
    });

    // Clique nos dots faz scroll suave para a seção
    navDots.forEach(dot => {
        dot.addEventListener('click', () => {
            const target = dot.getAttribute('data-section');
            const section = document.getElementById(target);
            if (section) {
                window.scrollTo({ top: section.offsetTop, behavior: 'smooth' });
            }
        });
    });

    // =========================
    // Selector de humor (muda cor e velocidade das partículas)
    // =========================
    window.setMood = function (mood) {
        document.body.className = '';
        const moodSelector = document.getElementById('mood-selector');
        moodSelector.className = 'mood-selector';
        if (mood) {
            document.body.classList.add(mood);
            moodSelector.classList.add(`${mood}-text`);
        }
        let colorTarget, speedMultiplier;
        switch (mood) {
            case 'calmo':
                colorTarget = new THREE.Color('#a1c4fd');
                speedMultiplier = 0.4;
                break;
            case 'criativo':
                colorTarget = new THREE.Color('#a6c1ee');
                speedMultiplier = 1.8;
                break;
            case 'cansado':
                colorTarget = new THREE.Color('#434343');
                speedMultiplier = 0.2;
                break;
            case 'feliz':
                colorTarget = new THREE.Color('#fddb92');
                speedMultiplier = 2.5;
                break;
            case 'reflexivo':
                colorTarget = new THREE.Color('#355c7d');
                speedMultiplier = 0.6;
                break;
            default:
                colorTarget = new THREE.Color(0x4fc3f7);
                speedMultiplier = 1.0;
        }
        // Anima cor das partículas Three.js
        gsap.to(particleMaterial.color, { r: colorTarget.r, g: colorTarget.g, b: colorTarget.b, duration: 1.5, ease: "power2.inOut" });
        // Anima cor das partículas DOM
        gsap.to('.hologram-particle', { backgroundColor: `rgb(${colorTarget.r * 255}, ${colorTarget.g * 255}, ${colorTarget.b * 255})`, duration: 1.5, ease: "power2.inOut" });
        // Ajusta velocidade das partículas Three.js
        const velocitiesAttribute = particles.geometry.attributes.velocity;
        const velocities = velocitiesAttribute.array;
        for (let i = 0; i < velocities.length; i++) {
            velocities[i] = (velocities[i] / Math.abs(velocities[i] || 1)) * (Math.random() * 0.1 + 0.05) * speedMultiplier;
        }
        velocitiesAttribute.needsUpdate = true;
    };

    // =========================
    // Animação do botão de submit do formulário
    // =========================
    const formSubmitButton = document.querySelector('.form-submit');
    if (formSubmitButton) {
        formSubmitButton.addEventListener('mouseenter', () => {
            anime({ targets: formSubmitButton, scale: [1, 1.05], duration: 300, easing: 'easeOutQuad' });
        });
        formSubmitButton.addEventListener('mouseleave', () => {
            anime({ targets: formSubmitButton, scale: [1.05, 1], duration: 200, easing: 'easeOutQuad' });
        });
    }

    // Define humor inicial
    setMood('');
});

// =========================
// Animação de fade nas seções ao entrar na tela
// =========================
gsap.utils.toArray('section').forEach((sec, i) => {
    gsap.from(sec, {
        opacity: 0,
        y: 50,
        duration: 1,
        delay: i * 0.1,
        scrollTrigger: { trigger: sec, start: "top 80%" }
    });
});
