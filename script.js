document.addEventListener('DOMContentLoaded', () => {
    // Custom Cursor
    const cursor = document.querySelector('.cursor');
    const cursorFollower = document.querySelector('.cursor-follower');
    const links = document.querySelectorAll('a, .contact-btn');

    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;

    // Only activate custom cursor on non-touch devices
    if (window.matchMedia("(pointer: fine)").matches) {
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            // Move inner cursor instantly
            if (cursor) cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
        });

        // Smooth follow for outer cursor
        function animate() {
            followerX += (mouseX - followerX) * 0.15;
            followerY += (mouseY - followerY) * 0.15;
            
            if (cursorFollower) cursorFollower.style.transform = `translate3d(${followerX}px, ${followerY}px, 0)`;
            requestAnimationFrame(animate);
        }
        animate();

        // Hover effect on links
        links.forEach(link => {
            link.addEventListener('mouseenter', () => {
                if (cursorFollower) cursorFollower.classList.add('active');
            });
            link.addEventListener('mouseleave', () => {
                if (cursorFollower) cursorFollower.classList.remove('active');
            });
        });
    }

    // Intersection Observer for scroll animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add active class to reveal elements
                if (entry.target.classList.contains('reveal-up')) {
                    const delay = entry.target.getAttribute('data-delay') || 0;
                    entry.target.style.transitionDelay = `${delay}s`;
                    entry.target.classList.add('active');
                }
                
                // Animate progress bars
                if (entry.target.classList.contains('skill-item')) {
                    const progressBar = entry.target.querySelector('.progress');
                    const targetWidth = progressBar.getAttribute('data-width');
                    const delay = entry.target.getAttribute('data-delay') || 0;
                    
                    setTimeout(() => {
                        progressBar.style.width = targetWidth;
                    }, delay * 1000);
                }
                
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements
    const revealElements = document.querySelectorAll('.reveal-up, .skill-item');
    revealElements.forEach(el => observer.observe(el));

    // Simple Parallax Effect for Hero Title
    const heroTitle = document.querySelector('.hero-content');
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        if (scrollY < window.innerHeight && heroTitle) {
            heroTitle.style.transform = `translateY(${scrollY * 0.4}px)`;
        }
    });
});
