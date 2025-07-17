"use client";
import React, { useState, useEffect, useCallback } from "react";
import { collection, query, getDocs, DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/contexts/ToastContext";
import { AdminPageLayout } from "@/components/layout/AdminPageLayout";
import { Modal } from "@/components/ui/Modal";
import { Icon } from "@/components/ui/Icon";
import { ICONS } from "@/lib/icons";

interface MobileUnit extends DocumentData {
  id: string;
  name: string;
}

interface Notebook extends DocumentData {
  id: string; // O patrimônio
  unitId: string;
}

interface GroupedData extends MobileUnit {
  notebooks: Notebook[];
}

export default function NotebooksPage() {
  const [groupedData, setGroupedData] = useState<GroupedData[]>([]);
  const [mobileUnits, setMobileUnits] = useState<MobileUnit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);

  const [selectedNotebook, setSelectedNotebook] = useState<Notebook | null>(
    null
  );
  const [selectedUnit, setSelectedUnit] = useState<MobileUnit | null>(null);

  // Formulário individual
  const [patrimonio, setPatrimonio] = useState("");
  const [unitId, setUnitId] = useState("");

  // Formulário em lote
  const [batchUnitId, setBatchUnitId] = useState("");
  const [batchPrefix, setBatchPrefix] = useState("");
  const [batchStart, setBatchStart] = useState(1);
  const [batchEnd, setBatchEnd] = useState(100);

  const { addToast } = useToast();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const unitsQuery = query(collection(db, "mobileUnits"));
      const notebooksQuery = query(collection(db, "notebooks"));

      const [unitsSnapshot, notebooksSnapshot] = await Promise.all([
        getDocs(unitsQuery),
        getDocs(notebooksQuery),
      ]);

      const unitsList = unitsSnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as MobileUnit)
      );
      const notebooksList = notebooksSnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Notebook)
      );

      const grouped = unitsList.map((unit) => {
        const unitNotebooks = notebooksList
          .filter((nb) => nb.unitId === unit.id)
          .sort((a, b) =>
            a.id.localeCompare(b.id, undefined, {
              numeric: true,
              sensitivity: "base",
            })
          );

        return {
          ...unit,
          notebooks: unitNotebooks,
        };
      });

      setMobileUnits(unitsList);
      setGroupedData(grouped);
    } catch (error) {
      console.error("Erro ao buscar dados: ", error);
      addToast("Erro ao carregar dados.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const resetForm = () => {
    setPatrimonio("");
    setUnitId("");
    setSelectedNotebook(null);
  };

  const openModal = (
    mode: "add" | "edit",
    notebook: Notebook | null = null
  ) => {
    resetForm();
    setModalMode(mode);
    if (mode === "edit" && notebook) {
      setSelectedNotebook(notebook);
      setPatrimonio(notebook.id);
      setUnitId(notebook.unitId);
    }
    setIsModalOpen(true);
  };

  const openDeleteModal = (notebook: Notebook) => {
    setSelectedNotebook(notebook);
    setIsDeleteModalOpen(true);
  };

  const openDeleteAllModal = (unit: MobileUnit) => {
    setSelectedUnit(unit);
    setIsDeleteAllModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = "/api/notebooks";
    const method = modalMode === "add" ? "POST" : "PUT";
    const body =
      modalMode === "add"
        ? { patrimonio, unitId, isBatch: false }
        : { id: selectedNotebook?.id, unitId };

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      addToast(
        `Notebook ${
          modalMode === "add" ? "adicionado" : "atualizado"
        } com sucesso!`,
        "success"
      );
      setIsModalOpen(false);
      fetchData();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : `Falha ao ${
              modalMode === "add" ? "adicionar" : "atualizar"
            } notebook.`;
      addToast(errorMessage, "error");
    }
  };

  const handleBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchUnitId || !batchPrefix) {
      addToast("Selecione uma UM e defina um prefixo.", "error");
      return;
    }
    try {
      const response = await fetch("/api/notebooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isBatch: true,
          unitId: batchUnitId,
          prefix: batchPrefix,
          start: batchStart,
          end: batchEnd,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      addToast(data.message, "success");
      setIsBatchModalOpen(false);
      fetchData();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : `Falha ao adicionar notebooks em lote.`;
      addToast(errorMessage, "error");
    }
  };

  const handleDelete = async () => {
    if (!selectedNotebook) return;
    try {
      const response = await fetch("/api/notebooks", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedNotebook.id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      addToast("Notebook excluído com sucesso!", "success");
      setIsDeleteModalOpen(false);
      fetchData();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Falha ao excluir notebook.";
      addToast(errorMessage, "error");
    }
  };

  const handleDeleteAllByUnit = async () => {
    if (!selectedUnit) return;
    try {
      const response = await fetch("/api/notebooks", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unitId: selectedUnit.id, deleteByUnit: true }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      addToast(data.message, "success");
      setIsDeleteAllModalOpen(false);
      fetchData();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Falha ao excluir notebooks.";
      addToast(errorMessage, "error");
    }
  };

  return (
    <>
      <AdminPageLayout title="Notebooks">
        <div className="flex justify-end p-4 space-x-2 border-b">
          <button
            onClick={() => setIsBatchModalOpen(true)}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg"
          >
            Adicionar em Lote
          </button>
          <button
            onClick={() => openModal("add")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
          >
            Adicionar Notebook
          </button>
        </div>
        <div className="space-y-2 p-2">
          {isLoading ? (
            <p className="p-6 text-center text-slate-500">
              Carregando notebooks...
            </p>
          ) : (
            groupedData.map((group) => (
              <div key={group.id} className="border rounded-lg overflow-hidden">
                <button
                  onClick={() =>
                    setOpenAccordion(
                      openAccordion === group.id ? null : group.id
                    )
                  }
                  className="w-full flex justify-between items-center p-4 bg-slate-50 hover:bg-slate-100"
                >
                  <div className="font-bold text-slate-800">
                    {group.name}{" "}
                    <span className="font-normal text-slate-500">
                      ({group.notebooks.length} notebooks)
                    </span>
                  </div>
                  <Icon
                    path={ICONS.chevronDown}
                    className={`w-5 h-5 transition-transform ${
                      openAccordion === group.id ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openAccordion === group.id && (
                  <div>
                    {group.notebooks.length > 0 && (
                      <div className="p-2 border-b flex justify-end">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openDeleteAllModal(group);
                          }}
                          className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded-lg text-xs flex items-center"
                        >
                          <Icon path={ICONS.trash} className="w-4 h-4 mr-1" />{" "}
                          Excluir Todos
                        </button>
                      </div>
                    )}
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left text-slate-500">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                          <tr>
                            <th scope="col" className="px-6 py-3">
                              Patrimônio (QR Code)
                            </th>
                            <th scope="col" className="px-6 py-3">
                              <span className="sr-only">Ações</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {group.notebooks.map((notebook) => (
                            <tr
                              key={notebook.id}
                              className="bg-white border-b hover:bg-slate-50"
                            >
                              <td className="px-6 py-4 font-medium text-slate-900">
                                {notebook.id}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end space-x-4">
                                  <button
                                    onClick={() => openModal("edit", notebook)}
                                    className="text-slate-500 hover:text-blue-600"
                                  >
                                    <Icon
                                      path={ICONS.edit}
                                      className="w-5 h-5"
                                    />
                                  </button>
                                  <button
                                    onClick={() => openDeleteModal(notebook)}
                                    className="text-slate-500 hover:text-red-600"
                                  >
                                    <Icon
                                      path={ICONS.trash}
                                      className="w-5 h-5"
                                    />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </AdminPageLayout>

      {/* Modal de Adicionar/Editar Individual */}
      <Modal
        title={
          modalMode === "add" ? "Adicionar Novo Notebook" : "Editar Notebook"
        }
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="notebookPatrimonio"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Patrimônio (Valor do QR Code)
              </label>
              <input
                type="text"
                id="notebookPatrimonio"
                value={patrimonio}
                onChange={(e) => setPatrimonio(e.target.value)}
                className="block w-full px-3 py-2 border border-slate-300 rounded-md"
                required
                disabled={modalMode === "edit"}
              />
            </div>
            <div>
              <label
                htmlFor="notebookUnit"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Unidade Móvel (UM)
              </label>
              <select
                id="notebookUnit"
                value={unitId}
                onChange={(e) => setUnitId(e.target.value)}
                className="block w-full px-3 py-2 border border-slate-300 rounded-md"
                required
              >
                <option value="" disabled>
                  Selecione uma UM
                </option>
                {mobileUnits.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2 px-4 rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
              >
                Salvar
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Modal de Adicionar em Lote */}
      <Modal
        title="Adicionar Notebooks em Lote"
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
      >
        <form onSubmit={handleBatchSubmit}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="batchUnit"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Unidade Móvel (UM)
              </label>
              <select
                id="batchUnit"
                value={batchUnitId}
                onChange={(e) => setBatchUnitId(e.target.value)}
                className="block w-full px-3 py-2 border border-slate-300 rounded-md"
                required
              >
                <option value="" disabled>
                  Selecione uma UM
                </option>
                {mobileUnits.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="batchPrefix"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Prefixo do Patrimônio
              </label>
              <input
                type="text"
                id="batchPrefix"
                value={batchPrefix}
                onChange={(e) => setBatchPrefix(e.target.value)}
                className="block w-full px-3 py-2 border border-slate-300 rounded-md"
                placeholder="Ex: BSBIA01-EST"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="batchStart"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Nº Inicial
                </label>
                <input
                  type="number"
                  id="batchStart"
                  value={batchStart}
                  onChange={(e) => setBatchStart(Number(e.target.value))}
                  className="block w-full px-3 py-2 border border-slate-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="batchEnd"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Nº Final
                </label>
                <input
                  type="number"
                  id="batchEnd"
                  value={batchEnd}
                  onChange={(e) => setBatchEnd(Number(e.target.value))}
                  className="block w-full px-3 py-2 border border-slate-300 rounded-md"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setIsBatchModalOpen(false)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2 px-4 rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg"
              >
                Gerar em Lote
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Modal de Excluir */}
      <Modal
        title="Confirmar Exclusão"
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      >
        <div>
          <p className="text-slate-600">
            Você tem certeza que deseja excluir o notebook de patrimônio{" "}
            <span className="font-bold">{selectedNotebook?.id}</span>?
          </p>
          <p className="text-sm text-red-600 mt-2">
            Esta ação não pode ser desfeita.
          </p>
          <div className="flex justify-end space-x-3 pt-6">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2 px-4 rounded-lg"
            >
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg"
            >
              Sim, Excluir
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal de Excluir Todos da UM */}
      <Modal
        title="Confirmar Exclusão em Lote"
        isOpen={isDeleteAllModalOpen}
        onClose={() => setIsDeleteAllModalOpen(false)}
      >
        <div>
          <p className="text-slate-600">
            Você tem certeza que deseja excluir **TODOS** os notebooks da UM{" "}
            <span className="font-bold">{selectedUnit?.name}</span>?
          </p>
          <p className="text-sm font-bold text-red-600 mt-2">
            Esta ação não pode ser desfeita.
          </p>
          <div className="flex justify-end space-x-3 pt-6">
            <button
              type="button"
              onClick={() => setIsDeleteAllModalOpen(false)}
              className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2 px-4 rounded-lg"
            >
              Cancelar
            </button>
            <button
              onClick={handleDeleteAllByUnit}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg"
            >
              Sim, Excluir Todos
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
