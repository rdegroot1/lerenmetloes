// Character flavour wraps public deductions; it never adds a new clue.
export function victimHint(p, text, step=0) {
 const name=p.people[p.victim].name;
 const openings=[`Moi, ${name} hier. Zullen we dit eem rustig bekijken?`, 'Kiek, nu komen we een stap verder.', 'Zo, daar kun je wat mee, mien jong.'];
 return `${openings[Math.min(step,openings.length-1)]} ${text}`;
}
// Every reaction celebrates solving, regardless of speed, hints or mistakes.
export const CELEBRATIONS=Object.freeze([
 'Moi, speurneus! Alle stukjes vallen op hun plek. Dat heb je mooi uitgezocht.',
 'Kon minder, mien jong! Deze zaak zit keurig in elkaar dankzij jouw speurwerk.',
 'Kiek, opgelost! Jij hebt de verbanden gevonden. Daar mag je best even trots op zijn.',
 'Zo, die is binnen! Tijd om even achterover te leunen en van je oplossing te genieten.',
 'Nou, daar had ik zelf nog wel eem over moeten nadenken. Mooi speurwerk!',
 'Van losse aanwijzingen naar een kloppend verhaal. Jij hebt het voor elkaar.',
 'Deze zaak kan het archief in. Met jouw naam op het dossier, natuurlijk.',
 'Moi! Je hebt iedereen een plek gegeven en de dader gevonden. Keurig gedaan.',
 'Kiek ’s aan: geen losse eindjes meer. Jij hebt de boel mooi uitgeplozen.',
 'Even een denkpauze verdiend. De zaak is rond en dat heb jij gedaan.',
 'Zo mag ik het zien! Stap voor stap heb je deze zaak ontrafeld.',
 'Dat was een mooi stukje denkwerk. Stad heeft er een speurneus bij.',
 'De aanwijzingen kloppen, de kaart klopt, de zaak is rond. Geniet er maar eem van!',
 'Ik kan weer rustig ademhalen… nou ja, bij wijze van spreken. Bedankt, detective!',
 'Daar sta je dan, met een opgelost mysterie. Dat voelt goed, of niet?',
 'Mooi man! Waar eerst alleen vragen waren, ligt nu jouw oplossing.',
 'Een nieuw dossier voor je verzameling. Helemaal door jou uitgezocht.',
 'Je hebt de juiste verbanden gelegd. Dat is precies waar een goede speurder oog voor heeft.',
 'Klaar! Pak gerust even wat te drinken. Deze oplossing mag gevierd worden.',
 'Goed bekeken, goed gecombineerd, zaak opgelost. Daar word ik nou blij van.'
]);
export function celebrationMessage(index=0){return CELEBRATIONS[((Math.trunc(index)||0)%CELEBRATIONS.length+CELEBRATIONS.length)%CELEBRATIONS.length];}
export function nextCelebration(previous=-1,random=Math.random()){
 const hasPrevious=Number.isInteger(previous)&&previous>=0&&previous<CELEBRATIONS.length;
 const pick=Math.min((hasPrevious?CELEBRATIONS.length-1:CELEBRATIONS.length)-1,Math.max(0,Math.floor((Number.isFinite(random)?random:0)*(hasPrevious?CELEBRATIONS.length-1:CELEBRATIONS.length))));
 return hasPrevious&&pick>=previous?pick+1:pick;
}
export function completionMessage(milliseconds,partial=false) {
 const seconds=Math.max(1,Math.round((Number(milliseconds)||0)/1000));
 const minutes=Math.floor(seconds/60),rest=seconds%60;
 const duration=minutes ? `${minutes} ${minutes===1?'minuut':'minuten'}${rest?` en ${rest} ${rest===1?'seconde':'seconden'}`:''}` : `${seconds} ${seconds===1?'seconde':'seconden'}`;
 if(partial)return `Gemeten speeltijd sinds de update: ${duration}.`;
 return `Jouw speeltijd: ${duration}.`;
}
export function elapsedTime(saved,delta) {
 const previous=Number.isFinite(saved)&&saved>=0?saved:0;
 return previous+(Number.isFinite(delta)&&delta>0?delta:0);
}
