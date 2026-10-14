/* ===================================
   EL DIVÁN - JAVASCRIPT PRINCIPAL
   =================================== */

// ---- 1. PRELOADER + ANIMACIÓN INICIAL DEL HERO ----
window.addEventListener('load', () => {
    const tl = gsap.timeline();

    tl.to("#preloader", {
        yPercent: -100,
        duration: 1.2,
        ease: "power4.inOut",
        delay: 0.5
    })
    .from(".gsap-hero-badge", { y: 24, opacity: 0, duration: 0.8, ease: "back.out(2)" }, "-=0.3")
    .from(".gsap-hero-title", { y: 50, opacity: 0, duration: 1.1, ease: "power3.out" }, "-=0.6")
    .from(".gsap-hero-sub", { y: 20, opacity: 0, duration: 0.9, ease: "power3.out" }, "-=0.8")
    .from(".gsap-hero-text", { y: 20, opacity: 0, duration: 0.9, ease: "power3.out" }, "-=0.8")
    .from(".gsap-hero-btns", { y: 20, opacity: 0, duration: 0.9, ease: "power3.out" }, "-=0.7")
    .from(".gsap-hero-scroll", { opacity: 0, y: 10, duration: 0.8, ease: "power2.out" }, "-=0.4")
    .add(() => {
        // Iniciar typewriter tras la animación de entrada
        startTypewriter();
    }, "-=0.5");
});

// ---- 2. TYPEWRITER EFFECT ----
function startTypewriter() {
    const el = document.getElementById('typewriter-word');
    if (!el) return;

    const words = ['bienestar', 'cambio', 'equilibrio', 'crecimiento', 'propósito'];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function type() {
        const currentWord = words[wordIndex];

        if (!isDeleting) {
            el.textContent = currentWord.substring(0, charIndex + 1);
            charIndex++;
            if (charIndex === currentWord.length) {
                isDeleting = true;
                setTimeout(type, 1800);
                return;
            }
        } else {
            el.textContent = currentWord.substring(0, charIndex - 1);
            charIndex--;
            if (charIndex === 0) {
                isDeleting = false;
                wordIndex = (wordIndex + 1) % words.length;
            }
        }

        const speed = isDeleting ? 65 : 110;
        setTimeout(type, speed);
    }

    type();
}

// ---- 3. SCROLL PROGRESS BAR ----
const scrollBar = document.getElementById('scroll-progress');
window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (scrollTop / docHeight) * 100;
    if (scrollBar) scrollBar.style.width = progress + '%';
}, { passive: true });

// ---- 4. NAVBAR SCROLL ----
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
}, { passive: true });

// ---- 5. HERO PARALLAX ON SCROLL ----
const heroBg = document.getElementById('hero-bg');
if (heroBg) {
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        if (scrollY < window.innerHeight) {
            heroBg.style.transform = `translateY(${scrollY * 0.3}px)`;
        }
    }, { passive: true });
}

// ---- 6. MENÚ MÓVIL ----
const menuBtn = document.getElementById('menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const mobileLinks = document.querySelectorAll('.mobile-link');
let isMenuOpen = false;

menuBtn.addEventListener('click', () => {
    isMenuOpen = !isMenuOpen;
    if (isMenuOpen) {
        mobileMenu.classList.remove('translate-x-full');
        menuBtn.innerHTML = '<i class="ph ph-x"></i>';
        gsap.fromTo(mobileLinks,
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, delay: 0.2, ease: "power2.out" }
        );
    } else {
        mobileMenu.classList.add('translate-x-full');
        menuBtn.innerHTML = '<i class="ph ph-list"></i>';
    }
});

mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.add('translate-x-full');
        menuBtn.innerHTML = '<i class="ph ph-list"></i>';
        isMenuOpen = false;
    });
});

// ---- 7. CANVAS DE PARTÍCULAS (HERO) ----
const canvas = document.getElementById('hero-canvas');
const ctx = canvas.getContext('2d');
let canvasWidth, canvasHeight;
let particles = [];
let mouseX = 0;
let mouseY = 0;

window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
}, { passive: true });

function resizeCanvas() {
    canvasWidth = canvas.width = window.innerWidth;
    canvasHeight = canvas.height = window.innerHeight;
    initParticles();
}

class Particle {
    constructor() {
        this.reset();
    }
    reset() {
        this.x = Math.random() * canvasWidth;
        this.y = Math.random() * canvasHeight;
        this.vx = (Math.random() - 0.5) * 0.45;
        this.vy = (Math.random() - 0.5) * 0.45;
        this.radius = Math.random() * 2.5 + 0.5;
        this.alpha = Math.random() * 0.4 + 0.1;
    }
    update() {
        // Interacción suave con el mouse
        const dx = this.x - mouseX;
        const dy = this.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
            const force = (120 - dist) / 120;
            this.vx += (dx / dist) * force * 0.015;
            this.vy += (dy / dist) * force * 0.015;
        }

        // Fricción
        this.vx *= 0.995;
        this.vy *= 0.995;

        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > canvasWidth) this.vx *= -1;
        if (this.y < 0 || this.y > canvasHeight) this.vy *= -1;
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(240, 115, 38, ${this.alpha})`;
        ctx.fill();
    }
}

function initParticles() {
    particles = [];
    const num = window.innerWidth < 768 ? 65 : 130;
    for (let i = 0; i < num; i++) particles.push(new Particle());
}

function animateCanvas() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    particles.forEach(p => {
        p.update();
        p.draw();
    });

    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 140) {
                const opacity = (1 - dist / 140) * 0.12;
                ctx.beginPath();
                ctx.strokeStyle = `rgba(240, 115, 38, ${opacity})`;
                ctx.lineWidth = 0.8;
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }

    requestAnimationFrame(animateCanvas);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
animateCanvas();

// ---- 8. GSAP SCROLLTRIGGER ANIMACIONES ----
gsap.registerPlugin(ScrollTrigger);

// Fade up genérico
gsap.utils.toArray('.gsap-fade-up').forEach(el => {
    gsap.from(el, {
        scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none reverse" },
        y: 55,
        opacity: 0,
        duration: 1,
        ease: "power3.out"
    });
});

// Fade desde la izquierda
gsap.utils.toArray('.gsap-fade-left').forEach(el => {
    gsap.from(el, {
        scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none reverse" },
        x: -60,
        opacity: 0,
        duration: 1,
        ease: "power3.out"
    });
});

// Fade desde la derecha
gsap.utils.toArray('.gsap-fade-right').forEach(el => {
    gsap.from(el, {
        scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none reverse" },
        x: 60,
        opacity: 0,
        duration: 1,
        ease: "power3.out"
    });
});

// Scale in
gsap.utils.toArray('.gsap-scale-in').forEach(el => {
    gsap.from(el, {
        scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none reverse" },
        scale: 0.85,
        opacity: 0,
        duration: 1,
        ease: "back.out(1.5)"
    });
});

// Symptom cards — stagger
gsap.from(".symptom-card", {
    scrollTrigger: { trigger: ".symptom-card", start: "top 82%" },
    y: 50,
    opacity: 0,
    duration: 0.7,
    stagger: 0.09,
    ease: "back.out(1.4)"
});

// Service cards — stagger
gsap.utils.toArray('.service-card').forEach((card, i) => {
    gsap.from(card, {
        scrollTrigger: { trigger: card, start: "top 86%" },
        y: 80,
        opacity: 0,
        duration: 1,
        delay: i * 0.15,
        ease: "power4.out"
    });
});

// Stats — counter animation
gsap.utils.toArray('.stat-counter').forEach(el => {
    const target = parseFloat(el.getAttribute('data-target'));
    const isFloat = el.getAttribute('data-float') === 'true';
    const suffix = el.getAttribute('data-suffix') || '';
    const prefix = el.getAttribute('data-prefix') || '';

    ScrollTrigger.create({
        trigger: el,
        start: "top 85%",
        once: true,
        onEnter: () => {
            gsap.to({ val: 0 }, {
                val: target,
                duration: 2.2,
                ease: "power2.out",
                onUpdate: function () {
                    const v = this.targets()[0].val;
                    el.textContent = prefix + (isFloat ? v.toFixed(1) : Math.floor(v)) + suffix;
                }
            });
        }
    });
});

// Process steps — stagger
gsap.utils.toArray('.process-step').forEach((step, i) => {
    gsap.from(step, {
        scrollTrigger: { trigger: step, start: "top 86%" },
        y: 60,
        opacity: 0,
        duration: 0.9,
        delay: i * 0.18,
        ease: "power3.out"
    });
});

// Process line draw
const processLine = document.getElementById('process-line');
if (processLine) {
    gsap.from(processLine, {
        scrollTrigger: { trigger: processLine, start: "top 80%" },
        scaleX: 0,
        transformOrigin: "left center",
        duration: 1.8,
        ease: "power2.out"
    });
}

// Testimonial cards — stagger
gsap.utils.toArray('.testimonial-card').forEach((card, i) => {
    gsap.from(card, {
        scrollTrigger: { trigger: card, start: "top 88%" },
        y: 50,
        opacity: 0,
        duration: 0.9,
        delay: i * 0.15,
        ease: "power3.out"
    });
});

// FAQ items — stagger
gsap.utils.toArray('.faq-item').forEach((item, i) => {
    gsap.from(item, {
        scrollTrigger: { trigger: item, start: "top 90%" },
        x: -30,
        opacity: 0,
        duration: 0.7,
        delay: i * 0.08,
        ease: "power2.out"
    });
});

// Marquee keywords section
gsap.from(".marquee-wrapper", {
    scrollTrigger: { trigger: ".marquee-wrapper", start: "top 90%" },
    opacity: 0,
    duration: 1,
    ease: "power2.out"
});

// Testimonials section heading clip-path reveal
gsap.utils.toArray('.gsap-clip-reveal').forEach(el => {
    gsap.from(el, {
        scrollTrigger: { trigger: el, start: "top 85%" },
        clipPath: "inset(100% 0% 0% 0%)",
        opacity: 0,
        duration: 1.2,
        ease: "power4.out"
    });
});

// Imagen flotante modalidad — parallax suave
gsap.to(".modalidad-img", {
    scrollTrigger: {
        trigger: ".modalidad-img",
        start: "top bottom",
        end: "bottom top",
        scrub: 1.5
    },
    y: -40,
    ease: "none"
});

// Quote texto filosofía — reveal staggered por palabras (simulado)
gsap.from(".filosofia-quote", {
    scrollTrigger: { trigger: ".filosofia-quote", start: "top 82%" },
    y: 40,
    opacity: 0,
    duration: 1.4,
    ease: "power3.out"
});

// CTA contacto — scale in + slide
gsap.from(".contacto-card", {
    scrollTrigger: { trigger: ".contacto-card", start: "top 85%" },
    y: 60,
    opacity: 0,
    scale: 0.97,
    duration: 1.2,
    ease: "power3.out"
});

// ---- 9. FAQ ACCORDION ----
document.querySelectorAll('.faq-item').forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    const content = item.querySelector('.faq-content');

    trigger.addEventListener('click', () => {
        const isActive = item.classList.contains('faq-active');

        // Cerrar todos
        document.querySelectorAll('.faq-item').forEach(other => {
            other.classList.remove('faq-active');
            other.querySelector('.faq-content').classList.remove('faq-open');
        });

        // Abrir el actual si no estaba activo
        if (!isActive) {
            item.classList.add('faq-active');
            content.classList.add('faq-open');
        }
    });
});

// ---- 10. FORMULARIO A WHATSAPP ----
const waForm = document.getElementById('wa-form');
if (waForm) {
    waForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const name = document.getElementById('wa-name').value;
        const service = document.getElementById('wa-service').value;
        const message = document.getElementById('wa-message').value;
        const phone = "520000000000";

        let text = `Hola, mi nombre es *${name}*.\n\n`;
        text += `Estoy interesado/a en iniciar un proceso de *${service}*.\n\n`;
        if (message) text += `Comentario adicional: "${message}"\n\n`;
        text += `¿Me podrían dar más información sobre agendas y costos?`;

        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
    });
}
