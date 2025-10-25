# DuskPet API - Sistema de Gestão Veterinária

## 🚀 Tecnologias
- Node.js + Express
- PostgreSQL + Prisma ORM
- JWT Authentication
- bcryptjs

## 📋 Autenticação

### Cliente
- `POST /register` - Cadastro (name, phone, email, password)
- `POST /login` - Login (email, password)

### Admin
- `POST /admin/login` - Login admin (email, senha)

### Atendente
- `POST /atendente/login` - Login atendente (email, senha)

---

## 🔒 Rotas Protegidas (Requer `Authorization: Bearer {token}`)

### Perfil
- `GET /protected/profile` - Buscar perfil
- `PUT /protected/profile` - Atualizar perfil

### Pets
- `POST /protected/pets` - Criar pet
- `GET /protected/pets` - Listar pets
- `GET /protected/pets/:id` - Detalhes do pet
- `PUT /protected/pets/:id` - Atualizar pet
- `DELETE /protected/pets/:id` - Deletar pet

### Agendamentos
- `POST /protected/agendamentos` - Criar agendamento
- `GET /protected/agendamentos` - Listar agendamentos
- `GET /protected/agendamentos/:id` - Detalhes do agendamento
- `PUT /protected/agendamentos/:id` - Atualizar agendamento
- `PATCH /protected/agendamentos/:id/cancel` - Cancelar agendamento
- `GET /protected/agendamentos/horarios-disponiveis` - Verificar disponibilidade

### Histórico Clínico
- `POST /protected/historicos` - Criar histórico
- `GET /protected/historicos/pet/:pet_id` - Históricos do pet
- `GET /protected/historicos/pet/:pet_id/completo` - Histórico completo
- `GET /protected/historicos/:id` - Detalhes do histórico
- `PUT /protected/historicos/:id` - Atualizar histórico
- `DELETE /protected/historicos/:id` - Deletar histórico

### Produtos
- `GET /protected/produtos` - Listar produtos
- `GET /protected/produtos/:id` - Detalhes do produto
- `POST /protected/produtos` - Criar produto
- `PUT /protected/produtos/:id` - Atualizar produto
- `DELETE /protected/produtos/:id` - Deletar produto
- `PATCH /protected/produtos/:id/ajustar-estoque` - Ajustar estoque
- `GET /protected/produtos/relatorio/estoque` - Relatório de estoque

---

## 👨‍💼 Rotas Admin (Requer token Admin)

### Dashboard
- `GET /admin/dashboard` - Estatísticas gerais

### Veterinários
- `POST /admin/veterinarios` - Criar veterinário
- `GET /admin/veterinarios` - Listar veterinários
- `PUT /admin/veterinarios/:id` - Atualizar veterinário
- `DELETE /admin/veterinarios/:id` - Deletar veterinário

### Clientes
- `GET /admin/clientes` - Listar todos os clientes
- `GET /admin/clientes/:id` - Detalhes do cliente

### Relatórios
- `GET /admin/relatorio` - Relatório geral (query: dataInicio, dataFim)

---

## 👥 Rotas Atendente (Requer token Atendente ou Admin)

### Clientes
- `GET /atendente/clientes` - Listar clientes (query: busca)
- `GET /atendente/clientes/:id` - Detalhes do cliente

### Agendamentos
- `GET /atendente/agendamentos` - Listar agendamentos (query: data, status, veterinario_id)
- `PATCH /atendente/agendamentos/:id/status` - Atualizar status

### Outros
- `GET /atendente/veterinarios` - Listar veterinários
- `GET /atendente/produtos` - Listar produtos

---

## 🌐 Rotas Públicas

### Veterinários
- `GET /veterinarios` - Listar veterinários (query: especialidade)
- `GET /veterinarios/:id` - Detalhes do veterinário

---

## ⚙️ Instalação

```bash
npm install
npx prisma migrate dev
npm start
```

## 🧪 Testes

```bash
node test/api.test.js
node test/pets.test.js
node test/agendamentos.test.js
node test/historicos.test.js
node test/produtos.test.js
node test/admin.test.js
```