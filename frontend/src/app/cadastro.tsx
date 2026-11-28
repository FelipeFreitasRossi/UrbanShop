import { Link, useRouter } from 'expo-router';
import { ArrowLeft, Check, CircleCheck, RefreshCw, X } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import { AuthLayout } from '../components/forms/AuthLayout';
import { Checkbox } from '../components/forms/Checkbox';
import { TextField } from '../components/forms/TextField';
import { Button } from '../components/ui/Button';
import { UText } from '../components/ui/UText';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { ApiError, friendlyError } from '../services/api';
import { register } from '../services/auth';
import { lookupCep } from '../services/viacep';
import { makeStyles, useColors } from '../theme/ThemeProvider';
import { fonts, radius, spacing } from '../theme/tokens';
import {
  ageFrom,
  formatCEP,
  formatCPF,
  formatDate,
  formatPhone,
  isCompleteCEP,
  isFullName,
  isStrongPassword,
  isValidCPF,
  isValidEmail,
  isValidPhone,
  onlyDigits,
  parseBRDate,
  passwordChecks,
  UFS,
} from '../utils/validators';

type Form = {
  name: string;
  email: string;
  phone: string;
  cpf: string;
  birthDate: string;
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  password: string;
  confirm: string;
  terms: boolean;
  marketing: boolean;
  birthday: boolean;
};

type Errors = Partial<Record<keyof Form | 'form', string>>;
type CepStatus = 'idle' | 'loading' | 'found' | 'not-found' | 'unavailable';

const STEPS = ['Seus dados', 'Endereço', 'Senha'] as const;

const EMPTY: Form = {
  name: '',
  email: '',
  phone: '',
  cpf: '',
  birthDate: '',
  cep: '',
  street: '',
  number: '',
  complement: '',
  neighborhood: '',
  city: '',
  state: '',
  password: '',
  confirm: '',
  terms: false,
  marketing: false,
  birthday: false,
};

/** Em qual etapa fica cada campo (para levar o cliente ao erro vindo do servidor). */
const FIELD_STEP: Partial<Record<keyof Form, number>> = {
  name: 0,
  email: 0,
  phone: 0,
  cpf: 0,
  birthDate: 0,
  cep: 1,
  street: 1,
  number: 1,
  neighborhood: 1,
  city: 1,
  state: 1,
  password: 2,
};

/** Cadastro em 3 etapas: dados pessoais, endereço (com CEP verificado) e senha + consentimentos. */
export default function SignUpPage() {
  const styles = useStyles();
  const colors = useColors();
  const router = useRouter();
  const { isMobile } = useBreakpoint();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Form>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [cepStatus, setCepStatus] = useState<CepStatus>('idle');
  const [cepUf, setCepUf] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const lastCep = useRef('');

  const set = <K extends keyof Form>(key: K, value: Form[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key] || errors.form) setErrors((e) => ({ ...e, [key]: undefined, form: undefined }));
  };

  // ---------- Consulta automática do CEP ----------
  const searchCep = async (cep: string) => {
    setCepStatus('loading');
    const result = await lookupCep(cep);
    if (lastCep.current !== onlyDigits(cep)) return; // o cliente já mudou o CEP
    if (result.status === 'found') {
      setCepStatus('found');
      setCepUf(result.address.state);
      // Preenche os campos, que continuam editáveis para correções.
      setForm((f) => ({
        ...f,
        street: result.address.street || f.street,
        neighborhood: result.address.neighborhood || f.neighborhood,
        city: result.address.city,
        state: result.address.state,
      }));
      setErrors((e) => ({
        ...e,
        cep: undefined,
        street: undefined,
        neighborhood: undefined,
        city: undefined,
        state: undefined,
      }));
    } else {
      setCepStatus(result.status);
      setCepUf(null);
    }
  };

  useEffect(() => {
    const digits = onlyDigits(form.cep);
    if (digits.length === 8 && digits !== lastCep.current) {
      lastCep.current = digits;
      searchCep(digits);
    } else if (digits.length < 8 && lastCep.current) {
      lastCep.current = '';
      setCepStatus('idle');
      setCepUf(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.cep]);

  // ---------- Validação por etapa ----------
  const validate = (s: number): Errors => {
    const e: Errors = {};
    if (s === 0) {
      if (!isFullName(form.name)) e.name = 'Informe nome e sobrenome.';
      if (!isValidEmail(form.email)) e.email = 'Informe um e-mail válido.';
      if (!isValidPhone(form.phone)) e.phone = 'Informe um telefone válido com DDD.';
      if (!isValidCPF(form.cpf)) e.cpf = 'CPF inválido. Confira os números digitados.';
      if (form.birthDate) {
        const iso = parseBRDate(form.birthDate);
        if (!iso) e.birthDate = 'Data inválida. Use DD/MM/AAAA.';
        else if (new Date(iso) > new Date()) e.birthDate = 'A data não pode estar no futuro.';
        else if (ageFrom(iso) > 120) e.birthDate = 'Confira o ano de nascimento.';
      }
    }
    if (s === 1) {
      if (!isCompleteCEP(form.cep)) e.cep = 'Informe os 8 números do CEP.';
      else if (cepStatus === 'not-found') e.cep = 'CEP não encontrado. Confira os números.';
      else if (cepStatus === 'unavailable')
        e.cep = 'Não foi possível verificar o CEP agora. Tente novamente.';
      else if (cepStatus !== 'found') e.cep = 'Aguarde a verificação do CEP.';
      if (!form.street.trim()) e.street = 'Informe a rua.';
      if (!form.number.trim()) e.number = 'Informe o número (ou "S/N").';
      if (!form.neighborhood.trim()) e.neighborhood = 'Informe o bairro.';
      if (!form.city.trim()) e.city = 'Informe a cidade.';
      const uf = form.state.toUpperCase();
      if (!(UFS as readonly string[]).includes(uf)) e.state = 'Use a sigla do estado (ex.: SP).';
      else if (cepUf && uf !== cepUf) e.state = `Este CEP pertence a ${cepUf}.`;
    }
    if (s === 2) {
      if (!isStrongPassword(form.password)) e.password = 'A senha não atende a todos os requisitos.';
      if (form.confirm !== form.password) e.confirm = 'As senhas não são iguais.';
      if (!form.terms) e.terms = 'É preciso aceitar os Termos e a Política de privacidade.';
    }
    return e;
  };

  const next = () => {
    const e = validate(step);
    setErrors(e);
    if (Object.keys(e).length === 0) setStep((s) => s + 1);
  };

  const submit = async () => {
    const e = validate(2);
    setErrors(e);
    if (Object.keys(e).length) return;

    setSubmitting(true);
    try {
      const birthIso = form.birthDate ? parseBRDate(form.birthDate) : null;
      await register({
        name: form.name.trim().replace(/\s+/g, ' '),
        email: form.email.trim().toLowerCase(),
        phone: onlyDigits(form.phone),
        cpf: onlyDigits(form.cpf),
        birthDate: birthIso ?? undefined,
        password: form.password,
        address: {
          zipCode: onlyDigits(form.cep),
          street: form.street.trim(),
          number: form.number.trim(),
          complement: form.complement.trim() || undefined,
          neighborhood: form.neighborhood.trim(),
          city: form.city.trim(),
          state: form.state.toUpperCase(),
          country: 'BR',
          isDefault: true,
        },
        consents: {
          termsAndPrivacy: true,
          marketing: form.marketing,
          birthdayCampaigns: !!birthIso && form.birthday,
        },
      });
      router.replace('/entrar?cadastro=ok');
    } catch (err) {
      if (err instanceof ApiError && err.fieldErrors) {
        const fe = err.fieldErrors as Errors;
        setErrors(fe);
        const firstStep = Math.min(...Object.keys(fe).map((k) => FIELD_STEP[k as keyof Form] ?? 2));
        setStep(firstStep);
      } else if (err instanceof ApiError && err.code === 'NOT_CONFIGURED') {
        setErrors({ form: 'O cadastro estará disponível assim que o servidor da loja for ativado.' });
      } else {
        setErrors({ form: friendlyError(err) });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const checks = passwordChecks(form.password);

  return (
    <AuthLayout
      title="Criar conta"
      subtitle="Leva menos de 2 minutos. Você ganha automaticamente o cartão fidelidade UrbanShop."
      maxWidth={620}
    >
      {/* Indicador de etapas */}
      <View
        style={styles.stepper}
        accessibilityLabel={`Etapa ${step + 1} de ${STEPS.length}: ${STEPS[step]}`}
      >
        {STEPS.map((label, i) => {
          const done = i < step;
          const current = i === step;
          return (
            <View key={label} style={styles.stepItem}>
              <View style={[styles.stepDot, (done || current) && styles.stepDotActive]}>
                {done ? (
                  <Check size={12} color={colors.black} strokeWidth={3} />
                ) : (
                  <UText style={[styles.stepNumber, current && { color: colors.black }]}>{i + 1}</UText>
                )}
              </View>
              {!isMobile || current ? (
                <UText variant="small" color={current ? colors.text : colors.textDim}>
                  {label}
                </UText>
              ) : null}
            </View>
          );
        })}
      </View>

      {step === 0 ? (
        <>
          <TextField
            label="Nome completo"
            value={form.name}
            onChangeText={(v) => set('name', v)}
            error={errors.name}
            autoComplete="name"
            textContentType="name"
            autoCapitalize="words"
          />
          <TextField
            label="E-mail"
            value={form.email}
            onChangeText={(v) => set('email', v)}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
            hint="Enviaremos um link para confirmar este e-mail."
          />
          <TextField
            label="Celular"
            value={form.phone}
            onChangeText={(v) => set('phone', v)}
            mask={formatPhone}
            error={errors.phone}
            keyboardType="phone-pad"
            autoComplete="tel"
            textContentType="telephoneNumber"
            placeholder="(11) 98765-4321"
            hint="Usado para avisos sobre seus pedidos e entregas."
          />
          <TextField
            label="CPF"
            value={form.cpf}
            onChangeText={(v) => set('cpf', v)}
            mask={formatCPF}
            error={errors.cpf}
            keyboardType="number-pad"
            placeholder="000.000.000-00"
            right={isValidCPF(form.cpf) ? <CircleCheck size={18} color={colors.success} /> : null}
            hint="Necessário para emitir a nota fiscal e para a transportadora. Fica protegido e não é exibido no app."
          />
          <TextField
            label="Data de nascimento"
            optional
            value={form.birthDate}
            onChangeText={(v) => set('birthDate', v)}
            mask={formatDate}
            error={errors.birthDate}
            keyboardType="number-pad"
            placeholder="DD/MM/AAAA"
            hint="Só usamos para enviar um presente no seu aniversário, se você autorizar."
          />
        </>
      ) : null}

      {step === 1 ? (
        <>
          <TextField
            label="CEP"
            value={form.cep}
            onChangeText={(v) => set('cep', v)}
            mask={formatCEP}
            error={errors.cep}
            keyboardType="number-pad"
            autoComplete="postal-code"
            textContentType="postalCode"
            placeholder="00000-000"
            loading={cepStatus === 'loading'}
            right={
              cepStatus === 'found' ? (
                <CircleCheck size={18} color={colors.success} />
              ) : cepStatus === 'not-found' ? (
                <X size={18} color={colors.danger} />
              ) : cepStatus === 'unavailable' ? (
                <Pressable
                  onPress={() => searchCep(form.cep)}
                  accessibilityRole="button"
                  accessibilityLabel="Tentar verificar o CEP de novo"
                  hitSlop={8}
                >
                  <RefreshCw size={18} color={colors.gold} />
                </Pressable>
              ) : null
            }
            hint={
              cepStatus === 'found'
                ? 'CEP verificado. Confira os dados abaixo e corrija se precisar.'
                : cepStatus === 'not-found'
                  ? undefined
                  : 'Digite o CEP e preenchemos o endereço para você.'
            }
          />
          {cepStatus === 'not-found' && !errors.cep ? (
            <UText variant="small" color={colors.danger}>
              CEP não encontrado. Confira os números.
            </UText>
          ) : null}
          <TextField
            label="Rua"
            value={form.street}
            onChangeText={(v) => set('street', v)}
            error={errors.street}
            autoComplete="street-address"
          />
          <View style={styles.row}>
            <View style={styles.rowSmall}>
              <TextField
                label="Número"
                value={form.number}
                onChangeText={(v) => set('number', v)}
                error={errors.number}
                placeholder="123 ou S/N"
              />
            </View>
            <View style={styles.rowBig}>
              <TextField
                label="Complemento"
                optional
                value={form.complement}
                onChangeText={(v) => set('complement', v)}
                placeholder="Apto, bloco…"
              />
            </View>
          </View>
          <TextField
            label="Bairro"
            value={form.neighborhood}
            onChangeText={(v) => set('neighborhood', v)}
            error={errors.neighborhood}
          />
          <View style={styles.row}>
            <View style={styles.rowBig}>
              <TextField
                label="Cidade"
                value={form.city}
                onChangeText={(v) => set('city', v)}
                error={errors.city}
              />
            </View>
            <View style={styles.rowSmall}>
              <TextField
                label="Estado"
                value={form.state}
                onChangeText={(v) => set('state', v)}
                mask={(v) =>
                  v
                    .replace(/[^a-zA-Z]/g, '')
                    .slice(0, 2)
                    .toUpperCase()
                }
                error={errors.state}
                autoCapitalize="characters"
                placeholder="SP"
              />
            </View>
          </View>
          <TextField
            label="País"
            value="Brasil"
            onChangeText={() => {}}
            editable={false}
            hint="No momento entregamos apenas no Brasil."
          />
          <UText variant="caption">Você poderá cadastrar outros endereços depois, na sua conta.</UText>
        </>
      ) : null}

      {step === 2 ? (
        <>
          <TextField
            label="Senha"
            value={form.password}
            onChangeText={(v) => set('password', v)}
            error={errors.password}
            password
            autoComplete="new-password"
            textContentType="newPassword"
          />
          <View style={styles.checks}>
            {checks.map((c) => (
              <View key={c.label} style={styles.checkRow}>
                {c.ok ? (
                  <Check size={14} color={colors.success} strokeWidth={3} />
                ) : (
                  <View style={styles.checkDot} />
                )}
                <UText variant="small" color={c.ok ? colors.text : colors.textMuted}>
                  {c.label}
                </UText>
              </View>
            ))}
          </View>
          <TextField
            label="Confirmar senha"
            value={form.confirm}
            onChangeText={(v) => set('confirm', v)}
            error={errors.confirm}
            password
            autoComplete="new-password"
            textContentType="newPassword"
          />

          <View style={styles.consents}>
            <Checkbox
              checked={form.terms}
              onChange={(v) => set('terms', v)}
              error={errors.terms}
              accessibilityLabel="Li e aceito os Termos de uso e a Política de privacidade"
            >
              <UText variant="small">
                Li e aceito os{' '}
                <Link href="/institucional/termos" style={{ color: colors.gold }}>
                  Termos de uso
                </Link>{' '}
                e a{' '}
                <Link href="/institucional/privacidade" style={{ color: colors.gold }}>
                  Política de privacidade
                </Link>
                .
              </UText>
            </Checkbox>
            <Checkbox
              checked={form.marketing}
              onChange={(v) => set('marketing', v)}
              accessibilityLabel="Quero receber novidades e ofertas por e-mail"
            >
              <UText variant="small">Quero receber novidades e ofertas por e-mail. (opcional)</UText>
            </Checkbox>
            {form.birthDate ? (
              <Checkbox
                checked={form.birthday}
                onChange={(v) => set('birthday', v)}
                accessibilityLabel="Autorizo usar minha data de nascimento em campanhas de aniversário"
              >
                <UText variant="small">
                  Autorizo usar minha data de nascimento para receber benefícios de aniversário. (opcional)
                </UText>
              </Checkbox>
            ) : null}
          </View>
        </>
      ) : null}

      {errors.form ? (
        <View style={styles.formError} accessibilityLiveRegion="polite">
          <UText variant="small" color={colors.danger}>
            {errors.form}
          </UText>
        </View>
      ) : null}

      <View style={[styles.actions, isMobile && styles.actionsMobile]}>
        {step > 0 ? (
          <Pressable onPress={() => setStep((s) => s - 1)} accessibilityRole="button" style={styles.back}>
            <ArrowLeft size={16} color={colors.textMuted} />
            <UText variant="label" color={colors.textMuted}>
              Voltar
            </UText>
          </Pressable>
        ) : (
          <Link href="/entrar" asChild>
            <Pressable accessibilityRole="link" style={styles.back}>
              <UText variant="small">Já tenho conta</UText>
            </Pressable>
          </Link>
        )}
        {step < STEPS.length - 1 ? (
          <Button
            label="Continuar"
            onPress={next}
            arrow
            fullWidth={isMobile}
            disabled={step === 1 && cepStatus === 'loading'}
          />
        ) : (
          <Button
            label="Criar conta"
            onPress={submit}
            loading={submitting}
            fullWidth={isMobile}
            variant="gold"
          />
        )}
      </View>
    </AuthLayout>
  );
}

const useStyles = makeStyles((colors) => ({
  stepper: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  stepItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stepDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: { backgroundColor: colors.gold, borderColor: colors.gold },
  stepNumber: { fontSize: 12, lineHeight: 14, color: colors.textMuted, fontFamily: fonts.bodyBold },
  row: { flexDirection: 'row', gap: spacing.sm },
  rowSmall: { flex: 1 },
  rowBig: { flex: 2 },
  checks: { gap: 6, marginTop: -spacing.sm },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkDot: { width: 14, height: 14, borderRadius: 7, borderWidth: 1, borderColor: colors.lineStrong },
  consents: { gap: spacing.md, marginTop: spacing.sm },
  formError: { padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.danger },
  actions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  actionsMobile: { flexDirection: 'column-reverse', alignItems: 'stretch' },
  back: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10, alignSelf: 'center' },
}));
