import { NextResponse } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// Função para inicializar o Firebase Admin de forma segura
function initializeFirebaseAdmin() {
  // Evita reinicializar o app se ele já estiver inicializado
  if (getApps().length > 0) {
    return;
  }

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!serviceAccountKey) {
    console.error(
      "Variável de ambiente FIREBASE_SERVICE_ACCOUNT_KEY não encontrada!"
    );
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
    console.error(
      "Erro ao fazer parse da chave de serviço do Firebase. Verifique o formato no arquivo .env.local:",
      e
    );
    throw new Error(
      "A chave de serviço do Firebase está mal formatada ou inválida."
    );
  }
}

// --- FUNÇÃO POST (Criar Usuário) ---
export async function POST(request: Request) {
  try {
    initializeFirebaseAdmin();
    const { name, email, password, role } = await request.json();
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "Todos os campos são obrigatórios" },
        { status: 400 }
      );
    }

    const userRecord = await getAuth().createUser({
      email: email,
      password: password,
      displayName: name,
    });

    await getFirestore().collection("users").doc(userRecord.uid).set({
      name: name,
      email: email,
      role: role,
    });

    return NextResponse.json(
      { message: "Usuário criado com sucesso", uid: userRecord.uid },
      { status: 201 }
    );
  } catch (error: unknown) {
    const firebaseError = error as { code?: string; message?: string };
    console.error("Erro na API ao criar usuário:", firebaseError);
    let errorMessage = firebaseError.message || "Ocorreu um erro desconhecido.";
    if (firebaseError.code === "auth/email-already-exists") {
      errorMessage = "Este e-mail já está em uso.";
    } else if (firebaseError.code === "auth/invalid-password") {
      errorMessage = "A senha deve ter no mínimo 6 caracteres.";
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// --- FUNÇÃO PUT (Atualizar Usuário) ---
export async function PUT(request: Request) {
  try {
    initializeFirebaseAdmin();
    const { uid, name, role } = await request.json();
    if (!uid || !name || !role) {
      return NextResponse.json(
        { error: "UID, nome e perfil são obrigatórios" },
        { status: 400 }
      );
    }

    await getAuth().updateUser(uid, {
      displayName: name,
    });

    await getFirestore().collection("users").doc(uid).update({
      name: name,
      role: role,
    });

    return NextResponse.json(
      { message: "Usuário atualizado com sucesso" },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Erro ao atualizar usuário:", error);
    return NextResponse.json(
      { error: "Falha ao atualizar usuário" },
      { status: 500 }
    );
  }
}

// --- FUNÇÃO DELETE (Excluir Usuário) ---
export async function DELETE(request: Request) {
  try {
    initializeFirebaseAdmin();
    const { uid } = await request.json();
    if (!uid) {
      return NextResponse.json(
        { error: "UID do usuário é obrigatório" },
        { status: 400 }
      );
    }

    await getAuth().deleteUser(uid);
    await getFirestore().collection("users").doc(uid).delete();

    return NextResponse.json(
      { message: "Usuário excluído com sucesso" },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Erro ao excluir usuário:", error);
    return NextResponse.json(
      { error: "Falha ao excluir usuário" },
      { status: 500 }
    );
  }
}
