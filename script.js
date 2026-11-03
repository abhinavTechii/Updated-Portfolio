// ================= HELPERS =================

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const store = {
    get(key) { try { return localStorage.getItem(key); } catch { return null; } },
    set(key, value) { try { localStorage.setItem(key, value); } catch { /* storage unavailable */ } }
};

const prefersReducedMotion =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;


// ================= PRELOADER =================

const preloader = $(".preloader");
const hidePreloader = () => preloader?.classList.add("hide");

window.addEventListener("load", () => setTimeout(hidePreloader, 400));
setTimeout(hidePreloader, 4000); // fallback if a resource hangs


// ================= HEADER, PROGRESS BAR, BACK TO TOP =================

const header = $(".header");
const progress = $("#scroll-progress");
const backToTop = $(".back-to-top");

function onScroll() {
    const y = window.scrollY;
    header?.classList.toggle("scrolled", y > 50);
    backToTop?.classList.toggle("show", y > 500);

    if (progress) {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        progress.style.width = max > 0 ? `${(y / max) * 100}%` : "0";
    }
}

window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

backToTop?.addEventListener("click", () =>
    window.scrollTo({ top: 0, behavior: "smooth" })
);


// ================= MOBILE MENU =================

const menuBtn = $(".menu-btn");
const navMenu = $(".nav-menu");

function setMenu(open) {
    navMenu?.classList.toggle("open", open);
    menuBtn?.setAttribute("aria-expanded", String(open));
    menuBtn?.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    const icon = menuBtn?.querySelector("i");
    if (icon) icon.className = open ? "fa-solid fa-xmark" : "fa-solid fa-bars";
}

menuBtn?.addEventListener("click", () =>
    setMenu(!navMenu.classList.contains("open"))
);

$$(".nav-link").forEach(link =>
    link.addEventListener("click", () => setMenu(false))
);

document.addEventListener("keydown", e => {
    if (e.key === "Escape") setMenu(false);
});


// ================= ACTIVE NAV LINK =================

const sections = $$("main section[id]");
const navLinks = $$(".nav-link");

const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navLinks.forEach(link =>
            link.classList.toggle(
                "active",
                link.getAttribute("href") === `#${entry.target.id}`
            )
        );
    });
}, { rootMargin: "-45% 0px -50% 0px" });

sections.forEach(section => sectionObserver.observe(section));


// ================= THEME SWITCHER =================
// Dark is the default. The icon shows what you'll switch TO:
// sun while in dark mode, moon while in light mode.

const themeBtn = $(".theme-btn");

function applyTheme(theme) {
    const light = theme === "light";
    document.body.classList.toggle("light-theme", light);

    const icon = themeBtn?.querySelector("i");
    if (icon) icon.className = light ? "fa-solid fa-moon" : "fa-solid fa-sun";

    themeBtn?.setAttribute(
        "aria-label",
        light ? "Switch to dark theme" : "Switch to light theme"
    );

    $('meta[name="theme-color"]')
        ?.setAttribute("content", light ? "#f8fafc" : "#070b14");
}

themeBtn?.addEventListener("click", () => {
    const next = document.body.classList.contains("light-theme") ? "dark" : "light";
    applyTheme(next);
    store.set("theme", next);
});

applyTheme(store.get("theme") === "light" ? "light" : "dark");


// ================= TYPING EFFECT =================

const typingText = $(".typing-text");

const words = [
    "Full Stack Developer",
    "Java Developer",
    "Web Developer",
    "Software Developer"
];

let wordIndex = 0;
let charIndex = 0;
let deleting = false;

function typeEffect() {
    if (!typingText) return;

    const word = words[wordIndex];

    if (!deleting) {
        charIndex++;
        typingText.textContent = word.slice(0, charIndex);

        if (charIndex === word.length) {
            deleting = true;
            setTimeout(typeEffect, 1500);
            return;
        }
    } else {
        charIndex--;
        typingText.textContent = word.slice(0, charIndex);

        if (charIndex === 0) {
            deleting = false;
            wordIndex = (wordIndex + 1) % words.length;
        }
    }

    setTimeout(typeEffect, deleting ? 50 : 100);
}

if (typingText) {
    if (prefersReducedMotion) {
        typingText.textContent = words[0];
    } else {
        typeEffect();
    }
}


// ================= SCROLL REVEAL =================

const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("show");
        revealObserver.unobserve(entry.target);
    });
}, { threshold: 0.12 });

$$(".reveal").forEach(el => revealObserver.observe(el));


// ================= CONTACT FORM =================
// No backend, so the form opens the visitor's email app
// with the message pre-filled and addressed to you.

const contactForm = $(".contact-form");
const formStatus = $("#form-status");
const MY_EMAIL = "abhinavyadav84710@gmail.com";

function setStatus(text, type = "") {
    if (!formStatus) return;
    formStatus.textContent = text;
    formStatus.className = `form-status ${type}`.trim();
}

contactForm?.addEventListener("submit", e => {
    e.preventDefault();

    const data = new FormData(contactForm);
    const name = (data.get("name") || "").toString().trim();
    const email = (data.get("email") || "").toString().trim();
    const subject = (data.get("subject") || "").toString().trim();
    const message = (data.get("message") || "").toString().trim();

    if (!name || !subject || !message) {
        setStatus("Please fill in your name, subject and message.", "error");
        return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setStatus("Please enter a valid email address.", "error");
        return;
    }

    const body = `${message}\n\n— ${name} (${email})`;

    window.location.href =
        `mailto:${MY_EMAIL}?subject=${encodeURIComponent(subject)}` +
        `&body=${encodeURIComponent(body)}`;

    setStatus("Opening your email app. Press send there to deliver the message.", "ok");
    contactForm.reset();
});


// ================= CARD SPOTLIGHT =================

$$(".skill-category, .project-card, .certificate-card, .timeline-content").forEach(card => {
    card.addEventListener("pointermove", e => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${e.clientX - r.left}px`);
        card.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
});
