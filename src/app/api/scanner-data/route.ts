import { NextResponse } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Função para inicializar o Firebase Admin de forma segura
function initializeFirebaseAdmin() {
  if (getApps().length > 0) {
    return;
  }

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!serviceAccountKey) {
    throw new Error(
      "A variável de ambiente FIREBASE_SERVICE_ACCOUNT_KEY não está definida."
    );
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountKey);
    initializeApp({
      credential: cert(serviceAccount),
    });
  } catch (e) {
    console.error("Erro ao fazer parse da chave de serviço do Firebase:", e);
    throw new Error(
      "A chave de serviço do Firebase está mal formatada ou inválida."
    );
  }
}

export async function GET() {
  try {
    initializeFirebaseAdmin();
    const db = getFirestore();

    const unitsSnapshot = await db.collection("mobileUnits").get();
    const notebooksSnapshot = await db.collection("notebooks").get();

    const mobileUnits = unitsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    const notebooks = notebooksSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ mobileUnits, notebooks });
  } catch (error: unknown) {
    console.error("Erro ao buscar dados para o scanner:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
