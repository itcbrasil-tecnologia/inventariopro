"use client";
import React from "react";
import { AdminPageLayout } from "@/components/layout/AdminPageLayout";
import { DashboardCard } from "@/components/dashboard/DashboardCard"; // Importação corrigida
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
    <AdminPageLayout title="Dashboard">
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <DashboardCard
            title="Técnicos Ativos"
            value={mockData.technicians}
            icon={ICONS.users}
            color="sky"
          />
          <DashboardCard
            title="Unidades Móveis (UMs)"
            value={mockData.mobileUnits}
            icon={ICONS.server}
            color="amber"
          />
          <DashboardCard
            title="Dispositivos Cadastrados"
            value={mockData.devices}
            icon={ICONS.device}
            color="emerald"
          />
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
      </div>
    </AdminPageLayout>
  );
}
