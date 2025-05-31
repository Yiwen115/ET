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
    achievements: [],
    powerups: {
        timeFreeze: 2,
        hintReveal: 3,
        healthRestore: 1
    },
    statistics: {
        totalCorrect: 0,
        totalWrong: 0,
        bestCombo: 0,
        fastestAnswer: Infinity,
        totalPlayTime: 0
    },
    currentBackground: 0,
    startTime: null
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
    challengesPerLevel: 10,
    backgrounds: [
        'cyber-city',
        'matrix-rain',
        'digital-space',
        'tech-grid'
    ],
    soundEffects: {
        correct: 'correct.mp3',
        wrong: 'wrong.mp3',
        levelUp: 'level-up.mp3',
        achievement: 'achievement.mp3',
        gameOver: 'game-over.mp3',
        background: 'background-music.mp3'
    }
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
    },
    {
        id: 'level_master',
        title: '等級大師',
        description: '達到第3級',
        icon: '👑',
        unlocked: false
    },
    {
        id: 'perfect_score',
        title: '完美解答',
        description: '連續答對3題',
        icon: '💯',
        unlocked: false
    },
    {
        id: 'time_wizard',
        title: '時間魔法師',
        description: '使用3次時間凍結',
        icon: '⌛',
        unlocked: false,
        progress: 0,
        maxProgress: 3
    },
    {
        id: 'health_master',
        title: '生命守護者',
        description: '在生命值低於20%時完成挑戰',
        icon: '❤️',
        unlocked: false
    },
    {
        id: 'speed_demon',
        title: '極速惡魔',
        description: '連續3次在10秒內回答正確',
        icon: '👿',
        unlocked: false,
        progress: 0,
        maxProgress: 3
    }
];

// 道具系統
const powerups = {
    timeFreeze: {
        name: '時間凍結',
        description: '暫停倒數計時10秒',
        icon: '⌛',
        duration: 10,
        use: function() {
            if (gameState.powerups.timeFreeze > 0) {
                gameState.powerups.timeFreeze--;
                clearInterval(gameState.timer);
                const originalTime = gameState.timeLeft;
                showPowerupEffect('時間凍結！');
                
                setTimeout(() => {
                    gameState.timeLeft = originalTime;
                    startTimer();
                }, 10000);
                
                updatePowerupDisplay();
                
                // 更新成就進度
                const timeWizard = achievements.find(a => a.id === 'time_wizard');
                if (!timeWizard.unlocked) {
                    timeWizard.progress++;
                    if (timeWizard.progress >= timeWizard.maxProgress) {
                        timeWizard.unlocked = true;
                        showAchievement(timeWizard);
                    }
                }
            }
        }
    },
    hintReveal: {
        name: '提示顯示',
        description: '顯示更詳細的提示',
        icon: '💡',
        use: function() {
            if (gameState.powerups.hintReveal > 0) {
                gameState.powerups.hintReveal--;
                const detailedHint = gameState.currentChallenge.explanation;
                showDetailedHint(detailedHint);
                updatePowerupDisplay();
            }
        }
    },
    healthRestore: {
        name: '生命恢復',
        description: '恢復50%生命值',
        icon: '❤️',
        use: function() {
            if (gameState.powerups.healthRestore > 0) {
                gameState.powerups.healthRestore--;
                gameState.health = Math.min(100, gameState.health + 50);
                showPowerupEffect('生命恢復！');
                updatePowerupDisplay();
                updateUI();
            }
        }
    }
};

// 新增音效系統
let backgroundMusic;
const soundEffects = {};

function initializeAudio() {
    // 背景音樂
    backgroundMusic = new Audio('background-music.mp3');
    backgroundMusic.loop = true;
    backgroundMusic.volume = 0.3;

    // 音效
    Object.entries(config.soundEffects).forEach(([key, file]) => {
        soundEffects[key] = new Audio(file);
        soundEffects[key].volume = 0.5;
    });
}

function playSound(soundName) {
    if (soundEffects[soundName]) {
        soundEffects[soundName].currentTime = 0;
        soundEffects[soundName].play().catch(e => console.log('音效播放失敗:', e));
    }
}

// 顯示道具效果
function showPowerupEffect(message) {
    const effectOverlay = document.createElement('div');
    effectOverlay.className = 'powerup-effect animate__animated animate__fadeIn';
    effectOverlay.innerHTML = `
        <div class="effect-content">
            <span class="effect-text">${message}</span>
        </div>
    `;
    document.body.appendChild(effectOverlay);
    
    setTimeout(() => {
        effectOverlay.classList.remove('animate__fadeIn');
        effectOverlay.classList.add('animate__fadeOut');
        setTimeout(() => effectOverlay.remove(), 1000);
    }, 2000);
}

// 顯示詳細提示
function showDetailedHint(hint) {
    const hintBox = document.querySelector('.hint-box');
    const originalHint = hintBox.innerHTML;
    
    hintBox.innerHTML = `
        <span class="hint-icon">💡</span>
        <span id="challenge-hint" class="detailed-hint">${hint}</span>
    `;
    
    setTimeout(() => {
        hintBox.innerHTML = originalHint;
    }, 10000);
}

// 更新道具顯示
function updatePowerupDisplay() {
    const powerupContainer = document.querySelector('.powerup-container');
    if (!powerupContainer) return;
    
    powerupContainer.innerHTML = Object.entries(gameState.powerups).map(([key, count]) => `
        <div class="powerup-item" onclick="powerups['${key}'].use()">
            <span class="powerup-icon">${powerups[key].icon}</span>
            <span class="powerup-count">x${count}</span>
            <div class="powerup-tooltip">
                <strong>${powerups[key].name}</strong>
                <p>${powerups[key].description}</p>
            </div>
        </div>
    `).join('');
}

// 更新遊戲背景
function updateBackground() {
    const mainGame = document.querySelector('.main-game-area');
    mainGame.style.backgroundImage = `url(backgrounds/${config.backgrounds[gameState.currentBackground]}.jpg)`;
}

// 切換背景
function cycleBackground() {
    gameState.currentBackground = (gameState.currentBackground + 1) % config.backgrounds.length;
    updateBackground();
}

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

// 手勢控制狀態
const handControl = {
    lastLeftHandY: null,
    lastRightHandY: null,
    selectionCooldown: false,
    confirmCooldown: false,
    pauseCooldown: false,
    cooldownTime: 500, // 冷卻時間（毫秒）
    selectionThreshold: 0.1, // 選擇靈敏度
    confirmThreshold: 0.15, // 確認手勢靈敏度
    debugMode: false // 開啟後會顯示手部偵測資訊
};

// 初始化手部檢測
const hands = new Hands({
    locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
    }
});

// 更詳細的手部檢測配置
hands.setOptions({
    maxNumHands: 2, // 確保可以檢測到兩隻手
    modelComplexity: 1,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});

// 初始化相機
async function initializeCamera() {
    try {
        // 更新相機狀態為正在連接
        updateCameraStatus('正在連接相機...', 'warning');

        const constraints = {
            video: {
                width: { ideal: 640 },
                height: { ideal: 480 },
                facingMode: "user",
                frameRate: { ideal: 30 }
            }
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        videoElement.srcObject = stream;
        
        // 等待視頻元素完全加載
        await new Promise((resolve) => {
            videoElement.onloadedmetadata = () => {
                resolve();
            };
        });

        await videoElement.play();

        // 設置畫布尺寸
        function setCanvasSize() {
            handCanvas.width = videoElement.videoWidth;
            handCanvas.height = videoElement.videoHeight;

            // 設置繪圖上下文的變換
            const handCtx = handCanvas.getContext('2d');
            handCtx.clearRect(0, 0, handCanvas.width, handCanvas.height);
        }

        // 監聽視頻加載和窗口調整事件
        videoElement.addEventListener('loadedmetadata', setCanvasSize);
        window.addEventListener('resize', setCanvasSize);
        setCanvasSize();

        // 初始化相機處理
        const camera = new Camera(videoElement, {
            onFrame: async () => {
                try {
                    await hands.send({image: videoElement});
                } catch (error) {
                    console.error('手部檢測錯誤:', error);
                    updateCameraStatus('手部檢測錯誤', 'error');
                }
            },
            width: 640,
            height: 480
        });

        // 啟動相機
        await camera.start();
        updateCameraStatus('相機已連接，等待手部檢測...', 'success');
        
        // 開啟調試模式以便觀察問題
        handControl.debugMode = true;

    } catch (error) {
        console.error('相機初始化錯誤:', error);
        showError('相機初始化失敗', '請確保已授予相機權限並重新整理頁面。');
    }
}

// 處理手部檢測結果
function handleResults(results) {
    const handCtx = handCanvas.getContext('2d');
    
    // 清除畫布
    handCtx.clearRect(0, 0, handCanvas.width, handCanvas.height);

    // 保存當前狀態
    handCtx.save();
    
    // 應用鏡像變換
    handCtx.scale(-1, 1);
    handCtx.translate(-handCanvas.width, 0);

    // 繪製攝像頭畫面
    handCtx.drawImage(
        videoElement, 
        0, 
        0, 
        handCanvas.width, 
        handCanvas.height
    );

    // 更新手部檢測狀態
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        updateCameraStatus(`檢測到 ${results.multiHandLandmarks.length} 隻手`, 'success');

        // 繪製手部標記
        results.multiHandLandmarks.forEach((landmarks, index) => {
            // 轉換座標（考慮鏡像效果）
            const scaledLandmarks = landmarks.map(landmark => ({
                x: (1 - landmark.x) * handCanvas.width, // 鏡像 x 座標
                y: landmark.y * handCanvas.height,
                z: landmark.z
            }));

            // 繪製連接線
            drawConnectors(handCtx, landmarks, HAND_CONNECTIONS, {
                color: results.multiHandedness[index].label === 'Left' ? '#00FF00' : '#FF0000',
                lineWidth: 5
            });

            // 繪製關鍵點
            drawLandmarks(handCtx, landmarks, {
                color: '#FFFFFF',
                fillColor: results.multiHandedness[index].label === 'Left' ? '#00FF00' : '#FF0000',
                lineWidth: 2,
                radius: 6
            });

            // 處理手勢控制
            if (gameState.isPlaying && gameState.canAnswer) {
                const handType = results.multiHandedness[index].label;
                const wristY = landmarks[0].y;
                const indexFingerY = landmarks[8].y;
                const handX = landmarks[0].x;

                // 根據手的位置判斷左右手
                if (handX > 0.5) { // 因為已經鏡像，所以條件相反
                    // 左手控制選擇
                    if (!handControl.selectionCooldown && indexFingerY < wristY - handControl.selectionThreshold) {
                        const selectedIndex = Math.floor(wristY * 2);
                        selectOption(Math.min(selectedIndex, 1));
                        handControl.selectionCooldown = true;
                        setTimeout(() => {
                            handControl.selectionCooldown = false;
                        }, handControl.cooldownTime);
                    }
                } else {
                    // 右手控制確認
                    if (!handControl.confirmCooldown && 
                        gameState.selectedOption !== null && 
                        indexFingerY < wristY - handControl.confirmThreshold) {
                        checkAnswer(gameState.selectedOption);
                        handControl.confirmCooldown = true;
                        setTimeout(() => {
                            handControl.confirmCooldown = false;
                        }, handControl.cooldownTime);
                    }
                }
            }
        });
    } else {
        updateCameraStatus('未檢測到手部，請確保手部在畫面中', 'warning');
    }

    // 恢復狀態
    handCtx.restore();
}

// 更新相機狀態顯示
function updateCameraStatus(message, type) {
    const statusText = document.querySelector('.camera-status .status-text');
    const statusDot = document.querySelector('.camera-status .status-dot');
    
    if (statusText && statusDot) {
        statusText.textContent = message;
        statusDot.style.backgroundColor = type === 'success' ? 'var(--success-color)' :
                                        type === 'warning' ? 'var(--warning-color)' :
                                        'var(--error-color)';
        
        // 在控制台輸出狀態，方便調試
        console.log(`相機狀態: ${message} (${type})`);
    }
}

// 選擇選項
function selectOption(index) {
    if (!gameState.canAnswer) return;
    
    const options = document.querySelectorAll('.option');
    options.forEach(option => option.classList.remove('selected'));
    
    if (index >= 0 && index < options.length) {
        options[index].classList.add('selected');
        gameState.selectedOption = index;
    }
}

// 更新UI
function updateUI() {
    // 更新所有UI元素
    const elements = {
        'level': gameState.level,
        'score': gameState.score,
        'combo-count': `x${gameState.combo}`,
        'challenge-number': gameState.challengesCompleted + 1,
        'time-left': gameState.timeLeft
    };

    for (const [id, value] of Object.entries(elements)) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    // 更新血量條
    const healthFill = document.querySelector('.health-fill');
    const healthText = document.querySelector('.health-text');
    if (healthFill && healthText) {
        healthFill.style.width = `${gameState.health}%`;
        healthText.textContent = `${gameState.health}%`;
    }

    // 更新進度條
    const progressFill = document.querySelector('.progress-fill');
    const progressText = document.querySelector('.progress-text');
    if (progressFill && progressText) {
        const progress = (gameState.challengesCompleted / config.challengesPerLevel) * 100;
        progressFill.style.width = `${progress}%`;
        progressText.textContent = `${gameState.challengesCompleted}/${config.challengesPerLevel}`;
    }

    // 更新連擊效果
    const comboMeter = document.querySelector('.combo-meter');
    if (comboMeter) {
        comboMeter.className = `combo-meter ${gameState.combo >= 3 ? 'high-combo' : ''}`;
    }
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
            <h2>等級提升！🎉</h2>
            <p>你已經升到第 ${gameState.level} 級</p>
            <button onclick="this.parentElement.parentElement.remove(); nextChallenge();" class="game-button">
                <span class="button-text">繼續挑戰</span>
                <span class="button-icon">➡️</span>
            </button>
        </div>
    `;
    document.body.appendChild(levelUpOverlay);

    // 檢查等級成就
    if (gameState.level === 3) {
        const levelMaster = achievements.find(a => a.id === 'level_master');
        if (!levelMaster.unlocked) {
            levelMaster.unlocked = true;
            showAchievement(levelMaster);
        }
    }
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
    const challengeCode = document.getElementById('challenge-code');
    if (challengeCode) {
        challengeCode.textContent = gameState.currentChallenge.code;
        hljs.highlightElement(challengeCode);
    }
    
    // 更新提示
    const hintElement = document.getElementById('challenge-hint');
    if (hintElement) {
        hintElement.textContent = gameState.currentChallenge.hint;
    }
    
    // 更新選項
    updateOptions();
    
    gameState.selectedOption = null;
    gameState.canAnswer = true;
    
    startTimer();
    updateUI();
}

// 開始遊戲
function startGame() {
    // 創建遊戲容器
    const container = document.createElement('div');
    container.className = 'game-container';
    container.innerHTML = `
        <div class="game-interface">
            <div class="challenge-container">
                <div class="challenge-header">
                    <h2>Level <span id="level">1</span> Challenge <span id="challenge-number">1</span></h2>
                    <div class="timer">Time: <span id="time-left">30</span>s</div>
                </div>
                <pre><code id="challenge-code" class="javascript"></code></pre>
                <div class="hint-box">
                    <span class="hint-icon">💡</span>
                    <span id="challenge-hint"></span>
                </div>
            </div>
            <div class="options-container">
                <div class="options-wrapper"></div>
            </div>
            <div class="game-status">
                <div class="score-display">Score: <span id="score">0</span></div>
                <div class="health-bar">
                    <div class="health-fill"></div>
                    <span class="health-text">100%</span>
                </div>
                <div class="combo-meter">
                    Combo <span id="combo-count">x1</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill"></div>
                    <span class="progress-text">0/10</span>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(container);

    // 添加樣式
    const style = document.createElement('style');
    style.textContent = `
        .game-container {
            position: relative;
            width: 100%;
            height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-start;
            padding-top: 20px;
        }
        
        .game-interface {
            position: relative;
            width: 100%;
            max-width: 800px;
            z-index: 10;
        }

        .options-container {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 100%;
            max-width: 600px;
            z-index: 100;
        }

        .options-wrapper {
            display: flex;
            flex-direction: column;
            gap: 20px;
            padding: 20px;
            background: rgba(0, 0, 0, 0.8);
            border-radius: 10px;
        }

        .option {
            background: rgba(255, 255, 255, 0.1);
            border: 2px solid rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            padding: 15px;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .option:hover {
            background: rgba(255, 255, 255, 0.2);
            border-color: rgba(255, 255, 255, 0.4);
        }

        .option.selected {
            background: rgba(0, 255, 0, 0.2);
            border-color: #00ff00;
        }

        .option-content {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .option-number {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 50%;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
        }

        .option-text {
            font-size: 16px;
            color: white;
        }

        #hand-canvas {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1;
        }

        #input-video {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            z-index: 0;
        }
    `;
    document.head.appendChild(style);

    gameState.isPlaying = true;
    gameState.level = 1;
    gameState.score = 0;
    gameState.health = config.maxHealth;
    gameState.combo = 1;
    gameState.challengesCompleted = 0;
    gameState.startTime = Date.now();
    
    // 隱藏教學
    const tutorial = document.getElementById('tutorial');
    if (tutorial) {
        tutorial.style.display = 'none';
    }
    
    // 更新UI
    updateUI();
    updatePowerupDisplay();
    updateBackground();
    
    // 開始第一個挑戰
    nextChallenge();
}

// 更新選項
function updateOptions() {
    const optionsWrapper = document.querySelector('.options-wrapper');
    if (optionsWrapper && gameState.currentChallenge) {
        optionsWrapper.innerHTML = gameState.currentChallenge.options.map((option, index) => `
            <div class="option" onclick="selectOption(${index})">
                <div class="option-content">
                    <span class="option-number">${index + 1}</span>
                    <span class="option-text">${option}</span>
                </div>
            </div>
        `).join('');
    }
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
    backgroundMusic.pause();
    playSound('gameOver');
    
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
            <div class="statistics-summary">
                <h3>遊戲統計</h3>
                <div class="statistics-grid">
                    <div class="stat-item">
                        <span class="stat-label">正確次數</span>
                        <span class="stat-value">${gameState.statistics.totalCorrect}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">錯誤次數</span>
                        <span class="stat-value">${gameState.statistics.totalWrong}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">最佳連擊</span>
                        <span class="stat-value">${gameState.statistics.bestCombo}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">最快回答</span>
                        <span class="stat-value">${gameState.statistics.fastestAnswer === Infinity ? '-' : gameState.statistics.fastestAnswer + '秒'}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">遊戲時間</span>
                        <span class="stat-value">${Math.floor(gameState.statistics.totalPlayTime / 60)}分${gameState.statistics.totalPlayTime % 60}秒</span>
                    </div>
                </div>
            </div>
            <div class="achievements-summary">
                <h3>解鎖成就</h3>
                <div class="achievements-list">
                    ${achievements.filter(a => a.unlocked).map(a => `
                        <div class="achievement-item">
                            <span class="achievement-icon">${a.icon}</span>
                            <span class="achievement-title">${a.title}</span>
                            <span class="achievement-desc">${a.description}</span>
                        </div>
                    `).join('') || '<p>尚未解鎖任何成就</p>'}
                </div>
            </div>
            <div class="game-over-buttons">
                <button onclick="location.reload()" class="game-button">
                    <span class="button-text">重新挑戰</span>
                    <span class="button-icon">🔄</span>
                </button>
                <button onclick="showTutorial()" class="game-button secondary">
                    <span class="button-text">查看教學</span>
                    <span class="button-icon">📖</span>
                </button>
            </div>
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
                    `).join('') || '<p>尚未解鎖任何成就</p>'}
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

// 確保在頁面加載完成後初始化
document.addEventListener('DOMContentLoaded', () => {
    // 檢查瀏覽器支援
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        showError('瀏覽器不支援', '您的瀏覽器不支援攝像頭功能，請使用最新版本的Chrome、Firefox或Safari瀏覽器。');
        return;
    }

    // 初始化相機
    initializeCamera().catch(error => {
        console.error('初始化失敗:', error);
        showError('初始化失敗', '請確保已授予相機權限並重新整理頁面。');
    });
});

// 事件監聽
startGameButton.addEventListener('click', startGame);

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

// 在遊戲結束時更新統計資料
function updateStatistics(isCorrect, answerTime) {
    if (isCorrect) {
        gameState.statistics.totalCorrect++;
        gameState.statistics.fastestAnswer = Math.min(gameState.statistics.fastestAnswer, answerTime);
        gameState.statistics.bestCombo = Math.max(gameState.statistics.bestCombo, gameState.combo);
    } else {
        gameState.statistics.totalWrong++;
    }
    
    gameState.statistics.totalPlayTime = Math.floor((Date.now() - gameState.startTime) / 1000);
}

// 切換調試模式
function toggleDebugMode() {
    handControl.debugMode = !handControl.debugMode;
    updateCameraStatus(handControl.debugMode ? '調試模式開啟' : '已連接', 'success');
}

// 調整手勢靈敏度
function updateHandSensitivity(type, value) {
    if (type === 'selection') {
        handControl.selectionThreshold = value;
    } else if (type === 'confirm') {
        handControl.confirmThreshold = value;
    }
}

// 添加鍵盤快捷鍵
document.addEventListener('keydown', (e) => {
    if (e.key === 'D' && e.ctrlKey) {
        // Ctrl + D 切換調試模式
        e.preventDefault();
        toggleDebugMode();
    }
}); 
