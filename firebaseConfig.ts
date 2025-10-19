import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth'

// ✅ Configuração do seu app Firebase
const firebaseConfig = {
  apiKey: "AIzaSyB0ME6iw1D6IVJKs8SrkKYhA2kKX4ZiaHU",
  authDomain: "mytrip-auth.firebaseapp.com",
  projectId: "mytrip-auth",
  storageBucket: "mytrip-auth.firebasestorage.app",
  messagingSenderId: "69422193267",
  appId: "1:69422193267:web:dc08bcedb4f448ac1ea806"
};

// ✅ Inicializa o app
const app: FirebaseApp = initializeApp(firebaseConfig)

// ✅ Exporta as instâncias com tipagem
export const auth: Auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
