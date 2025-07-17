"use client";
import React from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Icon } from "@/components/ui/Icon";
import { ICONS } from "@/lib/icons";

export default function UserHomePage() {
  const { user } = useAuth();
  // Mock data para o histórico e contagens
  const availableScans = "2/2";
  const scanHistory = [
    { id: 1, date: "16/07/2025", um: "BSBIA01", status: "Concluída" },
    { id: 2, date: "15/07/2025", um: "CODHAB01", status: "Concluída" },
  ];

  return (
    <div className="p-4 space-y-6">
      <header className="text-center">
        <h1 className="text-xl font-bold text-slate-800">
          Bem-vindo, {user?.name || "Técnico"}!
        </h1>
        <p className="text-sm text-slate-500">
          Pronto para a próxima contagem?
        </p>
      </header>

      <div className="bg-white p-4 rounded-lg shadow-md text-center">
        <p className="text-sm font-medium text-slate-600">
          CONTAGENS DISPONÍVEIS HOJE
        </p>
        <p className="text-5xl font-bold text-blue-600 my-2">
          {availableScans}
        </p>
      </div>

      <Link
        href="/scanner"
        className="w-full bg-blue-600 text-white font-bold py-4 px-6 rounded-lg flex items-center justify-center text-lg shadow-lg hover:bg-blue-700 transition-colors"
      >
        <Icon path={ICONS.qrCode} className="w-6 h-6 mr-3" />
        Iniciar Nova Contagem
      </Link>

      <div>
        <h2 className="text-lg font-bold text-slate-800 mb-2">
          Seu Histórico Recente
        </h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-500">
              <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                <tr>
                  <th scope="col" className="px-4 py-3">
                    Data
                  </th>
                  <th scope="col" className="px-4 py-3">
                    UM
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {scanHistory.map((scan) => (
                  <tr
                    key={scan.id}
                    className="bg-white border-b hover:bg-slate-50"
                  >
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {scan.date}
                    </td>
                    <td className="px-4 py-3">{scan.um}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
                        {scan.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
