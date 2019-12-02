import { IncomingMessage } from 'http';
import https = require('https');
import url = require('url');
import { IEmailAddress, ISendgridConfig, ITransactionalPayload } from './ISendgridConfig';

export interface ISendgridderResponse {
  statusCode: number;
  status: string;
  data: string;
}

export class Sendgridder {
  private _authToken: string;
  private _config: ISendgridConfig;
  private _debug: boolean = false;

  constructor(config: ISendgridConfig) {
    this._config = config;
    this._authToken = `Bearer SG.${config.apiKeyId}.${config.apiKey}`;
  }

  public set debug(value: boolean) {
    this._debug = value;
  }

  public buildPayload(personalization: {}, to: IEmailAddress): ITransactionalPayload {
    const ret: ITransactionalPayload = {
      from: this._config.from,
      personalizations: [
        {
          dynamic_template_data: personalization,
          subject: this._config.subject,
          to: [to],
        },
      ],
      reply_to: this._config.replyTo,
      template_id: this._config.templateId,
    };
    return ret;
  }

  public sendTransactional(personalization: object, to: IEmailAddress): Promise<ISendgridderResponse> {
    if (this._debug) {
      // tslint:disable-next-line:no-console
      console.log(`Received personalization: ${JSON.stringify(personalization, null, 2)},  \n\nconfig:${JSON.stringify(this._config, null, 2)}`);
    }
    const payload = JSON.stringify(this.buildPayload(personalization, to));
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
            resolve({statusCode: response.statusCode, status: "OK", data: responseData});
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

}



// if (require.main === module) {
//
// }
