"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY; // Service role key preferred for write permissions
let supabase = null;
if (supabaseUrl && supabaseKey) {
    supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
    console.log('[Storage] Supabase client initialized for secure storage uploads.');
}
else {
    console.warn('[Storage] Supabase credentials missing. Local filesystem fallback active.');
}
const LOCAL_UPLOAD_DIR = path_1.default.join(__dirname, 'uploads');
class StorageService {
    /**
     * Uploads a file (Buffer) to storage
     * @param fileBuffer File contents buffer
     * @param fileName Original file name
     * @param folder Destination folder/bucket subdirectory
     * @returns Public file access URL
     */
    static async uploadFile(fileBuffer, fileName, folder) {
        const cleanFileName = `${Date.now()}-${fileName.replace(/\s+/g, '_')}`;
        const filePath = `${folder}/${cleanFileName}`;
        if (supabase) {
            try {
                const bucketName = 'documents';
                const { data: _data, error } = await supabase.storage
                    .from(bucketName)
                    .upload(filePath, fileBuffer, {
                    contentType: this.getContentType(fileName),
                    upsert: true,
                });
                if (error)
                    throw error;
                // Retrieve public URL
                const { data: publicUrlData } = supabase.storage
                    .from(bucketName)
                    .getPublicUrl(filePath);
                return publicUrlData.publicUrl;
            }
            catch (err) {
                console.error('[Storage Error] Failed to upload to Supabase, attempting local fallback:', err);
            }
        }
        // Local Fallback Storage
        try {
            const destinationFolder = path_1.default.join(LOCAL_UPLOAD_DIR, folder);
            if (!fs_1.default.existsSync(destinationFolder)) {
                fs_1.default.mkdirSync(destinationFolder, { recursive: true });
            }
            const localFilePath = path_1.default.join(destinationFolder, cleanFileName);
            fs_1.default.writeFileSync(localFilePath, fileBuffer);
            console.log(`[Storage] Saved file locally: ${localFilePath}`);
            // Return a relative path served statically by Express server
            return `/storage/uploads/${folder}/${cleanFileName}`;
        }
        catch (localErr) {
            console.error('[Storage Error] Local write fallback failed:', localErr);
            throw new Error('Failed to save document to storage.');
        }
    }
    /**
     * Get file mime type
     */
    static getContentType(fileName) {
        const ext = path_1.default.extname(fileName).toLowerCase();
        switch (ext) {
            case '.pdf':
                return 'application/pdf';
            case '.png':
                return 'image/png';
            case '.jpg':
            case '.jpeg':
                return 'image/jpeg';
            case '.doc':
                return 'application/msword';
            case '.docx':
                return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            default:
                return 'application/octet-stream';
        }
    }
}
exports.StorageService = StorageService;
exports.default = StorageService;
