// Projects Module for MEP Flow Designer - Phase 2
import { db, functions } from './firebase-config.js';
import { authManager } from './auth.js';
import { fileUploadManager, setupFileDropZone, createUploadProgressUI } from './file-upload.js';
import { 
    collection, 
    addDoc, 
    getDocs, 
    query, 
    where, 
    orderBy,
    doc,
    getDoc,
    updateDoc,
    deleteDoc,
    onSnapshot,
    serverTimestamp 
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';
import { 
    httpsCallable 
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-functions.js';

class ProjectManager {
    constructor() {
        this.projects = [];
        this.unsubscribeProjects = null;
        this.currentProject = null;
        
        // Cloud Functions
        this.createProjectFunc = httpsCallable(functions, 'createProject');
        this.getUserProjectsFunc = httpsCallable(functions, 'getUserProjects');
        this.calculateHVAC = httpsCallable(functions, 'calculateHVACLoad');
        this.calculateElectrical = httpsCallable(functions, 'calculateElectricalLoad');
        this.calculatePlumbing = httpsCallable(functions, 'calculatePlumbingFlow');
        this.calculateFire = httpsCallable(functions, 'calculateFireProtection');
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        const newProjectBtn = document.getElementById('new-project-btn');
        const projectModal = document.getElementById('project-modal');
        const projectForm = document.getElementById('project-form');
        const closeButtons = document.querySelectorAll('.close');

        // Open new project modal
        if (newProjectBtn) {
            newProjectBtn.addEventListener('click', () => this.openProjectModal());
        }

        // Project form submission
        if (projectForm) {
            projectForm.addEventListener('submit', (e) => this.handleProjectSubmit(e));
        }

        // Close modals
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => this.closeModals());
        });

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModals();
            }
        });

        // Listen for auth state changes
        document.addEventListener('authStateChanged', (e) => {
            if (e.detail.user) {
                this.loadUserProjects();
                this.setupRealtimeProjectListener();
            } else {
                this.clearProjects();
                if (this.unsubscribeProjects) {
                    this.unsubscribeProjects();
                    this.unsubscribeProjects = null;
                }
            }
        });

        // Setup file upload drag and drop
        this.setupFileUploadUI();
    }

    /**
     * Setup real-time project listener using Firestore onSnapshot
     */
    setupRealtimeProjectListener() {
        if (!authManager.isAuthenticated()) return;

        try {
            const user = authManager.getCurrentUser();
            const projectsQuery = query(
                collection(db, 'projects'),
                where('createdBy', '==', user.uid),
                orderBy('createdAt', 'desc')
            );

            this.unsubscribeProjects = onSnapshot(projectsQuery, (snapshot) => {
                this.projects = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                this.displayProjects();
                this.updateProjectStats();
            }, (error) => {
                console.error('Error in projects listener:', error);
                this.showMessage('Error loading projects: ' + error.message, 'error');
            });

        } catch (error) {
            console.error('Error setting up projects listener:', error);
        }
    }

    openProjectModal() {
        if (!authManager.isAuthenticated()) {
            this.showMessage('Please log in to create projects', 'error');
            return;
        }
        document.getElementById('project-modal').style.display = 'block';
    }

    closeModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
        document.getElementById('project-form').reset();
        this.clearMessages();
    }

    async handleProjectSubmit(e) {
        e.preventDefault();

        if (!authManager.isAuthenticated()) {
            this.showMessage('Please log in to create projects', 'error');
            return;
        }

        const projectName = document.getElementById('project-name').value.trim();
        const projectType = document.getElementById('project-type').value;
        const projectDescription = document.getElementById('project-description').value.trim();
        const buildingType = document.getElementById('building-type').value;
        
        // Enhanced inputs for Phase 2
        const location = document.getElementById('project-location')?.value.trim() || '';
        const area = parseFloat(document.getElementById('project-area')?.value) || 0;
        const floors = parseInt(document.getElementById('project-floors')?.value) || 1;

        if (!projectName || !projectType) {
            this.showMessage('Please fill in all required fields', 'error');
            return;
        }

        this.setLoading(true);

        try {
            // Use Cloud Function to create project
            const result = await this.createProjectFunc({
                name: projectName,
                type: projectType,
                description: projectDescription,
                buildingType,
                location,
                area,
                floors
            });

            if (result.data.success) {
                this.showMessage('Project created successfully!', 'success');
                this.closeModals();
                // Real-time listener will automatically update the UI
            } else {
                throw new Error(result.data.message || 'Unknown error');
            }

        } catch (error) {
            console.error('Error creating project:', error);
            this.showMessage('Error creating project: ' + error.message, 'error');
        } finally {
            this.setLoading(false);
        }
    }

    /**
     * Load user projects using Cloud Function
     */
    async loadUserProjects() {
        if (!authManager.isAuthenticated()) return;

        try {
            const result = await this.getUserProjectsFunc();
            if (result.data.success) {
                this.projects = result.data.projects || [];
                this.displayProjects();
                this.updateProjectStats();
            }
        } catch (error) {
            console.error('Error loading projects:', error);
            this.showMessage('Error loading projects: ' + error.message, 'error');
        }
    }

    displayProjects() {
        const projectsGrid = document.getElementById('projects-grid');
        if (!projectsGrid) return;

        if (this.projects.length === 0) {
            projectsGrid.innerHTML = `
                <div class="no-projects">
                    <h3>No projects yet</h3>
                    <p>Create your first MEP project to get started</p>
                    <button class="btn btn-primary" onclick="document.getElementById('new-project-btn').click()">
                        Create Project
                    </button>
                </div>
            `;
            return;
        }

        projectsGrid.innerHTML = this.projects.map(project => `
            <div class="project-card" data-project-id="${project.id}">
                <div class="project-header">
                    <h4>${project.name}</h4>
                    <span class="project-type ${project.type}">${project.type.toUpperCase()}</span>
                </div>
                <div class="project-details">
                    <p><strong>Building:</strong> ${project.buildingType || 'Not specified'}</p>
                    <p><strong>Area:</strong> ${project.area ? project.area.toLocaleString() + ' sq ft' : 'Not specified'}</p>
                    <p><strong>Files:</strong> ${project.files ? project.files.length : 0}</p>
                    <p><strong>Created:</strong> ${this.formatDate(project.createdAt)}</p>
                </div>
                <div class="project-actions">
                    <button class="btn btn-small btn-primary" onclick="projectManager.openProject('${project.id}')">
                        Open
                    </button>
                    <button class="btn btn-small btn-secondary" onclick="projectManager.runCalculations('${project.id}')">
                        Calculate
                    </button>
                    <button class="btn btn-small" onclick="projectManager.uploadFiles('${project.id}')">
                        Files
                    </button>
                </div>
            </div>
        `).join('');
    }

    /**
     * Open a project for detailed view/editing
     */
    async openProject(projectId) {
        try {
            const projectRef = doc(db, 'projects', projectId);
            const projectSnap = await getDoc(projectRef);
            
            if (projectSnap.exists()) {
                this.currentProject = { id: projectSnap.id, ...projectSnap.data() };
                this.showProjectDetails();
            } else {
                this.showMessage('Project not found', 'error');
            }
        } catch (error) {
            console.error('Error opening project:', error);
            this.showMessage('Error opening project: ' + error.message, 'error');
        }
    }

    /**
     * Run MEP calculations for a project
     */
    async runCalculations(projectId) {
        const project = this.projects.find(p => p.id === projectId);
        if (!project) return;

        // Simple role-based restriction: only engineers or admins allowed to trigger calculations for now
        const role = localStorage.getItem('mep_user_role') || 'designer';
        if (!['engineer', 'admin'].includes(role)) {
            this.showMessage('Your role cannot run calculations (engineer or admin required).', 'error');
            return;
        }

        try {
            this.showMessage('Running calculations...', 'info');

            let results = {};

            // Run calculations based on project type
            if (project.type === 'hvac' || project.type === 'integrated') {
                const hvacResult = await this.calculateHVAC({
                    projectId,
                    area: project.area || 1000,
                    ceilingHeight: 9,
                    insulationFactor: 1.2,
                    occupancy: Math.ceil((project.area || 1000) / 200),
                    location: project.location || 'temperate',
                    orientation: 'north'
                });
                results.hvac = hvacResult.data.results;
            }

            if (project.type === 'electrical' || project.type === 'integrated') {
                const electricalResult = await this.calculateElectrical({
                    projectId,
                    area: project.area || 1000,
                    lightingLoad: 3.5,
                    receptacleLoad: 1.8,
                    hvacLoad: (project.area || 1000) * 3.5,
                    safetyFactor: 1.25
                });
                results.electrical = electricalResult.data.results;
            }

            if (project.type === 'plumbing' || project.type === 'integrated') {
                const plumbingResult = await this.calculatePlumbing({
                    projectId,
                    fixtures: [
                        { type: 'sink', count: 5 },
                        { type: 'toilet', count: 4 },
                        { type: 'shower', count: 2 }
                    ],
                    pipeLength: 150,
                    elevationChange: project.floors ? project.floors * 10 : 10
                });
                results.plumbing = plumbingResult.data.results;
            }

            if (project.type === 'fire' || project.type === 'integrated') {
                const fireResult = await this.calculateFire({
                    projectId,
                    area: project.area || 1000,
                    occupancy: 'office',
                    buildingHeight: project.floors ? project.floors * 12 : 12,
                    hazardClass: 'ordinary1'
                });
                results.fire = fireResult.data.results;
            }

            this.showCalculationResults(project.name, results);
            this.showMessage('Calculations completed successfully!', 'success');

        } catch (error) {
            console.error('Error running calculations:', error);
            this.showMessage('Error running calculations: ' + error.message, 'error');
        }
    }

    /**
     * Show calculation results in a modal
     */
    showCalculationResults(projectName, results) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        
        let resultsHTML = `<h3>Calculation Results for ${projectName}</h3>`;
        
        if (results.hvac) {
            resultsHTML += `
                <div class="calc-section">
                    <h4>HVAC System</h4>
                    <p><strong>Heating Load:</strong> ${results.hvac.heatingLoad.toLocaleString()} BTU/hr</p>
                    <p><strong>Cooling Load:</strong> ${results.hvac.coolingLoad.toLocaleString()} BTU/hr</p>
                    <p><strong>Ventilation:</strong> ${results.hvac.ventilationCFM.toLocaleString()} CFM</p>
                    <p><strong>Equipment Size:</strong> ${results.hvac.equipmentTons} tons</p>
                    <p><strong>Estimated Cost:</strong> $${results.hvac.estimatedCost.toLocaleString()}</p>
                </div>
            `;
        }
        
        if (results.electrical) {
            resultsHTML += `
                <div class="calc-section">
                    <h4>Electrical System</h4>
                    <p><strong>Total Load:</strong> ${results.electrical.finalLoad.toLocaleString()} watts</p>
                    <p><strong>Current (208V):</strong> ${results.electrical.current208V} amps</p>
                    <p><strong>Panel Size:</strong> ${results.electrical.panelSize} circuit</p>
                    <p><strong>Service Size:</strong> ${results.electrical.serviceSize} amps</p>
                    <p><strong>Estimated Cost:</strong> $${results.electrical.estimatedCost.toLocaleString()}</p>
                </div>
            `;
        }
        
        if (results.plumbing) {
            resultsHTML += `
                <div class="calc-section">
                    <h4>Plumbing System</h4>
                    <p><strong>Flow Rate:</strong> ${results.plumbing.flowGPM} GPM</p>
                    <p><strong>Pipe Size:</strong> ${results.plumbing.recommendedPipeSize}" main</p>
                    <p><strong>Pressure Required:</strong> ${results.plumbing.requiredSupplyPressure} PSI</p>
                    <p><strong>Estimated Cost:</strong> $${results.plumbing.estimatedCost.toLocaleString()}</p>
                </div>
            `;
        }

        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                ${resultsHTML}
                <button class="btn btn-primary" onclick="this.closest('.modal').remove()">Close</button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close modal functionality
        modal.querySelector('.close').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    /**
     * Upload files for a project
     */
    uploadFiles(projectId) {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.accept = '.pdf,.dwg,.dxf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx,.txt';
        
        input.onchange = async (e) => {
            const files = e.target.files;
            if (files.length === 0) return;

            try {
                this.showMessage('Uploading files...', 'info');
                
                const progressUI = createUploadProgressUI('upload-progress', files);
                
                for (const file of files) {
                    await fileUploadManager.uploadFile(projectId, file, (progress) => {
                        progressUI.updateProgress(file.name, progress.progress);
                    });
                }
                
                this.showMessage(`${files.length} files uploaded successfully!`, 'success');
                
            } catch (error) {
                console.error('File upload error:', error);
                this.showMessage('Error uploading files: ' + error.message, 'error');
            }
        };
        
        input.click();
    }

    /**
     * Setup file upload UI components
     */
    setupFileUploadUI() {
        // Add upload progress container if it doesn't exist
        if (!document.getElementById('upload-progress')) {
            const progressContainer = document.createElement('div');
            progressContainer.id = 'upload-progress';
            progressContainer.className = 'upload-progress-container';
            document.body.appendChild(progressContainer);
        }
    }

    clearProjects() {
        this.projects = [];
        this.currentProject = null;
        const projectsGrid = document.getElementById('projects-grid');
        if (projectsGrid) {
            projectsGrid.innerHTML = '<p>Please log in to view your projects.</p>';
        }
    }

    updateProjectStats() {
        const statsContainer = document.getElementById('project-stats');
        if (!statsContainer || this.projects.length === 0) return;

        const stats = {
            total: this.projects.length,
            hvac: this.projects.filter(p => p.type === 'hvac').length,
            electrical: this.projects.filter(p => p.type === 'electrical').length,
            plumbing: this.projects.filter(p => p.type === 'plumbing').length,
            integrated: this.projects.filter(p => p.type === 'integrated').length
        };

        statsContainer.innerHTML = `
            <div class="stats-grid">
                <div class="stat-item">
                    <span class="stat-number">${stats.total}</span>
                    <span class="stat-label">Total Projects</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">${stats.hvac}</span>
                    <span class="stat-label">HVAC</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">${stats.electrical}</span>
                    <span class="stat-label">Electrical</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">${stats.plumbing}</span>
                    <span class="stat-label">Plumbing</span>
                </div>
            </div>
        `;
    }

    setLoading(isLoading) {
        const submitBtn = document.getElementById('project-submit') || 
                        document.querySelector('#project-form button[type="submit"]');
        if (submitBtn) {
            if (isLoading) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Creating...';
            } else {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Create Project';
            }
        }
    }

    showMessage(message, type = 'info') {
        this.clearMessages();
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;
        
        const container = document.querySelector('.main .container') || document.body;
        container.insertBefore(messageDiv, container.firstChild);
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }

    clearMessages() {
        document.querySelectorAll('.message').forEach(msg => msg.remove());
    }

    formatDate(timestamp) {
        if (!timestamp) return 'Unknown';
        
        let date;
        if (timestamp.toDate) {
            // Firestore timestamp
            date = timestamp.toDate();
        } else if (timestamp instanceof Date) {
            date = timestamp;
        } else {
            date = new Date(timestamp);
        }
        
        return date.toLocaleDateString();
    }
}

// Initialize and export project manager
export const projectManager = new ProjectManager();

// Make it globally available for onclick handlers
window.projectManager = projectManager;