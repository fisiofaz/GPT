import { useState } from "react";
import { api } from "../services/api";
import { useAuth } from "../context/useAuth";

type Resultado = {
  endpoint: string;
  status: number | string;
  resultado: string;
  detalhe?: string;
};

type Dados = Record<string, unknown>;

function encontrarId(dados: unknown): number | null {
  if (Array.isArray(dados)) {
    for (const item of dados) {
      const id = encontrarId(item);
      if (id !== null) return id;
    }
    return null;
  }

  if (dados && typeof dados === "object") {
    const obj = dados as Dados;

    if (typeof obj.id === "number" || typeof obj.id === "string") {
      const id = Number(obj.id);
      if (Number.isFinite(id) && id > 0) return id;
    }

    for (const valor of Object.values(obj)) {
      const id = encontrarId(valor);
      if (id !== null) return id;
    }
  }

  return null;
}

function obterStatus(erro: unknown): number | string {
  if (erro && typeof erro === "object" && "response" in erro) {
    const resposta = (erro as { response?: { status?: number } }).response;

    if (resposta?.status) return resposta.status;
  }

  return "ERRO";
}

export function DiagnosticoApi() {
  const { usuario } = useAuth();
  const [resultados, setResultados] = useState<Resultado[]>([]);
  const [executando, setExecutando] = useState(false);

  async function executarTestes() {
    setExecutando(true);
    setResultados([]);

    const resultadosNovos: Resultado[] = [];
    const congregacaoId = usuario?.congregacaoId;

    const cache: Record<string, unknown> = {};

    async function testar(
      endpoint: string,
      caminho: string | null,
    ): Promise<unknown> {
      if (!caminho) {
        resultadosNovos.push({
          endpoint,
          status: "PULADO",
          resultado: "ID indisponível",
          detalhe: "Não foi possível determinar um ID válido.",
        });
        setResultados([...resultadosNovos]);
        return null;
      }

      try {
        const resposta = await api.get(caminho);
        cache[caminho] = resposta.data;

        resultadosNovos.push({
          endpoint,
          status: resposta.status,
          resultado:
            resposta.status >= 200 && resposta.status < 300
              ? "SUCESSO"
              : "VERIFICAR",
        });

        setResultados([...resultadosNovos]);
        return resposta.data;
      } catch (erro: unknown) {
        resultadosNovos.push({
          endpoint,
          status: obterStatus(erro),
          resultado: "FALHA",
          detalhe:
            obterStatus(erro) === "ERRO"
              ? "Falha de rede ou conexão com a API."
              : "Verifique autenticação, permissões e logs do backend.",
        });

        setResultados([...resultadosNovos]);
        return null;
      }
    }

    try {
      const usuarios = await testar("GET /usuarios", "/usuarios");
      const congregacoes = await testar("GET /congregacoes", "/congregacoes");

      const catalogo = await testar(
        "GET /publicacoes/catalogo-mestre",
        "/publicacoes/catalogo-mestre",
      );

      const congregacaoPath = congregacaoId
        ? `/territorios/congregacao/${congregacaoId}`
        : null;

      const territorios = await testar(
        "GET /territorios/congregacao/{congregacaoId}",
        congregacaoPath,
      );

      const publicadores = await testar(
        "GET /publicadores/congregacao/{congregacaoId}",
        congregacaoId ? `/publicadores/congregacao/${congregacaoId}` : null,
      );

      const publicacoes = await testar(
        "GET /publicacoes/congregacao/{congregacaoId}",
        congregacaoId ? `/publicacoes/congregacao/${congregacaoId}` : null,
      );

      const pedidosBetel = await testar(
        "GET /pedidos/betel/congregacao/{congregacaoId}",
        congregacaoId ? `/pedidos/betel/congregacao/${congregacaoId}` : null,
      );

      const idUsuario = encontrarId(usuarios);
      const idTerritorio = encontrarId(territorios);
      const idPublicador = encontrarId(publicadores);
      const idPublicacao = encontrarId(publicacoes);
      const idPedidoBetel = encontrarId(pedidosBetel);

      const testes = [
        {
          endpoint: "GET /usuarios/{id}",
          caminho: idUsuario ? `/usuarios/${idUsuario}` : null,
        },
        {
          endpoint: "GET /usuarios/congregacao/{congregacaoId}",
          caminho: congregacaoId
            ? `/usuarios/congregacao/${congregacaoId}`
            : null,
        },
        {
          endpoint: "GET /territorios/{id}/historico",
          caminho: idTerritorio
            ? `/territorios/${idTerritorio}/historico`
            : null,
        },
        {
          endpoint: "GET /territorios/publico/{id}",
          caminho: idTerritorio ? `/territorios/publico/${idTerritorio}` : null,
        },
        {
          endpoint: "GET /territorios/congregacao/{congregacaoId}/historico",
          caminho: congregacaoId
            ? `/territorios/congregacao/${congregacaoId}/historico`
            : null,
        },
        {
          endpoint: "GET /territorios/congregacao/{congregacaoId}/estatisticas",
          caminho: congregacaoId
            ? `/territorios/congregacao/${congregacaoId}/estatisticas?inicio=2026-01-01&fim=2026-12-31`
            : null,
        },
        {
          endpoint: "GET /publicadores/{id}/historico",
          caminho: idPublicador
            ? `/publicadores/${idPublicador}/historico`
            : null,
        },
        {
          endpoint: "GET /publicadores/historico/congregacao/{congregacaoId}",
          caminho: congregacaoId
            ? `/publicadores/historico/congregacao/${congregacaoId}`
            : null,
        },
        {
          endpoint:
            "GET /publicadores/congregacao/{congregacaoId}/disponiveis-para-usuario",
          caminho: congregacaoId
            ? `/publicadores/congregacao/${congregacaoId}/disponiveis-para-usuario`
            : null,
        },
        {
          endpoint: "GET /publicacoes/congregacao/{congregacaoId}/estatisticas",
          caminho: congregacaoId
            ? `/publicacoes/congregacao/${congregacaoId}/estatisticas?inicio=2026-01-01&fim=2026-12-31`
            : null,
        },
        {
          endpoint: "GET /pedidos/betel/{id}",
          caminho: idPedidoBetel ? `/pedidos/betel/${idPedidoBetel}` : null,
        },
        {
          endpoint: "GET /pedidos/publicador/congregacao/{congregacaoId}",
          caminho: congregacaoId
            ? `/pedidos/publicador/congregacao/${congregacaoId}`
            : null,
        },
        {
          endpoint: "GET /congregacoes/{id}",
          caminho: encontrarId(congregacoes)
            ? `/congregacoes/${encontrarId(congregacoes)}`
            : null,
        },
        {
          endpoint: "GET /movimentacoes/publicacao/{publicacaoId}",
          caminho: idPublicacao
            ? `/movimentacoes/publicacao/${idPublicacao}`
            : null,
        },
        {
          endpoint: "GET /movimentacoes/congregacao/{congregacaoId}",
          caminho: congregacaoId
            ? `/movimentacoes/congregacao/${congregacaoId}`
            : null,
        },
        {
          endpoint: "GET /dashboard/estatisticas/{congregacaoId}",
          caminho: congregacaoId
            ? `/dashboard/estatisticas/${congregacaoId}`
            : null,
        },
      ];

      for (const teste of testes) {
        await testar(teste.endpoint, teste.caminho);
      }

      // Referência ao catálogo obtido na primeira etapa.
      void catalogo;
    } finally {
      setExecutando(false);
    }
  }

  const sucesso = resultados.filter((r) => r.resultado === "SUCESSO").length;

  return (
    <main style={{ padding: 24 }}>
      <h1>Diagnóstico da API</h1>

      <p>Usuário: {usuario?.nome ?? "Não identificado"}</p>
      <p>Congregação: {usuario?.congregacaoId ?? "Não informada"}</p>

      <button type="button" onClick={executarTestes} disabled={executando}>
        {executando ? "Executando testes..." : "Executar todos os testes"}
      </button>

      {resultados.length > 0 && (
        <>
          <p>
            {sucesso} de {resultados.length} consultas concluídas com HTTP 2xx.
          </p>

          <button
            type="button"
            onClick={() =>
              navigator.clipboard.writeText(
                resultados
                  .map(
                    (r) =>
                      `${r.endpoint} | HTTP ${r.status} | ${r.resultado}${r.detalhe ? ` | ${r.detalhe}` : ""}`,
                  )
                  .join("\n"),
              )
            }
          >
            Copiar relatório
          </button>

          <div style={{ overflowX: "auto", marginTop: 16 }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left",
              }}
            >
              <thead>
                <tr>
                  <th>Endpoint</th>
                  <th>HTTP</th>
                  <th>Resultado</th>
                  <th>Detalhes</th>
                </tr>
              </thead>
              <tbody>
                {resultados.map((r, i) => (
                  <tr key={`${r.endpoint}-${i}`}>
                    <td style={{ padding: 8 }}>{r.endpoint}</td>
                    <td style={{ padding: 8 }}>{r.status}</td>
                    <td style={{ padding: 8 }}>{r.resultado}</td>
                    <td style={{ padding: 8 }}>{r.detalhe ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </main>
  );
}

export default DiagnosticoApi;
