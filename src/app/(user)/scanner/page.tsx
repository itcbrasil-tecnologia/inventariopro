/**
 * =================================================================
 * ARQUIVO: src/app/(user)/scanner/page.tsx
 * =================================================================
 */
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";
import * as Tone from "tone";

interface MobileUnit {
  id: string;
  name: string;
}

interface Notebook {
  id: string; // O patrimônio
  unitId: string;
}

export default function TechnicianScannerPage() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [mobileUnits, setMobileUnits] = useState<MobileUnit[]>([]);
  const [allNotebooks, setAllNotebooks] = useState<Notebook[] | null>(null);
  const [masterNotebookList, setMasterNotebookList] = useState<Notebook[]>([]);

  const [selectedUnitId, setSelectedUnitId] = useState<string>("");
  const [scannedItems, setScannedItems] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerStateRef = useRef<Html5QrcodeScannerState | null>(null);
  const synthRef = useRef<Tone.Synth | null>(null);

  // CORREÇÃO: Inicializando o useRef com null.
  const handleScanCallbackRef = useRef<((text: string) => void) | null>(null);

  // Inicializa o sintetizador de áudio uma única vez
  useEffect(() => {
    // Cria a instância do synth e a conecta ao destino (saída de áudio)
    const synth = new Tone.Synth();
    synth.toDestination();
    synthRef.current = synth;
  }, []);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/scanner-data");
      if (!response.ok) throw new Error("Falha ao buscar dados");
      const data = await response.json();
      setMobileUnits(data.mobileUnits || []);
      setAllNotebooks(data.notebooks || []);
    } catch (error: unknown) {
      console.error("Erro ao carregar dados:", error);
      addToast("Erro ao carregar dados iniciais.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSuccessfulScan = useCallback(
    (decodedText: string) => {
      if (!masterNotebookList || masterNotebookList.length === 0) return;

      if (masterNotebookList.some((nb) => nb.id === decodedText)) {
        setScannedItems((prevScannedItems) => {
          if (prevScannedItems.includes(decodedText)) {
            addToast(`Item ${decodedText} já foi escaneado.`, "error");
            synthRef.current?.triggerAttackRelease("C4", "8n");
            return prevScannedItems;
          } else {
            addToast(`Item ${decodedText} registrado!`, "success");
            synthRef.current?.triggerAttackRelease("C5", "8n");
            return [...prevScannedItems, decodedText];
          }
        });
      } else {
        addToast(`Item ${decodedText} não pertence a esta UM.`, "error");
        synthRef.current?.triggerAttackRelease("A3", "8n");
      }
    },
    [masterNotebookList, addToast]
  );

  useEffect(() => {
    handleScanCallbackRef.current = handleSuccessfulScan;
  }, [handleSuccessfulScan]);

  const stopScanner = useCallback(() => {
    if (
      html5QrCodeRef.current &&
      scannerStateRef.current === Html5QrcodeScannerState.SCANNING
    ) {
      html5QrCodeRef.current
        .stop()
        .then(() => {
          scannerStateRef.current = Html5QrcodeScannerState.NOT_STARTED;
        })
        .catch((err) => {
          console.error("Falha ao parar o scanner.", err);
        });
    }
  }, []);

  const startScanner = useCallback(() => {
    if (!html5QrCodeRef.current) {
      html5QrCodeRef.current = new Html5Qrcode("reader", { verbose: false });
    }
    const html5QrCode = html5QrCodeRef.current;

    if (scannerStateRef.current === Html5QrcodeScannerState.SCANNING) {
      return;
    }

    html5QrCode
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          if (handleScanCallbackRef.current) {
            handleScanCallbackRef.current(decodedText);
          }
        },
        () => {}
      )
      .then(() => {
        scannerStateRef.current = Html5QrcodeScannerState.SCANNING;
      })
      .catch((err) => {
        console.error("Erro ao iniciar a câmera:", err);
        addToast(
          "Erro ao iniciar a câmera. Verifique as permissões ou use uma conexão segura (https).",
          "error"
        );
      });
  }, [addToast]);

  useEffect(() => {
    if (selectedUnitId && allNotebooks) {
      const notebooksForUnit = allNotebooks.filter(
        (nb) => nb.unitId === selectedUnitId
      );
      setMasterNotebookList(notebooksForUnit);
      setScannedItems([]);
      startScanner();
    } else {
      stopScanner();
    }

    return () => {
      stopScanner();
    };
  }, [selectedUnitId, allNotebooks, startScanner, stopScanner]);

  const handleReset = () => {
    setScannedItems([]);
    addToast("Contagem reiniciada.", "success");
  };

  const missingItems = masterNotebookList.filter(
    (nb) => !scannedItems.includes(nb.id)
  );

  return (
    <div className="min-h-screen bg-slate-100 p-4 font-sans">
      <div className="max-w-lg mx-auto">
        <header className="text-center mb-4">
          <h1 className="text-2xl font-bold text-slate-900">
            Leitura de QR Code
          </h1>
          <p className="text-slate-600">Olá, {user?.name || user?.email}!</p>
        </header>

        <div className="bg-white p-4 rounded-lg shadow-md mb-4">
          <label
            htmlFor="um-selector"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Selecione a Unidade Móvel (UM)
          </label>
          <select
            id="um-selector"
            value={selectedUnitId}
            onChange={(e) => setSelectedUnitId(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            disabled={isLoading}
          >
            <option value="">
              -- {isLoading ? "Carregando..." : "Selecione uma UM"} --
            </option>
            {mobileUnits.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.name}
              </option>
            ))}
          </select>
        </div>

        {selectedUnitId && (
          <>
            <div
              id="reader"
              className="w-full aspect-square max-w-sm mx-auto border-2 border-dashed rounded-lg overflow-hidden mb-4"
            ></div>

            <div className="grid grid-cols-2 gap-4 mb-4 text-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <p className="text-sm text-green-800 font-bold">ESCANEARAM</p>
                <p className="text-4xl font-bold text-green-600">
                  {scannedItems.length}
                </p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <p className="text-sm text-red-800 font-bold">FALTANDO</p>
                <p className="text-4xl font-bold text-red-600">
                  {missingItems.length}
                </p>
              </div>
            </div>

            <div className="flex justify-center space-x-4 mb-4">
              <button
                onClick={handleReset}
                className="bg-orange-500 text-white font-bold py-3 px-6 rounded-lg"
              >
                Reiniciar
              </button>
              <button className="bg-red-600 text-white font-bold py-3 px-6 rounded-lg">
                Finalizar Contagem
              </button>
            </div>

            {/* LISTAS */}
            <div>
              <div className="mb-4">
                <h3 className="font-bold text-red-700 mb-2">
                  Faltando ({missingItems.length})
                </h3>
                <div className="h-40 overflow-y-auto bg-white p-2 rounded-md border">
                  {masterNotebookList
                    .filter((nb) => !scannedItems.includes(nb.id))
                    .map((item) => (
                      <div
                        key={item.id}
                        className="p-2 my-1 rounded-md text-sm bg-red-50 text-red-800"
                      >
                        {item.id}
                      </div>
                    ))}
                </div>
              </div>
              <div>
                <h3 className="font-bold text-green-700 mb-2">
                  Escaneados ({scannedItems.length})
                </h3>
                <div className="h-40 overflow-y-auto bg-white p-2 rounded-md border">
                  {scannedItems.map((item) => (
                    <div
                      key={item}
                      className="p-2 my-1 rounded-md text-sm bg-green-50 text-green-800"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
