# DuskPet API - Documentação

## Endpoints

### Autenticação de Usuário

#### `POST /login`
Realiza login de clientes.

**Body:**
```json
{
  "email": "usuario@email.com",
  "password": "senha"
}
```
**Resposta:**
```json
{
  "token": "JWT_TOKEN"
}
```

#### `POST /login/admin`
Realiza login de administradores.

**Body:**
```json
{
  "email": "admin@email.com",
  "password": "senha"
}
```
**Resposta:**
```json
{
  "token": "JWT_TOKEN"
}
```

---

### Cadastro de Usuário

#### `POST /register`
Realiza o cadastro de um novo cliente.

**Body:**
```json
{
  "name": "Nome do Cliente",
  "phone": "11999999999",
  "email": "cliente@email.com",
  "password": "senha"
}
```
**Resposta:**
```json
{
  "token": "JWT_TOKEN"
}
```

---

## Observações

- Todos os endpoints retornam erros em formato JSON.
- O token JWT deve ser utilizado para autenticação em rotas protegidas (quando implementadas).
- Campos obrigatórios estão descritos nos exemplos de body.

---