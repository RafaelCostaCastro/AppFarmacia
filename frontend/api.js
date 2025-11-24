import axios from 'axios';
import { Platform } from 'react-native';

// BASE_URL automático:
// - Emulador Android (Android Studio) precisa usar 10.0.2.2 para alcançar o host da máquina
// - Emulador iOS ou Expo Web usam 'localhost'
// - Em dispositivo físico substitua por 'http://<SEU_IP>:3000'
const hostForDev = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
const BASE_URL = __DEV__ ? `http://${hostForDev}:3000` : 'http://localhost:3000';

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
