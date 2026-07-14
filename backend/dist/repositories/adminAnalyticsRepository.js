"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminAnalyticsRepository = void 0;
const db_1 = require("../config/db");
class AdminAnalyticsRepository {
    static async getPlatformAnalytics() {
        // 1. Core counters
        const buildersCountRes = await (0, db_1.query)('SELECT COUNT(*) FROM builders');
        const contractorsCountRes = await (0, db_1.query)('SELECT COUNT(*) FROM contractors');
        const projectsCountRes = await (0, db_1.query)('SELECT COUNT(*) FROM projects');
        const packagesCountRes = await (0, db_1.query)('SELECT COUNT(*) FROM project_packages');
        const quotationsCountRes = await (0, db_1.query)('SELECT COUNT(*) FROM quotations');
        // 2. Builders Verification status splits
        const builderVerifRes = await (0, db_1.query)('SELECT verification_status as status, COUNT(*) as count FROM builders GROUP BY verification_status');
        // 3. Contractors Verification status splits
        const contractorVerifRes = await (0, db_1.query)('SELECT verification_status as status, COUNT(*) as count FROM contractors GROUP BY verification_status');
        // 4. Quotations Status splits
        const quotationStatusRes = await (0, db_1.query)('SELECT status, COUNT(*) as count FROM quotations GROUP BY status');
        // 5. Packages Status splits
        const packageStatusRes = await (0, db_1.query)('SELECT status, COUNT(*) as count FROM project_packages GROUP BY status');
        // Map rows to key-value states
        const mapCountRows = (rows) => {
            const result = {};
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
exports.AdminAnalyticsRepository = AdminAnalyticsRepository;
exports.default = AdminAnalyticsRepository;
