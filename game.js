// 遊戲狀態
const gameState = {
    isPlaying: false,
    health: 100,
    codeQuality: 0,
    streak: 0,
    currentChallenge: null,
    selectedOption: null,
    canAnswer: false,
    lastGesture: null,
    gestureTimeout: null,
    timer: null,
    timeLeft: 0
};

// 遊戲配置
const config = {
    maxHealth: 100,
    healthLossOnWrong: 25,
    healthLossPerSecond: 0.5,
    healthGainOnCorrect: 15,
    streakBonus: 5,
    maxStreak: 5,
    challengeTime: 20,
    minChallengeTime: 10
};

// 程式設計挑戰題庫
const challenges = [
    {
        level: 1,
        code: `function sayHello() {
    // 填入正確的程式碼
    ___________
}`,
        options: [
            'console.log("Hello, World!");',
            'print("Hello, World!");',
            'echo("Hello, World!");',
            'System.out.println("Hello, World!");'
        ],
        correct: 0,
        hint: "JavaScript中使用console.log()來輸出訊息",
        explanation: "console.log()是JavaScript中用於在控制台輸出訊息的標準方法。"
    },
    {
        level: 1,
        code: `// 宣告一個變數
___ name = "Alice";`,
        options: [
            'var',
            'string',
            'dim',
            'def'
        ],
        correct: 0,
        hint: "JavaScript中使用var、let或const來宣告變數",
        explanation: "var是JavaScript中宣告變數的其中一種方式。"
    },
    {
        level: 2,
        code: `// 創建一個陣列
const numbers = [1, 2, 3, 4, 5];
// 如何取得陣列的長度？
console.log(_________);`,
        options: [
            'numbers.length',
            'numbers.size()',
            'numbers.count',
            'len(numbers)'
        ],
        correct: 0,
        hint: "JavaScript陣列有一個屬性可以獲取長度",
        explanation: "length是JavaScript陣列的屬性，用於獲取陣列的長度。"
    },
    {
        level: 2,
        code: `// 條件判斷
let age = 18;
if (___) {
    console.log("成年");
}`,
        options: [
            'age >= 18',
            'age => 18',
            'age equals 18',
            'age.isAdult()'
        ],
        correct: 0,
        hint: "使用正確的比較運算符",
        explanation: ">= 是「大於等於」的比較運算符。"
    },
    {
        level: 3,
        code: `// 迴圈結構
_____ (let i = 0; i < 5; i++) {
    console.log(i);
}`,
        options: [
            'for',
            'while',
            'loop',
            'repeat'
        ],
        correct: 0,
        hint: "這是最常見的迴圈結構",
        explanation: "for迴圈是最常用的迴圈結構之一，適用於已知迭代次數的情況。"
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
        videoElement.style.transform = 'scaleX(1)';
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
        loadingScreen.style.display = 'none';
        tutorial.style.display = 'flex';

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
    
    handCtx.clearRect(0, 0, handCanvas.width, handCanvas.height);
    handCtx.save();
    handCtx.scale(1, 1);
    handCtx.translate(0, 0);

    // 繪製視訊
    handCtx.drawImage(videoElement, 0, 0, handCanvas.width, handCanvas.height);

    if (results.multiHandLandmarks) {
        // 繪製手部標記
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

        // 遊戲控制邏輯
        if (gameState.isPlaying && gameState.canAnswer) {
            const hands = results.multiHandedness;
            let currentGesture = null;

            hands.forEach((hand, index) => {
                // 因為攝像頭是鏡像的，所以我們需要反轉手的類型
                const handType = hand.label.toLowerCase() === 'left' ? 'right' : 'left';
                const landmarks = results.multiHandLandmarks[index];
                
                // 獲取手腕和食指的座標
                const wrist = landmarks[0];
                const indexFinger = landmarks[8];
                
                // 計算相對位移
                const deltaY = indexFinger.y - wrist.y;
                const deltaX = indexFinger.x - wrist.x;
                
                // 設定手勢判定的閾值
                const threshold = 0.15;
                
                // 判斷手勢方向
                if (Math.abs(deltaY) > Math.abs(deltaX)) {
                    // 垂直移動
                    if (deltaY < -threshold) {
                        currentGesture = 0; // 上
                    } else if (deltaY > threshold) {
                        currentGesture = 2; // 下
                    }
                } else {
                    // 水平移動
                    if (deltaX < -threshold) {
                        currentGesture = 3; // 左
                    } else if (deltaX > threshold) {
                        currentGesture = 1; // 右
                    }
                }

                // 如果是右手且做出選擇手勢，確認答案
                if (handType === 'right' && currentGesture !== null) {
                    clearTimeout(gameState.gestureTimeout);
                    if (gameState.lastGesture === currentGesture) {
                        checkAnswer(currentGesture);
                    } else {
                        gameState.lastGesture = currentGesture;
                        selectOption(currentGesture);
                        // 設置確認計時器
                        gameState.gestureTimeout = setTimeout(() => {
                            gameState.lastGesture = null;
                        }, 1500);
                    }
                }
            });

            // 如果沒有檢測到手勢，重置狀態
            if (hands.length === 0) {
                gameState.lastGesture = null;
                clearTimeout(gameState.gestureTimeout);
            }
        }
    }
    
    handCtx.restore();
});

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
    const option = options[gameState.selectedOption];
    option?.classList.add(isCorrect ? 'correct' : 'wrong');
    
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
        option?.classList.remove('correct', 'wrong');
    }, 1900);
}

// 更新UI
function updateUI() {
    levelDisplay.textContent = gameState.level;
    scoreDisplay.textContent = gameState.score;
    healthBar.style.width = `${gameState.health}%`;
    document.querySelector('.code-quality').textContent = gameState.codeQuality;
    document.querySelector('.streak-count').textContent = gameState.streak;
}

// 更新挑戰題目
function updateChallenge(challenge) {
    const codeBlock = document.querySelector('.code-block pre');
    codeBlock.textContent = challenge.code;
    updateOptions(challenge);
}

// 下一個挑戰
function nextChallenge() {
    const levelChallenges = challenges.filter(c => c.level === gameState.level);
    
    if (levelChallenges.length === 0) {
        gameState.level++;
        if (gameState.level > 3) {
            completeGame();
            return;
        }
    }
    
    const availableChallenges = challenges.filter(c => c.level === gameState.level);
    const randomIndex = Math.floor(Math.random() * availableChallenges.length);
    gameState.currentChallenge = availableChallenges[randomIndex];
    
    updateChallenge(gameState.currentChallenge);
    gameState.selectedOption = null;
    gameState.canAnswer = true;
    gameState.lastGesture = null;
    clearTimeout(gameState.gestureTimeout);
}

// 開始遊戲
function startGame() {
    gameState.isPlaying = true;
    gameState.health = config.maxHealth;
    gameState.codeQuality = 0;
    gameState.streak = 0;
    
    tutorial.style.display = 'none';
    updateUI();
    nextChallenge();
    startTimer();
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

// 暫停遊戲
function pauseGame() {
    if (!gameState.isPlaying) return;
    
    gameState.isPlaying = false;
    // 顯示暫停選單
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

// 完成遊戲
function completeGame() {
    gameState.isPlaying = false;
    alert(`恭喜完成所有關卡！\n最終得分：${gameState.score}`);
    location.reload();
}

// 事件監聽
startGameButton.addEventListener('click', startGame);
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
