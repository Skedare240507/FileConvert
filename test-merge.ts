import { env } from './backend/config/env';
import { mergeWithGotenberg } from './backend/services/conversion/gotenberg';
import fs from 'fs';

async function test() {
  const b1 = fs.readFileSync('package.json'); // Just using any file for now to see if Gotenberg complains about PDF
  try {
    console.log('Sending to gotenberg...');
    const out = await mergeWithGotenberg([b1, b1], 'pdf');
    console.log('Success!', out.length);
  } catch (e) {
    console.error('Error:', e);
  }
}
test();
