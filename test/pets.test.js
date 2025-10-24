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
    name: 'Pet Owner',
    phone: '11999999999',
    email: `petowner${Date.now()}@test.com`,
    password: 'Test123456'
};

const testPet = {
    nome: 'Rex',
    especie: 'Cachorro',
    raca: 'Golden Retriever',
    sexo: 'Macho',
    data_nascimento: '2020-05-15'
};

let authToken = '';
let petId = null;

async function testRegisterUser() {
    log('\n========== TESTE: Registrando Usuário ==========', 'blue');

    try {
        log('\nRegistrando usuário para testes...', 'yellow');
        const response = await axios.post(`${BASE_URL}/register`, testUser);

        if (response.status === 201 && response.data.token) {
            authToken = response.data.token;
            log('✅ SUCESSO: Usuário registrado', 'green');
        } else {
            log('❌ FALHA: Resposta inválida', 'red');
        }
    } catch (error) {
        log(`❌ ERRO: ${error.response?.data?.error || error.message}`, 'red');
    }
}

async function testCreatePetValidation() {
    log('\n========== TESTE: Validação de Cadastro de Pet ==========', 'blue');

    try {
        log('\n1. Testando cadastro sem nome...', 'yellow');
        await axios.post(`${BASE_URL}/protected/pets`, {
            especie: 'Cachorro'
        }, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        log('❌ FALHA: Deveria rejeitar sem nome', 'red');
    } catch (error) {
        if (error.response?.status === 400) {
            log('✅ SUCESSO: Cadastro sem nome rejeitado', 'green');
        } else {
            log(`❌ ERRO: ${error.message}`, 'red');
        }
    }

    try {
        log('\n2. Testando cadastro com sexo inválido...', 'yellow');
        await axios.post(`${BASE_URL}/protected/pets`, {
            nome: 'Rex',
            especie: 'Cachorro',
            sexo: 'Invalido'
        }, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        log('❌ FALHA: Deveria rejeitar sexo inválido', 'red');
    } catch (error) {
        if (error.response?.status === 400) {
            log('✅ SUCESSO: Sexo inválido rejeitado', 'green');
        } else {
            log(`❌ ERRO: ${error.message}`, 'red');
        }
    }

    try {
        log('\n3. Testando cadastro com data futura...', 'yellow');
        await axios.post(`${BASE_URL}/protected/pets`, {
            nome: 'Rex',
            especie: 'Cachorro',
            data_nascimento: '2030-01-01'
        }, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        log('❌ FALHA: Deveria rejeitar data futura', 'red');
    } catch (error) {
        if (error.response?.status === 400) {
            log('✅ SUCESSO: Data futura rejeitada', 'green');
        } else {
            log(`❌ ERRO: ${error.message}`, 'red');
        }
    }
}

async function testCreatePetSuccess() {
    log('\n========== TESTE: Cadastro de Pet Bem-Sucedido ==========', 'blue');

    try {
        log('\nCadastrando pet...', 'yellow');
        const response = await axios.post(`${BASE_URL}/protected/pets`, testPet, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        if (response.status === 201 && response.data.id) {
            petId = response.data.id;
            log('✅ SUCESSO: Pet cadastrado', 'green');
            log(`   ID: ${petId}`, 'yellow');
            log(`   Nome: ${response.data.nome}`, 'yellow');
            log(`   Espécie: ${response.data.especie}`, 'yellow');
        } else {
            log('❌ FALHA: Resposta inválida', 'red');
        }
    } catch (error) {
        log(`❌ ERRO: ${error.response?.data?.error || error.message}`, 'red');
    }
}

async function testGetPets() {
    log('\n========== TESTE: Listar Pets ==========', 'blue');

    try {
        log('\nBuscando lista de pets...', 'yellow');
        const response = await axios.get(`${BASE_URL}/protected/pets`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        if (response.status === 200 && Array.isArray(response.data)) {
            log('✅ SUCESSO: Lista de pets obtida', 'green');
            log(`   Quantidade: ${response.data.length}`, 'yellow');
        } else {
            log('❌ FALHA: Resposta inválida', 'red');
        }
    } catch (error) {
        log(`❌ ERRO: ${error.response?.data?.error || error.message}`, 'red');
    }
}

async function testGetPetById() {
    log('\n========== TESTE: Buscar Pet por ID ==========', 'blue');

    try {
        log('\nBuscando detalhes do pet...', 'yellow');
        const response = await axios.get(`${BASE_URL}/protected/pets/${petId}`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        if (response.status === 200 && response.data.id === petId) {
            log('✅ SUCESSO: Detalhes do pet obtidos', 'green');
            log(`   Nome: ${response.data.nome}`, 'yellow');
            log(`   Espécie: ${response.data.especie}`, 'yellow');
        } else {
            log('❌ FALHA: Resposta inválida', 'red');
        }
    } catch (error) {
        log(`❌ ERRO: ${error.response?.data?.error || error.message}`, 'red');
    }
}

async function testUpdatePet() {
    log('\n========== TESTE: Atualizar Pet ==========', 'blue');

    try {
        log('\nAtualizando pet...', 'yellow');
        const response = await axios.put(`${BASE_URL}/protected/pets/${petId}`, {
            nome: 'Rex Atualizado',
            raca: 'Labrador'
        }, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        if (response.status === 200 && response.data.nome === 'Rex Atualizado') {
            log('✅ SUCESSO: Pet atualizado', 'green');
            log(`   Novo nome: ${response.data.nome}`, 'yellow');
            log(`   Nova raça: ${response.data.raca}`, 'yellow');
        } else {
            log('❌ FALHA: Resposta inválida', 'red');
        }
    } catch (error) {
        log(`❌ ERRO: ${error.response?.data?.error || error.message}`, 'red');
    }
}

async function testDeletePet() {
    log('\n========== TESTE: Deletar Pet ==========', 'blue');

    try {
        log('\nDeletando pet...', 'yellow');
        const response = await axios.delete(`${BASE_URL}/protected/pets/${petId}`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        if (response.status === 200) {
            log('✅ SUCESSO: Pet deletado', 'green');
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
        await axios.get(`${BASE_URL}/protected/pets`);
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
        await axios.get(`${BASE_URL}/protected/pets`, {
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
    log('║       TESTES DE GESTÃO DE PETS - API         ║', 'blue');
    log('╚════════════════════════════════════════════════╝', 'blue');

    try {
        await testRegisterUser();
        await sleep(500);

        await testAccessControl();
        await sleep(500);

        await testCreatePetValidation();
        await sleep(500);

        await testCreatePetSuccess();
        await sleep(500);

        await testGetPets();
        await sleep(500);

        await testGetPetById();
        await sleep(500);

        await testUpdatePet();
        await sleep(500);

        await testDeletePet();

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
