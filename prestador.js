// Funcionalidades específicas do prestador

let editing = false;

// Carregar dados do prestador
function loadPrestadorData() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // Validar usuário
    if (!currentUser) {
        alert('Você precisa fazer login para acessar esta área.');
        window.location.href = 'index.html';
        return;
    }
    
    if (currentUser.type !== 'prestador') {
        alert('Acesso negado. Esta área é exclusiva para prestadores de serviço.');
        window.location.href = 'index.html';
        return;
    }
    
    // Verificar se o prestador existe na lista de prestadores
    const prestadores = JSON.parse(localStorage.getItem('prestadores') || '[]');
    const prestador = prestadores.find(p => p.userId === currentUser.id);
    
    if (!prestador) {
        // Criar registro do prestador se não existir
        prestadores.push({
            userId: currentUser.id,
            name: currentUser.name,
            email: currentUser.email,
            type: 'prestador',
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            profileComplete: false
        });
        localStorage.setItem('prestadores', JSON.stringify(prestadores));
    }
    
    // Carregar currículo específico deste prestador
    const curriculos = JSON.parse(localStorage.getItem('curriculos') || '[]');
    const curriculo = curriculos.find(c => c.userId === currentUser.id);
    
    if (curriculo) {
        showCurriculoView(curriculo);
    } else {
        showEmptyState();
    }
}

// Mostrar estado vazio
function showEmptyState() {
    document.getElementById('curriculoForm').style.display = 'none';
    document.getElementById('curriculoView').style.display = 'none';
    document.getElementById('statusMessage').textContent = 'Você ainda não cadastrou seu currículo.';
    document.getElementById('curriculoBtnText').textContent = 'Adicionar Currículo';
}

// Mostrar formulário de currículo
function showCurriculoForm() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const curriculos = JSON.parse(localStorage.getItem('curriculos') || '[]');
    const curriculo = curriculos.find(c => c.userId === currentUser.id);
    
    editing = !!curriculo;
    
    if (curriculo) {
        preencherFormulario(curriculo);
    } else {
        // Limpar formulário
        document.getElementById('curriculoFormData').reset();
        // Resetar containers dinâmicos
        resetarContainers();
    }
    
    document.getElementById('curriculoForm').style.display = 'block';
    document.getElementById('curriculoView').style.display = 'none';
    document.getElementById('curriculoForm').scrollIntoView({ behavior: 'smooth' });
}

// Preencher formulário com dados existentes
function preencherFormulario(curriculo) {
    // Dados básicos
    document.getElementById('nomeCompleto').value = curriculo.nomeCompleto || '';
    document.getElementById('cpf').value = curriculo.cpf || '';
    document.getElementById('dataNascimento').value = curriculo.dataNascimento || '';
    document.getElementById('estadoCivil').value = curriculo.estadoCivil || '';
    document.getElementById('telefone').value = curriculo.telefone || '';
    document.getElementById('telefone2').value = curriculo.telefone2 || '';
    document.getElementById('email').value = curriculo.email || '';
    document.getElementById('endereco').value = curriculo.endereco || '';
    document.getElementById('cidade').value = curriculo.cidade || '';
    document.getElementById('estado').value = curriculo.estado || '';
    document.getElementById('cep').value = curriculo.cep || '';
    
    // Profissional
    document.getElementById('objetivoProfissional').value = curriculo.objetivoProfissional || '';
    document.getElementById('profissao').value = curriculo.profissao || '';
    document.getElementById('areaAtuacao').value = curriculo.areaAtuacao || '';
    document.getElementById('anosExperiencia').value = curriculo.anosExperiencia || '';
    
    // Especialidades
    if (curriculo.especialidades) {
        curriculo.especialidades.forEach(esp => {
            const checkbox = document.querySelector(`input[name="especialidades"][value="${esp}"]`);
            if (checkbox) checkbox.checked = true;
        });
        if (curriculo.especialidadesOutros) {
            document.getElementById('especialidadesOutros').value = curriculo.especialidadesOutros;
            document.getElementById('especialidadesOutros').style.display = 'block';
        }
    }
    
    // Experiências
    if (curriculo.experiencias && curriculo.experiencias.length > 0) {
        resetarContainer('experienciasContainer');
        curriculo.experiencias.forEach(exp => adicionarExperiencia(exp));
    }
    
    // Formações
    if (curriculo.formacoes && curriculo.formacoes.length > 0) {
        resetarContainer('formacoesContainer');
        curriculo.formacoes.forEach(form => adicionarFormacao(form));
    }
    
    // Habilidades
    document.getElementById('habilidadesTecnicas').value = curriculo.habilidadesTecnicas || '';
    if (curriculo.softSkills) {
        curriculo.softSkills.forEach(skill => {
            const checkbox = document.querySelector(`input[name="softSkills"][value="${skill}"]`);
            if (checkbox) checkbox.checked = true;
        });
    }
    
    // Idiomas
    if (curriculo.idiomas && curriculo.idiomas.length > 0) {
        resetarContainer('idiomasContainer');
        curriculo.idiomas.forEach(idioma => adicionarIdioma(idioma));
    }
    
    // Certificações
    if (curriculo.certificacoes && curriculo.certificacoes.length > 0) {
        resetarContainer('certificacoesContainer');
        curriculo.certificacoes.forEach(cert => adicionarCertificacao(cert));
    }
    
    // Disponibilidade
    if (curriculo.regimeTrabalho) {
        curriculo.regimeTrabalho.forEach(regime => {
            const checkbox = document.querySelector(`input[name="regimeTrabalho"][value="${regime}"]`);
            if (checkbox) checkbox.checked = true;
        });
    }
    if (curriculo.modalidadeTrabalho) {
        curriculo.modalidadeTrabalho.forEach(modal => {
            const checkbox = document.querySelector(`input[name="modalidadeTrabalho"][value="${modal}"]`);
            if (checkbox) checkbox.checked = true;
        });
    }
    if (curriculo.disponibilidade) {
        curriculo.disponibilidade.forEach(disp => {
            const checkbox = document.querySelector(`input[name="disponibilidade"][value="${disp}"]`);
            if (checkbox) checkbox.checked = true;
        });
    }
    document.getElementById('jornadaPreferida').value = curriculo.jornadaPreferida || '';
    document.getElementById('regiaoAtuacao').value = curriculo.regiaoAtuacao || '';
    document.getElementById('faixaSalarial').value = curriculo.faixaSalarial || '';
    
    // Links
    document.getElementById('linkedin').value = curriculo.linkedin || '';
    document.getElementById('github').value = curriculo.github || '';
    document.getElementById('portfolio').value = curriculo.portfolio || '';
    document.getElementById('outrosLinks').value = curriculo.outrosLinks || '';
    
    // Referências
    if (curriculo.referencias && curriculo.referencias.length > 0) {
        resetarContainer('referenciasContainer');
        curriculo.referencias.forEach(ref => adicionarReferencia(ref));
    }
    
    document.getElementById('informacoesAdicionais').value = curriculo.informacoesAdicionais || '';
}

// Resetar containers dinâmicos
function resetarContainers() {
    resetarContainer('experienciasContainer');
    resetarContainer('formacoesContainer');
    resetarContainer('idiomasContainer');
    resetarContainer('certificacoesContainer');
    resetarContainer('referenciasContainer');
    
    // Adicionar um item inicial em cada container
    adicionarExperiencia();
    adicionarFormacao();
    adicionarIdioma();
}

function resetarContainer(containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
}

// Adicionar experiência
function adicionarExperiencia(dados = null) {
    const container = document.getElementById('experienciasContainer');
    const index = container.children.length;
    const item = document.createElement('div');
    item.className = 'experiencia-item';
    item.innerHTML = `
        <div class="form-row">
            <div class="form-group form-col">
                <label>Empresa:</label>
                <input type="text" class="exp-empresa" placeholder="Nome da empresa" value="${dados?.empresa || ''}">
            </div>
            <div class="form-group form-col">
                <label>Cargo:</label>
                <input type="text" class="exp-cargo" placeholder="Cargo ocupado" value="${dados?.cargo || ''}">
            </div>
        </div>
        <div class="form-row">
            <div class="form-group form-col">
                <label>Data de Início:</label>
                <input type="month" class="exp-inicio" value="${dados?.inicio || ''}">
            </div>
            <div class="form-group form-col">
                <label>Data de Término:</label>
                <input type="month" class="exp-termino" value="${dados?.termino || ''}" ${dados?.atual ? 'disabled' : ''}>
                <label class="checkbox-label" style="margin-top: 5px;">
                    <input type="checkbox" class="exp-atual" ${dados?.atual ? 'checked' : ''} onchange="toggleTrabalhoAtual(this)"> Trabalho atual
                </label>
            </div>
        </div>
        <div class="form-group">
            <label>Descrição das Atividades:</label>
            <textarea class="exp-descricao" rows="3" placeholder="Descreva suas principais atividades e responsabilidades neste cargo">${dados?.descricao || ''}</textarea>
        </div>
        ${container.children.length > 0 ? '<button type="button" onclick="removerItem(this)" class="btn-remove">Remover</button>' : ''}
    `;
    container.appendChild(item);
}

// Adicionar formação
function adicionarFormacao(dados = null) {
    const container = document.getElementById('formacoesContainer');
    const item = document.createElement('div');
    item.className = 'formacao-item';
    item.innerHTML = `
        <div class="form-row">
            <div class="form-group form-col">
                <label>Curso/Nível:</label>
                <select class="form-nivel">
                    <option value="">Selecione</option>
                    <option value="Ensino Médio" ${dados?.nivel === 'Ensino Médio' ? 'selected' : ''}>Ensino Médio</option>
                    <option value="Técnico" ${dados?.nivel === 'Técnico' ? 'selected' : ''}>Técnico</option>
                    <option value="Graduação" ${dados?.nivel === 'Graduação' ? 'selected' : ''}>Graduação</option>
                    <option value="Pós-graduação" ${dados?.nivel === 'Pós-graduação' ? 'selected' : ''}>Pós-graduação</option>
                    <option value="Mestrado" ${dados?.nivel === 'Mestrado' ? 'selected' : ''}>Mestrado</option>
                    <option value="Doutorado" ${dados?.nivel === 'Doutorado' ? 'selected' : ''}>Doutorado</option>
                    <option value="MBA" ${dados?.nivel === 'MBA' ? 'selected' : ''}>MBA</option>
                </select>
            </div>
            <div class="form-group form-col">
                <label>Nome do Curso:</label>
                <input type="text" class="form-curso" placeholder="Ex: Administração, Engenharia, etc." value="${dados?.curso || ''}">
            </div>
        </div>
        <div class="form-row">
            <div class="form-group form-col">
                <label>Instituição:</label>
                <input type="text" class="form-instituicao" placeholder="Nome da instituição" value="${dados?.instituicao || ''}">
            </div>
            <div class="form-group form-col">
                <label>Status:</label>
                <select class="form-status">
                    <option value="">Selecione</option>
                    <option value="Concluído" ${dados?.status === 'Concluído' ? 'selected' : ''}>Concluído</option>
                    <option value="Em andamento" ${dados?.status === 'Em andamento' ? 'selected' : ''}>Em andamento</option>
                    <option value="Trancado" ${dados?.status === 'Trancado' ? 'selected' : ''}>Trancado</option>
                </select>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group form-col">
                <label>Ano de Conclusão/Previsão:</label>
                <input type="text" class="form-ano" placeholder="Ex: 2020 ou 2025" value="${dados?.ano || ''}">
            </div>
        </div>
        ${container.children.length > 0 ? '<button type="button" onclick="removerItem(this)" class="btn-remove">Remover</button>' : ''}
    `;
    container.appendChild(item);
}

// Adicionar idioma
function adicionarIdioma(dados = null) {
    const container = document.getElementById('idiomasContainer');
    const item = document.createElement('div');
    item.className = 'idioma-item';
    item.innerHTML = `
        <div class="form-row">
            <div class="form-group form-col">
                <label>Idioma:</label>
                <select class="idioma-nome">
                    <option value="">Selecione</option>
                    <option value="Português" ${dados?.nome === 'Português' ? 'selected' : ''}>Português</option>
                    <option value="Inglês" ${dados?.nome === 'Inglês' ? 'selected' : ''}>Inglês</option>
                    <option value="Espanhol" ${dados?.nome === 'Espanhol' ? 'selected' : ''}>Espanhol</option>
                    <option value="Francês" ${dados?.nome === 'Francês' ? 'selected' : ''}>Francês</option>
                    <option value="Alemão" ${dados?.nome === 'Alemão' ? 'selected' : ''}>Alemão</option>
                    <option value="Italiano" ${dados?.nome === 'Italiano' ? 'selected' : ''}>Italiano</option>
                    <option value="Mandarim" ${dados?.nome === 'Mandarim' ? 'selected' : ''}>Mandarim</option>
                    <option value="Japonês" ${dados?.nome === 'Japonês' ? 'selected' : ''}>Japonês</option>
                    <option value="Outros" ${dados?.nome === 'Outros' ? 'selected' : ''}>Outros</option>
                </select>
            </div>
            <div class="form-group form-col">
                <label>Nível:</label>
                <select class="idioma-nivel">
                    <option value="">Selecione</option>
                    <option value="Básico" ${dados?.nivel === 'Básico' ? 'selected' : ''}>Básico</option>
                    <option value="Intermediário" ${dados?.nivel === 'Intermediário' ? 'selected' : ''}>Intermediário</option>
                    <option value="Avançado" ${dados?.nivel === 'Avançado' ? 'selected' : ''}>Avançado</option>
                    <option value="Fluente" ${dados?.nivel === 'Fluente' ? 'selected' : ''}>Fluente</option>
                    <option value="Nativo" ${dados?.nivel === 'Nativo' ? 'selected' : ''}>Nativo</option>
                </select>
            </div>
        </div>
        ${container.children.length > 0 ? '<button type="button" onclick="removerItem(this)" class="btn-remove">Remover</button>' : ''}
    `;
    container.appendChild(item);
}

// Adicionar certificação
function adicionarCertificacao(dados = null) {
    const container = document.getElementById('certificacoesContainer');
    const item = document.createElement('div');
    item.className = 'certificacao-item';
    item.innerHTML = `
        <div class="form-row">
            <div class="form-group form-col">
                <label>Nome da Certificação/Curso:</label>
                <input type="text" class="cert-nome" placeholder="Ex: Scrum Master, Google Analytics, etc." value="${dados?.nome || ''}">
            </div>
            <div class="form-group form-col">
                <label>Instituição:</label>
                <input type="text" class="cert-instituicao" placeholder="Instituição emissora" value="${dados?.instituicao || ''}">
            </div>
        </div>
        <div class="form-row">
            <div class="form-group form-col">
                <label>Ano de Conclusão:</label>
                <input type="text" class="cert-ano" placeholder="Ex: 2023" value="${dados?.ano || ''}">
            </div>
            <div class="form-group form-col">
                <label>Código da Certificação (se houver):</label>
                <input type="text" class="cert-codigo" placeholder="Código ou número da certificação" value="${dados?.codigo || ''}">
            </div>
        </div>
        ${container.children.length > 0 ? '<button type="button" onclick="removerItem(this)" class="btn-remove">Remover</button>' : ''}
    `;
    container.appendChild(item);
}

// Adicionar referência
function adicionarReferencia(dados = null) {
    const container = document.getElementById('referenciasContainer');
    const item = document.createElement('div');
    item.className = 'referencia-item';
    item.innerHTML = `
        <div class="form-row">
            <div class="form-group form-col">
                <label>Nome:</label>
                <input type="text" class="ref-nome" placeholder="Nome completo" value="${dados?.nome || ''}">
            </div>
            <div class="form-group form-col">
                <label>Cargo:</label>
                <input type="text" class="ref-cargo" placeholder="Cargo da pessoa" value="${dados?.cargo || ''}">
            </div>
        </div>
        <div class="form-row">
            <div class="form-group form-col">
                <label>Empresa:</label>
                <input type="text" class="ref-empresa" placeholder="Empresa onde trabalha/trabalhou" value="${dados?.empresa || ''}">
            </div>
            <div class="form-group form-col">
                <label>Telefone/Email:</label>
                <input type="text" class="ref-contato" placeholder="Telefone ou email" value="${dados?.contato || ''}">
            </div>
        </div>
        ${container.children.length > 0 ? '<button type="button" onclick="removerItem(this)" class="btn-remove">Remover</button>' : ''}
    `;
    container.appendChild(item);
}

// Remover item
function removerItem(btn) {
    btn.parentElement.remove();
}

// Toggle trabalho atual
function toggleTrabalhoAtual(checkbox) {
    const terminoInput = checkbox.closest('.form-col').querySelector('.exp-termino');
    terminoInput.disabled = checkbox.checked;
    if (checkbox.checked) {
        terminoInput.value = '';
    }
}

// Cancelar formulário
function cancelCurriculoForm() {
    document.getElementById('curriculoForm').style.display = 'none';
    document.getElementById('curriculoFormData').reset();
}

// Salvar currículo
function saveCurriculo(event) {
    event.preventDefault();
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // Validar usuário
    if (!currentUser || currentUser.type !== 'prestador') {
        alert('Erro: Usuário não autenticado como prestador.');
        window.location.href = 'index.html';
        return;
    }
    
    // Coletar especialidades
    const especialidades = Array.from(document.querySelectorAll('input[name="especialidades"]:checked')).map(cb => cb.value);
    const especialidadesOutros = document.getElementById('especialidadesOutros').value;
    
    // Coletar experiências
    const experiencias = Array.from(document.querySelectorAll('.experiencia-item')).map(item => ({
        empresa: item.querySelector('.exp-empresa').value,
        cargo: item.querySelector('.exp-cargo').value,
        inicio: item.querySelector('.exp-inicio').value,
        termino: item.querySelector('.exp-termino').value,
        atual: item.querySelector('.exp-atual').checked,
        descricao: item.querySelector('.exp-descricao').value
    })).filter(exp => exp.empresa || exp.cargo);
    
    // Coletar formações
    const formacoes = Array.from(document.querySelectorAll('.formacao-item')).map(item => ({
        nivel: item.querySelector('.form-nivel').value,
        curso: item.querySelector('.form-curso').value,
        instituicao: item.querySelector('.form-instituicao').value,
        status: item.querySelector('.form-status').value,
        ano: item.querySelector('.form-ano').value
    })).filter(form => form.nivel || form.curso);
    
    // Coletar idiomas
    const idiomas = Array.from(document.querySelectorAll('.idioma-item')).map(item => ({
        nome: item.querySelector('.idioma-nome').value,
        nivel: item.querySelector('.idioma-nivel').value
    })).filter(idioma => idioma.nome && idioma.nivel);
    
    // Coletar certificações
    const certificacoes = Array.from(document.querySelectorAll('.certificacao-item')).map(item => ({
        nome: item.querySelector('.cert-nome').value,
        instituicao: item.querySelector('.cert-instituicao').value,
        ano: item.querySelector('.cert-ano').value,
        codigo: item.querySelector('.cert-codigo').value
    })).filter(cert => cert.nome);
    
    // Coletar soft skills
    const softSkills = Array.from(document.querySelectorAll('input[name="softSkills"]:checked')).map(cb => cb.value);
    
    // Coletar regime de trabalho
    const regimeTrabalho = Array.from(document.querySelectorAll('input[name="regimeTrabalho"]:checked')).map(cb => cb.value);
    const modalidadeTrabalho = Array.from(document.querySelectorAll('input[name="modalidadeTrabalho"]:checked')).map(cb => cb.value);
    const disponibilidade = Array.from(document.querySelectorAll('input[name="disponibilidade"]:checked')).map(cb => cb.value);
    
    // Coletar referências
    const referencias = Array.from(document.querySelectorAll('.referencia-item')).map(item => ({
        nome: item.querySelector('.ref-nome').value,
        cargo: item.querySelector('.ref-cargo').value,
        empresa: item.querySelector('.ref-empresa').value,
        contato: item.querySelector('.ref-contato').value
    })).filter(ref => ref.nome || ref.empresa);
    
    const curriculo = {
        id: editing ? (JSON.parse(localStorage.getItem('curriculos') || '[]').find(c => c.userId === currentUser.id)?.id || Date.now().toString()) : Date.now().toString(),
        userId: currentUser.id,
        // Dados pessoais
        nomeCompleto: document.getElementById('nomeCompleto').value,
        cpf: document.getElementById('cpf').value,
        dataNascimento: document.getElementById('dataNascimento').value,
        estadoCivil: document.getElementById('estadoCivil').value,
        telefone: document.getElementById('telefone').value,
        telefone2: document.getElementById('telefone2').value,
        email: document.getElementById('email').value,
        endereco: document.getElementById('endereco').value,
        cidade: document.getElementById('cidade').value,
        estado: document.getElementById('estado').value,
        cep: document.getElementById('cep').value,
        // Profissional
        objetivoProfissional: document.getElementById('objetivoProfissional').value,
        profissao: document.getElementById('profissao').value,
        areaAtuacao: document.getElementById('areaAtuacao').value,
        especialidades: especialidades,
        especialidadesOutros: especialidadesOutros,
        anosExperiencia: document.getElementById('anosExperiencia').value,
        // Experiências
        experiencias: experiencias,
        // Formações
        formacoes: formacoes,
        // Habilidades
        habilidadesTecnicas: document.getElementById('habilidadesTecnicas').value,
        softSkills: softSkills,
        // Idiomas
        idiomas: idiomas,
        // Certificações
        certificacoes: certificacoes,
        // Disponibilidade
        regimeTrabalho: regimeTrabalho,
        modalidadeTrabalho: modalidadeTrabalho,
        disponibilidade: disponibilidade,
        jornadaPreferida: document.getElementById('jornadaPreferida').value,
        regiaoAtuacao: document.getElementById('regiaoAtuacao').value,
        faixaSalarial: document.getElementById('faixaSalarial').value,
        // Links
        linkedin: document.getElementById('linkedin').value,
        github: document.getElementById('github').value,
        portfolio: document.getElementById('portfolio').value,
        outrosLinks: document.getElementById('outrosLinks').value,
        // Referências
        referencias: referencias,
        // Adicionais
        informacoesAdicionais: document.getElementById('informacoesAdicionais').value,
        updatedAt: new Date().toISOString()
    };
    
    // Salvar currículo - apenas do usuário atual
    const curriculos = JSON.parse(localStorage.getItem('curriculos') || '[]');
    const index = curriculos.findIndex(c => c.userId === currentUser.id);
    
    if (index >= 0) {
        curriculos[index] = curriculo;
    } else {
        curriculos.push(curriculo);
    }
    
    localStorage.setItem('curriculos', JSON.stringify(curriculos));
    
    // Atualizar status do prestador
    const prestadores = JSON.parse(localStorage.getItem('prestadores') || '[]');
    const prestadorIndex = prestadores.findIndex(p => p.userId === currentUser.id);
    if (prestadorIndex >= 0) {
        prestadores[prestadorIndex].profileComplete = true;
        prestadores[prestadorIndex].lastUpdate = new Date().toISOString();
        localStorage.setItem('prestadores', JSON.stringify(prestadores));
    }
    
    // Verificar se já pagou
    const pagamentos = JSON.parse(localStorage.getItem('pagamentos') || '[]');
    const pagamentoPrestador = pagamentos.find(p => p.userId === currentUser.id && p.tipo === 'prestador' && p.status === 'aprovado');
    
    if (!pagamentoPrestador) {
        // Mostrar tela de pagamento
        showPaymentScreen('prestador', curriculo);
    } else {
        alert('Currículo salvo com sucesso!');
        showCurriculoView(curriculo);
        cancelCurriculoForm();
    }
}

// Mostrar visualização do currículo
function showCurriculoView(curriculo) {
    document.getElementById('curriculoForm').style.display = 'none';
    document.getElementById('curriculoView').style.display = 'block';
    
    const content = document.getElementById('curriculoContent');
    
    let html = `
        <h3>${curriculo.nomeCompleto}</h3>
        <div class="section">
            <div class="section-title">Dados de Contato</div>
            <div class="section-content">
                <strong>Telefone:</strong> ${curriculo.telefone}<br>
                ${curriculo.telefone2 ? `<strong>Telefone Alternativo:</strong> ${curriculo.telefone2}<br>` : ''}
                <strong>Email:</strong> ${curriculo.email}<br>
                <strong>Endereço:</strong> ${curriculo.endereco}<br>
                ${curriculo.cidade ? `${curriculo.cidade}, ${curriculo.estado || ''}` : ''}
            </div>
        </div>
        <div class="section">
            <div class="section-title">Objetivo Profissional</div>
            <div class="section-content">${curriculo.objetivoProfissional || 'Não informado'}</div>
        </div>
        <div class="section">
            <div class="section-title">Informações Profissionais</div>
            <div class="section-content">
                <strong>Profissão:</strong> ${curriculo.profissao}<br>
                <strong>Área de Atuação:</strong> ${curriculo.areaAtuacao || 'Não informado'}<br>
                <strong>Anos de Experiência:</strong> ${curriculo.anosExperiencia || 'Não informado'}<br>
                ${curriculo.especialidades && curriculo.especialidades.length > 0 ? `<strong>Especialidades:</strong> ${curriculo.especialidades.join(', ')}<br>` : ''}
            </div>
        </div>
    `;
    
    if (curriculo.experiencias && curriculo.experiencias.length > 0) {
        html += `<div class="section">
            <div class="section-title">Experiência Profissional</div>
            <div class="section-content">`;
        curriculo.experiencias.forEach(exp => {
            html += `<strong>${exp.cargo}</strong> - ${exp.empresa}<br>`;
            html += `${exp.inicio ? exp.inicio : ''} ${exp.atual ? 'até o momento' : (exp.termino ? `até ${exp.termino}` : '')}<br>`;
            if (exp.descricao) html += `${exp.descricao}<br>`;
            html += `<br>`;
        });
        html += `</div></div>`;
    }
    
    if (curriculo.formacoes && curriculo.formacoes.length > 0) {
        html += `<div class="section">
            <div class="section-title">Formação Acadêmica</div>
            <div class="section-content">`;
        curriculo.formacoes.forEach(form => {
            html += `<strong>${form.nivel}</strong> em ${form.curso}<br>`;
            html += `${form.instituicao || ''} ${form.status ? `- ${form.status}` : ''} ${form.ano ? `(${form.ano})` : ''}<br><br>`;
        });
        html += `</div></div>`;
    }
    
    html += `<div class="section">
        <div class="section-title">Habilidades Técnicas</div>
        <div class="section-content">${curriculo.habilidadesTecnicas || 'Não informado'}</div>
    </div>`;
    
    if (curriculo.softSkills && curriculo.softSkills.length > 0) {
        html += `<div class="section">
            <div class="section-title">Competências Comportamentais</div>
            <div class="section-content">${curriculo.softSkills.join(', ')}</div>
        </div>`;
    }
    
    if (curriculo.idiomas && curriculo.idiomas.length > 0) {
        html += `<div class="section">
            <div class="section-title">Idiomas</div>
            <div class="section-content">`;
        curriculo.idiomas.forEach(idioma => {
            html += `<strong>${idioma.nome}:</strong> ${idioma.nivel}<br>`;
        });
        html += `</div></div>`;
    }
    
    if (curriculo.certificacoes && curriculo.certificacoes.length > 0) {
        html += `<div class="section">
            <div class="section-title">Certificações</div>
            <div class="section-content">`;
        curriculo.certificacoes.forEach(cert => {
            html += `<strong>${cert.nome}</strong> - ${cert.instituicao || ''} ${cert.ano ? `(${cert.ano})` : ''} ${cert.codigo ? `- Código: ${cert.codigo}` : ''}<br>`;
        });
        html += `</div></div>`;
    }
    
    if (curriculo.regimeTrabalho && curriculo.regimeTrabalho.length > 0) {
        html += `<div class="section">
            <div class="section-title">Disponibilidade</div>
            <div class="section-content">
                <strong>Regime:</strong> ${curriculo.regimeTrabalho.join(', ')}<br>
                <strong>Modalidade:</strong> ${curriculo.modalidadeTrabalho ? curriculo.modalidadeTrabalho.join(', ') : 'Não informado'}<br>
                <strong>Disponibilidade:</strong> ${curriculo.disponibilidade ? curriculo.disponibilidade.join(', ') : 'Não informado'}<br>
                ${curriculo.jornadaPreferida ? `<strong>Jornada:</strong> ${curriculo.jornadaPreferida}<br>` : ''}
                ${curriculo.regiaoAtuacao ? `<strong>Região:</strong> ${curriculo.regiaoAtuacao}<br>` : ''}
                ${curriculo.faixaSalarial ? `<strong>Faixa Salarial:</strong> ${curriculo.faixaSalarial}` : ''}
            </div>
        </div>`;
    }
    
    if (curriculo.linkedin || curriculo.github || curriculo.portfolio || curriculo.outrosLinks) {
        html += `<div class="section">
            <div class="section-title">Links e Portfólio</div>
            <div class="section-content">`;
        if (curriculo.linkedin) html += `<strong>LinkedIn:</strong> <a href="${curriculo.linkedin}" target="_blank">${curriculo.linkedin}</a><br>`;
        if (curriculo.github) html += `<strong>GitHub:</strong> <a href="${curriculo.github}" target="_blank">${curriculo.github}</a><br>`;
        if (curriculo.portfolio) html += `<strong>Portfólio:</strong> <a href="${curriculo.portfolio}" target="_blank">${curriculo.portfolio}</a><br>`;
        if (curriculo.outrosLinks) html += `<strong>Outros Links:</strong><br>${curriculo.outrosLinks.split('\n').map(link => link.trim() ? `<a href="${link}" target="_blank">${link}</a><br>` : '').join('')}`;
        html += `</div></div>`;
    }
    
    if (curriculo.informacoesAdicionais) {
        html += `<div class="section">
            <div class="section-title">Informações Adicionais</div>
            <div class="section-content">${curriculo.informacoesAdicionais}</div>
        </div>`;
    }
    
    content.innerHTML = html;
    
    // Verificar se pagou
    const pagamentos = JSON.parse(localStorage.getItem('pagamentos') || '[]');
    const pagamentoPrestador = pagamentos.find(p => p.userId === currentUser.id && p.tipo === 'prestador' && p.status === 'aprovado');
    
    if (pagamentoPrestador) {
        document.getElementById('statusMessage').textContent = 'Seu currículo está cadastrado e visível para empresas.';
    } else {
        document.getElementById('statusMessage').textContent = 'Seu currículo está salvo, mas não está visível para empresas. Realize o pagamento para publicá-lo.';
    }
    document.getElementById('curriculoBtnText').textContent = 'Editar Currículo';
}

// Editar currículo
function editCurriculo() {
    showCurriculoForm();
}

// Mostrar campo de outras especialidades
document.addEventListener('DOMContentLoaded', function() {
    const especialidadesCheckboxes = document.querySelectorAll('input[name="especialidades"]');
    especialidadesCheckboxes.forEach(cb => {
        cb.addEventListener('change', function() {
            if (this.value === 'Outros' && this.checked) {
                document.getElementById('especialidadesOutros').style.display = 'block';
            } else if (this.value === 'Outros' && !this.checked) {
                document.getElementById('especialidadesOutros').style.display = 'none';
                document.getElementById('especialidadesOutros').value = '';
            }
        });
    });
});

// Mostrar tela de pagamento
function showPaymentScreen(tipo, curriculo) {
    document.getElementById('curriculoForm').style.display = 'none';
    document.getElementById('curriculoView').style.display = 'none';
    document.getElementById('paymentScreen').style.display = 'block';
    document.getElementById('paymentScreen').scrollIntoView({ behavior: 'smooth' });
    
    // Salvar referência do currículo para depois
    window.pendingCurriculo = curriculo;
}

// Copiar código PIX
function copyPixCode() {
    const pixCode = document.getElementById('pixCode');
    pixCode.select();
    document.execCommand('copy');
    alert('Código PIX copiado! Cole no app do seu banco.');
}

// Confirmar pagamento
function confirmPayment(tipo) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;
    
    // Criar registro de pagamento
    const pagamentos = JSON.parse(localStorage.getItem('pagamentos') || '[]');
    const novoPagamento = {
        id: Date.now().toString(),
        userId: currentUser.id,
        tipo: tipo,
        valor: 14.99,
        metodo: 'PIX',
        status: 'aprovado',
        dataPagamento: new Date().toISOString()
    };
    
    pagamentos.push(novoPagamento);
    localStorage.setItem('pagamentos', JSON.stringify(pagamentos));
    
    // Atualizar status do prestador
    const prestadores = JSON.parse(localStorage.getItem('prestadores') || '[]');
    const prestadorIndex = prestadores.findIndex(p => p.userId === currentUser.id);
    if (prestadorIndex >= 0) {
        prestadores[prestadorIndex].pagamentoAprovado = true;
        prestadores[prestadorIndex].dataPagamento = new Date().toISOString();
        localStorage.setItem('prestadores', JSON.stringify(prestadores));
    }
    
    alert('Pagamento confirmado! Seu currículo está agora visível para empresas.');
    
    // Esconder tela de pagamento e mostrar currículo
    document.getElementById('paymentScreen').style.display = 'none';
    if (window.pendingCurriculo) {
        showCurriculoView(window.pendingCurriculo);
        cancelCurriculoForm();
        window.pendingCurriculo = null;
    }
}

// Cancelar pagamento
function cancelPayment() {
    document.getElementById('paymentScreen').style.display = 'none';
    window.pendingCurriculo = null;
    alert('Seu currículo foi salvo, mas não está visível para empresas até o pagamento ser confirmado.');
}

// Carregar ao inicializar
document.addEventListener('DOMContentLoaded', function() {
    loadPrestadorData();
    
    // Carregar imagem de exemplo de currículo
    const exampleImg = document.getElementById('exampleResume');
    if (exampleImg && !exampleImg.src.includes('data:image')) {
        exampleImg.onerror = function() {
            this.style.display = 'none';
            const fallback = document.createElement('div');
            fallback.style.cssText = 'padding: 40px; background: #fff; border: 2px dashed #4a90e2; border-radius: 5px; color: #4a90e2; text-align: center;';
            fallback.innerHTML = '<h4 style="margin-bottom: 15px;">Exemplo de Currículo Profissional</h4><p>Um currículo bem elaborado deve conter: dados pessoais, objetivo profissional, experiência, formação acadêmica, habilidades e certificações.</p>';
            this.parentElement.appendChild(fallback);
        };
    }
});
