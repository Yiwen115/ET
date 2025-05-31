// 遊戲狀態
const gameState = {
    isPlaying: false,
    level: 1,
    score: 0,
    health: 100,
    currentChallenge: null,
    selectedOption: null,
    canAnswer: false,
    combo: 1,
    challengesCompleted: 0,
    timeLeft: 30,
    timer: null,
    achievements: []
};

// 遊戲配置
const config = {
    maxHealth: 100,
    healthLossOnWrong: 20,
    healthGainOnCorrect: 10,
    scorePerCorrect: 100,
    bonusScorePerSecond: 10,
    challengeTime: 30,
    maxCombo: 5,
    comboMultiplier: 1.5,
    challengesPerLevel: 10
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

// 成就系統
const achievements = [
    {
        id: 'first_correct',
        title: '初次勝利',
        description: '第一次回答正確',
        icon: '🌟',
        unlocked: false
    },
    {
        id: 'perfect_combo',
        title: '完美連擊',
        description: '達成5連擊',
        icon: '🔥',
        unlocked: false
    },
    {
        id: 'speed_master',
        title: '閃電手',
        description: '在5秒內回答正確',
        icon: '⚡',
        unlocked: false
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

// 設備檢測
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

// 添加方向警告
const orientationWarning = document.createElement('div');
orientationWarning.className = 'orientation-warning';
orientationWarning.innerHTML = `
    <div class="orientation-warning-content">
        <span class="orientation-icon">📱</span>
        <h2>請將設備轉為豎屏模式</h2>
        <p>為了獲得最佳體驗，請將您的設備旋轉至豎屏模式。</p>
    </div>
`;
document.body.appendChild(orientationWarning);

// 監聽方向變化
window.addEventListener('orientationchange', handleOrientationChange);
window.addEventListener('resize', handleOrientationChange);

function handleOrientationChange() {
    if (isMobile) {
        const isLandscape = window.innerWidth > window.innerHeight;
        orientationWarning.classList.toggle('show', isLandscape);
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

// 初始化相機
async function initializeCamera() {
    try {
        const constraints = {
            video: {
                width: { ideal: isMobile ? 1280 : 640 },
                height: { ideal: isMobile ? 720 : 480 },
                facingMode: isMobile ? "environment" : "user",
                frameRate: { ideal: 30 }
            }
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        videoElement.srcObject = stream;
        await videoElement.play();

        // 設置畫布尺寸
        const setCanvasSize = () => {
            const videoAspectRatio = videoElement.videoWidth / videoElement.videoHeight;
            const containerWidth = videoElement.offsetWidth;
            const containerHeight = videoElement.offsetHeight;
            const containerAspectRatio = containerWidth / containerHeight;

            let canvasWidth, canvasHeight;
            if (containerAspectRatio > videoAspectRatio) {
                canvasHeight = containerHeight;
                canvasWidth = containerHeight * videoAspectRatio;
            } else {
                canvasWidth = containerWidth;
                canvasHeight = containerWidth / videoAspectRatio;
            }

            handCanvas.width = canvasWidth;
            handCanvas.height = canvasHeight;
        };

        // 監聽視頻加載完成事件
        videoElement.addEventListener('loadedmetadata', setCanvasSize);
        window.addEventListener('resize', setCanvasSize);

        const camera = new Camera(videoElement, {
            onFrame: async () => {
                await hands.send({image: videoElement});
            },
            width: videoElement.videoWidth,
            height: videoElement.videoHeight
        });

        await camera.start();
        loadingScreen.style.display = 'none';
        tutorial.style.display = 'flex';

        // 更新相機狀態
        document.querySelector('.camera-status .status-text').textContent = '已連接';
        document.querySelector('.camera-status .status-dot').style.backgroundColor = 'var(--success-color)';

    } catch (error) {
        console.error('相機初始化錯誤:', error);
        loadingScreen.style.display = 'none';
        showError('無法訪問相機', '請確保已授予相機權限並重新整理頁面。');
    }
}

// 錯誤提示
function showError(title, message) {
    const errorOverlay = document.createElement('div');
    errorOverlay.className = 'error-overlay';
    errorOverlay.innerHTML = `
        <div class="error-content">
            <h2>${title}</h2>
            <p>${message}</p>
            <button onclick="location.reload()" class="game-button">
                <span class="button-text">重試</span>
                <span class="button-icon">🔄</span>
            </button>
        </div>
    `;
    document.body.appendChild(errorOverlay);
}

// 手勢處理
hands.onResults((results) => {
    const handCtx = handCanvas.getContext('2d');
    
    handCtx.clearRect(0, 0, handCanvas.width, handCanvas.height);
    handCtx.save();
    
    // 繪製攝像頭畫面
    handCtx.drawImage(videoElement, 0, 0, handCanvas.width, handCanvas.height);

    if (results.multiHandLandmarks) {
        // 計算畫布縮放比例
        const scaleX = handCanvas.width / videoElement.videoWidth;
        const scaleY = handCanvas.height / videoElement.videoHeight;

        // 繪製手部標記
        for (const landmarks of results.multiHandLandmarks) {
            // 轉換座標
            const scaledLandmarks = landmarks.map(landmark => ({
                x: landmark.x * handCanvas.width,
                y: landmark.y * handCanvas.height,
                z: landmark.z
            }));

            drawConnectors(handCtx, scaledLandmarks, HAND_CONNECTIONS, {
                color: '#00FF00',
                lineWidth: 2
            });
            drawLandmarks(handCtx, scaledLandmarks, {
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
                const landmarks = results.multiHandLandmarks[index];
                const wristY = landmarks[0].y;
                const indexFingerY = landmarks[8].y;
                const handX = landmarks[0].x;

                // 根據手在畫面的位置判斷左右手
                const isOnLeftSide = handX < 0.5;
                
                if (isOnLeftSide) {
                    leftHandY = wristY;
                    if (indexFingerY < wristY - 0.1) {
                        leftHandRaised = true;
                    }
                } else {
                    rightHandY = wristY;
                    if (indexFingerY < wristY - 0.1) {
                        rightHandRaised = true;
                    }
                }

                // 顯示手部位置提示
                const debugText = isOnLeftSide ? "左手" : "右手";
                handCtx.fillStyle = '#ffffff';
                handCtx.font = '16px Arial';
                handCtx.fillText(debugText, handX * handCanvas.width, wristY * handCanvas.height);
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

// 更新UI
function updateUI() {
    levelDisplay.textContent = gameState.level;
    scoreDisplay.textContent = gameState.score;
    document.querySelector('.health-fill').style.width = `${gameState.health}%`;
    document.querySelector('.health-text').textContent = `${gameState.health}%`;
    document.querySelector('.progress-fill').style.width = `${(gameState.challengesCompleted / config.challengesPerLevel) * 100}%`;
    document.querySelector('.progress-text').textContent = `${gameState.challengesCompleted}/${config.challengesPerLevel}`;
    document.querySelector('#combo-count').textContent = `x${gameState.combo}`;
    document.querySelector('#challenge-number').textContent = gameState.challengesCompleted + 1;
    document.querySelector('#time-left').textContent = gameState.timeLeft;
    
    // 根據連擊數更新連擊計數器的視覺效果
    const comboElement = document.querySelector('.combo-meter');
    comboElement.className = `combo-meter ${gameState.combo >= 3 ? 'high-combo' : ''}`;
}

// 顯示成就
function showAchievement(achievement) {
    const popup = document.getElementById('achievement-popup');
    const text = popup.querySelector('.achievement-text');
    text.textContent = `${achievement.title} - ${achievement.description}`;
    popup.classList.add('show');
    setTimeout(() => popup.classList.remove('show'), 3000);
}

// 檢查成就
function checkAchievements(isCorrect, answerTime) {
    if (isCorrect) {
        // 檢查首次正確答案
        const firstCorrect = achievements.find(a => a.id === 'first_correct');
        if (!firstCorrect.unlocked) {
            firstCorrect.unlocked = true;
            showAchievement(firstCorrect);
        }

        // 檢查完美連擊
        if (gameState.combo === 5) {
            const perfectCombo = achievements.find(a => a.id === 'perfect_combo');
            if (!perfectCombo.unlocked) {
                perfectCombo.unlocked = true;
                showAchievement(perfectCombo);
            }
        }

        // 檢查快速回答
        if (config.challengeTime - gameState.timeLeft <= 5) {
            const speedMaster = achievements.find(a => a.id === 'speed_master');
            if (!speedMaster.unlocked) {
                speedMaster.unlocked = true;
                showAchievement(speedMaster);
            }
        }
    }
}

// 開始計時器
function startTimer() {
    gameState.timeLeft = config.challengeTime;
    if (gameState.timer) clearInterval(gameState.timer);
    
    gameState.timer = setInterval(() => {
        if (gameState.timeLeft > 0) {
            gameState.timeLeft--;
            updateUI();
        } else {
            checkAnswer(gameState.selectedOption, true);
        }
    }, 1000);
}

// 檢查答案
function checkAnswer(selectedIndex, timeOut = false) {
    if (!gameState.canAnswer) return;

    gameState.canAnswer = false;
    clearInterval(gameState.timer);
    const isCorrect = !timeOut && selectedIndex === gameState.currentChallenge.correct;

    if (isCorrect) {
        // 計算分數（包含連擊加成）
        const timeBonus = gameState.timeLeft * config.bonusScorePerSecond;
        const comboMultiplier = Math.min(gameState.combo, config.maxCombo) * config.comboMultiplier;
        const totalScore = Math.floor((config.scorePerCorrect + timeBonus) * comboMultiplier);
        
        gameState.score += totalScore;
        gameState.health = Math.min(config.maxHealth, gameState.health + config.healthGainOnCorrect);
        gameState.combo++;
        showFeedback(true, gameState.currentChallenge.explanation);
        
        // 顯示分數動畫
        const scorePopup = document.createElement('div');
        scorePopup.className = 'score-popup animate__animated animate__fadeOutUp';
        scorePopup.textContent = `+${totalScore}`;
        document.querySelector('.score-display').appendChild(scorePopup);
        setTimeout(() => scorePopup.remove(), 1000);
    } else {
        gameState.health = Math.max(0, gameState.health - config.healthLossOnWrong);
        gameState.combo = 1;
        showFeedback(false, timeOut ? "時間到！" : gameState.currentChallenge.explanation);
    }

    checkAchievements(isCorrect, config.challengeTime - gameState.timeLeft);
    updateUI();

    setTimeout(() => {
        if (gameState.health <= 0) {
            endGame();
        } else {
            gameState.challengesCompleted++;
            if (gameState.challengesCompleted >= config.challengesPerLevel) {
                levelUp();
            } else {
                nextChallenge();
            }
        }
    }, 2000);
}

// 升級
function levelUp() {
    gameState.level++;
    gameState.challengesCompleted = 0;
    gameState.health = config.maxHealth;
    
    const levelUpOverlay = document.createElement('div');
    levelUpOverlay.className = 'level-up-overlay animate__animated animate__fadeIn';
    levelUpOverlay.innerHTML = `
        <div class="level-up-content">
            <h2>Level Up! 🎉</h2>
            <p>你已經升到 Level ${gameState.level}</p>
            <button onclick="this.parentElement.parentElement.remove(); nextChallenge();" class="game-button">
                <span class="button-text">繼續挑戰</span>
                <span class="button-icon">➡️</span>
            </button>
        </div>
    `;
    document.body.appendChild(levelUpOverlay);
}

// 顯示反饋
function showFeedback(isCorrect, explanation) {
    const option = options[gameState.selectedOption];
    option.classList.add(isCorrect ? 'correct' : 'wrong');
    
    const feedback = document.createElement('div');
    feedback.className = `feedback ${isCorrect ? 'correct' : 'wrong'} animate__animated animate__fadeIn`;
    feedback.innerHTML = `
        <div class="feedback-header">
            <span class="feedback-icon">${isCorrect ? '✅' : '❌'}</span>
            <span class="feedback-result">${isCorrect ? '正確！' : '錯誤！'}</span>
        </div>
        <p class="explanation">${explanation}</p>
    `;
    
    document.querySelector('.challenge-container').appendChild(feedback);
    
    setTimeout(() => {
        feedback.classList.remove('animate__fadeIn');
        feedback.classList.add('animate__fadeOut');
        setTimeout(() => {
            feedback.remove();
            option.classList.remove('correct', 'wrong');
        }, 500);
    }, 1500);
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
    
    // 使用 highlight.js 美化程式碼
    challengeCode.textContent = gameState.currentChallenge.code;
    hljs.highlightElement(challengeCode);
    
    // 更新提示
    document.getElementById('challenge-hint').textContent = gameState.currentChallenge.hint;
    
    options.forEach((option, index) => {
        option.querySelector('.option-text').textContent = gameState.currentChallenge.options[index];
    });
    
    gameState.selectedOption = null;
    gameState.canAnswer = true;
    options.forEach(option => option.classList.remove('selected'));
    
    startTimer();
    updateUI();
}

// 開始遊戲
function startGame() {
    gameState.isPlaying = true;
    gameState.level = 1;
    gameState.score = 0;
    gameState.health = config.maxHealth;
    gameState.combo = 1;
    gameState.challengesCompleted = 0;
    
    tutorial.style.display = 'none';
    updateUI();
    nextChallenge();
}

// 暫停遊戲
function pauseGame() {
    if (!gameState.isPlaying) return;
    
    gameState.isPlaying = false;
    clearInterval(gameState.timer);
    document.getElementById('pause-menu').classList.remove('hide');
}

// 繼續遊戲
function resumeGame() {
    gameState.isPlaying = true;
    document.getElementById('pause-menu').classList.add('hide');
    startTimer();
}

// 重新開始遊戲
function restartGame() {
    location.reload();
}

// 顯示教學
function showTutorial() {
    document.getElementById('pause-menu').classList.add('hide');
    tutorial.style.display = 'flex';
}

// 結束遊戲
function endGame() {
    gameState.isPlaying = false;
    clearInterval(gameState.timer);
    
    const gameOverOverlay = document.createElement('div');
    gameOverOverlay.className = 'game-over-overlay animate__animated animate__fadeIn';
    gameOverOverlay.innerHTML = `
        <div class="game-over-content">
            <h2>遊戲結束</h2>
            <div class="final-stats">
                <div class="stat-item">
                    <span class="stat-label">最終得分</span>
                    <span class="stat-value">${gameState.score}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">達到等級</span>
                    <span class="stat-value">${gameState.level}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">完成挑戰</span>
                    <span class="stat-value">${gameState.challengesCompleted}</span>
                </div>
            </div>
            <div class="achievements-summary">
                <h3>解鎖成就</h3>
                <div class="achievements-list">
                    ${achievements.filter(a => a.unlocked).map(a => `
                        <div class="achievement-item">
                            <span class="achievement-icon">${a.icon}</span>
                            <span class="achievement-title">${a.title}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            <button onclick="location.reload()" class="game-button">
                <span class="button-text">重新挑戰</span>
                <span class="button-icon">🔄</span>
            </button>
        </div>
    `;
    document.body.appendChild(gameOverOverlay);
}

// 完成遊戲
function completeGame() {
    gameState.isPlaying = false;
    clearInterval(gameState.timer);
    
    const gameCompleteOverlay = document.createElement('div');
    gameCompleteOverlay.className = 'game-complete-overlay animate__animated animate__fadeIn';
    gameCompleteOverlay.innerHTML = `
        <div class="game-complete-content">
            <h2>恭喜完成！🎉</h2>
            <div class="final-stats">
                <div class="stat-item">
                    <span class="stat-label">最終得分</span>
                    <span class="stat-value">${gameState.score}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">完成時間</span>
                    <span class="stat-value">${Math.floor((config.challengeTime - gameState.timeLeft) / 60)}:${((config.challengeTime - gameState.timeLeft) % 60).toString().padStart(2, '0')}</span>
                </div>
            </div>
            <div class="achievements-summary">
                <h3>解鎖成就</h3>
                <div class="achievements-list">
                    ${achievements.filter(a => a.unlocked).map(a => `
                        <div class="achievement-item">
                            <span class="achievement-icon">${a.icon}</span>
                            <span class="achievement-title">${a.title}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            <button onclick="location.reload()" class="game-button">
                <span class="button-text">再玩一次</span>
                <span class="button-icon">🎮</span>
            </button>
        </div>
    `;
    document.body.appendChild(gameCompleteOverlay);
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
