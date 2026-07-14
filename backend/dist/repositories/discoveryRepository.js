"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscoveryRepository = void 0;
const db_1 = require("../config/db");
class DiscoveryRepository {
    // Get all open projects and their packages based on filters
    static async getOpenProjects(filters, page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        const values = [];
        let idx = 1;
        let projectQuery = `
      SELECT p.*, b.company_name as builder_name, b.trust_score as builder_trust_score
      FROM projects p
      JOIN builders b ON p.builder_id = b.id
      WHERE p.status = 'published'
    `;
        // Search filter
        if (filters.search) {
            projectQuery += ` AND (p.name ILIKE $${idx} OR p.description ILIKE $${idx} OR p.location ILIKE $${idx})`;
            values.push(`%${filters.search}%`);
            idx++;
        }
        // Location filter
        if (filters.location) {
            projectQuery += ` AND p.location ILIKE $${idx}`;
            values.push(`%${filters.location}%`);
            idx++;
        }
        // Property Type filter
        if (filters.propertyType) {
            projectQuery += ` AND p.property_type = $${idx}`;
            values.push(filters.propertyType);
            idx++;
        }
        // Budget range filters
        if (filters.minBudget) {
            projectQuery += ` AND p.budget >= $${idx}`;
            values.push(filters.minBudget);
            idx++;
        }
        if (filters.maxBudget) {
            projectQuery += ` AND p.budget <= $${idx}`;
            values.push(filters.maxBudget);
            idx++;
        }
        projectQuery += ` ORDER BY p.created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`;
        values.push(limit, offset);
        const projectResult = await (0, db_1.query)(projectQuery, values);
        const projects = projectResult.rows;
        // For each project, fetch its open packages
        for (const project of projects) {
            let packageQuery = `
        SELECT pp.*, 
               ARRAY_TO_JSON(ARRAY_REMOVE(ARRAY_AGG(s.name), NULL)) as skills,
               ARRAY_TO_JSON(ARRAY_REMOVE(ARRAY_AGG(s.id), NULL)) as skill_ids
        FROM project_packages pp
        LEFT JOIN package_skills ps ON pp.id = ps.package_id
        LEFT JOIN skills s ON ps.skill_id = s.id
        WHERE pp.project_id = $1 AND pp.status = 'open'
      `;
            const pkgValues = [project.id];
            // Skill-match filter
            if (filters.matchingContractorId) {
                packageQuery += `
          AND pp.id IN (
            SELECT package_id FROM package_skills WHERE skill_id IN (
              SELECT skill_id FROM contractor_skills WHERE contractor_id = $2
            )
          )
        `;
                pkgValues.push(filters.matchingContractorId);
            }
            packageQuery += `
        GROUP BY pp.id
        ORDER BY pp.created_at ASC
      `;
            const pkgResult = await (0, db_1.query)(packageQuery, pkgValues);
            project.packages = pkgResult.rows;
        }
        // Return projects that have active open packages matching criteria
        return projects.filter(p => p.packages.length > 0);
    }
    // GetRecommended open packages that match contractor's skills
    static async getMatchingPackages(contractorId) {
        const result = await (0, db_1.query)(`SELECT pp.*, 
              p.name as project_name, 
              p.location as project_location, 
              b.company_name as builder_name,
              b.trust_score as builder_trust_score,
              ARRAY_TO_JSON(ARRAY_REMOVE(ARRAY_AGG(s.name), NULL)) as skills
       FROM project_packages pp
       JOIN projects p ON pp.project_id = p.id
       JOIN builders b ON p.builder_id = b.id
       LEFT JOIN package_skills ps ON pp.id = ps.package_id
       LEFT JOIN skills s ON ps.skill_id = s.id
       WHERE pp.status = 'open' 
         AND p.status = 'published'
         AND pp.id IN (
           SELECT package_id FROM package_skills WHERE skill_id IN (
             SELECT skill_id FROM contractor_skills WHERE contractor_id = $1
           )
         )
       GROUP BY pp.id, p.id, b.id
       ORDER BY pp.created_at DESC`, [contractorId]);
        return result.rows;
    }
    // Get details of a specific package and its parent project
    static async getPackageDetails(packageId) {
        const result = await (0, db_1.query)(`SELECT pp.*, 
              p.name as project_name, 
              p.description as project_description,
              p.location as project_location, 
              p.property_type as project_property_type,
              b.company_name as builder_name, 
              b.trust_score as builder_trust_score,
              ARRAY_TO_JSON(ARRAY_REMOVE(ARRAY_AGG(s.name), NULL)) as skills
       FROM project_packages pp
       JOIN projects p ON pp.project_id = p.id
       JOIN builders b ON p.builder_id = b.id
       LEFT JOIN package_skills ps ON pp.id = ps.package_id
       LEFT JOIN skills s ON ps.skill_id = s.id
       WHERE pp.id = $1
       GROUP BY pp.id, p.id, b.id`, [packageId]);
        return result.rows[0] || null;
    }
    // Submit quotation bid for a package
    static async submitQuotation(contractorId, packageId, bid) {
        // 1. Verify that the package exists and is currently OPEN
        const packageRes = await (0, db_1.query)('SELECT status FROM project_packages WHERE id = $1 LIMIT 1', [packageId]);
        const pkg = packageRes.rows[0];
        if (!pkg) {
            const err = new Error('Project package not found.');
            err.statusCode = 404;
            throw err;
        }
        if (pkg.status !== 'open') {
            const err = new Error('Bidding is closed for this project package.');
            err.statusCode = 400;
            throw err;
        }
        // 2. Check if this contractor has already bid on this package
        const existingRes = await (0, db_1.query)('SELECT id FROM quotations WHERE contractor_id = $1 AND package_id = $2 LIMIT 1', [contractorId, packageId]);
        if (existingRes.rows[0]) {
            const err = new Error('You have already submitted a bid for this package.');
            err.statusCode = 409;
            throw err;
        }
        // 3. Insert quotation
        const result = await (0, db_1.query)(`INSERT INTO quotations (package_id, contractor_id, proposed_budget, proposed_timeline_start, proposed_timeline_end, proposal_notes, breakdown) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`, [
            packageId,
            contractorId,
            bid.proposed_budget,
            bid.proposed_timeline_start,
            bid.proposed_timeline_end,
            bid.proposal_notes || null,
            JSON.stringify(bid.breakdown)
        ]);
        return result.rows[0];
    }
}
exports.DiscoveryRepository = DiscoveryRepository;
exports.default = DiscoveryRepository;
