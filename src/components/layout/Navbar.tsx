"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Icon } from "@/components/ui/Icon";
import { ICONS } from "@/lib/icons";

export const Navbar = () => {
  const { user, logout } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const adminDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setProfileDropdownOpen(false);
      }
      if (
        adminDropdownRef.current &&
        !adminDropdownRef.current.contains(event.target as Node)
      ) {
        setAdminDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="bg-slate-800 shadow-lg sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/dashboard" className="flex-shrink-0 flex items-center">
            <Icon path={ICONS.qrCode} className="h-8 w-8 text-blue-400" />
            <span className="text-white text-xl font-bold ml-2">
              InventárioPRO
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-2">
            <Link
              href="/dashboard"
              className="px-3 py-2 rounded-md text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white"
            >
              Dashboard
            </Link>
            <Link
              href="/relatorios"
              className="px-3 py-2 rounded-md text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white"
            >
              Relatórios
            </Link>

            <div className="relative" ref={adminDropdownRef}>
              <button
                onClick={() => setAdminDropdownOpen((prev) => !prev)}
                className="px-3 py-2 rounded-md text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white flex items-center"
              >
                Administração{" "}
                <Icon path={ICONS.chevronDown} className="w-4 h-4 ml-1" />
              </button>
              {adminDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20">
                  <Link
                    href="/projetos"
                    className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                  >
                    Projetos
                  </Link>
                  <Link
                    href="/ums"
                    className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                  >
                    UMs
                  </Link>
                  <Link
                    href="/notebooks"
                    className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                  >
                    Notebooks
                  </Link>
                  {user?.role === "MASTER" && (
                    <Link
                      href="/usuarios"
                      className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 border-t mt-1 pt-1"
                    >
                      Usuários
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center">
            <div
              className="hidden md:block relative ml-4"
              ref={profileDropdownRef}
            >
              <button
                onClick={() => setProfileDropdownOpen((prev) => !prev)}
                className="p-2 rounded-full text-slate-300 hover:bg-slate-700"
              >
                <Icon path={ICONS.user} className="h-6 w-6" />
              </button>
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg p-2 z-20">
                  <div className="px-2 py-2 border-b">
                    <p className="text-sm text-slate-600">
                      Sessão iniciada como
                    </p>
                    <p className="text-sm font-medium text-slate-800 truncate">
                      {user?.email}
                    </p>
                  </div>
                  <button
                    onClick={logout}
                    className="w-full text-left mt-1 px-2 py-2 text-sm text-red-600 hover:bg-slate-100 rounded-md flex items-center"
                  >
                    <Icon path={ICONS.logout} className="w-5 h-5 mr-2" /> Sair
                  </button>
                </div>
              )}
            </div>
            <div className="md:hidden ml-2">
              <button
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                className="p-2 rounded-md text-slate-300 hover:bg-slate-700"
              >
                <Icon
                  path={mobileMenuOpen ? ICONS.close : ICONS.menu}
                  className="h-6 w-6"
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-800">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              href="/dashboard"
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:bg-slate-700"
            >
              Dashboard
            </Link>
            <Link
              href="/relatorios"
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:bg-slate-700"
            >
              Relatórios
            </Link>
            <h3 className="px-3 pt-4 pb-2 text-xs font-bold text-slate-400 uppercase">
              Administração
            </h3>
            <Link
              href="/projetos"
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:bg-slate-700"
            >
              Projetos
            </Link>
            <Link
              href="/ums"
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:bg-slate-700"
            >
              UMs
            </Link>
            <Link
              href="/notebooks"
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:bg-slate-700"
            >
              Notebooks
            </Link>
            {user?.role === "MASTER" && (
              <Link
                href="/usuarios"
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:bg-slate-700"
              >
                Usuários
              </Link>
            )}
          </div>
          <div className="pt-4 pb-3 border-t border-slate-700">
            <div className="px-5">
              <p className="text-sm font-medium text-white truncate">
                {user?.email}
              </p>
            </div>
            <div className="mt-3 px-2 space-y-1">
              <button
                onClick={logout}
                className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-400 hover:bg-slate-700"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
