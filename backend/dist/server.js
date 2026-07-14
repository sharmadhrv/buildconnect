"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const builderRoutes_1 = __importDefault(require("./routes/builderRoutes"));
const projectRoutes_1 = __importDefault(require("./routes/projectRoutes"));
const contractorRoutes_1 = __importDefault(require("./routes/contractorRoutes"));
const masterRoutes_1 = __importDefault(require("./routes/masterRoutes"));
const discoveryRoutes_1 = __importDefault(require("./routes/discoveryRoutes"));
const negotiationRoutes_1 = __importDefault(require("./routes/negotiationRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const adminAnalyticsRoutes_1 = __importDefault(require("./routes/adminAnalyticsRoutes"));
const reviewRoutes_1 = __importDefault(require("./routes/reviewRoutes"));
const errorHandler_1 = require("./middleware/errorHandler");
const apiResponse_1 = require("./utils/apiResponse");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Security and utility middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: '*', // For development. Can be restricted in production config.
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express_1.default.json());
// Serve local upload assets statically for testing fallbacks
app.use('/storage/uploads', express_1.default.static(path_1.default.join(__dirname, 'storage/uploads')));
// Main API Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/builders', builderRoutes_1.default);
app.use('/api/projects', projectRoutes_1.default);
app.use('/api/contractors', contractorRoutes_1.default);
app.use('/api/master', masterRoutes_1.default);
app.use('/api/discovery', discoveryRoutes_1.default);
app.use('/api/negotiation', negotiationRoutes_1.default);
app.use('/api/admin', adminRoutes_1.default);
app.use('/api/admin/analytics', adminAnalyticsRoutes_1.default);
app.use('/api/reviews', reviewRoutes_1.default);
// Health check endpoint
app.get('/health', (_req, res) => {
    res.status(200).json((0, apiResponse_1.createApiResponse)(true, 'Server is running and healthy.', {
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    }));
});
// Fallback for 404 Route Not Found
app.use((req, res) => {
    res.status(404).json((0, apiResponse_1.createApiResponse)(false, `Route ${req.method} ${req.url} not found.`, {}, null));
});
// Global Error Handler Middleware
app.use(errorHandler_1.errorHandler);
// Start server
app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`  BuildConnect Backend Running on Port ${PORT}`);
    console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`===============================================`);
});
exports.default = app;
