import {useMemo, useState} from 'react';
import memoriesImg from '../../assets/andrei-room/c10.png';
import circles from '../../assets/andrei-room/circles.jpg';
import floyd from '../../assets/andrei-room/pink_floyd.jpg';
import blonde from '../../assets/andrei-room/blonde.png';
import igor from '../../assets/andrei-room/igor.png';
import morales from '../../assets/andrei-room/morales.png';
import {CheckCircle2, ChevronDown, ChevronUp, ImagePlus, RotateCcw, Trophy} from 'lucide-react';

const START_ALBUMS = [
  {id:'a', title:'Wish You Were Here de Pink Floyd', image:floyd},
  {id:'b', title:'IGOR de Tyler,The Creator', image:igor},
  {id:'c', title:'Blonde de Frank Ocean', image:blonde},
  {id:'d', title:'Mr.Morales de Kendrick Lamar', image:morales},
  {id:'e', title:'Circles de Mac Miller', image:circles},
];

const compareTitles = (a,b) => a.title.localeCompare(b.title, 'ro', {sensitivity:'base'});

export default function AlbumSortingGame({onWin, onClose}) {
  const [albums, setAlbums] = useState(() => [...START_ALBUMS].sort(() => Math.random() - 0.5));
  const [checked, setChecked] = useState(false);
  const [message, setMessage] = useState('Mută albumele în ordine alfabetică, de la A la Z.');
  const sorted = useMemo(() => [...albums].sort(compareTitles), [albums]);
  const isCorrect = albums.every((album, i) => album.id === sorted[i].id);

  function move(index, direction) {
    const target = index + direction;
    if (target < 0 || target >= albums.length) return;
    setAlbums(old => {
      const next = [...old];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    setChecked(false);
    setMessage('Continuă sortarea, apoi verifică ordinea.');
  }

  function verify() {
    setChecked(true);
    if (isCorrect) {
      setMessage('Perfect! Toate albumele sunt în ordine alfabetică.');
      onWin?.();
    } else {
      setMessage('Mai sunt albume de mutat. Compară prima literă și continuă!');
    }
  }

  function reset() {
    setAlbums([...START_ALBUMS].sort(() => Math.random() - 0.5));
    setChecked(false);
    setMessage('Mută albumele în ordine alfabetică, de la A la Z.');
  }

  return <div className="album-sort-game">
    <p>Pe birou s-au amestecat albumele. Așază-le de la A la Z folosind săgețile de lângă fiecare album.</p>
    <ol className="album-sort-list">
      {albums.map((album, index) => {
        const right = checked && album.id === sorted[index]?.id;
        return <li className={`album-sort-card ${right ? 'is-right' : ''}`} key={album.id}>
          <span className="album-sort-position">{index + 1}</span>
          <div className="album-sort-cover" aria-hidden="true">
            {album.image ? <img src={album.image} alt="" /> : <ImagePlus size={23}/>}
          </div>
          <span className="album-sort-title">{album.title}</span>
          <div className="album-sort-controls">
            <button type="button" className="rpg-button album-arrow" onClick={() => move(index, -1)} disabled={index === 0} aria-label={`Mută ${album.title} în sus`}><ChevronUp size={16}/></button>
            <button type="button" className="rpg-button album-arrow" onClick={() => move(index, 1)} disabled={index === albums.length - 1} aria-label={`Mută ${album.title} în jos`}><ChevronDown size={16}/></button>
          </div>
          {right && <CheckCircle2 size={17} aria-label="Poziție corectă"/>}
        </li>;
      })}
    </ol>
    <p className={`album-sort-message ${checked && isCorrect ? 'success' : ''}`} role="status">{message}</p>
    <div className="album-sort-actions">
      <button type="button" className="rpg-button" onClick={verify}><Trophy size={16}/> Verifică ordinea</button>
      <button type="button" className="rpg-button" onClick={reset}><RotateCcw size={16}/> Amestecă din nou</button>
      {checked && isCorrect && <button type="button" className="rpg-button" onClick={onClose}>Gata</button>}
    </div>
  </div>;
}
