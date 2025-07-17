"use client";
import React, { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function UserLayout({ children }: { children: ReactNode }) {
  const { userRole, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <p className="text-white">Carregando...</p>
      </div>
    );
  }

  if (userRole !== "USER") {
    router.push("/dashboard");
    return null;
  }

  return <>{children}</>;
}
