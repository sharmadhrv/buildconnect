"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectRepository = void 0;
const db_1 = require("../config/db");
class ProjectRepository {
    // Create Project and all packages atomically
    static async createProject(builderId, project, packages) {
        await (0, db_1.query)('BEGIN');
        try {
            // 1. Insert Project
            const projectResult = await (0, db_1.query)(`INSERT INTO projects (builder_id, name, description, budget, timeline_start, timeline_end, property_type, location, status) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
         RETURNING *`, [
                builderId,
                project.name,
                project.description,
                project.budget,
                project.timeline_start || null,
                project.timeline_end || null,
                project.property_type || null,
                project.location,
                project.status
            ]);
            const newProject = projectResult.rows[0];
            // 2. Insert Packages and map skills
            const insertedPackages = [];
            for (const pkg of packages) {
                const pkgResult = await (0, db_1.query)(`INSERT INTO project_packages (project_id, name, description, budget, timeline_start, timeline_end, scope, required_experience) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
           RETURNING *`, [
                    newProject.id,
                    pkg.name,
                    pkg.description,
                    pkg.budget,
                    pkg.timeline_start || null,
                    pkg.timeline_end || null,
                    pkg.scope,
                    pkg.required_experience || null
                ]);
                const newPkg = pkgResult.rows[0];
                // Map skills to packages (if skill UUIDs are provided)
                if (pkg.skills && pkg.skills.length > 0) {
                    for (const skillId of pkg.skills) {
                        // Inserts into package_skills junction
                        await (0, db_1.query)(`INSERT INTO package_skills (package_id, skill_id) 
               VALUES ($1, $2) ON CONFLICT DO NOTHING`, [newPkg.id, skillId]);
                    }
                }
                insertedPackages.push({ ...newPkg, skills: pkg.skills || [] });
            }
            await (0, db_1.query)('COMMIT');
            return { ...newProject, packages: insertedPackages };
        }
        catch (error) {
            await (0, db_1.query)('ROLLBACK');
            throw error;
        }
    }
    // Get Projects Posted by a Builder (along with package count)
    static async getBuilderProjects(builderId) {
        const result = await (0, db_1.query)(`SELECT p.*, 
              COUNT(pp.id) as package_count,
              COALESCE(SUM(pp.budget), 0) as calculated_budget
       FROM projects p
       LEFT JOIN project_packages pp ON p.id = pp.project_id
       WHERE p.builder_id = $1
       GROUP BY p.id
       ORDER BY p.created_at DESC`, [builderId]);
        return result.rows;
    }
    // Get Project Details along with Packages and their skills
    static async getProjectDetails(projectId) {
        const projectRes = await (0, db_1.query)(`SELECT p.*, b.company_name as builder_name, b.trust_score as builder_trust_score 
       FROM projects p
       JOIN builders b ON p.builder_id = b.id
       WHERE p.id = $1 LIMIT 1`, [projectId]);
        const project = projectRes.rows[0];
        if (!project)
            return null;
        // Fetch Packages for this project
        const packagesRes = await (0, db_1.query)(`SELECT pp.*, 
              ARRAY_TO_JSON(ARRAY_REMOVE(ARRAY_AGG(s.name), NULL)) as skills,
              ARRAY_TO_JSON(ARRAY_REMOVE(ARRAY_AGG(s.id), NULL)) as skill_ids
       FROM project_packages pp
       LEFT JOIN package_skills ps ON pp.id = ps.package_id
       LEFT JOIN skills s ON ps.skill_id = s.id
       WHERE pp.project_id = $1
       GROUP BY pp.id
       ORDER BY pp.created_at ASC`, [projectId]);
        project.packages = packagesRes.rows;
        return project;
    }
    // Update Project Details
    static async updateProject(projectId, project) {
        const fields = [];
        const values = [];
        let idx = 1;
        Object.entries(project).forEach(([key, val]) => {
            fields.push(`${key} = $${idx}`);
            values.push(val);
            idx++;
        });
        if (fields.length === 0)
            return null;
        values.push(projectId);
        const result = await (0, db_1.query)(`UPDATE projects 
       SET ${fields.join(', ')}, updated_at = NOW() 
       WHERE id = $${idx} 
       RETURNING *`, values);
        return result.rows[0];
    }
    // Archive or Publish a Project
    static async updateProjectStatus(projectId, status) {
        const result = await (0, db_1.query)(`UPDATE projects 
       SET status = $1, updated_at = NOW() 
       WHERE id = $2 
       RETURNING *`, [status, projectId]);
        return result.rows[0];
    }
}
exports.ProjectRepository = ProjectRepository;
exports.default = ProjectRepository;
