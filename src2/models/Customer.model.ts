import { db } from "@/config/Firebase.database";
import { Customer } from "@/types/customer";

export async function CustomerModel(host: string): Promise<Customer | null> {
  try {
    const querySnapshot = await db
      .collection("users")
      .where("hostname", "==", host)
      .get();

    const getFirstCustomerData = (snapshot: any) =>
      snapshot.docs[0].data() as Customer;

    if (!querySnapshot.empty) {
      return getFirstCustomerData(querySnapshot);
    }

    throw new Error("Cliente não encontrado.");
  } catch (error) {
    console.error(error);
    return null;
  }
}
