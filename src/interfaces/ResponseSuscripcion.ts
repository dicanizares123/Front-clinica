export interface DocType {
  description: string;
  code: string;
}

export interface SuscripcionData {
  environment: string;
  amountDoc: number;
  amountDocUsed: number;
  beginDate: string;
  endDate: string;
  active: boolean;
  observation: string;
  docs: DocType[];
  pathWsAllowed: string[];
  createAt: string;
}

export interface ResponseSuscripcion {
  code: number;
  status: string;
  message: string;
  data: SuscripcionData | null;
  api: string;
}
