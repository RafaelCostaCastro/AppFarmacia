# AppFarmacia

Aplicativo de gerenciamento de farmácia com React Native (Frontend) e Node.js (Backend).

## 📋 Pré-requisitos

- Node.js (v16 ou superior)
- npm ou yarn
- PostgreSQL (ou conta no Neon)
- Expo CLI (para o frontend)

## 🚀 Instalação

### Backend

```bash
cd backend
npm install
```

### Frontend

```bash
cd frontend
npm install
```

## ⚙️ Configuração

O projeto está configurado para usar PostgreSQL/Neon com suporte completo a UTF-8 para caracteres especiais do português brasileiro.

### Variáveis de Ambiente

Configure a string de conexão do PostgreSQL em `backend/server.js`.

## 🏃 Executando o Projeto

### Backend

```bash
cd backend
npm start
```

O servidor estará disponível em `http://localhost:3000`

### Frontend

```bash
cd frontend
npx expo start
```

## 📝 Características

- ✅ Suporte completo a UTF-8 e caracteres especiais (ã, ç, á, é, etc.)
- ✅ Gerenciamento de medicamentos
- ✅ Gerenciamento de clientes
- ✅ Sincronização com banco de dados PostgreSQL
- ✅ API RESTful

## 📦 Estrutura do Projeto

```
AppFarmacia/
├── backend/
│   ├── server.js           # Servidor Express com suporte UTF-8
│   ├── package.json
│   ├── migrations/         # Migrações do banco de dados
│   └── .gitignore
├── frontend/
│   ├── app/                # Telas do aplicativo
│   ├── api.js              # Cliente API com suporte UTF-8
│   ├── ClienteScreen.js    # Tela de clientes
│   ├── MedicamentoScreen.js # Tela de medicamentos
│   ├── package.json
│   └── .gitignore
└── .gitignore              # Gitignore raiz
```

## 🔧 Tecnologias Utilizadas

### Backend
- Express.js
- PostgreSQL (pg)
- CORS

### Frontend
- React Native
- Expo
- Axios

## ⚠️ Importante

- **Não faça commit de `node_modules/`** - os arquivos `.gitignore` já estão configurados
- Execute `npm install` após clonar o repositório
- O suporte a UTF-8 está configurado em todos os pontos de comunicação (Express, PostgreSQL, Axios)

## 📄 Licença

Este projeto está sob licença ISC.
