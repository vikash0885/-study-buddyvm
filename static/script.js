document.addEventListener('DOMContentLoaded', () => {
    // Particle Background Logic
    const canvas = document.getElementById('bg-canvas');
    const ctx = canvas.getContext('2d');
    let particles = [];

    const resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resize);
    resize();

    const colors = ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe'];

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 3 + 1;
            this.speedX = Math.random() * 0.4 - 0.2;
            this.speedY = Math.random() * 0.4 - 0.2;
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.opacity = Math.random() * 0.5 + 0.1;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            if (this.x > canvas.width) this.x = 0;
            if (this.x < 0) this.x = canvas.width;
            if (this.y > canvas.height) this.y = 0;
            if (this.y < 0) this.y = canvas.height;
        }

        draw() {
            ctx.fillStyle = this.color;
            ctx.globalAlpha = this.opacity;
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
        }
    }

    const initParticles = () => {
        particles = [];
        const count = 120;
        for (let i = 0; i < count; i++) {
            particles.push(new Particle());
        }
    };

    const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animate);
    };

    initParticles();
    animate();

    const authSection = document.getElementById('auth-section');
    const loginBox = document.getElementById('login-box');
    const signupBox = document.getElementById('signup-box');
    const mainApp = document.getElementById('main-app');
    const displayUsername = document.getElementById('display-username');

    // Check if user is already logged in
    const savedUser = localStorage.getItem('studyUser');
    if (savedUser) {
        authSection.classList.add('hidden');
        mainApp.classList.remove('hidden');
        displayUsername.innerText = `Hi, ${savedUser}`;
    }

    // Toggle between Login and Signup
    window.toggleAuth = (mode) => {
        if (mode === 'signup') {
            loginBox.classList.add('hidden');
            signupBox.classList.remove('hidden');
        } else {
            signupBox.classList.add('hidden');
            loginBox.classList.remove('hidden');
        }
    };

    // Login Function
    window.handleLogin = async () => {
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        if (!username || !password) return alert('Please enter both username and password');

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await response.json();

            if (data.success) {
                localStorage.setItem('studyUser', data.username);
                displayUsername.innerText = `Hi, ${data.username}`;
                authSection.classList.add('hidden');
                mainApp.classList.remove('hidden');
            } else {
                alert(data.error);
            }
        } catch (error) {
            alert('Login failed. Please try again.');
        }
    };

    // Signup Function
    window.handleSignup = async () => {
        const username = document.getElementById('signup-username').value;
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm-password').value;

        if (!username || !password || !confirmPassword) return alert('Please fill in all fields');
        if (password !== confirmPassword) return alert('Passwords do not match');

        try {
            const response = await fetch('/api/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await response.json();

            if (data.success) {
                alert(data.message);
                toggleAuth('login');
            } else {
                alert(data.error);
            }
        } catch (error) {
            alert('Signup failed. Please try again.');
        }
    };

    // Logout Function
    window.handleLogout = () => {
        localStorage.removeItem('studyUser');
        authSection.classList.remove('hidden');
        mainApp.classList.add('hidden');
    };

    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const loading = document.getElementById('loading');
    const resultContainer = document.getElementById('result-container');
    const resultContent = document.getElementById('result-content');

    // Tab Switching Logic
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.tab;

            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById(target).classList.add('active');

            // Hide result when switching tabs
            resultContainer.classList.add('hidden');

            // Load history if that tab is selected
            if (target === 'history') {
                loadHistory();
            }
        });
    });

    // Helper to show/hide loading
    const showLoading = (show) => {
        if (show) {
            loading.classList.remove('hidden');
            resultContainer.classList.add('hidden');
        } else {
            loading.classList.add('hidden');
        }
    };

    // Helper to animate text output
    const animateTextOutput = (text, container) => {
        container.innerHTML = ''; // Clear previous content

        // Parse markdown to HTML
        const rawHTML = marked.parse(text);
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = rawHTML;

        const elements = Array.from(tempDiv.children);

        elements.forEach((el, index) => {
            // Apply different animation classes based on element type
            if (el.tagName.match(/^H[1-6]$/)) {
                el.classList.add('fade-up-heading');
            } else if (el.tagName === 'UL' || el.tagName === 'OL') {
                el.classList.add('fade-in-list');
                // Animate list items individually
                Array.from(el.children).forEach((li, i) => {
                    li.style.animationDelay = `${(index * 0.1) + (i * 0.05)}s`;
                    li.classList.add('list-item-card');
                });
            } else {
                el.classList.add('fade-in-text');
            }

            // Highlight keywords
            const keywords = ['Artificial Intelligence', 'Machine Learning', 'Data', 'Algorithm', 'Neural Network', 'Model', 'Deep Learning'];
            if (el.tagName === 'P' || el.tagName === 'LI') {
                let inner = el.innerHTML;
                keywords.forEach(kw => {
                    const regex = new RegExp(`(${kw})`, 'gi');
                    inner = inner.replace(regex, '<span class="keyword-highlight">$1</span>');
                });
                el.innerHTML = inner;
            }

            // Stagger animations
            el.style.animationDelay = `${index * 0.15}s`;
            container.appendChild(el);
        });
    };

    // Helper to show result
    const showResult = (content, isAnimated = false) => {
        resultContainer.classList.remove('hidden');
        if (isAnimated) {
            animateTextOutput(content, resultContent);
        } else {
            resultContent.innerHTML = content;
        }
        resultContainer.scrollIntoView({ behavior: 'smooth' });
    };

    // Explain Topic
    window.handleExplain = async () => {
        const subject = document.getElementById('explain-subject').value;
        const topic = document.getElementById('explain-topic').value;
        const level = document.getElementById('explain-level').value;

        if (!subject || !topic) return alert('Please enter both subject and topic');

        showLoading(true);
        try {
            const response = await fetch('/api/explain', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subject,
                    topic,
                    level,
                    username: localStorage.getItem('studyUser')
                })
            });
            const data = await response.json();
            if (data.error) throw new Error(data.error);
            showResult(data.explanation, true);
        } catch (error) {
            showResult(`<div class="error-msg">Error: ${error.message}</div>`);
        } finally {
            showLoading(false);
        }
    };

    // Summarize Notes
    window.handleSummarize = async () => {
        const notes = document.getElementById('summarize-text').value;

        if (!notes) return alert('Please paste some notes');

        showLoading(true);
        try {
            const response = await fetch('/api/summarize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    notes,
                    username: localStorage.getItem('studyUser')
                })
            });
            const data = await response.json();
            if (data.error) throw new Error(data.error);
            showResult(data.summary, true);
        } catch (error) {
            showResult(`<div class="error-msg">Error: ${error.message}</div>`);
        } finally {
            showLoading(false);
        }
    };

    // Quiz Generator
    window.handleQuiz = async () => {
        const topic = document.getElementById('quiz-topic').value;
        const count = document.getElementById('quiz-count').value;

        if (!topic) return alert('Please enter a topic');

        showLoading(true);
        try {
            const response = await fetch('/api/quiz', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topic,
                    count,
                    username: localStorage.getItem('studyUser')
                })
            });
            const data = await response.json();
            if (data.error) throw new Error(data.error);

            let html = '<div class="quiz-list">';
            data.quiz.forEach((q, i) => {
                html += `
                    <div class="quiz-card">
                        <p><strong>Q${i + 1}: ${q.question}</strong></p>
                        <ul style="list-style: none; margin-top: 10px;">
                            ${q.options.map(opt => `<li><label><input type="radio" name="q${i}"> ${opt}</label></li>`).join('')}
                        </ul>
                        <details style="margin-top: 10px;">
                            <summary style="cursor: pointer; color: var(--primary-color);">Show Answer</summary>
                            <p style="margin-top: 5px; color: #059669; font-weight: 600;">Correct: ${q.answer}</p>
                        </details>
                    </div>
                `;
            });
            html += '</div>';
            showResult(html);
        } catch (error) {
            showResult(`<div class="error-msg">Error: ${error.message}</div>`);
        } finally {
            showLoading(false);
        }
    };

    // Flashcard Generator
    window.handleFlashcards = async () => {
        const topic = document.getElementById('flashcard-topic').value;

        if (!topic) return alert('Please enter a topic');

        showLoading(true);
        try {
            const response = await fetch('/api/flashcards', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topic,
                    username: localStorage.getItem('studyUser')
                })
            });
            const data = await response.json();
            if (data.error) throw new Error(data.error);

            let html = '<div class="flashcards-grid">';
            data.flashcards.forEach(card => {
                html += `
                    <div class="flashcard" onclick="this.classList.toggle('flipped')">
                        <div class="flashcard-inner">
                            <div class="flashcard-front">
                                <p>${card.question}</p>
                            </div>
                            <div class="flashcard-back">
                                <p>${card.answer}</p>
                            </div>
                        </div>
                    </div>
                `;
            });
            html += '</div><p style="text-align: center; color: var(--text-muted); font-size: 0.8rem;">Click a card to flip it!</p>';
            showResult(html);
        } catch (error) {
            showResult(`<div class="error-msg">Error: ${error.message}</div>`);
        } finally {
            showLoading(false);
        }
    };

    // Load History
    window.loadHistory = async () => {
        const username = localStorage.getItem('studyUser');
        const historyList = document.getElementById('history-list');

        if (!username) return;

        historyList.innerHTML = '<div class="spinner" style="border-top-color: #8b5cf6"></div>';

        try {
            const response = await fetch('/api/history', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username })
            });

            const data = await response.json();

            if (data.history.length === 0) {
                historyList.innerHTML = '<p class="placeholder-text">No history found. Start learning!</p>';
                return;
            }

            historyList.innerHTML = '';

            data.history.forEach((item, index) => {
                const card = document.createElement('div');
                card.className = 'history-card';
                card.style.animationDelay = `${index * 0.1}s`;

                let icon = 'fa-bolt';
                let color = 'var(--accent-orange)';

                if (item.type === 'summarize') { icon = 'fa-feather-alt'; color = 'var(--accent-emerald)'; }
                if (item.type === 'quiz') { icon = 'fa-fire'; color = 'var(--accent-pink)'; }
                if (item.type === 'flashcards') { icon = 'fa-layer-group'; color = 'var(--accent-blue)'; }

                card.innerHTML = `
                    <div class="history-icon" style="background: ${color}">
                        <i class="fas ${icon}"></i>
                    </div>
                    <div class="history-content">
                        <div class="history-meta">
                            <span class="history-type">${item.type.toUpperCase()}</span>
                            <span class="history-time">${item.timestamp}</span>
                        </div>
                        <p class="history-input">${item.input}</p>
                        <button class="view-result-btn" onclick='viewHistoryItem(${JSON.stringify(item).replace(/'/g, "&#39;")})'>
                            View Result
                        </button>
                    </div>
                `;
                historyList.appendChild(card);
            });

        } catch (error) {
            historyList.innerHTML = `<p class="error-msg">Failed to load history: ${error.message}</p>`;
        }
    };

    // View History Item result
    window.viewHistoryItem = (item) => {
        // Switch to the relevant tab to show context, but show result in overlay or reused result container
        // For simplicity, we'll use the result container across any tab or just reuse the current view

        let content = item.result;

        // If it's quiz or flashcards, we need to format it again like the handlers do
        if (item.type === 'quiz') {
            // Re-render quiz
            let html = '';
            item.result.forEach((q, i) => {
                html += `
                     <div class="quiz-card">
                         <h4>Q${i + 1}: ${q.question}</h4>
                         <div class="options">
                             ${q.options.map(opt => `<button class="option-btn" onclick="checkAnswer(this, '${q.answer}')">${opt}</button>`).join('')}
                         </div>
                     </div>
                 `;
            });
            content = html;
        } else if (item.type === 'flashcards') {
            // Re-render flashcards
            let html = '<div class="flashcards-grid">';
            item.result.forEach(card => {
                html += `
                     <div class="flashcard" onclick="this.classList.toggle('flipped')">
                         <div class="flashcard-inner">
                             <div class="flashcard-front"><p>${card.question}</p></div>
                             <div class="flashcard-back"><p>${card.answer}</p></div>
                         </div>
                     </div>
                 `;
            });
            html += '</div>';
            content = html;
        } else {
            // Text content (explain/summarize) - will be animated by showResult
        }

        showResult(content, (item.type === 'explain' || item.type === 'summarize'));
    };

    // Copy Result
    window.copyResult = () => {
        const text = resultContent.innerText;
        navigator.clipboard.writeText(text).then(() => {
            alert('Result copied to clipboard!');
        });
    };
});
