// Funcionalidades específicas da empresa

// Carregar currículos
function loadCurriculos() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // Validar usuário
    if (!currentUser) {
        alert('Você precisa fazer login para acessar esta área.');
        window.location.href = 'index.html';
        return;
    }
    
    if (currentUser.type !== 'empresa') {
        alert('Acesso negado. Esta área é exclusiva para empresas.');
        window.location.href = 'index.html';
        return;
    }
    
    // Verificar se a empresa existe na lista de empresas
    const empresas = JSON.parse(localStorage.getItem('empresas') || '[]');
    const empresa = empresas.find(e => e.userId === currentUser.id);
    
    if (!empresa) {
        // Criar registro da empresa se não existir
        empresas.push({
            userId: currentUser.id,
            name: currentUser.name,
            email: currentUser.email,
            cnpj: currentUser.cnpj || null,
            type: 'empresa',
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
        });
        localStorage.setItem('empresas', JSON.stringify(empresas));
    }
    
    // Verificar pagamento da empresa
    const pagamentos = JSON.parse(localStorage.getItem('pagamentos') || '[]');
    const pagamentoEmpresa = pagamentos.find(p => p.userId === currentUser.id && p.tipo === 'empresa' && p.status === 'aprovado');
    
    if (!pagamentoEmpresa) {
        // Mostrar tela de pagamento
        showEmpresaPaymentScreen();
    } else {
        filterCurriculos();
    }
}

// Filtrar currículos por profissão e área
function filterCurriculos() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // Validar que é uma empresa
    if (!currentUser || currentUser.type !== 'empresa') {
        return;
    }
    
    // Verificar se empresa pagou
    const pagamentos = JSON.parse(localStorage.getItem('pagamentos') || '[]');
    const pagamentoEmpresa = pagamentos.find(p => p.userId === currentUser.id && p.tipo === 'empresa' && p.status === 'aprovado');
    
    if (!pagamentoEmpresa) {
        showEmpresaPaymentScreen();
        return;
    }
    
    const profissao = document.getElementById('filterProfissao').value;
    const area = document.getElementById('filterArea').value;
    const curriculos = JSON.parse(localStorage.getItem('curriculos') || '[]');
    const prestadores = JSON.parse(localStorage.getItem('prestadores') || '[]');
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const pagamentosPrestadores = JSON.parse(localStorage.getItem('pagamentos') || '[]');
    
    // Filtrar apenas prestadores de serviço ativos que têm currículo completo E pagaram
    let filteredCurriculos = curriculos.filter(c => {
        // Verificar se o usuário existe e é prestador
        const user = users.find(u => u.id === c.userId && u.type === 'prestador' && u.active !== false);
        if (!user) return false;
        
        // Verificar se o prestador está ativo
        const prestador = prestadores.find(p => p.userId === c.userId);
        if (!prestador) return false;
        
        // Verificar se o prestador pagou
        const pagamentoPrestador = pagamentosPrestadores.find(p => p.userId === c.userId && p.tipo === 'prestador' && p.status === 'aprovado');
        if (!pagamentoPrestador) return false;
        
        // Verificar se tem dados mínimos do currículo
        return c.nomeCompleto && c.profissao;
    });
    
    // Filtrar por profissão se selecionada
    if (profissao) {
        filteredCurriculos = filteredCurriculos.filter(c => c.profissao === profissao);
    }
    
    // Filtrar por área de atuação se selecionada
    if (area) {
        filteredCurriculos = filteredCurriculos.filter(c => c.areaAtuacao === area);
    }
    
    displayCurriculos(filteredCurriculos);
}

// Exibir currículos
function displayCurriculos(curriculos) {
    const container = document.getElementById('curriculosList');
    
    if (curriculos.length === 0) {
        container.innerHTML = '<p class="empty-message">Nenhum currículo disponível no momento.</p>';
        return;
    }
    
    container.innerHTML = curriculos.map(curriculo => {
        // Criar preview com informações principais
        let preview = '';
        if (curriculo.objetivoProfissional) {
            preview = curriculo.objetivoProfissional.substring(0, 150) + (curriculo.objetivoProfissional.length > 150 ? '...' : '');
        } else if (curriculo.experiencias && curriculo.experiencias.length > 0) {
            preview = curriculo.experiencias[0].cargo + ' - ' + curriculo.experiencias[0].empresa;
        } else if (curriculo.habilidadesTecnicas) {
            preview = curriculo.habilidadesTecnicas.substring(0, 150) + (curriculo.habilidadesTecnicas.length > 150 ? '...' : '');
        }
        
        const especialidades = curriculo.especialidades && curriculo.especialidades.length > 0 
            ? curriculo.especialidades.slice(0, 3).join(', ') + (curriculo.especialidades.length > 3 ? '...' : '')
            : '';
        
        return `
            <div class="curriculo-card" onclick="showCurriculoDetail('${curriculo.id}')">
                <h3>${curriculo.nomeCompleto}</h3>
                <span class="profissao">${curriculo.profissao}</span>
                ${curriculo.areaAtuacao ? `<div class="info-item"><strong>Área:</strong> ${curriculo.areaAtuacao}</div>` : ''}
                ${especialidades ? `<div class="info-item"><strong>Especialidades:</strong> ${especialidades}</div>` : ''}
                ${curriculo.anosExperiencia ? `<div class="info-item"><strong>Experiência:</strong> ${curriculo.anosExperiencia}</div>` : ''}
                <div class="info-item">
                    <strong>Email:</strong> ${curriculo.email}
                </div>
                <div class="info-item">
                    <strong>Telefone:</strong> ${curriculo.telefone}
                </div>
                ${curriculo.cidade ? `<div class="info-item"><strong>Localização:</strong> ${curriculo.cidade}, ${curriculo.estado || ''}</div>` : ''}
                <div class="preview">
                    ${preview || 'Sem descrição disponível'}
                </div>
            </div>
        `;
    }).join('');
}

// Mostrar detalhes do currículo
function showCurriculoDetail(curriculoId) {
    const curriculos = JSON.parse(localStorage.getItem('curriculos') || '[]');
    const curriculo = curriculos.find(c => c.id === curriculoId);
    
    if (!curriculo) return;
    
    // Criar modal se não existir
    let modal = document.getElementById('curriculoModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'curriculoModal';
        modal.className = 'curriculo-modal';
        modal.innerHTML = `
            <div class="curriculo-modal-content">
                <span class="close" onclick="closeCurriculoModal()">&times;</span>
                <div id="curriculoModalContent"></div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    const content = document.getElementById('curriculoModalContent');
    
    let html = `
        <h2 style="color: #4a90e2; margin-bottom: 20px;">${curriculo.nomeCompleto}</h2>
        <div style="margin-bottom: 15px;">
            <span class="profissao">${curriculo.profissao}</span>
            ${curriculo.areaAtuacao ? ` | <span style="color: #666;">${curriculo.areaAtuacao}</span>` : ''}
        </div>
        
        <div class="section" style="margin-bottom: 20px;">
            <div class="section-title">Dados de Contato</div>
            <div class="section-content">
                <strong>Telefone:</strong> ${curriculo.telefone}<br>
                ${curriculo.telefone2 ? `<strong>Telefone Alternativo:</strong> ${curriculo.telefone2}<br>` : ''}
                <strong>Email:</strong> ${curriculo.email}<br>
                <strong>Endereço:</strong> ${curriculo.endereco || 'Não informado'}<br>
                ${curriculo.cidade ? `${curriculo.cidade}, ${curriculo.estado || ''} ${curriculo.cep ? `- CEP: ${curriculo.cep}` : ''}` : ''}
            </div>
        </div>
        
        ${curriculo.objetivoProfissional ? `
        <div class="section" style="margin-bottom: 20px;">
            <div class="section-title">Objetivo Profissional</div>
            <div class="section-content">${curriculo.objetivoProfissional}</div>
        </div>
        ` : ''}
        
        <div class="section" style="margin-bottom: 20px;">
            <div class="section-title">Informações Profissionais</div>
            <div class="section-content">
                <strong>Profissão:</strong> ${curriculo.profissao}<br>
                ${curriculo.areaAtuacao ? `<strong>Área de Atuação:</strong> ${curriculo.areaAtuacao}<br>` : ''}
                ${curriculo.anosExperiencia ? `<strong>Anos de Experiência:</strong> ${curriculo.anosExperiencia}<br>` : ''}
                ${curriculo.especialidades && curriculo.especialidades.length > 0 ? `<strong>Especialidades:</strong> ${curriculo.especialidades.join(', ')}<br>` : ''}
                ${curriculo.especialidadesOutros ? `<strong>Outras Especialidades:</strong> ${curriculo.especialidadesOutros}<br>` : ''}
            </div>
        </div>
    `;
    
    if (curriculo.experiencias && curriculo.experiencias.length > 0) {
        html += `<div class="section" style="margin-bottom: 20px;">
            <div class="section-title">Experiência Profissional</div>
            <div class="section-content">`;
        curriculo.experiencias.forEach(exp => {
            html += `<strong>${exp.cargo || 'Cargo não informado'}</strong> - ${exp.empresa || 'Empresa não informada'}<br>`;
            if (exp.inicio || exp.termino || exp.atual) {
                html += `${exp.inicio || ''} ${exp.atual ? 'até o momento' : (exp.termino ? `até ${exp.termino}` : '')}<br>`;
            }
            if (exp.descricao) html += `${exp.descricao}<br>`;
            html += `<br>`;
        });
        html += `</div></div>`;
    } else if (curriculo.experiencia) {
        html += `<div class="section" style="margin-bottom: 20px;">
            <div class="section-title">Experiência Profissional</div>
            <div class="section-content">${curriculo.experiencia}</div>
        </div>`;
    }
    
    if (curriculo.formacoes && curriculo.formacoes.length > 0) {
        html += `<div class="section" style="margin-bottom: 20px;">
            <div class="section-title">Formação Acadêmica</div>
            <div class="section-content">`;
        curriculo.formacoes.forEach(form => {
            html += `<strong>${form.nivel || 'Nível não informado'}</strong> em ${form.curso || 'Curso não informado'}<br>`;
            html += `${form.instituicao || ''} ${form.status ? `- ${form.status}` : ''} ${form.ano ? `(${form.ano})` : ''}<br><br>`;
        });
        html += `</div></div>`;
    } else if (curriculo.formacao) {
        html += `<div class="section" style="margin-bottom: 20px;">
            <div class="section-title">Formação Acadêmica</div>
            <div class="section-content">${curriculo.formacao}</div>
        </div>`;
    }
    
    if (curriculo.habilidadesTecnicas) {
        html += `<div class="section" style="margin-bottom: 20px;">
            <div class="section-title">Habilidades Técnicas</div>
            <div class="section-content">${curriculo.habilidadesTecnicas}</div>
        </div>`;
    } else if (curriculo.habilidades) {
        html += `<div class="section" style="margin-bottom: 20px;">
            <div class="section-title">Habilidades e Competências</div>
            <div class="section-content">${curriculo.habilidades}</div>
        </div>`;
    }
    
    if (curriculo.softSkills && curriculo.softSkills.length > 0) {
        html += `<div class="section" style="margin-bottom: 20px;">
            <div class="section-title">Competências Comportamentais</div>
            <div class="section-content">${curriculo.softSkills.join(', ')}</div>
        </div>`;
    }
    
    if (curriculo.idiomas && curriculo.idiomas.length > 0) {
        html += `<div class="section" style="margin-bottom: 20px;">
            <div class="section-title">Idiomas</div>
            <div class="section-content">`;
        curriculo.idiomas.forEach(idioma => {
            html += `<strong>${idioma.nome}:</strong> ${idioma.nivel}<br>`;
        });
        html += `</div></div>`;
    } else if (curriculo.idiomas) {
        html += `<div class="section" style="margin-bottom: 20px;">
            <div class="section-title">Idiomas</div>
            <div class="section-content">${curriculo.idiomas}</div>
        </div>`;
    }
    
    if (curriculo.certificacoes && Array.isArray(curriculo.certificacoes) && curriculo.certificacoes.length > 0) {
        html += `<div class="section" style="margin-bottom: 20px;">
            <div class="section-title">Certificações</div>
            <div class="section-content">`;
        curriculo.certificacoes.forEach(cert => {
            html += `<strong>${cert.nome || 'Certificação'}</strong> - ${cert.instituicao || ''} ${cert.ano ? `(${cert.ano})` : ''} ${cert.codigo ? `- Código: ${cert.codigo}` : ''}<br>`;
        });
        html += `</div></div>`;
    } else if (curriculo.certificacoes && typeof curriculo.certificacoes === 'string') {
        html += `<div class="section" style="margin-bottom: 20px;">
            <div class="section-title">Certificações</div>
            <div class="section-content">${curriculo.certificacoes}</div>
        </div>`;
    }
    
    if (curriculo.regimeTrabalho && curriculo.regimeTrabalho.length > 0) {
        html += `<div class="section" style="margin-bottom: 20px;">
            <div class="section-title">Disponibilidade e Preferências</div>
            <div class="section-content">
                <strong>Regime de Trabalho:</strong> ${curriculo.regimeTrabalho.join(', ')}<br>
                ${curriculo.modalidadeTrabalho && curriculo.modalidadeTrabalho.length > 0 ? `<strong>Modalidade:</strong> ${curriculo.modalidadeTrabalho.join(', ')}<br>` : ''}
                ${curriculo.disponibilidade && curriculo.disponibilidade.length > 0 ? `<strong>Disponibilidade:</strong> ${curriculo.disponibilidade.join(', ')}<br>` : ''}
                ${curriculo.jornadaPreferida ? `<strong>Jornada Preferida:</strong> ${curriculo.jornadaPreferida}<br>` : ''}
                ${curriculo.regiaoAtuacao ? `<strong>Região de Atuação:</strong> ${curriculo.regiaoAtuacao}<br>` : ''}
                ${curriculo.faixaSalarial ? `<strong>Faixa Salarial:</strong> ${curriculo.faixaSalarial}` : ''}
            </div>
        </div>`;
    }
    
    if (curriculo.linkedin || curriculo.github || curriculo.portfolio || curriculo.outrosLinks) {
        html += `<div class="section" style="margin-bottom: 20px;">
            <div class="section-title">Links e Portfólio</div>
            <div class="section-content">`;
        if (curriculo.linkedin) html += `<strong>LinkedIn:</strong> <a href="${curriculo.linkedin}" target="_blank">${curriculo.linkedin}</a><br>`;
        if (curriculo.github) html += `<strong>GitHub:</strong> <a href="${curriculo.github}" target="_blank">${curriculo.github}</a><br>`;
        if (curriculo.portfolio) html += `<strong>Portfólio:</strong> <a href="${curriculo.portfolio}" target="_blank">${curriculo.portfolio}</a><br>`;
        if (curriculo.outrosLinks) {
            const links = curriculo.outrosLinks.split('\n').filter(link => link.trim());
            links.forEach(link => {
                html += `<a href="${link.trim()}" target="_blank">${link.trim()}</a><br>`;
            });
        }
        html += `</div></div>`;
    }
    
    if (curriculo.referencias && curriculo.referencias.length > 0) {
        html += `<div class="section" style="margin-bottom: 20px;">
            <div class="section-title">Referências Profissionais</div>
            <div class="section-content">`;
        curriculo.referencias.forEach(ref => {
            html += `<strong>${ref.nome || 'Nome não informado'}</strong> - ${ref.cargo || ''}<br>`;
            html += `${ref.empresa || ''}<br>`;
            html += `${ref.contato || ''}<br><br>`;
        });
        html += `</div></div>`;
    }
    
    if (curriculo.informacoesAdicionais) {
        html += `<div class="section" style="margin-bottom: 20px;">
            <div class="section-title">Informações Adicionais</div>
            <div class="section-content">${curriculo.informacoesAdicionais}</div>
        </div>`;
    }
    
    html += `
        <div class="contact-info">
            <p><strong>Entre em contato com este profissional:</strong></p>
            <p><strong>Email:</strong> <a href="mailto:${curriculo.email}">${curriculo.email}</a></p>
            <p><strong>Telefone:</strong> <a href="tel:${curriculo.telefone.replace(/\D/g, '')}">${curriculo.telefone}</a></p>
            ${curriculo.telefone2 ? `<p><strong>Telefone Alternativo:</strong> <a href="tel:${curriculo.telefone2.replace(/\D/g, '')}">${curriculo.telefone2}</a></p>` : ''}
        </div>
    `;
    
    content.innerHTML = html;
    
    modal.style.display = 'block';
}

// Fechar modal de currículo
function closeCurriculoModal() {
    document.getElementById('curriculoModal').style.display = 'none';
}

// Fechar modal ao clicar fora
window.onclick = function(event) {
    const modal = document.getElementById('curriculoModal');
    if (event.target === modal) {
        closeCurriculoModal();
    }
}

// Mostrar tela de pagamento da empresa
function showEmpresaPaymentScreen() {
    document.getElementById('dashboard-section').style.display = 'none';
    document.getElementById('empresaPaymentScreen').style.display = 'block';
    document.getElementById('empresaPaymentScreen').scrollIntoView({ behavior: 'smooth' });
}

// Copiar código PIX da empresa
function copyEmpresaPixCode() {
    const pixCode = document.getElementById('empresaPixCode');
    pixCode.select();
    document.execCommand('copy');
    alert('Código PIX copiado! Cole no app do seu banco.');
}

// Confirmar pagamento da empresa
function confirmEmpresaPayment() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;
    
    // Criar registro de pagamento
    const pagamentos = JSON.parse(localStorage.getItem('pagamentos') || '[]');
    const novoPagamento = {
        id: Date.now().toString(),
        userId: currentUser.id,
        tipo: 'empresa',
        valor: 14.99,
        metodo: 'PIX',
        status: 'aprovado',
        dataPagamento: new Date().toISOString(),
        tipoAssinatura: 'mensal'
    };
    
    pagamentos.push(novoPagamento);
    localStorage.setItem('pagamentos', JSON.stringify(pagamentos));
    
    // Atualizar status da empresa
    const empresas = JSON.parse(localStorage.getItem('empresas') || '[]');
    const empresaIndex = empresas.findIndex(e => e.userId === currentUser.id);
    if (empresaIndex >= 0) {
        empresas[empresaIndex].pagamentoAprovado = true;
        empresas[empresaIndex].dataPagamento = new Date().toISOString();
        empresas[empresaIndex].assinaturaAtiva = true;
        localStorage.setItem('empresas', JSON.stringify(empresas));
    }
    
    alert('Pagamento confirmado! Agora você tem acesso a todos os currículos.');
    
    // Esconder tela de pagamento e mostrar área de busca
    document.getElementById('empresaPaymentScreen').style.display = 'none';
    document.getElementById('dashboard-section').style.display = 'block';
    filterCurriculos();
}

// Cancelar pagamento da empresa
function cancelEmpresaPayment() {
    document.getElementById('empresaPaymentScreen').style.display = 'none';
    document.getElementById('dashboard-section').style.display = 'block';
    alert('Para visualizar os currículos, é necessário realizar o pagamento da assinatura.');
}

// Carregar ao inicializar
document.addEventListener('DOMContentLoaded', function() {
    loadCurriculos();
});
