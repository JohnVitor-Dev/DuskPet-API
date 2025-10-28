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

async function testRegister() {
    log('\n🧪 Testando REGISTRO...', 'blue');

    const testUser = {
        name: 'Test User Login',
        phone: '11999999999',
        email: `test${Date.now()}@test.com`,
        password: 'Test123456'
    };

    try {
        const response = await axios.post(`${BASE_URL}/register`, testUser);

        if (response.status === 201 || response.status === 200) {
            log('✅ Registro bem-sucedido!', 'green');
            log(`   Email: ${testUser.email}`);
            log(`   Senha: ${testUser.password}`);
            return testUser;
        }
    } catch (error) {
        if (error.response?.data?.errors) {
            log(`❌ Erro: ${error.response.data.errors[0].msg}`, 'red');
        } else {
            log(`❌ Erro: ${error.message}`, 'red');
        }
        return null;
    }
}

async function testLogin(email, password) {
    log('\n🧪 Testando LOGIN...', 'blue');

    try {
        const response = await axios.post(`${BASE_URL}/login`, {
            email,
            password
        });

        if (response.status === 200 && response.data.token) {
            log('✅ Login bem-sucedido!', 'green');
            log(`   Token recebido: ${response.data.token.substring(0, 50)}...`);
            log(`   Usuário: ${response.data.user?.name}`);
            log(`   Email: ${response.data.user?.email}`);
            return response.data.token;
        }
    } catch (error) {
        if (error.response) {
            log(`❌ Erro ${error.response.status}: ${JSON.stringify(error.response.data)}`, 'red');
        } else {
            log(`❌ Erro: ${error.message}`, 'red');
        }
        return null;
    }
}

async function testProtectedRoute(token) {
    log('\n🧪 Testando ROTA PROTEGIDA...', 'blue');

    try {
        const response = await axios.get(`${BASE_URL}/protected/profile`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 200) {
            log('✅ Acesso à rota protegida bem-sucedido!', 'green');
            log(`   Nome: ${response.data.name}`);
            log(`   Email: ${response.data.email}`);
            return true;
        }
    } catch (error) {
        if (error.response) {
            log(`❌ Erro ${error.response.status}: ${JSON.stringify(error.response.data)}`, 'red');
        } else {
            log(`❌ Erro: ${error.message}`, 'red');
        }
        return false;
    }
}

async function testAdminLogin() {
    log('\n🧪 Testando LOGIN ADMIN...', 'blue');
    log('⚠️  Use credenciais de admin válidas', 'yellow');

    // Teste apenas a estrutura da requisição
    try {
        const response = await axios.post(`${BASE_URL}/admin/login`, {
            email: 'admin@duskpet.com',
            password: 'admin123'
        });

        if (response.status === 200) {
            log('✅ Login admin bem-sucedido!', 'green');
            return true;
        }
    } catch (error) {
        if (error.response?.status === 401) {
            log('⚠️  Credenciais inválidas (esperado se não houver admin cadastrado)', 'yellow');
        } else {
            log(`❌ Erro: ${error.message}`, 'red');
        }
        return false;
    }
}

async function runTests() {
    log('\n╔════════════════════════════════════════════════╗', 'blue');
    log('║     TESTE DE LOGIN - DUSKPET API              ║', 'blue');
    log('╚════════════════════════════════════════════════╝', 'blue');

    // Verificar se o servidor está rodando
    try {
        await axios.get(BASE_URL);
    } catch (error) {
        log('\n❌ ERRO: Servidor não está rodando!', 'red');
        log('   Execute: npm start', 'yellow');
        return;
    }

    // Teste 1: Registrar usuário
    const user = await testRegister();
    if (!user) {
        log('\n❌ Não foi possível continuar os testes', 'red');
        return;
    }

    await sleep(1000);

    // Teste 2: Login com usuário criado
    const token = await testLogin(user.email, user.password);
    if (!token) {
        log('\n❌ Não foi possível continuar os testes', 'red');
        return;
    }

    await sleep(1000);

    // Teste 3: Acessar rota protegida
    await testProtectedRoute(token);

    await sleep(1000);

    // Teste 4: Tentar login admin
    await testAdminLogin();

    log('\n╔════════════════════════════════════════════════╗', 'blue');
    log('║          TESTES CONCLUÍDOS                     ║', 'blue');
    log('╚════════════════════════════════════════════════╝', 'blue');
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

runTests().catch(error => {
    log(`\n❌ Erro fatal: ${error.message}`, 'red');
    console.error(error);
});
