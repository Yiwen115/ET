// DOM 元素
const videoElement = document.getElementById('input-video');
const handCanvas = document.getElementById('hand-canvas');
const gameCanvas = document.getElementById('game-canvas');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over');
const startButton = document.getElementById('start-button');
const restartButton = document.getElementById('restart-button');
const scoreDisplay = document.getElementById('score');
const healthDisplay = document.getElementById('health');
const loadingMessage = document.getElementById('loading-message');
const switchCameraButton = document.getElementById('switch-camera');
const toggleDebugButton = document.getElementById('toggle-debug');
const scoreElement = document.getElementById('score');
const questionBox = document.getElementById('question-box');
const instructions = document.getElementById('instructions');
const optionLeft = document.querySelector('.option.left');
const optionRight = document.querySelector('.option.right');

// Canvas contexts
const handCtx = handCanvas.getContext('2d');
const gameCtx = gameCanvas.getContext('2d');

// 遊戲狀態
let gameState = {
    isPlaying: false,
    score: 0,
    health: 3,
    playerX: 100,
    playerY: 300,
    targets: [],
    currentQuestionIndex: 0,
    timeLeft: 30,
    totalQuestions: 0,
    correctAnswers: 0,
    currentQuestion: null,
    canAnswer: false,
    answerDelay: 1500,
    timer: null
};

// 遊戲常數
const PLAYER_SIZE = 40;
const TARGET_SIZE = 30;

// 遊戲物件尺寸和顏色
const PLAYER_WIDTH = 40;
const PLAYER_HEIGHT = 60;
const PLATFORM_HEIGHT = 20;
const COIN_SIZE = 20;
const ENEMY_SIZE = 40;

// 遊戲素材
const sprites = {
    player: {
        color: '#4CAF50',
        outline: '#45a049',
        shadow: 'rgba(76, 175, 80, 0.3)'
    },
    platform: {
        color: '#8B4513',
        outline: '#6B3410',
        pattern: '#9B5523'
    },
    coin: {
        color: '#FFD700',
        outline: '#FFA000',
        glow: 'rgba(255, 215, 0, 0.5)'
    },
    enemy: {
        color: '#FF4444',
        outline: '#CC0000',
        glow: 'rgba(255, 0, 0, 0.3)'
    }
};

// 粒子系統
let particles = [];

// 題目資料庫
const questions = [
    {
        question: "在JavaScript中，以下哪個是閉包(Closure)的正確描述？",
        options: ["只是一個普通函數", "能訪問其他函數作用域變數的函數"],
        correct: 1,
        explanation: "閉包是能夠訪問其他函數作用域中變數的函數"
    },
    {
        question: "React中的Virtual DOM主要作用是什麼？",
        options: ["增加程式碼複雜度", "提升DOM操作效率"],
        correct: 1,
        explanation: "Virtual DOM通過批量更新提升渲染效率"
    },
    {
        question: "以下哪個是RESTful API的特點？",
        options: ["狀態依賴", "無狀態"],
        correct: 1,
        explanation: "RESTful API應該是無狀態的"
    },
    {
        question: "什麼是SQL注入攻擊？",
        options: ["正常的數據查詢", "通過輸入惡意SQL代碼進行攻擊"],
        correct: 1,
        explanation: "SQL注入是一種常見的網絡安全威脅"
    },
    {
        question: "什麼是跨站腳本攻擊(XSS)？",
        options: ["網站正常腳本", "注入惡意腳本到網頁"],
        correct: 1,
        explanation: "XSS是一種網頁安全漏洞"
    },
    {
        question: "在網絡安全中，HTTPS的作用是？",
        options: ["加快訪問速度", "加密數據傳輸"],
        correct: 1,
        explanation: "HTTPS通過SSL/TLS協議加密數據"
    },
    {
        question: "什麼是Docker容器？",
        options: ["物理服務器", "輕量級的虛擬化解決方案"],
        correct: 1,
        explanation: "Docker提供應用程序級的虛擬化"
    },
    {
        question: "Git中merge和rebase的主要區別是？",
        options: ["完全相同", "保留歷史vs重寫歷史"],
        correct: 1,
        explanation: "Merge保留歷史，Rebase重寫歷史"
    }
];

class Particle {
    constructor(x, y, color, type = 'normal') {
        this.x = x;
        this.y = y;
        this.color = color;
        this.type = type;
        this.size = Math.random() * 4 + 2;
        this.speedX = (Math.random() - 0.5) * 8;
        this.speedY = (Math.random() - 0.5) * 8;
        this.gravity = 0.1;
        this.life = 1;
        this.decay = Math.random() * 0.02 + 0.02;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.type !== 'floating') {
            this.speedY += this.gravity;
        }
        this.life -= this.decay;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// 初始化手部檢測
const hands = new Hands({
    locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
    }
});

hands.setOptions({
    maxNumHands: 2,
    modelComplexity: 1,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});

// 相機設置
let currentCamera = 'user';
let camera = null;

// 切換相機
switchCameraButton.addEventListener('click', async () => {
    if (camera) {
        await camera.stop();
    }
    currentCamera = currentCamera === 'user' ? 'environment' : 'user';
    await initializeCamera();
});

// 初始化相機
async function initializeCamera() {
    try {
        if (camera) {
            await camera.stop();
        }

        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: 640,
                height: 480,
                facingMode: currentCamera
            }
        });

        videoElement.srcObject = stream;
        await videoElement.play();

        // 設置 canvas 尺寸
        handCanvas.width = videoElement.videoWidth;
        handCanvas.height = videoElement.videoHeight;
        gameCanvas.width = gameCanvas.offsetWidth;
        gameCanvas.height = gameCanvas.offsetHeight;

        // 初始化相機處理
        camera = new Camera(videoElement, {
            onFrame: async () => {
                await hands.send({image: videoElement});
            },
            width: 640,
            height: 480
        });

        await camera.start();
        loadingMessage.style.display = 'none';
        startScreen.style.display = 'flex';
    } catch (error) {
        console.error('Error accessing camera:', error);
        loadingMessage.textContent = '無法訪問相機，請確保已授予權限';
    }
}

// 顯示新問題
function showQuestion() {
    if (questions.length === 0) {
        endGame();
        return;
    }

    const questionArea = document.getElementById('question-area');
    gameState.currentQuestion = questions[0];
    gameState.totalQuestions++;

    // 更新顯示
    questionArea.querySelector('h2').textContent = gameState.currentQuestion.question;
    optionLeft.querySelector('.option-content').textContent = gameState.currentQuestion.options[0];
    optionRight.querySelector('.option-content').textContent = gameState.currentQuestion.options[1];

    // 重置選項樣式
    optionLeft.className = 'option left';
    optionRight.className = 'option right';

    // 重置計時器
    gameState.timeLeft = 30;
    updateTimer();

    // 延遲後允許回答
    gameState.canAnswer = false;
    setTimeout(() => {
        gameState.canAnswer = true;
    }, 1000);
}

// 添加計時器函數
function startTimer() {
    if (gameState.timer) {
        clearInterval(gameState.timer);
    }
    
    gameState.timer = setInterval(() => {
        gameState.timeLeft--;
        updateTimer();
        
        if (gameState.timeLeft <= 0) {
            handleTimeout();
        }
    }, 1000);
}

function updateTimer() {
    const timerElement = document.getElementById('timer');
    if (timerElement) {
        timerElement.textContent = `時間：${gameState.timeLeft}秒`;
    }
}

function handleTimeout() {
    if (gameState.timer) {
        clearInterval(gameState.timer);
    }
    handleAnswer(-1); // -1 表示超時
}

// 處理答案
function handleAnswer(choice) {
    if (!gameState.canAnswer || !gameState.isPlaying) return;

    gameState.canAnswer = false;
    const isCorrect = choice === gameState.currentQuestion.correct;
    const selectedOption = choice === 0 ? optionLeft : optionRight;

    // 清除計時器
    if (gameState.timer) {
        clearInterval(gameState.timer);
    }

    // 更新分數和視覺效果
    if (isCorrect) {
        gameState.score += Math.max(10, gameState.timeLeft);
        gameState.correctAnswers++;
        scoreElement.textContent = `得分：${gameState.score}`;
        selectedOption.classList.add('correct');
        
        // 添加正確答案的解釋
        showExplanation(gameState.currentQuestion.explanation, true);
    } else {
        selectedOption.classList.add('wrong');
        showExplanation(gameState.currentQuestion.explanation, false);
    }

    // 移除已回答的問題
    questions.shift();

    // 延遲後顯示下一題或結束遊戲
    setTimeout(() => {
        if (questions.length > 0) {
            showQuestion();
            startTimer();
        } else {
            endGame();
        }
    }, gameState.answerDelay);
}

// 添加顯示解釋的函數
function showExplanation(explanation, isCorrect) {
    const explanationDiv = document.createElement('div');
    explanationDiv.className = `explanation ${isCorrect ? 'correct' : 'wrong'}`;
    explanationDiv.textContent = explanation;
    document.getElementById('question-area').appendChild(explanationDiv);
    
    setTimeout(() => {
        explanationDiv.remove();
    }, gameState.answerDelay - 100);
}

// 手勢處理
hands.onResults((results) => {
    const handCtx = handCanvas.getContext('2d');
    
    // 清除畫布
    handCtx.clearRect(0, 0, handCanvas.width, handCanvas.height);
    handCtx.save();
    handCtx.scale(-1, 1);
    handCtx.translate(-handCanvas.width, 0);

    // 繪製手部標記
    if (results.multiHandLandmarks) {
        for (const landmarks of results.multiHandLandmarks) {
            drawConnectors(handCtx, landmarks, HAND_CONNECTIONS, {
                color: '#00FF00',
                lineWidth: 2
            });
            drawLandmarks(handCtx, landmarks, {
                color: '#FF0000',
                lineWidth: 1,
                radius: 3
            });
        }

        // 如果遊戲正在進行，檢測手勢
        if (gameState.isPlaying && gameState.canAnswer) {
            results.multiHandedness.forEach((hand, index) => {
                const handType = hand.label.toLowerCase();
                const landmarks = results.multiHandLandmarks[index];
                const wristY = landmarks[0].y;
                const indexFingerY = landmarks[8].y;

                // 檢測手是否舉起（食指高於手腕）
                if (indexFingerY < wristY - 0.1) {
                    if (handType === 'left') {
                        handleAnswer(0);
                    } else if (handType === 'right') {
                        handleAnswer(1);
                    }
                }
            });
        }
    }
    
    handCtx.restore();
});

// 開始遊戲
function startGame() {
    gameState = {
        isPlaying: true,
        score: 0,
        currentQuestionIndex: 0,
        timeLeft: 30,
        totalQuestions: 0,
        correctAnswers: 0,
        currentQuestion: null,
        canAnswer: false,
        answerDelay: 1500,
        timer: null
    };
    
    // 打亂題目順序
    shuffleQuestions();
    
    startButton.style.display = 'none';
    scoreElement.textContent = '得分：0';
    instructions.classList.add('hide');
    showQuestion();
    startTimer();
}

// 添加打亂題目順序的函數
function shuffleQuestions() {
    for (let i = questions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [questions[i], questions[j]] = [questions[j], questions[i]];
    }
}

// 添加目標
function addTarget() {
    if (gameState.targets.length < 5) {
        gameState.targets.push({
            x: Math.random() * (gameCanvas.width - TARGET_SIZE),
            y: Math.random() * (gameCanvas.height - TARGET_SIZE)
        });
    }
}

// 檢查碰撞
function checkCollision(x1, y1, x2, y2, size) {
    return Math.abs(x1 - x2) < size && Math.abs(y1 - y2) < size;
}

// 遊戲循環
function gameLoop() {
    if (!gameState.isPlaying) return;

    // 清除遊戲畫布
    gameCtx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

    // 繪製玩家
    gameCtx.fillStyle = '#4CAF50';
    gameCtx.fillRect(
        gameState.playerX - PLAYER_SIZE/2,
        gameState.playerY - PLAYER_SIZE/2,
        PLAYER_SIZE,
        PLAYER_SIZE
    );

    // 添加新目標
    if (Math.random() < 0.02) {
        addTarget();
    }

    // 繪製和檢查目標
    gameState.targets = gameState.targets.filter(target => {
        // 檢查碰撞
        if (checkCollision(gameState.playerX, gameState.playerY, 
            target.x + TARGET_SIZE/2, target.y + TARGET_SIZE/2, 
            (PLAYER_SIZE + TARGET_SIZE)/2)) {
            gameState.score += 1;
            scoreElement.textContent = `得分：${gameState.score}`;
            return false;
        }

        // 繪製目標
        gameCtx.fillStyle = '#FFD700';
        gameCtx.fillRect(target.x, target.y, TARGET_SIZE, TARGET_SIZE);
        return true;
    });

    requestAnimationFrame(gameLoop);
}

// 結束遊戲
function endGame() {
    gameState.isPlaying = false;
    if (gameState.timer) {
        clearInterval(gameState.timer);
    }

    const accuracy = Math.round((gameState.correctAnswers / gameState.totalQuestions) * 100);
    const gameOverMessage = `
        遊戲結束！
        最終得分：${gameState.score}
        答對題數：${gameState.correctAnswers}/${gameState.totalQuestions}
        正確率：${accuracy}%
    `;

    alert(gameOverMessage);
    location.reload(); // 重新載入頁面以重置遊戲
}

// 事件監聽器
startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', startGame);

// 初始化遊戲
window.addEventListener('load', () => {
    initializeCamera();
    // 調整遊戲畫布大小
    function resizeGame() {
        gameCanvas.width = gameCanvas.offsetWidth;
        gameCanvas.height = gameCanvas.offsetHeight;
    }
    window.addEventListener('resize', resizeGame);
    resizeGame();
});

// 添加特效函數
function addParticles(x, y, color, count, type = 'normal') {
    for (let i = 0; i < count; i++) {
        particles.push(new Particle(x, y, color, type));
    }
} 
