// Main Application Module for MEP Flow Designer
import { authManager } from './auth.js';
import { projectManager } from './projects.js';
import { config } from './firebase-config.js';

class MEPFlowApp {
    constructor() {
        this.isInitialized = false;
        this.init();
    }

    async init() {
        try {
            console.log('🚀 Initializing MEP Flow Designer...');
            
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.startup());
            } else {
                this.startup();
            }
            
        } catch (error) {
            console.error('❌ Error initializing app:', error);
            this.showInitializationError(error);
        }
    }

    startup() {
        console.log('🔧 Starting up MEP Flow Designer...');
        
        // Display environment info
        this.displayEnvironmentInfo();
        
        // Initialize app features
        this.initializeFeatures();
        
        // Set up global error handling
        this.setupErrorHandling();
        
        // Mark as initialized
        this.isInitialized = true;
        
        console.log('✅ MEP Flow Designer initialized successfully!');
        
        // Show welcome message for development
        if (config.isDevelopment) {
            this.showDevelopmentWelcome();
        }
    }

    displayEnvironmentInfo() {
        console.log('🌍 Environment Information:');
        console.log('- Mode:', config.isDevelopment ? 'Development' : 'Production');
        console.log('- Project ID:', config.projectId);
        console.log('- Emulators:', config.emulators);
        
        // Add environment indicator to page
        if (config.isDevelopment) {
            this.addDevelopmentIndicator();
        }
    }

    addDevelopmentIndicator() {
        const indicator = document.createElement('div');
        indicator.style.cssText = `
            position: fixed;
            top: 0;
            right: 0;
            background: #ff6b35;
            color: white;
            padding: 5px 10px;
            font-size: 12px;
            font-weight: bold;
            z-index: 10000;
            border-bottom-left-radius: 5px;
        `;
        indicator.textContent = 'DEV MODE';
        document.body.appendChild(indicator);
    }

    initializeFeatures() {
        // Initialize Learn More button
        const learnMoreBtn = document.getElementById('learn-more-btn');
        if (learnMoreBtn) {
            learnMoreBtn.addEventListener('click', () => this.showFeatures());
        }

        // Initialize any additional UI features
        this.initializeTooltips();
        this.initializeKeyboardShortcuts();
        
        // Set up auth state listener for UI updates
        authManager.auth.onAuthStateChanged((user) => {
            document.dispatchEvent(new CustomEvent('authStateChanged', { 
                detail: { user } 
            }));
        });
    }

    initializeTooltips() {
        // Add tooltips for better UX
        const tooltips = document.querySelectorAll('[data-tooltip]');
        tooltips.forEach(element => {
            element.addEventListener('mouseenter', (e) => {
                this.showTooltip(e.target, e.target.dataset.tooltip);
            });
            element.addEventListener('mouseleave', () => {
                this.hideTooltip();
            });
        });
    }

    initializeKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + N for new project
            if ((e.ctrlKey || e.metaKey) && e.key === 'n' && authManager.isAuthenticated()) {
                e.preventDefault();
                projectManager.openProjectModal();
            }
            
            // Escape to close modals
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }

    showFeatures() {
        const features = [
            '🏗️ HVAC Design & Load Calculations',
            '⚡ Electrical Power Distribution Analysis', 
            '🚿 Plumbing Flow & Pressure Calculations',
            '🔥 Fire Protection System Design',
            '📊 Energy Efficiency Analysis',
            '📁 DWG/PDF File Management',
            '👥 Team Collaboration & Review',
            '📋 Code Compliance Checking',
            '🔄 Real-time Design Synchronization',
            '📈 Project Progress Tracking'
        ];

        alert(`MEP Flow Designer Features:\n\n${features.join('\n')}\n\n🚀 Start by creating your first project!`);
    }

    showDevelopmentWelcome() {
        const emulatorStatus = [];
        if (config.emulators.auth) emulatorStatus.push('✅ Auth');
        if (config.emulators.firestore) emulatorStatus.push('✅ Firestore');
        if (config.emulators.functions) emulatorStatus.push('✅ Functions');
        if (config.emulators.storage) emulatorStatus.push('✅ Storage');

        console.log(`
🔥 MEP Flow Designer - Development Mode
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Emulator Status:
${emulatorStatus.join('\n')}

💡 Development Features:
• Hot reload enabled
• Mock data for testing
• Firebase emulators for local development
• Debug logging enabled

🎯 Quick Start:
1. Sign up for a test account
2. Create your first MEP project
3. Explore the interface

📚 Note: Some features may show mock data when 
   emulators are not fully available.
        `);
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }

    showTooltip(element, text) {
        this.hideTooltip(); // Remove existing tooltip
        
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = text;
        tooltip.style.cssText = `
            position: absolute;
            background: #333;
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 14px;
            z-index: 1000;
            white-space: nowrap;
            pointer-events: none;
        `;
        
        document.body.appendChild(tooltip);
        
        const rect = element.getBoundingClientRect();
        tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
        tooltip.style.top = rect.top - tooltip.offsetHeight - 8 + 'px';
    }

    hideTooltip() {
        const existing = document.querySelector('.tooltip');
        if (existing) {
            existing.remove();
        }
    }

    setupErrorHandling() {
        window.addEventListener('error', (e) => {
            console.error('Global error caught:', e.error);
            this.showErrorNotification('An unexpected error occurred. Please refresh the page.');
        });

        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled promise rejection:', e.reason);
            this.showErrorNotification('A network or processing error occurred.');
        });
    }

    showErrorNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #f8d7da;
            color: #721c24;
            padding: 15px 20px;
            border: 1px solid #f5c6cb;
            border-radius: 5px;
            z-index: 10000;
            max-width: 400px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
        
        // Click to dismiss
        notification.addEventListener('click', () => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        });
    }

    showInitializationError(error) {
        const errorMessage = `
            Failed to initialize MEP Flow Designer.
            
            Error: ${error.message}
            
            Please refresh the page or contact support if the issue persists.
        `;
        
        // Show error in console
        console.error(errorMessage);
        
        // Show error on page
        document.body.innerHTML = `
            <div style="
                padding: 40px; 
                text-align: center; 
                font-family: Arial, sans-serif;
                max-width: 600px;
                margin: 50px auto;
                background: #f8d7da;
                border: 1px solid #f5c6cb;
                border-radius: 10px;
                color: #721c24;
            ">
                <h1>⚠️ Initialization Error</h1>
                <p>${errorMessage}</p>
                <button onclick="window.location.reload()" style="
                    margin-top: 20px;
                    padding: 10px 20px;
                    background: #dc3545;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 16px;
                ">
                    Refresh Page
                </button>
            </div>
        `;
    }
}

// Initialize the application
const app = new MEPFlowApp();

// Export for global access if needed
window.mepFlowApp = app;

console.log('🔥 MEP Flow Designer loaded successfully!');