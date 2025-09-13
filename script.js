// --- DOM要素の取得 ---
const hintButton = document.getElementById('hint-button');
const hint1Text = document.getElementById('hint1');
const hint2Text = document.getElementById('hint2');
const hint3Text = document.getElementById('hint3');
// (他の要素は変更なし)

// --- グローバル変数 ---
let currentHintLevel = 0; // ★表示中のヒントレベルを管理
// (他の変数はそのまま)

// --- 初期化処理 ---
// (変更なし)

// --- ゲームフロー (loadQuestionを修正) ---
function loadQuestion() {
    clearUIForNewQuestion();
    passButton.classList.remove('hidden');
    resetButton.classList.remove('hidden');
    
    // ★ヒント機能をリセット
    currentHintLevel = 0;
    hintButton.disabled = false;
    hintButton.textContent = 'ヒントを見る (1コイン)';
    hint1Text.classList.add('hidden');
    hint2Text.classList.add('hidden');
    hint3Text.classList.add('hidden');
    hint1Text.textContent = '';
    hint2Text.textContent = '';
    hint3Text.textContent = '';

    if (currentQuestionIndex >= gameQuestions.length) {
        showResult();
        return;
    }
    // (以降は変更なし)
}

// --- ヒント機能のロジック ---
function showHint() {
    if (currentHintLevel >= 3) return; // すべてのヒントを表示済み

    if (userCoins < 1) {
        hintButton.textContent = 'コインがたりません';
        setTimeout(() => {
            // 元のテキストに戻す
            if(currentHintLevel === 0) hintButton.textContent = 'ヒントを見る (1コイン)';
            if(currentHintLevel === 1) hintButton.textContent = '次のヒント (1コイン)';
            if(currentHintLevel === 2) hintButton.textContent = '最後のヒント (1コイン)';
        }, 1500);
        return;
    }

    userCoins--;
    localStorage.setItem('trainPuzzleCoins', userCoins);
    updateCoinDisplay();

    currentHintLevel++;
    const question = gameQuestions[currentQuestionIndex];

    if (currentHintLevel === 1) {
        hint1Text.textContent = `ヒント1: ${question.hint}`;
        hint1Text.classList.remove('hidden');
        hintButton.textContent = '次のヒント (1コイン)';
    } else if (currentHintLevel === 2) {
        hint2Text.textContent = `ヒント2: ${question.hint2}`;
        hint2Text.classList.remove('hidden');
        hintButton.textContent = '最後のヒント (1コイン)';
    } else if (currentHintLevel === 3) {
        hint3Text.textContent = `ヒント3: ${question.hint3}`;
        hint3Text.classList.remove('hidden');
        hintButton.disabled = true; // ボタンを無効化
        hintButton.textContent = 'すべてのヒントを表示しました';
    }
}

// --- イベントリスナーにヒントボタンを追加 ---
hintButton.addEventListener('click', showHint);
// (他のイベントリスナーは変更なし)

// --- ゲームロジック (checkAnswerを修正) ---
function checkAnswer() {
    // (前半は変更なし)
    // ...
    if (currentAnswer === answer) {
        // (正解時の処理は変更なし)
        // ...
        hintButton.disabled = true; // ★正解したらヒントボタンを無効化
        passButton.classList.add('hidden');
        resetButton.classList.add('hidden');
        // ...
    }
    // ...
}


// (他の全ての関数は変更ありません。上記のコードを追記・修正してください)
// ---
// (initialize, displayRegionSelector, startGame, showResult, onCellClick... などの既存の関数はそのまま)
// ---

// --- ゲーム開始 ---
initialize();
