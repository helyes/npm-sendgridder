export interface ISendgridConfig {
  apiEndpoint: string;
  apiKeyId: string;
  apiKey: string;
  from: IEmailAddress;
  replyTo: IEmailAddress;
  templateId: string;
}

export interface IEmailAddress {
  email: string;
  name?: string;
}

export interface IPersonalizationSendgrid {
  to: IEmailAddress[];
  dynamic_template_data: object;
}

export interface ITransactionalPayload {
  personalizations: IPersonalizationSendgrid[];
  from: IEmailAddress;
  reply_to: IEmailAddress;
  template_id: string;
}

export interface IBounceResponse{
  created: number,
  email: string,
  reason: string,
  status: string
}