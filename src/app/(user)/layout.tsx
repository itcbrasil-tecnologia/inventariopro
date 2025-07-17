"use client";

import React, { ReactNode, useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { ICONS } from "@/lib/icons";

const UserNavbar = () => {
  const { user, logout } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="bg-slate-800 shadow-lg sticky top-0 z-40">
      <div className="max-w-lg mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex-shrink-0 flex items-center">
            <Icon path={ICONS.qrCode} className="h-8 w-8 text-blue-400" />
            <span className="text-white text-xl font-bold ml-2">
              Inventário
            </span>
          </Link>

          <div className="relative" ref={profileDropdownRef}>
            <button
              onClick={() => setProfileDropdownOpen((prev) => !prev)}
              className="p-2 rounded-full text-slate-300 hover:bg-slate-700"
            >
              <Icon path={ICONS.user} className="h-6 w-6" />
            </button>
            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg p-2 z-20">
                <div className="px-2 py-2 border-b">
                  <p className="text-sm text-slate-600">Sessão iniciada como</p>
                  <p className="text-sm font-medium text-slate-800 truncate">
                    {user?.email}
                  </p>
                </div>
                <button className="w-full text-left mt-1 px-2 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-md flex items-center">
                  <Icon path={ICONS.lock} className="w-5 h-5 mr-2" /> Alterar
                  Senha
                </button>
                <button
                  onClick={logout}
                  className="w-full text-left mt-1 px-2 py-2 text-sm text-red-600 hover:bg-slate-100 rounded-md flex items-center"
                >
                  <Icon path={ICONS.logout} className="w-5 h-5 mr-2" /> Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default function UserLayout({ children }: { children: ReactNode }) {
  const { userRole, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-100">
        <p>Carregando...</p>
      </div>
    );
  }

  if (userRole !== "USER") {
    // Se não for um técnico, redireciona para o dashboard principal
    router.push("/dashboard");
    return null; // Retorna null para evitar renderizar qualquer coisa enquanto redireciona
  }

  // Se o usuário for um técnico, exibe a navbar do técnico e o conteúdo da página
  return (
    <div className="min-h-screen bg-slate-100">
      <UserNavbar />
      <main>{children}</main>
    </div>
  );
}
