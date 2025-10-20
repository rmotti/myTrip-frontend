# 🌍 MyTrip — Planejador de Viagens

MyTrip é uma aplicação web desenvolvida em **React + Vite**, que permite ao usuário **planejar suas viagens**, gerenciando **destinos, orçamentos e categorias de gastos** (como passagens, hospedagem e passeios).  
O projeto utiliza **Firebase Authentication** para login e registro de usuários.

---

## 🚀 Tecnologias

- **React + Vite**
- **TypeScript**
- **Firebase Authentication**
- **TailwindCSS**
- **React Router**

---

## ⚙️ Configuração do Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```bash
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
````

> ⚠️ As chaves acima vêm do seu projeto no [Firebase Console](https://console.firebase.google.com/).
> Nunca compartilhe o `.env` real — apenas o `.env.example` pode ser versionado.

---

## 🧠 Scripts

```bash
# Instalar dependências
npm install

# Rodar localmente
npm run dev

# Build de produção
npm run build

# Pré-visualizar build
npm run preview
```

---

## 📁 Estrutura resumida

```
mytrip-frontend/
├── src/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── firebase/
│   └── main.tsx
├── .env.example
├── .gitignore
└── package.json
```

---

## 🔒 Observações

* O arquivo `.env` **não deve ser commitado** (já configurado no `.gitignore`).
* Futuramente, um **backend** poderá ser adicionado para armazenar viagens, orçamentos e recomendações personalizadas.

---

## 👨‍💻 Autor

Desenvolvido por **Rodrigo Motti** — projeto pessoal de aprendizado em React e arquitetura full-stack.

