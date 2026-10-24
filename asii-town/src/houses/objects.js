import {objectImages} from '../assets';
export const objects=[
{id:'well',x:10,y:32,w:18,h:28,label:'Fântâna',description:'Apa rece și poveștile satului se întâlnesc aici.'},
{id:'barrel',x:40,y:32,w:18,h:28,label:'Butoiul',description:'Provizii pastrate pentru urmatoarea aventura.'},
{id:'flowers',x:70,y:32,w:18,h:28,label:'Florile',description:'Flori culese din sat si ingrijite in fiecare dimineata.'},
{id:'wood',x:25,y:65,w:18,h:26,label:'Lemnele',description:'Materiale pregatite pentru proiectele echipei.'},
{id:'sign',x:57,y:65,w:18,h:26,label:'Indicatorul',description:'Fiecare drum duce spre o noua poveste.'},
].map(o=>({...o,image:objectImages[o.id]}));
