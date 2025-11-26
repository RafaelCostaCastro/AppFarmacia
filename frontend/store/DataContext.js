import React, { createContext, useCallback, useEffect, useState } from 'react';
import db from '../db';
import { apiMedicamentos, apiClientes } from '../api';

export const DataContext = createContext({});

export function DataProvider({ children, dbType: initialDbType }) {
  const [medicamentos, setMedicamentos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [dbType, setDbType] = useState(initialDbType || null);

  const fetchMedicamentos = useCallback(() => {
    if (dbType === 'mongodb') {
      apiMedicamentos.list()
        .then(data => setMedicamentos(data))
        .catch(err => {
          console.error('Erro ao buscar medicamentos (context):', err);
        });
    } else {
      try {
        db.transaction(tx => {
          tx.executeSql(
            'SELECT * FROM medicamentos;',
            [],
            (_, { rows: { _array } }) => setMedicamentos(_array),
            (_, error) => console.error('Erro ao buscar medicamentos (context):', error)
          );
        });
      } catch (e) {
        console.error('Erro ao executar fetchMedicamentos (context):', e);
      }
    }
  }, [dbType]);

  const fetchClientes = useCallback(() => {
    if (dbType === 'mongodb') {
      apiClientes.list()
        .then(data => setClientes(data))
        .catch(err => {
          console.error('Erro ao buscar clientes (context):', err);
        });
    } else {
      try {
        db.transaction(tx => {
          tx.executeSql(
            'SELECT * FROM clientes;',
            [],
            (_, { rows: { _array } }) => setClientes(_array),
            (_, error) => console.error('Erro ao buscar clientes (context):', error)
          );
        });
      } catch (e) {
        console.error('Erro ao executar fetchClientes (context):', e);
      }
    }
  }, [dbType]);

  // Recarrega ao montar ou quando dbType muda
  useEffect(() => {
    fetchMedicamentos();
    fetchClientes();
  }, [dbType, fetchMedicamentos, fetchClientes]);

  return (
    <DataContext.Provider value={{
      medicamentos,
      setMedicamentos,
      fetchMedicamentos,
      clientes,
      setClientes,
      fetchClientes,
      dbType,
      setDbType
    }}>
      {children}
    </DataContext.Provider>
  );
}
