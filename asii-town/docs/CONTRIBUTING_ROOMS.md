# Cum își implementează fiecare membru casa

Aplicația comună gestionează orașul, deplasarea, jurnalul, inventarul, salvarea și deblocările. Fiecare participant adaugă o componentă React pentru cameră și, separat, propriul mini-joc. Jocurile demonstrative au fost eliminate; `Game: null` păstrează numai butonul și afișează un mesaj la apăsare. Nu acordă victorie sau fragment.

## 1. Alege intrarea ta

În `src/houses/content.js`, fiecare element din `MEMBERS` are un `id` stabil: `guest`, `maker`, `reader`, `artist`. Alege unul și păstrează-l pe durata proiectului. `id` leagă clădirea de cameră, mini-joc, inventar și progres.

Completează pentru intrarea ta:

- `name`: numele colegului, folosit în jurnal și în testul final;
- `title`, `color`, `quote`: titlul, culoarea și fraza reprezentativă;
- `objects`: minimum cinci perechi `[titlu, descriere]`; descrierile se scriu la persoana a III-a, fără numele proprietarului;
- `hint`: indiciul destinat altei camere; stabiliți împreună unde apare;
- `fragment`: valoarea fragmentului acordat după câștigarea mini-jocului.

Datele existente sunt exemple. În Camera Secretă sunt folosite primele două obiecte ale fiecărui coleg, de aceea acestea trebuie să fie reprezentative și distincte.

## 2. Creează propria componentă de cameră

De exemplu, `src/houses/ana/AnaHouse.jsx`:

```jsx
import PersonalRoom from '../../components/PersonalRoom';

export default function AnaHouse(props) {
  return <PersonalRoom {...props} />;
}
```

Acesta este punctul de pornire funcțional. Primește automat metadatele tale prin `props.member`, arată cele cinci obiecte, fraza, lampa UV, covorul, sertarul, butonul de mini-joc și unicul buton „Înapoi în oraș”.

Poți apoi înlocui interiorul cu propriul design și componente: `Raft`, `Calculator`, `Poster`, `Jurnal` etc. Ține-le în folderul tău, împreună cu imaginile locale. Nu este necesar să modifici `App.jsx`, `World.jsx`, inventarul sau reducerul.

Pentru un interior cu obiecte poziționate procentual poți folosi și `components/HouseInterior.jsx`. Acesta primește `title`, `owner`, `description`, `objects` și `onExit`. Obiectele au structura de mai jos, iar componenta deschide automat imaginea și descrierea într-un dialog:

```js
{
  id: 'poster',
  x: 10, y: 30, w: 20, h: 25, // procente din cameră
  label: 'Posterul',
  description: 'Descriere despre proprietar, fără numele lui.',
  image: {src: imagineImportata, x: 0, y: 0, w: 400, h: 300, sheetWidth: 400, sheetHeight: 300}
}
```

`sheetWidth` și `sheetHeight` sunt dimensiunile complete ale imaginii sursă (implicit 768 pentru tilesetul original). `image` reprezintă dreptunghiul sursă al imaginii, nu poziția în cameră. `PersonalRoom` este șablonul cu interacțiunile gata legate; dacă îl înlocuiești cu un interior propriu, adaugi și propriile două interacțiuni speciale și butonul mini-jocului.

## 3. Înregistrează camera

În `src/houses/index.js` importă componenta și schimbă **doar intrarea ta** în `HOUSE_MODULES`:

```jsx
import AnaHouse from './ana/AnaHouse';

export const HOUSE_MODULES = {
  guest: {Room: AnaHouse, Game: null},
  // Celelalte intrări existente rămân în acest obiect.
};
```

Exemplul arată doar intrarea modificată; nu șterge intrările colegilor. Clădirea existentă va încărca noua cameră. Coordonatele exterioare sunt în `HOUSES`, separat de componente.

## 4. Implementează mini-jocul separat

Creează `src/houses/ana/AnaGame.jsx` cu un export implicit pentru componenta ta. Componenta primește:

| Prop | Rol |
| --- | --- |
| `member` | Datele proprietarului din `MEMBERS`. |
| `onWin()` | Se apelează numai când jocul a fost câștigat efectiv. Aplicația bifează victoria, acordă `fragment:<id>`, salvează și închide dialogul. |
| `onClose()` | Închide mini-jocul fără victorie. |
| `progress` | Progresul comun; tratează-l ca read-only. |
| `inventory` | Lista ID-urilor obiectelor colectate. |
| `selectedItem` | ID-ul obiectului selectat în inventar sau `null`. |
| `notify(text)` | Afișează un mesaj temporar. |

După implementare, importă-l în `src/houses/index.js` și conectează-l:

```jsx
import AnaGame from './ana/AnaGame';

// În HOUSE_MODULES:
guest: {Room: AnaHouse, Game: AnaGame},
```

Cu `PersonalRoom`, butonul deschide automat jocul în `DetailDialog`, cu focus controlat și închidere prin Escape. Nu crea încă un dialog în `AnaGame` dacă folosești acest mecanism.

Nu apela `onWin()` la montare, la simpla deschidere sau la închidere. Jocul stabilește singur condiția reală de câștig. Nu scrie direct în `localStorage`; aplicația gestionează salvarea și evită recompensele duplicate. Curăță timer-ele și listener-ele la demontare.

## 5. Contractul unei camere complet proprii

Dacă nu folosești `PersonalRoom`, componenta `Room` primește:

| Prop | Utilizare |
| --- | --- |
| `member` | Metadatele tale. |
| `Game` | Componenta jocului înregistrat, sau `null`. |
| `onGameWin()` | Echivalentul comun pentru înregistrarea victoriei și acordarea fragmentului. |
| `onExit()` | Înapoi în oraș; folosește un singur buton în cameră. |
| `progress`, `dispatch` | Progresul și acțiunile comune. |
| `selectedItem`, `onUse()` | Obiectul selectat; `onUse()` deselectează după folosire, fără să îl consume. |
| `notify(text)` | Mesaj pentru utilizator. |

Colectarea unui obiect se face, de exemplu, prin:

```js
dispatch({type: 'collect', id: `keepsake:${member.id}`});
notify('Obiect adăugat în inventar.');
```

`keepsake:<id>` este suvenirul recunoscut de inventarul actual. Fragmentul mini-jocului este adăugat automat prin `onGameWin()`. Pentru alte tipuri de obiecte, echipa completează eticheta și descrierea în maparea inventarului din `App.jsx`.

Pentru detaliile unui obiect, folosește `DetailDialog` cu `title` și `onClose`, iar în conținut pune imaginea și descrierea. Păstrează minimum cinci obiecte interactive, o frază reprezentativă și minimum două interacțiuni speciale.

## 6. Casa Capcană se implementează în echipă

Și puzzle-urile demonstrative ale capcanei au fost eliminate. Creați componenta comună și atribuiți-o câmpului `game` al intrării `trap` din `HOUSES`.

Componenta primește `progress`, `inventory`, `selectedItem`, `hintsLeft`, `onHint`, `onWin`, `onClose` și `notify`. Ea gestionează ordinea puzzle-urilor și folosirea fragmentelor. Apelați `onHint()` doar la solicitarea unui indiciu și dezactivați solicitarea când `hintsLeft === 0`. Apelați `onWin()` numai după rezolvarea întregii capcane. Aplicația oferă fragmentul final și deblochează Camera Secretă.

Intrarea în capcană este blocată cât timp nu are o componentă conectată, pentru a nu lăsa jucătorul prins într-o cameră imposibil de terminat. După conectare sunt necesare toate victoriile personale; ieșirea este blocată până la `onWin()`, inclusiv după refresh.

## Verificare înainte de integrare

Rulează `npm run dev`, intră în casa ta și verifică obiectele, dialogul, inventarul, ieșirea și mini-jocul. Verifică și un ecran îngust. La câștig trebuie să apară o singură victorie și un singur fragment; la închidere fără câștig nu trebuie să apară niciunul.

Rulează `npm test` și `npm run build`. Pentru a reseta progresul de dezvoltare, șterge doar cheia `asii-town-adventure-v3` din localStorage pentru această aplicație. Versiunea v3 nu reutilizează victoriile jocurilor demonstrative eliminate.

Asseturile comune ale UI-ului sunt în `src/assets/ui`, iar clasele reutilizabile sunt `rpg-panel`, `rpg-button` și `interior-room`. Pachetul este folosit conform licenței incluse; distribuirea fișierelor sale ca pachet separat sau într-un repository public este restricționată de autor.

## Imagini pentru obiecte

Obiectele din `PersonalRoom`, `HouseInterior` și replicile din Camera Secretă folosesc aceeași componentă `ObjectImage`. Fotografia apare în cameră și în dialogul de detalii. Se păstrează proporțiile; imaginile lipsă sau care nu pot fi încărcate afișează „Fără imagine”, fără emoji sau iconițe înlocuitoare.

Pentru structura scurtă din `content.js`, adaugă URL-ul ca al treilea element:

```js
// Pune fișierul în public/objects/busola.jpg.
['Busola', 'Descriere despre proprietar.', '/objects/busola.jpg']
```

Poți folosi și obiecte cu proprietăți explicite:

```js
{
  id: 'busola',
  label: 'Busola',
  description: 'Descriere despre proprietar.',
  image: {src: '/objects/busola.jpg', alt: 'Busola de pe birou'}
}
```

Pentru fișiere din `src/assets`, importă imaginea în modulul datelor și folosește variabila importată drept `image` sau `image.src`. Nu este necesară declararea dimensiunilor pentru fotografii obișnuite. Pentru un sprite decupat, folosește în continuare `{src, x, y, w, h, sheetWidth, sheetHeight}`. `pixel: true` activează afișarea pixelată pentru o imagine obișnuită; fotografiile rămân netezite implicit.
