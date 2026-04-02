        // 0. VEHICLE PARTICLE SYSTEM
        (function() {
            const canvas = document.getElementById('vehicle-particles');
            const ctx = canvas.getContext('2d');
            let particles = [];
            let lastScrollY = 0;
            let scrollSpeed = 0;

            function resizeCanvas() {
                canvas.width = window.innerWidth;
                canvas.height = 250;
            }
            resizeCanvas();
            window.addEventListener('resize', resizeCanvas);

            class Particle {
                constructor(x, y, type) {
                    this.x = x;
                    this.y = y;
                    this.type = type; // 'spark', 'speed', 'smoke'
                    if (type === 'spark') {
                        this.vx = -(Math.random() * 6 + 3);
                        this.vy = (Math.random() - 0.5) * 3;
                        this.life = 1;
                        this.decay = Math.random() * 0.04 + 0.02;
                        this.size = Math.random() * 3 + 1;
                        this.color = Math.random() > 0.5 ? [255, 80, 0] : [255, 200, 50];
                    } else if (type === 'speed') {
                        this.vx = -(Math.random() * 12 + 8);
                        this.vy = 0;
                        this.life = 1;
                        this.decay = Math.random() * 0.03 + 0.02;
                        this.size = Math.random() * 1.5 + 0.5;
                        this.length = Math.random() * 40 + 20;
                        this.color = [255, 0, 0];
                    } else if (type === 'smoke') {
                        this.vx = -(Math.random() * 2 + 1);
                        this.vy = -(Math.random() * 0.5 + 0.2);
                        this.life = 1;
                        this.decay = Math.random() * 0.015 + 0.008;
                        this.size = Math.random() * 8 + 4;
                        this.color = [100, 100, 100];
                    }
                }
                update() {
                    this.x += this.vx;
                    this.y += this.vy;
                    this.life -= this.decay;
                    if (this.type === 'smoke') this.size += 0.3;
                }
                draw(ctx) {
                    if (this.life <= 0) return;
                    ctx.globalAlpha = this.life;
                    if (this.type === 'speed') {
                        ctx.strokeStyle = `rgba(${this.color.join(',')}, ${this.life})`;
                        ctx.lineWidth = this.size;
                        ctx.beginPath();
                        ctx.moveTo(this.x, this.y);
                        ctx.lineTo(this.x + this.length, this.y);
                        ctx.stroke();
                    } else {
                        ctx.fillStyle = `rgba(${this.color.join(',')}, ${this.life})`;
                        ctx.beginPath();
                        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                        ctx.fill();
                    }
                    ctx.globalAlpha = 1;
                }
            }

            // Get vehicle position
            function getVehicleRect() {
                const vehicle = document.querySelector('.player-vehicle');
                if (!vehicle) return null;
                return vehicle.getBoundingClientRect();
            }

            function spawnParticles() {
                const rect = getVehicleRect();
                if (!rect) return;

                const scrollDelta = Math.abs(window.scrollY - lastScrollY);
                scrollSpeed = scrollDelta;
                lastScrollY = window.scrollY;

                // Exhaust X/Y relative to canvas
                const exhaustX = rect.left + 10;
                const exhaustY = canvas.height - (window.innerHeight - rect.bottom) - rect.height * 0.45;

                // Always emit some idle exhaust sparks
                if (Math.random() > 0.4) {
                    particles.push(new Particle(exhaustX, exhaustY, 'spark'));
                }
                // Idle smoke
                if (Math.random() > 0.7) {
                    particles.push(new Particle(exhaustX - 5, exhaustY, 'smoke'));
                }

                // Scrolling = driving faster
                if (scrollDelta > 2) {
                    const intensity = Math.min(scrollDelta / 5, 8);
                    for (let i = 0; i < intensity; i++) {
                        particles.push(new Particle(exhaustX, exhaustY + (Math.random() - 0.5) * 6, 'spark'));
                    }
                    // Speed lines across the bottom area
                    for (let i = 0; i < intensity * 0.5; i++) {
                        const lineY = canvas.height - Math.random() * 80 - 20;
                        const lineX = Math.random() * canvas.width;
                        particles.push(new Particle(lineX, lineY, 'speed'));
                    }
                    // Extra smoke when driving
                    if (Math.random() > 0.3) {
                        particles.push(new Particle(exhaustX - 10, exhaustY + (Math.random() - 0.5) * 4, 'smoke'));
                    }
                }
            }

            function animate() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                spawnParticles();

                particles = particles.filter(p => p.life > 0);
                // Cap particles
                if (particles.length > 300) particles.splice(0, particles.length - 300);

                particles.forEach(p => {
                    p.update();
                    p.draw(ctx);
                });

                requestAnimationFrame(animate);
            }
            animate();
        })();

        // === MODE TOGGLE ===
        function toggleMode() {
            const body = document.body;
            const btn = document.getElementById('mode-toggle');
            body.classList.toggle('wayne-mode');
            const isWayne = body.classList.contains('wayne-mode');
            btn.textContent = isWayne ? 'BATMAN' : 'WAYNE';
        }

        // === ADMIN SYSTEM ===
        const PASS_HASH = 'a1c9d04af1560e78841840057119e90df6406b0b39d31ee264b8f5d068c9e884';
        const STORAGE_KEY = 'gotham_projects';
        const AUTH_KEY = 'gotham_auth';

        // Default projects (your originals)
        const DEFAULT_PROJECTS = [
            {
                id: 'default_1',
                name: '3D AI AGENT',
                description: 'Built autonomous agent for 3D task execution using AI2-THOR, LLMs & Computer Vision.',
                url: 'https://github.com/ShuklaUdayan123/VisionLanguageAction-Agent',
                tags: ['AI', '3D', 'Computer Vision', 'LLMs'],
                isDefault: true
            },
            {
                id: 'default_2',
                name: 'STARTUP INTEL',
                description: 'Streamlit app analyzing Indian Startup funding trends (2015-2020).',
                url: 'https://github.com/ShuklaUdayan123/startup_analysis',
                tags: ['Python', 'Streamlit', 'Analytics'],
                isDefault: true
            }
        ];

        // SHA-256 hash function
        async function sha256(message) {
            const msgBuffer = new TextEncoder().encode(message);
            const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        }

        // Get all projects (defaults + localStorage)
        function getAllProjects() {
            const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            return [...DEFAULT_PROJECTS, ...stored];
        }

        // Get user-added projects only
        function getUserProjects() {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        }

        // Save user projects to localStorage
        function saveUserProjects(projects) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
        }

        // Render projects in the ARCHIVES section
        function renderArchives() {
            const container = document.getElementById('archives-container');
            if (!container) return;
            const projects = getAllProjects();
            if (projects.length === 0) {
                container.innerHTML = '<div style="color:#555; font-style:italic;">No projects yet.</div>';
                return;
            }
            container.innerHTML = projects.map(p => `
                <a href="${p.url}" target="_blank" class="project-link">
                    <div class="data-point" style="margin-bottom:0; border-bottom:none;">
                        <div class="data-label">PROJECT: ${p.name.toUpperCase()} 🔗</div>
                        ${p.description}
                        ${p.tags && p.tags.length ? '<div style="margin-top:5px;">' + p.tags.map(t => '<span class="skill-chip" style="font-size:0.7rem; padding:2px 8px;">' + t + '</span>').join('') + '</div>' : ''}
                    </div>
                </a>
            `).join('');
        }

        // Triple-click bat logo to open login
        let logoClickCount = 0;
        let logoClickTimer = null;
        document.getElementById('bat-logo-trigger').addEventListener('click', function(e) {
            e.stopPropagation();
            logoClickCount++;
            clearTimeout(logoClickTimer);
            logoClickTimer = setTimeout(() => { logoClickCount = 0; }, 600);
            if (logoClickCount >= 3) {
                logoClickCount = 0;
                if (sessionStorage.getItem(AUTH_KEY) === 'true') {
                    openAdmin();
                } else {
                    openLogin();
                }
            }
        });

        function openLogin() {
            document.getElementById('login-modal').classList.add('active');
            document.getElementById('login-password').value = '';
            document.getElementById('login-error').classList.remove('show');
            document.body.style.overflow = 'hidden';
            setTimeout(() => document.getElementById('login-password').focus(), 100);
        }

        function closeLogin() {
            document.getElementById('login-modal').classList.remove('active');
            document.body.style.overflow = 'scroll';
        }

        async function attemptLogin() {
            const pwd = document.getElementById('login-password').value;
            const hash = await sha256(pwd);
            if (hash === PASS_HASH) {
                sessionStorage.setItem(AUTH_KEY, 'true');
                closeLogin();
                openAdmin();
                showToast('ACCESS GRANTED — WELCOME BACK');
            } else {
                const err = document.getElementById('login-error');
                err.classList.remove('show');
                void err.offsetWidth;
                err.classList.add('show');
            }
        }

        // Enter key on password field
        document.getElementById('login-password').addEventListener('keydown', function(e) {
            if (e.key === 'Enter') attemptLogin();
        });

        function openAdmin() {
            if (sessionStorage.getItem(AUTH_KEY) !== 'true') {
                console.error("Unauthorized access.");
                openLogin();
                return;
            }
            document.getElementById('admin-panel').classList.add('active');
            document.body.style.overflow = 'hidden';
            renderAdminList();
            resetForm();
        }

        function closeAdmin() {
            document.getElementById('admin-panel').classList.remove('active');
            document.body.style.overflow = 'scroll';
            renderArchives(); // Refresh public view
        }

        function adminLogout() {
            sessionStorage.removeItem(AUTH_KEY);
            closeAdmin();
            showToast('LOGGED OUT — SESSION TERMINATED');
        }

        // Render admin project list
        function renderAdminList() {
            const list = document.getElementById('admin-project-list');
            const allProjects = getAllProjects();
            if (allProjects.length === 0) {
                list.innerHTML = '<div class="admin-empty">No projects yet. Add your first one above.</div>';
                return;
            }
            list.innerHTML = allProjects.map(p => `
                <div class="admin-project-item">
                    <div class="admin-project-info">
                        <div class="admin-project-name">${p.name}${p.isDefault ? ' <span style="color:#555; font-size:0.7rem;">[DEFAULT]</span>' : ''}</div>
                        <div class="admin-project-desc">${p.description}</div>
                        <div class="admin-project-url">${p.url}</div>
                        ${p.tags && p.tags.length ? '<div class="admin-project-tags">' + p.tags.map(t => '<span class="admin-tag">' + t + '</span>').join('') + '</div>' : ''}
                    </div>
                    <div class="admin-project-actions">
                        <button class="admin-btn admin-btn-secondary admin-btn-small" onclick="editProject('${p.id}')" ${p.isDefault ? '' : ''}>EDIT</button>
                        <button class="admin-btn admin-btn-danger admin-btn-small" onclick="deleteProject('${p.id}')" ${p.isDefault ? 'title="Removes from view (can restore via import)"' : ''}>DELETE</button>
                    </div>
                </div>
            `).join('');
        }

        // Save (add or edit) a project
        function saveProject() {
            const name = document.getElementById('proj-name').value.trim();
            const desc = document.getElementById('proj-desc').value.trim();
            const url = document.getElementById('proj-url').value.trim();
            const tagsRaw = document.getElementById('proj-tags').value.trim();
            const editId = document.getElementById('edit-project-id').value;

            if (!name || !desc) {
                showToast('⚠ NAME AND DESCRIPTION REQUIRED');
                return;
            }

            const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(t => t) : [];
            const userProjects = getUserProjects();

            if (editId) {
                // Check if editing a default project
                const defIdx = DEFAULT_PROJECTS.findIndex(p => p.id === editId);
                if (defIdx !== -1) {
                    // Update default in-memory (won't persist across reloads, but we'll save as user project)
                    DEFAULT_PROJECTS[defIdx] = { ...DEFAULT_PROJECTS[defIdx], name, description: desc, url, tags };
                } else {
                    const idx = userProjects.findIndex(p => p.id === editId);
                    if (idx !== -1) {
                        userProjects[idx] = { ...userProjects[idx], name, description: desc, url, tags };
                    }
                }
                saveUserProjects(userProjects);
                showToast('PROJECT UPDATED');
            } else {
                const newProject = {
                    id: 'proj_' + Date.now(),
                    name, description: desc, url: url || '#', tags,
                    isDefault: false
                };
                userProjects.push(newProject);
                saveUserProjects(userProjects);
                showToast('PROJECT ADDED TO ARCHIVES');
            }

            resetForm();
            renderAdminList();
            renderArchives();
        }

        function editProject(id) {
            const all = getAllProjects();
            const proj = all.find(p => p.id === id);
            if (!proj) return;
            document.getElementById('proj-name').value = proj.name;
            document.getElementById('proj-desc').value = proj.description;
            document.getElementById('proj-url').value = proj.url;
            document.getElementById('proj-tags').value = (proj.tags || []).join(', ');
            document.getElementById('edit-project-id').value = id;
            document.getElementById('form-title').textContent = '✏️ EDITING: ' + proj.name;
            document.getElementById('cancel-edit-btn').style.display = 'inline-block';
            document.getElementById('project-form').scrollIntoView({ behavior: 'smooth' });
        }

        function deleteProject(id) {
            if (!confirm('Delete this project?')) return;
            // If default, remove from defaults array
            const defIdx = DEFAULT_PROJECTS.findIndex(p => p.id === id);
            if (defIdx !== -1) {
                DEFAULT_PROJECTS.splice(defIdx, 1);
                // Also save removal to localStorage
                const removed = JSON.parse(localStorage.getItem('gotham_removed_defaults') || '[]');
                removed.push(id);
                localStorage.setItem('gotham_removed_defaults', JSON.stringify(removed));
            } else {
                const userProjects = getUserProjects();
                const filtered = userProjects.filter(p => p.id !== id);
                saveUserProjects(filtered);
            }
            renderAdminList();
            renderArchives();
            showToast('PROJECT REMOVED');
        }

        function resetForm() {
            document.getElementById('proj-name').value = '';
            document.getElementById('proj-desc').value = '';
            document.getElementById('proj-url').value = '';
            document.getElementById('proj-tags').value = '';
            document.getElementById('edit-project-id').value = '';
            document.getElementById('form-title').textContent = '➕ NEW PROJECT';
            document.getElementById('cancel-edit-btn').style.display = 'none';
        }

        // Export/Import
        function exportProjects() {
            const data = { projects: getAllProjects(), exportedAt: new Date().toISOString() };
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'gotham-projects-' + new Date().toISOString().slice(0,10) + '.json';
            a.click();
            URL.revokeObjectURL(a.href);
            showToast('PROJECTS EXPORTED');
        }

        function importProjects(event) {
            const file = event.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const data = JSON.parse(e.target.result);
                    const projects = data.projects || data;
                    if (!Array.isArray(projects)) throw new Error('Invalid format');
                    // Separate defaults and user projects
                    const userOnly = projects.filter(p => !p.isDefault);
                    saveUserProjects(userOnly);
                    // Restore any defaults
                    localStorage.removeItem('gotham_removed_defaults');
                    renderAdminList();
                    renderArchives();
                    showToast(`IMPORTED ${projects.length} PROJECTS`);
                } catch(err) {
                    showToast('⚠ IMPORT FAILED — INVALID FILE');
                }
            };
            reader.readAsText(file);
            event.target.value = ''; // Reset input
        }

        // Toast notification
        function showToast(message) {
            const toast = document.getElementById('admin-toast');
            toast.textContent = message;
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 3000);
        }

        // On page load: remove deleted defaults and render archives
        (function initProjects() {
            const removedDefaults = JSON.parse(localStorage.getItem('gotham_removed_defaults') || '[]');
            removedDefaults.forEach(id => {
                const idx = DEFAULT_PROJECTS.findIndex(p => p.id === id);
                if (idx !== -1) DEFAULT_PROJECTS.splice(idx, 1);
            });
            renderArchives();
        })();

        // 1. FLASHLIGHT
        const flashlight = document.getElementById('flashlight');
        document.addEventListener('mousemove', (e) => {
            flashlight.style.background = `radial-gradient(circle at ${e.clientX}px ${e.clientY}px, transparent 10%, rgba(0,0,0,0.95) 35%)`;
        });

        // 2. SCROLL
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            const maxScroll = document.body.scrollHeight - window.innerHeight;
            const scrollPercent = scrollY / maxScroll;
            
            const world = document.getElementById('world');
            if (world) world.style.transform = `translateX(-${scrollY * 1.5}px)`;
            
            const road = document.getElementById('road');
            if (road) road.style.transform = `translateX(-${scrollY % 100}px)`;
            
            const bg = document.querySelector('.bg-layer');
            if (bg) bg.style.transform = `scale(1.1) translateX(-${scrollY * 0.1}px)`;
            
            const progress = document.getElementById('progress');
            if (progress) progress.style.width = `${scrollPercent * 100}%`;
            
            document.querySelectorAll('.section-marker').forEach(marker => {
                const rect = marker.getBoundingClientRect();
                if (rect.left < window.innerWidth * 0.4 && rect.right > 0) marker.classList.add('active');
                else marker.classList.remove('active');
            });
        });

        // 3. GAME LOGIC
        let score = 0, activePosition = null, timerId = null, gameActive = false;
        const blastLayer = document.getElementById("blast-layer");
        const sfx = document.getElementById("explosion-sfx");
        const grid = document.querySelector(".game-grid");

        function openGame() {
            document.getElementById("game-overlay").style.display = "flex";
            document.body.style.overflow = "hidden";
            score = 0;
            document.getElementById("score-board").innerText = "SCORE: " + score;
            gameActive = true;
            moveJoker();
            timerId = setInterval(moveJoker, 800);
        }

        function closeGame() {
            document.getElementById("game-overlay").style.display = "none";
            document.body.style.overflow = "scroll";
            gameActive = false;
            clearInterval(timerId);
            if(activePosition !== null) document.getElementById("cell-" + activePosition).classList.remove("joker-active");
        }

        function moveJoker() {
            if(!gameActive) return;
            document.querySelectorAll(".game-cell").forEach(cell => cell.classList.remove("joker-active"));
            let randomPos = Math.floor(Math.random() * 9);
            activePosition = randomPos;
            document.getElementById("cell-" + randomPos).classList.add("joker-active");
        }

        function hit(id) {
            if(!gameActive) return;
            if (id === activePosition) {
                score++;
                document.getElementById("score-board").innerText = "SCORE: " + score;
                if(sfx) {
                    const soundClone = sfx.cloneNode();
                    soundClone.volume = 0.5;
                    soundClone.play().catch(e => console.log("Audio play failed", e));
                }
                
                blastLayer.classList.remove("trigger-blast");
                void blastLayer.offsetWidth; 
                blastLayer.classList.add("trigger-blast");
                
                if(grid) {
                    grid.classList.remove("shake-screen");
                    void grid.offsetWidth;
                    grid.classList.add("shake-screen");
                }
                
                moveJoker();
                clearInterval(timerId);
                timerId = setInterval(moveJoker, 800);
            }
        }

        // 4. TYPEWRITER EFFECT
        const phrases = [
            "ANALYTICS // AI // VIGILANTE",
            "BUILDING INTELLIGENT SYSTEMS",
            "DATA DRIVEN DECISIONS",
            "ENGINEERING // STRATEGY // IMPACT"
        ];
        let phraseIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        const textElement = document.getElementById("typewriter-text");

        function typeLoop() {
            const currentPhrase = phrases[phraseIndex];
            
            if (isDeleting) {
                textElement.innerText = currentPhrase.substring(0, charIndex - 1);
                charIndex--;
            } else {
                textElement.innerText = currentPhrase.substring(0, charIndex + 1);
                charIndex++;
            }

            let typeSpeed = isDeleting ? 30 : 100 + Math.random() * 50;

            if (!isDeleting && charIndex === currentPhrase.length) {
                typeSpeed = 2000;
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                phraseIndex = (phraseIndex + 1) % phrases.length;
                typeSpeed = 500;
            }

            setTimeout(typeLoop, typeSpeed);
        }

        setTimeout(typeLoop, 1000);
