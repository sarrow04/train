// --- DOM要素の取得 ---
const titleScreen = document.getElementById('title-screen');
const mainMenuScreen = document.getElementById('main-menu-screen');
const gameScreen = document.getElementById('game-screen');
const howToPlayModal = document.getElementById('how-to-play-modal');
const startGameButton = document.getElementById('start-game-button');
const howToPlayButton = document.getElementById('how-to-play-button');
const backToTitleButton = document.getElementById('back-to-title-button');
const modalCloseButtons = document.querySelectorAll('.modal-close-button');
// (他の要素は変更なし)

// --- 初期化処理 ---
async function initialize() {
    userCoins = parseInt(localStorage.getItem('trainPuzzleCoins')) || 0;
    updateCoinDisplay();
    try {
        const response = await fetch('lines.json');
        if (!response.ok) { throw new Error('Network response was not ok'); }
        allQuestions = await response.json();
        // ★初期表示はタイトル画面なので、地域選択はまだ呼ばない
    } catch (error) {
        console.error('路線のデータの読み込みに失敗しました:', error);
        titleScreen.innerHTML = '<h1>エラー</h1><p>路線データを読み込めませんでした。<br>lines.jsonファイルを確認してください。</p>';
    }
}

// --- 新しい画面遷移のイベントリスナー ---
startGameButton.addEventListener('click', () => {
    titleScreen.classList.add('hidden');
    mainMenuScreen.classList.remove('hidden');
    displayRegionSelector(); // ここで初めて地域ボタンを生成
});
howToPlayButton.addEventListener('click', () => {
    howToPlayModal.classList.remove('hidden');
});
backToTitleButton.addEventListener('click', () => {
    mainMenuScreen.classList.add('hidden');
    titleScreen.classList.remove('hidden');
});
modalCloseButtons.forEach(button => {
    button.addEventListener('click', () => {
        button.closest('.modal-background').classList.add('hidden');
    });
});


// --- 画面表示とゲームフロー ---
function startGame(region) {
    mainMenuScreen.classList.add('hidden'); // ★メインメニューを隠す
    gameScreen.classList.remove('hidden');
    // (以降は変更なし)
}

function showResult() {
    // (前半のロジックは変更なし)
    // ...
    nextButton.textContent = 'メニューにもどる'; // ボタンのテキストを変更
    nextButton.classList.remove('hidden');
    nextButton.onclick = () => {
        gameScreen.classList.add('hidden');
        mainMenuScreen.classList.remove('hidden'); // ★メインメニューに戻る
    };
}


// (他の全ての関数は変更ありません。上記のコードを追記・修正してください)
// ---
// (updateCoinDisplay, displayRegionSelector, loadQuestion, checkAnswer, playGacha... などの既存の関数はそのまま)
// ---

// --- ゲーム開始 ---
initialize();
