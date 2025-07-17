"use client";
import React, { useState, useEffect, useCallback } from "react";
import { collection, query, getDocs, DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/contexts/ToastContext";
import { AdminPageLayout } from "@/components/layout/AdminPageLayout";
import { Modal } from "@/components/ui/Modal";
import { Icon } from "@/components/ui/Icon";
import { ICONS } from "@/lib/icons";

type UserRole = "USER" | "ADMIN" | "MASTER";

interface AppUser extends DocumentData {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export default function UsersPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Estado para os modais
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Estado para o usuário selecionado (edição/exclusão)
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);

  // Estado para os formulários
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("USER");

  const { addToast } = useToast();

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const q = query(collection(db, "users"));
      const querySnapshot = await getDocs(q);
      const usersList = querySnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as AppUser)
      );
      setUsers(usersList);
    } catch (error) {
      console.error("Erro ao buscar usuários: ", error);
      addToast("Erro ao carregar usuários.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setRole("USER");
    setSelectedUser(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const openEditModal = (user: AppUser) => {
    setSelectedUser(user);
    setName(user.name);
    setEmail(user.email);
    setRole(user.role);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (user: AppUser) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      addToast("Todos os campos são obrigatórios.", "error");
      return;
    }
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Falha ao criar usuário.");
      }

      addToast("Usuário criado com sucesso!", "success");
      resetForm();
      setIsAddModalOpen(false);
      fetchUsers();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Falha ao criar usuário.";
      addToast(errorMessage, "error");
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      const response = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: selectedUser.id, name, role }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      addToast("Usuário atualizado com sucesso!", "success");
      setIsEditModalOpen(false);
      fetchUsers();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Falha ao atualizar usuário.";
      addToast(errorMessage, "error");
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    try {
      const response = await fetch("/api/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: selectedUser.id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      addToast("Usuário excluído com sucesso!", "success");
      setIsDeleteModalOpen(false);
      fetchUsers();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Falha ao excluir usuário.";
      addToast(errorMessage, "error");
    }
  };

  return (
    <>
      <AdminPageLayout
        title="Gestão de Usuários"
        buttonLabel="Adicionar Usuário"
        onButtonClick={openAddModal}
      >
        <div className="overflow-x-auto">
          {isLoading ? (
            <p className="p-6 text-center text-slate-500">
              Carregando usuários...
            </p>
          ) : (
            <table className="w-full text-sm text-left text-slate-500">
              <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    Nome
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Perfil
                  </th>
                  <th scope="col" className="px-6 py-3">
                    <span className="sr-only">Ações</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="bg-white border-b hover:bg-slate-50"
                  >
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {user.name}
                    </td>
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === "MASTER"
                            ? "bg-red-100 text-red-800"
                            : user.role === "ADMIN"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-4">
                        <button
                          onClick={() => openEditModal(user)}
                          className="text-slate-500 hover:text-blue-600"
                        >
                          <Icon path={ICONS.edit} className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(user)}
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

      {/* Modal de Adicionar Usuário */}
      <Modal
        title="Adicionar Novo Usuário"
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      >
        <form onSubmit={handleAddUser}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="addUserName"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Nome
              </label>
              <input
                type="text"
                id="addUserName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full px-3 py-2 border border-slate-300 rounded-md"
                required
              />
            </div>
            <div>
              <label
                htmlFor="addUserEmail"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Email
              </label>
              <input
                type="email"
                id="addUserEmail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full px-3 py-2 border border-slate-300 rounded-md"
                required
              />
            </div>
            <div>
              <label htmlFor="addUserPassword">Senha</label>
              <input
                type="password"
                id="addUserPassword"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full px-3 py-2 border border-slate-300 rounded-md"
                required
              />
            </div>
            <div>
              <label htmlFor="addUserRole">Perfil</label>
              <select
                id="addUserRole"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="block w-full px-3 py-2 border border-slate-300 rounded-md"
              >
                <option value="USER">Técnico (USER)</option>
                <option value="ADMIN">Administrador (ADMIN)</option>
                <option value="MASTER">Mestre (MASTER)</option>
              </select>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
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

      {/* Modal de Editar Usuário */}
      <Modal
        title="Editar Usuário"
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      >
        <form onSubmit={handleEditUser}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="editUserName"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Nome
              </label>
              <input
                type="text"
                id="editUserName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full px-3 py-2 border border-slate-300 rounded-md"
                required
              />
            </div>
            <div>
              <label
                htmlFor="editUserEmail"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Email (não pode ser alterado)
              </label>
              <input
                type="email"
                id="editUserEmail"
                value={email}
                className="block w-full px-3 py-2 border border-slate-300 rounded-md bg-slate-100"
                disabled
              />
            </div>
            <div>
              <label htmlFor="editUserRole">Perfil</label>
              <select
                id="editUserRole"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="block w-full px-3 py-2 border border-slate-300 rounded-md"
              >
                <option value="USER">Técnico (USER)</option>
                <option value="ADMIN">Administrador (ADMIN)</option>
                <option value="MASTER">Mestre (MASTER)</option>
              </select>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2 px-4 rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Modal de Excluir Usuário */}
      <Modal
        title="Confirmar Exclusão"
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      >
        <div>
          <p className="text-slate-600">
            Você tem certeza que deseja excluir o usuário{" "}
            <span className="font-bold">{selectedUser?.name}</span>?
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
              onClick={handleDeleteUser}
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
