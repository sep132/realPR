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

    // --- Guestbook (Board) Logic ---
    const boardForm = document.getElementById('board-form');
    const boardList = document.getElementById('board-list');
    
    // Key for localStorage
    const STORAGE_KEY = 'portfolio_guestbook';

    // Load messages from localStorage
    function loadMessages() {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    }

    // Save messages to localStorage
    function saveMessages(messages) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }

    // Escape HTML to prevent XSS
    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }

    // Render a single message element
    function createMessageElement(msg) {
        const div = document.createElement('div');
        // Initial state for animation if rendered later, but for simplicity let's just make it active if it's already rendered
        div.className = 'board-item reveal-up active'; 
        
        div.innerHTML = `
            <div class="action-btns">
                <button class="action-btn edit-btn" data-id="${msg.id}">수정</button>
                <button class="action-btn delete-btn" data-id="${msg.id}">삭제</button>
            </div>
            <div class="board-header">
                <span class="board-name">${escapeHTML(msg.name)}</span>
                <span class="board-date">${msg.date}${msg.edited ? ' (수정됨)' : ''}</span>
            </div>
            <div class="board-content">${escapeHTML(msg.message)}</div>
            <div class="edit-area">
                <textarea class="edit-textarea" style="width: 100%; background: transparent; border: none; border-bottom: 2px solid var(--accent-color); color: #f4f4f4; padding: 1rem 0; font-size: 1.1rem; font-family: inherit; resize: vertical;" rows="3">${escapeHTML(msg.message)}</textarea>
                <div class="edit-btns">
                    <button class="action-submit-btn save-edit-btn">저장</button>
                    <button class="action-submit-btn cancel-btn">취소</button>
                </div>
            </div>
        `;

        const deleteBtn = div.querySelector('.delete-btn');
        const editBtn = div.querySelector('.edit-btn');
        const editArea = div.querySelector('.edit-area');
        const boardContent = div.querySelector('.board-content');
        const cancelBtn = div.querySelector('.cancel-btn');
        const saveEditBtn = div.querySelector('.save-edit-btn');
        const editTextArea = div.querySelector('.edit-textarea');

        // Handle delete
        deleteBtn.addEventListener('click', () => {
            const pwd = prompt('비밀번호를 입력하세요:');
            if (pwd === null) return;
            
            if (pwd === msg.password) {
                let messages = loadMessages();
                messages = messages.filter(m => m.id !== msg.id);
                saveMessages(messages);
                renderAllMessages();
            } else {
                alert('비밀번호가 일치하지 않습니다.');
            }
        });

        // Handle edit toggle
        editBtn.addEventListener('click', () => {
            const pwd = prompt('수정하려면 비밀번호를 입력하세요:');
            if (pwd === null) return;

            if (pwd === msg.password) {
                boardContent.style.display = 'none';
                editArea.style.display = 'flex';
                editTextArea.value = msg.message; // Reset to current message
            } else {
                alert('비밀번호가 일치하지 않습니다.');
            }
        });

        // Handle edit cancel
        cancelBtn.addEventListener('click', () => {
            boardContent.style.display = 'block';
            editArea.style.display = 'none';
        });

        // Handle edit save
        saveEditBtn.addEventListener('click', () => {
            const newContent = editTextArea.value.trim();
            if (!newContent) {
                alert('내용을 입력해주세요.');
                return;
            }

            let messages = loadMessages();
            const msgIndex = messages.findIndex(m => m.id === msg.id);
            if (msgIndex !== -1) {
                messages[msgIndex].message = newContent;
                messages[msgIndex].edited = true;
                saveMessages(messages);
                renderAllMessages();
            }
        });

        // Add hover effects for custom cursor
        if (window.matchMedia("(pointer: fine)").matches && cursorFollower) {
            const btns = [deleteBtn, editBtn, cancelBtn, saveEditBtn];
            btns.forEach(btn => {
                btn.addEventListener('mouseenter', () => cursorFollower.classList.add('active'));
                btn.addEventListener('mouseleave', () => cursorFollower.classList.remove('active'));
            });
        }

        return div;
    }

    // Render all messages
    function renderAllMessages() {
        if (!boardList) return;
        boardList.innerHTML = '';
        const messages = loadMessages();
        
        if (messages.length === 0) {
            boardList.innerHTML = '<p style="color: #666; font-size: 1.1rem; text-align: center; padding: 2rem 0;">등록된 방명록이 없습니다. 첫 번째 글을 남겨주세요!</p>';
            return;
        }

        // Show newest first
        messages.slice().reverse().forEach(msg => {
            boardList.appendChild(createMessageElement(msg));
        });
    }

    // Handle form submit
    if (boardForm) {
        boardForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const nameInput = document.getElementById('board-name');
            const passwordInput = document.getElementById('board-password');
            const messageInput = document.getElementById('board-message');

            const newMsg = {
                id: Date.now().toString(),
                name: nameInput.value.trim(),
                password: passwordInput.value,
                message: messageInput.value.trim(),
                date: new Date().toLocaleDateString('ko-KR', { 
                    year: 'numeric', month: '2-digit', day: '2-digit',
                    hour: '2-digit', minute: '2-digit'
                })
            };

            if (!newMsg.name || !newMsg.password || !newMsg.message) {
                alert('모든 필드를 입력해주세요.');
                return;
            }

            const messages = loadMessages();
            messages.push(newMsg);
            saveMessages(messages);
            
            // Reset form
            boardForm.reset();
            
            // Re-render
            renderAllMessages();
        });

        // Initial render
        renderAllMessages();
        
        // Add submit button to links list for hover effect
        const submitBtn = document.querySelector('.submit-btn');
        if (window.matchMedia("(pointer: fine)").matches && cursorFollower && submitBtn) {
            submitBtn.addEventListener('mouseenter', () => cursorFollower.classList.add('active'));
            submitBtn.addEventListener('mouseleave', () => cursorFollower.classList.remove('active'));
        }
    }
});
