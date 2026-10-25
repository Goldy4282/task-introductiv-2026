// Replace these demonstration profiles with the team's own objects and stories.
// Text is deliberately written about the owner, without first person or names.
export const MEMBERS = [
 {
    id:'guest',
    name:'Colegul 1',
    title:'Casa exploratorului',
    color:'#8fae83',
    fragment:'24',
    hint:'Patru trasee sunt notate pe hartă: 2, 4, 1, 3.',
    quote:'Drumul bun începe cu o întrebare.',
    objects:[
        ['Busola','Se întoarce mereu de la plimbare cu un traseu nou.'],
        ['Harta','Patru trasee sunt notate cu 2, 4, 1, 3. Ordinea lor deschide terminalul.'],
        ['Rucsacul','Are mereu loc pentru încă o aventură.'],
        ['Biletul de tren','Colecționează drumuri, nu doar destinații.'],
        ['Jurnalul','Păstrează schițe ale locurilor descoperite.']
    ]
 },
 {
    id:'maker',
    name:'Mihai',
    title:'Camera inginerului cosmic',
    color:'#22e6ff',
    fragment:'13',
    hint:'Un proiect pornește de la idee, apoi schiță, prototip și test.',
    quote:'Orice sistem interesant începe ca un prototip.',
    objects:[
        ['Afișul cu Evelynn','Un afiș ales strategic pentru ochii băieților din cameră.'],
        ['Tiger I','Aproape o mie de ore de strategie, unghiuri și încă o rundă.'],
        ['Biroul de robotică','Fire, senzori și un prototip care încă învață să meargă drept.'],
        ['Panoul cu galaxie','Unele proiecte încep privind spre lucruri încă neinventate.'],
        ['Patul cu stele','Un episod SF neterminat poate amâna somnul cu ore întregi.']
    ]
 },
 {
    id:'reader',
    name:'Colegul 3',
    title:'Casa cititorului',
    color:'#a7a1b7',
    fragment:'LUNA',
    hint:'Semnul de carte are o lună argintie. Aceasta este alegerea preferată.',
    quote:'O pagină poate deschide o lume.',
    objects:[
        ['Cartea','Caută povești care schimbă felul în care privește lumea.'],
        ['Semnul de carte','Are o lună argintie. Acesta este simbolul preferat.'],
        ['Ceaiul','O lectură lungă începe cu o cană de ceai.'],
        ['Lampa','Lumina caldă rămâne aprinsă până la ultimul capitol.'],
        ['Jurnalul de lectură','Adună ideile care merită păstrate.']
    ]
 },
 {
    id:'artist',
    name:'Colegul 4',
    title:'Casa artistului',
    color:'#bc8c83',
    fragment:'SOARE',
    hint:'Paleta pune soarele lângă pensulă și luna lângă creion.',
    quote:'Culoarea spune ceea ce cuvintele încă nu știu.',
    objects:[
        ['Butoi cu rachiu','Soarele stă lângă pensulă, iar luna lângă creion.'],
        ['Tabloul lui PMS','Transformă o pată într-un început de poveste.'],
        ['Mimi','Desenează idei înainte să le explice.'],
        ['Lampa','Observă detaliile pe lângă care ceilalți trec.']
    ]
 },
];
export const TEAM_PROFILE='Patru feluri de a privi lumea: explorare, invenție, lectură și artă. Îi unește curiozitatea și dorința de a construi împreună. Îi diferențiază drumurile, instrumentele și poveștile prin care ajung la o idee.';
export const normalize=value=>String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toUpperCase().replace(/\s+/g,' ');
