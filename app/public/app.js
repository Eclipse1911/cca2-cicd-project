/**
 * Cloud Computing & DevOps Suite - Frontend Logic
 * CCA-2 Project Implementation
 */

document.addEventListener('DOMContentLoaded', () => {
    initVersionAndTelemetry();
    initTopicTabs();
    initPipelineSimulator();
    initQuiz();
    initCopyActions();
    updateFooterTime();
    setInterval(updateFooterTime, 1000);
});

// Global state
let currentVersion = 'Version 1.0 - Hello World';
let countdownTimer = 5;

/**
 * 1. Live Version & Telemetry Polling
 */
async function fetchTelemetry() {
    try {
        const response = await fetch('/api/info');
        if (!response.ok) throw new Error('Failed to retrieve system diagnostics');
        const data = await response.json();

        // Update active version displays
        currentVersion = data.version;
        document.getElementById('announcement-version').textContent = data.version;
        document.getElementById('hero-version-text').textContent = data.version;
        document.getElementById('stat-version').textContent = data.version.includes('2.0') ? 'V2.0' : 'V1.0';
        document.getElementById('tele-version').textContent = data.version;

        // Visual distinction if Version 2.0 is active
        if (data.version.includes('2.0')) {
            document.getElementById('hero-version-text').style.color = '#34d399';
            document.getElementById('hero-version-text').style.textShadow = '0 0 20px rgba(52, 211, 153, 0.5)';
            document.getElementById('announcement-version').style.color = '#34d399';
        }

        // Update Pod Hostname & Diagnostics
        document.getElementById('nav-hostname').textContent = data.hostname;
        document.getElementById('tele-hostname').textContent = data.hostname;
        document.getElementById('tele-memory').textContent = `${data.memoryRssMb} MB`;
        document.getElementById('tele-node').textContent = `${data.nodeVersion} (${data.platform})`;
        
        // Format uptime
        const uptimeMin = Math.floor(data.uptimeSeconds / 60);
        const uptimeSec = data.uptimeSeconds % 60;
        const uptimeStr = uptimeMin > 0 ? `${uptimeMin}m ${uptimeSec}s` : `${uptimeSec}s`;
        document.getElementById('stat-uptime').textContent = uptimeStr;
        document.getElementById('tele-uptime').textContent = uptimeStr;

        // Render Raw JSON
        document.getElementById('telemetry-json').textContent = JSON.stringify(data, null, 2);

    } catch (err) {
        console.warn('Telemetry polling error:', err);
        document.getElementById('tele-hostname').textContent = 'pod-localhost';
    }
}

function initVersionAndTelemetry() {
    fetchTelemetry();

    // Auto-refresh timer for live container telemetry
    setInterval(() => {
        countdownTimer--;
        const timerEl = document.getElementById('telemetry-auto-timer');
        if (timerEl) timerEl.textContent = `Auto-refresh in ${countdownTimer}s`;

        if (countdownTimer <= 0) {
            countdownTimer = 5;
            fetchTelemetry();
        }
    }, 1000);

    const refreshBtn = document.getElementById('btn-refresh-telemetry');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            countdownTimer = 5;
            fetchTelemetry();
            showToast('Telemetry refreshed from active Pod');
        });
    }
}

/**
 * 2. Topic Tabs Navigation
 */
function initTopicTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-tab');

            // Deactivate all
            tabButtons.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));

            // Activate clicked
            btn.classList.add('active');
            const targetPane = document.getElementById(`tab-${target}`);
            if (targetPane) {
                targetPane.classList.add('active');
            }
        });
    });
}

/**
 * 3. Interactive CI/CD Pipeline Simulator
 */
function initPipelineSimulator() {
    const triggerBtn = document.getElementById('btn-trigger-pipeline');
    const triggerText = document.getElementById('btn-trigger-text');
    const logBox = document.getElementById('pipeline-log');
    const clearBtn = document.getElementById('btn-clear-logs');

    if (!triggerBtn) return;

    clearBtn.addEventListener('click', () => {
        logBox.innerHTML = '<span class="log-dim">[Pipeline] Ready to execute build.</span>';
    });

    let isRunning = false;

    triggerBtn.addEventListener('click', async () => {
        if (isRunning) return;
        isRunning = true;
        triggerBtn.disabled = true;
        triggerText.textContent = 'Pipeline Running...';

        // Reset stages
        for (let i = 1; i <= 6; i++) {
            const el = document.getElementById(`stage-${i}`);
            const stat = document.getElementById(`status-${i}`);
            el.className = 'stage-item';
            stat.textContent = 'Waiting';
        }

        logBox.innerHTML = '';
        const appendLog = (html) => {
            logBox.innerHTML += html + '\n';
            logBox.scrollTop = logBox.scrollHeight;
        };

        const sleep = (ms) => new Promise(res => setTimeout(res, ms));

        appendLog(`<span class="log-info">[Jenkins] Started by user Aryan via GitHub Push webhook</span>`);
        appendLog(`<span class="log-dim">[Pipeline] Running on agent 'built-in' (EC2 t3.medium ubuntu-22.04)</span>`);
        await sleep(600);

        // Stage 1: Checkout SCM
        setStageStatus(1, 'running', 'Pulling');
        appendLog(`<span class="log-info">[Stage 1: Checkout] Cloning repository: https://github.com/Eclipse1911/cca2-cicd-project.git</span>`);
        await sleep(700);
        appendLog(`<span class="log-dim"> > git rev-parse --verify --short HEAD # e1a9f4c</span>`);
        appendLog(`<span class="log-dim"> > Checking out revision e1a9f4c (origin/main)</span>`);
        setStageStatus(1, 'success', 'Passed');
        appendLog(`<span class="log-success">[Stage 1: Checkout] Completed successfully in 0.9s</span>\n`);
        await sleep(500);

        // Stage 2: Build & Test
        setStageStatus(2, 'running', 'Testing');
        appendLog(`<span class="log-info">[Stage 2: Build & Test] Executing 'npm test' suite...</span>`);
        await sleep(700);
        appendLog(`<span class="log-dim">✔ GET /api/health returns HTTP 200 (UP) [12ms]</span>`);
        appendLog(`<span class="log-dim">✔ GET /api/version matches valid format [8ms]</span>`);
        appendLog(`<span class="log-dim">✔ GET /api/info provides pod diagnostics [10ms]</span>`);
        appendLog(`<span class="log-dim">✔ GET / serves responsive dashboard [15ms]</span>`);
        appendLog(`<span class="log-success">ℹ tests 4 &bull; suites 1 &bull; pass 4 &bull; fail 0</span>`);
        setStageStatus(2, 'success', 'Passed');
        appendLog(`<span class="log-success">[Stage 2: Build & Test] All unit tests passed!</span>\n`);
        await sleep(600);

        // Stage 3: Docker Build
        setStageStatus(3, 'running', 'Building');
        appendLog(`<span class="log-info">[Stage 3: Docker Build] Building Dockerfile: docker.io/eclipse1911/cca2-app:BUILD_#2</span>`);
        await sleep(600);
        appendLog(`<span class="log-dim">Step 1/7 : FROM node:20-alpine AS runtime</span>`);
        appendLog(`<span class="log-dim">Step 2/7 : WORKDIR /usr/src/app</span>`);
        appendLog(`<span class="log-dim">Step 3/7 : COPY package*.json ./</span>`);
        appendLog(`<span class="log-dim">Step 4/7 : RUN npm install --omit=dev</span>`);
        appendLog(`<span class="log-dim">Step 5/7 : COPY app/ ./app/</span>`);
        appendLog(`<span class="log-dim">Step 6/7 : EXPOSE 3000</span>`);
        appendLog(`<span class="log-dim">Step 7/7 : CMD ["node", "app/server.js"]</span>`);
        setStageStatus(3, 'success', 'Passed');
        appendLog(`<span class="log-success">[Stage 3: Docker Build] Successfully tagged image: eclipse1911/cca2-app:2, latest</span>\n`);
        await sleep(600);

        // Stage 4: Push Image
        setStageStatus(4, 'running', 'Pushing');
        appendLog(`<span class="log-info">[Stage 4: Push Image] Authenticating with Docker Hub credentials (ID: dockerhub-credentials)</span>`);
        await sleep(500);
        appendLog(`<span class="log-dim">Login Succeeded! Pushing layers to registry...</span>`);
        appendLog(`<span class="log-dim">d8a2...: Pushed [162MB / 162MB]</span>`);
        appendLog(`<span class="log-dim">2: digest: sha256:7f12a8b9... size: 1368</span>`);
        setStageStatus(4, 'success', 'Passed');
        appendLog(`<span class="log-success">[Stage 4: Push Image] Successfully pushed image to Docker Hub</span>\n`);
        await sleep(600);

        // Stage 5: Minikube Deploy
        setStageStatus(5, 'running', 'Rolling');
        appendLog(`<span class="log-info">[Stage 5: Minikube Deploy] Applying manifests & updating deployment</span>`);
        await sleep(500);
        appendLog(`<span class="log-dim"> > kubectl apply -f k8s/deployment.yaml</span>`);
        appendLog(`<span class="log-dim">deployment.apps/cca2-app-deployment configured</span>`);
        appendLog(`<span class="log-dim"> > kubectl apply -f k8s/service.yaml</span>`);
        appendLog(`<span class="log-dim">service/cca2-app-service unchanged</span>`);
        appendLog(`<span class="log-dim"> > kubectl set image deployment/cca2-app-deployment cca2-app-container=eclipse1911/cca2-app:2</span>`);
        setStageStatus(5, 'success', 'Passed');
        appendLog(`<span class="log-success">[Stage 5: Minikube Deploy] Rolling update initiated in cluster</span>\n`);
        await sleep(600);

        // Stage 6: Verify Rollout
        setStageStatus(6, 'running', 'Verifying');
        appendLog(`<span class="log-info">[Stage 6: Verify Rollout] Waiting for deployment rollout status...</span>`);
        await sleep(500);
        appendLog(`<span class="log-dim">Waiting for deployment "cca2-app-deployment" rollout to finish: 1 of 2 updated replicas are available...</span>`);
        await sleep(500);
        appendLog(`<span class="log-dim">Waiting for deployment "cca2-app-deployment" rollout to finish: 2 of 2 updated replicas are available...</span>`);
        appendLog(`<span class="log-success">deployment "cca2-app-deployment" successfully rolled out!</span>`);
        appendLog(`<span class="log-info">Active Service: NodePort 30080 -> 3000/TCP</span>`);
        setStageStatus(6, 'success', 'Verified');
        appendLog(`\n<span class="log-success">🎉 [Pipeline] FINISHED: SUCCESS (Total runtime: 18.4s)</span>`);

        showToast('Pipeline execution finished successfully!');
        triggerBtn.disabled = false;
        triggerText.textContent = 'Run Pipeline Build';
        isRunning = false;
    });

    function setStageStatus(num, state, label) {
        const stageEl = document.getElementById(`stage-${num}`);
        const statusEl = document.getElementById(`status-${num}`);
        if (!stageEl || !statusEl) return;

        stageEl.className = `stage-item ${state}`;
        statusEl.textContent = label;
    }
}

/**
 * 4. Interactive Quiz
 */
const QUIZ_QUESTIONS = [
    {
        question: "In Cloud Computing, which service model delegates the management of runtime, OS, and hardware to the cloud provider while the developer solely provides application code?",
        options: [
            "Infrastructure as a Service (IaaS)",
            "Platform as a Service (PaaS)",
            "Software as a Service (SaaS)",
            "Function as a Service (FaaS) only"
        ],
        answer: 1,
        explanation: "Platform as a Service (PaaS, e.g. AWS Elastic Beanstalk, Heroku) abstracts OS, middleware, and runtime management so developers focus exclusively on application code."
    },
    {
        question: "What is the primary difference between Continuous Delivery (CD) and Continuous Deployment (CD)?",
        options: [
            "Continuous Delivery compiles code while Continuous Deployment does not",
            "Continuous Delivery requires a manual approval trigger to deploy to production, whereas Continuous Deployment releases to production automatically",
            "Continuous Deployment is only for Docker containers",
            "Continuous Delivery only runs unit tests"
        ],
        answer: 1,
        explanation: "Continuous Delivery guarantees software is always in a releasable state, but deploying to production requires manual authorization. Continuous Deployment automates release all the way to production with zero manual gates."
    },
    {
        question: "Why do Docker containers start up in seconds compared to minutes for Virtual Machines?",
        options: [
            "Containers do not run real code",
            "Containers share the host operating system kernel and isolate processes using cgroups and namespaces without booting a guest OS",
            "Containers always run in physical RAM without disks",
            "Containers use hypervisors with GPU acceleration"
        ],
        answer: 1,
        explanation: "Docker containers share the host Linux kernel and leverage namespaces (for isolation) and cgroups (for resource limits), avoiding the heavy boot cycle of a guest operating system hypervisor."
    },
    {
        question: "In Kubernetes, which Service type is configured in this project on port 30080 to allow evaluators to access Pods from outside the cluster?",
        options: [
            "ClusterIP",
            "ExternalName",
            "NodePort",
            "Headless Service"
        ],
        answer: 2,
        explanation: "NodePort exposes the Service on each Node's IP at a static port (in our rubric: 30080). This enables direct external access via <EC2-Public-IP>:30080."
    },
    {
        question: "What Kubernetes probe prevents user traffic from hitting a newly spawned Pod before it has completed startup initialization during a Rolling Update?",
        options: [
            "Liveness Probe",
            "Readiness Probe",
            "Startup Probe only",
            "OOM Killer Probe"
        ],
        answer: 1,
        explanation: "The Readiness Probe verifies if a container is ready to accept external HTTP requests. Kubernetes will not route traffic to the Pod via Service until the readiness probe returns 200 OK."
    }
];

function initQuiz() {
    let currentQ = 0;
    let score = 0;
    let answered = false;

    const qText = document.getElementById('quiz-question-text');
    const optContainer = document.getElementById('quiz-options-container');
    const counterEl = document.getElementById('quiz-counter');
    const scoreEl = document.getElementById('quiz-score-display');
    const progressEl = document.getElementById('quiz-progress');
    const feedbackEl = document.getElementById('quiz-feedback');
    const feedbackBadge = document.getElementById('feedback-badge');
    const feedbackText = document.getElementById('feedback-text');
    const nextBtn = document.getElementById('btn-next-question');

    if (!qText) return;

    function renderQuestion(idx) {
        answered = false;
        feedbackEl.style.display = 'none';
        const q = QUIZ_QUESTIONS[idx];

        counterEl.textContent = `Question ${idx + 1} of ${QUIZ_QUESTIONS.length}`;
        progressEl.style.width = `${((idx + 1) / QUIZ_QUESTIONS.length) * 100}%`;
        qText.textContent = q.question;

        optContainer.innerHTML = '';
        q.options.forEach((opt, oIdx) => {
            const btn = document.createElement('button');
            btn.className = 'quiz-option';
            btn.textContent = opt;
            btn.addEventListener('click', () => handleOptionClick(oIdx, btn));
            optContainer.appendChild(btn);
        });
    }

    function handleOptionClick(selectedIdx, btnEl) {
        if (answered) return;
        answered = true;

        const q = QUIZ_QUESTIONS[currentQ];
        const allButtons = optContainer.querySelectorAll('.quiz-option');

        if (selectedIdx === q.answer) {
            score++;
            btnEl.classList.add('correct');
            feedbackBadge.textContent = '✓ Correct Answer!';
            feedbackBadge.className = 'feedback-badge correct';
        } else {
            btnEl.classList.add('incorrect');
            allButtons[q.answer].classList.add('correct');
            feedbackBadge.textContent = '✗ Incorrect';
            feedbackBadge.className = 'feedback-badge incorrect';
        }

        scoreEl.textContent = `Score: ${score} / ${QUIZ_QUESTIONS.length}`;
        feedbackText.textContent = q.explanation;
        feedbackEl.style.display = 'block';

        if (currentQ === QUIZ_QUESTIONS.length - 1) {
            nextBtn.textContent = 'View Final Score';
        } else {
            nextBtn.textContent = 'Next Question';
        }
    }

    nextBtn.addEventListener('click', () => {
        if (currentQ < QUIZ_QUESTIONS.length - 1) {
            currentQ++;
            renderQuestion(currentQ);
        } else {
            // End of quiz
            qText.textContent = `🎉 Quiz Completed! Final Score: ${score} / ${QUIZ_QUESTIONS.length}`;
            optContainer.innerHTML = `
                <div style="text-align:center; padding: 20px;">
                    <p style="font-size: 1.1rem; color: var(--text-secondary); margin-bottom: 16px;">
                        ${score >= 4 ? 'Outstanding! You have a solid grasp of Cloud Computing and DevOps architecture.' : 'Good effort! Review the curriculum topics above to refresh concepts.'}
                    </p>
                    <button class="btn btn-primary" id="btn-restart-quiz">Restart Quiz</button>
                </div>
            `;
            feedbackEl.style.display = 'none';
            document.getElementById('btn-restart-quiz').addEventListener('click', () => {
                currentQ = 0;
                score = 0;
                scoreEl.textContent = `Score: 0 / ${QUIZ_QUESTIONS.length}`;
                renderQuestion(0);
            });
        }
    });

    renderQuestion(0);
}

/**
 * 5. Clipboard & Toast Actions
 */
function initCopyActions() {
    const copyVersionBtn = document.getElementById('btn-copy-version');
    if (copyVersionBtn) {
        copyVersionBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(currentVersion).then(() => {
                showToast(`Copied "${currentVersion}" to clipboard`);
            });
        });
    }

    const copyJsonBtn = document.getElementById('btn-copy-json');
    if (copyJsonBtn) {
        copyJsonBtn.addEventListener('click', () => {
            const rawJson = document.getElementById('telemetry-json').textContent;
            navigator.clipboard.writeText(rawJson).then(() => {
                showToast('Copied JSON telemetry payload to clipboard');
            });
        });
    }
}

function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2800);
}

function updateFooterTime() {
    const el = document.getElementById('footer-time');
    if (el) {
        el.textContent = `Local Time: ${new Date().toLocaleTimeString()}`;
    }
}
