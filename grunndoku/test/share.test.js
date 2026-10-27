import test from 'node:test';import assert from 'node:assert/strict';import {completionShare} from '../share.js';
test('shared results contain a celebration and clean public link, with no solution or Auth data',()=>{
 const p={title:'Een mysterie aan de A',seriesId:'winter',difficultyStars:3,culprit:'SECRET',positions:{0:1}};
 const share=completionShare(p,'https://example.com/grunndoku/?accounts=preview&reset-password=1#access_token=SECRET');
 assert.equal(share.url,'https://example.com/grunndoku/?serie=winter');assert.match(share.text,/140 speurpunten/);assert.match(share.text,/Een mysterie aan de A/);assert.doesNotMatch(JSON.stringify(share),/SECRET|access_token|accounts=|reset-password|culprit|positions/);
});
