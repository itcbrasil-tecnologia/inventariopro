import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Cole suas configurações do Firebase aqui
const firebaseConfig = {
  apiKey: "AIzaSyADiMqW9aC2rpFD2jIbufwcV2mCwPk0vWU",
  authDomain: "itcbrasil-b45c6.firebaseapp.com",
  projectId: "itcbrasil-b45c6",
  storageBucket: "itcbrasil-b45c6.firebasestorage.app",
  messagingSenderId: "544074200281",
  appId: "1:544074200281:web:7502259d58e49a60483ac8",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
