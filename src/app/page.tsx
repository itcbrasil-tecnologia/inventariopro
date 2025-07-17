"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const { loading, user, userRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        if (userRole === "USER") {
          router.push("/scanner");
        } else if (userRole === "ADMIN" || userRole === "MASTER") {
          router.push("/dashboard");
        }
      } else {
        router.push("/login");
      }
    }
  }, [loading, user, userRole, router]);

  return (
    <div className="flex items-center justify-center h-screen bg-slate-100">
      <p>Carregando...</p>
    </div>
  );
}
