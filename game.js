// 遊戲狀態
const gameState = {
    isPlaying: false,
    score: 0,
    currentChallenge: null,
    selectedOption: null,
    canAnswer: false,
    cooldown: false
};

// 程式設計挑戰題庫
const challenges = [
    {
        question: "在JavaScript中，如何輸出'Hello World'?",
        options: [
            'console.log("Hello World")',
            'print("Hello World")'
        ],
        correct: 0,
        explanation: "console.log() 是 JavaScript 中用於輸出訊息的標準方法"
    },
    {
        question: "如何宣告一個變數?",
        options: [
            'let myVar = 10',
            'variable myVar = 10'
        ],
        correct: 0,
        explanation: "let 是 JavaScript 中宣告變數的關鍵字"
    },
    {
        question: "如何建立一個陣列?",
        options: [
            'let arr = [1, 2, 3]',
            'array(1, 2, 3)'
        ],
        correct: 0,
        explanation: "使用方括號 [] 是在 JavaScript 中建立陣列的標準方式"
    },
    {
        question: "如何寫一個 if 條件判斷?",
        options: [
            'if (x > 0) { }',
            'when (x > 0) { }'
        ],
        correct: 0,
        explanation: "if 是 JavaScript 中進行條件判斷的關鍵字"
    },
    {
        question: "如何定義一個函數?",
        options: [
            'function add(a, b) { }',
            'def add(a, b) { }'
        ],
        correct: 0,
        explanation: "function 是 JavaScript 中定義函數的關鍵字"
    }
];

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

// 初始化相機
async function initializeCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: 640,
                height: 480,
                facingMode: "user"
            }
        });

        const videoElement = document.getElementById('input-video');
        videoElement.srcObject = stream;
        await videoElement.play();

        const handCanvas = document.getElementById('hand-canvas');
        handCanvas.width = videoElement.videoWidth;
        handCanvas.height = videoElement.videoHeight;

        const camera = new Camera(videoElement, {
            onFrame: async () => {
                await hands.send({image: videoElement});
            },
            width: 640,
            height: 480
        });

        await camera.start();
    } catch (error) {
        console.error('相機初始化錯誤:', error);
        showFeedback('錯誤', '請確保已授予相機權限並重新整理頁面。', 'wrong');
    }
}

// 處理手部檢測結果
hands.onResults((results) => {
    const handCanvas = document.getElementById('hand-canvas');
    const handCtx = handCanvas.getContext('2d');
    
    handCtx.save();
    handCtx.clearRect(0, 0, handCanvas.width, handCanvas.height);

    // 繪製攝像頭畫面
    handCtx.drawImage(
        document.getElementById('input-video'),
        0,
        0,
        handCanvas.width,
        handCanvas.height
    );

    if (results.multiHandLandmarks) {
        results.multiHandLandmarks.forEach((landmarks, index) => {
            // 繪製手部標記
            drawConnectors(handCtx, landmarks, HAND_CONNECTIONS, {
                color: '#00FF00',
                lineWidth: 5
            });
            drawLandmarks(handCtx, landmarks, {
                color: '#FF0000',
                lineWidth: 2,
                radius: 4
            });

            // 手勢控制
            if (gameState.isPlaying && gameState.canAnswer && !gameState.cooldown) {
                const handX = landmarks[0].x;
                const handY = landmarks[0].y;
                const indexFingerY = landmarks[8].y;

                // 左手選擇選項
                if (handX < 0.5 && indexFingerY < handY - 0.1) {
                    const selectedIndex = Math.floor(handY * 2);
                    selectOption(selectedIndex);
                }
                // 右手確認答案
                else if (handX > 0.5 && indexFingerY < handY - 0.1) {
                    if (gameState.selectedOption !== null) {
                        checkAnswer();
                    }
                }
            }
        });
    }

    handCtx.restore();
});

// 開始遊戲
function startGame() {
    // 移除開始按鈕
    document.querySelector('.start-button').style.display = 'none';

    // 創建遊戲容器
    const container = document.createElement('div');
    container.className = 'game-container';
    container.innerHTML = `
        <div class="question-container">
            <h2 id="question"></h2>
            <div class="options"></div>
        </div>
    `;
    document.body.appendChild(container);

    gameState.isPlaying = true;
    gameState.score = 0;
    document.getElementById('score').textContent = '0';
    
    nextQuestion();
}

// 選擇選項
function selectOption(index) {
    if (!gameState.canAnswer || gameState.cooldown) return;
    
    const options = document.querySelectorAll('.option');
    if (index >= 0 && index < options.length) {
        options.forEach(option => option.classList.remove('selected'));
        options[index].classList.add('selected');
        gameState.selectedOption = index;
    }
}

// 顯示反饋
function showFeedback(title, message, type) {
    const existingFeedback = document.querySelector('.feedback');
    if (existingFeedback) {
        existingFeedback.remove();
    }

    const feedback = document.createElement('div');
    feedback.className = `feedback ${type}`;
    feedback.innerHTML = `
        <h3>${title}</h3>
        <p>${message}</p>
    `;
    document.body.appendChild(feedback);

    // 顯示動畫
    setTimeout(() => feedback.classList.add('show'), 10);
    setTimeout(() => {
        feedback.classList.remove('show');
        setTimeout(() => feedback.remove(), 300);
    }, 2000);
}

// 檢查答案
function checkAnswer() {
    if (!gameState.canAnswer || gameState.cooldown) return;
    
    gameState.cooldown = true;
    gameState.canAnswer = false;
    const isCorrect = gameState.selectedOption === gameState.currentChallenge.correct;
    
    if (isCorrect) {
        gameState.score += 100;
        document.getElementById('score').textContent = gameState.score;
        showFeedback('答對了！', gameState.currentChallenge.explanation, 'correct');
    } else {
        showFeedback('答錯了！', gameState.currentChallenge.explanation, 'wrong');
    }

    setTimeout(() => {
        gameState.cooldown = false;
        nextQuestion();
    }, 2000);
}

// 下一題
function nextQuestion() {
    const randomIndex = Math.floor(Math.random() * challenges.length);
    gameState.currentChallenge = challenges[randomIndex];
    
    document.getElementById('question').textContent = gameState.currentChallenge.question;
    
    const optionsContainer = document.querySelector('.options');
    optionsContainer.innerHTML = gameState.currentChallenge.options.map((option, index) => `
        <div class="option" onclick="selectOption(${index})">
            ${option}
        </div>
    `).join('');
    
    gameState.selectedOption = null;
    gameState.canAnswer = true;
}

// 初始化遊戲
document.addEventListener('DOMContentLoaded', initializeCamera); 
