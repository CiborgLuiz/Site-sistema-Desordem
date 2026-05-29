#!/bin/bash

# Script de setup local do Desordem Fichas

echo "🚀 Iniciando setup do Desordem Fichas"
echo ""

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não está instalado. Visite https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js detectado: $(node --version)"
echo ""

# Verificar se npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm não está instalado."
    exit 1
fi

echo "✅ npm detectado: $(npm --version)"
echo ""

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Erro ao instalar dependências."
    exit 1
fi

echo "✅ Dependências instaladas com sucesso"
echo ""

# Criar arquivo .env.local se não existir
if [ ! -f .env.local ]; then
    echo "📝 Criando arquivo .env.local"
    cp .env.example .env.local
    echo ""
    echo "⚠️  Configure suas credenciais Supabase em .env.local:"
    echo "   SUPABASE_URL=https://seu-projeto.supabase.co"
    echo "   SUPABASE_ANON_KEY=sua-chave-anonima"
else
    echo "✅ Arquivo .env.local já existe"
fi

echo ""
echo "✨ Setup concluído!"
echo ""
echo "Próximos passos:"
echo "1. Configure .env.local com suas credenciais Supabase"
echo "2. Execute 'npm start' para iniciar o servidor"
echo "3. Abra http://localhost:3000 no navegador"
echo ""
echo "📖 Para mais informações, veja o README.md"
