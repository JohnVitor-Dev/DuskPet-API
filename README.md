# DuskPet API - Sistema de Gestão Veterinária

## 🚀 Tecnologias
- Node.js + Express
- PostgreSQL + Prisma ORM
- JWT Authentication
- bcryptjs

## 📋 Autenticação

### Cliente
- POST `/register`
	- Body: { name, phone, email, password }
	- Exemplo (JSON):
		```json
		{
			"name": "Maria Silva",
			"phone": "11999999999",
			"email": "maria@example.com",
			"password": "SenhaFort3"
		}
		```
- POST `/login`
	- Body: { email, password }
	- Exemplo (JSON):
		```json
		{
			"email": "maria@example.com",
			"password": "SenhaFort3"
		}
		```

### Admin
- POST `/admin/login`
	- Body: { email, password }
	- Exemplo (JSON):
		```json
		{
			"email": "admin@duskpet.com",
			"password": "Admin123"
		}
		```

### Atendente
- POST `/atendente/login`
	- Body: { email, senha }
	- Exemplo (JSON):
		```json
		{
			"email": "atendente@duskpet.com",
			"senha": "atendente123"
		}
		```

---

## 🔒 Rotas Protegidas (Requer cabeçalho `Authorization: Bearer {token}`)

### Perfil
- GET `/protected/profile` — Buscar perfil do cliente logado
	- Headers: Authorization
- PUT `/protected/profile` — Atualizar perfil
	- Headers: Authorization
	- Body (qualquer campo é opcional): { name, email, phone, password }
	- Exemplo (JSON):
		```json
		{
			"name": "Maria A. Silva",
			"phone": "+55 11 98888-7777"
		}
		```

### Pets
- POST `/protected/pets` — Criar pet
	- Headers: Authorization
	- Body: { nome, especie, raca?, sexo? ["Macho"|"Fêmea"], data_nascimento? (ISO) }
	- Upload opcional: `imagem` (multipart/form-data)
	- Exemplo (JSON):
		```json
		{
			"nome": "Rex",
			"especie": "Cachorro",
			"raca": "Golden Retriever",
			"sexo": "Macho",
			"data_nascimento": "2020-05-15"
		}
		```
- GET `/protected/pets` — Listar pets do cliente
	- Headers: Authorization
- GET `/protected/pets/:id` — Detalhes do pet (do próprio cliente)
	- Headers: Authorization
	- Params: { id }
- GET `/protected/pets/:id/imagem` — Retorna a imagem do pet (se existir)
	- Headers: Authorization
	- Params: { id }
- PUT `/protected/pets/:id` — Atualizar pet
	- Headers: Authorization
	- Params: { id }
	- Body (opcionais): { nome, especie, raca, sexo, data_nascimento }
	- Upload opcional: `imagem` (multipart/form-data)
	- Exemplo (JSON):
		```json
		{
			"nome": "Rex Atualizado",
			"raca": "Labrador"
		}
		```
- DELETE `/protected/pets/:id` — Deletar pet
	- Headers: Authorization
	- Params: { id }

### Agendamentos
- GET `/protected/agendamentos/horarios-disponiveis` — Verificar disponibilidade
	- Headers: Authorization
	- Query: { veterinario_id, data (YYYY-MM-DD) }
- POST `/protected/agendamentos` — Criar agendamento
	- Headers: Authorization
	- Body: { pet_id, veterinario_id, data_hora (ISO), tipo_consulta? }
	- Exemplo (JSON):
		```json
		{
			"pet_id": 12,
			"veterinario_id": 3,
			"data_hora": "2025-11-05T10:00:00.000Z",
			"tipo_consulta": "Consulta de rotina"
		}
		```
- GET `/protected/agendamentos` — Listar agendamentos do cliente
	- Headers: Authorization
	- Query (opcionais): { status, pet_id }
- GET `/protected/agendamentos/:id` — Detalhes do agendamento
	- Headers: Authorization
	- Params: { id }
- PUT `/protected/agendamentos/:id` — Atualizar agendamento
	- Headers: Authorization
	- Params: { id }
	- Body (opcionais): { data_hora (ISO), tipo_consulta, status }
	- Exemplo (JSON):
		```json
		{
			"tipo_consulta": "Consulta de emergência",
			"status": "Conclu_do"
		}
		```
- PATCH `/protected/agendamentos/:id/cancel` — Cancelar agendamento
	- Headers: Authorization
	- Params: { id }
	- Exemplo (JSON):
		```json
		{}
		```

### Histórico Clínico
- POST `/protected/historicos` — Criar histórico
	- Headers: Authorization
	- Body: { pet_id, agendamento_id?, vacinas?, doencas_alergias?, medicamentos?, observacoes? }
	- Exemplo (JSON):
		```json
		{
			"pet_id": 12,
			"agendamento_id": 45,
			"vacinas": "V10, Antirrábica",
			"doencas_alergias": "Nenhuma",
			"medicamentos": "Vermífugo",
			"observacoes": "Animal saudável"
		}
		```
- GET `/protected/historicos/pet/:pet_id` — Listar históricos do pet
	- Headers: Authorization
	- Params: { pet_id }
- GET `/protected/historicos/pet/:pet_id/completo` — Histórico completo do pet
	- Headers: Authorization
	- Params: { pet_id }
- GET `/protected/historicos/:id` — Detalhes do histórico
	- Headers: Authorization
	- Params: { id }
- PUT `/protected/historicos/:id` — Atualizar histórico
	- Headers: Authorization
	- Params: { id }
	- Body (opcionais): { vacinas, doencas_alergias, medicamentos, observacoes }
	- Exemplo (JSON):
		```json
		{
			"vacinas": "V10, Antirrábica, Giardíase",
			"observacoes": "Reforço aplicado"
		}
		```
- DELETE `/protected/historicos/:id` — Deletar histórico
	- Headers: Authorization
	- Params: { id }

### Produtos
- GET `/protected/produtos` — Listar produtos
	- Headers: Authorization
	- Query (opcionais): { estoque_baixo=true|false, vencendo=true|false }
- GET `/protected/produtos/:id` — Detalhes do produto
	- Headers: Authorization
	- Params: { id }
- POST `/protected/produtos` — Criar produto
	- Headers: Authorization (token de atendente ou admin)
	- Body: { nome_produto, valor, quantidade?, validade? (ISO) }
	- Exemplo (JSON):
		```json
		{
			"nome_produto": "Ração Premium 15kg",
			"valor": 189.9,
			"quantidade": 50,
			"validade": "2026-12-31"
		}
		```
- PUT `/protected/produtos/:id` — Atualizar produto
	- Headers: Authorization (token de atendente ou admin)
	- Params: { id }
	- Body (opcionais): { nome_produto, valor, quantidade, validade }
	- Exemplo (JSON):
		```json
		{
			"valor": 199.9,
			"quantidade": 45
		}
		```
- PATCH `/protected/produtos/:id/estoque` — Ajustar estoque
	- Headers: Authorization (token de atendente ou admin)
	- Params: { id }
	- Body: { quantidade (int > 0), operacao ["adicionar"|"remover"] }
	- Exemplo (JSON):
		```json
		{
			"quantidade": 10,
			"operacao": "adicionar"
		}
		```
- GET `/protected/produtos/relatorio` — Relatório de estoque
	- Headers: Authorization (token de atendente ou admin)

---

## 👨‍💼 Rotas Admin (Requer token Admin)

### Dashboard
- GET `/admin/dashboard` — Estatísticas gerais
	- Headers: Authorization (admin)

### Veterinários
- POST `/admin/veterinarios` — Criar veterinário
	- Headers: Authorization (admin)
	- Body: { nome, cpf (000.000.000-00), crmv, especialidades: string[], horarios_trabalho? (obj) }
	- Exemplo (JSON):
		```json
		{
			"nome": "Dr. Carlos Silva",
			"cpf": "123.456.789-00",
			"crmv": "SP-12345",
			"especialidades": ["Clínica Geral", "Cirurgia"],
			"horarios_trabalho": {
				"segunda": ["08:00-12:00", "14:00-18:00"]
			}
		}
		```
- GET `/admin/veterinarios` — Listar veterinários
	- Headers: Authorization (admin)
- PUT `/admin/veterinarios/:id` — Atualizar veterinário
	- Headers: Authorization (admin)
	- Params: { id }
	- Body (opcionais): { nome, cpf, crmv, especialidades: string[], horarios_trabalho }
	- Exemplo (JSON):
		```json
		{
			"nome": "Dr. Carlos S. Junior",
			"especialidades": ["Clínica Geral", "Dermatologia"]
		}
		```
- DELETE `/admin/veterinarios/:id` — Deletar veterinário
	- Headers: Authorization (admin)
	- Params: { id }

### Clientes
- GET `/admin/clientes` — Listar clientes
	- Headers: Authorization (admin)
- GET `/admin/clientes/:id` — Detalhes do cliente
	- Headers: Authorization (admin)
	- Params: { id }

### Relatórios
- GET `/admin/relatorio` — Relatório geral
	- Headers: Authorization (admin)
	- Query (opcionais): { dataInicio (ISO), dataFim (ISO) }

---

## 👥 Rotas Atendente (Requer token Atendente ou Admin)

### Clientes
- GET `/atendente/clientes` — Listar clientes
	- Headers: Authorization (atendente/admin)
	- Query (opcional): { busca }
- GET `/atendente/clientes/:id` — Detalhes do cliente
	- Headers: Authorization (atendente/admin)
	- Params: { id }

### Agendamentos
- GET `/atendente/agendamentos` — Listar agendamentos
	- Headers: Authorization (atendente/admin)
	- Query (opcionais): { data (YYYY-MM-DD), status, veterinario_id }
- PATCH `/atendente/agendamentos/:id/status` — Atualizar status
	- Headers: Authorization (atendente/admin)
	- Params: { id }
	- Body: { status ["Agendado"|"Conclu_do"|"Cancelado"] }
	- Exemplo (JSON):
		```json
		{
			"status": "Conclu_do"
		}
		```

### Outros
- GET `/atendente/veterinarios` — Listar veterinários
	- Headers: Authorization (atendente/admin)
- GET `/atendente/produtos` — Listar produtos
	- Headers: Authorization (atendente/admin)

---

## 🌐 Rotas Públicas

### Veterinários
- GET `/veterinarios` — Listar veterinários
	- Query (opcional): { especialidade }
- GET `/veterinarios/:id` — Detalhes do veterinário
	- Params: { id }

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

---

## ☁️ Deploy na Vercel

Esta API está pronta para rodar como Serverless Functions na Vercel.

1) Configure variáveis de ambiente (Project Settings > Environment Variables):
- DATABASE_URL
- JWT_SECRET_KEY
- JWT_EXPIRATION (opcional)
- LOG_LEVEL (opcional)

2) Estrutura de deploy
- Arquivo `vercel.json` já roteia tudo para `api/index.js` e serve estáticos de `public/`.
- A Function exporta o app em `api/index.js` (não chama `app.listen`).
- Prisma Client é gerado no `postinstall` automaticamente.

3) Sobre testes na Vercel
- Os testes são apenas para ambiente local. A Vercel não executará `npm test` porque não há `build` que os invoque e há `.vercelignore` ignorando a pasta `test/` no upload.

4) Execução local
- Para rodar localmente com Node: `npm start` (usa `index.js`).
- Para simular a Vercel (opcional), use o Vercel CLI e crie um `.env` com base em `.env.example`.