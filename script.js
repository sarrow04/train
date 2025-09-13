// --- DOM要素の取得 ---
const resetButton = document.getElementById('reset-button'); // 👈 この行を追加
const passButton = document.getElementById('pass-button');
// (他の要素の取得は変更なし)
// ...

// --- グローバル変数 ---
// (変更なし)

// --- 初期化処理 ---
// (変更なし)

// --- 画面表示とゲームフロー ---
function loadQuestion() {
    clearUIForNewQuestion();
    passButton.classList.remove('hidden');
    resetButton.classList.remove('hidden'); // 👈 やりなおしボタンを表示

    if (currentQuestionIndex >= gameQuestions.length) {
        showResult();
        return;
    }
    // (以降の処理は変更なし)
}

function showResult() {
    // (変更なし)
    // ...
    passButton.classList.add('hidden');
    resetButton.classList.add('hidden'); // 👈 結果画面でやりなおしボタンを隠す
    // (以降の処理は変更なし)
}

// やりなおしボタンのイベントリスナーを追加
resetButton.addEventListener('click', () => {
    // 現在の問題を再読み込みすることで、回答欄と選択肢をリセットする
    // currentQuestionIndexは変更しないので、同じ問題が再表示される
    loadQuestion();
});

// パスボタンのイベントリスナー
passButton.addEventListener('click', () => {
    // 正解数には加算せず、次の問題へ進む
    nextQuestion();
});


// --- ゲームロジック ---
function checkAnswer() {
    const answerCells = document.querySelectorAll('.answer-cell');
    const answer = gameQuestions[currentQuestionIndex].answer;
    let currentAnswer = Array.from(answerCells).map(cell => cell.textContent).join('');

    if (currentAnswer.length === answer.length) {
        const isCorrect = currentAnswer === answer;
        if (isCorrect) {
            messageText.textContent = 'せいかい！';
            messageText.className = 'correct';
            correctAnswers++;
            nextButton.classList.remove('hidden');
            passButton.classList.add('hidden'); // 👈 正解したらパスボタンを隠す
            resetButton.classList.add('hidden'); // 👈 正解したらやりなおしボタンを隠す
            document.querySelectorAll('.choice-cell[draggable="true"]').forEach(c => c.draggable = false);
        } else {
            messageText.textContent = 'ちがうみたい…';
            messageText.className = '';
        }
    }
}

// (他の全ての関数は変更ありません。上記の部分だけを修正・追記してください)
// --- ゲーム開始 ---
initialize();
