import { useSyncExternalStore } from 'react';

/**
 * Pequeno estado de interface compartilhado (sem salvar no aparelho):
 * - a faixa "Cadastre-se" do topo foi fechada nesta visita?
 */
let bannerDismissed = false;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function dismissGuestBanner() {
  bannerDismissed = true;
  listeners.forEach((l) => l());
}

export function useGuestBannerDismissed() {
  return useSyncExternalStore(
    subscribe,
    () => bannerDismissed,
    () => bannerDismissed,
  );
}
