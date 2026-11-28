import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * Configuração do app UrbanShop.
 *
 * Este arquivo estende o app.json criado pelo template (ícones, splash, plugins)
 * e sobrescreve apenas o que é da UrbanShop. Assim não é preciso editar o app.json.
 */
export default ({ config }: ConfigContext): ExpoConfig => {
  // Splash nativa preta, combinando com a tela de carregamento animada.
  const plugins = (config.plugins ?? []).map((plugin) => {
    const name = Array.isArray(plugin) ? plugin[0] : plugin;
    if (name !== 'expo-splash-screen') return plugin;
    const options = Array.isArray(plugin) && plugin[1] ? plugin[1] : {};
    return [
      'expo-splash-screen',
      {
        ...options,
        backgroundColor: '#000000',
        dark: { ...(options.dark ?? {}), backgroundColor: '#000000' },
      },
    ] as [string, Record<string, unknown>];
  });

  return {
    ...config,
    name: 'UrbanShop',
    slug: 'urbanshop',
    scheme: 'urbanshop',
    userInterfaceStyle: 'dark',
    backgroundColor: '#000000',
    plugins,
    web: {
      ...config.web,
      output: 'static',
      bundler: 'metro',
    },
    experiments: {
      ...config.experiments,
      // Rotas montadas a partir de listas (categorias, menus) usam strings comuns.
      typedRoutes: false,
    },
  };
};
