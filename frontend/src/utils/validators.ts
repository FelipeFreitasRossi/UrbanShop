/**
 * Validações e máscaras de formulário (padrões brasileiros).
 * O backend repete todas estas validações: o app valida para dar retorno
 * imediato ao cliente, o servidor valida para garantir a segurança.
 */

export const onlyDigits = (value: string) => value.replace(/\D/g, '');

// ---------- CPF ----------

/**
 * Confere se o CPF é válido pelos dígitos verificadores (algoritmo oficial
 * da Receita Federal). Rejeita sequências repetidas como 111.111.111-11.
 */
export function isValidCPF(value: string): boolean {
  const cpf = onlyDigits(value);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  const digit = (length: number) => {
    let sum = 0;
    for (let i = 0; i < length; i++) sum += Number(cpf[i]) * (length + 1 - i);
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };

  return digit(9) === Number(cpf[9]) && digit(10) === Number(cpf[10]);
}

/** 12345678909 → 123.456.789-09 (aplicado enquanto digita). */
export function formatCPF(value: string) {
  const d = onlyDigits(value).slice(0, 11);
  return d
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d{1,2})$/, '.$1-$2');
}

// ---------- CEP ----------

/** 01310100 → 01310-100 */
export function formatCEP(value: string) {
  const d = onlyDigits(value).slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

export const isCompleteCEP = (value: string) => onlyDigits(value).length === 8;

// ---------- Telefone ----------

/** 11987654321 → (11) 98765-4321 · 1133334444 → (11) 3333-4444 */
export function formatPhone(value: string) {
  const d = onlyDigits(value).slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : '';
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/** Celular (11 dígitos, começa com 9) ou fixo (10 dígitos), com DDD válido. */
export function isValidPhone(value: string) {
  const d = onlyDigits(value);
  if (d.length !== 10 && d.length !== 11) return false;
  if (Number(d.slice(0, 2)) < 11) return false;
  if (d.length === 11 && d[2] !== '9') return false;
  return true;
}

// ---------- Data de nascimento ----------

/** 31121990 → 31/12/1990 */
export function formatDate(value: string) {
  const d = onlyDigits(value).slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
}

/** "31/12/1990" → "1990-12-31" (ISO) ou null se a data não existir. */
export function parseBRDate(value: string): string | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!m) return null;
  const [day, month, year] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day)
    return null;
  return `${m[3]}-${m[2]}-${m[1]}`;
}

/** Idade em anos completos a partir de uma data ISO. */
export function ageFrom(iso: string) {
  const [y, mo, d] = iso.split('-').map(Number);
  const now = new Date();
  let age = now.getFullYear() - y;
  if (now.getMonth() + 1 < mo || (now.getMonth() + 1 === mo && now.getDate() < d)) age--;
  return age;
}

// ---------- E-mail e senha ----------

export const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());

export type PasswordCheck = { label: string; ok: boolean };

/** Regras de senha exibidas ao cliente (o backend aplica as mesmas). */
export function passwordChecks(password: string): PasswordCheck[] {
  return [
    { label: 'Pelo menos 8 caracteres', ok: password.length >= 8 },
    { label: 'Uma letra maiúscula e uma minúscula', ok: /[a-z]/.test(password) && /[A-Z]/.test(password) },
    { label: 'Pelo menos um número', ok: /\d/.test(password) },
    { label: 'Pelo menos um símbolo (ex.: ! @ # $)', ok: /[^A-Za-z0-9]/.test(password) },
  ];
}

export const isStrongPassword = (password: string) => passwordChecks(password).every((c) => c.ok);

/** Nome completo: pelo menos nome e sobrenome. */
export const isFullName = (value: string) =>
  value
    .trim()
    .split(/\s+/)
    .filter((p) => p.length >= 2).length >= 2;

export const UFS = [
  'AC',
  'AL',
  'AP',
  'AM',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MT',
  'MS',
  'MG',
  'PA',
  'PB',
  'PR',
  'PE',
  'PI',
  'RJ',
  'RN',
  'RS',
  'RO',
  'RR',
  'SC',
  'SP',
  'SE',
  'TO',
] as const;
