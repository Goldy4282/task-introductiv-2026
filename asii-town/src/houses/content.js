// Replace these demonstration profiles with the team's own objects and stories.
// Text is deliberately written about the owner, without first person or names.
export const MEMBERS = [
 {
    id:'guest',
    name:'Colegul 1',
    title:'Casa exploratorului',
    color:'#8fae83',
    fragment:'24',
    fragmentLabel:'Cartonaș de traseu · 24',
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
    fragment:'Banană',
    fragmentLabel:'Banană',
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
    name:'Sughit',
    title:'Casa alchimistului',
    color:'#a7a1b7',
    fragment:'Placă Arduino reparată',
    fragmentLabel:'Placă Arduino reparată',
    hint:'Pe medalia de la olimpiadă este gravată o lună argintie. Aceasta este alegerea preferată.',
    quote:'Orice experiment lasă o poveste, chiar și o placă arsă.',
    objects:[
        ['Medalia de la olimpiadă','Anul urmator s-a scos bursa de olimpici. Pe verso este gravată o lună argintie.'],
        ['Placa Arduino arsă','Rezultatul lăsării aparatului de sudură prea aproape de plăcuță, pentru prea mult timp..'],
        ['Idiotul','Romanul lui F. M. Dostoievski, un cadou interesant.'],
        ['Inserter','The factory must grow!'],
        ['Baner For Honor','Hmm, heby.'],
        ['Legitimația de elev CFR','O legitimație de elev pentru călătoriile cu trenul, uitată pe podeaua camerei.']
    ]
 },
 {
    id:'artist',
    name:'Andrei',
    title:'Casa artistului',
    color:'#bc8c83',
    fragment:'Bere Ursus',
    fragmentLabel:'Bere Ursus',
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
