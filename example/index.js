// dont forget to run yarn:build before trying
require('dotenv').config()
const Sendgridder = require('../lib/index').Sendgridder;

const config = {
  apiEndpoint: 'https://api.sendgrid.com/v3/mail/send',
  apiKeyId: process.env.sendgrid_api_keyid,
  apiKey: process.env.sendgrid_api_key,
  templateId: process.env.templateid_weeklydigest,
  from: { email: 'from@email.com', name: 'From Name' },
  replyTo: { email: 'to@email.com', name: 'To Name' },
};

var s = new Sendgridder(config);
s.debug = true;

const personalizedFields = {
  accountname: 'Test account',
  firstname: 'Andras',
  stats: {
    clientsserviced: 22,
    shifts: 45,
    hoursrostered: 345,
    progressnotes: 67,
    incidents: 1,
    feedbacks: 67,
    careers: 67,
    careerstop: [
      {
        name: 'Klara Dupont',
        shifts: 10,
      },
      {
        name: 'Ellis Lawson',
        shifts: 9,
      },
      {
        name: 'Herman Roberts',
        shifts: 8,
      },
    ],
  },
};

async function send() {
  try {
    console.log("1111"); 
    // let promise = s.sendTransactional(personalizedFields, { email: process.env.email_to, name: 'John Doe'});
    let result = await s.sendTransactional(personalizedFields, { email: process.env.email_to, name: 'John Doe'});
    console.log("2222"); 
    console.log("Result:", result); 
  } catch (error) {
    console.error('\n\nError:', error);
  }
}

send();