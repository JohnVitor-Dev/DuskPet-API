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
    name: 'Gerente Produtos',
    phone: '11999999999',
    email: `produtos${Date.now()}@test.com`,
    password: 'Test123456'
};

let authToken = '';
let staffToken = '';
let produtoId = null;

async function setupTestData() {
    log('\n========== PREPARANDO DADOS DE TESTE ==========', 'blue');

    try {
        log('\nRegistrando usuário...', 'yellow');
        await sleep(1000);
        const userResponse = await axios.post(`${BASE_URL}/register`, testUser);
        authToken = userResponse.data.token;
        log('✅ Usuário registrado', 'green');

        // Autenticação para operações de escrita (tentar admin, depois atendente)
        let staffObtido = false;
        try {
            log('\nEfetuando login como admin...', 'yellow');
            const adminResp = await axios.post(`${BASE_URL}/admin/login`, {
                email: 'admin@duskpet.com',
                password: 'Admin123'
            });
            staffToken = adminResp.data.token;
            staffObtido = true;
            log('✅ Admin autenticado para operações de produtos', 'green');
        } catch (e1) {
            log('⚠️  Admin indisponível, tentando atendente...', 'yellow');
            try {
                const atendenteResp = await axios.post(`${BASE_URL}/atendente/login`, {
                    email: 'atendente@duskpet.com',
                    senha: 'atendente123'
                });
                staffToken = atendenteResp.data.token;
                staffObtido = true;
                log('✅ Atendente autenticado para operações de produtos', 'green');
            } catch (e2) {
                // continuar para erro geral abaixo
            }
        }

        if (!staffObtido) {
            throw new Error('Não foi possível autenticar admin nem atendente para testes de produtos');
        }

        return true;
    } catch (error) {
        log(`❌ ERRO ao preparar dados: ${error.response?.data?.error || error.message}`, 'red');
        return false;
    }
}

async function testCreateProdutoValidation() {
    log('\n========== TESTE: Validação de Produto ==========', 'blue');

    try {
        log('\n1. Testando criação sem nome...', 'yellow');
        await axios.post(`${BASE_URL}/protected/produtos`, {
            valor: 29.90,
            quantidade: 10
        }, {
            headers: { Authorization: `Bearer ${staffToken}` }
        });
        log('❌ FALHA: Deveria rejeitar sem nome', 'red');
    } catch (error) {
        if (error.response?.status === 400) {
            log('✅ SUCESSO: Criação sem nome rejeitada', 'green');
        } else {
            log(`❌ ERRO: ${error.message}`, 'red');
        }
    }

    try {
        log('\n2. Testando criação sem valor...', 'yellow');
        await axios.post(`${BASE_URL}/protected/produtos`, {
            nome_produto: 'Ração Premium',
            quantidade: 10
        }, {
            headers: { Authorization: `Bearer ${staffToken}` }
        });
        log('❌ FALHA: Deveria rejeitar sem valor', 'red');
    } catch (error) {
        if (error.response?.status === 400) {
            log('✅ SUCESSO: Criação sem valor rejeitada', 'green');
        } else {
            log(`❌ ERRO: ${error.message}`, 'red');
        }
    }

    try {
        log('\n3. Testando criação com valor negativo...', 'yellow');
        await axios.post(`${BASE_URL}/protected/produtos`, {
            nome_produto: 'Ração Premium',
            valor: -10.00,
            quantidade: 10
        }, {
            headers: { Authorization: `Bearer ${staffToken}` }
        });
        log('❌ FALHA: Deveria rejeitar valor negativo', 'red');
    } catch (error) {
        if (error.response?.status === 400) {
            log('✅ SUCESSO: Valor negativo rejeitado', 'green');
        } else {
            log(`❌ ERRO: ${error.message}`, 'red');
        }
    }
}

async function testCreateProdutoSuccess() {
    log('\n========== TESTE: Criar Produto ==========', 'blue');

    try {
        log('\nCriando produto...', 'yellow');
        const response = await axios.post(`${BASE_URL}/protected/produtos`, {
            nome_produto: 'Ração Premium para Cães Adultos 15kg',
            valor: 189.90,
            quantidade: 50,
            validade: '2026-12-31'
        }, {
            headers: { Authorization: `Bearer ${staffToken}` }
        });

        if (response.status === 201 && response.data.id) {
            produtoId = response.data.id;
            log('✅ SUCESSO: Produto criado', 'green');
            log(`   ID: ${produtoId}`, 'yellow');
            log(`   Nome: ${response.data.nome_produto}`, 'yellow');
            log(`   Valor: R$ ${response.data.valor}`, 'yellow');
            log(`   Quantidade: ${response.data.quantidade}`, 'yellow');
        } else {
            log('❌ FALHA: Resposta inválida', 'red');
        }
    } catch (error) {
        log(`❌ ERRO: ${error.response?.data?.error || error.message}`, 'red');
    }
}

async function testCreateProdutoDuplicado() {
    log('\n========== TESTE: Produto Duplicado ==========', 'blue');

    try {
        log('\nTentando criar produto com nome duplicado...', 'yellow');
        await axios.post(`${BASE_URL}/protected/produtos`, {
            nome_produto: 'Ração Premium para Cães Adultos 15kg',
            valor: 199.90,
            quantidade: 30
        }, {
            headers: { Authorization: `Bearer ${staffToken}` }
        });
        log('❌ FALHA: Deveria rejeitar produto duplicado', 'red');
    } catch (error) {
        if (error.response?.status === 400) {
            log('✅ SUCESSO: Produto duplicado rejeitado', 'green');
        } else {
            log(`❌ ERRO: ${error.message}`, 'red');
        }
    }
}

async function testGetProdutos() {
    log('\n========== TESTE: Listar Produtos ==========', 'blue');

    try {
        log('\nBuscando lista de produtos...', 'yellow');
        const response = await axios.get(`${BASE_URL}/protected/produtos`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        if (response.status === 200 && Array.isArray(response.data)) {
            log('✅ SUCESSO: Lista de produtos obtida', 'green');
            log(`   Quantidade: ${response.data.length}`, 'yellow');
        } else {
            log('❌ FALHA: Resposta inválida', 'red');
        }
    } catch (error) {
        log(`❌ ERRO: ${error.response?.data?.error || error.message}`, 'red');
    }
}

async function testGetProdutoById() {
    log('\n========== TESTE: Buscar Produto por ID ==========', 'blue');

    try {
        log('\nBuscando detalhes do produto...', 'yellow');
        const response = await axios.get(`${BASE_URL}/protected/produtos/${produtoId}`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        if (response.status === 200 && response.data.id === produtoId) {
            log('✅ SUCESSO: Detalhes do produto obtidos', 'green');
            log(`   Nome: ${response.data.nome_produto}`, 'yellow');
            log(`   Valor: R$ ${response.data.valor}`, 'yellow');
        } else {
            log('❌ FALHA: Resposta inválida', 'red');
        }
    } catch (error) {
        log(`❌ ERRO: ${error.response?.data?.error || error.message}`, 'red');
    }
}

async function testUpdateProduto() {
    log('\n========== TESTE: Atualizar Produto ==========', 'blue');

    try {
        log('\nAtualizando produto...', 'yellow');
        const response = await axios.put(`${BASE_URL}/protected/produtos/${produtoId}`, {
            valor: 199.90,
            quantidade: 45
        }, {
            headers: { Authorization: `Bearer ${staffToken}` }
        });

        if (response.status === 200 && parseFloat(response.data.valor) === 199.90) {
            log('✅ SUCESSO: Produto atualizado', 'green');
            log(`   Novo valor: R$ ${response.data.valor}`, 'yellow');
            log(`   Nova quantidade: ${response.data.quantidade}`, 'yellow');
        } else {
            log('❌ FALHA: Resposta inválida', 'red');
        }
    } catch (error) {
        log(`❌ ERRO: ${error.response?.data?.error || error.message}`, 'red');
    }
}

async function testAjustarEstoque() {
    log('\n========== TESTE: Ajustar Estoque ==========', 'blue');

    try {
        log('\n1. Adicionando ao estoque...', 'yellow');
        const addResponse = await axios.patch(`${BASE_URL}/protected/produtos/${produtoId}/estoque`, {
            quantidade: 10,
            operacao: 'adicionar'
        }, {
            headers: { Authorization: `Bearer ${staffToken}` }
        });

        if (addResponse.status === 200 && addResponse.data.produto.quantidade === 55) {
            log('✅ SUCESSO: Estoque adicionado', 'green');
            log(`   Nova quantidade: ${addResponse.data.produto.quantidade}`, 'yellow');
        } else {
            log('❌ FALHA: Resposta inválida', 'red');
        }

        await sleep(500);

        log('\n2. Removendo do estoque...', 'yellow');
        const removeResponse = await axios.patch(`${BASE_URL}/protected/produtos/${produtoId}/estoque`, {
            quantidade: 5,
            operacao: 'remover'
        }, {
            headers: { Authorization: `Bearer ${staffToken}` }
        });

        if (removeResponse.status === 200 && removeResponse.data.produto.quantidade === 50) {
            log('✅ SUCESSO: Estoque removido', 'green');
            log(`   Nova quantidade: ${removeResponse.data.produto.quantidade}`, 'yellow');
        } else {
            log('❌ FALHA: Resposta inválida', 'red');
        }
    } catch (error) {
        log(`❌ ERRO: ${error.response?.data?.error || error.message}`, 'red');
    }
}

async function testAjustarEstoqueInsuficiente() {
    log('\n========== TESTE: Estoque Insuficiente ==========', 'blue');

    try {
        log('\nTentando remover mais do que disponível...', 'yellow');
        await axios.patch(`${BASE_URL}/protected/produtos/${produtoId}/estoque`, {
            quantidade: 1000,
            operacao: 'remover'
        }, {
            headers: { Authorization: `Bearer ${staffToken}` }
        });
        log('❌ FALHA: Deveria rejeitar estoque insuficiente', 'red');
    } catch (error) {
        if (error.response?.status === 400) {
            log('✅ SUCESSO: Estoque insuficiente detectado', 'green');
        } else {
            log(`❌ ERRO: ${error.message}`, 'red');
        }
    }
}

async function testGetRelatorioEstoque() {
    log('\n========== TESTE: Relatório de Estoque ==========', 'blue');

    try {
        log('\nBuscando relatório de estoque...', 'yellow');
        const response = await axios.get(`${BASE_URL}/protected/produtos/relatorio`, {
            headers: { Authorization: `Bearer ${staffToken}` }
        });

        if (response.status === 200 && response.data.total_produtos !== undefined) {
            log('✅ SUCESSO: Relatório obtido', 'green');
            log(`   Total de produtos: ${response.data.total_produtos}`, 'yellow');
            log(`   Estoque baixo: ${response.data.estoque_baixo}`, 'yellow');
            log(`   Produtos vencendo: ${response.data.produtos_vencendo}`, 'yellow');
            log(`   Quantidade total: ${response.data.quantidade_total_estoque}`, 'yellow');
        } else {
            log('❌ FALHA: Resposta inválida', 'red');
        }
    } catch (error) {
        log(`❌ ERRO: ${error.response?.data?.error || error.message}`, 'red');
    }
}

async function testGetProdutosFiltros() {
    log('\n========== TESTE: Filtros de Produtos ==========', 'blue');

    try {
        await axios.post(`${BASE_URL}/protected/produtos`, {
            nome_produto: 'Areia Sanitária 4kg',
            valor: 15.90,
            quantidade: 5
        }, {
            headers: { Authorization: `Bearer ${staffToken}` }
        });

        await sleep(500);

        log('\nBuscando produtos com estoque baixo...', 'yellow');
        const response = await axios.get(`${BASE_URL}/protected/produtos?estoque_baixo=true`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        if (response.status === 200 && Array.isArray(response.data)) {
            log('✅ SUCESSO: Filtro de estoque baixo funcionando', 'green');
            log(`   Produtos com estoque baixo: ${response.data.length}`, 'yellow');
        } else {
            log('❌ FALHA: Resposta inválida', 'red');
        }
    } catch (error) {
        log(`❌ ERRO: ${error.response?.data?.error || error.message}`, 'red');
    }
}

async function testDeleteProduto() {
    log('\n========== TESTE: Deletar Produto ==========', 'blue');

    try {
        log('\nDeletando produto...', 'yellow');
        const response = await axios.delete(`${BASE_URL}/protected/produtos/${produtoId}`, {
            headers: { Authorization: `Bearer ${staffToken}` }
        });

        if (response.status === 200) {
            log('✅ SUCESSO: Produto deletado', 'green');
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
        await axios.get(`${BASE_URL}/protected/produtos`);
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
        await axios.get(`${BASE_URL}/protected/produtos`, {
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
    log('║     TESTES DE PRODUTOS/ESTOQUE - API         ║', 'blue');
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

        await testCreateProdutoValidation();
        await sleep(500);

        await testCreateProdutoSuccess();
        await sleep(500);

        await testCreateProdutoDuplicado();
        await sleep(500);

        await testGetProdutos();
        await sleep(500);

        await testGetProdutoById();
        await sleep(500);

        await testUpdateProduto();
        await sleep(500);

        await testAjustarEstoque();
        await sleep(500);

        await testAjustarEstoqueInsuficiente();
        await sleep(500);

        await testGetRelatorioEstoque();
        await sleep(500);

        await testGetProdutosFiltros();
        await sleep(500);

        await testDeleteProduto();

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
