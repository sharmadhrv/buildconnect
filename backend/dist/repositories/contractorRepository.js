"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractorRepository = void 0;
const db_1 = require("../config/db");
const profileScoringService_1 = require("../services/profileScoringService");
class ContractorRepository {
    // Get contractor profile joined with user account
    static async getProfile(contractorId) {
        const contractorRes = await (0, db_1.query)(`SELECT c.*, u.email, u.is_email_verified 
       FROM contractors c
       JOIN users u ON c.id = u.id
       WHERE c.id = $1 LIMIT 1`, [contractorId]);
        const contractor = contractorRes.rows[0];
        if (!contractor)
            return null;
        // Fetch skills
        const skillsRes = await (0, db_1.query)(`SELECT s.id, s.name 
       FROM contractor_skills cs
       JOIN skills s ON cs.skill_id = s.id
       WHERE cs.contractor_id = $1`, [contractorId]);
        // Fetch categories
        const categoriesRes = await (0, db_1.query)(`SELECT cat.id, cat.name 
       FROM contractor_categories cc
       JOIN categories cat ON cc.category_id = cat.id
       WHERE cc.contractor_id = $1`, [contractorId]);
        return {
            ...contractor,
            skills: skillsRes.rows,
            categories: categoriesRes.rows
        };
    }
    // Update contractor profile and recalculate scores
    static async updateProfile(contractorId, profileData) {
        const current = await this.getProfile(contractorId);
        if (!current)
            throw new Error('Contractor profile not found.');
        const merged = { ...current, ...profileData };
        // Get current documents to check for licenses and insurance
        const docsRes = await (0, db_1.query)("SELECT file_name FROM documents WHERE entity_type = 'contractor' AND entity_id = $1", [contractorId]);
        const docNames = docsRes.rows.map(d => d.file_name.toLowerCase());
        const hasLicense = docNames.some(name => name.includes('license'));
        const hasInsurance = docNames.some(name => name.includes('insurance'));
        const scoreInput = { ...merged, has_license: hasLicense, has_insurance: hasInsurance };
        const trustScore = profileScoringService_1.ProfileScoringService.calculateContractorTrustScore(scoreInput);
        const aiScore = profileScoringService_1.ProfileScoringService.calculateContractorAiScore(merged, current.skills?.length || 0, current.categories?.length || 0);
        const result = await (0, db_1.query)(`UPDATE contractors 
       SET business_name = $1,
           website = $2,
           address = $3,
           preferences = $4,
           trust_score = $5,
           ai_profile_score = $6,
           updated_at = NOW()
       WHERE id = $7
       RETURNING *`, [
            merged.business_name,
            merged.website,
            merged.address,
            JSON.stringify(merged.preferences),
            trustScore,
            aiScore,
            contractorId
        ]);
        return result.rows[0];
    }
    // Synchronize contractor skills list (transactional)
    static async updateSkills(contractorId, skillIds) {
        await (0, db_1.query)('BEGIN');
        try {
            // 1. Delete current associations
            await (0, db_1.query)('DELETE FROM contractor_skills WHERE contractor_id = $1', [contractorId]);
            // 2. Insert new associations
            for (const skillId of skillIds) {
                await (0, db_1.query)('INSERT INTO contractor_skills (contractor_id, skill_id) VALUES ($1, $2)', [contractorId, skillId]);
            }
            // 3. Recalculate AI score
            const current = await (0, db_1.query)('SELECT * FROM contractors WHERE id = $1', [contractorId]);
            const contractor = current.rows[0];
            const categoriesRes = await (0, db_1.query)('SELECT COUNT(*) FROM contractor_categories WHERE contractor_id = $1', [contractorId]);
            const categoriesCount = parseInt(categoriesRes.rows[0].count, 10);
            const aiScore = profileScoringService_1.ProfileScoringService.calculateContractorAiScore(contractor, skillIds.length, categoriesCount);
            await (0, db_1.query)('UPDATE contractors SET ai_profile_score = $1, updated_at = NOW() WHERE id = $2', [aiScore, contractorId]);
            await (0, db_1.query)('COMMIT');
            return this.getProfile(contractorId);
        }
        catch (error) {
            await (0, db_1.query)('ROLLBACK');
            throw error;
        }
    }
    // Synchronize contractor categories list (transactional)
    static async updateCategories(contractorId, categoryIds) {
        await (0, db_1.query)('BEGIN');
        try {
            // 1. Delete current associations
            await (0, db_1.query)('DELETE FROM contractor_categories WHERE contractor_id = $1', [contractorId]);
            // 2. Insert new associations
            for (const catId of categoryIds) {
                await (0, db_1.query)('INSERT INTO contractor_categories (contractor_id, category_id) VALUES ($1, $2)', [contractorId, catId]);
            }
            // 3. Recalculate AI score
            const current = await (0, db_1.query)('SELECT * FROM contractors WHERE id = $1', [contractorId]);
            const contractor = current.rows[0];
            const skillsRes = await (0, db_1.query)('SELECT COUNT(*) FROM contractor_skills WHERE contractor_id = $1', [contractorId]);
            const skillsCount = parseInt(skillsRes.rows[0].count, 10);
            const aiScore = profileScoringService_1.ProfileScoringService.calculateContractorAiScore(contractor, skillsCount, categoryIds.length);
            await (0, db_1.query)('UPDATE contractors SET ai_profile_score = $1, updated_at = NOW() WHERE id = $2', [aiScore, contractorId]);
            await (0, db_1.query)('COMMIT');
            return this.getProfile(contractorId);
        }
        catch (error) {
            await (0, db_1.query)('ROLLBACK');
            throw error;
        }
    }
    // Submit official identity documents (transactional)
    static async submitVerification(contractorId, verificationData) {
        await (0, db_1.query)('BEGIN');
        try {
            const currentRes = await (0, db_1.query)('SELECT * FROM contractors WHERE id = $1', [contractorId]);
            const current = currentRes.rows[0];
            if (!current)
                throw new Error('Contractor profile not found.');
            // Check document headers for License/Insurance
            const docNames = verificationData.documents.map(d => d.name.toLowerCase());
            const hasLicense = docNames.some(name => name.includes('license'));
            const hasInsurance = docNames.some(name => name.includes('insurance'));
            const merged = {
                ...current,
                pan_no: verificationData.pan_no,
                aadhaar_no: verificationData.aadhaar_no,
                business_reg_no: verificationData.business_reg_no,
                verification_status: 'pending'
            };
            const scoreInput = { ...merged, has_license: hasLicense, has_insurance: hasInsurance };
            const trustScore = profileScoringService_1.ProfileScoringService.calculateContractorTrustScore(scoreInput);
            // 1. Update Profile
            await (0, db_1.query)(`UPDATE contractors 
         SET pan_no = $1,
             aadhaar_no = $2,
             business_reg_no = $3,
             verification_status = 'pending',
             trust_score = $4,
             updated_at = NOW()
         WHERE id = $5`, [
                merged.pan_no,
                merged.aadhaar_no,
                merged.business_reg_no,
                trustScore,
                contractorId
            ]);
            // 2. Wipe old verification documents
            await (0, db_1.query)("DELETE FROM documents WHERE entity_type = 'contractor' AND entity_id = $1", [contractorId]);
            // 3. Insert new documents
            for (const doc of verificationData.documents) {
                await (0, db_1.query)(`INSERT INTO documents (entity_type, entity_id, file_name, file_url, file_type) 
           VALUES ('contractor', $1, $2, $3, $4)`, [contractorId, doc.name, doc.url, doc.type]);
            }
            await (0, db_1.query)('COMMIT');
            return this.getProfile(contractorId);
        }
        catch (error) {
            await (0, db_1.query)('ROLLBACK');
            throw error;
        }
    }
    // Get Analytics Dashboard values
    static async getDashboardAnalytics(contractorId) {
        // 1. Total applications (quotations) submitted
        const appsCountRes = await (0, db_1.query)('SELECT COUNT(*) FROM quotations WHERE contractor_id = $1', [contractorId]);
        const totalApplications = parseInt(appsCountRes.rows[0].count, 10);
        // 2. Total projects won (accepted bids)
        const wonCountRes = await (0, db_1.query)("SELECT COUNT(*) FROM quotations WHERE contractor_id = $1 AND status = 'accepted'", [contractorId]);
        const totalWon = parseInt(wonCountRes.rows[0].count, 10);
        // 3. Active won packages (status = 'awarded' in packages)
        const activeCountRes = await (0, db_1.query)(`SELECT COUNT(q.*) 
       FROM quotations q
       JOIN project_packages pp ON q.package_id = pp.id
       WHERE q.contractor_id = $1 AND q.status = 'accepted' AND pp.status = 'awarded'`, [contractorId]);
        const activeProjects = parseInt(activeCountRes.rows[0].count, 10);
        // 4. Completed won packages (status = 'completed' in packages)
        const completedCountRes = await (0, db_1.query)(`SELECT COUNT(q.*) 
       FROM quotations q
       JOIN project_packages pp ON q.package_id = pp.id
       WHERE q.contractor_id = $1 AND q.status = 'accepted' AND pp.status = 'completed'`, [contractorId]);
        const completedProjects = parseInt(completedCountRes.rows[0].count, 10);
        // 5. Success rate Win/Total applications
        const successRate = totalApplications > 0 ? (totalWon / totalApplications) * 100 : 0;
        const profile = await this.getProfile(contractorId);
        return {
            totalApplications,
            totalWon,
            activeProjects,
            completedProjects,
            successRate,
            trustScore: profile?.trust_score || 0.00,
            aiProfileScore: profile?.ai_profile_score || 0.00,
            verificationStatus: profile?.verification_status || 'pending'
        };
    }
    // Get submitted applications logs
    static async getApplicationsHistory(contractorId) {
        const result = await (0, db_1.query)(`SELECT q.id as quotation_id,
              q.proposed_budget,
              q.proposed_timeline_start,
              q.proposed_timeline_end,
              q.proposal_notes,
              q.status as quotation_status,
              q.created_at as applied_at,
              q.breakdown,
              pp.name as package_name,
              pp.budget as package_budget,
              p.name as project_name,
              p.location as project_location,
              b.company_name as builder_name
       FROM quotations q
       JOIN project_packages pp ON q.package_id = pp.id
       JOIN projects p ON pp.project_id = p.id
       JOIN builders b ON p.builder_id = b.id
       WHERE q.contractor_id = $1
       ORDER BY q.created_at DESC`, [contractorId]);
        return result.rows;
    }
    // Get awarded projects details (active/completed)
    static async getAwardedProjects(contractorId) {
        const result = await (0, db_1.query)(`SELECT pp.id as package_id,
              pp.name as package_name,
              pp.description as package_desc,
              pp.budget as package_budget,
              pp.scope as package_scope,
              pp.status as package_status,
              pp.timeline_start as package_start,
              pp.timeline_end as package_end,
              p.name as project_name,
              p.location as project_location,
              b.company_name as builder_name,
              u.email as builder_email
       FROM quotations q
       JOIN project_packages pp ON q.package_id = pp.id
       JOIN projects p ON pp.project_id = p.id
       JOIN builders b ON p.builder_id = b.id
       JOIN users u ON b.id = u.id
       WHERE q.contractor_id = $1 AND q.status = 'accepted'
       ORDER BY pp.updated_at DESC`, [contractorId]);
        return result.rows;
    }
    // Get reviews and star ratings received from builders
    static async getReviews(contractorId) {
        const result = await (0, db_1.query)(`SELECT r.id as review_id,
              r.rating,
              r.feedback,
              r.ratings_breakdown,
              r.created_at,
              p.name as project_name,
              b.company_name as builder_name
       FROM reviews r
       JOIN projects p ON r.project_id = p.id
       JOIN builders b ON p.builder_id = b.id
       WHERE r.reviewee_id = $1
       ORDER BY r.created_at DESC`, [contractorId]);
        return result.rows;
    }
}
exports.ContractorRepository = ContractorRepository;
exports.default = ContractorRepository;
