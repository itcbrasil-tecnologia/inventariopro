import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // A lógica principal de proteção de rotas é feita nos layouts do lado do cliente.
  // Este arquivo é mantido para futuras implementações de middleware.
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Não aplicar o middleware em rotas de API ou arquivos estáticos.
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
