// Sistema de autenticação e navegação

// Estrutura de dados organizada
function initDataStructure() {
    // Inicializar estrutura se não existir
    if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify([]));
    }
    if (!localStorage.getItem('prestadores')) {
        localStorage.setItem('prestadores', JSON.stringify([]));
    }
    if (!localStorage.getItem('empresas')) {
        localStorage.setItem('empresas', JSON.stringify([]));
    }
    if (!localStorage.getItem('curriculos')) {
        localStorage.setItem('curriculos', JSON.stringify([]));
    }
}

// Verificar se usuário está logado
function checkAuth() {
    initDataStructure();
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const currentPage = window.location.pathname.split('/').pop();
    
    // Se não está logado e não está na página inicial, redirecionar
    if (!currentUser && currentPage !== 'index.html' && currentPage !== '') {
        window.location.href = 'index.html';
        return false;
    }
    
    // Se está logado, verificar se o tipo de usuário corresponde à página
    if (currentUser) {
        const userName = document.getElementById('userName');
        if (userName) {
            userName.textContent = `Olá, ${currentUser.name}`;
        }
        
        // Verificar se o tipo de usuário corresponde à página
        if (currentPage === 'prestador.html' && currentUser.type !== 'prestador') {
            alert('Acesso negado. Esta área é exclusiva para prestadores de serviço.');
            logout();
            return false;
        }
        
        if (currentPage === 'empresa.html' && currentUser.type !== 'empresa') {
            alert('Acesso negado. Esta área é exclusiva para empresas.');
            logout();
            return false;
        }
    }
    
    return currentUser;
}

// Mostrar modal de login
function showLogin(type) {
    const modal = document.getElementById('loginModal');
    const title = document.getElementById('loginTitle');
    const typeInput = document.getElementById('loginType');
    
    title.textContent = `Login - ${type === 'prestador' ? 'Prestador de Serviço' : 'Empresa'}`;
    typeInput.value = type;
    modal.style.display = 'block';
}

// Mostrar modal de cadastro
function showRegister(type) {
    const modal = document.getElementById('registerModal');
    const title = document.getElementById('registerTitle');
    const typeInput = document.getElementById('registerType');
    const empresaFields = document.getElementById('empresaFields');
    
    title.textContent = `Cadastro - ${type === 'prestador' ? 'Prestador de Serviço' : 'Empresa'}`;
    typeInput.value = type;
    
    if (type === 'empresa') {
        empresaFields.style.display = 'block';
    } else {
        empresaFields.style.display = 'none';
    }
    
    modal.style.display = 'block';
}

// Fechar modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
    
    // Limpar formulário
    const form = document.getElementById(modalId.replace('Modal', 'Form'));
    if (form) {
        form.reset();
        // Limpar mensagens de erro se houver
        const errorMessages = form.querySelectorAll('.error-message');
        errorMessages.forEach(msg => msg.remove());
    }
}

// Fechar modal ao clicar fora
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Handle Login
function handleLogin(event) {
    event.preventDefault();
    
    initDataStructure();
    
    const type = document.getElementById('loginType').value;
    const email = document.getElementById('loginEmail').value.trim().toLowerCase();
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        alert('Por favor, preencha todos os campos!');
        return;
    }
    
    // Buscar usuários
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Verificar se o email existe
    const userByEmail = users.find(u => u.email.toLowerCase() === email);
    
    const errorDiv = document.getElementById('loginError');
    
    if (!userByEmail) {
        if (errorDiv) {
            errorDiv.textContent = 'Email não cadastrado! Por favor, verifique o email ou faça um cadastro.';
            errorDiv.style.display = 'block';
        } else {
            alert('Email não cadastrado! Por favor, verifique o email ou faça um cadastro.');
        }
        return;
    }
    
    // Verificar se o tipo corresponde
    if (userByEmail.type !== type) {
        const tipoCorreto = userByEmail.type === 'prestador' ? 'Prestador de Serviço' : 'Empresa';
        if (errorDiv) {
            errorDiv.textContent = `Este email está cadastrado como ${tipoCorreto}. Por favor, faça login na área correta.`;
            errorDiv.style.display = 'block';
        } else {
            alert(`Este email está cadastrado como ${tipoCorreto}. Por favor, faça login na área correta.`);
        }
        return;
    }
    
    // Verificar se o usuário está ativo
    if (userByEmail.active === false) {
        if (errorDiv) {
            errorDiv.textContent = 'Sua conta está desativada. Entre em contato com o suporte.';
            errorDiv.style.display = 'block';
        } else {
            alert('Sua conta está desativada. Entre em contato com o suporte.');
        }
        return;
    }
    
    // Verificar senha
    if (userByEmail.password !== password) {
        if (errorDiv) {
            errorDiv.textContent = 'Senha incorreta! Por favor, tente novamente.';
            errorDiv.style.display = 'block';
        } else {
            alert('Senha incorreta! Por favor, tente novamente.');
        }
        return;
    }
    
    // Limpar mensagens de erro se login for bem-sucedido
    if (errorDiv) {
        errorDiv.style.display = 'none';
    }
    
    // Login bem-sucedido - Salvar usuário atual
    const currentUserData = {
        id: userByEmail.id,
        name: userByEmail.name,
        email: userByEmail.email,
        type: userByEmail.type,
        cnpj: userByEmail.cnpj || null,
        createdAt: userByEmail.createdAt
    };
    
    localStorage.setItem('currentUser', JSON.stringify(currentUserData));
    
    // Atualizar dados específicos do tipo
    if (type === 'prestador') {
        updatePrestadorData(userByEmail.id, currentUserData);
    } else {
        updateEmpresaData(userByEmail.id, currentUserData);
    }
    
    // Redirecionar
    if (type === 'prestador') {
        window.location.href = 'prestador.html';
    } else {
        window.location.href = 'empresa.html';
    }
}

// Atualizar dados do prestador
function updatePrestadorData(userId, userData) {
    const prestadores = JSON.parse(localStorage.getItem('prestadores') || '[]');
    const prestadorIndex = prestadores.findIndex(p => p.userId === userId);
    
    if (prestadorIndex >= 0) {
        prestadores[prestadorIndex] = {
            ...prestadores[prestadorIndex],
            ...userData,
            lastLogin: new Date().toISOString()
        };
    } else {
        prestadores.push({
            userId: userId,
            ...userData,
            lastLogin: new Date().toISOString()
        });
    }
    
    localStorage.setItem('prestadores', JSON.stringify(prestadores));
}

// Atualizar dados da empresa
function updateEmpresaData(userId, userData) {
    const empresas = JSON.parse(localStorage.getItem('empresas') || '[]');
    const empresaIndex = empresas.findIndex(e => e.userId === userId);
    
    if (empresaIndex >= 0) {
        empresas[empresaIndex] = {
            ...empresas[empresaIndex],
            ...userData,
            lastLogin: new Date().toISOString()
        };
    } else {
        empresas.push({
            userId: userId,
            ...userData,
            lastLogin: new Date().toISOString()
        });
    }
    
    localStorage.setItem('empresas', JSON.stringify(empresas));
}

// Handle Register
function handleRegister(event) {
    event.preventDefault();
    
    initDataStructure();
    
    const type = document.getElementById('registerType').value;
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim().toLowerCase();
    const password = document.getElementById('registerPassword').value;
    const cnpj = document.getElementById('registerCNPJ')?.value.trim() || '';
    
    // Validações
    if (!name || !email || !password) {
        alert('Por favor, preencha todos os campos obrigatórios!');
        return;
    }
    
    if (password.length < 6) {
        alert('A senha deve ter no mínimo 6 caracteres!');
        return;
    }
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Por favor, insira um email válido!');
        return;
    }
    
    // Buscar usuários existentes
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    const errorDiv = document.getElementById('registerError');
    
    // Verificar se email já existe
    if (users.some(u => u.email.toLowerCase() === email)) {
        if (errorDiv) {
            errorDiv.textContent = 'Este email já está cadastrado! Por favor, use outro email ou faça login.';
            errorDiv.style.display = 'block';
        } else {
            alert('Este email já está cadastrado! Por favor, use outro email ou faça login.');
        }
        return;
    }
    
    // Limpar mensagens de erro anteriores
    if (errorDiv) {
        errorDiv.style.display = 'none';
    }
    
    // Validar CNPJ se for empresa
    if (type === 'empresa' && cnpj) {
        const cnpjLimpo = cnpj.replace(/\D/g, '');
        if (cnpjLimpo.length !== 14) {
            alert('CNPJ inválido! Por favor, verifique o número.');
            return;
        }
        
        // Verificar se CNPJ já está cadastrado
        if (users.some(u => u.cnpj && u.cnpj.replace(/\D/g, '') === cnpjLimpo)) {
            alert('Este CNPJ já está cadastrado!');
            return;
        }
    }
    
    // Criar ID único
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Criar novo usuário
    const newUser = {
        id: userId,
        name: name,
        email: email,
        password: password,
        type: type,
        cnpj: cnpj || null,
        createdAt: new Date().toISOString(),
        active: true
    };
    
    // Adicionar usuário à lista geral
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Criar registro específico por tipo
    if (type === 'prestador') {
        const prestadores = JSON.parse(localStorage.getItem('prestadores') || '[]');
        prestadores.push({
            userId: userId,
            name: name,
            email: email,
            type: type,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            profileComplete: false
        });
        localStorage.setItem('prestadores', JSON.stringify(prestadores));
    } else {
        const empresas = JSON.parse(localStorage.getItem('empresas') || '[]');
        empresas.push({
            userId: userId,
            name: name,
            email: email,
            cnpj: cnpj || null,
            type: type,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
        });
        localStorage.setItem('empresas', JSON.stringify(empresas));
    }
    
    // Fazer login automático
    const currentUserData = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        type: newUser.type,
        cnpj: newUser.cnpj
    };
    
    localStorage.setItem('currentUser', JSON.stringify(currentUserData));
    
    // Enviar email de boas-vindas
    sendWelcomeEmail(email, name, type);
    
    alert('Cadastro realizado com sucesso! Um email de confirmação foi enviado. Você será redirecionado...');
    
    // Redirecionar após pequeno delay
    setTimeout(() => {
        if (type === 'prestador') {
            window.location.href = 'prestador.html';
        } else {
            window.location.href = 'empresa.html';
        }
    }, 500);
}

// Função para enviar email de boas-vindas
function sendWelcomeEmail(userEmail, userName, userType) {
    // Verificar se EmailJS está disponível e configurado
    if (typeof emailjs === 'undefined') {
        console.log('EmailJS não configurado. Para ativar o envio de emails, configure suas credenciais. Veja EMAILJS_SETUP.md');
        return;
    }
    
    const tipoUsuario = userType === 'prestador' ? 'Prestador de Serviço' : 'Empresa';
    const mensagem = userType === 'prestador' 
        ? 'Seu cadastro foi realizado com sucesso! Agora você pode criar seu currículo profissional e torná-lo visível para empresas após o pagamento de R$ 14,99.'
        : 'Sua empresa foi cadastrada com sucesso! Agora você pode buscar e contratar profissionais qualificados após realizar a assinatura de R$ 14,99/mês.';
    
    const templateParams = {
        to_email: userEmail,
        to_name: userName,
        user_type: tipoUsuario,
        message: mensagem,
        subject: 'Bem-vindo ao Portal de Serviços Profissionais!',
        site_url: window.location.origin
    };
    
    // IMPORTANTE: Configure suas credenciais do EmailJS
    // Substitua 'YOUR_SERVICE_ID' e 'YOUR_TEMPLATE_ID' pelas suas credenciais
    // Veja o arquivo EMAILJS_SETUP.md para instruções detalhadas
    
    const SERVICE_ID = 'YOUR_SERVICE_ID'; // Substitua pelo seu Service ID
    const TEMPLATE_ID = 'YOUR_TEMPLATE_ID'; // Substitua pelo seu Template ID
    
    // Verificar se as credenciais foram configuradas
    if (SERVICE_ID === 'YOUR_SERVICE_ID' || TEMPLATE_ID === 'YOUR_TEMPLATE_ID') {
        console.log('EmailJS não configurado. Configure SERVICE_ID e TEMPLATE_ID no script.js');
        return;
    }
    
    // Enviar email usando EmailJS
    emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams)
        .then(function(response) {
            console.log('✅ Email enviado com sucesso para:', userEmail, response.status, response.text);
        }, function(error) {
            console.error('❌ Erro ao enviar email:', error);
            // Não mostrar erro para o usuário, apenas logar no console
            // O cadastro foi realizado com sucesso mesmo se o email falhar
        });
}

// Logout
function logout() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (currentUser) {
        // Atualizar último acesso antes de sair
        if (currentUser.type === 'prestador') {
            const prestadores = JSON.parse(localStorage.getItem('prestadores') || '[]');
            const prestador = prestadores.find(p => p.userId === currentUser.id);
            if (prestador) {
                prestador.lastLogout = new Date().toISOString();
                localStorage.setItem('prestadores', JSON.stringify(prestadores));
            }
        } else {
            const empresas = JSON.parse(localStorage.getItem('empresas') || '[]');
            const empresa = empresas.find(e => e.userId === currentUser.id);
            if (empresa) {
                empresa.lastLogout = new Date().toISOString();
                localStorage.setItem('empresas', JSON.stringify(empresas));
            }
        }
    }
    
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Obter dados completos do usuário atual
function getCurrentUserData() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return null;
    
    if (currentUser.type === 'prestador') {
        const prestadores = JSON.parse(localStorage.getItem('prestadores') || '[]');
        return prestadores.find(p => p.userId === currentUser.id) || currentUser;
    } else {
        const empresas = JSON.parse(localStorage.getItem('empresas') || '[]');
        return empresas.find(e => e.userId === currentUser.id) || currentUser;
    }
}

// Verificar se o usuário atual existe e está ativo
function validateCurrentUser() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return false;
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.id === currentUser.id);
    
    if (!user || !user.active) {
        logout();
        return false;
    }
    
    return true;
}

// Inicializar ao carregar página
document.addEventListener('DOMContentLoaded', function() {
    initDataStructure();
    checkAuth();
    validateCurrentUser();
});
