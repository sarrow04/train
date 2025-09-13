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
const passButton = document.getElementById('pass-button');
const resetButton = document.getElementById('reset-button');

// --- グローバル変数 ---
let allQuestions = [];
let gameQuestions = [];
let currentQuestionIndex = 0;
let correctAnswers = 0;
// selectedCell変数は不要になったので削除
const QUESTIONS_PER_GAME = 20;

// --- 初期化処理 ---
async function initialize() {
    try {
        const response = await fetch('lines.json');
        if (!response.ok) { throw new Error('Network response was not ok'); }
        allQuestions = await response.json();
        displayRegionSelector();
    } catch (error) {
        console.error('路線のデータの読み込みに失敗しました:', error);
        startScreen.innerHTML = '<h1>エラー</h1><p>路線データを読み込めませんでした。<br>lines.jsonファイルを確認してください。</p>';
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
    passButton.classList.remove('hidden');
    resetButton.classList.remove('hidden');
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
    addEventListeners();
}

function showResult() {
    hintImage.style.display = 'none';
    hintText.textContent = 'ゲーム終了！';
    answerArea.innerHTML = '';
    choicesGrid.innerHTML = '';
    passButton.classList.add('hidden');
    resetButton.classList.add('hidden');
    const total = gameQuestions.length;
    const percentage = total > 0 ? (correctAnswers / total) * 100 : 0;
    let resultMessage = '', messageClass = '';
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
    scoreText.textContent = `${total}問中 ${correctAnswers}問 正解！`;
    nextButton.textContent = 'ちいきせんたくへもどる';
    nextButton.classList.remove('hidden');
    nextButton.onclick = () => {
        gameScreen.classList.add('hidden');
        startScreen.classList.remove('hidden');
        displayRegionSelector();
    };
}

function nextQuestion() {
    currentQuestionIndex++;
    loadQuestion();
}

resetButton.addEventListener('click', () => loadQuestion());
passButton.addEventListener('click', () => nextQuestion());

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

// ▼▼▼ バグ修正：正解の文字が必ず含まれるようにロジックを修正 ▼▼▼
function createChoicesGrid(answer) {
    let choiceChars = [...answer]; // 1. まず正解の文字をすべて入れる
    const dummyChars = generateDummyChars(answer);
    
    // 2. 12マスに足りない分だけダミー文字を追加する
    for(let i = 0; i < dummyChars.length; i++) {
        if (choiceChars.length < 12) {
            choiceChars.push(dummyChars
