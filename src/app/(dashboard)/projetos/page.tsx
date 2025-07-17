"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  collection,
  query,
  orderBy as firestoreOrderBy,
  getDocs,
  addDoc,
  serverTimestamp,
  DocumentData,
} from "firebase/firestore";
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

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const { addToast } = useToast();

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const q = query(
        collection(db, "projects"),
        firestoreOrderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      const projectsList = querySnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Project)
      );
      setProjects(projectsList);
    } catch (error) {
      console.error("Error fetching projects: ", error);
      addToast("Erro ao carregar projetos.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) {
      addToast("O nome do projeto não pode ser vazio.", "error");
      return;
    }
    try {
      await addDoc(collection(db, "projects"), {
        name: newProjectName,
        createdAt: serverTimestamp(),
      });
      addToast("Projeto adicionado com sucesso!", "success");
      setNewProjectName("");
      setIsModalOpen(false);
      fetchProjects();
    } catch (error) {
      console.error("Error adding project: ", error);
      addToast("Erro ao adicionar projeto.", "error");
    }
  };

  return (
    <>
      <AdminPageLayout
        title="Projetos"
        buttonLabel="Adicionar Projeto"
        onButtonClick={() => setIsModalOpen(true)}
      >
        <div className="overflow-x-auto">
          {isLoading ? (
            <p className="p-6 text-center text-slate-500">
              Carregando projetos...
            </p>
          ) : (
            <ul>
              {projects.map((project, index) => (
                <li
                  key={project.id}
                  className={`flex justify-between items-center p-4 ${
                    index < projects.length - 1
                      ? "border-b border-slate-200"
                      : ""
                  }`}
                >
                  <span className="text-slate-800 font-medium">
                    {project.name}
                  </span>
                  <div className="flex items-center space-x-4">
                    <button className="text-slate-500 hover:text-blue-600">
                      <Icon path={ICONS.edit} className="w-5 h-5" />
                    </button>
                    <button className="text-slate-500 hover:text-red-600">
                      <Icon path={ICONS.trash} className="w-5 h-5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </AdminPageLayout>

      <Modal
        title="Adicionar Novo Projeto"
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <form onSubmit={handleAddProject}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="projectName"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Nome do Projeto
              </label>
              <input
                type="text"
                id="projectName"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Ex: Projeto Brasília"
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
    </>
  );
}
