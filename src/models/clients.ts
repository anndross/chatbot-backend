// models/clients.js
import { db } from '../config/firebase';

export interface Client {
  clientId: string;
  name: string;
  hostname: string;
  paymentStatus: string;
  services: string[];
}


// Função para obter os dados de um cliente a partir do clientId
const getClient = async (clientId: string): Promise<Client | null> => {
  const querySnapshot = await db
    .collection('users')
    .where('clientId', '==', clientId)
    .get();
  
  if (!querySnapshot.empty) {
    // Retorna o primeiro documento encontrado, convertendo os dados para o tipo Client
    const clientData = querySnapshot.docs[0].data() as Client;

    return clientData;
  }

  return null;
};


/**
 * Check if the clientId (host) is valid.
 * In production
 */
export const isValidClient = async  (clientId: string): Promise<boolean> => {
  const client = await getClient(clientId);

  if (client && client.paymentStatus === 'paid') {
    console.log('✅ Cliente pagante:');
    return true;
  }
  console.log('❌ Cliente não pagante:', client);
  return false;
};