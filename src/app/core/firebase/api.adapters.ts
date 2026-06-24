import { UserFromApi } from '../models/responses-from-api.model';

export function mapRunQuery(res: any[]): UserFromApi[] {
  return res.filter((r) => r.document).map((r) => r.document);
}

export function mapDocuments(res: any): UserFromApi[] {
  return res.documents;
}
