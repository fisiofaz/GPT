import { z } from "zod";

export const publicacaoSchema = z.object({
  codigo: z
    .string({ message: "O código é obrigatório" })
    .min(1, "O código é obrigatório")
    .max(20, "Máximo de 20 caracteres")
    .trim(),
  titulo: z
    .string({ message: "O título é obrigatório" })
    .min(2, "O título deve ter pelo menos 2 caracteres")
    .max(150, "Máximo de 150 caracteres")
    .trim(),
  categoria: z.enum([
    "BIBLIA",
    "LIVRO",
    "BROCHURA",
    "REVISTA",
    "FOLHETO",
    "TRATADO",
    "CARTAO",
    "CONVITE",
    "OUTRO",
  ]),
  formato: z.enum([
    "NORMAL",
    "PEQUENO",
    "GRANDE",
    "BOLSO",
    "BRAILLE",
    "DIGITAL_MIDIA",
  ]),
  idioma: z.enum([
    "PORTUGUES",
    "ESPANHOL",
    "INGLES",
    "LIBRAS",
    "LINGUA_INDIGENA",
    "ALEMAO",
    "CRIOLO_HAITIANO",
    "JAPONES",
    "OUTRO",
  ]),
  quantidadeEstoque: z
    .number({ message: "Informe um número válido" })
    .int("Deve ser um número inteiro")
    .min(0, "Quantidade não pode ser negativa"),
  estoqueMinimo: z
    .number({ message: "Informe um número válido" })
    .int("Deve ser um número inteiro")
    .min(0, "Estoque mínimo não pode ser negativo"),
});

export const movimentacaoSchema = z.object({
  tipo: z.enum(["SAIDA", "ENTRADA", "AJUSTE"]),
  quantidade: z
    .number({ message: "Informe uma quantidade válida" })
    .int("Deve ser um número inteiro")
    .min(1, "A quantidade mínima para movimentar é 1"),
  publicadorId: z.string().optional(),
  observacoes: z.string().max(255, "Máximo de 255 caracteres").optional(),
});

export type PublicacaoFormData = z.infer<typeof publicacaoSchema>;
export type MovimentacaoFormData = z.infer<typeof movimentacaoSchema>;
