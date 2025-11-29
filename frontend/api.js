import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Configurar axios para UTF-8
axios.defaults.headers.common['Content-Type'] = 'application/json; charset=utf-8';
axios.defaults.headers.common['Accept'] = 'application/json; charset=utf-8';

// Determina BASE_URL com várias estratégias (em ordem):
// 1) variável de ambiente em tempo de execução (REACT_NATIVE_BASE_URL)
// 2) Expo Constants.manifest?.debuggerHost (dev via Expo)
// 3) IP fixo da máquina (192.168.50.63) - funciona para Android Emulator e dispositivos físicos
// 4) Fallback para 10.0.2.2 (Android emulator padrão)
// 5) localhost por padrão
const envOverride = typeof process !== 'undefined' && process.env && process.env.REACT_NATIVE_BASE_URL;
let hostForDev = 'localhost';
try {
  if (envOverride) {
    hostForDev = envOverride;
  } else if (Constants?.manifest?.debuggerHost) {
    // debuggerHost no formato '192.168.x.y:19000' ou similar
    hostForDev = Constants.manifest.debuggerHost.split(':')[0];
  } else if (Platform.OS === 'android') {
    // Usar IP fixo da máquina ao invés de 10.0.2.2
    hostForDev = '192.168.50.63';
  }
} catch (e) {
  // Fallback silencioso para ambientes que não expõem Constants
  hostForDev = hostForDev || 'localhost';
}

const BASE_URL = __DEV__ ? `http://${hostForDev}:3000` : 'http://localhost:3000';

// Exporta BASE_URL para facilitar testes e logs
console.log('[api] BASE_URL resolvido para', BASE_URL);

const handleError = (error) => {
  console.error('API Error:', error);
  const message = error.response?.data?.message || error.message || 'Erro ao conectar com o servidor';
  throw new Error(message);
};

export const apiMedicamentos = {
  list: async () => {
    try {
      return (await axios.get(`${BASE_URL}/medicamentos`)).data;
    } catch (error) {
      handleError(error);
    }
  },
  add: async (item) => {
    try {
      return (await axios.post(`${BASE_URL}/medicamento`, item)).data;
    } catch (error) {
      handleError(error);
    }
  },
  edit: async (id, item) => {
    try {
      return (await axios.put(`${BASE_URL}/medicamento/${id}`, item)).data;
    } catch (error) {
      handleError(error);
    }
  },
  remove: async (id) => {
    try {
      return (await axios.delete(`${BASE_URL}/medicamento/${id}`)).data;
    } catch (error) {
      handleError(error);
    }
  },
};

export const apiClientes = {
  list: async () => {
    try {
      return (await axios.get(`${BASE_URL}/clientes`)).data;
    } catch (error) {
      handleError(error);
    }
  },
  add: async (item) => {
    try {
      return (await axios.post(`${BASE_URL}/cliente`, item)).data;
    } catch (error) {
      handleError(error);
    }
  },
  edit: async (id, item) => {
    try {
      return (await axios.put(`${BASE_URL}/cliente/${id}`, item)).data;
    } catch (error) {
      handleError(error);
    }
  },
  remove: async (id) => {
    try {
      return (await axios.delete(`${BASE_URL}/cliente/${id}`)).data;
    } catch (error) {
      handleError(error);
    }
  },
};
