export function splitProductData(data: any, maxLength: number = 20000): string[] {
  const sections: string[] = [];

  // Helper para formatar valores em uma string única
  const formatValue = (value: any): string =>
    typeof value === "string"
      ? value
      : JSON.stringify(value, null, 2)
          .replace(/[\n\r]+/g, " ")
          .replace(/\s+/g, " ");

  // Helper para adicionar uma section com truncamento e aviso, se necessário
  const addSection = (sectionLabel: string, content: string): void => {
    let section = `${sectionLabel}: ${content}`;
    if (section.length > maxLength) {
      let warningMessage: string;
      if (sectionLabel.startsWith("Variation - ")) {
        warningMessage = `⚠️ A seção de variação ${sectionLabel.replace(
          "Variation - ",
          ""
        )} foi truncada por exceder ${maxLength} caracteres.`;
      } else if (sectionLabel.startsWith("items[0].sellers[0].commertialOffer.")) {
        warningMessage = `⚠️ A seção ${sectionLabel} foi truncada por exceder ${maxLength} caracteres.`;
      } else {
        warningMessage = `⚠️ A propriedade ${sectionLabel} foi truncada por exceder ${maxLength} caracteres.`;
      }
      console.warn(warningMessage);
      section = section.slice(0, maxLength);
    }
    sections.push(section);
  };

  // Processa as propriedades do objeto pai (exceto "items")
  Object.entries(data).forEach(([key, value]) => {
    if (key !== "items") {
      addSection(key, formatValue(value));
    } else {
      // Processa a propriedade "items"
      if (Array.isArray(value) && value.length > 0) {
        const firstItem = value[0];
        if (
          firstItem &&
          typeof firstItem === "object" &&
          Array.isArray(firstItem.sellers) &&
          firstItem.sellers.length > 0
        ) {
          const firstSeller = firstItem.sellers[0];
          if (
            firstSeller &&
            typeof firstSeller === "object" &&
            firstSeller.commertialOffer &&
            typeof firstSeller.commertialOffer === "object"
          ) {
            Object.entries(firstSeller.commertialOffer).forEach(
              ([coKey, coValue]) => {
                // Ignora a propriedade PaymentOptions
                if (coKey === "PaymentOptions") return;

                // Processa a propriedade Installments
                if (coKey === "Installments" && Array.isArray(coValue)) {
                  // Agrupa por PaymentSystemName e mantém o último objeto de cada grupo
                  const installmentsByPaymentSystem: { [key: string]: any } = {};
                  coValue.forEach((installment: any) => {
                    if (
                      installment &&
                      typeof installment === "object" &&
                      installment.PaymentSystemName
                    ) {
                      installmentsByPaymentSystem[installment.PaymentSystemName] =
                        installment;
                    }
                  });
                  const filteredInstallments = Object.values(
                    installmentsByPaymentSystem
                  );
                  addSection(
                    `items[0].sellers[0].commertialOffer.${coKey}`,
                    formatValue(filteredInstallments)
                  );
                } else {
                  // Processamento padrão para as demais propriedades
                  addSection(
                    `items[0].sellers[0].commertialOffer.${coKey}`,
                    formatValue(coValue)
                  );
                }
              }
            );
          }
        }
      }
    }
  });

  // Agrega as variações de todos os produtos em "items"
  // Cada item possui a propriedade "variations" (um array com as chaves)
  if (Array.isArray(data.items) && data.items.length > 0) {
    const variationsAggregated: { [key: string]: Set<string> } = {};

    data.items.forEach((item: any) => {
      if (Array.isArray(item.variations)) {
        item.variations.forEach((variationKey: string) => {
          // Supondo que o valor da variação esteja em item[variationKey]
          let variationValue = item[variationKey];
          if (variationValue !== undefined && variationValue !== null) {
            variationValue =
              typeof variationValue === "string"
                ? variationValue.trim()
                : String(variationValue);
            if (!variationsAggregated[variationKey]) {
              variationsAggregated[variationKey] = new Set<string>();
            }
            variationsAggregated[variationKey].add(variationValue);
          }
        });
      }
    });

    // Cria uma section para cada variação agregada
    Object.entries(variationsAggregated).forEach(
      ([variationKey, valuesSet]) => {
        const valuesArray = Array.from(valuesSet);
        const formattedVariation = valuesArray.join(", ");
        addSection(`Variation - ${variationKey}`, formattedVariation);
      }
    );
  }

  return sections;
}
