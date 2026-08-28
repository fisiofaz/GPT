import React from "react";
import type { CategoriaPublicacao } from "../../types/publicacao";

interface BadgeCategoriaProps {
  categoria: CategoriaPublicacao;
}

const STYLES: Record<CategoriaPublicacao, string> = {
  BIBLIA: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  LIVRO: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  BROCHURA: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  REVISTA: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  FOLHETO: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  TRATADO: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  CARTAO: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  CONVITE: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  OUTRO: "bg-slate-800 text-slate-300 border-slate-700",
};

export const BadgeCategoria: React.FC<BadgeCategoriaProps> = ({
  categoria,
}) => {
  return (
    <span
      className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase border ${
        STYLES[categoria] || STYLES.OUTRO
      }`}
    >
      {categoria}
    </span>
  );
};
