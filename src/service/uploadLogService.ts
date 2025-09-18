// Upload Log Types based on the API response structure
export interface UploadLogProduct {
  productId: string;
  sku: string;
  productName: string;
  manufacturerPartName: string;
  status: string;
  qcStatus: string;
  images: number;
  message: string;
}

export interface SuccessLogs {
  totalSuccessful: number;
  products: UploadLogProduct[];
}

export interface FailureLogs {
  totalFailed: number;
  products: UploadLogProduct[];
}

export interface ImageSummary {
  total: number;
  ok: number;
  skip: number;
  fail: number;
}

export interface UploadLogData {
  totalRows: number;
  inserted: number;
  imgSummary: ImageSummary;
  errors: string[];
  sessionId: string;
  durationSec: string;
  requiresApproval: boolean;
  status: string;
  message: string;
  successLogs: SuccessLogs;
  failureLogs: FailureLogs;
}

export interface UploadLogResponse {
  success: boolean;
  message: string;
  data: UploadLogData;
}

export interface StoredUploadLog {
  id: string;
  sessionId: string;
  timestamp: string;
  uploadType: 'bulk_upload' | 'bulk_edit' | 'dealer_upload';
  status: 'completed' | 'failed' | 'processing';
  createdBy: string;
  logData: UploadLogData;
  createdAt: string;
  updatedAt: string;
}

// Local storage functions for upload logs
export const uploadLogStorage = {
  // Store upload log data locally
  setLog: (logId: string, logData: StoredUploadLog) => {
    try {
      const logs = uploadLogStorage.getLogs();
      logs[logId] = logData;
      localStorage.setItem('uploadLogs', JSON.stringify(logs));
    } catch (error) {
      console.error("Failed to store upload log locally:", error);
    }
  },

  // Get upload log data locally
  getLog: (logId: string): StoredUploadLog | null => {
    try {
      const logs = uploadLogStorage.getLogs();
      return logs[logId] || null;
    } catch (error) {
      console.error("Failed to get upload log locally:", error);
      return null;
    }
  },

  // Get all upload logs locally
  getLogs: (): Record<string, StoredUploadLog> => {
    try {
      const logs = localStorage.getItem('uploadLogs');
      return logs ? JSON.parse(logs) : {};
    } catch (error) {
      console.error("Failed to get upload logs locally:", error);
      return {};
    }
  },

  // Get all logs as array sorted by timestamp
  getAllLogsArray: (): StoredUploadLog[] => {
    try {
      const logs = uploadLogStorage.getLogs();
      return Object.values(logs).sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error) {
      console.error("Failed to get upload logs array:", error);
      return [];
    }
  },

  // Update upload log data locally
  updateLog: (logId: string, updates: Partial<StoredUploadLog>) => {
    try {
      const logs = uploadLogStorage.getLogs();
      if (logs[logId]) {
        logs[logId] = { ...logs[logId], ...updates, updatedAt: new Date().toISOString() };
        localStorage.setItem('uploadLogs', JSON.stringify(logs));
      }
    } catch (error) {
      console.error("Failed to update upload log locally:", error);
    }
  },

  // Remove upload log data locally
  removeLog: (logId: string) => {
    try {
      const logs = uploadLogStorage.getLogs();
      delete logs[logId];
      localStorage.setItem('uploadLogs', JSON.stringify(logs));
    } catch (error) {
      console.error("Failed to remove upload log locally:", error);
    }
  },

  // Clear all upload logs
  clearAllLogs: () => {
    try {
      localStorage.removeItem('uploadLogs');
    } catch (error) {
      console.error("Failed to clear upload logs:", error);
    }
  }
};

// Helper function to create a stored upload log from API response
export function createStoredUploadLog(
  apiResponse: UploadLogResponse,
  uploadType: 'bulk_upload' | 'bulk_edit' | 'dealer_upload',
  createdBy: string
): StoredUploadLog {
  const logId = `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();

  return {
    id: logId,
    sessionId: apiResponse.data.sessionId,
    timestamp: now,
    uploadType,
    status: apiResponse.success ? 'completed' : 'failed',
    createdBy,
    logData: apiResponse.data,
    createdAt: now,
    updatedAt: now
  };
}
