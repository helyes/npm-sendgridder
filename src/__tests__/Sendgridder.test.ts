import { IncomingMessage } from 'http';
import * as mockito from 'ts-mockito';
import { Sendgridder } from '../index';

describe('Sengridder', () => {
  
  let sendgridder: Sendgridder;


  const config = {
    apiEndpoint: 'https://api.sendgrid.com/v3/mail/send',
    apiKey: 'apiKey-value',
    apiKeyId: 'apiKeyId-value',
    from: { email: 'from@email.com', name: 'From Name' },
    replyTo: { email: 'to@email.com', name: 'To Name' },
    templateId: 'd-0123456789001234567890123456789012',
  };

  beforeAll(() => {
    sendgridder = new Sendgridder(config);
    // sendgridder.debug = true;
  });


  describe('buildDetailedResponse', () => { 
    let incomingMessageMock:IncomingMessage
    let mockedIncomingMessageClass:IncomingMessage
    
    beforeAll(() => {
      mockedIncomingMessageClass = mockito.mock(IncomingMessage);
      mockito.when(mockedIncomingMessageClass.statusCode).thenReturn(200);
      incomingMessageMock = mockito.instance(mockedIncomingMessageClass);
    });

    test('build correct response with one recipient', () => {
      const personalizedFields = [
        {
          data: {},
          to: { email: 'to@email.com', name: 'John Doe' },
        },
      ];
      
      const response =  sendgridder.buildDetailedResponse(personalizedFields, incomingMessageMock, 'blah');

      expect(response).toEqual({ 
        data: 'blah',
        status: 'OK',
        statusCode: 200,
        to: { 
          count: 1,
          emailFirst: { email: 'to@email.com', name: 'John Doe' },
        }}
      );
     });

     test('build correct response for sendgrid with many recipients', () => {
      
      const personalizedFieldTemplate =
        {
          // omitting fields not required here
          data: {},
          to: { email: 'to@email.com', name: 'John Doe' },
        };

      const personalizedFields = [];
      for(let i = 0; i < 10; i++){
        personalizedFields.push({...personalizedFieldTemplate, ...{to: { email: `to${i+1}@email.com`, name: `John Doe ${i+1}` }}})
      }  
      
      const response =  sendgridder.buildDetailedResponse(personalizedFields, incomingMessageMock, 'blah');
      expect(response).toEqual({ 
          data: 'blah',
          status: 'OK',
          statusCode: 200,
          to: { 
            count: 10,
            emailFirst: { email: 'to1@email.com', name: 'John Doe 1' },
            emailLast: { email: 'to10@email.com', name: 'John Doe 10' } 
          }
        }
      );
     });

  });
  
  describe('buildPayload', () => {
    test('build correct payload for sendgrid with one recipient', () => {
      const personalizedFields = [
        {
          data: {
            accountname: 'Test account',
            firstname: 'Andras',
            stats: {
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
              clientsserviced: 12,
              feedbacks: 67,
              hoursrostered: 345,
              incidents: 1,
              progressnotes: 67,
              shifts: 45,
            },
          },
          to: { email: 'to@email.com', name: 'John Doe' },
        },
      ];

      expect(sendgridder.buildPayload(personalizedFields)).toEqual({
        from: config.from,
        personalizations: [
          {
            dynamic_template_data: personalizedFields[0].data,
            to: [{ email: 'to@email.com', name: 'John Doe' }],
          },
        ],
        reply_to: config.replyTo,
        template_id: config.templateId,
      });
    });

    test('build correct payload for sendgrid with multiple recipients', () => {
      const personalizedFields = [
        {
          data: {
            accountname: 'Test account 1',
            firstname: 'Andras',
            stats: {
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
              clientsserviced: 12,
              feedbacks: 67,
              hoursrostered: 345,
              incidents: 1,
              progressnotes: 67,
              shifts: 45,
            },
          },
          to: { email: 'to@email.com', name: 'John Doe' },
        },
        {
          data: {
            accountname: 'Test account 2',
            firstname: 'Andras 2',
            stats: {
              careers: 672,
              careerstop: [
                {
                  name: 'Klara Dupont',
                  shifts: 102,
                },
                {
                  name: 'Ellis Lawson',
                  shifts: 92,
                },
                {
                  name: 'Herman Roberts',
                  shifts: 82,
                },
              ],
              clientsserviced: 122,
              feedbacks: 672,
              hoursrostered: 3452,
              incidents: 12,
              progressnotes: 672,
              shifts: 452,
            },
          },
          to: { email: 'to2@email.com', name: 'John Doe 2' },
        },
      ];

      expect(sendgridder.buildPayload(personalizedFields)).toEqual({
        from: config.from,
        personalizations: [
          {
            dynamic_template_data: personalizedFields[0].data,
            to: [{ email: 'to@email.com', name: 'John Doe' }],
          },
          {
            dynamic_template_data: personalizedFields[1].data,
            to: [{ email: 'to2@email.com', name: 'John Doe 2' }],
          }
        ],
        reply_to: config.replyTo,
        template_id: config.templateId,
      });
    });
  });
});
