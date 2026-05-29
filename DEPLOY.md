# 🚀 Guia de Deploy - Vercel + Supabase

Este guia passo-a-passo irá ajudá-lo a fazer deploy da aplicação Desordem Fichas no Vercel.

## 📋 Pré-requisitos

- [ ] Conta GitHub (gratuita)
- [ ] Conta Vercel (gratuita)
- [ ] Conta Supabase (gratuita)
- [ ] Este repositório clonado/forked no GitHub

## 🔧 Passo 1: Preparar Supabase

### 1.1 Criar Projeto Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Clique em **Start your project**
3. Faça login com GitHub ou e-mail
4. Clique em **New project**
5. Preencha:
   - **Name**: `desordem-fichas` (ou outro nome)
   - **Database Password**: Crie uma senha forte
   - **Region**: Selecione a mais próxima (`São Paulo` se disponível)
6. Clique em **Create new project**
7. Aguarde a criação (pode levar alguns minutos)

### 1.2 Obter Credenciais

1. Após a criação, vá para **Project Settings** (ícone de engrenagem)
2. Clique em **API** no menu esquerdo
3. Copie os seguintes valores:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** → `SUPABASE_ANON_KEY`

Guarde esses valores com segurança!

### 1.3 Criar a Tabela

1. No Supabase, clique em **SQL Editor** (ícone de banco de dados)
2. Clique em **New Query**
3. Copie e cole o conteúdo do arquivo `setup-supabase.sql`
4. Clique em **Run** (ícone de play)
5. Verifique se a tabela foi criada em **Table Editor**

## 📦 Passo 2: Preparar o Repositório

### 2.1 Fazer Push para GitHub

```bash
# Navegue até a pasta do projeto
cd '/home/ciborg/Área de trabalho/Melhor rpg/Desordem/site ficha'

# Inicialize git (se ainda não estiver)
git init
git add .
git commit -m "initial commit: desordem fichas com supabase"

# Se usando GitHub CLI
gh repo create desordem-fichas --source=. --remote=origin --push
```

### 2.2 Alternativa: Fork no GitHub

Se você prefere fazer fork primeiro:

1. Acesse este repositório no GitHub
2. Clique em **Fork**
3. Clone seu fork:
   ```bash
   git clone https://github.com/SEU-USUARIO/desordem-fichas.git
   ```

## 🚀 Passo 3: Deploy no Vercel

### 3.1 Conectar ao Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Clique em **Sign Up** ou **Sign In**
3. Autentique com sua conta GitHub
4. Clique em **Add New** → **Project**
5. Clique em **Continue with GitHub**
6. Selecione seu repositório `desordem-fichas`
7. Clique em **Import**

### 3.2 Configurar Variáveis de Ambiente

Na página de configuração do Vercel:

1. Procure por **Environment Variables**
2. Adicione as seguintes variáveis:

| Nome | Valor |
|------|-------|
| `SUPABASE_URL` | Cole a URL que copiou de Supabase |
| `SUPABASE_ANON_KEY` | Cole a chave anon que copiou de Supabase |

3. Clique em **Deploy**

### 3.3 Aguardar Deploy

O Vercel começará o build automaticamente. Você verá:

- ✅ **Building** → Construindo o projeto
- ✅ **Ready** → Deploy realizado com sucesso

## ✅ Verificar Deploy

1. Vercel fornecerá uma URL como `https://seu-projeto.vercel.app`
2. Acesse essa URL no navegador
3. Você deve ver a página inicial do Desordem Fichas
4. Teste criando uma ficha

## 🐛 Troubleshooting

### Erro: "Banco de dados não disponível"

**Causa**: Variáveis de ambiente não configuradas corretamente.

**Solução**:
1. Vá para Vercel Settings → Environment Variables
2. Verifique se `SUPABASE_URL` e `SUPABASE_ANON_KEY` estão corretas
3. Clique em **Redeploy** na página do projeto

### Erro: "Table 'sheets' doesn't exist"

**Causa**: A tabela não foi criada no Supabase.

**Solução**:
1. Abra Supabase SQL Editor
2. Execute o script `setup-supabase.sql` novamente
3. Verifique se a tabela aparece em **Table Editor**

### Deploy falha no Vercel

**Causa**: Dependências não instaladas ou erro de sintaxe.

**Solução**:
1. Abra o **Build Log** no Vercel
2. Procure por mensagens de erro (em vermelho)
3. Localmente, execute:
   ```bash
   npm install
   npm start
   ```
4. Se funcionar localmente, faça git push das correções

## 📱 Usar o Sistema

Após o deploy bem-sucedido:

1. **Criar Ficha**: Clique em "Nova Ficha"
2. **Editar**: Selecione uma ficha na lista
3. **Compartilhar**: A URL do seu site (ex: `seu-projeto.vercel.app`) pode ser compartilhada
4. **Sincronização**: Qualquer pessoa que acesse terá acesso às mesmas fichas

## 🔄 Atualizações

Para fazer atualizações no seu deploy:

```bash
# Faça suas mudanças localmente
git add .
git commit -m "sua mensagem"
git push

# Vercel fará redeploy automaticamente
# Aguarde a notificação de sucesso
```

## 💡 Dicas

- **Backup**: Exporte suas fichas do Supabase regularmente
- **Performance**: Supabase free tem limites; para produção, considere upgrade
- **Privacidade**: Row Level Security está habilitada mas é pública (ajuste conforme necessário)

## 🆘 Suporte

Para problemas com:

- **Supabase**: Visite [supabase.com/docs](https://supabase.com/docs)
- **Vercel**: Visite [vercel.com/docs](https://vercel.com/docs)
- **Node.js**: Visite [nodejs.org/docs](https://nodejs.org/docs)

---

**Parabéns!** Seu sistema de fichas está no ar! 🎉
