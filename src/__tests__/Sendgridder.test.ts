import { Sendgridder } from '../index';

test('Sengridder', () => {
  // const sendgridder = new Sendgridder({
  //   apiEndpoint: 'https://api.sendgrid.com/v3/mail/send',
  //   apiKeyId: 'mGihSsk2RROnkgLkgkZzAw',
  //   apiKey: 'cB9mdM3IRZJHFpZYsffzNe2kOKnD8ccGM1sMNlWhxsk',
  //   templateId: 'd-856ccfc2eec1413280f620a5ef6b1c48',
  //   from: {email: 'from@email.com', name: 'From Name'},
  //   replyTo: {email: 'to@email.com', name: 'To Name'},
  // });

  const config = {
    apiEndpoint: 'https://api.sendgrid.com/v3/mail/send',
    apiKeyId: 'apiKeyId-value',
    apiKey: 'apiKey-value',
    templateId: 'd-0123456789001234567890123456789012',
    subject: 'Weekly newsletter',
    from: { email: 'from@email.com', name: 'From Name' },
    replyTo: { email: 'to@email.com', name: 'To Name' },
  };

  const sendgridder = new Sendgridder(config);

  expect(sendgridder.buildPayload({}, { email: 'to@email.com', name: 'John Doe' })).toEqual({
    from: { email: 'from@email.com', name: 'From Name' },
    reply_to: { email: 'to@email.com', name: 'To Name' },
    template_id: 'd-0123456789001234567890123456789012',
    personalizations: [
      {
        to: [{ email: 'to@email.com', name: 'John Doe' }],
        dynamic_template_data: {},
        subject: 'Weekly newsletter',
      },
    ],
  });

  const personalizedFields = {
    accountname: 'Test account',
    firstname: 'Andras',
    stats: {
      clientsserviced: 12,
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

  expect(sendgridder.buildPayload(personalizedFields, { email: 'to@email.com', name: 'John Doe' })).toEqual({
    from: config.from,
    reply_to: config.replyTo,
    template_id: config.templateId,
    personalizations: [
      {
        to: [{ email: 'to@email.com', name: 'John Doe' }],
        dynamic_template_data: personalizedFields,
        subject: config.subject,
      },
    ],
  });
});
