# UrbanShop

E-commerce de streetwear premium: loja web, aplicativo Android/iOS, painel administrativo,
programa de fidelidade e inteligência comercial.

```
UrbanShop/
├── frontend/   App Expo (SDK 58) — web, Android e iOS
└── backend/    (próxima etapa) API Java Spring Boot + serviço Python FastAPI
```

## Status das etapas

| Etapa | Conteúdo | Situação |
| --- | --- | --- |
| 1 | Estrutura e identidade visual | ✅ |
| 2 | Loja virtual e navegação | ✅ |
| 3 | Produtos e categorias | Parcial (página Produtos, popup, filtros por categoria) |
| 4 | Cadastro, login e endereços | Telas prontas — aguardando API (Etapa 5) |
| 5 | Backend Java e MongoDB | Próxima |
| 6 | Carrinho e checkout | — |
| 7 | Cartão fidelidade e pontuação | Visual pronto |
| 8 | Painel administrativo | — |
| 9 | Dashboard analítica Python | — |
| 10 | Responsividade, animações e testes | Em andamento |

## Rodar o frontend (CMD do Windows)

Primeira vez, em uma máquina nova:

```cmd
cd C:\Users\User\Desktop\UrbanShop\frontend
npm install
copy .env.example .env
npx expo start -c
```

No dia a dia:

```cmd
cd C:\Users\User\Desktop\UrbanShop\frontend
npx expo start
```

Aperte `w` para abrir no navegador ou leia o QR Code com o Expo Go.
Mais comandos em `frontend/README.md`.

## Segurança

- Senhas e a conexão do MongoDB Atlas ficam **somente** no backend, em variáveis de ambiente.
- Arquivos `.env` nunca vão para o GitHub (veja `.gitignore`).
- O site publicado usa HTTPS obrigatório e cabeçalhos de segurança (`frontend/public/.htaccess`).
