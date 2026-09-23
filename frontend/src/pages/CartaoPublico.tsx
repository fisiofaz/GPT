import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import L from "leaflet";
import {
  AlertCircle,
  ExternalLink,
  Info,
  Loader2,
  Navigation,
  X,
} from "lucide-react";

import { Button } from "../components/ui/Button";
import { territorioService } from "../services/territorioService";
import type { Territorio } from "../types/territorio";

type GeoJsonPolygon = {
  type: "Polygon";
  coordinates: [number, number][][];
};

export function CartaoPublico() {
  const { id } = useParams<{ id: string }>();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.CircleMarker | null>(null);
  const invalidateTimeoutRef = useRef<number | null>(null);

  const [territorio, setTerritorio] = useState<Territorio | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [localizando, setLocalizando] = useState(false);
  const [erroLocalizacao, setErroLocalizacao] = useState<string | null>(null);

  useEffect(() => {
    const carregar = async () => {
      if (!id) {
        setErro("Identificador do território não informado.");
        setCarregando(false);
        return;
      }

      const territorioId = Number(id);

      if (!Number.isInteger(territorioId) || territorioId <= 0) {
        setErro("Identificador do território inválido.");
        setCarregando(false);
        return;
      }

      try {
        setCarregando(true);
        setErro(null);

        const dados = await territorioService.buscarPublico(territorioId);

        setTerritorio(dados);
      } catch {
        setErro("Não foi possível carregar o mapa do território.");
      } finally {
        setCarregando(false);
      }
    };

    carregar();
  }, [id]);

  useEffect(() => {
    if (!territorio || !mapContainerRef.current) {
      return;
    }

    let coordenadas: [number, number][] = [];

    if (territorio.poligonoGeoJson) {
      try {
        const parsed = JSON.parse(territorio.poligonoGeoJson) as GeoJsonPolygon;

        if (
          parsed.type === "Polygon" &&
          Array.isArray(parsed.coordinates) &&
          parsed.coordinates.length > 0 &&
          Array.isArray(parsed.coordinates[0]) &&
          parsed.coordinates[0].length >= 4
        ) {
          coordenadas = parsed.coordinates[0].map(
            ([longitude, latitude]) =>
              [latitude, longitude] as [number, number],
          );
        }
      } catch (error) {
        console.error("Erro ao ler polígono GeoJSON:", error);
      }
    }

    const center: [number, number] =
      coordenadas.length > 0 ? coordenadas[0] : [-29.6842, -53.8069];

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
    }).setView(center, 16);

    mapInstanceRef.current = map;

    L.control.zoom({ position: "topright" }).addTo(map);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    invalidateTimeoutRef.current = window.setTimeout(() => {
      map.invalidateSize();
    }, 200);

    if (coordenadas.length >= 3) {
      const polygon = L.polygon(coordenadas, {
        color: "#2563eb",
        weight: 4,
        fill: false,
      }).addTo(map);

      map.fitBounds(polygon.getBounds(), {
        padding: [30, 30],
      });
    }

    return () => {
      if (invalidateTimeoutRef.current !== null) {
        window.clearTimeout(invalidateTimeoutRef.current);
        invalidateTimeoutRef.current = null;
      }

      userMarkerRef.current = null;
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [territorio]);

  const handleMinhaLocalizacao = () => {
    const map = mapInstanceRef.current;

    setErroLocalizacao(null);

    if (!map || !navigator.geolocation) {
      setErroLocalizacao(
        "A geolocalização não é suportada pelo seu navegador.",
      );
      return;
    }

    setLocalizando(true);

    navigator.geolocation.getCurrentPosition(
      (posicao) => {
        setLocalizando(false);

        const userLat = posicao.coords.latitude;
        const userLng = posicao.coords.longitude;

        if (userMarkerRef.current) {
          userMarkerRef.current.setLatLng([userLat, userLng]);
        } else {
          userMarkerRef.current = L.circleMarker([userLat, userLng], {
            radius: 8,
            color: "#ffffff",
            fillColor: "#0284c7",
            fillOpacity: 1,
            weight: 3,
          })
            .bindPopup("Você está aqui")
            .addTo(map);
        }

        map.flyTo([userLat, userLng], 17, {
          duration: 1.2,
        });

        userMarkerRef.current.openPopup();
      },
      () => {
        setLocalizando(false);
        setErroLocalizacao(
          "Não foi possível obter sua localização GPS. Verifique as permissões do navegador.",
        );
      },
      {
        enableHighAccuracy: true,
      },
    );
  };

  const handleAbrirGoogleMaps = () => {
    if (!territorio?.poligonoGeoJson) {
      return;
    }

    try {
      const parsed = JSON.parse(territorio.poligonoGeoJson) as GeoJsonPolygon;

      if (
        parsed.type === "Polygon" &&
        Array.isArray(parsed.coordinates) &&
        parsed.coordinates.length > 0 &&
        Array.isArray(parsed.coordinates[0]) &&
        parsed.coordinates[0].length >= 4
      ) {
        const [longitude, latitude] = parsed.coordinates[0][0];

        const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

        window.open(url, "_blank", "noopener,noreferrer");
      }
    } catch (error) {
      console.error("Erro ao abrir território no Google Maps:", error);
    }
  };

  if (carregando) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 px-6 text-center text-slate-500">
        <Loader2
          size={30}
          className="animate-spin text-slate-600"
          aria-hidden="true"
        />
        <p className="text-sm">Carregando mapa do território...</p>
      </div>
    );
  }

  if (erro || !territorio) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600">
          <AlertCircle size={24} aria-hidden="true" />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Cartão não encontrado
          </h2>

          <p className="mt-1 max-w-md text-sm text-slate-500">
            {erro ?? "Não foi possível localizar o território solicitado."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-slate-100 text-slate-900">
      <header className="z-10 flex shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 py-3 shadow-sm sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-semibold text-slate-700">
            {territorio.numero}
          </div>

          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold text-slate-900 sm:text-base">
              {territorio.nome}
            </h1>

            <p className="truncate text-xs text-slate-500">
              {territorio.congregacaoNome}
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleAbrirGoogleMaps}
          title="Abrir no Google Maps"
          aria-label="Abrir território no Google Maps"
        >
          <ExternalLink size={16} aria-hidden="true" />
          <span className="hidden sm:inline">Google Maps</span>
          <span className="sm:hidden">GPS</span>
        </Button>
      </header>

      <div className="relative z-0 min-h-0 flex-1">
        <div
          ref={mapContainerRef}
          className="h-full w-full"
          aria-label={`Mapa do território ${territorio.numero} - ${territorio.nome}`}
        />

        <div className="absolute bottom-4 right-4 z-1000 flex max-w-[calc(100%-2rem)] flex-col items-end gap-2">
          {erroLocalizacao && (
            <div
              className="flex max-w-sm items-start gap-2 rounded-lg border border-rose-200 bg-white px-3 py-2 text-xs text-rose-700 shadow-lg"
              role="alert"
            >
              <AlertCircle
                size={16}
                className="mt-0.5 shrink-0"
                aria-hidden="true"
              />

              <span className="min-w-0 flex-1">{erroLocalizacao}</span>

              <button
                type="button"
                onClick={() => setErroLocalizacao(null)}
                className="shrink-0 rounded p-0.5 text-rose-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                aria-label="Fechar aviso de localização"
              >
                <X size={14} aria-hidden="true" />
              </button>
            </div>
          )}

          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={handleMinhaLocalizacao}
            disabled={localizando}
            className="shadow-lg"
          >
            {localizando ? (
              <Loader2 size={17} className="animate-spin" aria-hidden="true" />
            ) : (
              <Navigation size={17} aria-hidden="true" />
            )}

            <span>{localizando ? "Localizando..." : "Onde estou?"}</span>
          </Button>
        </div>
      </div>

      {territorio.descricao && (
        <footer className="z-10 flex shrink-0 items-start gap-2 border-t border-slate-200 bg-white px-4 py-3 text-xs text-slate-600 sm:px-5">
          <Info
            size={16}
            className="mt-0.5 shrink-0 text-slate-500"
            aria-hidden="true"
          />

          <p className="leading-relaxed">{territorio.descricao}</p>
        </footer>
      )}
    </div>
  );
}
