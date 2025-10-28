const API_URL = 'http://localhost:3000';

// Gera email único para cada teste
const uniqueEmail = `test${Date.now()}@test.com`;

async function testRegister() {
    console.log('\n🧪 Testando REGISTRO...');
    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Teste Usuario',
                email: uniqueEmail,
                phone: '11999999999',
                password: 'Teste123'
            })
        });

        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(data, null, 2));

        if (response.ok) {
            console.log('✅ REGISTRO funcionou!');
            console.log('   Token:', data.token ? 'OK' : 'FALTANDO');
            console.log('   User:', data.user ? 'OK' : 'FALTANDO');
            console.log('   User.name:', data.user?.name || 'FALTANDO');
            return data;
        } else {
            console.log('❌ REGISTRO falhou:', data.error);
            return null;
        }
    } catch (error) {
        console.log('❌ Erro de conexão:', error.message);
        return null;
    }
}

async function testLogin() {
    console.log('\n🧪 Testando LOGIN...');
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: uniqueEmail,
                password: 'Teste123'
            })
        });

        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(data, null, 2));

        if (response.ok) {
            console.log('✅ LOGIN funcionou!');
            console.log('   Token:', data.token ? 'OK' : 'FALTANDO');
            console.log('   User:', data.user ? 'OK' : 'FALTANDO');
            console.log('   User.name:', data.user?.name || 'FALTANDO');
            return data;
        } else {
            console.log('❌ LOGIN falhou:', data.error);
            return null;
        }
    } catch (error) {
        console.log('❌ Erro de conexão:', error.message);
        return null;
    }
}

async function testAdminLogin() {
    console.log('\n🧪 Testando ADMIN LOGIN...');
    console.log('⚠️  Nota: Este teste só funciona se houver um admin cadastrado no banco');
    console.log('    Tente criar um admin primeiro ou pule este teste se falhar\n');

    try {
        const response = await fetch(`${API_URL}/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@duskpet.com',
                password: 'Admin123'
            })
        });

        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(data, null, 2));

        if (response.ok) {
            console.log('✅ ADMIN LOGIN funcionou!');
            console.log('   Token:', data.token ? 'OK' : 'FALTANDO');
            console.log('   User:', data.user ? 'OK' : 'FALTANDO');
            console.log('   User.name:', data.user?.name || 'FALTANDO');
            return data;
        } else {
            console.log('⚠️  ADMIN LOGIN falhou (pode ser que não exista admin cadastrado)');
            console.log('   Erro:', data.error);
            return null;
        }
    } catch (error) {
        console.log('❌ Erro de conexão:', error.message);
        return null;
    }
}

async function runTests() {
    console.log('='.repeat(50));
    console.log('🚀 INICIANDO TESTES DE AUTENTICAÇÃO');
    console.log('='.repeat(50));

    // Teste 1: Registro
    const registerData = await testRegister();

    if (!registerData) {
        console.log('\n❌ REGISTRO FALHOU - Parando testes');
        return;
    }

    // Pequena pausa
    await new Promise(resolve => setTimeout(resolve, 500));

    // Teste 2: Login
    const loginData = await testLogin();

    if (!loginData) {
        console.log('\n❌ LOGIN FALHOU');
    }

    // Pequena pausa
    await new Promise(resolve => setTimeout(resolve, 500));

    // Teste 3: Admin (opcional)
    await testAdminLogin();

    console.log('\n' + '='.repeat(50));
    console.log('✨ TESTES CONCLUÍDOS');
    console.log('='.repeat(50));
    console.log('\n💡 Se os testes passaram, o auth.html deve funcionar!');
    console.log('   Abra http://localhost:3000/public/auth.html no navegador');
}

// Executa os testes
runTests().catch(console.error);
