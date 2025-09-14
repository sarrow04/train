// --- DOM要素の取得 ---
const titleScreen = document.getElementById('title-screen');
const gameScreen = document.getElementById('game-screen');
const howToPlayModal = document.getElementById('how-to-play-modal');
const startGameButton = document.getElementById('start-game-button');
const howToPlayButton = document.getElementById('how-to-play-button');
const modalCloseButtons = document.querySelectorAll('.modal-close-button');
const hintImage = document.getElementById('hint-image');
const hintButton = document.getElementById('hint-button');
const hint1Text = document.getElementById('hint1');
const hint2Text = document.getElementById('hint2');
const hint3Text = document.getElementById('hint3');
const answerArea = document.getElementById('answer-area');
const choicesGrid = document.getElementById('choices-grid');
const messageText = document.getElementById('message-text');
const scoreText = document.getElementById('score-text');
const finalCoinText = document.getElementById('final-coin-text');
const nextButton = document.getElementById('next-button');
const passButton = document.getElementById('pass-button');
const resetButton = document.getElementById('reset-button');
const coinDisplayGame = document.getElementById('coin-display-game');
const coinDisplayGacha = document.getElementById('coin-display-gacha');
const eventModal = document.getElementById('event-modal');
const playGachaButton = document.getElementById('play-gacha-button');
const reels = document.querySelectorAll('.reel');
const gachaResult = document.getElementById('gacha-result');

// --- グローバル変数 ---
let allQuestions = [];
let gameQuestions = [];
let currentQuestionIndex = 0;
let correctAnswers = 0;
let userCoins = 0;
let isBonusTime = false;
let currentHintLevel = 0;
const QUESTIONS_PER_GAME = 20;
const GACHA_COST = 10;
const GACHA_SYMBOLS = ['🚃', '🚅', '🚂', '🚃', '🚅', '🚂', '🚆'];

// --- 初期化処理 ---
async function initialize() {
    userCoins = parseInt(localStorage.getItem('trainPuzzleCoins')) || 0;
    updateCoinDisplay();
    try {
        const response = await fetch('lines.json');
        if (!response.ok) { throw new Error('Network response was not ok'); }
        allQuestions = await response.json();
    } catch (error) {
        console.error('路線のデータの読み込みに失敗しました:', error);
        titleScreen.innerHTML = '<h1>エラー</h1><p>路線データを読み込めませんでした。<br>lines.jsonファイルを確認してください。</p>';
    }
}

// --- コイン表示を更新 ---
function updateCoinDisplay() {
    coinDisplayGame.textContent = `コイン: ${userCoins}`;
    coinDisplayGacha.textContent = `コイン: ${userCoins}`;
}

// --- 画面フロー ---
function startGame() {
    titleScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    
    let filteredQuestions = allQuestions;
    if (filteredQuestions.length === 0) {
        alert('問題がありません。トップにもどります。');
        gameScreen.classList.add('hidden');
        titleScreen.classList.remove('hidden');
        return;
    }
    const questionCount = Math.min(filteredQuestions.length, QUESTIONS_PER_GAME);
    gameQuestions = shuffle(filteredQuestions).slice(0, questionCount);
    correctAnswers = 0;
    currentQuestionIndex = 0;
    loadQuestion();
}

// ▼▼▼ ヒントの表示ロジックを修正 ▼▼▼
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
    
    // ヒント機能の初期化
    currentHintLevel = 1; // ★レベル1のヒントは最初から表示するので1に設定
    hintButton.disabled = false;
    hintButton.textContent = '次のヒント (1コイン)';
    
    // ★ヒント1（無料ヒント）を自動で表示
    hint1Text.textContent = `ヒント1: ${question.hint}`;
    hint1Text.classList.remove('hidden');

    // ヒント2と3は隠す
    hint2Text.classList.add('hidden');
    hint2Text.textContent = '';
    hint3Text.classList.add('hidden');
    hint3Text.textContent = '';

    displayHintImage(question);
    createAnswerGrid(question.answer.length);
    createChoicesGrid(question.answer);
    addEventListeners();
}

function showResult() {
    hintImage.style.display = 'none';
    hintButton.classList.add('hidden');
    [hint1Text, hint2Text, hint3Text].forEach(el => el.classList.add('hidden'));
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
    finalCoinText.textContent = `のこりコイン: ${userCoins}枚`;
    nextButton.textContent = 'タイトルにもどる';
    nextButton.classList.remove('hidden');
    nextButton.onclick = () => {
        gameScreen.classList.add('hidden');
        titleScreen.classList.remove('hidden');
    };
}

function nextQuestion() {
    currentQuestionIndex++;
    loadQuestion();
}

// --- イベントリスナー ---
startGameButton.addEventListener('click', startGame);
howToPlayButton.addEventListener('click', () => {
    howToPlayModal.classList.remove('hidden');
});
modalCloseButtons.forEach(button => {
    button.addEventListener('click', () => {
        button.closest('.modal-background').classList.add('hidden');
    });
});
resetButton.addEventListener('click', () => loadQuestion());
passButton.addEventListener('click', () => nextQuestion());
hintButton.addEventListener('click', showHint);
playGachaButton.addEventListener('click', playGacha);

// --- UI生成と更新 ---
function clearUIForNewQuestion() {
    messageText.textContent = '';
    messageText.className = '';
    scoreText.textContent = '';
    finalCoinText.textContent = '';
    nextButton.classList.add('hidden');
    answerArea.innerHTML = '';
    choicesGrid.innerHTML = '';
    hintButton.classList.remove('hidden');
}

function displayHintImage(question) {
    if (question.image && question.image.trim() !== '') {
        // (変更後)
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
    let choiceChars = [...answer];
    const dummyChars = generateDummyChars(answer);
    for (let i = 0; i < dummyChars.length; i++) {
        if (choiceChars.length < 12) choiceChars.push(dummyChars[i]);
        else break;
    }
    const shuffledChars = shuffle(choiceChars);
    shuffledChars.forEach(char => {
        const cell = document.createElement('div');
        cell.classList.add('cell', 'choice-cell');
        cell.textContent = char;
        choicesGrid.appendChild(cell);
    });
}

// --- ゲームロジック ---
function checkAnswer() {
    const answerCells = document.querySelectorAll('.answer-cell');
    const answer = gameQuestions[currentQuestionIndex].answer;
    let currentAnswer = Array.from(answerCells).map(cell => cell.textContent).join('');
    
    if (currentAnswer.length !== answer.length) {
        messageText.textContent = '';
        messageText.className = '';
        return;
    }

    if (currentAnswer === answer) {
        messageText.textContent = 'せいかい！';
        messageText.className = 'correct';
        hintButton.disabled = true;
        const earnedCoins = isBonusTime ? 2 : 1;
        userCoins += earnedCoins;
        isBonusTime = false;
        localStorage.setItem('trainPuzzleCoins', userCoins);
        updateCoinDisplay();
        correctAnswers++;
        nextButton.classList.remove('hidden');
        passButton.classList.add('hidden');
        resetButton.classList.add('hidden');
        if (correctAnswers > 0 && correctAnswers % 5 === 0 && currentQuestionIndex < gameQuestions.length - 1) {
            isBonusTime = true;
            showEventModal();
        }
    } else {
        messageText.textContent = 'ちがうみたい…';
        messageText.className = '';
    }
}

function showEventModal() {
    eventModal.classList.remove('hidden');
}

// ▼▼▼ ヒントの表示ロジックを修正 ▼▼▼
function showHint() {
    if (currentHintLevel >= 3 || messageText.textContent === 'せいかい！') return;
    if (userCoins < 1) {
        hintButton.textContent = 'コインがたりません';
        setTimeout(() => {
            if (currentHintLevel === 1) hintButton.textContent = '次のヒント (1コイン)';
            else if (currentHintLevel === 2) hintButton.textContent = '最後のヒント (1コイン)';
        }, 1500);
        return;
    }
    userCoins--;
    localStorage.setItem('trainPuzzleCoins', userCoins);
    updateCoinDisplay();
    currentHintLevel++;
    const question = gameQuestions[currentQuestionIndex];
    
    if (currentHintLevel === 2) { // ★ボタンを1回押すとレベル2のヒント
        hint2Text.textContent = `ヒント2: ${question.hint2}`;
        hint2Text.classList.remove('hidden');
        hintButton.textContent = '最後のヒント (1コイン)';
    } else if (currentHintLevel === 3) { // ★ボタンを2回押すとレベル3のヒント
        hint3Text.textContent = `ヒント3: ${question.hint3}`;
        hint3Text.classList.remove('hidden');
        hintButton.disabled = true;
        hintButton.textContent = 'すべてのヒントを表示';
    }
}

// --- 操作方法（タップ式）---
function addEventListeners() {
    choicesGrid.addEventListener('click', onChoiceCellClick);
    answerArea.addEventListener('click', onAnswerCellClick);
}

function onChoiceCellClick(event) {
    const clickedCell = event.target;
    if (!clickedCell.classList.contains('choice-cell') || !clickedCell.textContent || messageText.textContent === 'せいかい！') return;
    const emptyAnswerCell = document.querySelector('.answer-cell:empty');
    if (emptyAnswerCell) {
        emptyAnswerCell.textContent = clickedCell.textContent;
        clickedCell.textContent = '';
        checkAnswer();
    }
}

function onAnswerCellClick(event) {
    const clickedCell = event.target;
    if (!clickedCell.classList.contains('answer-cell') || !clickedCell.textContent || messageText.textContent === 'せいかい！') return;
    const emptyChoiceCell = document.querySelector('.choice-cell:empty');
    if (emptyChoiceCell) {
        emptyChoiceCell.textContent = clickedCell.textContent;
        clickedCell.textContent = '';
        checkAnswer();
    }
}

// --- 電車スロット ---
function playGacha() {
    if (userCoins < GACHA_COST) {
        gachaResult.textContent = 'コインがたりません';
        return;
    }
    userCoins -= GACHA_COST;
    updateCoinDisplay();
    gachaResult.textContent = '';
    let spinCount = 0;
    const maxSpins = 20;
    const finalResult = [
        GACHA_SYMBOLS[Math.floor(Math.random() * GACHA_SYMBOLS.length)],
        GACHA_SYMBOLS[Math.floor(Math.random() * GACHA_SYMBOLS.length)],
        GACHA_SYMBOLS[Math.floor(Math.random() * GACHA_SYMBOLS.length)]
    ];
    const spinInterval = setInterval(() => {
        spinCount++;
        reels.forEach((reel, index) => {
            reel.textContent = GACHA_SYMBOLS[Math.floor(Math.random() * GACHA_SYMBOLS.length)];
            if (spinCount >= maxSpins) reel.textContent = finalResult[index];
        });
        if (spinCount >= maxSpins) {
            clearInterval(spinInterval);
            checkGachaResult(finalResult);
        }
    }, 100);
}

function checkGachaResult(result) {
    if (result.every(s => s === '🚆')) {
        gachaResult.textContent = '大当たり！1000コインGET！';
        userCoins += 1000;
    } else if (result[0] === result[1] && result[1] === result[2]) {
        gachaResult.textContent = 'おめでとう！50コインGET！';
        userCoins += 50;
    } else {
        gachaResult.textContent = 'ざんねん…';
    }
    localStorage.setItem('trainPuzzleCoins', userCoins);
    updateCoinDisplay();
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
    const dummyCount = 12 - answerChars.length;
    while (dummies.length < dummyCount) {
        const randomChar = hiragana[Math.floor(Math.random() * hiragana.length)];
        if (!answerChars.includes(randomChar)) dummies.push(randomChar);
    }
    return [...new Set(dummies)];
}

// --- ゲーム開始 ---
initialize();
