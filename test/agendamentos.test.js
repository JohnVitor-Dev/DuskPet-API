const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const testUser = {
    name: 'Cliente Teste',
    phone: '11999999999',
    email: `cliente${Date.now()}@test.com`,
    password: 'Test123456'
};

let authToken = '';
let petId = null;
let veterinarioId = null;
let agendamentoId = null;
let dataAgendamento = null; // YYYY-MM-DD
let horarioAgendamento = null; // HH:mm

async function setupTestData() {
    log('\n========== PREPARANDO DADOS DE TESTE ==========', 'blue');

    try {
        log('\n1. Registrando usuário...', 'yellow');
        const userResponse = await axios.post(`${BASE_URL}/register`, testUser);
        authToken = userResponse.data.token;
        log('✅ Usuário registrado', 'green');

        log('\n2. Cadastrando pet...', 'yellow');
        const petResponse = await axios.post(`${BASE_URL}/protected/pets`, {
            nome: 'Thor',
            especie: 'Cachorro',
            raca: 'Pastor Alemão',
            sexo: 'Macho'
        }, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        petId = petResponse.data.id;
        log(`✅ Pet cadastrado (ID: ${petId})`, 'green');

        log('\n3. Buscando veterinário...', 'yellow');
        const vetResponse = await axios.get(`${BASE_URL}/veterinarios`);
        if (vetResponse.data.length > 0) {
            veterinarioId = vetResponse.data[0].id;
            log(`✅ Veterinário encontrado (ID: ${veterinarioId})`, 'green');
        } else {
            log('⚠️  Nenhum veterinário cadastrado no banco', 'yellow');
            log('   Por favor, cadastre um veterinário para continuar os testes', 'yellow');
            return false;
        }

        return true;
    } catch (error) {
        log(`❌ ERRO ao preparar dados: ${error.response?.data?.error || error.message}`, 'red');
        return false;
    }
}

async function testGetVeterinarios() {
    log('\n========== TESTE: Listar Veterinários ==========', 'blue');

    try {
        log('\nBuscando lista de veterinários...', 'yellow');
        const response = await axios.get(`${BASE_URL}/veterinarios`);

        if (response.status === 200 && Array.isArray(response.data)) {
            log('✅ SUCESSO: Lista de veterinários obtida', 'green');
            log(`   Quantidade: ${response.data.length}`, 'yellow');
            if (response.data.length > 0) {
                log(`   Primeiro: ${response.data[0].nome}`, 'yellow');
            }
        } else {
            log('❌ FALHA: Resposta inválida', 'red');
        }
    } catch (error) {
        log(`❌ ERRO: ${error.response?.data?.error || error.message}`, 'red');
    }
}

async function testGetHorariosDisponiveis() {
    log('\n========== TESTE: Horários Disponíveis ==========', 'blue');

    try {
        log('\nBuscando horários disponíveis...', 'yellow');
        const amanha = new Date();
        amanha.setDate(amanha.getDate() + 1);
        const dataConsulta = amanha.toISOString().split('T')[0];

        const response = await axios.get(`${BASE_URL}/protected/agendamentos/horarios-disponiveis`, {
            params: {
                veterinario_id: veterinarioId,
                data: dataConsulta
            },
            headers: { Authorization: `Bearer ${authToken}` }
        });

        if (response.status === 200 && response.data.horarios_disponiveis) {
            log('✅ SUCESSO: Horários disponíveis obtidos', 'green');
            log(`   Data: ${response.data.data}`, 'yellow');
            log(`   Horários: ${response.data.horarios_disponiveis.length} disponíveis`, 'yellow');
            if (response.data.horarios_disponiveis.length > 0) {
                dataAgendamento = response.data.data;
                horarioAgendamento = response.data.horarios_disponiveis[0];
                log(`   Selecionado: ${dataAgendamento} ${horarioAgendamento}`, 'yellow');
            }
        } else {
            log('❌ FALHA: Resposta inválida', 'red');
        }
    } catch (error) {
        log(`❌ ERRO: ${error.response?.data?.error || error.message}`, 'red');
    }
}

async function testCreateAgendamentoValidation() {
    log('\n========== TESTE: Validação de Agendamento ==========', 'blue');

    try {
        log('\n1. Testando agendamento sem pet_id...', 'yellow');
        await axios.post(`${BASE_URL}/protected/agendamentos`, {
            veterinario_id: veterinarioId,
            data_hora: new Date(Date.now() + 86400000).toISOString()
        }, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        log('❌ FALHA: Deveria rejeitar sem pet_id', 'red');
    } catch (error) {
        if (error.response?.status === 400) {
            log('✅ SUCESSO: Agendamento sem pet_id rejeitado', 'green');
        } else {
            log(`❌ ERRO: ${error.message}`, 'red');
        }
    }

    try {
        log('\n2. Testando agendamento para data passada...', 'yellow');
        await axios.post(`${BASE_URL}/protected/agendamentos`, {
            pet_id: petId,
            veterinario_id: veterinarioId,
            data_hora: '2020-01-01T10:00:00.000Z'
        }, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        log('❌ FALHA: Deveria rejeitar data passada', 'red');
    } catch (error) {
        if (error.response?.status === 400) {
            log('✅ SUCESSO: Data passada rejeitada', 'green');
        } else {
            log(`❌ ERRO: ${error.message}`, 'red');
        }
    }

    try {
        log('\n3. Testando agendamento com pet de outro cliente...', 'yellow');
        await axios.post(`${BASE_URL}/protected/agendamentos`, {
            pet_id: 99999,
            veterinario_id: veterinarioId,
            data_hora: new Date(Date.now() + 86400000).toISOString()
        }, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        log('❌ FALHA: Deveria rejeitar pet inexistente', 'red');
    } catch (error) {
        if (error.response?.status === 404) {
            log('✅ SUCESSO: Pet inexistente rejeitado', 'green');
        } else {
            log(`❌ ERRO: ${error.message}`, 'red');
        }
    }
}

async function testCreateAgendamentoSuccess() {
    log('\n========== TESTE: Criar Agendamento ==========', 'blue');

    try {
        log('\nCriando agendamento...', 'yellow');
        let dataHora = null;
        if (dataAgendamento && horarioAgendamento) {
            const [h, m] = horarioAgendamento.split(':').map(Number);
            const dt = new Date(dataAgendamento);
            dt.setHours(h, m, 0, 0);
            dataHora = dt.toISOString();
        } else {
            const amanha = new Date();
            amanha.setDate(amanha.getDate() + 1);
            amanha.setHours(10, 0, 0, 0);
            dataHora = amanha.toISOString();
        }
        const response = await axios.post(`${BASE_URL}/protected/agendamentos`, {
            pet_id: petId,
            veterinario_id: veterinarioId,
            data_hora: dataHora,
            tipo_consulta: 'Consulta de rotina'
        }, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        if (response.status === 201 && response.data.id) {
            agendamentoId = response.data.id;
            log('✅ SUCESSO: Agendamento criado', 'green');
            log(`   ID: ${agendamentoId}`, 'yellow');
            log(`   Pet: ${response.data.pets.nome}`, 'yellow');
            log(`   Veterinário: ${response.data.veterinarios.nome}`, 'yellow');
        } else {
            log('❌ FALHA: Resposta inválida', 'red');
        }
    } catch (error) {
        log(`❌ ERRO: ${error.response?.data?.error || error.message}`, 'red');
    }
}

async function testConflitodeHorario() {
    log('\n========== TESTE: Conflito de Horário ==========', 'blue');

    try {
        log('\nTentando criar agendamento no mesmo horário...', 'yellow');
        let dataHora = null;
        if (dataAgendamento && horarioAgendamento) {
            const [h, m] = horarioAgendamento.split(':').map(Number);
            const dt = new Date(dataAgendamento);
            dt.setHours(h, m, 0, 0);
            dataHora = dt.toISOString();
        } else {
            const amanha = new Date();
            amanha.setDate(amanha.getDate() + 1);
            amanha.setHours(10, 0, 0, 0);
            dataHora = amanha.toISOString();
        }

        await axios.post(`${BASE_URL}/protected/agendamentos`, {
            pet_id: petId,
            veterinario_id: veterinarioId,
            data_hora: dataHora,
            tipo_consulta: 'Outra consulta'
        }, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        log('❌ FALHA: Deveria rejeitar horário ocupado', 'red');
    } catch (error) {
        if (error.response?.status === 409) {
            log('✅ SUCESSO: Conflito de horário detectado', 'green');
        } else {
            log(`❌ ERRO: ${error.message}`, 'red');
        }
    }
}

async function testGetAgendamentos() {
    log('\n========== TESTE: Listar Agendamentos ==========', 'blue');

    try {
        log('\nBuscando lista de agendamentos...', 'yellow');
        const response = await axios.get(`${BASE_URL}/protected/agendamentos`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        if (response.status === 200 && Array.isArray(response.data)) {
            log('✅ SUCESSO: Lista de agendamentos obtida', 'green');
            log(`   Quantidade: ${response.data.length}`, 'yellow');
        } else {
            log('❌ FALHA: Resposta inválida', 'red');
        }
    } catch (error) {
        log(`❌ ERRO: ${error.response?.data?.error || error.message}`, 'red');
    }
}

async function testGetAgendamentoById() {
    log('\n========== TESTE: Buscar Agendamento por ID ==========', 'blue');

    try {
        log('\nBuscando detalhes do agendamento...', 'yellow');
        if (!agendamentoId) {
            log('⚠️  Pulando: sem agendamento criado', 'yellow');
            return;
        }
        const response = await axios.get(`${BASE_URL}/protected/agendamentos/${agendamentoId}`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        if (response.status === 200 && response.data.id === agendamentoId) {
            log('✅ SUCESSO: Detalhes do agendamento obtidos', 'green');
            log(`   Status: ${response.data.status}`, 'yellow');
            log(`   Tipo: ${response.data.tipo_consulta}`, 'yellow');
        } else {
            log('❌ FALHA: Resposta inválida', 'red');
        }
    } catch (error) {
        log(`❌ ERRO: ${error.response?.data?.error || error.message}`, 'red');
    }
}

async function testUpdateAgendamento() {
    log('\n========== TESTE: Atualizar Agendamento ==========', 'blue');

    try {
        log('\nAtualizando agendamento...', 'yellow');
        if (!agendamentoId) {
            log('⚠️  Pulando: sem agendamento criado', 'yellow');
            return;
        }
        const response = await axios.put(`${BASE_URL}/protected/agendamentos/${agendamentoId}`, {
            tipo_consulta: 'Consulta de emergência'
        }, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        if (response.status === 200 && response.data.tipo_consulta === 'Consulta de emergência') {
            log('✅ SUCESSO: Agendamento atualizado', 'green');
            log(`   Novo tipo: ${response.data.tipo_consulta}`, 'yellow');
        } else {
            log('❌ FALHA: Resposta inválida', 'red');
        }
    } catch (error) {
        log(`❌ ERRO: ${error.response?.data?.error || error.message}`, 'red');
    }
}

async function testCancelAgendamento() {
    log('\n========== TESTE: Cancelar Agendamento ==========', 'blue');

    try {
        log('\nCancelando agendamento...', 'yellow');
        if (!agendamentoId) {
            log('⚠️  Pulando: sem agendamento criado', 'yellow');
            return;
        }
        const response = await axios.patch(`${BASE_URL}/protected/agendamentos/${agendamentoId}/cancel`, {}, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        if (response.status === 200 && response.data.agendamento.status === 'Cancelado') {
            log('✅ SUCESSO: Agendamento cancelado', 'green');
        } else {
            log('❌ FALHA: Resposta inválida', 'red');
        }
    } catch (error) {
        log(`❌ ERRO: ${error.response?.data?.error || error.message}`, 'red');
    }
}

async function testAccessControl() {
    log('\n========== TESTE: Controle de Acesso ==========', 'blue');

    try {
        log('\n1. Testando acesso sem token...', 'yellow');
        await axios.get(`${BASE_URL}/protected/agendamentos`);
        log('❌ FALHA: Deveria rejeitar sem token', 'red');
    } catch (error) {
        if (error.response?.status === 401) {
            log('✅ SUCESSO: Acesso sem token rejeitado', 'green');
        } else {
            log(`❌ ERRO: ${error.message}`, 'red');
        }
    }
}

async function runAllTests() {
    log('\n╔════════════════════════════════════════════════╗', 'blue');
    log('║     TESTES DE AGENDAMENTOS - API             ║', 'blue');
    log('╚════════════════════════════════════════════════╝', 'blue');

    try {
        const setupOk = await setupTestData();
        if (!setupOk) {
            log('\n❌ Não foi possível continuar os testes', 'red');
            return;
        }
        await sleep(500);

        await testAccessControl();
        await sleep(500);

        await testGetVeterinarios();
        await sleep(500);

        await testGetHorariosDisponiveis();
        await sleep(500);

        await testCreateAgendamentoValidation();
        await sleep(500);

        await testCreateAgendamentoSuccess();
        await sleep(500);

        await testConflitodeHorario();
        await sleep(500);

        await testGetAgendamentos();
        await sleep(500);

        await testGetAgendamentoById();
        await sleep(500);

        await testUpdateAgendamento();
        await sleep(500);

        await testCancelAgendamento();

        log('\n╔════════════════════════════════════════════════╗', 'blue');
        log('║          TESTES FINALIZADOS                   ║', 'blue');
        log('╚════════════════════════════════════════════════╝', 'blue');

    } catch (error) {
        log(`\n❌ ERRO GERAL: ${error.message}`, 'red');
    }
}

async function checkServer() {
    try {
        await axios.get(BASE_URL, { timeout: 5000 });
        log('✅ Servidor está rodando\n', 'green');
        return true;
    } catch (error) {
        log('❌ Servidor não está acessível. Inicie o servidor primeiro!', 'red');
        log(`   Erro: ${error.code || error.message}`, 'yellow');
        log('   Execute: npm start\n', 'yellow');
        return false;
    }
}

(async () => {
    const serverRunning = await checkServer();
    if (serverRunning) {
        await runAllTests();
    }
})();
