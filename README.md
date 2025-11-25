# BiblioTech - Sistema de Gerenciamento de Biblioteca

Este projeto é um sistema completo para gerenciamento de biblioteca, desenvolvido como requisito para a disciplina de **Sistemas de Bancos de Dados** do IPRJ/UERJ.

## Tecnologias Utilizadas

* **Front-end:** React, Vite, Tailwind CSS, Lucide Icons.
* **Back-end:** Node.js, Fastify, Zod.
* **Banco de Dados:** MySQL (gerenciado via Prisma ORM).
* **Linguagem:** TypeScript.

## Pré-requisitos

Para executar este projeto localmente, você precisará ter instalado:
1.  **Node.js** (versão 18 ou superior).
2.  **MySQL** (rodando localmente).

## Instalação e Configuração

Siga os passos abaixo para configurar o ambiente:

### 1. Clonar e Instalar Dependências

Abra o terminal na pasta raiz do projeto:

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 2. Configurar o Banco de Dados

Crie um banco de dados vazio no seu MySQL chamado biblioteca_db.

Dentro da pasta backend, crie um arquivo .env (baseado no exemplo abaixo):
```bash
DATABASE_URL="mysql://USUARIO:SENHA@localhost:3306/biblioteca_db"
```
Substitua USUARIO e SENHA pelas suas credenciais locais do MySQL.
Execute a migração para criar as tabelas automaticamente:
```bash
npx prisma migrate dev --name init
```

### 3. Executando a Aplicação

Você precisará de dois terminais abertos simultaneamente.
```bash
cd backend
npm run dev
```
```bash
cd frontend
npm run dev
```
