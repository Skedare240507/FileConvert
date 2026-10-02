import { mergeWithGotenberg, convertWithGotenberg } from './backend/services/conversion/gotenberg';
import fs from 'fs';

async function test() {
  try {
    // Generate a valid PDF first
    const txt = fs.readFileSync('package.json');
    console.log('Generating valid PDF...');
    const validPdf = await convertWithGotenberg(txt, 'txt', 'pdf');
    
    console.log('Sending to gotenberg for merge...');
    const out = await mergeWithGotenberg([validPdf, validPdf], 'pdf');
    console.log('Success!', out.length);
  } catch (e) {
    console.error('Error:', e);
  }
}
test();
