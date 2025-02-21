var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/platforms/vtex/splitProductData.ts
var splitProductData_exports = {};
__export(splitProductData_exports, {
  splitProductData: () => splitProductData
});
module.exports = __toCommonJS(splitProductData_exports);
function splitProductData(data, maxLength = 2e4) {
  const sections = [];
  const formatValue = (value) => typeof value === "string" ? value : JSON.stringify(value, null, 2).replace(/[\n\r]+/g, " ").replace(/\s+/g, " ");
  const addSection = (sectionLabel, content) => {
    let section = `${sectionLabel}: ${content}`;
    if (section.length > maxLength) {
      let warningMessage;
      if (sectionLabel.startsWith("Variation - ")) {
        warningMessage = `\u26A0\uFE0F A se\xE7\xE3o de varia\xE7\xE3o ${sectionLabel.replace(
          "Variation - ",
          ""
        )} foi truncada por exceder ${maxLength} caracteres.`;
      } else if (sectionLabel.startsWith("items[0].sellers[0].commertialOffer.")) {
        warningMessage = `\u26A0\uFE0F A se\xE7\xE3o ${sectionLabel} foi truncada por exceder ${maxLength} caracteres.`;
      } else {
        warningMessage = `\u26A0\uFE0F A propriedade ${sectionLabel} foi truncada por exceder ${maxLength} caracteres.`;
      }
      console.warn(warningMessage);
      section = section.slice(0, maxLength);
    }
    sections.push(section);
  };
  Object.entries(data).forEach(([key, value]) => {
    if (key !== "items") {
      addSection(key, formatValue(value));
    } else {
      if (Array.isArray(value) && value.length > 0) {
        const firstItem = value[0];
        if (firstItem && typeof firstItem === "object" && Array.isArray(firstItem.sellers) && firstItem.sellers.length > 0) {
          const firstSeller = firstItem.sellers[0];
          if (firstSeller && typeof firstSeller === "object" && firstSeller.commertialOffer && typeof firstSeller.commertialOffer === "object") {
            Object.entries(firstSeller.commertialOffer).forEach(
              ([coKey, coValue]) => {
                if (coKey === "PaymentOptions") return;
                if (coKey === "Installments" && Array.isArray(coValue)) {
                  const installmentsByPaymentSystem = {};
                  coValue.forEach((installment) => {
                    if (installment && typeof installment === "object" && installment.PaymentSystemName) {
                      installmentsByPaymentSystem[installment.PaymentSystemName] = installment;
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
  if (Array.isArray(data.items) && data.items.length > 0) {
    const variationsAggregated = {};
    data.items.forEach((item) => {
      if (Array.isArray(item.variations)) {
        item.variations.forEach((variationKey) => {
          let variationValue = item[variationKey];
          if (variationValue !== void 0 && variationValue !== null) {
            variationValue = typeof variationValue === "string" ? variationValue.trim() : String(variationValue);
            if (!variationsAggregated[variationKey]) {
              variationsAggregated[variationKey] = /* @__PURE__ */ new Set();
            }
            variationsAggregated[variationKey].add(variationValue);
          }
        });
      }
    });
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  splitProductData
});
