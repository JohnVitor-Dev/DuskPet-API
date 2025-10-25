const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

let adminToken = '';
let atendenteToken = '';
let veterinarioId = null;
let clienteToken = '';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function checkServer() {
    try {
        await axios.get(BASE_URL);
        console.log('✅ Servidor está rodando\n');
        return true;
    } catch (error) {
        console.error('❌ Servidor não está rodando. Inicie com: npm start');
        process.exit(1);
    }
}

function printHeader(title) {
    console.log('\n╔════════════════════════════════════════════════╗');
    console.log(`║     ${title.padEnd(44)}║`);
    console.log('╚════════════════════════════════════════════════╝\n');
}

function printTestHeader(title) {
    console.log(`\n${'='.repeat(10)} ${title} ${'='.repeat(10)}\n`);
}

async function test(description, fn) {
    try {
        console.log(`${description}...`);
        await fn();
        console.log(`✅ SUCESSO: ${description}\n`);
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.response?.data?.errors || error.message;
        console.error(`❌ FALHOU: ${description}`);
        console.error(`   Erro: ${JSON.stringify(errorMessage, null, 2)}\n`);
        throw error;
    }
}

async function runTests() {
    await checkServer();

    printHeader('TESTES DE ADMIN E ATENDENTE - API');

    printTestHeader('PREPARANDO DADOS DE TESTE');

    await test('Registrando cliente de teste', async () => {
        const timestamp = Date.now();
        const response = await axios.post(`${BASE_URL}/register`, {
            name: 'Cliente Teste Admin',
            email: `cliente.admin.${timestamp}@email.com`,
            password: 'Senha123',
            phone: '11987654321',
            cpf: `${Math.floor(Math.random() * 900 + 100)}.${Math.floor(Math.random() * 900 + 100)}.${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 90 + 10)}`
        });
        clienteToken = response.data.token;
    });

    printTestHeader('TESTE: Login Admin');

    await test('1. Testando login admin com credenciais inválidas', async () => {
        try {
            await axios.post(`${BASE_URL}/admin/login`, {
                email: 'admin@duskpet.com',
                senha: 'senhaerrada'
            });
            throw new Error('Deveria ter falhado');
        } catch (error) {
            if (error.response?.status !== 401) throw error;
        }
    });

    await test('2. Login admin com credenciais válidas', async () => {
        const response = await axios.post(`${BASE_URL}/admin/login`, {
            email: 'admin@duskpet.com',
            senha: 'admin123'
        });
        adminToken = response.data.token;
        console.log(`   Admin: ${response.data.admin.nome}`);
    });

    printTestHeader('TESTE: Login Atendente');

    await test('1. Testando login atendente com credenciais inválidas', async () => {
        try {
            await axios.post(`${BASE_URL}/atendente/login`, {
                email: 'atendente@duskpet.com',
                senha: 'senhaerrada'
            });
            throw new Error('Deveria ter falhado');
        } catch (error) {
            if (error.response?.status !== 401) throw error;
        }
    });

    await test('2. Login atendente com credenciais válidas', async () => {
        const response = await axios.post(`${BASE_URL}/atendente/login`, {
            email: 'atendente@duskpet.com',
            senha: 'atendente123'
        });
        atendenteToken = response.data.token;
        console.log(`   Atendente: ${response.data.atendente.nome}`);
    });

    printTestHeader('TESTE: Controle de Acesso Admin');

    await test('1. Testando acesso sem token', async () => {
        try {
            await axios.get(`${BASE_URL}/admin/dashboard`);
            throw new Error('Deveria ter falhado');
        } catch (error) {
            if (error.response?.status !== 401) throw error;
        }
    });

    await test('2. Testando acesso com token de cliente (não admin)', async () => {
        try {
            await axios.get(`${BASE_URL}/admin/dashboard`, {
                headers: { Authorization: `Bearer ${clienteToken}` }
            });
            throw new Error('Deveria ter falhado');
        } catch (error) {
            if (error.response?.status !== 403) throw error;
        }
    });

    printTestHeader('TESTE: Dashboard Admin');

    await test('Buscando dados do dashboard', async () => {
        const response = await axios.get(`${BASE_URL}/admin/dashboard`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log(`   Total de clientes: ${response.data.totalClientes}`);
        console.log(`   Total de pets: ${response.data.totalPets}`);
        console.log(`   Agendamentos hoje: ${response.data.agendamentosHoje}`);
    });

    printTestHeader('TESTE: Gestão de Veterinários');

    await test('1. Criar veterinário', async () => {
        const response = await axios.post(
            `${BASE_URL}/admin/veterinarios`,
            {
                nome: 'Dr. Carlos Silva',
                cpf: '123.456.789-00',
                crmv: 'SP-12345',
                especialidades: ['Clínica Geral', 'Cirurgia'],
                horarios_trabalho: {
                    segunda: ['08:00-12:00', '14:00-18:00'],
                    terca: ['08:00-12:00', '14:00-18:00']
                }
            },
            {
                headers: { Authorization: `Bearer ${adminToken}` }
            }
        );
        veterinarioId = response.data.id;
        console.log(`   ID: ${response.data.id}`);
        console.log(`   Nome: ${response.data.nome}`);
        console.log(`   CRMV: ${response.data.crmv}`);
    });

    await test('2. Listar veterinários', async () => {
        const response = await axios.get(`${BASE_URL}/admin/veterinarios`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log(`   Total: ${response.data.length}`);
    });

    await test('3. Atualizar veterinário', async () => {
        const response = await axios.put(
            `${BASE_URL}/admin/veterinarios/${veterinarioId}`,
            {
                nome: 'Dr. Carlos Silva Júnior',
                cpf: '123.456.789-00',
                crmv: 'SP-12345',
                especialidades: ['Clínica Geral', 'Cirurgia', 'Dermatologia']
            },
            {
                headers: { Authorization: `Bearer ${adminToken}` }
            }
        );
        console.log(`   Nome atualizado: ${response.data.nome}`);
        console.log(`   Especialidades: ${response.data.especialidades.length}`);
    });

    printTestHeader('TESTE: Listagem de Clientes (Admin)');

    await test('Admin buscando lista de clientes', async () => {
        const response = await axios.get(`${BASE_URL}/admin/clientes`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log(`   Total de clientes: ${response.data.length}`);
        if (response.data.length > 0) {
            console.log(`   Primeiro cliente: ${response.data[0].nome}`);
        }
    });

    printTestHeader('TESTE: Relatório Geral');

    await test('Gerar relatório geral', async () => {
        const dataInicio = new Date();
        dataInicio.setMonth(dataInicio.getMonth() - 1);
        const dataFim = new Date();

        const response = await axios.get(
            `${BASE_URL}/admin/relatorio?dataInicio=${dataInicio.toISOString()}&dataFim=${dataFim.toISOString()}`,
            {
                headers: { Authorization: `Bearer ${adminToken}` }
            }
        );
        console.log(`   Novos clientes: ${response.data.novosClientes}`);
        console.log(`   Novos pets: ${response.data.novosPets}`);
        console.log(`   Agendamentos realizados: ${response.data.agendamentosRealizados}`);
    });

    printTestHeader('TESTE: Funcionalidades de Atendente');

    await test('1. Atendente buscando lista de clientes', async () => {
        const response = await axios.get(`${BASE_URL}/atendente/clientes`, {
            headers: { Authorization: `Bearer ${atendenteToken}` }
        });
        console.log(`   Total de clientes: ${response.data.length}`);
    });

    await test('2. Atendente buscando clientes com filtro', async () => {
        const response = await axios.get(
            `${BASE_URL}/atendente/clientes?busca=teste`,
            {
                headers: { Authorization: `Bearer ${atendenteToken}` }
            }
        );
        console.log(`   Clientes encontrados: ${response.data.length}`);
    });

    await test('3. Atendente listando veterinários', async () => {
        const response = await axios.get(`${BASE_URL}/atendente/veterinarios`, {
            headers: { Authorization: `Bearer ${atendenteToken}` }
        });
        console.log(`   Total: ${response.data.length}`);
    });

    await test('4. Atendente listando agendamentos', async () => {
        const response = await axios.get(`${BASE_URL}/atendente/agendamentos`, {
            headers: { Authorization: `Bearer ${atendenteToken}` }
        });
        console.log(`   Total de agendamentos: ${response.data.length}`);
    });

    await test('5. Atendente listando produtos', async () => {
        const response = await axios.get(`${BASE_URL}/atendente/produtos`, {
            headers: { Authorization: `Bearer ${atendenteToken}` }
        });
        console.log(`   Total de produtos: ${response.data.length}`);
    });

    printTestHeader('TESTE: Controle de Permissões');

    await test('1. Atendente NÃO pode criar veterinário', async () => {
        try {
            await axios.post(
                `${BASE_URL}/admin/veterinarios`,
                {
                    nome: 'Dr. Teste',
                    cpf: '999.999.999-99',
                    crmv: 'SP-99999',
                    especialidades: ['Teste']
                },
                {
                    headers: { Authorization: `Bearer ${atendenteToken}` }
                }
            );
            throw new Error('Deveria ter falhado');
        } catch (error) {
            if (error.response?.status !== 403) throw error;
        }
    });

    await test('2. Cliente NÃO pode acessar painel de atendente', async () => {
        try {
            await axios.get(`${BASE_URL}/atendente/agendamentos`, {
                headers: { Authorization: `Bearer ${clienteToken}` }
            });
            throw new Error('Deveria ter falhado');
        } catch (error) {
            if (error.response?.status !== 403) throw error;
        }
    });

    await test('3. Admin PODE acessar rotas de atendente', async () => {
        const response = await axios.get(`${BASE_URL}/atendente/clientes`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log(`   Admin acessou rotas de atendente com sucesso`);
    });

    printTestHeader('TESTE: Exclusão de Veterinário');

    await test('Excluir veterinário criado', async () => {
        const response = await axios.delete(
            `${BASE_URL}/admin/veterinarios/${veterinarioId}`,
            {
                headers: { Authorization: `Bearer ${adminToken}` }
            }
        );
        console.log(`   ${response.data.message}`);
    });

    printHeader('RESUMO DOS TESTES');
    console.log('✅ Todos os testes passaram com sucesso!\n');
    console.log('📊 Funcionalidades testadas:');
    console.log('   • Login de Admin e Atendente');
    console.log('   • Controle de acesso por tipo de usuário');
    console.log('   • Dashboard administrativo');
    console.log('   • Gestão de veterinários (CRUD)');
    console.log('   • Listagem de clientes');
    console.log('   • Relatórios gerenciais');
    console.log('   • Funcionalidades de atendente (leitura)');
    console.log('   • Hierarquia de permissões (Admin > Atendente > Cliente)');
    console.log('');
}

runTests().catch((error) => {
    console.error('\n❌ Erro durante os testes:', error.message);
    process.exit(1);
});
