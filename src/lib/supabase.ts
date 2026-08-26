import { createClient } from '@supabase/supabase-js';

// Variáveis de ambiente para o Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Determina se o Supabase está configurado.
 * Em desenvolvimento, se faltar credenciais, o app opera em MODO MOCK
 * para que as telas possam ser visualizadas sem backend.
 */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

/**
 * Cria um client Supabase REAL ou um client "mock" com API compatível
 * que retorna lista vazia / null — para desenvolvimento local sem backend.
 */
function createSupabaseClient() {
  if (isSupabaseConfigured) {
    return createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    });
  }

  console.warn(
    '[MagikFunil] Supabase NÃO configurado (faltam VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY). ' +
    'Rodando em MODO DEMO: as telas aparecem, mas com dados vazios.'
  );
  return createMockClient();
}

/**
 * Client mock com superfície mínima compatível com o que as telas usam:
 *   .from(t).select(...).eq(...).order(...).single()
 *   .from(t).insert(...)
 *   .auth.getSession() / onAuthStateChange() / signOut()
 *   .storage.from(...).getPublicUrl()
 * Todas as queries resolvem com data null / [] e error null (sem crash).
 */
function createMockClient() {
  const resolveEmpty = () => Promise.resolve({ data: null, error: null });
  const resolveList = () => Promise.resolve({ data: [], error: null });

  // Cadeia encadeada: qualquer chamada de filtro devolve this novamente.
  // Os métodos terminais (.single, .maybeSingle, .then) resolvem vazio.
  const chain = {
    select: () => chain,
    eq: () => chain,
    neq: () => chain,
    gt: () => chain,
    gte: () => chain,
    lt: () => chain,
    lte: () => chain,
    in: () => chain,
    contains: () => chain,
    ilike: () => chain,
    order: () => chain,
    limit: () => chain,
    range: () => chain,
    maybeSingle: resolveList,
    single: resolveEmpty,
    then: (onFulfilled?: any) => {
      // Simula o retorno de uma query e permite `.then()` no resultado
      return Promise.resolve({ data: [], error: null }).then((r) =>
        typeof onFulfilled === 'function' ? onFulfilled(r) : r
      );
    },
    insert: (payload: any) => ({
      select: () => ({ ...chain }),
      single: resolveEmpty,
    }),
    update: () => ({ eq: () => ({
      select: () => ({ ...chain }),
      then: (cb?: any) => Promise.resolve({ data: null, error: null }).then((r) => (typeof cb === 'function' ? cb(r) : r)),
    }) }),
    delete: () => ({ eq: () => ({ ...chain }) }),
  };

  const from = (table: string) => ({ ...chain });

  return {
    from,
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      getSessionRefreshed: async () => ({ data: { session: null }, error: null }),
      signInWithPassword: async () => ({ data: null, error: { message: 'Supabase não configurado (modo demo)' } }),
      signInWithOtp: async () => ({ data: null, error: { message: 'Supabase não configurado (modo demo)' } }),
      signUp: async () => ({ data: null, error: { message: 'Supabase não configurado (modo demo)' } }),
      signOut: async () => ({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      resetPasswordForEmail: async () => ({ data: null, error: { message: 'Supabase não configurado (modo demo)' } }),
    },
    storage: {
      from: (bucket: string) => ({
        upload: async () => ({ data: null, error: { message: 'Storage não disponível (modo demo)' } }),
        remove: async () => ({ data: null, error: { message: 'Storage não disponível (modo demo)' } }),
        getPublicUrl: (path: string) => ({ data: { publicUrl: '' } }),
        list: async () => ({ data: [], error: null }),
      }),
    },
    rpc: () => ({
      maybeSingle: resolveList,
      single: resolveEmpty,
      then: (cb?: any) => Promise.resolve({ data: null, error: null }).then((r) => (typeof cb === 'function' ? cb(r) : r)),
    }),
  };
}

// Exporta o client (real ou mock)
// Tipamos como `any` para que chamadas `await supabase.from(...)...` funcionem
// tanto com o client real do Supabase quanto com o mock de desenvolvimento.
export const supabase: any = createSupabaseClient();

export default supabase;