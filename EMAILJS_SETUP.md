# Configuração do EmailJS para Envio de Emails

## Passo a Passo para Configurar

### 1. Criar Conta no EmailJS
1. Acesse https://www.emailjs.com/
2. Crie uma conta gratuita (permite até 200 emails/mês)
3. Faça login no dashboard

### 2. Adicionar Serviço de Email
1. No dashboard, vá em "Email Services"
2. Clique em "Add New Service"
3. Escolha seu provedor de email (Gmail, Outlook, etc.)
4. Siga as instruções para conectar sua conta
5. Anote o **Service ID** gerado

### 3. Criar Template de Email
1. Vá em "Email Templates"
2. Clique em "Create New Template"
3. Use o seguinte template:

**Subject:**
```
{{subject}}
```

**Content (HTML):**
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4a90e2; color: white; padding: 20px; text-align: center; }
        .content { background: #f9f9f9; padding: 20px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Bem-vindo ao Portal de Serviços Profissionais!</h1>
        </div>
        <div class="content">
            <p>Olá <strong>{{to_name}}</strong>,</p>
            <p>{{message}}</p>
            <p>Seu cadastro como <strong>{{user_type}}</strong> foi realizado com sucesso!</p>
            <p>Acesse sua área e comece a usar o portal agora mesmo.</p>
            <p>Atenciosamente,<br>Equipe Portal de Serviços Profissionais</p>
        </div>
        <div class="footer">
            <p>Este é um email automático, por favor não responda.</p>
        </div>
    </div>
</body>
</html>
```

4. Anote o **Template ID** gerado

### 4. Obter Public Key
1. Vá em "Account" > "General"
2. Copie sua **Public Key**

### 5. Configurar no Código

Abra o arquivo `index.html` e substitua:

```javascript
emailjs.init("YOUR_PUBLIC_KEY"); // Substitua pela sua Public Key
```

Abra o arquivo `script.js` e na função `sendWelcomeEmail`, substitua:

```javascript
emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams)
```

Substitua:
- `YOUR_PUBLIC_KEY` pela sua Public Key
- `YOUR_SERVICE_ID` pelo Service ID do seu serviço de email
- `YOUR_TEMPLATE_ID` pelo Template ID do template criado

### 6. Testar

1. Faça um cadastro de teste
2. Verifique se o email foi recebido
3. Verifique o console do navegador para logs de erro

## Variáveis Disponíveis no Template

- `{{to_email}}` - Email do usuário cadastrado
- `{{to_name}}` - Nome do usuário
- `{{user_type}}` - Tipo (Prestador de Serviço ou Empresa)
- `{{message}}` - Mensagem personalizada
- `{{subject}}` - Assunto do email

## Notas Importantes

- O plano gratuito permite 200 emails/mês
- Os emails são enviados diretamente do navegador (não precisa de backend)
- Configure corretamente as credenciais para funcionar
- Teste sempre antes de usar em produção
