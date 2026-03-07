import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config({ path: './config/.env' });

/**
 * Generate PayHere MD5 Hash
 * @param {string} merchantId 
 * @param {string} orderId 
 * @param {number} amount 
 * @param {string} currency 
 * @param {string} merchantSecret 
 * @returns {string} Upper case MD5 hash
 */
export const generateHash = (merchantId, orderId, amount, currency, merchantSecret) => {
    // Format: merchant_id + order_id + amount (formatted to 2 decimal places) + currency + UPPERCASE(MD5(merchant_secret))

    // First, convert merchant secret to MD5 and uppercase it
    const secretHash = crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase();

    // Format amount to 2 decimal places
    const formattedAmount = Number(amount).toLocaleString('en-us', { minimumFractionDigits: 2, useGrouping: false });

    // Concatenate all strings
    const rawString = merchantId + orderId + formattedAmount + currency + secretHash;

    // Generating MD5 hash of the final string and converting to uppercase
    return crypto.createHash('md5').update(rawString).digest('hex').toUpperCase();
};

/**
 * Verify PayHere Notify Hash
 * @param {Object} body 
 * @param {string} merchantSecret 
 * @returns {boolean}
 */
export const verifyNotifyHash = (body, merchantSecret) => {
    const { merchant_id, order_id, payhere_amount, payhere_currency, status_code, md5sig } = body;

    // Format: merchant_id + order_id + payhere_amount + payhere_currency + status_code + UPPERCASE(MD5(merchant_secret))
    const secretHash = crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase();

    const rawString = merchant_id + order_id + payhere_amount + payhere_currency + status_code + secretHash;
    const expectedHash = crypto.createHash('md5').update(rawString).digest('hex').toUpperCase();

    return expectedHash === md5sig;
};
