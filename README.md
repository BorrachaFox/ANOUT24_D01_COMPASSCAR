# ANOUT24_D01_COMPASSCAR
Este projeto é uma API de gestão de carros para a locadora CompassCar, oferece funcionalidades de CRUD (Criar, Ler, Atualizar e Excluir) para gerenciar o cadastro de veículos em um banco de dados MySQL.

## Tecnologias

- **Node.js** - Ambiente de execução JavaScript.
- **Express** - Framework para construir a API.
- **Jest** - Framework de testes.
- **MySQL2** - Conector para MySQL.
- **ESLint** - Linter para código JavaScript.
- **Prettier** - Ferramenta para formatar código.

## Pré-requisitos

Antes de começar, você precisa ter instalado em sua máquina as seguintes ferramentas:

- [Node.js](https://nodejs.org/) (inclui o npm)
- [MySQL](https://www.mysql.com/)

### 1. Clonando o Repositório

Primeiro, clone o repositório para o seu computador. Abra o terminal (ou prompt de comando) e execute:

```bash
git clone git@github.com:BorrachaFox/ANOUT24_D01_COMPASSCAR.git
```

### 2. Instalando Dependências
Dentro da pasta do projeto, instale todas as dependências necessárias com o comando:
```bash
cd anout24_d01_compasscar
npm install
```

### 3. Configurando o Banco de Dados
Você precisará configurar o banco de dados MySQL para que a API funcione corretamente.

Crie um banco de dados no MySQL com o nome de sua escolha. Por exemplo, no MySQL CLI, execute:
```sql
CREATE DATABASE compasscar;
```

### 4. Configuração das Variáveis de Ambiente

Crie um arquivo ```.env``` na raiz do projeto e defina as variáveis de ambiente necessárias, incluindo as configurações do banco de dados:
```
SERVER_PORT=3001  # Opcional: se não for configurado, usará a porta padrão 3001

DATABASE_HOST=localhost
DATABASE_USER=root
DATABASE_PASSWORD=password
DATABASE_NAME=compasscar
```

### 5. Executando as Migrações
Execute a migração para criar as tabelas no banco de dados:
```bash
npm run migrate
```

### 6. Iniciando o Servidor
Por padrão, o servidor estará disponível no endereço ```http://localhost:3001```.
```bash
npm start
```

### 7. Testando a API
Este projeto utiliza o Jest para testes. Para rodar os testes, execute o seguinte comando:
```bash
npm test
```
