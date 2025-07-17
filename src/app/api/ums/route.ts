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

// --- FUNÇÃO POST (Criar UM) ---
export async function POST(request: Request) {
  try {
    initializeFirebaseAdmin();
    const { name, projectId, expectedDeviceCount } = await request.json();
    if (!name || !projectId || expectedDeviceCount === undefined) {
      return NextResponse.json(
        { error: "Todos os campos são obrigatórios" },
        { status: 400 }
      );
    }

    const db = getFirestore();
    const docRef = await db.collection("mobileUnits").add({
      name,
      projectId,
      expectedDeviceCount: Number(expectedDeviceCount),
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json(
      { message: "UM criada com sucesso", id: docRef.id },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Erro na API ao criar UM:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// --- FUNÇÃO PUT (Atualizar UM) ---
export async function PUT(request: Request) {
  try {
    initializeFirebaseAdmin();
    const { id, name, projectId, expectedDeviceCount } = await request.json();
    if (!id || !name || !projectId || expectedDeviceCount === undefined) {
      return NextResponse.json(
        { error: "Todos os campos são obrigatórios" },
        { status: 400 }
      );
    }

    const db = getFirestore();
    await db
      .collection("mobileUnits")
      .doc(id)
      .update({
        name,
        projectId,
        expectedDeviceCount: Number(expectedDeviceCount),
      });

    return NextResponse.json(
      { message: "UM atualizada com sucesso" },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Erro ao atualizar UM:", error);
    return NextResponse.json(
      { error: "Falha ao atualizar UM" },
      { status: 500 }
    );
  }
}

// --- FUNÇÃO DELETE (Excluir UM) ---
export async function DELETE(request: Request) {
  try {
    initializeFirebaseAdmin();
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json(
        { error: "O ID da UM é obrigatório" },
        { status: 400 }
      );
    }

    await getFirestore().collection("mobileUnits").doc(id).delete();

    return NextResponse.json(
      { message: "UM excluída com sucesso" },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Erro ao excluir UM:", error);
    return NextResponse.json({ error: "Falha ao excluir UM" }, { status: 500 });
  }
}
