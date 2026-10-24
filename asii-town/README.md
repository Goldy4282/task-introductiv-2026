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
