import { query } from '../config/db';

export interface ProjectData {
  name: string;
  description: string;
  budget: number;
  timeline_start?: string;
  timeline_end?: string;
  property_type?: string;
  location: string;
  status: 'draft' | 'pending_approval' | 'published' | 'archived';
}

export interface PackageData {
  name: string;
  description: string;
  budget: number;
  timeline_start?: string;
  timeline_end?: string;
  scope: string;
  required_experience?: string;
  skills?: string[]; // Array of skill UUIDs or names
}

export class ProjectRepository {
  // Create Project and all packages atomically
  static async createProject(
    builderId: string,
    project: ProjectData,
    packages: PackageData[]
  ): Promise<any> {
    await query('BEGIN');
    try {
      // 1. Insert Project
      const projectResult = await query(
        `INSERT INTO projects (builder_id, name, description, budget, timeline_start, timeline_end, property_type, location, status) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
         RETURNING *`,
        [
          builderId,
          project.name,
          project.description,
          project.budget,
          project.timeline_start || null,
          project.timeline_end || null,
          project.property_type || null,
          project.location,
          project.status
        ]
      );
      const newProject = projectResult.rows[0];

      // 2. Insert Packages and map skills
      const insertedPackages = [];
      for (const pkg of packages) {
        const pkgResult = await query(
          `INSERT INTO project_packages (project_id, name, description, budget, timeline_start, timeline_end, scope, required_experience) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
           RETURNING *`,
          [
            newProject.id,
            pkg.name,
            pkg.description,
            pkg.budget,
            pkg.timeline_start || null,
            pkg.timeline_end || null,
            pkg.scope,
            pkg.required_experience || null
          ]
        );
        const newPkg = pkgResult.rows[0];

        // Map skills to packages (if skill UUIDs are provided)
        if (pkg.skills && pkg.skills.length > 0) {
          for (const skillId of pkg.skills) {
            // Inserts into package_skills junction
            await query(
              `INSERT INTO package_skills (package_id, skill_id) 
               VALUES ($1, $2) ON CONFLICT DO NOTHING`,
              [newPkg.id, skillId]
            );
          }
        }
        insertedPackages.push({ ...newPkg, skills: pkg.skills || [] });
      }

      await query('COMMIT');
      return { ...newProject, packages: insertedPackages };
    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
  }

  // Get Projects Posted by a Builder (along with package count)
  static async getBuilderProjects(builderId: string): Promise<any[]> {
    const result = await query(
      `SELECT p.*, 
              COUNT(pp.id) as package_count,
              COALESCE(SUM(pp.budget), 0) as calculated_budget
       FROM projects p
       LEFT JOIN project_packages pp ON p.id = pp.project_id
       WHERE p.builder_id = $1
       GROUP BY p.id
       ORDER BY p.created_at DESC`,
      [builderId]
    );
    return result.rows;
  }

  // Get Project Details along with Packages and their skills
  static async getProjectDetails(projectId: string): Promise<any | null> {
    const projectRes = await query(
      `SELECT p.*, b.company_name as builder_name, b.trust_score as builder_trust_score 
       FROM projects p
       JOIN builders b ON p.builder_id = b.id
       WHERE p.id = $1 LIMIT 1`,
      [projectId]
    );
    const project = projectRes.rows[0];
    if (!project) return null;

    // Fetch Packages for this project
    const packagesRes = await query(
      `SELECT pp.*, 
              ARRAY_TO_JSON(ARRAY_REMOVE(ARRAY_AGG(s.name), NULL)) as skills,
              ARRAY_TO_JSON(ARRAY_REMOVE(ARRAY_AGG(s.id), NULL)) as skill_ids
       FROM project_packages pp
       LEFT JOIN package_skills ps ON pp.id = ps.package_id
       LEFT JOIN skills s ON ps.skill_id = s.id
       WHERE pp.project_id = $1
       GROUP BY pp.id
       ORDER BY pp.created_at ASC`,
      [projectId]
    );

    project.packages = packagesRes.rows;
    return project;
  }

  // Update Project Details
  static async updateProject(projectId: string, project: Partial<ProjectData>): Promise<any> {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    Object.entries(project).forEach(([key, val]) => {
      fields.push(`${key} = $${idx}`);
      values.push(val);
      idx++;
    });

    if (fields.length === 0) return null;

    values.push(projectId);
    const result = await query(
      `UPDATE projects 
       SET ${fields.join(', ')}, updated_at = NOW() 
       WHERE id = $${idx} 
       RETURNING *`,
      values
    );

    return result.rows[0];
  }

  // Archive or Publish a Project
  static async updateProjectStatus(
    projectId: string,
    status: 'draft' | 'pending_approval' | 'published' | 'archived'
  ): Promise<any> {
    const result = await query(
      `UPDATE projects 
       SET status = $1, updated_at = NOW() 
       WHERE id = $2 
       RETURNING *`,
      [status, projectId]
    );
    return result.rows[0];
  }
}
export default ProjectRepository;
