// Offline browser validation. No remote app or account is contacted.
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const cwd=fileURLToPath(new URL('../../',import.meta.url));
const env={...process.env,PLAYWRIGHT_MODULE:process.env.PLAYWRIGHT_MODULE||'/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright-core/index.mjs',CHROMIUM_PATH:process.env.CHROMIUM_PATH||'/usr/bin/chromium',GRUNNDOKU_TEST_URL:'http://grunndoku.local/'};
for(const file of ['browser-check.mjs','martini-surroundings-browser-check.mjs','noorderzon-browser-check.mjs','dossier-browser-check.mjs','experienced-browser-check.mjs',...(process.argv.includes('--accounts')?['account-browser-check.mjs']:[]),...(process.argv.includes('--pdf')?['print-surroundings.mjs']:[])]){
 console.log(`Checking ${file}`);
 execFileSync(process.execPath,['grunndoku/scripts/'+file],{cwd,env,stdio:'inherit',timeout:180000});
}
