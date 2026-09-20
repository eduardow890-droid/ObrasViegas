# Política de Cookies — Obras Viegas

**Data de vigência:** 7 de setembro de 2026

Cookies são pequenos arquivos ou informações armazenadas no navegador ou dispositivo para permitir funcionalidades, manter sessões, lembrar informações ou analisar o uso do site.

## 1. Cookies utilizados

| Cookie | Tipo | Finalidade | Duração |
|---|---|---|---|
| `connect.sid` | Essencial | Manter a sessão de autenticação | Até 24 horas |
| `_ga` | Não essencial | Google Analytics — análise de tráfego | Até 2 anos |
| `_gid` | Não essencial | Google Analytics — análise de tráfego | Até 24 horas |

As durações podem variar conforme a configuração técnica e alterações dos fornecedores.

## 2. Cookies essenciais

O cookie `connect.sid` identifica a sessão autenticada. Sem ele, funcionalidades como permanecer conectado podem não funcionar. Na configuração atual, a sessão usa `HttpOnly`, `SameSite=Lax`, `Secure` em produção e validade máxima de 24 horas.

## 3. Google Analytics

O Obras Viegas utiliza o Google Analytics para obter estatísticas sobre páginas acessadas, navegação, quantidade de acessos, desempenho e informações técnicas. A configuração deve buscar reduzir informações pessoais desnecessárias e observar a legislação aplicável.

O Analytics não é inicializado antes da escolha do usuário. O banner de consentimento oferece as opções **Aceitar análise** e **Rejeitar análise**. Ao aceitar, os scripts do Google Analytics podem ser carregados e os cookies de análise podem ser criados. Ao rejeitar, o Analytics permanece desabilitado.

A escolha é armazenada no `localStorage` do navegador com a chave `obrasViegasConsentimentoCookies`. Esse registro não é usado para rastreamento; ele apenas evita exibir novamente o banner e conserva a preferência do usuário.

## 4. Controle pelo navegador

O usuário pode controlar ou excluir cookies e dados locais nas configurações de privacidade do Chrome, Firefox, Safari ou outro navegador. Também pode apagar o registro de consentimento para que o banner seja exibido novamente.

O bloqueio do cookie essencial `connect.sid` pode impedir login, permanência da sessão e acesso às áreas autenticadas do Obras Viegas.

## 5. Alterações e contato

Esta Política poderá ser atualizada quando houver mudanças nos serviços, na tecnologia ou na legislação. A versão vigente ficará disponível na plataforma.

**Contato:** wagner.eduardo2025@outlook.com
