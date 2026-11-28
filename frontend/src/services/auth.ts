import { apiRequest } from './api';

/**
 * Contrato de autenticação com a API Java (Spring Boot + Spring Security + JWT).
 * Os mesmos campos e validações serão implementados no backend.
 */

export type Address = {
  id?: string;
  label?: string;
  zipCode: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  country: string;
  isDefault?: boolean;
};

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  /** CPF mascarado pelo backend (ex.: ***.456.789-**). O CPF completo nunca volta para o app. */
  cpfMasked?: string;
  birthDate?: string | null;
  emailVerified: boolean;
  roles: string[];
  addresses: Address[];
};

export type RegisterPayload = {
  name: string;
  email: string;
  phone: string;
  /** Somente dígitos. Usado para emissão de nota fiscal e entrega. */
  cpf: string;
  /** ISO (AAAA-MM-DD). Opcional: usado apenas em campanhas de aniversário. */
  birthDate?: string;
  password: string;
  address: Address;
  consents: {
    /** Aceite obrigatório dos Termos de uso e da Política de privacidade. */
    termsAndPrivacy: true;
    /** Opcional: receber novidades e ofertas por e-mail. */
    marketing: boolean;
    /** Opcional: usar a data de nascimento em campanhas de aniversário. */
    birthdayCampaigns: boolean;
  };
};

export type LoginResponse = {
  accessToken: string;
  /** Segundos até o token expirar. */
  expiresIn: number;
  user: User;
};

/** POST /api/auth/register — cria a conta e envia o e-mail de confirmação. */
export function register(payload: RegisterPayload) {
  return apiRequest<{ message: string }>('/api/auth/register', { method: 'POST', body: payload });
}

/** POST /api/auth/login */
export function login(email: string, password: string) {
  return apiRequest<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: { email: email.trim().toLowerCase(), password },
  });
}

/** GET /api/auth/me — dados do cliente logado. */
export function me() {
  return apiRequest<User>('/api/auth/me');
}

/** POST /api/auth/logout — encerra a sessão no servidor. */
export function logoutRequest() {
  return apiRequest<void>('/api/auth/logout', { method: 'POST' });
}

/** POST /api/auth/forgot-password — envia o link de redefinição (resposta sempre igual, por segurança). */
export function forgotPassword(email: string) {
  return apiRequest<void>('/api/auth/forgot-password', {
    method: 'POST',
    body: { email: email.trim().toLowerCase() },
  });
}

/** POST /api/auth/resend-verification — reenvia o e-mail de confirmação. */
export function resendVerification(email: string) {
  return apiRequest<void>('/api/auth/resend-verification', {
    method: 'POST',
    body: { email: email.trim().toLowerCase() },
  });
}

/** POST /api/auth/reset-password — define a nova senha com o token recebido por e-mail. */
export function resetPassword(token: string, password: string) {
  return apiRequest<void>('/api/auth/reset-password', { method: 'POST', body: { token, password } });
}
