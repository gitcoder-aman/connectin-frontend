import axios from 'axios';

const UPLOADER_BASE_URL =
  import.meta.env.VITE_UPLOADER_BASE_URL ?? (import.meta.env.DEV ? '' : 'https://34.95.113.61.sslip.io');

/**
 * Direct file uploader for testing standalone uploader-service
 */
export const uploaderApi = {
  async uploadDirect(file: File, onProgress?: (percent: number) => void): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post<string>(`${UPLOADER_BASE_URL}/upload/file`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    });

    return typeof response.data === 'string' ? response.data.trim() : String(response.data);
  },
};
