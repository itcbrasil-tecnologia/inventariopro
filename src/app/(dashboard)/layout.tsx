"use client";
import React, { ReactNode } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { userRole, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-100">
        <p>Carregando...</p>
      </div>
    );
  }

  if (userRole !== "ADMIN" && userRole !== "MASTER") {
    router.push("/scanner");
    return null;
  }

  if (pathname.startsWith("/usuarios") && userRole !== "MASTER") {
    router.push("/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      <Navbar />
      {children}
    </div>
  );
}
