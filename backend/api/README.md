# UrbanShop API (Java · Spring Boot 4.2 · Java 21)

API principal da UrbanShop: autoridade para clientes, produtos, pedidos, estoque,
pagamentos e fidelidade. Banco: MongoDB Atlas.

## Estrutura

```
src/main/java/com/urbanshop/api/
├── ApiApplication.java      Classe principal
├── config/                  Segurança (JWT, CORS), MongoDB, propriedades
├── common/
│   ├── error/               Erros padronizados em JSON
│   ├── security/            Criptografia (CPF), limite de tentativas
│   └── validation/          CPF, telefone, UFs
├── auth/                    Cadastro, login, confirmação de e-mail, senha
├── users/                   Clientes e perfis (CUSTOMER, ADMIN)
├── addresses/               Endereços e consulta ao ViaCEP
├── loyalty/                 Cartão fidelidade
├── notifications/           E-mails
└── newsletter/              Inscrições na newsletter
```

## Primeira configuração (PowerShell)

```powershell
cd C:\Users\User\Desktop\UrbanShop\backend\api
powershell -ExecutionPolicy Bypass -File .\setup-env.ps1
```

O script pede a senha do Atlas e cria o arquivo `.env` (ignorado pelo Git).

## Comandos

| O que fazer | Comando |
| --- | --- |
| Rodar a API | `.\mvnw.cmd spring-boot:run` |
| Só compilar | `.\mvnw.cmd -q compile` |
| Rodar os testes | `.\mvnw.cmd test` |
| Gerar o .jar de produção | `.\mvnw.cmd -DskipTests package` |
| Ver se está no ar | abrir http://localhost:8080/actuator/health |

## Rotas disponíveis

| Método | Rota | Acesso |
| --- | --- | --- |
| POST | `/api/auth/register` | público |
| POST | `/api/auth/login` | público |
| GET | `/api/auth/me` | cliente logado |
| POST | `/api/auth/logout` | cliente logado |
| GET | `/api/auth/verify-email?token=` | link do e-mail |
| POST | `/api/auth/resend-verification` | público |
| POST | `/api/auth/forgot-password` | público |
| POST | `/api/auth/reset-password` | público (com token) |
| POST | `/api/newsletter` | público |
| GET | `/actuator/health` | público |

## Segurança

- Senhas com BCrypt; CPF criptografado (AES-256-GCM) e nunca devolvido completo.
- Login com JWT (2 h), bloqueio de 15 min após 5 senhas erradas e limite de tentativas por IP.
- Mensagens de login e recuperação de senha não revelam se um e-mail está cadastrado.
- Segredos só no `.env` / variáveis de ambiente. **Nunca** mude a `DATA_ENCRYPTION_KEY`
  depois de ter clientes cadastrados.
