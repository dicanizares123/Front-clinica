export interface ResponseContributor {
  code: number;
  status: string;
  message: string;
  data: {
    socialReason: string;
    ruc: string;
    signatureDoc: string;
    createAt: string;
    urlLogo: string;
  } | null;
  api: string;
}
