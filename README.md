# Obras Viegas

Plataforma web de classificados locais voltada para a comunidade de Viegas e região. Permite que moradores publiquem anúncios de serviços, pedidos de ajuda e oportunidades, com contato direto pelo WhatsApp.

---

## Funcionalidades

- Cadastro e login de usuários
- Feed de publicações com foto
- Busca por palavra-chave, bairro e tipo
- Criação, edição e exclusão de publicações
- Gerenciamento de perfil com foto
- Controle de propriedade — cada usuário edita e exclui apenas seus próprios posts
- Contato direto via WhatsApp

---

## Stack

**Backend**
- Node.js
- Express 5
- PostgreSQL (Supabase)
- express-session + connect-pg-simple
- bcrypt
- Multer
- file-type
- Helmet
- express-rate-limit
- dotenv

**Frontend**
- HTML, CSS e JavaScript puro
- Fetch API
- FormData

**Infraestrutura**
- Render (servidor)
- Supabase (banco de dados PostgreSQL + Storage de imagens)
- GitHub (versionamento)

---

## Segurança implementada

- Senhas criptografadas com bcrypt
- Sessões persistentes no PostgreSQL
- Cookies com `httpOnly`, `sameSite` e `secure` em produção
- Regeneração de sessão após login
- Rate limiting no login (5 tentativas por IP a cada 15 minutos)
- Headers de segurança via Helmet com CSP configurada
- Proteção de proprietário em edição e exclusão de posts
- Validação de upload por MIME type e magic bytes (file-type)
- Limite de 5 MB por arquivo
- Prepared statements em todas as queries (sem SQL Injection)
- Todo conteúdo dinâmico inserido via `textContent` (sem XSS)
- Páginas privadas servidas apenas via servidor autenticado
- Variáveis sensíveis via `.env` (nunca commitadas)

---

## Estrutura do projeto

```
ObrasViegas/
│
├── public/                  → Páginas públicas (login, cadastro) e assets
│   ├── css/                 → Estilos (global.css + por página)
│   ├── js/                  → JavaScript do frontend
│   └── img/                 → Imagens estáticas
│
├── private/                 → Páginas protegidas (servidas só com sessão ativa)
│   ├── main.html
│   ├── buscar.html
│   ├── postar.html
│   ├── perfil.html
│   ├── editar-post.html
│   └── editar-perfil.html
│
├── database/
│   ├── database.js          → Conexão com PostgreSQL via pool
│   └── migrations/
│       └── 001_initial.sql  → Schema de referência
│
├── server.js                → Servidor Express (rotas, middlewares, API)
├── package.json
├── .gitignore
└── .env                     → Variáveis de ambiente (não commitado)
```

---

## Banco de dados

Utiliza PostgreSQL hospedado no Supabase com três tabelas:

**usuarios** — id, nome, email, senha (hash bcrypt), foto, created_at

**posts** — id, usuario_id, tipo, titulo, bairro, descricao, whatsapp, foto, created_at

**sessions** — gerenciada automaticamente pelo connect-pg-simple

Índices criados em `posts.usuario_id` e `posts.created_at` para otimizar as queries do feed.

---

## Armazenamento de imagens

Imagens armazenadas no Supabase Storage em dois buckets:

- `perfil` — fotos de perfil dos usuários
- `posts` — imagens das publicações

Políticas de acesso configuradas para permitir leitura de arquivos individuais, upload e exclusão pelo servidor, sem permitir listagem do bucket.

---

## Como rodar localmente

**1. Clone o repositório**
```bash
git clone https://github.com/eduardow890-droid/ObrasViegas.git
cd ObrasViegas
```

**2. Instale as dependências**
```bash
npm install
```

**3. Configure as variáveis de ambiente**

Crie um arquivo `.env` na raiz do projeto:

```
SESSION_SECRET=sua_chave_secreta_longa
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_KEY=sua_chave_do_supabase
DATABASE_URL=postgresql://usuario:senha@host:porta/banco
NODE_ENV=development
```

**4. Configure o banco de dados**

No SQL Editor do Supabase, execute o arquivo `database/migrations/001_initial.sql` para criar as tabelas.

**5. Inicie o servidor**
```bash
node server.js
```

Acesse `http://localhost:3000`.

---

## Deploy

O projeto está configurado para deploy no **Render** com banco e storage no **Supabase**.

As variáveis de ambiente são configuradas diretamente no painel do Render — nunca no código ou no repositório.

---

## Variáveis de ambiente necessárias

| Variável | Descrição |
|---|---|
| `SESSION_SECRET` | Chave secreta para assinar as sessões |
| `SUPABASE_URL` | URL do projeto no Supabase |
| `SUPABASE_SERVICE_KEY` | Chave de acesso ao Supabase |
| `DATABASE_URL` | Connection string do PostgreSQL |
| `NODE_ENV` | `development` ou `production` |

---

## Licença

Projeto desenvolvido para uso comunitário local.
