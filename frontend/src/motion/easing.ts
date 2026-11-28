import { Easing } from 'react-native-reanimated';

/** Curva suave de saída, usada em revelações e transições. */
export const easeOutExpo = Easing.bezier(0.16, 1, 0.3, 1);
/** Curva padrão para microinterações. */
export const easeOutQuart = Easing.bezier(0.25, 1, 0.5, 1);
/** Curva para elementos que saem de cena. */
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);
