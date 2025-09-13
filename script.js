// --- DOM要素の取得 ---
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const regionSelector = document.getElementById('region-selector');
const hintText = document.getElementById('hint-text');
const hintImage = document.getElementById('hint-image');
const answerArea = document.getElementById('answer-area');
const choicesGrid = document.getElementById('choices-grid');
const messageText = document.getElementById('message-text');
const scoreText = document.getElementById('score-text');
const nextButton = document.getElementById('next-button');

// --- グローバル変数 ---
let allQuestions = [];
let gameQuestions = [];
let currentQuestionIndex = 0;
let correctAnswers = 0;
let draggedItem = null;
const QUESTIONS_PER_GAME = 20;

// --- 初期化処理 ---
async function initialize() {
    try {
        const response = await fetch('lines.json');
        allQuestions = await response.json();
        displayRegionSelector();
    } catch (error) {
        console.error('路線のデータの読み込みに失敗しました:', error);
        startScreen.innerHTML = '<h1>エラー</h1><p>路線データを読み込めませんでした。</p>';
    }
}

// --- 画面表示とゲームフロー ---
function displayRegionSelector() {
    const regions = ['全国', ...new Set(allQuestions.map(q => q.region).filter(r => r))];
    regionSelector.innerHTML = '';
    regions.forEach(region => {
        const button = document.createElement('button');
        button.className = 'region-button';
        button.textContent = region;
        button.onclick = () => startGame(region);
        regionSelector.appendChild(button);
    });
}

function startGame(region) {
    startScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');

    let filteredQuestions = (region === '全国') ? allQuestions : allQuestions.filter(q => q.region === region);
    
    if (filteredQuestions.length === 0) {
        alert('この地域の問題がありません。トップにもどります。');
        gameScreen.classList.add('hidden');
        startScreen.classList.remove('hidden');
        return;
    }

    const questionCount = Math.min(filteredQuestions.length, QUESTIONS_PER_GAME);
    gameQuestions = shuffle(filteredQuestions).slice(0, questionCount);

    correctAnswers = 0;
    currentQuestionIndex = 0;
    loadQuestion();
}

function loadQuestion() {
    clearUIForNewQuestion();

    if (currentQuestionIndex >= gameQuestions.length) {
        showResult();
        return;
    }

    nextButton.textContent = 'つぎのえきへ';
    nextButton.onclick = nextQuestion;

    const question = gameQuestions[currentQuestionIndex];
    displayHint(question);
    createAnswerGrid(question.answer.length);
    createChoicesGrid(question.answer);
    addDragAndDropListeners();
}

function showResult() {
    // UIをクリア
    hintImage.style.display = 'none';
    hintText.textContent = 'ゲーム終了！';
    answerArea.innerHTML = '';
    choicesGrid.innerHTML = '';
    
    // スコアと正答率を計算
    const total = gameQuestions.length;
    const percentage = total > 0 ? (correctAnswers / total) * 100 : 0;
    
    // ★★ ここからが新しい機能: 得点に応じたメッセージ表示 ★★
    let resultMessage = '';
    let messageClass = '';
    if (percentage === 100) {
        resultMessage = 'パーフェクト！きみは鉄道はかせだ！';
        messageClass = 'amazing';
    } else if (percentage >= 80) {
        resultMessage = 'すごい！たくさんの電車をしってるね！';
        messageClass = 'good';
    } else if (percentage >= 50) {
        resultMessage = 'いいちょうし！つぎはもっとがんばろう！';
        messageClass = 'normal';
    } else {
        resultMessage = 'おしい！いろんな電車をおぼえていこう！';
        messageClass = '';
    }
    messageText.textContent = resultMessage;
    messageText.className = messageClass;
    // ★★ ここまで ★★

    scoreText.textContent = `${total}問中 ${correctAnswers}問 正解！`;

    nextButton.textContent = 'ちいきせんたくへもどる';
    nextButton.classList.remove('hidden');
    nextButton.onclick = () => {
        gameScreen.classList.add('hidden');
        startScreen.classList.remove('hidden');
    };
}

function nextQuestion() {
    currentQuestionIndex++;
    loadQuestion();
}

// --- UI生成と更新 ---
function clearUIForNewQuestion() {
    messageText.textContent = '';
    messageText.className = '';
    scoreText.textContent = '';
    nextButton.classList.add('hidden');
    answerArea.innerHTML = '';
    choicesGrid.innerHTML = '';
    choicesGrid.style.display = 'grid';
}

function displayHint(question) {
    hintText.textContent = `ヒント: ${question.hint}`;
    if (question.image && question.image.trim() !== '') {
        hintImage.src = `images/${question.image}`;
        hintImage.style.display = 'block';
    } else {
        hintImage.style.display = 'none';
    }
}

function createAnswerGrid(length) {
    answerArea.style.gridTemplateColumns = `repeat(${length}, 1fr)`;
    for (let i = 0; i < length; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell', 'answer-cell');
        answerArea.appendChild(cell);
    }
}

function createChoicesGrid(answer) {
    const dummyChars = generateDummyChars(answer);
    const choiceChars = shuffle([...answer, ...dummyChars]).slice(0, 9);

    choiceChars.forEach(char => {
        const cell = document.createElement('div');
        cell.classList.add('cell', 'choice-cell');
        cell.textContent = char;
        cell.draggable = true;
        choicesGrid.appendChild(cell);
    });
}

// --- ゲームロジック ---
function checkAnswer() {
    const answerCells = document.querySelectorAll('.answer-cell');
    const answer = gameQuestions[currentQuestionIndex].answer;
    let currentAnswer = Array.from(answerCells).map(cell => cell.textContent).join('');

    if (currentAnswer.length === answer.length) {
        if (currentAnswer === answer) {
            messageText.textContent = 'せいかい！';
            messageText.className = 'correct';
            correctAnswers++;
            nextButton.classList.remove('hidden');
            document.querySelectorAll('.choice-cell[draggable="true"]').forEach(c => c.draggable = false);
        } else {
            messageText.textContent = 'ちがうみたい…';
            messageText.className = '';
        }
    }
}

function addDragAndDropListeners() {
    const draggableItems = document.querySelectorAll('[draggable="true"]');
    const answerCells = document.querySelectorAll('.answer-cell');

    draggableItems.forEach(item => {
        item.addEventListener('dragstart', e => {
            draggedItem = e.target;
            e.target.classList.add('dragging');
        });
        item.addEventListener('dragend', e => e.target.classList.remove('dragging'));
    });

    answerCells.forEach(item => {
        item.addEventListener('dragover', e => e.preventDefault());
        item.addEventListener('drop', e => {
            e.preventDefault();
            if (draggedItem && !item.textContent) {
                item.textContent = draggedItem.textContent;
                draggedItem.textContent = '';
                draggedItem.draggable = false;
                draggedItem.style.cursor = 'default';
                draggedItem = null;
                checkAnswer();
            }
        });
    });
}

// --- ユーティリティ関数 ---
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function generateDummyChars(answer) {
    const hiragana = "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをんがぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽ";
    const answerChars = [...answer];
    let dummies = [];
    const dummyCount = Math.max(2, 9 - answerChars.length);
    
    while (dummies.length < dummyCount) {
        const randomChar = hiragana[Math.floor(Math.random() * hiragana.length)];
        if (!answerChars.includes(randomChar) && !dummies.includes(randomChar)) {
            dummies.push(randomChar);
        }
    }
    return dummies;
}

// --- ゲーム開始 ---
initialize();
