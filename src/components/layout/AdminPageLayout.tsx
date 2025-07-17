"use client";
import React, { ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import { ICONS } from "@/lib/icons";

interface AdminPageLayoutProps {
  title: string;
  buttonLabel?: string;
  onButtonClick?: () => void;
  children: ReactNode;
}

export const AdminPageLayout = ({
  title,
  buttonLabel,
  onButtonClick,
  children,
}: AdminPageLayoutProps) => (
  <main className="flex-1 p-6">
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold text-slate-800">{title}</h1>
      {buttonLabel && onButtonClick && (
        <button
          onClick={onButtonClick}
          className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
          <Icon path={ICONS.plus} className="w-5 h-5 mr-2" />
          {buttonLabel}
        </button>
      )}
    </div>
    <div className="bg-white rounded-lg shadow">{children}</div>
  </main>
);
