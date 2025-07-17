"use client";
import React, { useState, useEffect, useCallback } from "react";
import { collection, query, getDocs, DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/contexts/ToastContext";
import { AdminPageLayout } from "@/components/layout/AdminPageLayout";
import { Modal } from "@/components/ui/Modal";
import { Icon } from "@/components/ui/Icon";
import { ICONS } from "@/lib/icons";

interface Project extends DocumentData {
  id: string;
  name: string;
}

interface MobileUnit extends DocumentData {
  id: string;
  name: string;
  projectId: string;
  expectedDeviceCount: number;
}

export default function UMsPage() {
  const [mobileUnits, setMobileUnits] = useState<MobileUnit[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [selectedUM, setSelectedUM] = useState<MobileUnit | null>(null);

  const [name, setName] = useState("");
  const [projectId, setProjectId] = useState("");
  const [expectedDeviceCount, setExpectedDeviceCount] = useState(0);

  const { addToast } = useToast();

  const fetchProjectsAndUMs = useCallback(async () => {
    setIsLoading(true);
    try {
      const projectsQuery = query(collection(db, "projects"));
      const umsQuery = query(collection(db, "mobileUnits"));

      const [projectsSnapshot, umsSnapshot] = await Promise.all([
        getDocs(projectsQuery),
        getDocs(umsQuery),
      ]);

      const projectsList = projectsSnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Project)
      );
      const umsList = umsSnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as MobileUnit)
      );

      setProjects(projectsList);
      setMobileUnits(umsList);
    } catch (error) {
      console.error("Erro ao buscar dados: ", error);
      addToast("Erro ao carregar dados.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchProjectsAndUMs();
  }, [fetchProjectsAndUMs]);

  const resetForm = () => {
    setName("");
    setProjectId("");
    setExpectedDeviceCount(0);
    setSelectedUM(null);
  };

  const openModal = (mode: "add" | "edit", um: MobileUnit | null = null) => {
    resetForm();
    setModalMode(mode);
    if (mode === "edit" && um) {
      setSelectedUM(um);
      setName(um.name);
      setProjectId(um.projectId);
      setExpectedDeviceCount(um.expectedDeviceCount);
    }
    setIsModalOpen(true);
  };

  const openDeleteModal = (um: MobileUnit) => {
    setSelectedUM(um);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = "/api/ums";
    const method = modalMode === "add" ? "POST" : "PUT";
    const body =
      modalMode === "add"
        ? { name, projectId, expectedDeviceCount }
        : { id: selectedUM?.id, name, projectId, expectedDeviceCount };

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      addToast(
        `UM ${modalMode === "add" ? "adicionada" : "atualizada"} com sucesso!`,
        "success"
      );
      setIsModalOpen(false);
      fetchProjectsAndUMs();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : `Falha ao ${modalMode === "add" ? "adicionar" : "atualizar"} UM.`;
      addToast(errorMessage, "error");
    }
  };

  const handleDelete = async () => {
    if (!selectedUM) return;
    try {
      const response = await fetch("/api/ums", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedUM.id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      addToast("UM excluída com sucesso!", "success");
      setIsDeleteModalOpen(false);
      fetchProjectsAndUMs();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Falha ao excluir UM.";
      addToast(errorMessage, "error");
    }
  };

  const getProjectName = (pId: string) => {
    return projects.find((p) => p.id === pId)?.name || "Desconhecido";
  };

  return (
    <>
      <AdminPageLayout
        title="Unidades Móveis (UMs)"
        buttonLabel="Adicionar UM"
        onButtonClick={() => openModal("add")}
      >
        <div className="overflow-x-auto">
          {isLoading ? (
            <p className="p-6 text-center text-slate-500">Carregando UMs...</p>
          ) : (
            <table className="w-full text-sm text-left text-slate-500">
              <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    Nome da UM
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Projeto
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Dispositivos Esperados
                  </th>
                  <th scope="col" className="px-6 py-3">
                    <span className="sr-only">Ações</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {mobileUnits.map((um) => (
                  <tr
                    key={um.id}
                    className="bg-white border-b hover:bg-slate-50"
                  >
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {um.name}
                    </td>
                    <td className="px-6 py-4">
                      {getProjectName(um.projectId)}
                    </td>
                    <td className="px-6 py-4">{um.expectedDeviceCount}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-4">
                        <button
                          onClick={() => openModal("edit", um)}
                          className="text-slate-500 hover:text-blue-600"
                        >
                          <Icon path={ICONS.edit} className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(um)}
                          className="text-slate-500 hover:text-red-600"
                        >
                          <Icon path={ICONS.trash} className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </AdminPageLayout>

      <Modal
        title={modalMode === "add" ? "Adicionar Nova UM" : "Editar UM"}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="umName"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Nome da UM
              </label>
              <input
                type="text"
                id="umName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full px-3 py-2 border border-slate-300 rounded-md"
                required
              />
            </div>
            <div>
              <label
                htmlFor="umProject"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Projeto
              </label>
              <select
                id="umProject"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="block w-full px-3 py-2 border border-slate-300 rounded-md"
                required
              >
                <option value="" disabled>
                  Selecione um projeto
                </option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="umDeviceCount">Qtd. Dispositivos Esperados</label>
              <input
                type="number"
                id="umDeviceCount"
                value={expectedDeviceCount}
                onChange={(e) => setExpectedDeviceCount(Number(e.target.value))}
                className="block w-full px-3 py-2 border border-slate-300 rounded-md"
                required
              />
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

      <Modal
        title="Confirmar Exclusão"
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      >
        <div>
          <p className="text-slate-600">
            Você tem certeza que deseja excluir a UM{" "}
            <span className="font-bold">{selectedUM?.name}</span>?
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
    </>
  );
}
