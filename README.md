# Obras Viegas

Plataforma web de classificados locais voltada para a comunidade de Viegas e região. Permite que moradores publiquem anúncios de serviços, pedidos de ajuda e oportunidades, com contato direto pelo WhatsApp.

---

## Funcionalidades

- Cadastro e login de usuários
- Cadastro e login de lojas com filtro comercial no feed
- Feed de publicações com foto
- Busca por palavra-chave, bairro e tipo
- Criação, edição e exclusão de publicações
- Gerenciamento de perfil com foto
- Controle de propriedade — cada usuário edita e exclui apenas seus próprios posts
- Contato direto via WhatsApp
- Consentimento para aceitar ou rejeitar cookies de análise
- Validação de tamanho, formato e conteúdo nos dados de autenticação

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
- Node Test Runner para testes automatizados

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
- Cookies de análise carregados somente após consentimento do usuário
- Banner de consentimento com opções de aceitar ou rejeitar análise
- Regeneração de sessão após login
- Rate limiting no login (5 tentativas por IP a cada 15 minutos)
- Headers de segurança via Helmet com CSP configurada
- Proteção de proprietário em edição e exclusão de posts
- Validação de upload por MIME type e magic bytes (file-type)
- Limite de 5 MB por arquivo
- Prepared statements em todas as queries (sem SQL Injection)
- Todo conteúdo dinâmico inserido via `textContent` (sem XSS)
- Páginas privadas servidas apenas via servidor autenticado
- Validação de nome, email, senha, contato, bairro e categoria no cadastro/login
- Limites de tamanho para os campos de autenticação
- Bloqueio de caracteres de controle e palavras proibidas em nomes
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
├── docs/                    → Políticas de privacidade, cookies e uso
├── tests/                   → Testes unitários e de integração
│   ├── unit/
│   ├── integration/
│   └── helpers/
│
├── server.js                → Servidor Express (rotas, middlewares, API)
├── package.json
├── .gitignore
└── .env                     → Variáveis de ambiente (não commitado)
```

---

## Banco de dados

Utiliza PostgreSQL hospedado no Supabase com as tabelas:

**contas** — id, tipo (`usuario`, `loja` ou `admin`), nome, email, senha (hash bcrypt), contato, bairro, categoria, foto, created_at

**posts** — id, conta_id, tipo, titulo, bairro, descricao, whatsapp, foto, created_at. A chave estrangeira aponta para `contas(id)` com `ON DELETE CASCADE`.

**sessions** — gerenciada automaticamente pelo connect-pg-simple

Índices `idx_posts_conta_id` e `idx_posts_created_at` otimizam as consultas do feed e das publicações da conta.

O schema completo está em `database/migrations/001_initial.sql` e deve ser executado no SQL Editor do Supabase antes de iniciar a aplicação.

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
npm start
```

Acesse `http://localhost:3000`.

### Scripts disponíveis

```bash
npm start                         # inicia o servidor
npm test                          # executa todos os testes
npm run test:unit                 # executa testes sem banco externo
npm run test:integration          # executa testes com PostgreSQL
```

Os testes de integração usam o banco definido em `DATABASE_URL`. Para impedir
que sejam ignorados quando o banco estiver indisponível, execute:

```bash
REQUIRE_TEST_DB=1 npm run test:integration
```

Use um banco de teste separado do banco de produção. Os testes criam e removem
contas e publicações durante a execução.

## Operação da aplicação

### Fluxo por tipo de conta

- `usuario`: após o login, acessa o feed em `/main`.
- `loja`: após o login, acessa o mesmo feed em `/main`.
- `admin`: o tipo está previsto no banco, mas ainda não possui uma área administrativa implementada.

O feed compartilhado possui o filtro `Lojas`, que consulta apenas publicações de contas com `tipo = 'loja'`. A identificação comercial exibe o nome, a categoria e o bairro da loja.

### Consentimento de cookies

O banner de cookies aparece nas páginas públicas, privadas e legais. A escolha
fica armazenada no `localStorage` do navegador:

- `aceito`: habilita o Google Analytics;
- `rejeitado`: mantém o Analytics desabilitado.

O cookie de sessão `connect.sid` é essencial para autenticação e continua sendo
utilizado nas áreas que exigem login. Consulte `docs/politica-de-cookies.md` ou
a rota `/cookies` para mais informações.

### Validações de autenticação

O cadastro de usuário e loja valida os dados no backend em
`validators/authValidator.js`:

| Campo | Limite |
|---|---:|
| Nome de usuário | 80 caracteres |
| Nome de loja | 100 caracteres |
| Email | 254 caracteres |
| Senha | mínimo 8 e máximo 72 bytes |
| Contato | 10 ou 11 dígitos após normalização |
| Bairro | 60 caracteres |

O login valida presença, tipo, formato do email e limite da senha, sem repetir
a regra de complexidade usada no cadastro.

### Endpoints relevantes

| Método | Rota | Finalidade |
|---|---|---|
| `POST` | `/cadastrar` | Cadastro de usuário |
| `POST` | `/cadastrar-loja` | Cadastro de loja |
| `POST` | `/login` | Autenticação |
| `POST` | `/logout` | Encerramento da sessão |
| `GET` | `/me` | Dados da conta autenticada |
| `GET` | `/api/perfil` | Consulta da API de perfil |
| `PUT` | `/perfil` | Atualização do perfil |
| `GET` | `/posts` | Feed e filtros |
| `POST` | `/posts` | Criação de publicação |
| `PUT` | `/posts/:id` | Edição da própria publicação |
| `DELETE` | `/posts/:id` | Exclusão da própria publicação |

### Ordem para executar localmente

1. Configure o `.env` com `DATABASE_URL`, `SESSION_SECRET`, `SUPABASE_URL` e `SUPABASE_SERVICE_KEY`.
2. Execute `database/migrations/001_initial.sql` no PostgreSQL/Supabase.
3. Confirme que a tabela `sessions` está acessível ao usuário da aplicação.
4. Instale as dependências com `npm install`.
5. Inicie com `npm start`.
6. Execute `npm run test:unit`.
7. Execute os testes de integração com um banco de teste acessível.
8. Teste cadastro, login, acesso ao painel, criação de post e logout.

### Procedimento de deploy

Antes de publicar uma nova versão:

1. Faça backup ou confirme o ponto de restauração do banco.
2. Execute novas migrações no Supabase antes de ativar o código que depende delas.
3. Configure as variáveis no Render, sem colocar segredos no repositório.
4. Mantenha `NODE_ENV=production` para habilitar cookies seguros.
5. Verifique o login de usuário e loja, o redirecionamento do painel e a criação/exclusão de posts.
6. Verifique o banner de consentimento e confirme que o Analytics só é carregado após aceite.
7. Consulte os logs do Render para falhas de sessão, banco ou Storage.

### Diagnóstico rápido

- O filtro `Lojas` vazio: confirme se existem contas com `tipo = 'loja'` e posts associados por `conta_id`.
- Erro de sessão: verifique `DATABASE_URL`, `SESSION_SECRET` e a tabela `sessions`.
- Erro de publicação: valide a existência de `contas`, `posts`, `conta_id` e da chave estrangeira.
- Erro de imagem: confira os buckets `perfil` e `posts` e a `SUPABASE_SERVICE_KEY`.

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

`REQUIRE_TEST_DB` é opcional e deve ser usado nos testes. Quando definido como
`1`, os testes de integração falham se não conseguirem acessar o banco, em vez
de serem ignorados.

---

## Licença

Projeto desenvolvido para uso comunitário local.
