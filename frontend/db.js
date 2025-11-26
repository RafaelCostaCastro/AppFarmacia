// Importa o módulo principal; em tempo de execução validamos se `openDatabase` existe.
import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

// Debug rápido: mostra o que foi importado de expo-sqlite e a plataforma
try {
  // logging leve — Metro mostra estes logs no terminal do Expo
  // eslint-disable-next-line no-console
  console.log('[db] Plataforma:', Platform.OS, 'expo-sqlite:', SQLite, 'openDatabase type:', typeof SQLite.openDatabase);
} catch (e) {
  // ignore
}

// Proteção caso o módulo nativo não esteja disponível (por ex. rodando na web sem suporte ou dependência não instalada)
// Proteção para diferentes formas da API expo-sqlite:
// - versão legacy: `SQLite.openDatabase()` existe
// - versão moderna: `SQLite.openDatabaseAsync()` / `openDatabaseSync()`
const hasOpenDatabase = SQLite && typeof SQLite.openDatabase === 'function';
const hasOpenDatabaseAsync = SQLite && typeof SQLite.openDatabaseAsync === 'function';
const hasOpenDatabaseSync = SQLite && typeof SQLite.openDatabaseSync === 'function';

// Envolve a transaction nativa para adicionar logs em executeSql e facilitar debug.
function wrapNativeTransaction(native) {
  if (!native || native._wrapped) return;
  const origTx = native.transaction;
  if (typeof origTx === 'function') {
    native.transaction = function (cb, error, success) {
      // Mantém interface original: origTx(cb, error, success)
      return origTx.call(this, function (tx) {
        console.log('[db] native.transaction inner callback invoked');
        const wrappedTx = {
          executeSql: (sql, params = [], successCb, errorCb) => {
            try {
              // log da query
              console.log('[db] executeSql', sql, params);
              return tx.executeSql(sql, params,
                (t, result) => {
                  console.log('[db] executeSql success', sql);
                  if (typeof successCb === 'function') successCb(t, result);
                },
                (t, err) => {
                  console.warn('[db] executeSql error', sql, err);
                  if (typeof errorCb === 'function') errorCb(t, err);
                }
              );
            } catch (e) {
              console.error('[db] executeSql throw', e);
              if (typeof errorCb === 'function') errorCb(null, e);
            }
          }
        };
        console.log('[db] calling wrapped cb with wrappedTx');
        return cb(wrappedTx);
      }, error, success);
    };
    native._wrapped = true;
  } else if (typeof native.exec === 'function') {
    // adaptador mínimo caso a instância ofereça apenas exec
    native.transaction = (txcb) => {
      const tx = {
        executeSql: (sql, params = [], success, error) => {
          try {
            console.log('[db] exec executeSql', sql, params);
            native.exec([{ sql, args: params }]);
            if (typeof success === 'function') success(tx, { rows: { _array: [] } });
          } catch (e) {
            console.warn('[db] exec erro', e);
            if (typeof error === 'function') error(tx, e);
          }
        }
      };
      console.log('[db] calling exec-based txcb');
      txcb(tx);
    };
    native._wrapped = true;
  }
}

// Exportamos um objeto mutável com transaction(cb) para manter compatibilidade com o restante do app.
const db = {
  // _native será preenchido quando tivermos a instância real do DB
  _native: null,
  _queue: [],
  transaction(cb) {
    console.log('[db] transaction chamada', { hasNative: !!this._native });
    if (this._native && typeof this._native.transaction === 'function') {
      try {
        return this._native.transaction(cb);
      } catch (e) {
        console.error('[db] erro ao executar transaction nativo', e);
        throw e;
      }
    }
    // enfileira até que o DB esteja pronto
    this._queue.push(cb);
  }
};

if (hasOpenDatabase) {
  // API antiga (síncrona)
  try {
    const native = SQLite.openDatabase('farmacia.db');
    db._native = native;
    try { wrapNativeTransaction(native); } catch (e) { console.warn('[db] falha ao envolver transaction legacy', e); }
    console.log('[db] aberto com openDatabase (legacy)');
    // processa fila caso algo tenha sido enfileirado
    const queued = db._queue.length;
    db._queue.forEach(cb => { try { native.transaction(cb); } catch (e) { console.error('[db] erro ao processar transação enfileirada', e); } });
    db._queue = [];
    if (queued) console.log('[db] processadas', queued, 'transações enfileiradas (legacy)');
  } catch (e) {
    console.error('[db] falha ao abrir DB com openDatabase:', e);
    throw e;
  }
} else if (hasOpenDatabaseSync) {
  try {
    const native = SQLite.openDatabaseSync('farmacia.db');
    db._native = native;
    try { wrapNativeTransaction(native); } catch (e) { console.warn('[db] falha ao envolver transaction sync', e); }
    console.log('[db] aberto com openDatabaseSync');
    const queued = db._queue.length;
    db._queue.forEach(cb => { try { native.transaction(cb); } catch (e) { console.error('[db] erro ao processar transação enfileirada', e); } });
    db._queue = [];
    if (queued) console.log('[db] processadas', queued, 'transações enfileiradas (sync)');
  } catch (e) {
    console.error('[db] falha ao abrir DB com openDatabaseSync:', e);
    throw e;
  }
} else if (hasOpenDatabaseAsync) {
  // Abrimos async e mantemos enfileiramento até ficar pronto.
  SQLite.openDatabaseAsync('farmacia.db')
    .then(native => {
      db._native = native;
      console.log('[db] aberto com openDatabaseAsync');
      // Se a instância não expuser transaction, tentamos adaptar usando exec
      if (typeof native.transaction !== 'function' && typeof native.exec === 'function') {
        native.transaction = (txcb) => {
          const tx = {
            executeSql: (sql, params = [], success, error) => {
              try {
                native.exec([{ sql, args: params }]);
                if (typeof success === 'function') success(tx, { rows: { _array: [] } });
              } catch (e) {
                if (typeof error === 'function') error(tx, e);
              }
            }
          };
          txcb(tx);
        };
      }

      // descarrega fila
      const queued = db._queue.length;
      db._queue.forEach(cb => {
        try { native.transaction(cb); } catch (e) { console.error('[db] erro ao processar transação enfileirada', e); }
      });
      db._queue = [];
      console.log('[db] processadas', queued, 'transações enfileiradas');
    })
    .catch(err => {
      console.error('[db] erro abrindo DB async', err);
      throw err;
    });
} else {
  const msg = '[db] expo-sqlite indisponível: verifique se instalou `expo-sqlite` e está rodando em um ambiente nativo (não web).';
  console.error(msg);
  throw new Error(msg);
}

// (o objeto `db` já foi criado acima e será usado)

export const setupDatabase = () => {
  db.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS medicamentos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT,
        descricao TEXT,
        preco REAL
      );`,
      [],
        () => { console.log('[db] tabela medicamentos verificada/criada'); },
        (t, e) => { console.warn('[db] erro ao criar tabela medicamentos', e); }
    );
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS clientes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT,
        telefone TEXT
      );`,
      [],
        () => { console.log('[db] tabela clientes verificada/criada'); },
        (t, e) => { console.warn('[db] erro ao criar tabela clientes', e); }
    );
  });
};

export default db;
