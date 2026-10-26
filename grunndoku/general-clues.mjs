import {solve,valid,canStand,cellCount,rowOf,columnOf} from './engine.js';

export function assertGeneralCluePolicy(p){
 for(const {text} of p.clues){
  if(/\b\d+\s+(?:vakjes|vakken|plaatsen)\s+(?:boven|onder|naast|links|rechts)/i.test(text)||/\brij\s+\d+/i.test(text)&&/\bkolom\s+\d+/i.test(text))throw Error('Exact location clue is not allowed: '+p.id+' — '+text);
 }
}

// Public, broader replacements for legacy counted-offset clues. One axis at a
// time; relationships reference witnesses only. Masks come from the visible map,
// not a stored solution. Keep the original dossiers and player placements stable.
export const GENERAL_CLUES={
  "martini-v1-2": [
    {
      "a": 0,
      "axis": "column",
      "number": 5,
      "area": "Middenschip",
      "type": "below",
      "b": 6,
      "text": "Bevond zich in kolom 5, in het gebied Middenschip, lager op de kaart dan Harm."
    }
  ],
  "martini-v1-3": [
    {
      "a": 2,
      "axis": "column",
      "number": 5,
      "type": "below",
      "b": 0,
      "text": "Bevond zich in kolom 5, lager op de kaart dan Arend."
    }
  ],
  "martini-v1-4": [
    {
      "a": 9,
      "axis": "column",
      "number": 6,
      "text": "Bevond zich in kolom 6."
    }
  ],
  "martini-v1-5": [
    {
      "a": 1,
      "axis": "row",
      "number": 6,
      "type": "right",
      "b": 3,
      "text": "Bevond zich in rij 6, rechts van Tammo."
    },
    {
      "a": 11,
      "axis": "row",
      "number": 4,
      "type": "right",
      "b": 2,
      "text": "Bevond zich in rij 4, rechts van Cora."
    }
  ],
  "martini-v1-6": [
    {
      "a": 1,
      "axis": "column",
      "number": 11,
      "type": "above",
      "b": 8,
      "text": "Bevond zich in kolom 11, hoger op de kaart dan Jantje."
    },
    {
      "a": 2,
      "axis": "row",
      "number": 5,
      "type": "right",
      "b": 0,
      "text": "Bevond zich in rij 5, rechts van Arend."
    },
    {
      "a": 3,
      "axis": "column",
      "number": 15,
      "type": "below",
      "b": 10,
      "text": "Bevond zich in kolom 15, lager op de kaart dan Neeltje."
    },
    {
      "a": 7,
      "axis": "row",
      "number": 16,
      "type": "left",
      "b": 13,
      "text": "Bevond zich in rij 16, links van Sientje."
    },
    {
      "a": 9,
      "axis": "column",
      "number": 12,
      "type": "below",
      "b": 14,
      "text": "Bevond zich in kolom 12, lager op de kaart dan Evert."
    },
    {
      "a": 10,
      "axis": "column",
      "number": 13,
      "floor": true,
      "text": "Stond op een leeg vloervak in kolom 13."
    },
    {
      "a": 11,
      "axis": "column",
      "number": 19,
      "type": "above",
      "b": 4,
      "text": "Bevond zich in kolom 19, hoger op de kaart dan Geeske."
    },
    {
      "a": 13,
      "axis": "column",
      "number": 9,
      "area": "Zuidportaal",
      "type": "above",
      "b": 1,
      "text": "Bevond zich in kolom 9, in het gebied Zuidportaal, hoger op de kaart dan Bertus."
    }
  ],
  "martinitoren-v1-2": [
    {
      "a": 8,
      "axis": "row",
      "number": 5,
      "text": "Bevond zich in rij 5."
    }
  ],
  "martinitoren-v1-3": [
    {
      "a": 4,
      "axis": "row",
      "number": 9,
      "type": "right",
      "b": 0,
      "text": "Bevond zich in rij 9, rechts van Arend."
    },
    {
      "a": 6,
      "axis": "row",
      "number": 7,
      "type": "right",
      "b": 8,
      "text": "Bevond zich in rij 7, rechts van Jantje."
    },
    {
      "a": 7,
      "axis": "row",
      "number": 8,
      "area": "Trappenhuis",
      "text": "Bevond zich in rij 8, in het gebied Trappenhuis."
    },
    {
      "a": 9,
      "axis": "row",
      "number": 4,
      "type": "right",
      "b": 4,
      "text": "Bevond zich in rij 4, rechts van Geeske."
    }
  ],
  "winterwelvaart-v1-2": [
    {
      "a": 7,
      "axis": "row",
      "number": 7,
      "area": "Roef",
      "text": "Bevond zich in rij 7, in het gebied Roef."
    }
  ],
  "winterwelvaart-v1-3": [
    {
      "a": 1,
      "axis": "column",
      "number": 8,
      "type": "above",
      "b": 3,
      "text": "Bevond zich in kolom 8, hoger op de kaart dan Tammo."
    },
    {
      "a": 3,
      "axis": "row",
      "number": 4,
      "area": "Vuurtonplein",
      "type": "left",
      "b": 9,
      "text": "Bevond zich in rij 4, in het gebied Vuurtonplein, links van Wubbo."
    },
    {
      "a": 6,
      "axis": "column",
      "number": 2,
      "type": "below",
      "b": 2,
      "text": "Bevond zich in kolom 2, lager op de kaart dan Cora."
    }
  ],
  "winterwelvaart-v1-4": [
    {
      "a": 2,
      "axis": "row",
      "number": 9,
      "type": "right",
      "b": 10,
      "text": "Bevond zich in rij 9, rechts van Neeltje."
    },
    {
      "a": 11,
      "axis": "row",
      "number": 11,
      "area": "Kleine der A",
      "text": "Bevond zich in rij 11, in het gebied Kleine der A."
    }
  ],
  "winterwelvaart-v1-5": [
    {
      "a": 0,
      "axis": "column",
      "number": 13,
      "area": "Kunstpakhuis",
      "text": "Bevond zich in kolom 13, in het gebied Kunstpakhuis."
    },
    {
      "a": 4,
      "axis": "column",
      "number": 14,
      "type": "below",
      "b": 1,
      "text": "Bevond zich in kolom 14, lager op de kaart dan Bertus."
    },
    {
      "a": 6,
      "axis": "column",
      "number": 16,
      "area": "Vuurtonplein",
      "text": "Bevond zich in kolom 16, in het gebied Vuurtonplein."
    },
    {
      "a": 8,
      "axis": "column",
      "number": 9,
      "area": "Scheepsruim",
      "text": "Bevond zich in kolom 9, in het gebied Scheepsruim."
    },
    {
      "a": 10,
      "axis": "column",
      "number": 3,
      "type": "below",
      "b": 8,
      "text": "Bevond zich in kolom 3, lager op de kaart dan Jantje."
    },
    {
      "a": 12,
      "axis": "row",
      "number": 14,
      "type": "left",
      "b": 8,
      "text": "Bevond zich in rij 14, links van Jantje."
    }
  ],
  "winterwelvaart-v1-6": [
    {
      "a": 2,
      "axis": "column",
      "number": 15,
      "type": "below",
      "b": 0,
      "text": "Bevond zich in kolom 15, lager op de kaart dan Arend."
    },
    {
      "a": 4,
      "axis": "column",
      "number": 11,
      "text": "Bevond zich in kolom 11."
    },
    {
      "a": 9,
      "axis": "column",
      "number": 19,
      "type": "below",
      "b": 8,
      "text": "Bevond zich in kolom 19, lager op de kaart dan Jantje."
    },
    {
      "a": 12,
      "axis": "row",
      "number": 10,
      "area": "Achterdek",
      "type": "right",
      "b": 0,
      "text": "Bevond zich in rij 10, in het gebied Achterdek, rechts van Arend."
    }
  ]
};

export function applyGeneralClues(p){
 const plan=GENERAL_CLUES[p.id];if(!plan)return p;
 const available=Array.from({length:cellCount(p)},(_,c)=>c).filter(c=>canStand(p,c));
 const replacements=plan.map(({a,axis,number,area,floor,type='unary',b,text})=>{
  const areaIndex=area==null?null:p.areas.indexOf(area);
  if(area!=null&&areaIndex<0)throw Error('Missing general-clue area: '+area);
  const cells=available.filter(c=>(axis==='row'?rowOf(p,c):columnOf(p,c))===number-1&&(areaIndex==null||p.regions[c]===areaIndex)&&(!floor||!p.objects.some(o=>o.cell===c)));
  if(cells.length<2||a===p.victim||b===p.victim)throw Error('General clue must leave multiple places and avoid the victim: '+p.id);
  return {type,a,...(b==null?{}:{b}),text,cells};
 });
 if(replacements.every(q=>JSON.stringify(p.clues.find(c=>c.a===q.a))===JSON.stringify(q)))return p;
 const original=solve(p);if(original.length!==1)throw Error('General-clue base must be unique: '+p.id);
 for(const q of replacements){const slot=p.clues.findIndex(c=>c.a===q.a);if(slot<0)throw Error('Missing witness clue: '+p.id);p.clues[slot]=q;}
 const solutions=solve(p);
 if(solutions.length!==1||!valid(p,original[0],true)||JSON.stringify(solutions[0])!==JSON.stringify(original[0]))throw Error('General clues changed the solution: '+p.id);
 p.clueVersion=(p.clueVersion||1)+1;
 return p;
}
