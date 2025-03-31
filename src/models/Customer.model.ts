import { Customer } from "@/types/customer.ts";

export class CustomerModel {
  private db: any;

  constructor(dbInstance: any) {
    this.db = dbInstance;
  }

  async getCustomerByHost(host: string): Promise<Customer | null> {
    try {
      const querySnapshot = await this.db
        .collection("users")
        .where("host", "==", host)
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
}
