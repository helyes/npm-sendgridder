export interface ISendgridConfig {
  apiEndpoint: string;
  apiKeyId: string;
  apiKey: string;
  from: IEmailAddress;
  replyTo: IEmailAddress;
  templateId: string;
  subject: string;
}

export interface IEmailAddress {
  email: string;
  name?: string;
}

export interface ITransactionalPayload {
  personalizations: [
    {
      subject: string;
      to: IEmailAddress[];
      dynamic_template_data: object;
    },
  ];
  from: IEmailAddress;
  reply_to: IEmailAddress;
  template_id: string;
}
