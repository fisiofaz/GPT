export interface Congregacao {
  id: number;
  nome: string;
  numero?: string;
  numeroCircuito?: string;
  cidade: string;
  estado: string;
  latitude?: number | null;
  longitude?: number | null;
}
