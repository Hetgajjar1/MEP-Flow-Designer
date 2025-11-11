// File Upload Manager for MEP Flow Designer - Phase 2
import { storage, functions, db } from './firebase-config.js';
import { 
    ref, 
    uploadBytes, 
    uploadBytesResumable,
    getDownloadURL,
    listAll,
    deleteObject
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-storage.js';
import { 
    httpsCallable 
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-functions.js';
import { 
    doc, 
    updateDoc, 
    arrayUnion 
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';

class FileUploadManager {
    constructor() {
        this.activeUploads = new Map();
        this.processFileMetadata = httpsCallable(functions, 'processFileUpload');
    }

    /**
     * Upload a single file to Firebase Storage
     * @param {string} projectId - Project ID
     * @param {File} file - File object to upload
     * @param {Function} progressCallback - Progress callback function
     * @returns {Promise<string>} Download URL
     */
    async uploadFile(projectId, file, progressCallback = null) {
        if (!projectId || !file) {
            throw new Error('Project ID and file are required');
        }

        // Validate file type and size
        this.validateFile(file);

        try {
            const fileName = `${Date.now()}_${file.name}`;
            const storageRef = ref(storage, `projects/${projectId}/files/${fileName}`);
            
            // Use resumable upload for larger files
            const uploadTask = uploadBytesResumable(storageRef, file);
            
            // Store active upload for potential cancellation
            this.activeUploads.set(fileName, uploadTask);

            // Handle progress, error, and completion
            return new Promise((resolve, reject) => {
                uploadTask.on('state_changed',
                    // Progress
                    (snapshot) => {
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        if (progressCallback) {
                            progressCallback({
                                progress,
                                bytesTransferred: snapshot.bytesTransferred,
                                totalBytes: snapshot.totalBytes,
                                fileName: file.name
                            });
                        }
                    },
                    // Error
                    (error) => {
                        this.activeUploads.delete(fileName);
                        console.error('Upload error:', error);
                        reject(new Error(`Upload failed: ${error.message}`));
                    },
                    // Complete
                    async () => {
                        this.activeUploads.delete(fileName);
                        try {
                            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                            
                            // Process file metadata via Cloud Function
                            await this.processFileMetadata({
                                projectId,
                                fileName: file.name,
                                fileSize: file.size,
                                fileType: file.type,
                                downloadURL
                            });

                            resolve(downloadURL);
                        } catch (error) {
                            reject(error);
                        }
                    }
                );
            });

        } catch (error) {
            console.error('File upload error:', error);
            throw error;
        }
    }

    /**
     * Upload multiple files
     * @param {string} projectId - Project ID
     * @param {FileList} files - Files to upload
     * @param {Function} progressCallback - Progress callback function
     * @returns {Promise<string[]>} Array of download URLs
     */
    async uploadMultipleFiles(projectId, files, progressCallback = null) {
        const uploadPromises = Array.from(files).map(file => 
            this.uploadFile(projectId, file, progressCallback)
        );

        try {
            return await Promise.all(uploadPromises);
        } catch (error) {
            console.error('Multiple file upload error:', error);
            throw error;
        }
    }

    /**
     * Validate file before upload
     * @param {File} file - File to validate
     */
    validateFile(file) {
        const maxSize = 50 * 1024 * 1024; // 50MB
        const allowedTypes = [
            'application/pdf',
            'image/jpeg',
            'image/png',
            'image/gif',
            'application/dwg',
            'application/dxf',
            'text/plain',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ];

        // Check file size
        if (file.size > maxSize) {
            throw new Error(`File size exceeds 50MB limit. File size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
        }

        // Check file type (relaxed for development)
        const fileExtension = file.name.split('.').pop().toLowerCase();
        const commonExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'dwg', 'dxf', 'txt', 'doc', 'docx', 'xls', 'xlsx'];
        
        if (!commonExtensions.includes(fileExtension)) {
            console.warn(`File type may not be supported: ${file.type || fileExtension}`);
            // In development, we'll allow it but warn the user
        }
    }

    /**
     * Get all files for a project
     * @param {string} projectId - Project ID
     * @returns {Promise<Array>} Array of file metadata
     */
    async getProjectFiles(projectId) {
        try {
            const filesRef = ref(storage, `projects/${projectId}/files`);
            const fileList = await listAll(filesRef);
            
            const filePromises = fileList.items.map(async (fileRef) => {
                const downloadURL = await getDownloadURL(fileRef);
                return {
                    name: fileRef.name,
                    fullPath: fileRef.fullPath,
                    downloadURL,
                    // Additional metadata would come from Firestore
                };
            });

            return await Promise.all(filePromises);
        } catch (error) {
            console.error('Error getting project files:', error);
            throw error;
        }
    }

    /**
     * Delete a file
     * @param {string} projectId - Project ID
     * @param {string} fileName - Name of file to delete
     */
    async deleteFile(projectId, fileName) {
        try {
            const fileRef = ref(storage, `projects/${projectId}/files/${fileName}`);
            await deleteObject(fileRef);
            
            // Remove from project's file list in Firestore
            // This would need to be implemented based on the file URL structure
            console.log(`File ${fileName} deleted successfully`);
        } catch (error) {
            console.error('Error deleting file:', error);
            throw error;
        }
    }

    /**
     * Cancel an active upload
     * @param {string} fileName - Name of file upload to cancel
     */
    cancelUpload(fileName) {
        const uploadTask = this.activeUploads.get(fileName);
        if (uploadTask) {
            uploadTask.cancel();
            this.activeUploads.delete(fileName);
            console.log(`Upload cancelled for ${fileName}`);
        }
    }

    /**
     * Get upload progress for all active uploads
     * @returns {Object} Active uploads with progress
     */
    getActiveUploads() {
        const uploads = {};
        this.activeUploads.forEach((task, fileName) => {
            uploads[fileName] = {
                state: task.snapshot.state,
                progress: (task.snapshot.bytesTransferred / task.snapshot.totalBytes) * 100
            };
        });
        return uploads;
    }
}

// Initialize and export file upload manager
export const fileUploadManager = new FileUploadManager();

// UI Helper Functions for File Upload

/**
 * Setup drag and drop file upload
 * @param {string} dropZoneId - ID of drop zone element
 * @param {string} projectId - Project ID
 * @param {Function} onFilesAdded - Callback when files are added
 */
export function setupFileDropZone(dropZoneId, projectId, onFilesAdded) {
    const dropZone = document.getElementById(dropZoneId);
    if (!dropZone) return;

    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    // Highlight drop zone when item is dragged over it
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });

    // Handle dropped files
    dropZone.addEventListener('drop', handleDrop, false);

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    function highlight(e) {
        dropZone.classList.add('drag-over');
    }

    function unhighlight(e) {
        dropZone.classList.remove('drag-over');
    }

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (onFilesAdded && files.length > 0) {
            onFilesAdded(files, projectId);
        }
    }
}

/**
 * Create file upload progress UI
 * @param {string} containerId - Container element ID
 * @param {Array} files - Files being uploaded
 * @returns {Object} Progress update functions
 */
export function createUploadProgressUI(containerId, files) {
    const container = document.getElementById(containerId);
    if (!container) return {};

    const progressElements = {};

    Array.from(files).forEach(file => {
        const progressDiv = document.createElement('div');
        progressDiv.className = 'upload-progress';
        progressDiv.innerHTML = `
            <div class="file-info">
                <span class="file-name">${file.name}</span>
                <span class="file-size">${(file.size / 1024 / 1024).toFixed(2)} MB</span>
            </div>
            <div class="progress-bar-container">
                <div class="progress-bar" style="width: 0%"></div>
            </div>
            <div class="progress-status">Uploading...</div>
        `;

        container.appendChild(progressDiv);
        progressElements[file.name] = progressDiv;
    });

    return {
        updateProgress: (fileName, progress, status = 'Uploading...') => {
            const element = progressElements[fileName];
            if (element) {
                const progressBar = element.querySelector('.progress-bar');
                const statusElement = element.querySelector('.progress-status');
                
                progressBar.style.width = `${progress}%`;
                statusElement.textContent = status;
                
                if (progress === 100) {
                    element.classList.add('upload-complete');
                    statusElement.textContent = 'Complete';
                }
            }
        },
        removeProgress: (fileName) => {
            const element = progressElements[fileName];
            if (element) {
                element.remove();
                delete progressElements[fileName];
            }
        }
    };
}