import { useCallback, useEffect, useRef, useState } from 'react';

export type RequestState<T> =
  | { status: 'loading'; data: undefined; error: undefined }
  | { status: 'success'; data: T; error: undefined }
  | { status: 'error'; data: undefined; error: unknown };

/**
 * Executa uma requisição assíncrona e expõe carregando / sucesso / erro,
 * com função para tentar de novo. Ignora respostas de requisições antigas.
 */
export function useRequest<T>(fn: () => Promise<T>, deps: unknown[]) {
  const [state, setState] = useState<RequestState<T>>({
    status: 'loading',
    data: undefined,
    error: undefined,
  });
  const callId = useRef(0);

  const run = useCallback(() => {
    const id = ++callId.current;
    setState({ status: 'loading', data: undefined, error: undefined });
    fn().then(
      (data) => {
        if (id === callId.current) setState({ status: 'success', data, error: undefined });
      },
      (error) => {
        if (id === callId.current) setState({ status: 'error', data: undefined, error });
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    run();
    return () => {
      callId.current++;
    };
  }, [run]);

  return { ...state, reload: run };
}
