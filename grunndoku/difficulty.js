export const DIFFICULTY_NAMES=['Eem kalm aan beginnen','Nait al te gek','Een normale','Kop d’r veur!','Het ken net','Extreem · de Martini-proef'];
const levels={'Heel makkelijk':1,'Makkelijk':2,'Rustig puzzelen':2,'Gemiddeld':3,'Pittig':4,'Uitdagend':5};
export const difficultyFor=p=>Number.isInteger(p.difficultyStars)&&p.difficultyStars>=1&&p.difficultyStars<=6?p.difficultyStars:levels[p.level]||3;
export const difficultyNameFor=p=>p.difficultyLabel||DIFFICULTY_NAMES[difficultyFor(p)-1];
export const difficultyText=p=>{const n=difficultyFor(p);return '★'.repeat(n)+'☆'.repeat(Math.max(0,5-n))+' · '+difficultyNameFor(p);};
export function difficultyMarkup(p){
 const n=difficultyFor(p),label=difficultyNameFor(p);
 const star=filled=>`<svg viewBox="0 0 20 20" class="rating-star${filled?' filled':''}" focusable="false"><path d="M10 1.8L12.5 6.9L18.2 7.7L14.1 11.7L15.1 17.3L10 14.6L4.9 17.3L5.9 11.7L1.8 7.7L7.5 6.9Z"/></svg>`;
 return `<span class="rating" role="img" aria-label="Moeilijkheid: ${n} van ${n===6?6:5} sterren. ${label}"><span class="rating-stars" aria-hidden="true">${Array.from({length:n===6?6:5},(_,i)=>star(i<n)).join('')}</span><span class="rating-name" aria-hidden="true">${label}</span></span>`;
}
