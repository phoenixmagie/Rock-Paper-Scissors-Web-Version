// --- STATE MANAGEMENT (STAND) ---
let state = {
    scores: { player: 0, ai: 0, currentStreak: 0 },
    stats: { totalGames: 0, playerWins: 0, maxStreak: 0, choicesCount: { rock: 0, paper: 0, scissors: 0 } },
    credits: 0,
    unlockedThemes: ['theme-neon'],
    activeTheme: 'theme-neon',
    history: [] // Speichert die Züge des Spielers für die KI-Kette
};

// Markov-Ketten-Speicher für die KI (Lokalisiert Verhaltensmuster)
let aiPatternMemory = {};

// Emojis für die Anzeige
const emojiMap = { rock: '🪨', paper: '📄', scissors: '✂️' };

// --- LOCAL STORAGE FUNKTIONEN ---
function loadData() {
    const savedState = localStorage.getItem('sps_ai_state');
    const savedMemory = localStorage.getItem('sps_ai_memory');
    
    if (savedState) state = JSON.parse(savedState);
    if (savedMemory) aiPatternMemory = JSON.parse(savedMemory);
    
    // Fallback falls Strukturen in älteren Versionen fehlten
    if(!state.stats.choicesCount) state.stats.choicesCount = { rock: 0, paper: 0, scissors: 0 };
}

function saveData() {
    localStorage.setItem('sps_ai_state', JSON.stringify(state));
    localStorage.setItem('sps_ai_memory', JSON.stringify(aiPatternMemory));
}

// --- KI LOGIK (MARKOV CHAIN 2. ORDNUNG) ---
function getAiChoice() {
    const history = state.history;
    const logPara = document.getElementById('ai-thinking-log');

    // Phase 1: Zu wenig Daten (Weniger als 2 Züge) -> Reiner Zufall
    if (history.length < 2) {
        logPara.innerText = "KI rät zufällig (Datenbasis wird aufgebaut...)";
        return getRandomChoice();
    }

    // Hol die letzten beiden Züge des Spielers als Schlüssel (z.B. "rock-paper")
    const key = `${history[history.length - 2]}-${history[history.length - 1]}`;

    // Phase 2: Schlüssel unbekannt -> Zufall, aber logischer Ansatz
    if (!aiPatternMemory[key]) {
        logPara.innerText = "KI analysiert neues Verhaltensmuster...";
        return getRandomChoice();
    }

    // Phase 3: Muster bekannt! Berechne Wahrscheinlichkeiten basierend auf Historie
    const predictions = aiPatternMemory[key];
    let predictedPlayerChoice = 'rock';
    let maxCount = -1;

    for (const choice in predictions) {
        if (predictions[choice] > maxCount) {
            maxCount = predictions[choice];
            predictedPlayerChoice = choice;
        }
    }

    logPara.innerText = `KI prognostiziert bei dir '${predictedPlayerChoice}' (Muster erkannt!)`;

    // Kontere die Vorhersage des Spielers
    if (predictedPlayerChoice === 'rock') return 'paper';
    if (predictedPlayerChoice === 'paper') return 'scissors';
    if (predictedPlayerChoice === 'scissors') return 'rock';
}

function getRandomChoice() {
    const choices = ['rock', 'paper', 'scissors'];
    return choices[Math.floor(Math.random() * choices.length)];
}

function recordPlayerPattern(nextChoice) {
    const history = state.history;
    if (history.length >= 2) {
        const key = `${history[history.length - 2]}-${history[history.length - 1]}`;
        if (!aiPatternMemory[key]) aiPatternMemory[key] = { rock: 0, paper: 0, scissors: 0 };
        aiPatternMemory[key][nextChoice]++;
    }
    // Zughistorie erweitern
    state.history.push(nextChoice);
    state.stats.choicesCount[nextChoice]++;
}

// --- SPIEL-ENGINE ---
function playRound(playerChoice) {
    const aiChoice = getAiChoice();
    
    // Muster im Hirn der KI abspeichern bevor die Historie wächst
    recordPlayerPattern(playerChoice);

    // UI Updates für Symbole
    document.getElementById('player-choice-display').innerText = emojiMap[playerChoice];
    document.getElementById('ai-choice-display').innerText = emojiMap[aiChoice];

    let resultText = "";
    const resultHeading = document.getElementById('round-result');
    resultHeading.className = ""; // Reset Klassen

    // Logik-Auswertung
    if (playerChoice === aiChoice) {
        resultText = "Unentschieden! 🤝";
    } else if (
        (playerChoice === 'rock' && aiChoice === 'scissors') ||
        (playerChoice === 'paper' && aiChoice === 'rock') ||
        (playerChoice === 'scissors' && aiChoice === 'paper')
    ) {
        resultText = "Du gewinnst! 🎉";
        state.scores.player++;
        state.scores.currentStreak++;
        state.credits += 10 + (state.scores.currentStreak * 2); // Streak-Bonus Credits
        resultHeading.classList.add('win-flash');
    } else {
        resultText = "Cyber-KI gewinnt! 🤖";
        state.scores.ai++;
        state.scores.currentStreak = 0;
        resultHeading.classList.add('lose-flash');
    }

    // Statistiken updaten
    state.stats.totalGames++;
    if(playerChoice !== aiChoice && resultText.startsWith("Du")) state.stats.playerWins++;
    if(state.scores.currentStreak > state.stats.maxStreak) state.stats.maxStreak = state.scores.currentStreak;

    resultHeading.innerText = resultText;
    updateDOM();
    saveData();
}

// --- UI UPDATES ---
function updateDOM() {
    document.getElementById('player-score').innerText = state.scores.player;
    document.getElementById('ai-score').innerText = state.scores.ai;
    document.getElementById('current-streak').innerText = state.scores.currentStreak;
    document.getElementById('credits').innerText = state.credits;

    // Theme anwenden
    document.body.className = state.activeTheme;

    // Shop Buttons updaten
    document.querySelectorAll('.shop-item').forEach(item => {
        const theme = item.getAttribute('data-theme');
        const btn = item.querySelector('.buy-btn');
        const price = parseInt(item.getAttribute('data-price'));

        if (state.activeTheme === theme) {
            btn.innerText = "Ausrüstet";
            btn.className = "buy-btn equipped";
            btn.disabled = true;
        } else if (state.unlockedThemes.includes(theme)) {
            btn.innerText = "Ausrüsten";
            btn.className = "buy-btn";
            btn.disabled = false;
        } else {
            btn.innerText = `Kaufen (${price} 🪙)`;
            btn.className = "buy-btn";
            btn.disabled = state.credits < price;
        }
    });
}

function updateStatsModal() {
    document.getElementById('stat-games').innerText = state.stats.totalGames;
    const wr = state.stats.totalGames > 0 ? Math.round((state.stats.playerWins / state.stats.totalGames) * 100) : 0;
    document.getElementById('stat-winrate').innerText = `${wr}%`;
    document.getElementById('stat-max-streak').innerText = state.stats.maxStreak;
    
    document.getElementById('fav-rock').innerText = state.stats.choicesCount.rock;
    document.getElementById('fav-paper').innerText = state.stats.choicesCount.paper;
    document.getElementById('fav-scissors').innerText = state.stats.choicesCount.scissors;
}

// --- EVENT LISTENERS ---
document.querySelectorAll('.game-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const choice = e.target.closest('.game-btn').getAttribute('data-choice');
        playRound(choice);
    });
});

// Modals öffnen/schließen
const shopModal = document.getElementById('shop-modal');
const statsModal = document.getElementById('stats-modal');

document.getElementById('open-shop-btn').addEventListener('click', () => { shopModal.classList.remove('hidden'); updateDOM(); });
document.getElementById('open-stats-btn').addEventListener('click', () => { statsModal.classList.remove('hidden'); updateStatsModal(); });

document.querySelectorAll('.close-modal-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        shopModal.classList.add('hidden');
        statsModal.classList.add('hidden');
    });
});

// Shop Kauf-Logik
document.querySelectorAll('.shop-item .buy-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const item = e.target.closest('.shop-item');
        const theme = item.getAttribute('data-theme');
        const price = parseInt(item.getAttribute('data-price'));

        if (state.unlockedThemes.includes(theme)) {
            state.activeTheme = theme;
        } else if (state.credits >= price) {
            state.credits -= price;
            state.unlockedThemes.push(theme);
            state.activeTheme = theme;
        }
        updateDOM();
        saveData();
    });
});

// Reset Button
document.getElementById('reset-data-btn').addEventListener('click', () => {
    if(confirm("Möchtest du wirklich alle Statistiken und KI-Muster löschen?")) {
        localStorage.clear();
        location.reload();
    }
});

// Start-Initialisierung
loadData();
updateDOM();
