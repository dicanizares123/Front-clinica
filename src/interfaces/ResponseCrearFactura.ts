// Interfaces para la solicitud de factura
export interface TaxAuthorityInfo {
  socialReason: string;
  commercialName: string;
  keyAccess?: string;
  ruc?: string;
  establishmentCode?: string;
  pointCode?: string;
  sequentialDocument?: string;
  mainAddress: string;
  retentionAgent?: string;
  rimpeContributor?: string;
}

export interface InvoiceInfo {
  emissionDate?: string;
  establishmentAddress: string;
  hasRequiredAccounting?: string;
  specialTaxpayer?: string;
  remissionGuideNumber?: string;
  buyerIdType: string;
  buyerIdNumber: string;
  buyerSocialReason: string;
  buyerAddress: string;
  buyerEmail?: string;
}

export interface ProductAttribute {
  attribute: string;
  value: string;
}

export interface InvoiceDetail {
  description: string;
  mainCode: string;
  auxiliaryCode?: string;
  unitValue: number;
  amount: number;
  discount: number;
  tariffCodeIva: string;
  additionalAttributes?: ProductAttribute[];
}

export interface PaymentMethod {
  type: string;
  total: number;
  timeUnit: string;
  paymentTerm: string;
}

export interface SignatureInfo {
  certificateBase64: string;
  passCertificate: string;
}

export interface InvoicePayload {
  taxAuthorityInfo: TaxAuthorityInfo;
  invoiceInfo: InvoiceInfo;
  details: InvoiceDetail[];
  paymentMethods: PaymentMethod[];
  signatureInfo?: SignatureInfo;
  additionalAttributes?: ProductAttribute[];
}

export interface RequestCrearFactura {
  origin: string;
  usrRequest: string;
  ipRequest: string;
  transactionIde: string;
  payload: InvoicePayload;
}

// Interfaces para la respuesta de factura
export interface HistoryInvoice {
  description: string;
  status: string;
  type: string;
  date: string;
  identificador: string | null;
  origin: string;
}

export interface ReceptionData {
  status: string;
  failedCommunicationWithSri: boolean;
  keyAccess: string;
  historyInvoice: HistoryInvoice[];
}

export interface AuthorizationData {
  status: string;
  failedCommunicationWithSri: boolean;
  keyAccess: string;
  authorizationNumber: string;
  environment: string;
  authorizationDate: string;
  voucher: string;
  pdfBase64: string;
  historyInvoice: HistoryInvoice[];
}

export interface InvoiceResponseData {
  reception: ReceptionData;
  authorization: AuthorizationData;
  message: string;
}

export interface ResponseCrearFactura {
  code: number;
  status: string;
  message: string;
  data: InvoiceResponseData | null;
  api: string;
}
