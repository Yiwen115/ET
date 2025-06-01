// 遊戲狀態
const gameState = {
    isPlaying: false,
    health: 100,
    achievements: [],
    streak: 0,
    wrongStreak: 0,
    currentChallenge: null,
    selectedOption: null,
    canAnswer: false,
    timer: null,
    timeLeft: 0,
    leftHandGesture: null,
    rightHandGesture: null,
    usedKeyboard: false,
    lastSecondCounter: 0,
    quickAnswerStreak: 0,
    lastAnswerTime: 0,
    context: {
        wrongStreak: 0,
        streak: 0,
        isCorrect: false,
        usedKeyboard: false,
        lastSecondCounter: 0,
        quickAnswerStreak: 0
    }
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
    },
    {
        code: "下列哪種學習理論最強調學習者主動建構知識的重要性？",
        options: [
            '建構主義',
            '行為主義',
            '認知主義',
            '社會學習論'
        ],
        correct: 0,
        explanation: "建構主義強調學習者透過經驗和反思主動建構自己的知識體系。"
    },
    {
        code: "在混合式學習(Blended Learning)中，以下哪個元素最為重要？",
        options: [
            '線上和實體的無縫整合',
            '完全線上學習',
            '純粹面對面教學',
            '單向知識傳授'
        ],
        correct: 0,
        explanation: "混合式學習強調線上和實體學習環境的有效整合，以達到最佳學習效果。"
    },
    {
        code: "何謂 LMS (Learning Management System)？",
        options: [
            '學習管理系統',
            '圖書管理系統',
            '生活管理系統',
            '語言管理系統'
        ],
        correct: 0,
        explanation: "LMS是用於管理、追蹤和提供教育課程或培訓計劃的軟體平台。"
    },
    {
        code: "AR（擴增實境）在教育中的主要優勢是什麼？",
        options: [
            '提供互動式體驗',
            '降低教育成本',
            '減少教師工作量',
            '簡化課程內容'
        ],
        correct: 0,
        explanation: "AR技術能夠提供豐富的互動式學習體驗，幫助學生更好地理解抽象概念。"
    },
    {
        code: "以下哪種評量方式最適合評估學生的高階思考能力？",
        options: [
            '專題導向學習',
            '選擇題測驗',
            '填空題',
            '是非題'
        ],
        correct: 0,
        explanation: "專題導向學習能夠評估學生的分析、綜合和創造等高階思考能力。"
    },
    {
        code: "在遠距教學中，以下哪個因素最重要？",
        options: [
            '師生互動品質',
            '影片畫質',
            '上課時長',
            '作業數量'
        ],
        correct: 0,
        explanation: "良好的師生互動是確保遠距教學效果的關鍵因素。"
    },
    {
        code: "何謂 MOOC (Massive Open Online Course)？",
        options: [
            '大規模開放式線上課程',
            '小型線上教學',
            '實體密集課程',
            '混合式教學'
        ],
        correct: 0,
        explanation: "MOOC是一種向大眾開放的線上課程，允許無限制的參與和開放式訪問。"
    },
    {
        code: "數位教學設計中的 ADDIE 模型，其中的 'E' 代表什麼？",
        options: [
            'Evaluation（評鑑）',
            'Education（教育）',
            'Engagement（參與）',
            'Enhancement（增強）'
        ],
        correct: 0,
        explanation: "ADDIE模型中的E代表Evaluation（評鑑），用於評估教學設計的效果。"
    },
    {
        code: "在教育科技中，何謂 'Digital Divide'（數位落差）？",
        options: [
            '科技近用機會的不平等',
            '數位教材的分類',
            '網路連線速度',
            '軟體版本差異'
        ],
        correct: 0,
        explanation: "數位落差指的是不同群體之間在獲取和使用數位科技資源方面的差距。"
    },
    {
        code: "以下哪種教學策略最能促進學生的協作學習？",
        options: [
            '線上討論區',
            '影片觀看',
            '個人作業',
            '線上測驗'
        ],
        correct: 0,
        explanation: "線上討論區提供平台讓學生進行知識分享和協作學習。"
    },
    {
        code: "教育遊戲化(Gamification)的主要目的是什麼？",
        options: [
            '提高學習動機',
            '減少教學時間',
            '降低教育成本',
            '簡化課程內容'
        ],
        correct: 0,
        explanation: "遊戲化教學主要目的是通過遊戲元素提高學生的學習興趣和動機。"
    },
    {
        code: "皮亞傑的認知發展理論中，「可逆性思維」出現在哪個階段？",
        options: [
            '具體運思期',
            '感覺動作期',
            '前運思期',
            '形式運思期'
        ],
        correct: 0,
        explanation: "可逆性思維在具體運思期（7-11歲）開始發展，讓兒童能理解事物的可逆轉性。"
    },
    {
        code: "根據馬斯洛需求層次理論，在追求自我實現之前，需要先滿足哪個需求？",
        options: [
            '尊重需求',
            '生理需求',
            '安全需求',
            '愛與歸屬需求'
        ],
        correct: 0,
        explanation: "在馬斯洛的需求層次中，尊重需求是通往自我實現前的最後一個基本需求。"
    },
    {
        code: "維高斯基的最近發展區(ZPD)理論中，學習最有效的狀態是？",
        options: [
            '略高於目前能力的挑戰',
            '遠超過目前能力的挑戰',
            '低於目前能力的任務',
            '完全符合目前能力的任務'
        ],
        correct: 0,
        explanation: "最近發展區理論指出，學習任務應該略高於學習者目前的能力水平，但在有支持的情況下可以達成。"
    },
    {
        code: "在增強學習動機時，下列哪種獎勵最有效？",
        options: [
            '內在獎勵',
            '物質獎勵',
            '分數獎勵',
            '社會比較'
        ],
        correct: 0,
        explanation: "內在獎勵（如成就感、興趣）比外在獎勵更能持久地維持學習動機。"
    },
    {
        code: "根據訊息處理理論，要將訊息從短期記憶轉入長期記憶，最有效的方法是？",
        options: [
            '深度處理和複習',
            '反覆背誦',
            '增加訊息量',
            '延長學習時間'
        ],
        correct: 0,
        explanation: "深度處理（理解意義）和適當的複習間隔是將訊息轉入長期記憶的最有效方法。"
    },
    {
        code: "班度拉的社會學習理論中，哪個因素最能影響自我效能感？",
        options: [
            '成功經驗',
            '口頭說服',
            '生理狀態',
            '替代經驗'
        ],
        correct: 0,
        explanation: "直接的成功經驗是建立和增強自我效能感最有效的來源。"
    },
    {
        code: "在處理學習障礙學生時，首要任務是什麼？",
        options: [
            '及早識別和診斷',
            '降低學習要求',
            '增加作業量',
            '隔離教學'
        ],
        correct: 0,
        explanation: "及早識別和準確診斷是幫助學習障礙學生的關鍵第一步。"
    },
    {
        code: "根據多元智能理論，以下哪項不是迦納提出的智能類型？",
        options: [
            '創造力智能',
            '音樂智能',
            '人際智能',
            '空間智能'
        ],
        correct: 0,
        explanation: "創造力不是迦納多元智能理論中的獨立智能類型，而是可能在各種智能中展現的特質。"
    },
    {
        code: "在課堂管理中，最有效的預防問題行為的方式是？",
        options: [
            '建立明確的常規',
            '嚴格的懲罰制度',
            '增加作業負擔',
            '隔離問題學生'
        ],
        correct: 0,
        explanation: "建立明確的課堂常規和期望能有效預防大多數課堂問題行為。"
    },
    {
        code: "影響學習遷移（Transfer of Learning）的最關鍵因素是？",
        options: [
            '情境相似度',
            '學習時間長短',
            '教師資歷',
            '學習環境'
        ],
        correct: 0,
        explanation: "學習情境與應用情境的相似度越高，學習遷移的效果越好。"
    },
    {
        code: "根據認知負荷理論，在教學設計中應注意什麼？",
        options: [
            '降低外在認知負荷',
            '增加訊息密度',
            '提供更多選擇',
            '加快教學節奏'
        ],
        correct: 0,
        explanation: "應降低與學習內容無關的外在認知負荷，讓學習者能專注於重要的訊息處理。"
    },
    {
        code: "自我調節學習中最重要的能力是？",
        options: [
            '後設認知能力',
            '記憶力',
            '閱讀速度',
            '寫作技巧'
        ],
        correct: 0,
        explanation: "後設認知能力讓學習者能監控和調整自己的學習過程，是自我調節學習的核心。"
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

// 特效和成就系統
const effectsSystem = {
    snowflakes: [],
    raindrops: [],
    stars: [],
    currentEffect: null,
    container: null,
    achievements: [],

    init() {
        // 創建特效容器
        this.container = document.createElement('div');
        this.container.className = 'effects-container';
        document.body.appendChild(this.container);

        // 創建成就容器
        this.achievementsContainer = document.createElement('div');
        this.achievementsContainer.className = 'achievements-container';
        document.body.appendChild(this.achievementsContainer);

        // 創建特效強度指示器
        this.intensityIndicator = document.createElement('div');
        this.intensityIndicator.className = 'effects-intensity';
        for (let i = 0; i < 5; i++) {
            const dot = document.createElement('div');
            dot.className = 'intensity-dot';
            this.intensityIndicator.appendChild(dot);
        }
        document.body.appendChild(this.intensityIndicator);
    },

    // 更新特效強度指示器
    updateIntensity(level) {
        const dots = this.intensityIndicator.querySelectorAll('.intensity-dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index < level);
        });
    },

    // 創建下雪特效
    createSnowflake() {
        const snowflake = document.createElement('div');
        snowflake.className = 'snowflake';
        snowflake.textContent = '❄';
        snowflake.style.left = Math.random() * 100 + 'vw';
        snowflake.style.animationDuration = (Math.random() * 3 + 2) + 's';
        this.container.appendChild(snowflake);
        this.snowflakes.push(snowflake);
        
        snowflake.addEventListener('animationend', () => {
            snowflake.remove();
            this.snowflakes = this.snowflakes.filter(s => s !== snowflake);
        });
    },

    // 創建下雨特效
    createRaindrop() {
        const raindrop = document.createElement('div');
        raindrop.className = 'raindrop';
        raindrop.style.left = Math.random() * 100 + 'vw';
        raindrop.style.animationDuration = (Math.random() * 0.5 + 0.5) + 's';
        this.container.appendChild(raindrop);
        this.raindrops.push(raindrop);
        
        raindrop.addEventListener('animationend', () => {
            raindrop.remove();
            this.raindrops = this.raindrops.filter(r => r !== raindrop);
        });
    },

    // 創建星星特效
    createStar() {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + 'vw';
        star.style.top = Math.random() * 100 + 'vh';
        star.style.width = star.style.height = (Math.random() * 3 + 2) + 'px';
        star.style.animationDuration = (Math.random() * 2 + 1) + 's';
        this.container.appendChild(star);
        this.stars.push(star);
        
        setTimeout(() => {
            star.remove();
            this.stars = this.stars.filter(s => s !== star);
        }, 3000);
    },

    // 顯示成就
    showAchievement(title, description, icon) {
        const achievement = document.createElement('div');
        achievement.className = 'achievement';
        achievement.innerHTML = `
            <div class="achievement-icon">${icon}</div>
            <div class="achievement-content">
                <div class="achievement-title">${title}</div>
                <div class="achievement-description">${description}</div>
            </div>
        `;
        this.achievementsContainer.appendChild(achievement);
        
        achievement.addEventListener('animationend', (e) => {
            if (e.animationName === 'fadeOut') {
                achievement.remove();
            }
        });
    },

    // 顯示連擊特效
    showStreakEffect(streak) {
        const effect = document.createElement('div');
        effect.className = 'streak-effect';
        effect.textContent = `${streak} 連擊！`;
        document.body.appendChild(effect);
        
        effect.addEventListener('animationend', () => {
            effect.remove();
        });
    },

    // 開始特效
    startEffect(type, intensity = 1) {
        this.stopEffect();
        this.currentEffect = type;
        this.updateIntensity(intensity);

        const effectInterval = setInterval(() => {
            if (this.currentEffect !== type) {
                clearInterval(effectInterval);
                return;
            }

            for (let i = 0; i < intensity; i++) {
                switch (type) {
                    case 'snow':
                        this.createSnowflake();
                        break;
                    case 'rain':
                        this.createRaindrop();
                        break;
                    case 'stars':
                        this.createStar();
                        break;
                }
            }
        }, 200);
    },

    // 停止特效
    stopEffect() {
        this.currentEffect = null;
        this.updateIntensity(0);
        this.container.innerHTML = '';
        this.snowflakes = [];
        this.raindrops = [];
        this.stars = [];
    }
};

// 成就定義
const achievements = {
    QUICK_THINKER: {
        id: 'quick_thinker',
        title: '4%仔',
        description: '10秒內答對題目，這題簡單啦！',
        icon: '⚡',
        condition: (timeLeft) => timeLeft >= 10
    },
    PERFECT_STREAK: {
        id: 'perfect_streak',
        title: '起飛啦',
        description: '5連擊！這就是實力！',
        icon: '🚀',
        condition: (streak) => streak >= 5
    },
    RETAKE_MASTER: {
        id: 'retake_master',
        title: '大二孤寂淚',
        description: '連續答錯3次，重修系列收藏家',
        icon: '😭',
        condition: (wrongStreak) => wrongStreak >= 3
    },
    DEADLINE_FIGHTER: {
        id: 'deadline_fighter',
        title: '死線戰士',
        description: '在最後1秒答題',
        icon: '⏰',
        condition: (timeLeft) => timeLeft === 1
    },
    LUCKY_GUESS: {
        id: 'lucky_guess',
        title: '蒙對大師',
        description: '生命值低於20%時答對題目',
        icon: '🎰',
        condition: (health) => health <= 20
    },
    WEEKEND_CODER: {
        id: 'weekend_coder',
        title: '週末才開始寫',
        description: '連續錯2題後答對',
        icon: '🎮',
        condition: (context) => context.wrongStreak >= 2 && context.isCorrect
    },
    STACK_OVERFLOW: {
        id: 'stack_overflow',
        title: 'Ctrl+C/V達人',
        description: '不看題目直接選答案',
        icon: '📋',
        condition: (timeLeft) => timeLeft >= 19  // 超快回答
    },
    KEYBOARD_WARRIOR: {
        id: 'keyboard_warrior',
        title: '鍵盤俠',
        description: '使用鍵盤而不是手勢操作',
        icon: '⌨️',
        condition: (context) => context.usedKeyboard
    },
    DEBUG_MASTER: {
        id: 'debug_master',
        title: '除錯天菜',
        description: '從錯誤中學習並連續答對',
        icon: '🐛',
        condition: (context) => context.wrongStreak >= 1 && context.streak >= 2
    },
    COFFEE_ADDICT: {
        id: 'coffee_addict',
        title: '咖啡成癮者',
        description: '深夜模式解鎖',
        icon: '☕',
        condition: () => new Date().getHours() >= 23 || new Date().getHours() <= 5
    },
    PROCRASTINATOR: {
        id: 'procrastinator',
        title: '拖延大師',
        description: '每題都在最後3秒答題',
        icon: '🦥',
        condition: (context) => context.lastSecondCounter >= 3
    },
    SPEED_DEMON: {
        id: 'speed_demon',
        title: '手速超車',
        description: '3秒內連續答對兩題',
        icon: '⚡',
        condition: (context) => context.quickAnswerStreak >= 2
    }
};

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
        const timeBonus = Math.floor(gameState.timeLeft / 2);
        gameState.streak = Math.min(config.maxStreak, gameState.streak + 1);
        gameState.wrongStreak = 0;
        const streakBonus = (gameState.streak - 1) * config.streakBonus;
        
        gameState.health = Math.min(config.maxHealth, 
            gameState.health + config.healthGainOnCorrect + streakBonus);

        checkAchievements(true);

        if (gameState.streak >= 2) {
            effectsSystem.showStreakEffect(gameState.streak);
            
            if (gameState.streak >= 5) {
                effectsSystem.startEffect('stars', 5);
            } else if (gameState.streak >= 4) {
                effectsSystem.startEffect('snow', 4);
            } else if (gameState.streak >= 3) {
                effectsSystem.startEffect('rain', 3);
            }
        }
        
        showFeedback(true, gameState.currentChallenge.explanation, 
            `+${timeBonus} 時間獎勵\n+${streakBonus} 連擊獎勵！`);
    } else {
        gameState.health = Math.max(0, gameState.health - config.healthLossOnWrong);
        gameState.streak = 0;
        gameState.wrongStreak++;
        
        checkAchievements(false);
        
        effectsSystem.stopEffect();
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
    
    const achievementsDisplay = document.querySelector('.achievements-display');
    if (achievementsDisplay) {
        achievementsDisplay.innerHTML = gameState.achievements.map(id => {
            const achievement = achievements[id];
            return `
                <div class="achievement-badge" title="${achievement.description}">
                    <div class="achievement-icon">${achievement.icon}</div>
                    <div class="achievement-name">${achievement.title}</div>
                </div>
            `;
        }).join('');
    }
    
    const streakCount = document.querySelector('.streak-count');
    if (streakCount) streakCount.textContent = gameState.streak;
}

// 檢查並授予成就
function checkAchievements(isCorrect) {
    // 更新上下文
    gameState.context = {
        wrongStreak: gameState.wrongStreak,
        streak: gameState.streak,
        isCorrect: isCorrect,
        usedKeyboard: gameState.usedKeyboard,
        lastSecondCounter: gameState.lastSecondCounter,
        quickAnswerStreak: gameState.quickAnswerStreak
    };

    // 檢查時間相關成就
    const now = Date.now();
    if (now - gameState.lastAnswerTime <= 3000) {
        gameState.quickAnswerStreak++;
    } else {
        gameState.quickAnswerStreak = 0;
    }
    gameState.lastAnswerTime = now;

    // 檢查最後一秒答題
    if (gameState.timeLeft <= 3) {
        gameState.lastSecondCounter++;
    } else {
        gameState.lastSecondCounter = 0;
    }

    // 隨機成就檢查（20%機率觸發檢查）
    if (Math.random() < 0.2) {
        const randomAchievements = [
            'COFFEE_ADDICT',
            'KEYBOARD_WARRIOR',
            'STACK_OVERFLOW',
            'WEEKEND_CODER'
        ];
        const randomAchievement = randomAchievements[Math.floor(Math.random() * randomAchievements.length)];
        if (!gameState.achievements.includes(randomAchievement)) {
            const achievement = achievements[randomAchievement];
            if (achievement.condition(gameState.context)) {
                gameState.achievements.push(randomAchievement);
                effectsSystem.showAchievement(
                    achievement.title,
                    achievement.description,
                    achievement.icon
                );
            }
        }
    }

    // 檢查所有成就
    Object.entries(achievements).forEach(([key, achievement]) => {
        if (!gameState.achievements.includes(key)) {
            const conditionMet = achievement.condition(
                key.includes('STREAK') ? gameState.streak :
                key.includes('HEALTH') ? gameState.health :
                key.includes('TIME') ? gameState.timeLeft :
                gameState.context
            );
            
            if (conditionMet) {
                gameState.achievements.push(key);
                effectsSystem.showAchievement(
                    achievement.title,
                    achievement.description,
                    achievement.icon
                );
            }
        }
    });
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
                <div class="achievements-summary">
                    <h3>獲得的成就</h3>
                    <div class="achievements-grid">
                        ${gameState.achievements.map(id => {
                            const achievement = achievements[id];
                            return `
                                <div class="achievement-badge" title="${achievement.description}">
                                    <div class="achievement-icon">${achievement.icon}</div>
                                    <div class="achievement-name">${achievement.title}</div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
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

    // 隨機打亂選項順序
    const shuffledOptions = shuffleArray([...challenge.options]);
    // 記錄正確答案的新位置
    const newCorrectIndex = shuffledOptions.indexOf(challenge.options[challenge.correct]);
    // 更新當前挑戰的正確答案索引
    gameState.currentChallenge = {
        ...challenge,
        options: shuffledOptions,
        correct: newCorrectIndex
    };
    
    updateOptions(gameState.currentChallenge);
}

// Fisher-Yates 洗牌算法
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
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
    
    gameState.usedKeyboard = true;
    
    switch (e.key) {
        case 'ArrowUp':
            selectOption(0);
            break;
        case 'ArrowRight':
            selectOption(1);
            break;
        case 'ArrowDown':
            selectOption(2);
            break;
        case 'ArrowLeft':
            selectOption(3);
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

// 在遊戲開始時初始化特效系統
window.addEventListener('load', () => {
    effectsSystem.init();
}); 
