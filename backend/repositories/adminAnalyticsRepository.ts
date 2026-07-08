import { query } from '../config/db';

export class AdminAnalyticsRepository {
  static async getPlatformAnalytics(): Promise<any> {
    // 1. Core counters
    const buildersCountRes = await query('SELECT COUNT(*) FROM builders');
    const contractorsCountRes = await query('SELECT COUNT(*) FROM contractors');
    const projectsCountRes = await query('SELECT COUNT(*) FROM projects');
    const packagesCountRes = await query('SELECT COUNT(*) FROM project_packages');
    const quotationsCountRes = await query('SELECT COUNT(*) FROM quotations');

    // 2. Builders Verification status splits
    const builderVerifRes = await query(
      'SELECT verification_status as status, COUNT(*) as count FROM builders GROUP BY verification_status'
    );

    // 3. Contractors Verification status splits
    const contractorVerifRes = await query(
      'SELECT verification_status as status, COUNT(*) as count FROM contractors GROUP BY verification_status'
    );

    // 4. Quotations Status splits
    const quotationStatusRes = await query(
      'SELECT status, COUNT(*) as count FROM quotations GROUP BY status'
    );

    // 5. Packages Status splits
    const packageStatusRes = await query(
      'SELECT status, COUNT(*) as count FROM project_packages GROUP BY status'
    );

    // Map rows to key-value states
    const mapCountRows = (rows: any[]) => {
      const result: { [key: string]: number } = {};
      rows.forEach(r => {
        result[r.status] = parseInt(r.count, 10);
      });
      return result;
    };

    return {
      totals: {
        builders: parseInt(buildersCountRes.rows[0].count, 10),
        contractors: parseInt(contractorsCountRes.rows[0].count, 10),
        projects: parseInt(projectsCountRes.rows[0].count, 10),
        packages: parseInt(packagesCountRes.rows[0].count, 10),
        quotations: parseInt(quotationsCountRes.rows[0].count, 10)
      },
      verifications: {
        builders: mapCountRows(builderVerifRes.rows),
        contractors: mapCountRows(contractorVerifRes.rows)
      },
      quotations: mapCountRows(quotationStatusRes.rows),
      packages: mapCountRows(packageStatusRes.rows)
    };
  }
}
export default AdminAnalyticsRepository;
