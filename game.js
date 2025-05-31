// 遊戲狀態
const gameState = {
    isPlaying: false,
    level: 1,
    score: 0,
    health: 100,
    currentChallenge: null,
    selectedOption: null,
    canAnswer: false
};

// 遊戲配置
const config = {
    maxHealth: 100,
    healthLossOnWrong: 20,
    healthGainOnCorrect: 10,
    scorePerCorrect: 100,
    bonusScorePerSecond: 10,
    challengeTime: 30
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
            'print("Hello, World!");'
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
            'string'
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
            'numbers.size()'
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
            'age => 18'
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
            'while'
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

// 手勢處理
hands.onResults((results) => {
    const handCtx = handCanvas.getContext('2d');
    
    handCtx.clearRect(0, 0, handCanvas.width, handCanvas.height);
    handCtx.save();
    handCtx.scale(-1, 1);
    handCtx.translate(-handCanvas.width, 0);

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
            let leftHandRaised = false;
            let rightHandRaised = false;
            let leftHandY = null;
            let rightHandY = null;

            hands.forEach((hand, index) => {
                const handType = hand.label.toLowerCase() === 'left' ? 'right' : 'left';
                const landmarks = results.multiHandLandmarks[index];
                const wristY = landmarks[0].y;
                const indexFingerY = landmarks[8].y;

                if (handType === 'left') {
                    leftHandY = wristY;
                    if (indexFingerY < wristY - 0.1) {
                        leftHandRaised = true;
                    }
                } else if (handType === 'right') {
                    rightHandY = wristY;
                    if (indexFingerY < wristY - 0.1) {
                        rightHandRaised = true;
                    }
                }
            });

            // 使用左手上下移動選擇選項
            if (leftHandY !== null) {
                const normalizedY = leftHandY * handCanvas.height;
                const optionHeight = handCanvas.height / 2;
                const selectedIndex = Math.floor(normalizedY / optionHeight);
                selectOption(Math.min(selectedIndex, 1));
            }

            // 使用右手確認選擇
            if (rightHandRaised && gameState.selectedOption !== null) {
                checkAnswer(gameState.selectedOption);
            }

            // 雙手舉起暫停遊戲
            if (leftHandRaised && rightHandRaised) {
                pauseGame();
            }
        }
    }
    
    handCtx.restore();
});

// 選擇選項
function selectOption(index) {
    options.forEach(option => option.classList.remove('selected'));
    options[index].classList.add('selected');
    gameState.selectedOption = index;
}

// 檢查答案
function checkAnswer(selectedIndex) {
    if (!gameState.canAnswer) return;

    gameState.canAnswer = false;
    const isCorrect = selectedIndex === gameState.currentChallenge.correct;

    if (isCorrect) {
        gameState.score += config.scorePerCorrect;
        gameState.health = Math.min(config.maxHealth, gameState.health + config.healthGainOnCorrect);
        showFeedback(true, gameState.currentChallenge.explanation);
    } else {
        gameState.health = Math.max(0, gameState.health - config.healthLossOnWrong);
        showFeedback(false, gameState.currentChallenge.explanation);
    }

    updateUI();

    setTimeout(() => {
        if (gameState.health <= 0) {
            endGame();
        } else {
            nextChallenge();
        }
    }, 2000);
}

// 顯示反饋
function showFeedback(isCorrect, explanation) {
    const option = options[gameState.selectedOption];
    option.classList.add(isCorrect ? 'correct' : 'wrong');
    
    const feedback = document.createElement('div');
    feedback.className = `feedback ${isCorrect ? 'correct' : 'wrong'}`;
    feedback.textContent = isCorrect ? '正確！' : '錯誤！';
    feedback.innerHTML += `<p class="explanation">${explanation}</p>`;
    
    document.querySelector('.challenge-container').appendChild(feedback);
    
    setTimeout(() => {
        feedback.remove();
        option.classList.remove('correct', 'wrong');
    }, 1900);
}

// 更新UI
function updateUI() {
    levelDisplay.textContent = gameState.level;
    scoreDisplay.textContent = gameState.score;
    healthBar.style.width = `${gameState.health}%`;
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
    
    challengeCode.textContent = gameState.currentChallenge.code;
    options.forEach((option, index) => {
        option.querySelector('.option-text').textContent = gameState.currentChallenge.options[index];
    });
    
    gameState.selectedOption = null;
    gameState.canAnswer = true;
    options.forEach(option => option.classList.remove('selected'));
}

// 開始遊戲
function startGame() {
    gameState.isPlaying = true;
    gameState.level = 1;
    gameState.score = 0;
    gameState.health = config.maxHealth;
    
    tutorial.style.display = 'none';
    updateUI();
    nextChallenge();
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
    alert(`遊戲結束！\n最終得分：${gameState.score}\n達到等級：${gameState.level}`);
    location.reload();
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
