// 遊戲狀態
const gameState = {
    isPlaying: false,
    health: 100,
    codeQuality: 0,
    streak: 0,
    currentChallenge: null,
    selectedOption: null,
    canAnswer: false,
    timer: null,
    timeLeft: 0,
    leftHandGesture: null,
    rightHandGesture: null
};

// 遊戲配置
const config = {
    maxHealth: 100,
    healthLossOnWrong: 25,    // 答錯扣血量
    healthLossPerSecond: 0.5, // 每秒扣血量
    healthGainOnCorrect: 15,  // 答對回血量
    streakBonus: 5,          // 連擊獎勵
    maxStreak: 5,            // 最大連擊數
    challengeTime: 20,       // 每題時間
    gestureThreshold: 0.15   // 手勢判定閾值
};

// 程式設計挑戰題庫
const challenges = [
    {
        code: `// 如何在JavaScript中輸出 "Hello World"？
console._____("Hello World");`,
        options: [
            'log',
            'print',
            'write',
            'echo'
        ],
        correct: 0,
        explanation: "在JavaScript中，console.log()是最常用的輸出方法。"
    },
    {
        code: `// 宣告一個變數 x 並賦值為 10
___ x = 10;`,
        options: [
            'let',
            'int',
            'dim',
            'var'
        ],
        correct: 0,
        explanation: "let 是 JavaScript 中宣告變數的現代方式。"
    },
    {
        code: `// 如何獲取陣列的長度？
const arr = [1, 2, 3];
console.log(arr.____);`,
        options: [
            'length',
            'size',
            'count',
            'len'
        ],
        correct: 0,
        explanation: "在 JavaScript 中，使用 length 屬性來獲取陣列長度。"
    },
    {
        code: `// 如何檢查 x 是否大於 10？
if (x ___ 10) {
    console.log("x 大於 10");
}`,
        options: [
            '>',
            '=>',
            '->',
            'gt'
        ],
        correct: 0,
        explanation: "> 符號用於比較大小，表示「大於」。"
    }
];

// DOM 元素
const videoElement = document.getElementById('input-video');
const handCanvas = document.getElementById('hand-canvas');
const gameCanvas = document.getElementById('game-canvas');
const challengeCode = document.getElementById('challenge-code');
const options = document.querySelectorAll('.option');
const levelDisplay = document.getElementById('level');
const scoreDisplay = document.getElementById('score');
const healthBar = document.querySelector('.health-fill');
const loadingScreen = document.getElementById('loading-screen');
const tutorial = document.getElementById('tutorial');
const startGameButton = document.getElementById('start-game');

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
                facingMode: 'user'
            }
        });

        videoElement.srcObject = stream;
        await videoElement.play();

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
        document.getElementById('loading-screen').style.display = 'none';
        document.getElementById('tutorial').style.display = 'flex';

    } catch (error) {
        console.error('相機初始化錯誤:', error);
        alert('無法訪問相機，請確保已授予權限並重新整理頁面');
    }
}

// 更新選項
function updateOptions(challenge) {
    const optionsContainer = document.querySelector('.options-container');
    optionsContainer.innerHTML = `
        <div class="option" data-position="top" data-index="0">${challenge.options[0]}</div>
        <div class="option" data-position="right" data-index="1">${challenge.options[1]}</div>
        <div class="option" data-position="bottom" data-index="2">${challenge.options[2]}</div>
        <div class="option" data-position="left" data-index="3">${challenge.options[3]}</div>
        <div class="option" data-position="center">?</div>
    `;
}

// 手勢處理
hands.onResults((results) => {
    const handCtx = handCanvas.getContext('2d');
    
    // 清除畫布
    handCtx.clearRect(0, 0, handCanvas.width, handCanvas.height);
    
    // 繪製鏡像的視訊
    handCtx.save();
    handCtx.scale(-1, 1);
    handCtx.translate(-handCanvas.width, 0);
    handCtx.drawImage(videoElement, 0, 0, handCanvas.width, handCanvas.height);
    handCtx.restore();
    
    if (results.multiHandLandmarks) {
        // 繪製手部標記
        handCtx.save();
        handCtx.scale(-1, 1);
        handCtx.translate(-handCanvas.width, 0);

        results.multiHandLandmarks.forEach((landmarks, index) => {
            const handedness = results.multiHandedness[index];
            const isLeft = handedness.label.toLowerCase() === 'left';
            const color = isLeft ? '#00FF00' : '#FF0000';
            
            drawConnectors(handCtx, landmarks, HAND_CONNECTIONS, {
                color: color,
                lineWidth: 2
            });
            drawLandmarks(handCtx, landmarks, {
                color: color,
                lineWidth: 1,
                radius: 3,
                fillColor: color
            });
        });

        handCtx.restore();

        // 遊戲控制邏輯
        if (gameState.isPlaying && gameState.canAnswer) {
            // 重置手勢狀態
            let leftHandGesture = null;
            let rightHandGesture = null;

            results.multiHandedness.forEach((hand, index) => {
                const isLeft = hand.label.toLowerCase() === 'left';
                const handType = isLeft ? 'right' : 'left'; // 因為鏡像效果需要反轉
                const landmarks = results.multiHandLandmarks[index];
                
                // 獲取手腕和食指的座標
                const wrist = landmarks[0];
                const indexFinger = landmarks[8];
                
                // 計算相對位移（考慮鏡像效果）
                const deltaY = indexFinger.y - wrist.y;
                const deltaX = -(indexFinger.x - wrist.x);
                
                // 判斷手勢方向
                let gesture = null;
                if (Math.abs(deltaY) > Math.abs(deltaX)) {
                    if (deltaY < -config.gestureThreshold) gesture = 0; // 上
                    else if (deltaY > config.gestureThreshold) gesture = 2; // 下
                } else {
                    if (deltaX < -config.gestureThreshold) gesture = 3; // 左
                    else if (deltaX > config.gestureThreshold) gesture = 1; // 右
                }

                // 儲存手勢
                if (handType === 'left') leftHandGesture = gesture;
                else rightHandGesture = gesture;
            });

            // 更新遊戲狀態
            gameState.leftHandGesture = leftHandGesture;
            gameState.rightHandGesture = rightHandGesture;

            // 處理手勢
            if (leftHandGesture !== null) {
                selectOption(leftHandGesture);
            }

            if (rightHandGesture === 0 && gameState.selectedOption !== null) {
                checkAnswer(gameState.selectedOption);
            }

            if (leftHandGesture === 2 && rightHandGesture === 2) {
                pauseGame();
            }

            // 更新手勢提示
            updateGestureHint(leftHandGesture, rightHandGesture);
        }
    }
});

// 更新手勢提示
function updateGestureHint(leftGesture, rightGesture) {
    const gestureHint = document.querySelector('.gesture-hint');
    if (!gestureHint) return;

    const directions = ['上', '右', '下', '左'];
    let hintText = '';
    
    if (leftGesture !== null) {
        hintText = `左手：${directions[leftGesture]} `;
    }
    
    if (rightGesture === 0) {
        hintText += '右手：確認';
    } else if (rightGesture === 2 && leftGesture === 2) {
        hintText = '暫停遊戲';
    }

    gestureHint.textContent = hintText || '等待手勢...';
}

// 選擇選項
function selectOption(index) {
    const options = document.querySelectorAll('.option');
    options.forEach(option => option.classList.remove('selected'));
    const selectedOption = document.querySelector(`.option[data-index="${index}"]`);
    if (selectedOption) {
        selectedOption.classList.add('selected');
        gameState.selectedOption = index;
    }
}

// 檢查答案
function checkAnswer(selectedIndex) {
    if (!gameState.canAnswer) return;
    
    clearInterval(gameState.timer);
    gameState.canAnswer = false;
    const isCorrect = selectedIndex === gameState.currentChallenge.correct;

    if (isCorrect) {
        // 計算獎勵
        const timeBonus = Math.floor(gameState.timeLeft / 2);
        gameState.streak = Math.min(config.maxStreak, gameState.streak + 1);
        const streakBonus = (gameState.streak - 1) * config.streakBonus;
        
        // 更新生命值和程式碼品質
        gameState.health = Math.min(config.maxHealth, 
            gameState.health + config.healthGainOnCorrect + streakBonus);
        gameState.codeQuality += 10 + timeBonus + streakBonus;
        
        showFeedback(true, gameState.currentChallenge.explanation, 
            `+${timeBonus} 時間獎勵\n+${streakBonus} 連擊獎勵！`);
    } else {
        gameState.health = Math.max(0, gameState.health - config.healthLossOnWrong);
        gameState.streak = 0;
        showFeedback(false, gameState.currentChallenge.explanation);
    }

    updateUI();

    setTimeout(() => {
        if (gameState.health <= 0) {
            endGame();
        } else {
            nextChallenge();
            startTimer();
        }
    }, 2000);
}

// 顯示反饋
function showFeedback(isCorrect, explanation, bonus = '') {
    const option = document.querySelector(`.option[data-index="${gameState.selectedOption}"]`);
    if (option) {
        option.classList.add(isCorrect ? 'correct' : 'wrong');
    }
    
    const feedback = document.createElement('div');
    feedback.className = `feedback ${isCorrect ? 'correct' : 'wrong'}`;
    feedback.innerHTML = `
        <div class="feedback-title">${isCorrect ? '正確！' : '錯誤！'}</div>
        <p class="explanation">${explanation}</p>
        ${bonus ? `<div class="bonus-info">${bonus}</div>` : ''}
        ${isCorrect ? `<div class="streak-info">連擊：${gameState.streak}</div>` : ''}
    `;
    
    document.querySelector('.challenge-container').appendChild(feedback);
    
    setTimeout(() => {
        feedback.remove();
        if (option) {
            option.classList.remove('correct', 'wrong');
        }
    }, 1900);
}

// 更新UI
function updateUI() {
    const healthText = document.querySelector('.health-text');
    const healthFill = document.querySelector('.health-fill');
    
    if (healthText) healthText.textContent = `${Math.round(gameState.health)}%`;
    if (healthFill) healthFill.style.width = `${gameState.health}%`;
    
    const codeQuality = document.querySelector('.code-quality');
    if (codeQuality) codeQuality.textContent = gameState.codeQuality;
    
    const streakCount = document.querySelector('.streak-count');
    if (streakCount) streakCount.textContent = gameState.streak;
}

// 開始計時器
function startTimer() {
    gameState.timeLeft = config.challengeTime;
    updateTimerDisplay();
    
    gameState.timer = setInterval(() => {
        gameState.timeLeft--;
        gameState.health = Math.max(0, gameState.health - config.healthLossPerSecond);
        
        updateTimerDisplay();
        updateUI();
        
        if (gameState.timeLeft <= 0 || gameState.health <= 0) {
            if (gameState.health <= 0) {
                endGame();
            } else {
                checkAnswer(-1); // 時間到，視為答錯
            }
        }
    }, 1000);
}

// 更新計時器顯示
function updateTimerDisplay() {
    const timerElement = document.querySelector('.timer-value');
    if (timerElement) {
        timerElement.textContent = gameState.timeLeft;
        timerElement.style.color = gameState.timeLeft <= 5 ? 'var(--error-color)' : 'var(--text-color)';
    }
}

// 開始遊戲
function startGame() {
    gameState.isPlaying = true;
    gameState.health = config.maxHealth;
    gameState.codeQuality = 0;
    gameState.streak = 0;
    
    document.getElementById('tutorial').style.display = 'none';
    updateUI();
    nextChallenge();
    startTimer();
}

// 暫停遊戲
function pauseGame() {
    if (!gameState.isPlaying) return;
    
    gameState.isPlaying = false;
    clearInterval(gameState.timer);
    
    const pauseMenu = document.createElement('div');
    pauseMenu.className = 'pause-menu';
    pauseMenu.innerHTML = `
        <div class="pause-content">
            <h2>遊戲暫停</h2>
            <button onclick="resumeGame()">繼續遊戲</button>
            <button onclick="location.reload()">重新開始</button>
        </div>
    `;
    document.body.appendChild(pauseMenu);
}

// 繼續遊戲
function resumeGame() {
    gameState.isPlaying = true;
    const pauseMenu = document.querySelector('.pause-menu');
    if (pauseMenu) {
        pauseMenu.remove();
    }
    startTimer();
}

// 結束遊戲
function endGame() {
    gameState.isPlaying = false;
    clearInterval(gameState.timer);
    
    const gameOverScreen = document.createElement('div');
    gameOverScreen.className = 'game-over-screen';
    gameOverScreen.innerHTML = `
        <div class="game-over-content">
            <h2>遊戲結束</h2>
            <div class="final-stats">
                <p>程式碼品質分數：${gameState.codeQuality}</p>
                <p>最高連擊數：${gameState.streak}</p>
            </div>
            <button onclick="location.reload()" class="restart-button">重新開始</button>
        </div>
    `;
    
    document.body.appendChild(gameOverScreen);
}

// 更新挑戰
function updateChallenge(challenge) {
    const codeBlock = document.querySelector('.code-block pre');
    if (codeBlock) {
        codeBlock.textContent = challenge.code;
    }
    updateOptions(challenge);
}

// 下一個挑戰
function nextChallenge() {
    const randomIndex = Math.floor(Math.random() * challenges.length);
    gameState.currentChallenge = challenges[randomIndex];
    updateChallenge(gameState.currentChallenge);
    gameState.selectedOption = null;
    gameState.canAnswer = true;
}

// 事件監聽
document.getElementById('start-game').addEventListener('click', startGame);
window.addEventListener('load', initializeCamera);

// 添加鍵盤控制（用於測試）
document.addEventListener('keydown', (e) => {
    if (!gameState.isPlaying) return;
    
    switch (e.key) {
        case 'ArrowUp':
        case 'ArrowDown':
            const newIndex = e.key === 'ArrowUp' ? 0 : 1;
            selectOption(newIndex);
            break;
        case 'Enter':
            if (gameState.selectedOption !== null) {
                checkAnswer(gameState.selectedOption);
            }
            break;
        case 'Escape':
            pauseGame();
            break;
    }
}); 
