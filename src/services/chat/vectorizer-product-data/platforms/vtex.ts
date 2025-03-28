import { getProductDataBySlug } from "@/third-parties/vtex/getProductDataBySlug.ts";
import {
  Installment,
  ProductItem,
  VtexProductBySlug,
} from "@/types/third-parties/vtex/product-by-slug.ts";

export async function vtexVectorProductData(store: string, slug: string) {
  try {
    const productData = await getProductDataBySlug(store, slug);

    if (!productData)
      throw new Error("Não há dados do produto para este slug.");

    const vector: string[] = vectorizeVtexProductData(productData);

    return vector;
  } catch (error) {
    console.error(error);
    return null;
  }
}
function vectorizeVtexProductData(
  data: VtexProductBySlug,
  maxLength: number = 20000
): string[] {
  const sections: string[] = [];

  const formatValue = (value: any): string =>
    typeof value === "string"
      ? value
      : JSON.stringify(value, null, 2).replace(/\s+/g, " ");

  const addSection = (sectionLabel: string, content: string): void => {
    let section = `${sectionLabel}: ${content}`;
    if (section.length > maxLength) {
      console.warn(`⚠️ A seção ${sectionLabel} foi truncada.`);
      section = section.slice(0, maxLength);
    }
    sections.push(section);
  };

  Object.entries(data).forEach(([key, value]) => {
    if (key === "items" && Array.isArray(value) && value.length > 0) {
      processItems(value[0], addSection, formatValue);
    } else {
      addSection(key, formatValue(value));
    }
  });

  aggregateVariations(data.items, addSection);
  return sections;
}

function processItems(
  item: ProductItem,
  addSection: (label: string, content: string) => void,
  formatValue: (value: any) => string
) {
  const seller = item.sellers?.[0];
  if (!seller || !seller.commertialOffer) return;

  Object.entries(seller.commertialOffer).forEach(([key, value]) => {
    if (key === "PaymentOptions") return;
    if (key === "Installments" && Array.isArray(value)) {
      const installmentsBySystem = Object.values(
        value.reduce((acc: Record<string, Installment>, inst) => {
          acc[inst.PaymentSystemName] = inst;
          return acc;
        }, {})
      );
      addSection(
        `items[0].sellers[0].commertialOffer.${key}`,
        formatValue(installmentsBySystem)
      );
    } else {
      addSection(
        `items[0].sellers[0].commertialOffer.${key}`,
        formatValue(value)
      );
    }
  });
}

function aggregateVariations(
  items: ProductItem[],
  addSection: (label: string, content: string) => void
) {
  const variations: Record<string, Set<string>> = {};

  items.forEach((item) => {
    item.variations?.forEach((key: keyof ProductItem) => {
      const value = String(item[key] || "").trim();
      if (!variations[key]) variations[key] = new Set();
      variations[key].add(value);
    });
  });

  Object.entries(variations).forEach(([key, values]) => {
    addSection(`Variation - ${key}`, Array.from(values).join(", "));
  });
}
