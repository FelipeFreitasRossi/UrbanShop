# UrbanShop — Frontend (Expo SDK 58)

Loja virtual para web, Android e iOS feita com Expo, React Native, TypeScript e Expo Router.

## Estrutura

```
frontend/
├── app.config.ts          Configuração do app (estende o app.json do template)
├── .env.example           Modelo de variáveis de ambiente (copie para .env)
├── public/                Arquivos copiados como estão na exportação web
│   ├── .htaccess          URLs amigáveis e cache na HostGator (Apache)
│   ├── robots.txt
│   └── sitemap.xml
└── src/
    ├── app/               Rotas (cada arquivo é uma página / URL)
    ├── components/
    │   ├── brand/         Logo e tela de carregamento
    │   ├── catalog/       Página de listagem de produtos
    │   ├── home/          Seções da página inicial
    │   ├── layout/        Screen, Header, menu mobile, bottom nav, footer
    │   ├── loyalty/       Cartão fidelidade
    │   ├── product/       Card, lista e esqueleto de produto
    │   └── ui/            Texto, botões, estados vazios
    ├── config/            Navegação, imagens editoriais e dados da empresa
    ├── hooks/             useBreakpoint, useRequest
    ├── motion/            Reveal on Scroll, Parallax, microinterações
    ├── services/          Chamadas à API Java
    ├── state/             Favoritos
    ├── theme/             Cores, fontes, espaçamentos (design tokens)
    ├── types/             Tipos TypeScript (Product, Page…)
    └── utils/             Formatação de preço, rotas
```

## Comandos (CMD do Windows)

Sempre dentro da pasta `frontend`:

```cmd
cd C:\Users\User\Desktop\UrbanShop\frontend
```

| O que fazer | Comando |
| --- | --- |
| Rodar em modo desenvolvimento | `npx expo start` |
| Abrir no navegador | aperte `w` com o servidor rodando |
| Limpar cache do Metro (se algo "travar") | `npx expo start -c` |
| Conferir saúde do projeto | `npx expo-doctor` |
| Instalar uma biblioteca compatível com o SDK | `npx expo install nome-da-biblioteca` |
| Gerar o site estático (pasta `dist`) | `npx expo export -p web` |
| Testar o site gerado localmente | `npx expo serve` |

## Variáveis de ambiente

1. Copie o modelo: `copy .env.example .env`
2. Preencha `EXPO_PUBLIC_API_URL` quando a API Java estiver rodando (Etapa 5).
3. Reinicie o `npx expo start` depois de mudar o `.env`.

Nunca coloque senhas no `.env` do frontend: tudo que começa com `EXPO_PUBLIC_` fica visível no app.
A conexão com o MongoDB Atlas fica somente nos backends.

## Onde trocar conteúdo

- **Fotos de campanha** (hero, categorias, coleções): `src/config/media.ts`
- **Dados da empresa** (CNPJ, e-mail, redes sociais): `src/config/site.ts`
- **Categorias e menu**: `src/config/navigation.ts`
- **Cores e fontes**: `src/theme/tokens.ts`

Produtos **não** ficam no código: são cadastrados no MongoDB e carregados pela API.
