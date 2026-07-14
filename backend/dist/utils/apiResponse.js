"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApiResponse = void 0;
/**
 * Standard API Response Generator
 * @param success Whether the operation was successful
 * @param message User-friendly status message
 * @param data Response data payload
 * @param errors Error details, if any
 */
const createApiResponse = (success, message, data = {}, errors = null) => {
    return {
        success,
        message,
        data,
        errors,
        timestamp: new Date().toISOString(),
    };
};
exports.createApiResponse = createApiResponse;
