"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileScoringService = void 0;
class ProfileScoringService {
    /**
     * Calculates a Builder's Trust Score (0 - 100)
     */
    static calculateBuilderTrustScore(builder) {
        let score = 0;
        if (builder.verification_status === 'approved') {
            score += 50;
        }
        else if (builder.verification_status === 'pending') {
            score += 20;
        }
        if (builder.gst_no && builder.gst_no.trim().length > 0) {
            score += 15;
        }
        if (builder.pan_no && builder.pan_no.trim().length > 0) {
            score += 15;
        }
        if (builder.company_reg_no && builder.company_reg_no.trim().length > 0) {
            score += 10;
        }
        if (builder.address && builder.address.trim().length > 0) {
            score += 5;
        }
        if (builder.website && builder.website.trim().length > 0) {
            score += 5;
        }
        return Math.min(score, 100);
    }
    /**
     * Calculates a Builder's AI-Assisted Compatibility / Completeness Score
     */
    static calculateBuilderAiScore(builder) {
        let score = 50;
        if (builder.company_name && builder.company_name.length > 5) {
            score += 10;
        }
        if (builder.logo_url) {
            score += 10;
        }
        if (builder.website) {
            score += 10;
        }
        if (builder.address && builder.address.length > 20) {
            score += 10;
        }
        if (builder.company_reg_no) {
            score += 10;
        }
        return Math.min(score, 100);
    }
    /**
     * Calculates a Contractor's Trust Score (0 - 100)
     * @param contractor Contractor profile record
     * @returns trust score percentage
     */
    static calculateContractorTrustScore(contractor) {
        let score = 0;
        // 1. Verification status (Max 40 points)
        if (contractor.verification_status === 'approved') {
            score += 40;
        }
        else if (contractor.verification_status === 'pending') {
            score += 15;
        }
        // 2. Identity Verification (Max 30 points)
        if (contractor.aadhaar_no && contractor.aadhaar_no.trim().length === 12) {
            score += 15;
        }
        if (contractor.pan_no && contractor.pan_no.trim().length === 10) {
            score += 15;
        }
        // 3. Licensing / Insurance (Max 30 points)
        if (contractor.business_reg_no && contractor.business_reg_no.trim().length > 0) {
            score += 10;
        }
        // Trust score is updated by presence of license/insurance uploads
        if (contractor.has_license) {
            score += 10;
        }
        if (contractor.has_insurance) {
            score += 10;
        }
        return Math.min(score, 100);
    }
    /**
     * Calculates a Contractor's AI-Assisted Compatibility / Completeness Score
     */
    static calculateContractorAiScore(contractor, skillsCount = 0, categoriesCount = 0) {
        let score = 40;
        if (contractor.business_name && contractor.business_name.length > 5) {
            score += 10;
        }
        if (contractor.address && contractor.address.length > 20) {
            score += 10;
        }
        if (contractor.website) {
            score += 5;
        }
        if (skillsCount > 0) {
            score += 15;
        }
        if (categoriesCount > 0) {
            score += 10;
        }
        if (contractor.preferences) {
            score += 10;
        }
        return Math.min(score, 100);
    }
}
exports.ProfileScoringService = ProfileScoringService;
exports.default = ProfileScoringService;
