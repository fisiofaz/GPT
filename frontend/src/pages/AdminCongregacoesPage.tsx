import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Building2,
  Globe,
  MapPin,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { AxiosError } from "axios";

import { api } from "../services/api";

import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { ConfirmModal } from "../components/ui/ConfirmModal";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorState } from "../components/ui/ErrorState";
import { Input } from "../components/ui/Input";
import { LoadingState } from "../components/ui/LoadingState";
import { PageHeader } from "../components/ui/PageHeader";
import { SearchInput } from "../components/ui/SearchInput";

interface Congregacao {
  id: number;
  nome: string;
  numero?: string;
  numeroCircuito?: string;
  cidade: string;
  estado: string;
  latitude?: number | null;
  longitude?: number | null;
}

interface CongregacaoPayload {
  nome: string;
  numero: string;
  numeroCircuito: string;
  cidade: string;
  estado: string;
  latitude: number | null;
  longitude: number | null;
}

export default function AdminCongregacoesPage() {
  const [congregacoes, setCongregacoes] = useState<Congregacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [busca, setBusca] = useState("");

  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [modalFormularioAberto, setModalFormularioAberto] = useState(false);

  const [congregacaoParaExcluir, setCongregacaoParaExcluir] =
    useState<Congregacao | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  const [nome, setNome] = useState("");
  const [numero, setNumero] = useState("");
  const [numeroCircuito, setNumeroCircuito] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const limparFormulario = () => {
    setEditandoId(null);
    setNome("");
    setNumero("");
    setNumeroCircuito("");
    setCidade("");
    setEstado("");
    setLatitude("");
    setLongitude("");
  };

  const abrirNovoCadastro = () => {
    limparFormulario();
    setModalFormularioAberto(true);
  };

  const fecharFormulario = () => {
    if (salvando) return;

    limparFormulario();
    setModalFormularioAberto(false);
  };

  const buscarDados = async () => {
    try {
      const response = await api.get<Congregacao[]>("/congregacoes");
      setCongregacoes(response.data);
      setErro(null);
    } catch (error) {
      console.error("Erro ao carregar congregações:", error);
      setErro("Não foi possível carregar as congregações.");
      toast.error("Erro ao carregar congregações.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ativo = true;

    const carregar = async () => {
      try {
        const response = await api.get<Congregacao[]>("/congregacoes");

        if (ativo) {
          setCongregacoes(response.data);
          setErro(null);
        }
      } catch (error) {
        console.error("Erro ao carregar congregações:", error);

        if (ativo) {
          setErro("Não foi possível carregar as congregações.");
          toast.error("Erro ao carregar congregações.");
        }
      } finally {
        if (ativo) {
          setLoading(false);
        }
      }
    };

    void carregar();

    return () => {
      ativo = false;
    };
  }, []);

  const congregacoesFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    if (!termo) {
      return congregacoes;
    }

    return congregacoes.filter((congregacao) => {
      return (
        congregacao.nome.toLowerCase().includes(termo) ||
        congregacao.numero?.toLowerCase().includes(termo) ||
        congregacao.numeroCircuito?.toLowerCase().includes(termo) ||
        congregacao.cidade.toLowerCase().includes(termo) ||
        congregacao.estado.toLowerCase().includes(termo)
      );
    });
  }, [busca, congregacoes]);

  const abrirEdicao = (congregacao: Congregacao) => {
    setEditandoId(congregacao.id);
    setNome(congregacao.nome);
    setNumero(congregacao.numero ?? "");
    setNumeroCircuito(congregacao.numeroCircuito ?? "");
    setCidade(congregacao.cidade);
    setEstado(congregacao.estado);
    setLatitude(
      congregacao.latitude !== null && congregacao.latitude !== undefined
        ? String(congregacao.latitude)
        : "",
    );
    setLongitude(
      congregacao.longitude !== null && congregacao.longitude !== undefined
        ? String(congregacao.longitude)
        : "",
    );

    setModalFormularioAberto(true);
  };

  const validarFormulario = (): boolean => {
    const latitudeInformada = latitude.trim() !== "";
    const longitudeInformada = longitude.trim() !== "";

    if (latitudeInformada !== longitudeInformada) {
      toast.error(
        "Informe latitude e longitude juntas para definir a localização da congregação.",
      );
      return false;
    }

    if (latitudeInformada && longitudeInformada) {
      const latitudeNumero = Number(latitude);
      const longitudeNumero = Number(longitude);

      if (
        Number.isNaN(latitudeNumero) ||
        latitudeNumero < -90 ||
        latitudeNumero > 90
      ) {
        toast.error("A latitude deve estar entre -90 e 90.");
        return false;
      }

      if (
        Number.isNaN(longitudeNumero) ||
        longitudeNumero < -180 ||
        longitudeNumero > 180
      ) {
        toast.error("A longitude deve estar entre -180 e 180.");
        return false;
      }
    }

    return true;
  };

  const handleSalvar = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    setSalvando(true);

    try {
      const payload: CongregacaoPayload = {
        nome: nome.trim(),
        numero: numero.trim(),
        numeroCircuito: numeroCircuito.trim(),
        cidade: cidade.trim(),
        estado: estado.trim().toUpperCase(),
        latitude:
          latitude.trim() === "" ? null : Number(latitude.replace(",", ".")),
        longitude:
          longitude.trim() === "" ? null : Number(longitude.replace(",", ".")),
      };

      if (editandoId !== null) {
        await api.put(`/congregacoes/${editandoId}`, payload);
        toast.success("Congregação atualizada com sucesso.");
      } else {
        await api.post("/congregacoes", payload);
        toast.success("Congregação cadastrada com sucesso.");
      }

      fecharFormulario();
      await buscarDados();
    } catch (error: unknown) {
      console.error("Erro ao salvar congregação:", error);

      if (error instanceof AxiosError) {
        if (error.response?.status === 400) {
          toast.error("Dados inválidos. Verifique os campos preenchidos.");
        } else if (error.response?.status === 403) {
          toast.error(
            "Você não possui permissão para administrar congregações.",
          );
        } else {
          toast.error("Erro ao salvar congregação.");
        }
      } else {
        toast.error("Erro ao salvar congregação.");
      }
    } finally {
      setSalvando(false);
    }
  };

  const handleExcluir = async () => {
    if (!congregacaoParaExcluir) {
      return;
    }

    setExcluindo(true);

    try {
      await api.delete(`/congregacoes/${congregacaoParaExcluir.id}`);

      toast.success("Congregação excluída com sucesso.");

      setCongregacaoParaExcluir(null);
      await buscarDados();
    } catch (error: unknown) {
      console.error("Erro ao excluir congregação:", error);

      if (error instanceof AxiosError) {
        if (error.response?.status === 409) {
          toast.error(
            "Não é possível excluir esta congregação porque existem registros vinculados a ela.",
          );
        } else if (error.response?.status === 403) {
          toast.error("Você não possui permissão para excluir congregações.");
        } else {
          toast.error(
            "Erro ao excluir congregação. Verifique os vínculos existentes.",
          );
        }
      } else {
        toast.error("Erro ao excluir congregação.");
      }
    } finally {
      setExcluindo(false);
    }
  };

  const tituloFormulario =
    editandoId !== null ? "Editar congregação" : "Nova congregação";

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Congregações"
        subtitulo="Gerencie as congregações disponíveis no sistema."
        icon={Building2}
        actions={
          <Button type="button" onClick={abrirNovoCadastro}>
            <Plus className="h-4 w-4" />
            Nova congregação
          </Button>
        }
      />

      <Card>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Congregações cadastradas
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {congregacoes.length}{" "}
              {congregacoes.length === 1
                ? "congregação cadastrada"
                : "congregações cadastradas"}
            </p>
          </div>

          <div className="w-full lg:max-w-sm">
            <SearchInput
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              placeholder="Buscar congregação..."
            />
          </div>
        </div>
      </Card>

      {loading ? (
        <Card>
          <LoadingState />
        </Card>
      ) : erro ? (
        <Card>
          <ErrorState message={erro} />
        </Card>
      ) : congregacoesFiltradas.length === 0 ? (
        <Card>
          <EmptyState
            title={
              busca
                ? "Nenhuma congregação encontrada"
                : "Nenhuma congregação cadastrada"
            }
            description={
              busca
                ? "Tente utilizar outro termo de busca."
                : "Cadastre a primeira congregação para começar a utilizar o sistema."
            }
            action={
              !busca ? (
                <Button type="button" onClick={abrirNovoCadastro}>
                  <Plus className="h-4 w-4" />
                  Cadastrar congregação
                </Button>
              ) : undefined
            }
          />
        </Card>
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Congregação
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Número
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Circuito
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Localização
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Coordenadas
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Ações
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {congregacoesFiltradas.map((congregacao) => {
                  const possuiCoordenadas =
                    congregacao.latitude !== null &&
                    congregacao.latitude !== undefined &&
                    congregacao.longitude !== null &&
                    congregacao.longitude !== undefined;

                  return (
                    <tr
                      key={congregacao.id}
                      className="transition-colors hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                            <Building2 className="h-4 w-4" />
                          </div>

                          <div>
                            <p className="font-medium text-slate-900">
                              {congregacao.nome}
                            </p>

                            <p className="text-xs text-slate-500">
                              ID #{congregacao.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {congregacao.numero || "-"}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {congregacao.numeroCircuito || "-"}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-slate-400" />

                          <div>
                            <p className="text-sm text-slate-700">
                              {congregacao.cidade}
                            </p>

                            <p className="text-xs text-slate-500">
                              {congregacao.estado}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        {possuiCoordenadas ? (
                          <Badge variant="success">
                            <span className="flex items-center gap-1">
                              <Globe className="h-3.5 w-3.5" />
                              Configurada
                            </span>
                          </Badge>
                        ) : (
                          <Badge variant="warning">Não configurada</Badge>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            aria-label={`Editar ${congregacao.nome}`}
                            title="Editar congregação"
                            onClick={() => abrirEdicao(congregacao)}
                          >
                            <Pencil className="h-4 w-4 text-slate-600" />
                          </Button>

                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            aria-label={`Excluir ${congregacao.nome}`}
                            title="Excluir congregação"
                            onClick={() =>
                              setCongregacaoParaExcluir(congregacao)
                            }
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {modalFormularioAberto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="titulo-formulario-congregacao"
        >
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2
                  id="titulo-formulario-congregacao"
                  className="text-base font-semibold text-slate-900"
                >
                  {tituloFormulario}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Informe os dados da congregação e sua localização.
                </p>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                aria-label="Fechar formulário"
                onClick={fecharFormulario}
                disabled={salvando}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <form onSubmit={handleSalvar}>
              <div className="space-y-6 p-6">
                <section>
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-slate-900">
                      Dados da congregação
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      Informações utilizadas para identificação administrativa.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Input
                      label="Nome da congregação"
                      value={nome}
                      onChange={(event) => setNome(event.target.value)}
                      placeholder="Ex.: Congregação Tropical"
                      required
                    />

                    <Input
                      label="Número da congregação"
                      value={numero}
                      onChange={(event) => setNumero(event.target.value)}
                      placeholder="Ex.: 01"
                      required
                    />
                      

                    <Input
                      label="Número do circuito"
                      value={numeroCircuito}
                      onChange={(event) =>
                        setNumeroCircuito(event.target.value)
                      }
                      placeholder="Ex.: 123"
                      required
                    />

                    <Input
                      label="Cidade"
                      value={cidade}
                      onChange={(event) => setCidade(event.target.value)}
                      placeholder="Ex.: Santa Maria"
                      required
                    />

                    <Input
                      label="Estado (UF)"
                      value={estado}
                      onChange={(event) =>
                        setEstado(event.target.value.toUpperCase())
                      }
                      placeholder="RS"
                      maxLength={2}
                      required
                    />
                  </div>
                </section>

                <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-slate-900">
                      Localização da congregação
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      As coordenadas serão utilizadas como ponto inicial dos
                      mapas quando o território ainda não possuir um polígono.
                      Informe latitude e longitude juntas.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Input
                      label="Latitude"
                      type="number"
                      step="0.000001"
                      value={latitude}
                      onChange={(event) => setLatitude(event.target.value)}
                      placeholder="Ex.: -29.6868"
                    />

                    <Input
                      label="Longitude"
                      type="number"
                      step="0.000001"
                      value={longitude}
                      onChange={(event) => setLongitude(event.target.value)}
                      placeholder="Ex.: -53.8069"
                    />
                  </div>
                </section>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={fecharFormulario}
                  disabled={salvando}
                >
                  Cancelar
                </Button>

                <Button type="submit" disabled={salvando} loading={salvando}>
                  {editandoId !== null ? (
                    <>
                      <Pencil className="h-4 w-4" />
                      Salvar alterações
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Cadastrar
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        aberto={congregacaoParaExcluir !== null}
        titulo="Excluir congregação?"
        mensagem={
          congregacaoParaExcluir
            ? `A congregação "${congregacaoParaExcluir.nome}" será excluída. Esta ação não poderá ser desfeita.`
            : ""
        }
        confirmLabel="Excluir congregação"
        cancelLabel="Cancelar"
        variant="danger"
        loading={excluindo}
        onConfirmar={handleExcluir}
        onCancelar={() => {
          if (!excluindo) {
            setCongregacaoParaExcluir(null);
          }
        }}
      />
    </div>
  );
}
