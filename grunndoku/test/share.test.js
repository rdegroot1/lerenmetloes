import test from 'node:test';import assert from 'node:assert/strict';import {completionShare} from '../share.js';
test('shared results contain a celebration and clean public link, with no solution or Auth data',()=>{
 const p={id:'winter-case-3',title:'Een mysterie aan de A',seriesId:'winter',difficultyStars:3,culprit:'SECRET',positions:{0:1}};
 const share=completionShare(p,'https://example.com/grunndoku/?accounts=preview&reset-password=1#access_token=SECRET');
 assert.equal(share.url,'https://example.com/grunndoku/?serie=winter&zaak=winter-case-3');assert.match(share.text,/140 speurpunten/);assert.match(share.text,/Een mysterie aan de A/);assert.doesNotMatch(JSON.stringify(share),/SECRET|access_token|accounts=|reset-password|culprit|positions/);
});

import {emptyMapSvg} from '../share-image.js';
import {readFileSync} from 'node:fs';
const puzzles=JSON.parse(readFileSync(new URL('../puzzles.json',import.meta.url)));
for(const p of puzzles)test(`${p.id}: shared map uses only public map data, not any placement or person`,()=>{
 const before=JSON.stringify(p),{svg,width,height}=emptyMapSvg({...p,positions:{secret:'PRIVATE'},solution:'PRIVATE',notes:'PRIVATE',people:p.people.map(person=>({...person,name:'PRIVATE'}))});
 assert.equal(width,1200);assert.ok(height>265&&height<=1915);assert.match(svg,/<svg/);assert.doesNotMatch(svg,/PRIVATE|person-token|token-name|candidate-notes|foreignObject/);assert.equal(JSON.stringify(p),before);
 for(const area of p.areas)assert.ok(svg.includes(area.replaceAll('&','&amp;').replaceAll("'",'&apos;')));
});
