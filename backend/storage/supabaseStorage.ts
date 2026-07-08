import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY; // Service role key preferred for write permissions

let supabase: any = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('[Storage] Supabase client initialized for secure storage uploads.');
} else {
  console.warn('[Storage] Supabase credentials missing. Local filesystem fallback active.');
}

const LOCAL_UPLOAD_DIR = path.join(__dirname, 'uploads');

export class StorageService {
  /**
   * Uploads a file (Buffer) to storage
   * @param fileBuffer File contents buffer
   * @param fileName Original file name
   * @param folder Destination folder/bucket subdirectory
   * @returns Public file access URL
   */
  static async uploadFile(fileBuffer: Buffer, fileName: string, folder: string): Promise<string> {
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

        if (error) throw error;

        // Retrieve public URL
        const { data: publicUrlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath);

        return publicUrlData.publicUrl;
      } catch (err) {
        console.error('[Storage Error] Failed to upload to Supabase, attempting local fallback:', err);
      }
    }

    // Local Fallback Storage
    try {
      const destinationFolder = path.join(LOCAL_UPLOAD_DIR, folder);
      if (!fs.existsSync(destinationFolder)) {
        fs.mkdirSync(destinationFolder, { recursive: true });
      }

      const localFilePath = path.join(destinationFolder, cleanFileName);
      fs.writeFileSync(localFilePath, fileBuffer);

      console.log(`[Storage] Saved file locally: ${localFilePath}`);
      // Return a relative path served statically by Express server
      return `/storage/uploads/${folder}/${cleanFileName}`;
    } catch (localErr) {
      console.error('[Storage Error] Local write fallback failed:', localErr);
      throw new Error('Failed to save document to storage.');
    }
  }

  /**
   * Get file mime type
   */
  private static getContentType(fileName: string): string {
    const ext = path.extname(fileName).toLowerCase();
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
export default StorageService;
