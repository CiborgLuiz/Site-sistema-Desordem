# 📋 Desordem - Sistema de Fichas

Sistema de gerenciamento de fichas de personagem para o RPG Desordem, com armazenamento em banco de dados Supabase e suporte para deploy rápido no Vercel.

## ✨ Características

- 📄 Criação e edição de fichas de personagem
- 🎮 Sistema de atributos, perícias e recursos dinâmicos
- 📚 Biblioteca compartilhada de itens, magias e técnicas
- ☁️ Sincronização em tempo real via Supabase
- 🚀 Deploy simples no Vercel (sem servidor para configurar)
- 💾 Fallback para armazenamento local se o servidor estiver indisponível

## 🚀 Deploy no Vercel (Recomendado)

### Pré-requisitos

1. **Conta Supabase** (gratuita)
   - Acesse [supabase.com](https://supabase.com)
   - Crie um novo projeto
   - Copie a URL e a chave anon (Anonymous Key)

2. **Conta Vercel** (gratuita)
   - Acesse [vercel.com](https://vercel.com)
   - Conecte com sua conta GitHub

3. **Repositório Git**
   - Este projeto já é um repositório

### Passo a Passo

#### 1. Preparar Supabase

1. Acesse sua conta Supabase
2. Vá em **Project Settings** → **API**
3. Copie:
   - `Project URL` → `SUPABASE_URL`
   - `anon public` → `SUPABASE_ANON_KEY`

4. Crie a tabela de fichas no SQL Editor:

```sql
CREATE TABLE sheets (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sheets_updated_at ON sheets(updatedAt DESC);
```

#### 2. Deploy no Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Clique em **Add New** → **Project**
3. Selecione seu repositório GitHub
4. Configure as variáveis de ambiente:
   - `SUPABASE_URL` = sua URL do Supabase
   - `SUPABASE_ANON_KEY` = sua chave anon
5. Clique em **Deploy**

Pronto! Seu site estará disponível em `https://seu-projeto.vercel.app`

## 💻 Desenvolvimento Local

### Pré-requisitos

- Node.js 16+
- npm ou yarn

### Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/desordem-fichas.git
cd desordem-fichas

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais Supabase
```

### Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-chave-anonima
PORT=3000
NODE_ENV=development
```

### Executar Localmente

```bash
npm start
```

O servidor iniciará em `http://localhost:3000`

## 📱 Como Usar

### Criar uma Nova Ficha

1. Clique em **Nova Ficha**
2. Preencha o nome do personagem, classe e descrição
3. Clique em **Criar**

### Editar Ficha

1. Selecione a ficha na lista inicial
2. Modifique os atributos, perícias e equipamentos
3. As mudanças são salvas automaticamente

### Biblioteca

- **Itens**: Equipamentos, armas, armaduras
- **Magias**: Magias arcanas (Mago/Híbrido)
- **Ki**: Técnicas de ki (Ki/Híbrido)

## 🏗️ Arquitetura

```
desordem-fichas/
├── app.js                 # Aplicação browser (SPA)
├── server.js              # Backend Node.js + Express
├── index.html             # Página principal
├── styles.css             # Estilos
├── package.json           # Dependências npm
├── vercel.json           # Config Vercel
├── .env.example          # Template variáveis
└── Sistema/              # Dados da wiki
```

### Fluxo de Dados

```
Browser (app.js)
    ↓ (fetch)
Server (server.js)
    ↓ (SQL)
Supabase (banco de dados)
```

## 🔄 Sincronização

- **Criação/Edição**: Salva automaticamente a cada mudança (com debounce de 350ms)
- **Fallback**: Se o Supabase estiver offline, usa `localStorage`
- **Compatibilidade**: Suporta múltiplos dispositivos/navegadores

## 📦 APIs

### GET `/api/sheets`
Lista todas as fichas

**Resposta:**
```json
[
  {
    "id": "123abc",
    "name": "Aragorn",
    "className": "Mago",
    "level": 15,
    ...
  }
]
```

### GET `/api/sheets/:id`
Obtém uma ficha específica

### PUT `/api/sheets/:id`
Atualiza uma ficha

### POST `/api/sheets/:id`
Cria uma ficha

### DELETE `/api/sheets/:id`
Deleta uma ficha

## 🐛 Troubleshooting

### "Banco de dados não disponível"
- Verifique as variáveis de ambiente no Vercel
- Teste a conexão com Supabase localmente
- Verifique se a chave anon está correta

### Mudanças não são salvas
- Verifique a aba Network no DevTools
- Confirme que `SUPABASE_ANON_KEY` está configurada
- Verifique o console do browser para erros

### Vercel retorna 502
- Verifique os logs do Vercel
- Confirme que `server.js` está exportando a aplicação Express
- Reinicie o deployment

## 📄 Licença

Este projeto usa dados do sistema Desordem. Respeite os direitos autorais.

## 🤝 Contribuindo

Relatório de bugs e sugestões são bem-vindos! Abra uma issue no GitHub.

## 👤 Autor

Desenvolvido para a comunidade Desordem RPG.

---

**Dica**: Para suporte técnico sobre Supabase, visite [supabase.com/docs](https://supabase.com/docs)
