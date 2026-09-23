# Ativar recuperação de senha e Google

O código exige as configurações abaixo para funcionar. Não colocar credenciais no Git.

## Google

1. No Google Cloud, configure Google Auth Platform/tela de consentimento.
2. Crie um cliente OAuth do tipo **Aplicativo da Web**.
3. Adicione origens JavaScript autorizadas: `https://pegavisao.vercel.app` e `http://localhost:5173`.
4. Copie o Client ID público para `Google__ClientId` no Render e `VITE_GOOGLE_CLIENT_ID` na Vercel. Os valores devem ser iguais. Este fluxo não usa Client Secret nem callback HTTP.
5. Refaça os deploys. Em modo de testes do Google, inclua os usuários de teste necessários.

Documentação: https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid

## E-mails de recuperação

Use a API HTTPS do Resend, compatível com o plano gratuito do Render:

1. Crie a conta em https://resend.com e verifique um domínio que você controla, seguindo os registros DNS indicados pelo serviço.
2. Crie uma API key com permissão de envio.
3. No Render configure:

| Variável | Valor |
| --- | --- |
| `Auth__FrontendUrl` | `https://pegavisao.vercel.app` |
| `Email__Provedor` | `Resend` |
| `Email__ApiKey` | Chave secreta do Resend, somente no Render |
| `Email__Remetente` | E-mail do domínio verificado |

O remetente de testes do Resend não habilita envio a todos os clientes. Não é possível verificar o domínio `vercel.app`, pois ele pertence à Vercel. É necessário um domínio próprio para o remetente de produção; o site pode continuar hospedado em `pegavisao.vercel.app`.

O backend também suporta SMTP explicitamente configurado; veja `AUTENTICACAO.md` no repositório da API. Render gratuito bloqueia as portas SMTP comuns: https://render.com/docs/free.

## Validação após configurar

- Solicitar recuperação em sua conta; conferir caixa de entrada/spam e concluir pelo link em até 30 minutos.
- Confirmar que a senha antiga e o link já usado não funcionam.
- Entrar pelo Google com conta nova e com conta existente. Na primeira vinculação de uma conta existente, confirmar a senha da loja.
- Sem as credenciais, Google fica indisponível e recuperação informa indisponibilidade. Não há envio simulado para clientes.
