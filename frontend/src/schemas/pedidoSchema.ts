import { z } from "zod";

export const pedidoPublicadorSchema = z.object({
  publicadorId: z
    .string({ message: "Selecione o publicador" })
    .min(1, "Selecione o publicador"),
  publicacaoId: z
    .string({ message: "Selecione a publicação" })
    .min(1, "Selecione a publicação"),
  quantidade: z
    .number({ message: "Informe uma quantidade válida" })
    .int("Deve ser um número inteiro")
    .min(1, "A quantidade mínima é 1"),
  observacoes: z.string().max(255, "Máximo de 255 caracteres").optional(),
});

export const pedidoBetelCriarSchema = z.object({
  numeroPedido: z.string().max(50, "Máximo de 50 caracteres").optional(),
  mesAnoReferencia: z
    .string({ message: "Informe o mês de referência (YYYY-MM)" })
    .regex(/^\d{4}-\d{2}$/, "Formato inválido. Use AAAA-MM (Ex: 2026-09)"),
  observacoes: z.string().max(500, "Máximo de 500 caracteres").optional(),
});

export type PedidoPublicadorFormData = z.infer<typeof pedidoPublicadorSchema>;
export type PedidoBetelCriarFormData = z.infer<typeof pedidoBetelCriarSchema>;
