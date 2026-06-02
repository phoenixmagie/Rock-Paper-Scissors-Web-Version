# Rock-Paper-Scissors-Web-Version
Website Code with the Minigame Rock Paper Scissors. An "AI" analyses the last choses and predict your next Step. Good Luck and have Fun!

---
## 🧠 Technische Highlights & Features

* **Prädiktive KI (Markov-Kette 2. Ordnung):** Die KI speichert Sequenzen der letzten zwei Spielerzüge. Sie berechnet statistische Wahrscheinlichkeiten im Hintergrund, um den nächsten Zug des Spielers vorherzusagen und gezielt zu kontern.
* **Persistent State Management (`localStorage`):** Spielstände, Freischaltungen, Highscores und das antrainierte Verhaltensorgan der KI bleiben auch nach Schließen des Browsers vollständig erhalten.
* **In-Game Economy & Theme Shop:** Spieler verdienen Credits durch Siege. Ein integrierter Shop erlaubt das Freischalten und dynamische Wechseln von CSS-Themes (*Cyber Neon*, *Retro Sunset*, *Digital Matrix*) über CSS-Variablen.
* **Echtzeit-Datenanalyse:** Ein integriertes Statistik-Dashboard visualisiert Win-Rates, aktuelle/maximale Streaks sowie die individuelle Verteilung der Spielzüge des Nutzers.
* **Responsive UI & Glassmorphismus:** Modernes, mobiles First-Design mit flüssigen CSS-Animationen und Anpassung der Controls für optimale Daumenbedienung auf Smartphones.

---

## 🛠️ Tech Stack

* **HTML5** – Semantische Strukturierung der Anwendung.
* **CSS3** – Modernes Cyberpunk-Styling mit CSS Grid, Flexbox, Keyframe-Animationen und dynamischem Theming via CSS Custom Properties.
* **Vanilla JavaScript (ES6+)** – Vollständige Spiel-Engine, algorithmische KI-Mustererkennung und native `localStorage`-Anbindung.

---

## 📖 Funktionsweise der KI (Algorithmus)

Menschen sind statistisch gesehen schlecht darin, echten Zufall zu generieren. Dieses Spiel nutzt diesen Umstand aus. 

Sobald der Spieler zwei Runden gespielt hat (z. B. erst `Stein`, dann `Papier`), generiert das System einen Zustandsschlüssel `rock-paper`. Wählt der Spieler in der darauffolgenden Runde `Schere`, merkt sich das Modell: 
`rock-paper` $\rightarrow$ führt in Zukunft mit höherer Wahrscheinlichkeit zu `scissors`. 

Tritt diese Kombination erneut auf, wählt die KI automatisch die Konter-Waffe (hier: `Stein`). Je länger eine Spielesession dauert, desto unmöglicher wird es, die KI dauerhaft zu schlagen.

---

## ⚙️ Installation

Such dir entweder den games Ordner oder den single-page Ordner aus, und gehe in den hinein. Dann downloadest du **alle** Dateien, und öffnest diese Lokal auf deinem Gerät.