var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/platforms/index.ts
var platforms_exports = {};
__export(platforms_exports, {
  platforms: () => platforms
});
module.exports = __toCommonJS(platforms_exports);

// src/platforms/vtex/getProductData.ts
var import_axios = __toESM(require("axios"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);

// src/platforms/context.ts
var currentPlatform = null;
function getPlatform() {
  if (!currentPlatform) throw new Error("Plataforma n\xE3o definida.");
  return currentPlatform;
}

// src/platforms/vtex/getProductData.ts
import_dotenv.default.config();
function getProductData(storeName, slug) {
  return __async(this, null, function* () {
    var _a, _b;
    const platformName = getPlatform();
    if (!platforms[platformName]) {
      console.error(`\u274C Plataforma "${platformName}" n\xE3o suportada.`);
      return null;
    }
    const storeNameContent = storeName || process.env.VTEX_ACCOUNT_NAME;
    const slugContent = slug || process.env.VTEX_LOCAL_SLUG;
    const finalUrl = `https://www.${storeNameContent}.com.br/api/catalog_system/pub/products/search/${slugContent}/p`;
    console.log("\u{1F50D} Full URL", finalUrl);
    try {
      const response = yield import_axios.default.get(finalUrl, {
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        }
      });
      if (!response.data || response.data.length === 0) {
        console.error(`\u274C Produto n\xE3o encontrado para a loja: ${storeNameContent}, slug: ${slugContent}`);
        return null;
      }
      return (_a = response.data) == null ? void 0 : _a[0];
    } catch (error) {
      console.error(
        `Erro ao buscar informa\xE7\xF5es do produto para a loja: ${storeNameContent}, slug: ${slugContent}`,
        ((_b = error.response) == null ? void 0 : _b.data) || error.message
      );
      return null;
    }
  });
}

// src/platforms/vtex/splitProductData.ts
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

// src/platforms/vtex/index.ts
var vtexPlatform = {
  getProductData,
  splitProductData
};
var vtex_default = vtexPlatform;

// src/platforms/index.ts
var platforms = {
  vtex: vtex_default
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  platforms
});
