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

// --- FUNÇÃO POST (Criar Notebook - Individual ou em Lote) ---
export async function POST(request: Request) {
  try {
    initializeFirebaseAdmin();
    const body = await request.json();
    const db = getFirestore();

    // Lógica para criação em lote
    if (body.isBatch) {
      const { unitId, prefix, start, end } = body;
      if (!unitId || !prefix || start === undefined || end === undefined) {
        return NextResponse.json(
          { error: "Todos os campos para lote são obrigatórios" },
          { status: 400 }
        );
      }

      const batch = db.batch();
      for (let i = start; i <= end; i++) {
        const patrimoniostr = `${prefix}${String(i).padStart(2, "0")}`;
        const docRef = db.collection("notebooks").doc(patrimoniostr);
        batch.set(docRef, {
          unitId,
          createdAt: new Date().toISOString(),
        });
      }
      await batch.commit();
      return NextResponse.json(
        { message: `${end - start + 1} notebooks criados com sucesso!` },
        { status: 201 }
      );
    }

    // Lógica para criação individual
    const { patrimonio, unitId } = body;
    if (!patrimonio || !unitId) {
      return NextResponse.json(
        { error: "Patrimônio e ID da UM são obrigatórios" },
        { status: 400 }
      );
    }

    const docRef = db.collection("notebooks").doc(patrimonio);
    const docSnap = await docRef.get();
    if (docSnap.exists) {
      return NextResponse.json(
        { error: "Já existe um notebook com este patrimônio." },
        { status: 409 }
      );
    }

    await docRef.set({
      unitId,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json(
      { message: "Notebook criado com sucesso", id: docRef.id },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Erro na API ao criar Notebook:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// --- FUNÇÃO PUT (Atualizar Notebook) ---
export async function PUT(request: Request) {
  try {
    initializeFirebaseAdmin();
    const { id, unitId } = await request.json();
    if (!id || !unitId) {
      return NextResponse.json(
        { error: "ID do Notebook e ID da UM são obrigatórios" },
        { status: 400 }
      );
    }

    const db = getFirestore();
    await db.collection("notebooks").doc(id).update({
      unitId,
    });

    return NextResponse.json(
      { message: "Notebook atualizado com sucesso" },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Erro ao atualizar Notebook:", error);
    return NextResponse.json(
      { error: "Falha ao atualizar Notebook" },
      { status: 500 }
    );
  }
}

// --- FUNÇÃO DELETE (Excluir Notebook - Individual ou em Lote por UM) ---
export async function DELETE(request: Request) {
  try {
    initializeFirebaseAdmin();
    const body = await request.json();
    const db = getFirestore();

    // Lógica para deletar por UM
    if (body.deleteByUnit && body.unitId) {
      const { unitId } = body;
      const snapshot = await db
        .collection("notebooks")
        .where("unitId", "==", unitId)
        .get();

      if (snapshot.empty) {
        return NextResponse.json(
          { message: "Nenhum notebook encontrado para esta UM." },
          { status: 200 }
        );
      }

      const batch = db.batch();
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();

      return NextResponse.json(
        {
          message: `Todos os ${snapshot.size} notebooks da UM foram excluídos.`,
        },
        { status: 200 }
      );
    }

    // Lógica para deletar individualmente
    const { id } = body;
    if (!id) {
      return NextResponse.json(
        { error: "O ID do Notebook é obrigatório" },
        { status: 400 }
      );
    }

    await db.collection("notebooks").doc(id).delete();

    return NextResponse.json(
      { message: "Notebook excluído com sucesso" },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Erro ao excluir Notebook(s):", error);
    return NextResponse.json(
      { error: "Falha ao excluir notebook(s)" },
      { status: 500 }
    );
  }
}
