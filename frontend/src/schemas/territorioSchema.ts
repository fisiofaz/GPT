import { z } from "zod";

export const territorioSchema = z.object({
  numero: z
    .string({ message: "O número do território é obrigatório" })
    .min(1, "O número é obrigatório")
    .max(20, "Máximo de 20 caracteres")
    .trim(),
  nome: z
    .string({ message: "O nome da região é obrigatório" })
    .min(2, "O nome deve ter pelo menos 2 caracteres")
    .max(100, "Máximo de 100 caracteres")
    .trim(),
  descricao: z.string().max(255, "Máximo de 255 caracteres").optional(),
  poligonoGeoJson: z.string().optional(),
});

export const designacaoSchema = z.object({
  publicadorId: z
    .string({ message: "Selecione um publicador" })
    .min(1, "Selecione um publicador"),
  observacoes: z.string().max(255, "Máximo de 255 caracteres").optional(),
});

export const devolucaoSchema = z.object({
  observacoes: z.string().max(255, "Máximo de 255 caracteres").optional(),
});

export type TerritorioFormData = z.infer<typeof territorioSchema>;
export type DesignacaoFormData = z.infer<typeof designacaoSchema>;
export type DevolucaoFormData = z.infer<typeof devolucaoSchema>;
