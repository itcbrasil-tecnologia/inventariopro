"use client";

import React from "react";
import { Icon } from "@/components/ui/Icon"; // Importação adicionada
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ICONS } from "@/lib/icons"; // Importação adicionada

interface DashboardCardProps {
  title: string;
  value: number | string;
  icon: string; // O path do SVG
  color: string;
}

export const DashboardCard = ({
  title,
  value,
  icon,
  color,
}: DashboardCardProps) => (
  <div className="bg-white rounded-lg shadow p-5 flex items-center space-x-4">
    <div className={`rounded-full p-3 bg-${color}-100`}>
      <Icon path={icon} className={`w-7 h-7 text-${color}-600`} />
    </div>
    <div>
      <p className="text-sm text-slate-500 font-medium">{title}</p>
      <p className="text-3xl font-bold text-slate-800">{value}</p>
    </div>
  </div>
);
