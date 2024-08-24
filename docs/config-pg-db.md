
# Configuração do Banco de Dados PostgreSQL no Docker

Este guia descreve os passos para criar um banco de dados PostgreSQL dentro de um contêiner Docker e configurar as credenciais de acesso.

## 1. Acessando o Contêiner

Para acessar o terminal interativo do PostgreSQL dentro do contêiner, execute o seguinte comando:

```bash
docker exec -it pg-database psql -U postgres
```

## 2. Criando o Usuário e o Banco de Dados

Dentro do terminal do PostgreSQL, crie o usuário, o banco de dados e configure os privilégios executando os seguintes comandos:

```sql
CREATE USER admin WITH PASSWORD 'admin';
CREATE DATABASE simulnem;
GRANT ALL PRIVILEGES ON DATABASE simulnem TO admin;
```

### O que esses comandos fazem:

- `CREATE USER admin WITH PASSWORD 'admin';`: Cria o usuário `admin` com a senha `admin`.
- `CREATE DATABASE simulnem;`: Cria o banco de dados `simulnem`.
- `GRANT ALL PRIVILEGES ON DATABASE simulnem TO admin;`: Concede todos os privilégios do banco de dados `simulnem` ao usuário `admin`.

## 3. Saindo do Terminal do PostgreSQL

Para sair do terminal do PostgreSQL, digite:

```sql
\q
```

## 4. Conectando-se ao Banco de Dados

Após a configuração, você pode se conectar ao banco de dados `simulnem` utilizando a seguinte string de conexão:

```plaintext
postgresql://admin:admin@pg-database:5432/simulnem
```

Este banco de dados agora está pronto para ser usado com as credenciais especificadas.
