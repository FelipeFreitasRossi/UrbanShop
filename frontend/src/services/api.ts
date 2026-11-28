/**
 * Cliente HTTP da UrbanShop.
 *
 * A URL da API Java vem da variável de ambiente EXPO_PUBLIC_API_URL
 * (arquivo .env na pasta frontend). Nunca coloque senhas ou chaves secretas
 * em variáveis EXPO_PUBLIC_: elas ficam visíveis no app.
 */
export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? '').replace(/\/+$/, '');

export type ApiErrorCode =
  | 'NOT_CONFIGURED'
  | 'NETWORK'
  | 'TIMEOUT'
  | 'HTTP'
  | 'PARSE';

export class ApiError extends Error {
  code: ApiErrorCode;
  status: number;

  constructor(code: ApiErrorCode, message: string, status = 0) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  timeoutMs?: number;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  if (!API_URL) {
    throw new ApiError(
      'NOT_CONFIGURED',
      'A conexão com o servidor ainda não foi configurada (EXPO_PUBLIC_API_URL).',
    );
  }

  const { body, timeoutMs = 12000, headers, ...init } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (error) {
    clearTimeout(timer);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError('TIMEOUT', 'O servidor demorou para responder. Tente novamente.');
    }
    throw new ApiError('NETWORK', 'Não foi possível conectar ao servidor. Verifique sua conexão.');
  }
  clearTimeout(timer);

  if (!response.ok) {
    let message = 'Não foi possível concluir a solicitação.';
    try {
      const data = await response.json();
      if (data && typeof data.message === 'string') message = data.message;
    } catch {
      // resposta sem JSON
    }
    throw new ApiError('HTTP', message, response.status);
  }

  if (response.status === 204) return undefined as T;

  try {
    return (await response.json()) as T;
  } catch {
    throw new ApiError('PARSE', 'Resposta inválida do servidor.', response.status);
  }
}

/** Mensagem amigável para exibir ao cliente. */
export function friendlyError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.code === 'NOT_CONFIGURED') return 'Os produtos estarão disponíveis em breve.';
    return error.message;
  }
  return 'Algo deu errado. Tente novamente.';
}
