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

// Proteção caso o módulo nativo não esteja disponível (por ex. dependências não instaladas ou rodando na web)
const hasOpenDatabase = SQLite && typeof SQLite.openDatabase === 'function';

let db;
if (hasOpenDatabase) {
  db = SQLite.openDatabase('farmacia.db');
} else {
  console.warn(
    '[db] expo-sqlite não está disponível. Muitas funcionalidades de persistência não funcionarão.\n' +
      'Instale o módulo nativo compatível executando: `npx expo install expo-sqlite` e reinicie o projeto.'
  );

  // Fallback mínimo para evitar crashes durante o desenvolvimento (no-op)
  const noopTx = {
    executeSql: (_sql, _params, success) => {
      console.warn('[db] executeSql chamado no fallback (nenhuma ação). SQL:', _sql);
      if (typeof success === 'function') {
        // Chamar com os mesmos argumentos que expo-sqlite fornece: (tx, resultSet)
        success(noopTx, { rows: { _array: [] } });
      }
      // Retornar true para indicar que não houve erro (opcional)
      return true;
    }
  };

  db = {
    transaction: (cb) => {
      cb(noopTx);
    }
  };
}

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
      () => {},
      (t, e) => { console.warn('[db] erro ao criar tabela medicamentos', e); }
    );
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS clientes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT,
        telefone TEXT
      );`,
      [],
      () => {},
      (t, e) => { console.warn('[db] erro ao criar tabela clientes', e); }
    );
  });
};

export default db;
