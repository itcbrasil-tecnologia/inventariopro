"use client";
import React from "react";
import { Icon } from "@/components/ui/Icon";
import { ICONS } from "@/lib/icons";

export default function DashboardPage() {
  const mockData = {
    technicians: 12,
    mobileUnits: 7,
    devices: 485,
    recentScans: [
      {
        id: 1,
        date: "16/07/2025, 10:30",
        um: "BSBIA01",
        tech: "João Marcos",
        status: "Concluída",
      },
      {
        id: 2,
        date: "16/07/2025, 10:25",
        um: "SPV02",
        tech: "Lucas Andrade",
        status: "Concluída",
      },
    ],
  };

  return (
    <main className="flex-1 p-6">
      <h1 className="text-3xl font-bold text-slate-800 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-5 flex items-center space-x-4">
          <div className="rounded-full p-3 bg-sky-100">
            <Icon path={ICONS.users} className="w-7 h-7 text-sky-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">
              Técnicos Ativos
            </p>
            <p className="text-3xl font-bold text-slate-800">
              {mockData.technicians}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-5 flex items-center space-x-4">
          <div className="rounded-full p-3 bg-amber-100">
            <Icon path={ICONS.server} className="w-7 h-7 text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">
              Unidades Móveis (UMs)
            </p>
            <p className="text-3xl font-bold text-slate-800">
              {mockData.mobileUnits}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-5 flex items-center space-x-4">
          <div className="rounded-full p-3 bg-emerald-100">
            <Icon path={ICONS.device} className="w-7 h-7 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">
              Dispositivos Cadastrados
            </p>
            <p className="text-3xl font-bold text-slate-800">
              {mockData.devices}
            </p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-5 border-b">
          <h2 className="text-xl font-bold text-slate-800">
            Últimas Contagens
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-500">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Data/Hora
                </th>
                <th scope="col" className="px-6 py-3">
                  Unidade Móvel
                </th>
                <th scope="col" className="px-6 py-3">
                  Técnico
                </th>
                <th scope="col" className="px-6 py-3">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {mockData.recentScans.map((scan) => (
                <tr
                  key={scan.id}
                  className="bg-white border-b hover:bg-slate-50"
                >
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {scan.date}
                  </td>
                  <td className="px-6 py-4">{scan.um}</td>
                  <td className="px-6 py-4">{scan.tech}</td>
                  <td className="px-6 py-4">
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
    </main>
  );
}
