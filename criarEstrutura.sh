#!/bin/bash

# ==============================================================================
# Script para criação da estrutura do projeto Biblioteca
# ==============================================================================

echo "Criando diretórios do projeto..."

# Estrutura Backend (MVC)
mkdir -p backend/controllers
mkdir -p backend/routes

# Estrutura Frontend
mkdir -p frontend/menu
mkdir -p frontend/autor
mkdir -p frontend/editora
mkdir -p frontend/livro
mkdir -p frontend/ficha_catalografica

# Pasta para Imagens
mkdir -p imagens

echo "Criando arquivos do Backend (vazios)..."
touch backend/server.js
touch backend/database.js
touch backend/controllers/autorController.js
touch backend/controllers/editoraController.js
touch backend/controllers/livroController.js
touch backend/controllers/fichaCatalograficaController.js
touch backend/routes/autorRoutes.js
touch backend/routes/editoraRoutes.js
touch backend/routes/livroRoutes.js
touch backend/routes/fichaCatalograficaRoutes.js

echo "Criando arquivos do Frontend (vazios)..."
touch frontend/menu/menu.html
touch frontend/menu/menu.css
touch frontend/menu/menu.js

touch frontend/autor/autor.html frontend/autor/autor.css frontend/autor/autor.js
touch frontend/editora/editora.html frontend/editora/editora.css frontend/editora/editora.js
touch frontend/livro/livro.html frontend/livro/livro.css frontend/livro/livro.js
touch frontend/ficha_catalografica/ficha_catalografica.html frontend/ficha_catalografica/ficha_catalografica.css frontend/ficha_catalografica/ficha_catalografica.js

touch index.html

echo "Criando arquivos de configuração (vazios)..."
touch .env
touch package.json
touch README.md

echo "Estrutura criada com sucesso!"
