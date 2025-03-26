import { getProductData, getAllRecommendations } from './getProductData';
import { splitProductData } from './splitProductData';
import { addToCart } from './addToCart';

const vtexPlatform = {
    getProductData,
    getAllRecommendations,
    splitProductData,
    addToCart,
};

export default vtexPlatform;
