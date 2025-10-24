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
    name: 'Test User',
    phone: '11999999999',
    email: `test${Date.now()}@test.com`,
    password: 'Test123456'
};

let authToken = '';

async function testRegisterValidation() {
    log('\n========== TESTE: Validação de Registro ==========', 'blue');

    try {
        log('\n1. Testando registro com senha fraca...', 'yellow');
        await axios.post(`${BASE_URL}/register`, {
            name: 'Test',
            phone: '11999999999',
            email: 'test@test.com',
            password: '123'
        });
        log('❌ FALHA: Deveria rejeitar senha fraca', 'red');
    } catch (error) {
        if (error.response?.status === 400) {
            log('✅ SUCESSO: Senha fraca rejeitada', 'green');
            log(`   Detalhes: ${JSON.stringify(error.response.data)}`, 'yellow');
        } else {
            log(`❌ ERRO: ${error.message}`, 'red');
        }
    }

    try {
        log('\n2. Testando registro com email inválido...', 'yellow');
        await axios.post(`${BASE_URL}/register`, {
            name: 'Test',
            phone: '11999999999',
            email: 'emailinvalido',
            password: 'Test123456'
        });
        log('❌ FALHA: Deveria rejeitar email inválido', 'red');
    } catch (error) {
        if (error.response?.status === 400) {
            log('✅ SUCESSO: Email inválido rejeitado', 'green');
            log(`   Detalhes: ${JSON.stringify(error.response.data)}`, 'yellow');
        } else {
            log(`❌ ERRO: ${error.message}`, 'red');
        }
    }

    try {
        log('\n3. Testando registro com campos faltando...', 'yellow');
        await axios.post(`${BASE_URL}/register`, {
            name: 'Test',
            email: 'test@test.com'
        });
        log('❌ FALHA: Deveria rejeitar campos faltando', 'red');
    } catch (error) {
        if (error.response?.status === 400) {
            log('✅ SUCESSO: Campos faltando rejeitados', 'green');
            log(`   Detalhes: ${JSON.stringify(error.response.data)}`, 'yellow');
        } else {
            log(`❌ ERRO: ${error.message}`, 'red');
        }
    }
}

async function testRegisterSuccess() {
    log('\n========== TESTE: Registro Bem-Sucedido ==========', 'blue');

    try {
        log('\nRegistrando novo usuário...', 'yellow');
        const response = await axios.post(`${BASE_URL}/register`, testUser);

        if (response.status === 201 && response.data.token) {
            authToken = response.data.token;
            log('✅ SUCESSO: Usuário registrado', 'green');
            log(`   Token: ${authToken.substring(0, 20)}...`, 'yellow');
        } else {
            log('❌ FALHA: Resposta inválida', 'red');
        }
    } catch (error) {
        log(`❌ ERRO: ${error.response?.data?.error || error.message}`, 'red');
    }
}

async function testLoginValidation() {
    log('\n========== TESTE: Validação de Login ==========', 'blue');

    try {
        log('\n1. Testando login com email inválido...', 'yellow');
        await axios.post(`${BASE_URL}/login`, {
            email: 'emailinvalido',
            password: 'Test123456'
        });
        log('❌ FALHA: Deveria rejeitar email inválido', 'red');
    } catch (error) {
        if (error.response?.status === 400) {
            log('✅ SUCESSO: Email inválido rejeitado', 'green');
            log(`   Detalhes: ${JSON.stringify(error.response.data)}`, 'yellow');
        } else {
            log(`❌ ERRO: ${error.message}`, 'red');
        }
    }

    try {
        log('\n2. Testando login com senha errada...', 'yellow');
        await axios.post(`${BASE_URL}/login`, {
            email: testUser.email,
            password: 'SenhaErrada123'
        });
        log('❌ FALHA: Deveria rejeitar senha errada', 'red');
    } catch (error) {
        if (error.response?.status === 401) {
            log('✅ SUCESSO: Senha errada rejeitada', 'green');
        } else {
            log(`❌ ERRO: ${error.message}`, 'red');
        }
    }
}

async function testLoginSuccess() {
    log('\n========== TESTE: Login Bem-Sucedido ==========', 'blue');

    try {
        log('\nFazendo login...', 'yellow');
        const response = await axios.post(`${BASE_URL}/login`, {
            email: testUser.email,
            password: testUser.password
        });

        if (response.status === 200 && response.data.token) {
            authToken = response.data.token;
            log('✅ SUCESSO: Login realizado', 'green');
            log(`   Token: ${authToken.substring(0, 20)}...`, 'yellow');
        } else {
            log('❌ FALHA: Resposta inválida', 'red');
        }
    } catch (error) {
        log(`❌ ERRO: ${error.response?.data?.error || error.message}`, 'red');
    }
}

async function testProtectedRoute() {
    log('\n========== TESTE: Rota Protegida ==========', 'blue');

    try {
        log('\n1. Testando acesso sem token...', 'yellow');
        await axios.get(`${BASE_URL}/protected/profile`);
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
        await axios.get(`${BASE_URL}/protected/profile`, {
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

    try {
        log('\n3. Testando acesso com token válido...', 'yellow');
        const response = await axios.get(`${BASE_URL}/protected/profile`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        if (response.status === 200 && response.data.email === testUser.email) {
            log('✅ SUCESSO: Perfil acessado', 'green');
            log(`   Usuário: ${response.data.name}`, 'yellow');
            log(`   Email: ${response.data.email}`, 'yellow');
        } else {
            log('❌ FALHA: Resposta inválida', 'red');
        }
    } catch (error) {
        log(`❌ ERRO: ${error.response?.data?.error || error.message}`, 'red');
    }
}

async function testRateLimiting() {
    log('\n========== TESTE: Rate Limiting ==========', 'blue');

    try {
        log('\nTestando rate limiting (fazendo 6 tentativas de login)...', 'yellow');

        for (let i = 1; i <= 6; i++) {
            try {
                await axios.post(`${BASE_URL}/login`, {
                    email: 'fake@test.com',
                    password: 'FakeSenha123'
                });
            } catch (error) {
                if (i <= 5) {
                    log(`   Tentativa ${i}: Rejeitada (esperado)`, 'yellow');
                } else if (error.response?.status === 429) {
                    log(`   Tentativa ${i}: Rate limit ativado!`, 'yellow');
                    log('✅ SUCESSO: Rate limiting funcionando', 'green');
                    return;
                }
            }
            await sleep(100);
        }

        log('⚠️  AVISO: Rate limit pode não ter sido atingido', 'yellow');
    } catch (error) {
        log(`❌ ERRO: ${error.message}`, 'red');
    }
}

async function runAllTests() {
    log('\n╔════════════════════════════════════════════════╗', 'blue');
    log('║     TESTES DE SEGURANÇA - DUSKPET API        ║', 'blue');
    log('╚════════════════════════════════════════════════╝', 'blue');

    try {
        await testRegisterValidation();
        await sleep(500);

        await testRegisterSuccess();
        await sleep(500);

        await testLoginValidation();
        await sleep(500);

        await testLoginSuccess();
        await sleep(500);

        await testProtectedRoute();
        await sleep(500);

        await testRateLimiting();

        log('\n╔════════════════════════════════════════════════╗', 'blue');
        log('║          TESTES FINALIZADOS                   ║', 'blue');
        log('╚════════════════════════════════════════════════╝', 'blue');

    } catch (error) {
        log(`\n❌ ERRO GERAL: ${error.message}`, 'red');
    }
}

async function checkServer() {
    try {
        const response = await axios.get(BASE_URL, { timeout: 5000 });
        log('✅ Servidor está rodando\n', 'green');
        return true;
    } catch (error) {
        log('❌ Servidor não está acessível. Inicie o servidor primeiro!', 'red');
        log(`   Erro: ${error.code || error.message}`, 'yellow');
        log('   Execute: npm start\n', 'yellow');
        if (error.response) {
            log(`   Status: ${error.response.status}`, 'yellow');
        }
        return false;
    }
}

(async () => {
    const serverRunning = await checkServer();
    if (serverRunning) {
        await runAllTests();
    }
})();
