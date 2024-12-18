const emojis = ["🎮", "🎲", "🎯", "🎨", "🎭", "🎪", "🎫", "🎬"];
const gameContainer = document.getElementById("gameContainer");
const movesDisplay = document.getElementById("moves");
const matchesDisplay = document.getElementById("matches");
let cards = [];
let moves = 0;
let matches = 0;
let hasFlippedCard = false;
let lockBoard = false;
let firstCard, secondCard;
let timeElapsed = 0;
let timerInterval;
let hintsRemaining = 3;
let currentLevel = 1;

function createCard(emoji) {
    const card = document.createElement("div");
    card.classList.add("card");
    card.innerHTML = `
        <div class="front">${emoji}</div>
        <div class="back">?</div>
    `;
    card.addEventListener("click", flipCard);
    return card;
}

function flipCard() {
    if (lockBoard) return;
    if (this === firstCard) return;
    this.classList.add("flip");
    moves++;
    movesDisplay.textContent = moves;

    if (!hasFlippedCard) {
        hasFlippedCard = true;
        firstCard = this;
        return;
    }

    secondCard = this;
    checkForMatch();
}

function checkForMatch() {
    const isMatch = firstCard.querySelector(".front").textContent === secondCard.querySelector(".front").textContent;
    if (isMatch) {
        matches++;
        matchesDisplay.textContent = matches;
        disableCards();
        if (matches === emojis.length) {
            setTimeout(() => {
                alert(`Congratulations! You won in ${moves} moves!`);
                saveHighScore();
            }, 500);
        }
    } else {
        unflipCards();
    }
}

function disableCards() {
    firstCard.removeEventListener("click", flipCard);
    secondCard.removeEventListener("click", flipCard);
    resetBoard();
}

function unflipCards() {
    lockBoard = true;
    setTimeout(() => {
        firstCard.classList.remove("flip");
        secondCard.classList.remove("flip");
        resetBoard();
    }, 1000);
}

function resetBoard() {
    [hasFlippedCard, lockBoard] = [false, false];
    [firstCard, secondCard] = [null, null];
}

function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
}

function initializeGame() {
    timeElapsed = 0;
    stopTimer();
    startTimer();
    const gameArray = [...emojis, ...emojis];
    shuffle(gameArray);
    gameContainer.innerHTML = "";
    gameArray.forEach((emoji) => {
        const card = createCard(emoji);
        gameContainer.appendChild(card);
        cards.push(card);
    });
    loadHighScores();
}

function restartGame() {
    moves = 0;
    matches = 0;
    movesDisplay.textContent = moves;
    matchesDisplay.textContent = matches;
    cards.forEach((card) => {
        card.classList.remove("flip");
        card.addEventListener("click", flipCard);
    });
    setTimeout(() => {
        initializeGame();
    }, 500);
}

function startTimer() {
    timerInterval = setInterval(() => {
        timeElapsed++;
        document.querySelector(".timer").textContent = `Time: ${timeElapsed}s`;
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}

function showHint() {
    if (hintsRemaining > 0) {
        const unmatchedCards = cards.filter(card => !card.classList.contains("flip"));
        if (unmatchedCards.length > 0) {
            hintsRemaining--;
            document.querySelector(".hint-btn").textContent = `Hint (${hintsRemaining})`;
            unmatchedCards.forEach(card => {
                card.classList.add("flip");
                setTimeout(() => card.classList.remove("flip"), 1000);
            });
        }
    }
}

function toggleTheme() {
    const root = document.documentElement;
    const currentTheme = root.getAttribute("data-theme");
    const newTheme = currentTheme === "light" ? "dark" : "light";
    root.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
}

function loadHighScores() {
    const highScores = JSON.parse(localStorage.getItem("highScores")) || [];
    const list = document.getElementById("highScoresList");
    list.innerHTML = highScores
        .slice(0, 5)
        .map(score => `<li>Moves: ${score.moves} | Time: ${score.time}s | ${score.date}</li>`)
        .join("");
}

function saveHighScore() {
    const highScores = JSON.parse(localStorage.getItem("highScores")) || [];
    const newScore = {
        moves: moves,
        time: timeElapsed,
        date: new Date().toLocaleDateString()
    };
    highScores.push(newScore);
    highScores.sort((a, b) => a.moves - b.moves);
    localStorage.setItem("highScores", JSON.stringify(highScores.slice(0, 5)));
    loadHighScores();
}

document.addEventListener("DOMContentLoaded", () => {
    initializeGame();
    const savedTheme = localStorage.getItem("theme") || "dark";
    document.documentElement.setAttribute("data-theme", savedTheme);
});