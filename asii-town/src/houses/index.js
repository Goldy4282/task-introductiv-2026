import ExampleHouse from './ExampleHouse';
import MihaiHouse from './mihai-room/MihaiHouse';
import MihaiGame from './mihai-room/MihaiGame';
import ArtistHouse from './andrei-room/ArtistHouse';
import AlbumSortingGame from './andrei-room/AlbumSortingGame';
import {MEMBERS} from './content';
// Each participant imports their own Room and Game here.
export const HOUSE_MODULES={
 guest:{Room:ExampleHouse,Game:null},
 maker:{Room:MihaiHouse,Game:MihaiGame},
 reader:{Room:ExampleHouse,Game:null},
 artist:{Room:ArtistHouse,Game:AlbumSortingGame},
};
export const HOUSES=[
 ...MEMBERS.map((m,i)=>({id:m.id,title:m.title,owner:m.name,type:'personal',x:8+i*8,y:6,w:5,h:4,doorOffset:2,component:HOUSE_MODULES[m.id].Room,game:HOUSE_MODULES[m.id].Game})),
 {id:'library',title:'Biblioteca satului',type:'decor',x:8,y:20,w:5,h:4,doorOffset:2},
 {id:'cafe',title:'Cafeneaua',type:'decor',x:16,y:21,w:5,h:4,doorOffset:2},
 {id:'trap',title:'Casa Capcană',type:'trap',x:25,y:20,w:5,h:4,doorOffset:2},
 {id:'secret',title:'Camera Secretă',type:'secret',x:33,y:18,w:5,h:4,doorOffset:2},
];
export const HOUSE_COMPONENTS=Object.fromEntries(HOUSES.filter(h=>h.component).map(h=>[h.id,h.component]));

// Import each participant's mini-game here and assign it to the corresponding house.
export const HOUSE_GAMES=Object.fromEntries(HOUSES.map(h=>[h.id,h.game||null]));
