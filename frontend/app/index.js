import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { setupDatabase } from '../db';
import MedicamentoScreen from '../MedicamentoScreen';
import ClienteScreen from '../ClienteScreen';

export default function Home() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [dbType, setDbType] = useState(null);
  const [activeScreen, setActiveScreen] = useState(null);

  useEffect(() => {
    async function prepare() {
      try {
        setupDatabase();
        await new Promise(resolve => setTimeout(resolve, 1500));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }
    prepare();
  }, []);

  useEffect(() => {
    if (appIsReady) {
      SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  const onLayoutRootView = useCallback(async () => {
    // Garante que o splash screen seja escondido quando o layout for renderizado
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  if (!dbType) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} onLayout={onLayoutRootView}>
        <Text style={{fontSize: 20, fontWeight: "bold", marginBottom: 20}}>Farmácia</Text>
        <Text>Escolha o Banco de Dados:</Text>
        <Button title="MongoDB (API)" onPress={() => setDbType('mongodb')} />
        <View style={{height: 10}}/>
        <Button title="SQLite (Local)" onPress={() => setDbType('sqlite')} />
      </View>
    );
  }

  if (!activeScreen) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text style={{fontSize: 18, fontWeight: 'bold', marginBottom: 12}}>O que deseja gerenciar?</Text>
        <Button title="Medicamentos" onPress={() => setActiveScreen('medicamentos')} />
        <View style={{height: 10}}/>
        <Button title="Clientes" onPress={() => setActiveScreen('clientes')} />
        <View style={{height: 20}}/>
        <Button title="Voltar à escolha do Banco" onPress={() => setDbType(null)} />
      </View>
    );
  }

  if (activeScreen === 'medicamentos') {
    return <MedicamentoScreen dbType={dbType} voltar={() => setActiveScreen(null)} />;
  }

  if (activeScreen === 'clientes') {
    return <ClienteScreen dbType={dbType} voltar={() => setActiveScreen(null)} />;
  }

  return null;
}
