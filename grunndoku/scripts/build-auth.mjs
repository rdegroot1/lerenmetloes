import {build} from 'esbuild';
import {fileURLToPath} from 'node:url';
await build({stdin:{contents:"export { createClient } from '@supabase/supabase-js';",resolveDir:fileURLToPath(new URL('../',import.meta.url))},bundle:true,platform:'browser',format:'esm',minify:true,target:'es2022',legalComments:'eof',outfile:fileURLToPath(new URL('../vendor/supabase.js',import.meta.url))});
