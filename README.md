# Obras Viegas

Plataforma web de classificados locais voltada para a comunidade de Viegas e região. Permite que moradores, profissionais e lojas publiquem anúncios, serviços e pedidos de ajuda, com contato direto pelo WhatsApp.

---

## Funcionalidades

- Cadastro e login de usuários.
- Cadastro e login de lojas.
- Feed de publicações.
- Publicações com imagens.
- Busca por palavra-chave, bairro e tipo.
- Filtro de publicações de lojas.
- Criação, edição e exclusão de publicações.
- Gerenciamento de perfil.
- Foto de perfil.
- Dados comerciais para lojas.
- Controle de propriedade das publicações.
- Contato direto pelo WhatsApp.
- Consentimento para aceitar ou rejeitar cookies de análise.
- Validação de dados de cadastro e login.
- Proteção de páginas privadas.

---

## Tecnologias

### Backend

- Node.js
- Express 5
- PostgreSQL
- Supabase
- Express Session
- Connect PG Simple
- Bcrypt
- Multer
- File Type
- Helmet
- Express Rate Limit
- Dotenv

### Frontend

- HTML
- CSS
- JavaScript puro
- Fetch API
- FormData
- LocalStorage para preferência de cookies

### Infraestrutura

- Render para hospedagem do servidor.
- Supabase para PostgreSQL e Storage.
- GitHub para versionamento.

---

## Segurança implementada

- Senhas armazenadas com hash bcrypt.
- Sessões persistidas no PostgreSQL.
- Cookies de sessão com `HttpOnly`.
- Cookies com `SameSite=Lax`.
- Cookies `Secure` em produção.
- Regeneração da sessão após login.
- Rate limit de login:
  - 5 tentativas por IP.
  - Janela de 15 minutos.
- Headers de segurança com Helmet.
- Content Security Policy configurada.
- Proteção de propriedade dos posts.
- Prepared statements nas consultas SQL.
- Validação de upload por MIME type.
- Validação de imagem por magic bytes.
- Limite de 5 MB por imagem.
- Conteúdo dinâmico inserido com `textContent`.
- Páginas privadas protegidas por sessão.
- Validação de tipos e limites nos campos de autenticação.
- Validação de email.
- Validação de senha.
- Validação de contato telefônico.
- Bloqueio de caracteres de controle.
- Bloqueio de palavras proibidas em nomes.
- Variáveis sensíveis armazenadas no `.env`.
- Google Analytics carregado somente após consentimento.

---

## Consentimento de cookies

O projeto exibe um banner de consentimento nas páginas públicas, privadas e legais.

O usuário pode escolher:

- **Aceitar análise**
  - Habilita o Google Analytics.
  - Permite a criação dos cookies de análise.

- **Rejeitar análise**
  - Mantém o Google Analytics desabilitado.
  - Impede o carregamento do script externo de análise.

A escolha é armazenada no `localStorage` com a chave:

```text
obrasViegasConsentimentoCookies
```

O cookie `connect.sid` é essencial para autenticação e pode continuar sendo utilizado nas áreas que exigem login.

Mais informações:

- `docs/politica-de-cookies.md`
- `docs/politica-de-privacidade.md`
- Rota `/cookies`
- Rota `/privacidade`

---

## Estrutura do projeto

```text
ObrasViegas/
│
├── config/
│   ├── security.js              → Configuração do Helmet e CSP
│   └── session.js               → Configuração das sessões
│
├── controllers/
│   ├── authController.js        → Cadastro, login, logout e sessão
│   ├── perfilController.js      → Consulta e atualização de perfil
│   └── postController.js       → CRUD de publicações
│
├── database/
│   ├── database.js              → Pool de conexão PostgreSQL
│   └── migrations/
│       └── 001_initial.sql      → Estrutura inicial do banco
│
├── docs/
│   ├── isencao-de-responsabilidade.md
│   ├── politica-de-conteudo.md
│   ├── politica-de-cookies.md
│   ├── politica-de-privacidade.md
│   └── termos-de-uso.md
│
├── lib/
│   ├── database.js              → Exportação do pool do banco
│   └── storage.js               → Integração com Supabase Storage
│
├── middlewares/
│   ├── authMiddleware.js        → Proteção de páginas e APIs
│   ├── errorMiddleware.js       → Tratamento global de erros
│   └── rateLimitMiddleware.js   → Limitação de tentativas de login
│
├── private/
│   ├── main.html
│   ├── buscar.html
│   ├── postar.html
│   ├── perfil.html
│   ├── editar-post.html
│   └── editar-perfil.html
│
├── public/
│   ├── css/                     → Estilos da aplicação
│   ├── img/                     → Imagens estáticas
│   ├── js/                      → Scripts do frontend
│   ├── legal/                   → Páginas legais
│   ├── cadastro.html
│   ├── cadastroLoja.html
│   └── index.html
│
├── routes/
│   ├── authRoutes.js            → Rotas de autenticação
│   ├── legalRoutes.js           → Rotas das políticas legais
│   ├── pageRoutes.js            → Rotas das páginas privadas
│   ├── perfilRoutes.js          → Rotas de perfil
│   └── postRoutes.js            → Rotas de publicações
│
├── services/
│   └── authService.js           → Regras de autenticação e persistência
│
├── tests/
│   ├── helpers/
│   ├── integration/
│   ├── unit/
│   └── server.test.js
│
├── utils/
│   └── imagem.js                → Validação e extensão de imagens
│
├── validators/
│   ├── authValidator.js         → Validações de cadastro e login
│   └── contentValidator.js      → Lista de palavras proibidas
│
├── server.js                    → Inicialização do servidor Express
├── package.json
├── package-lock.json
├── .gitignore
└── .env                         → Variáveis locais não versionadas
```

---

## Banco de dados

O projeto utiliza PostgreSQL, hospedado atualmente no Supabase.

### Tabela `contas`

Campos principais:

- `id`
- `tipo`
- `nome`
- `email`
- `senha`
- `contato`
- `bairro`
- `categoria`
- `foto`
- `created_at`

Tipos de conta:

```text
usuario
loja
admin
```

A área administrativa ainda não foi implementada.

### Tabela `posts`

Campos principais:

- `id`
- `conta_id`
- `tipo`
- `titulo`
- `bairro`
- `descricao`
- `whatsapp`
- `foto`
- `created_at`

A coluna `conta_id` possui relação com `contas(id)` e exclusão em cascata.

### Tabela `sessions`

Usada pelo `connect-pg-simple` para armazenar as sessões autenticadas.

### Migration

Execute o arquivo abaixo no SQL Editor do Supabase:

```text
database/migrations/001_initial.sql
```

---

## Supabase Storage

O sistema utiliza dois buckets:

```text
perfil
posts
```

### Bucket `perfil`

Armazena fotos de perfil.

### Bucket `posts`

Armazena imagens das publicações.

As políticas de acesso do Storage devem permitir que o servidor faça upload, leitura pública dos arquivos e remoção das imagens antigas.

---

## Validações de autenticação

As validações estão centralizadas em:

```text
validators/authValidator.js
```

### Cadastro de usuário

| Campo | Regra |
|---|---|
| Nome | Entre 2 e 80 caracteres |
| Email | Máximo de 254 caracteres e formato válido |
| Senha | Mínimo de 8 e máximo de 72 bytes |
| Senha | Deve conter letra, número e caractere especial |

### Cadastro de loja

| Campo | Regra |
|---|---|
| Nome da loja | Entre 2 e 100 caracteres |
| Email | Máximo de 254 caracteres e formato válido |
| Senha | Mínimo de 8 e máximo de 72 bytes |
| Contato | 10 ou 11 dígitos após normalização |
| Bairro | Entre 2 e 60 caracteres |
| Categoria | Deve pertencer à lista permitida |

Categorias aceitas pelo backend:

```text
Alimentação
Roupas
Serviços
Mercado
Construção
Outros
```

O formulário atual apresenta principalmente:

```text
Alimentação
Roupas
Serviços
Mercado
Outros
```

### Login

O login valida:

- Email obrigatório.
- Email em formato válido.
- Senha obrigatória.
- Senha com limite máximo de 72 bytes.

A complexidade da senha é exigida no cadastro, não repetida durante o login.

---

## Rotas principais

### Autenticação

| Método | Rota | Finalidade |
|---|---|---|
| `POST` | `/cadastrar` | Cadastro de usuário |
| `POST` | `/cadastrar-loja` | Cadastro de loja |
| `POST` | `/login` | Login |
| `POST` | `/logout` | Logout |
| `GET` | `/me` | Dados da conta autenticada |

### Perfil

| Método | Rota | Finalidade |
|---|---|---|
| `GET` | `/perfil` | Página HTML do perfil |
| `GET` | `/api/perfil` | Consulta JSON do perfil |
| `PUT` | `/perfil` | Atualização do perfil e foto |

### Publicações

| Método | Rota | Finalidade |
|---|---|---|
| `GET` | `/posts` | Listagem e filtros |
| `POST` | `/posts` | Criar publicação |
| `GET` | `/posts/:id` | Buscar publicação própria |
| `PUT` | `/posts/:id` | Editar publicação própria |
| `DELETE` | `/posts/:id` | Excluir publicação própria |
| `GET` | `/carregarPosts` | Listar publicações da conta |

### Páginas privadas

| Rota | Página |
|---|---|
| `/main` | Feed principal |
| `/buscar` | Busca de publicações |
| `/postar` | Nova publicação |
| `/perfil` | Perfil |
| `/editar-post` | Edição de publicação |
| `/editar-perfil` | Edição do perfil |

### Páginas legais

| Rota | Conteúdo |
|---|---|
| `/termos` | Termos de Uso |
| `/privacidade` | Política de Privacidade |
| `/conteudo` | Política de Conteúdo |
| `/isencao` | Isenção de Responsabilidade |
| `/cookies` | Política de Cookies |

---

## Como executar localmente

### 1. Clonar o projeto

```bash
git clone https://github.com/eduardow890-droid/ObrasViegas.git
cd ObrasViegas
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
SESSION_SECRET=sua_chave_secreta_longa
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_KEY=sua_chave_do_supabase
DATABASE_URL=postgresql://usuario:senha@host:porta/banco
NODE_ENV=development
PORT=3000
```

O arquivo `.env` não deve ser enviado ao GitHub.

### 4. Configurar o banco

Execute:

```text
database/migrations/001_initial.sql
```

no SQL Editor do Supabase ou em um PostgreSQL de teste.

### 5. Iniciar o servidor

```bash
npm start
```

Acesse:

```text
http://localhost:3000
```

O projeto não possui atualmente o script `npm run dev`.

---

## Scripts disponíveis

```bash
npm start
```

Inicia o servidor.

```bash
npm test
```

Executa todos os testes.

```bash
npm run test:unit
```

Executa testes unitários sem depender de banco externo.

```bash
npm run test:integration
```

Executa testes de integração com PostgreSQL.

Para obrigar a execução real dos testes de integração:

```bash
REQUIRE_TEST_DB=1 npm run test:integration
```

Os testes de integração criam e removem contas e publicações. Use sempre um banco de testes separado da produção.

---

## Limitações atuais dos testes

A suíte atual possui:

- Testes unitários dos validadores.
- Testes unitários do Storage.
- Testes de rotas HTTP.
- Fluxo de usuário.
- Fluxo de loja.
- Testes de sessão e autorização.

Ainda não existem testes automatizados de navegador com Playwright ou Cypress. Portanto, os seguintes itens ainda precisam ser validados manualmente:

- Aparência do banner de cookies.
- Interação dos botões de consentimento.
- Upload visual de imagens.
- Modais e toasts.
- Navegação completa pelo navegador.
- Compatibilidade entre navegadores.

---

## Operação por tipo de conta

### Usuário

Após o login, o usuário acessa:

```text
/main
```

Pode criar, editar e excluir seus próprios posts.

### Loja

Após o login, a loja acessa o mesmo feed em:

```text
/main
```

Suas publicações podem aparecer no filtro de lojas, com nome, categoria e bairro comercial.

### Administrador

O tipo `admin` existe no banco, mas ainda não possui painel ou funcionalidades administrativas implementadas.

---

## Procedimento de deploy

Antes de publicar uma nova versão:

1. Execute os testes unitários.
2. Execute os testes de integração com `REQUIRE_TEST_DB=1`.
3. Confirme que o banco de teste está separado do banco de produção.
4. Faça backup do banco.
5. Execute novas migrations antes de publicar código dependente delas.
6. Configure as variáveis no Render.
7. Nunca publique segredos no GitHub.
8. Use `NODE_ENV=production`.
9. Confirme que o cookie de sessão está com `Secure`.
10. Teste login de usuário.
11. Teste login de loja.
12. Teste criação e exclusão de publicações.
13. Teste upload de imagens.
14. Teste aceite e rejeição dos cookies de análise.
15. Confirme que o Google Analytics só é carregado após aceite.
16. Consulte os logs do Render, Supabase e Storage.

---

## Diagnóstico rápido

### Erro de sessão

Verifique:

- `DATABASE_URL`.
- `SESSION_SECRET`.
- Existência da tabela `sessions`.
- Acesso do usuário do banco à tabela.

### Erro nos testes de integração

Execute:

```bash
REQUIRE_TEST_DB=1 npm run test:integration
```

Possíveis causas:

- Banco indisponível.
- Host incorreto.
- Problema de DNS.
- Credenciais inválidas.
- Migration não executada.
- Firewall ou rede bloqueando a conexão.

### Filtro de lojas vazio

Confirme:

- Existência de contas com `tipo = 'loja'`.
- Existência de posts associados.
- Valor correto de `conta_id`.

### Erro ao publicar imagem

Verifique:

- Bucket `posts`.
- Bucket `perfil`.
- `SUPABASE_URL`.
- `SUPABASE_SERVICE_KEY`.
- Limite de 5 MB.
- Formato JPG, PNG ou WEBP.

### Banner de cookies não aparece

Verifique no navegador:

- `localStorage.obrasViegasConsentimentoCookies`.
- Se a escolha anterior está salva como `aceito` ou `rejeitado`.
- Se os arquivos abaixo estão sendo carregados:

```text
/public/js/cookie-consent.js
/public/css/cookie-consent.css
```

Para exibir o banner novamente, remova a chave do `localStorage`.

---

## Variáveis de ambiente

| Variável | Obrigatória | Descrição |
|---|---|---|
| `SESSION_SECRET` | Sim | Chave usada para assinar sessões |
| `SUPABASE_URL` | Sim para imagens | URL do projeto Supabase |
| `SUPABASE_SERVICE_KEY` | Sim para imagens | Chave privada do Storage |
| `DATABASE_URL` | Sim | Connection string do PostgreSQL |
| `NODE_ENV` | Recomendado | `development` ou `production` |
| `PORT` | Não | Porta do servidor; padrão `3000` |
| `REQUIRE_TEST_DB` | Apenas testes | Quando `1`, falha se o banco de teste estiver indisponível |

---

## Documentação legal

A documentação está disponível em:

```text
docs/termos-de-uso.md
docs/politica-de-privacidade.md
docs/politica-de-cookies.md
docs/politica-de-conteudo.md
docs/isencao-de-responsabilidade.md
```

Também está disponível no navegador pelas rotas:

```text
/termos
/privacidade
/cookies
/conteudo
/isencao
```

---

## Licença

Projeto desenvolvido para uso comunitário local.
