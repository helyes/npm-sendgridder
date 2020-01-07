import { IncomingMessage } from 'http';
import https = require('https');
import url = require('url');
import { IEmailAddress, IPersonalizationSendgrid, ISendgridConfig, ITransactionalPayload } from './ISendgridConfig';

export interface ISendgridderResponse {
  statusCode: number;
  status: string;
  data: string;
  to: {
    count: number;
    emailFirst: IEmailAddress,
    emailLast?: IEmailAddress,
  };
}

export interface IPersonalization {
  to : IEmailAddress;
  data : object;
}


export class Sendgridder {
    
  private readonly _authToken: string;
  private readonly _config: ISendgridConfig;
  private _debug: boolean = false;

  constructor(config: ISendgridConfig) {
    this._config = config;
    this._authToken = `Bearer SG.${config.apiKeyId}.${config.apiKey}`;
  }

  public set debug(value: boolean) {
    this._debug = value;
  }
  
  public buildPayload(personalizations: IPersonalization[]): ITransactionalPayload {

    const templateData : IPersonalizationSendgrid[] = [];

    for (const personalization of personalizations) {
      templateData.push(
        {
          dynamic_template_data : personalization.data,
          to: [personalization.to],
        }
      );
    }
    if (this._debug) {
      console.log('Personalizations:', JSON.stringify(personalizations, null, 2));
    }

    const ret: ITransactionalPayload = {
      from: this._config.from,
      personalizations: templateData,
      reply_to: this._config.replyTo,
      template_id: this._config.templateId,
    };
    if (this._debug) {
      console.log('Payload:', JSON.stringify(ret, null, 2));
    }
    return ret;
  }

  public sendTransactional(personalization: IPersonalization[]): Promise<ISendgridderResponse> {
    if (this._debug) {
      console.log(`Received personalization: ${JSON.stringify(personalization, null, 2)},  \n\nconfig:${JSON.stringify(this._config, null, 2)}`);
    }
    const payload = JSON.stringify(this.buildPayload(personalization));
    const parsedUrl = url.parse(this._config.apiEndpoint);
    const options = {
      headers: {
        'Content-Type': 'application/json',
        authorization: this._authToken,
      },

      hostname: parsedUrl.hostname,
      method: 'POST',
      path: parsedUrl.path,
    };
    
    return new Promise<ISendgridderResponse>((resolve, reject) => {
      let responseData = '';
      const req = https.request(options, (response: IncomingMessage) => {
        response.on('data', (chunk) => {
          responseData += chunk;
        });
        response.on('end', () => {
          if (response.statusCode && response.statusCode < 400) {
            // resolve({statusCode: response.statusCode, status: "OK", data: responseData, to: personalization[0].to});
            resolve(this.buildDetailedResponse(personalization, response, responseData));
          } else {
            reject(responseData);
          }
        });
      });

      req.on('error', (error) => {
        reject(error.message);
      });

      req.write(payload);
      req.end();
    });
  }

  public buildDetailedResponse(personalization: IPersonalization[], responseRaw: IncomingMessage, responseData: string):  ISendgridderResponse {
    const to = { 
      count: personalization.length,
      emailFirst: personalization[0].to,
      emailLast: personalization.length > 1 ? personalization[personalization.length -1].to : undefined,
     };
    return {statusCode: responseRaw.statusCode || 599, status: "OK", data: responseData, to};
  }

}

// if (require.main === module) {
//
// }
