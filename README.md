# ASII Town

Pentru fiecare participant:

1. Isi completeaza datele si obiectele in `houses/content.js`, pastrand ID-ul ales
2. Creeaza propriul `NumeHouse.jsx`. Poate porni de la `ExampleHouse.jsx`, folosind `PersonalRoom`, sau poate construi interiorul din componente proprii
3. Creeaza separat `NumeGame.jsx`. Jocul trebuie sa aiba `onWin()` si `onClose()`; apeleaza `onWin()` numai la victoria reala. Aplicatia acorda automat fragmentul si salveaza progresul
4. Inregistreaza componentele in `HOUSE_MODULES` din `houses/index.js`:
```javascript     
guest: {Room: NumeHouse, Game: NumeGame}
```
Nu trebuie modificat `App.jsx` pentru fiecare coleg. Cu `Game: null`, butonul afiseaza doar un mesaj, fara recompense.

## Laboratorul computerelor defecte (camera `guest`)

Camera `guest` este implementată ca laborator interactiv în `asii-town/src/houses/dragos-room/`.
Mini-jocul cere construirea unui **half-adder** din tabela de adevăr: se instalează o
poartă în fiecare canal (`SUM`, `CARRY`), apoi se apasă **RUN ALL FOUR TESTS**.
Scenariile sunt testate secvențial; tabelul evidențiază intrările active și semnalele
se propagă vizual pe placă. După validarea circuitului, **RESTART COMPUTER · CLAIM MODULE**
pornește secvența de boot și acordă fragmentul din inventar.

Starea circuitului (cele două porți și intrările A/B) este inclusă în salvarea comună
`asii-town-adventure-v3`, gestionată de `src/game/progress.js`. Reîntoarcerea în cameră
restaurează configurația; după victorie, circuitul rămâne verificat și nu poate fi resetat.
Nu există o cheie de tastatură pentru a câștiga automat acest fragment.

Testare: `cd asii-town && npm test && npm run build`. Verificările specifice sunt în
`tests/half-adder.test.mjs` și `tests/half-adder-progress.test.mjs`.
