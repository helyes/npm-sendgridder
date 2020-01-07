
import * as dotenv from 'dotenv';
import * as fs from "fs";
import * as path from "path";
import { Sendgridder } from '../../index';

dotenv.config();

if (process.argv.length !==3) {
    throw Error(`Must pass personalization file name \x1b[31mrelative to ${path.dirname(__filename)}\x1b[0m`);
}
const personalizationFilePath = path.join(path.dirname(__filename), process.argv[2]);
console.log('Loading \x1b[36m%s\x1b[0m', personalizationFilePath);
const personalizationAsAstring = fs.readFileSync(personalizationFilePath).toString();
const personalization = JSON.parse(personalizationAsAstring);

// replace to emails from .env
for(let i = 0; i < personalization.length; i++){
  personalization[i].to.email =  process.env[`email_to_${i+1}`];
}

console.log('Parsed personalization content:\n \x1b[36m%s\x1b[0m', JSON.stringify(personalization, null, 2));

const config = {
  apiEndpoint: 'https://api.sendgrid.com/v3/mail/send',
  apiKey: process.env.sendgrid_api_key || 'please set sendgrid_api_key in dotenv',
  apiKeyId: process.env.sendgrid_api_keyid || 'please set sendgrid_api_key_id in dotenv',
  from: { email: 'from@email.com', name: 'From Name' },
  replyTo: { email: 'to@email.com', name: 'To Name' },
  templateId: process.env.templateid_weeklydigest || 'please set templateid_weeklydigest in dotenv',
};

const s = new Sendgridder(config);
s.debug = true;

async function send() {
  try {
    const result = await s.sendTransactional(personalization);
    console.log("Result:", result); 
  } catch (error) {
    console.error('\n\nError:', error);
  }
}

send();
