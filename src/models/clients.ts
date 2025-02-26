// models/clients.js
import { db } from '../config/firebase';

export interface Client {
  clientId: string;
  name: string;
  hostname: string;
  paymentStatus: string;
  services: string[];
}

// Simulated list of allowed client hosts
const allowedClients = [
    {
      clientId: "khelf_cb",
      name: "khelf",
      hostname: "www.khelf.com.br",
      paymentStatus: "paid",
      services: [
        "chatbot", 
        "vtex"
      ],
    },
    {
      clientId: "casa_mais_facil_cb",
      name: "casa_mais_facil",
      hostname: "www.casamaisfacil.com.br",
      paymentStatus: "paid",
      services: [
        "chatbot", 
        "vtex"
      ],
    },
  ];

  
  // Função para obter os dados de um cliente a partir do clientId
  const getClient = async (clientId: string): Promise<Client | null> => {
    const querySnapshot = await db
      .collection('users')
      .where('clientId', '==', clientId)
      .get();
    
    if (!querySnapshot.empty) {
      // Retorna o primeiro documento encontrado, convertendo os dados para o tipo Client
      const clientData = querySnapshot.docs[0].data() as Client;
      console.log('🔍 Cliente encontrado:', clientData);

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
    console.log('✅ Cliente pagante:', client);
    return true;
  }
  console.log('❌ Cliente não pagante:', client);
  return false;
};