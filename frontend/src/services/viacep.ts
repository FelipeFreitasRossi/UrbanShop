import { onlyDigits } from '../utils/validators';

export type CepAddress = {
  zipCode: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
};

export type CepResult =
  | { status: 'found'; address: CepAddress }
  | { status: 'not-found' }
  | { status: 'unavailable' };

const cache = new Map<string, CepResult>();

/**
 * Consulta o CEP no ViaCEP (serviço público e gratuito, via HTTPS).
 * Diferencia "CEP não existe" de "serviço fora do ar" para mostrar a mensagem certa.
 */
export async function lookupCep(value: string): Promise<CepResult> {
  const cep = onlyDigits(value);
  if (cep.length !== 8) return { status: 'not-found' };
  const cached = cache.get(cep);
  if (cached) return cached;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`, { signal: controller.signal });
    if (res.status === 400) return { status: 'not-found' };
    if (!res.ok) return { status: 'unavailable' };
    const data = await res.json();
    // O ViaCEP responde { "erro": true } (ou "true") quando o CEP não existe.
    if (!data || data.erro === true || data.erro === 'true') {
      const result: CepResult = { status: 'not-found' };
      cache.set(cep, result);
      return result;
    }
    const result: CepResult = {
      status: 'found',
      address: {
        zipCode: cep,
        street: data.logradouro ?? '',
        neighborhood: data.bairro ?? '',
        city: data.localidade ?? '',
        state: data.uf ?? '',
      },
    };
    cache.set(cep, result);
    return result;
  } catch {
    return { status: 'unavailable' };
  } finally {
    clearTimeout(timer);
  }
}
