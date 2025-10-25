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
    name: 'Cliente Historico',
    phone: '11999999999',
    email: `historico${Date.now()}@test.com`,
    password: 'Test123456'
};

let authToken = '';
let petId = null;
let veterinarioId = null;
let agendamentoId = null;
let historicoId = null;

async function setupTestData() {
    log('\n========== PREPARANDO DADOS DE TESTE ==========', 'blue');

    try {
        log('\n1. Registrando usuário...', 'yellow');
        await sleep(1000);
        const userResponse = await axios.post(`${BASE_URL}/register`, testUser);
        authToken = userResponse.data.token;
        log('✅ Usuário registrado', 'green');

        log('\n2. Cadastrando pet...', 'yellow');
        await sleep(500);
        const petResponse = await axios.post(`${BASE_URL}/protected/pets`, {
            nome: 'Luna',
            especie: 'Gato',
            raca: 'Siamês',
            sexo: 'Fêmea',
            data_nascimento: '2022-03-10'
        }, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        petId = petResponse.data.id;
        log(`✅ Pet cadastrado (ID: ${petId})`, 'green');

        log('\n3. Buscando veterinário...', 'yellow');
        await sleep(500);
        const vetResponse = await axios.get(`${BASE_URL}/veterinarios`);
        if (vetResponse.data.length > 0) {
            veterinarioId = vetResponse.data[0].id;
            log(`✅ Veterinário encontrado (ID: ${veterinarioId})`, 'green');
        } else {
            log('⚠️  Nenhum veterinário cadastrado', 'yellow');
            return false;
        }

        log('\n4. Criando agendamento...', 'yellow');
        await sleep(500);
        const amanha = new Date();
        amanha.setDate(amanha.getDate() + 2);
        amanha.setHours(Math.floor(Math.random() * 8) + 9, 0, 0, 0);

        const agendamentoResponse = await axios.post(`${BASE_URL}/protected/agendamentos`, {
            pet_id: petId,
            veterinario_id: veterinarioId,
            data_hora: amanha.toISOString(),
            tipo_consulta: 'Check-up'
        }, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        agendamentoId = agendamentoResponse.data.id;
        log(`✅ Agendamento criado (ID: ${agendamentoId})`, 'green');

        return true;
    } catch (error) {
        log(`❌ ERRO ao preparar dados: ${error.response?.data?.error || error.message}`, 'red');
        if (error.response?.data?.details) {
            log(`   Detalhes: ${JSON.stringify(error.response.data.details)}`, 'yellow');
        }
        return false;
    }
}

async function testCreateHistoricoValidation() {
    log('\n========== TESTE: Validação de Histórico Clínico ==========', 'blue');

    try {
        log('\n1. Testando criação sem pet_id...', 'yellow');
        await axios.post(`${BASE_URL}/protected/historicos`, {
            vacinas: 'V10',
            observacoes: 'Teste'
        }, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        log('❌ FALHA: Deveria rejeitar sem pet_id', 'red');
    } catch (error) {
        if (error.response?.status === 400) {
            log('✅ SUCESSO: Criação sem pet_id rejeitada', 'green');
        } else {
            log(`❌ ERRO: ${error.message}`, 'red');
        }
    }

    try {
        log('\n2. Testando criação com pet inexistente...', 'yellow');
        await axios.post(`${BASE_URL}/protected/historicos`, {
            pet_id: 99999,
            vacinas: 'V10'
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

    try {
        log('\n3. Testando criação com agendamento de outro pet...', 'yellow');
        const outroPet = await axios.post(`${BASE_URL}/protected/pets`, {
            nome: 'Bolt',
            especie: 'Cachorro'
        }, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        await axios.post(`${BASE_URL}/protected/historicos`, {
            pet_id: outroPet.data.id,
            agendamento_id: agendamentoId,
            vacinas: 'V10'
        }, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        log('❌ FALHA: Deveria rejeitar agendamento de outro pet', 'red');
    } catch (error) {
        if (error.response?.status === 400) {
            log('✅ SUCESSO: Agendamento de outro pet rejeitado', 'green');
        } else {
            log(`❌ ERRO: ${error.message}`, 'red');
        }
    }
}

async function testCreateHistoricoSuccess() {
    log('\n========== TESTE: Criar Histórico Clínico ==========', 'blue');

    try {
        log('\nCriando histórico clínico...', 'yellow');
        const response = await axios.post(`${BASE_URL}/protected/historicos`, {
            pet_id: petId,
            agendamento_id: agendamentoId,
            vacinas: 'V10, V8, Antirrábica',
            doencas_alergias: 'Nenhuma alergia conhecida',
            medicamentos: 'Vermífugo (dose aplicada em 15/10/2025)',
            observacoes: 'Animal saudável, peso ideal para a idade'
        }, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        if (response.status === 201 && response.data.id) {
            historicoId = response.data.id;
            log('✅ SUCESSO: Histórico criado', 'green');
            log(`   ID: ${historicoId}`, 'yellow');
            log(`   Pet: ${response.data.pets.nome}`, 'yellow');
        } else {
            log('❌ FALHA: Resposta inválida', 'red');
        }
    } catch (error) {
        log(`❌ ERRO: ${error.response?.data?.error || error.message}`, 'red');
    }
}

async function testGetHistoricosByPet() {
    log('\n========== TESTE: Listar Históricos por Pet ==========', 'blue');

    try {
        log('\nBuscando históricos do pet...', 'yellow');
        const response = await axios.get(`${BASE_URL}/protected/historicos/pet/${petId}`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        if (response.status === 200 && Array.isArray(response.data)) {
            log('✅ SUCESSO: Lista de históricos obtida', 'green');
            log(`   Quantidade: ${response.data.length}`, 'yellow');
            if (response.data.length > 0) {
                log(`   Vacinas: ${response.data[0].vacinas}`, 'yellow');
            }
        } else {
            log('❌ FALHA: Resposta inválida', 'red');
        }
    } catch (error) {
        log(`❌ ERRO: ${error.response?.data?.error || error.message}`, 'red');
    }
}

async function testGetHistoricoById() {
    log('\n========== TESTE: Buscar Histórico por ID ==========', 'blue');

    try {
        log('\nBuscando detalhes do histórico...', 'yellow');
        const response = await axios.get(`${BASE_URL}/protected/historicos/${historicoId}`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        if (response.status === 200 && response.data.id === historicoId) {
            log('✅ SUCESSO: Detalhes do histórico obtidos', 'green');
            log(`   Pet: ${response.data.pets.nome}`, 'yellow');
            log(`   Vacinas: ${response.data.vacinas}`, 'yellow');
        } else {
            log('❌ FALHA: Resposta inválida', 'red');
        }
    } catch (error) {
        log(`❌ ERRO: ${error.response?.data?.error || error.message}`, 'red');
    }
}

async function testGetHistoricoCompleto() {
    log('\n========== TESTE: Histórico Completo do Pet ==========', 'blue');

    try {
        log('\nBuscando histórico completo do pet...', 'yellow');
        const response = await axios.get(`${BASE_URL}/protected/historicos/pet/${petId}/completo`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        if (response.status === 200 && response.data.pet && response.data.historicos_clinicos) {
            log('✅ SUCESSO: Histórico completo obtido', 'green');
            log(`   Pet: ${response.data.pet.nome}`, 'yellow');
            log(`   Históricos: ${response.data.historicos_clinicos.length}`, 'yellow');
            log(`   Agendamentos recentes: ${response.data.agendamentos_recentes.length}`, 'yellow');
        } else {
            log('❌ FALHA: Resposta inválida', 'red');
        }
    } catch (error) {
        log(`❌ ERRO: ${error.response?.data?.error || error.message}`, 'red');
    }
}

async function testUpdateHistorico() {
    log('\n========== TESTE: Atualizar Histórico ==========', 'blue');

    try {
        log('\nAtualizando histórico...', 'yellow');
        const response = await axios.put(`${BASE_URL}/protected/historicos/${historicoId}`, {
            vacinas: 'V10, V8, Antirrábica, Giardíase',
            observacoes: 'Animal saudável, peso ideal. Nova vacina aplicada.'
        }, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        if (response.status === 200 && response.data.vacinas.includes('Giardíase')) {
            log('✅ SUCESSO: Histórico atualizado', 'green');
            log(`   Novas vacinas: ${response.data.vacinas}`, 'yellow');
        } else {
            log('❌ FALHA: Resposta inválida', 'red');
        }
    } catch (error) {
        log(`❌ ERRO: ${error.response?.data?.error || error.message}`, 'red');
    }
}

async function testCreateHistoricoSemAgendamento() {
    log('\n========== TESTE: Criar Histórico Sem Agendamento ==========', 'blue');

    try {
        log('\nCriando histórico sem agendamento...', 'yellow');
        const response = await axios.post(`${BASE_URL}/protected/historicos`, {
            pet_id: petId,
            vacinas: 'Reforço anual V10',
            observacoes: 'Vacinação preventiva realizada em casa'
        }, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        if (response.status === 201 && response.data.id) {
            log('✅ SUCESSO: Histórico sem agendamento criado', 'green');
            log(`   ID: ${response.data.id}`, 'yellow');
        } else {
            log('❌ FALHA: Resposta inválida', 'red');
        }
    } catch (error) {
        log(`❌ ERRO: ${error.response?.data?.error || error.message}`, 'red');
    }
}

async function testDeleteHistorico() {
    log('\n========== TESTE: Deletar Histórico ==========', 'blue');

    try {
        log('\nDeletando histórico...', 'yellow');
        const response = await axios.delete(`${BASE_URL}/protected/historicos/${historicoId}`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        if (response.status === 200) {
            log('✅ SUCESSO: Histórico deletado', 'green');
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
        await axios.get(`${BASE_URL}/protected/historicos/pet/${petId}`);
        log('❌ FALHA: Deveria rejeitar sem token', 'red');
    } catch (error) {
        if (error.response?.status === 401) {
            log('✅ SUCESSO: Acesso sem token rejeitado', 'green');
        } else {
            log(`❌ ERRO: ${error.message}`, 'red');
        }
    }

    try {
        log('\n2. Testando acesso com token inválido...', 'yellow');
        await axios.get(`${BASE_URL}/protected/historicos/pet/${petId}`, {
            headers: { Authorization: 'Bearer tokeninvalido123' }
        });
        log('❌ FALHA: Deveria rejeitar token inválido', 'red');
    } catch (error) {
        if (error.response?.status === 401) {
            log('✅ SUCESSO: Token inválido rejeitado', 'green');
        } else {
            log(`❌ ERRO: ${error.message}`, 'red');
        }
    }
}

async function runAllTests() {
    log('\n╔════════════════════════════════════════════════╗', 'blue');
    log('║   TESTES DE HISTÓRICO CLÍNICO - API          ║', 'blue');
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

        await testCreateHistoricoValidation();
        await sleep(500);

        await testCreateHistoricoSuccess();
        await sleep(500);

        await testGetHistoricosByPet();
        await sleep(500);

        await testGetHistoricoById();
        await sleep(500);

        await testGetHistoricoCompleto();
        await sleep(500);

        await testUpdateHistorico();
        await sleep(500);

        await testCreateHistoricoSemAgendamento();
        await sleep(500);

        await testDeleteHistorico();

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
