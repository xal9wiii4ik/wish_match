function animate_counter(element_id, target, duration) {
    const element = document.getElementById(element_id);
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current);
    }, 16);
}

function show_auth_modal() {
    const modal = document.getElementById('authModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function close_auth_modal() {
    const modal = document.getElementById('authModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

function switch_tab(tab_name) {
    const tabs = document.querySelectorAll('.auth-tab');
    const login_form = document.getElementById('login-form');
    const register_form = document.getElementById('register-form');
    
    tabs.forEach(tab => tab.classList.remove('active'));
    
    if (tab_name === 'login') {
        tabs[0].classList.add('active');
        login_form.style.display = 'flex';
        register_form.style.display = 'none';
    } else {
        tabs[1].classList.add('active');
        login_form.style.display = 'none';
        register_form.style.display = 'flex';
    }
}

function start_exploring() {
    show_auth_modal();
    setTimeout(() => {
        create_notification('Начни свое путешествие! 🚀', 'success');
    }, 300);
}

function learn_more() {
    const features_section = document.getElementById('features');
    features_section.scrollIntoView({ behavior: 'smooth' });
    create_notification('Узнай больше о наших возможностях! ✨', 'info');
}

function create_notification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 16px 24px;
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        color: white;
        border-radius: 8px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        z-index: 3000;
        animation: slideIn 0.3s ease-out;
        max-width: 350px;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

const notification_styles = document.createElement('style');
notification_styles.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(notification_styles);

function add_parallax_effect() {
    const floating_cards = document.querySelectorAll('.floating-card');
    
    document.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 20;
        const y = (e.clientY / window.innerHeight - 0.5) * 20;
        
        floating_cards.forEach((card, index) => {
            const speed = (index + 1) * 0.5;
            card.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
        });
    });
}

function add_scroll_animations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeIn 1s ease-out';
                entry.target.style.opacity = '1';
            }
        });
    }, { threshold: 0.1 });
    
    const feature_cards = document.querySelectorAll('.feature-card');
    feature_cards.forEach(card => {
        card.style.opacity = '0';
        observer.observe(card);
    });
}

function create_particles() {
    const hero_section = document.querySelector('.hero');
    const particle_count = 30;
    
    for (let i = 0; i < particle_count; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.cssText = `
            position: absolute;
            width: 4px;
            height: 4px;
            background: rgba(99, 102, 241, 0.5);
            border-radius: 50%;
            pointer-events: none;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: particle-float ${5 + Math.random() * 10}s linear infinite;
            animation-delay: ${Math.random() * 5}s;
        `;
        hero_section.appendChild(particle);
    }
}

const particle_styles = document.createElement('style');
particle_styles.textContent = `
    @keyframes particle-float {
        0% {
            transform: translateY(0) translateX(0);
            opacity: 0;
        }
        10% {
            opacity: 1;
        }
        90% {
            opacity: 1;
        }
        100% {
            transform: translateY(-100vh) translateX(${Math.random() * 100 - 50}px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(particle_styles);

function add_navbar_scroll_effect() {
    const navbar = document.querySelector('.navbar');
    let last_scroll = 0;
    
    window.addEventListener('scroll', () => {
        const current_scroll = window.pageYOffset;
        
        if (current_scroll > 100) {
            navbar.style.background = 'rgba(15, 23, 42, 0.95)';
            navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
        } else {
            navbar.style.background = 'rgba(15, 23, 42, 0.9)';
            navbar.style.boxShadow = 'none';
        }
        
        last_scroll = current_scroll;
    });
}

document.addEventListener('DOMContentLoaded', () => {
    animate_counter('users-count', 1247, 2000);
    animate_counter('wishes-count', 3856, 2000);
    animate_counter('matches-count', 892, 2000);
    
    add_parallax_effect();
    add_scroll_animations();
    create_particles();
    add_navbar_scroll_effect();
    
    create_notification('Добро пожаловать в WishMatch! ✨', 'success');
    
    const modal = document.getElementById('authModal');
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            close_auth_modal();
        }
    });
});

window.showAuthModal = show_auth_modal;
window.closeAuthModal = close_auth_modal;
window.switchTab = switch_tab;
window.startExploring = start_exploring;
window.learnMore = learn_more;
