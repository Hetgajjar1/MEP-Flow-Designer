// MEP Flow Designer Cloud Functions
// Phase 1: Authentication, Project Management, and Basic Calculations

const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp();

console.log('🔧 Loading MEP Flow Designer Cloud Functions...');

// ===== Helpers =====
async function getUserRole(uid) {
  try {
    const snap = await admin.firestore().collection('users').doc(uid).get();
    return snap.exists ? snap.data().role || 'designer' : 'designer';
  } catch (e) {
    functions.logger.warn('getUserRole error', { uid, error: e });
    return 'designer';
  }
}

async function isAdminContext(context) {
  if (!context?.auth) return false;
  const tokenRole = context.auth.token?.role;
  if (tokenRole === 'admin') return true;
  const role = await getUserRole(context.auth.uid);
  return role === 'admin';
}

// ===== PROJECT MANAGEMENT =====

/**
 * Create a new MEP project with validation and initialization
 */
exports.createProject = functions.https.onCall(async (data, context) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be signed in to create projects.');
  }

  // Validate input data
  if (!data.name || !data.type) {
    throw new functions.https.HttpsError('invalid-argument', 'Project name and type are required.');
  }

  const projectData = {
    name: data.name,
    type: data.type,
    description: data.description || '',
    buildingType: data.buildingType || '',
    createdBy: context.auth.uid,
    createdByEmail: context.auth.token.email,
    createdByName: context.auth.token.name || context.auth.token.email,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    status: 'active',
    settings: {
      units: data.settings?.units || 'imperial',
      standards: data.settings?.standards || 'ASHRAE',
      calculations: {
        hvac: data.type === 'hvac' || data.type === 'integrated',
        electrical: data.type === 'electrical' || data.type === 'integrated',
        plumbing: data.type === 'plumbing' || data.type === 'integrated',
        fire: data.type === 'fire' || data.type === 'integrated'
      }
    },
    calculations: {
      loads: {
        heating: 0,
        cooling: 0,
        electrical: 0,
        water: 0
      },
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    }
  };

  try {
    const projectRef = await admin.firestore().collection('projects').add(projectData);
    
    // Create initial project structure
    await initializeProjectStructure(projectRef.id, data.type);
    
    functions.logger.info('Project created successfully', { projectId: projectRef.id, userId: context.auth.uid });
    
    return {
      success: true,
      projectId: projectRef.id,
      message: 'Project created successfully'
    };
  } catch (error) {
    functions.logger.error('Error creating project', error);
    throw new functions.https.HttpsError('internal', 'Failed to create project');
  }
});

/**
 * Initialize project structure with default calculations and settings
 */
async function initializeProjectStructure(projectId, projectType) {
  const batch = admin.firestore().batch();
  
  // Create default calculation templates based on project type
  const calculationsRef = admin.firestore().collection('projects').doc(projectId).collection('calculations');
  
  if (projectType === 'hvac' || projectType === 'integrated') {
    batch.set(calculationsRef.doc('hvac'), {
      type: 'hvac',
      loadCalculations: {
        heatingLoad: 0,
        coolingLoad: 0,
        ventilationRequirement: 0,
        ductSizing: {},
        equipment: {}
      },
      created: admin.firestore.FieldValue.serverTimestamp()
    });
  }
  
  if (projectType === 'electrical' || projectType === 'integrated') {
    batch.set(calculationsRef.doc('electrical'), {
      type: 'electrical',
      loadCalculations: {
        totalLoad: 0,
        demandFactor: 0.8,
        panelSchedule: {},
        circuitAnalysis: {},
        equipment: {}
      },
      created: admin.firestore.FieldValue.serverTimestamp()
    });
  }
  
  if (projectType === 'plumbing' || projectType === 'integrated') {
    batch.set(calculationsRef.doc('plumbing'), {
      type: 'plumbing',
      loadCalculations: {
        waterSupply: 0,
        drainageLoad: 0,
        pipeSizing: {},
        pressureAnalysis: {},
        equipment: {}
      },
      created: admin.firestore.FieldValue.serverTimestamp()
    });
  }
  
  await batch.commit();
}

// ===== CALCULATION FUNCTIONS (Phase 1 Placeholders) =====

/**
 * HVAC Load Calculation Placeholder
 */
exports.calculateHVACLoad = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
  }
  
  // Phase 1: Return mock calculation
  return {
    success: true,
    results: {
      heatingLoad: 75000, // BTU/hr
      coolingLoad: 48000, // BTU/hr
      ventilation: 1200, // CFM
      message: "Phase 1: HVAC calculation placeholder - Real calculations coming in Phase 2"
    },
    timestamp: new Date().toISOString()
  };
});

/**
 * Electrical Load Calculation Placeholder
 */
exports.calculateElectricalLoad = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
  }
  
  // Phase 1: Return mock calculation
  return {
    success: true,
    results: {
      totalLoad: 125, // kW
      demandLoad: 100, // kW (with demand factor)
      amperage: 416, // Amps at 240V 3-phase
      message: "Phase 1: Electrical calculation placeholder - Real calculations coming in Phase 2"
    },
    timestamp: new Date().toISOString()
  };
});

/**
 * Plumbing Flow Calculation Placeholder
 */
exports.calculatePlumbingFlow = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
  }
  
  // Phase 1: Return mock calculation
  return {
    success: true,
    results: {
      waterSupplyLoad: 45, // GPM
      drainageLoad: 35, // DFU
      pipeSizing: "2-inch main, 1-inch branches",
      message: "Phase 1: Plumbing calculation placeholder - Real calculations coming in Phase 2"
    },
    timestamp: new Date().toISOString()
  };
});

/**
 * Fire Protection System Calculation Placeholder
 */
exports.calculateFireProtection = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
  }
  
  // Phase 1: Return mock calculation
  return {
    success: true,
    results: {
      sprinklerDemand: 500, // GPM
      hydrantFlow: 1500, // GPM
      pumpSize: 750, // GPM at 100 PSI
      message: "Phase 1: Fire protection calculation placeholder - Real calculations coming in Phase 2"
    },
    timestamp: new Date().toISOString()
  };
});

/**
 * Get user projects (Phase 2 support)
 */
exports.getUserProjects = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
  }

  try {
    const snapshot = await admin.firestore()
      .collection('projects')
      .where('createdBy', '==', context.auth.uid)
      .orderBy('createdAt', 'desc')
      .get();

    const projects = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    return { success: true, projects, count: projects.length };
  } catch (err) {
    functions.logger.error('getUserProjects error', err);
    throw new functions.https.HttpsError('internal', 'Failed to load projects');
  }
});

/**
 * Process file upload metadata (Phase 2 support)
 */
exports.processFileUpload = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
  }
  const { projectId, fileName, fileSize, fileType, downloadURL } = data || {};
  if (!projectId || !fileName || !downloadURL) {
    throw new functions.https.HttpsError('invalid-argument', 'projectId, fileName and downloadURL are required');
  }
  try {
    await admin.firestore().collection('projects').doc(projectId).set({
      files: admin.firestore.FieldValue.arrayUnion(downloadURL),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    return { success: true };
  } catch (err) {
    functions.logger.error('processFileUpload error', err);
    throw new functions.https.HttpsError('internal', 'Failed to process file');
  }
});

// ===== USER MANAGEMENT =====

/**
 * Update user profile and role
 */
exports.updateUserProfile = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
  }
  
  try {
    const userData = {
      email: context.auth.token.email,
      name: data.name || context.auth.token.name || context.auth.token.email,
      role: data.role || 'designer',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    await admin.firestore().collection('users').doc(context.auth.uid).set(userData, { merge: true });
    // Keep custom claims in sync if role provided
    if (data.role) {
      await admin.auth().setCustomUserClaims(context.auth.uid, { role: data.role });
    }
    
    return {
      success: true,
      message: 'Profile updated successfully'
    };
  } catch (error) {
    functions.logger.error('Error updating user profile', error);
    throw new functions.https.HttpsError('internal', 'Failed to update profile');
  }
});

// ===== ADMIN FUNCTIONS (Phase 2 RBAC) =====

/**
 * List user profiles (admin only)
 */
exports.listUsersProfiles = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
  }
  const isAdmin = await isAdminContext(context);
  if (!isAdmin) {
    throw new functions.https.HttpsError('permission-denied', 'Admin privileges required');
  }
  try {
    const snap = await admin.firestore().collection('users').orderBy('updatedAt', 'desc').limit(500).get();
    const users = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return { success: true, users, count: users.length };
  } catch (e) {
    functions.logger.error('listUsersProfiles error', e);
    throw new functions.https.HttpsError('internal', 'Failed to list users');
  }
});

/**
 * Set a user's role (admin only). Updates Firestore profile and custom claims.
 */
exports.setUserRole = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
  }
  const isAdmin = await isAdminContext(context);
  if (!isAdmin) {
    throw new functions.https.HttpsError('permission-denied', 'Admin privileges required');
  }
  const { uid, role } = data || {};
  const allowed = ['designer', 'engineer', 'reviewer', 'admin'];
  if (!uid || !role || !allowed.includes(role)) {
    throw new functions.https.HttpsError('invalid-argument', 'Provide uid and a valid role');
  }
  try {
    await admin.firestore().collection('users').doc(uid).set({ role, updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
    await admin.auth().setCustomUserClaims(uid, { role });
    return { success: true };
  } catch (e) {
    functions.logger.error('setUserRole error', e);
    throw new functions.https.HttpsError('internal', 'Failed to set user role');
  }
});

/**
 * Sync current user's custom claims from Firestore profile
 */
exports.syncMyClaims = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
  }
  try {
    const role = await getUserRole(context.auth.uid);
    await admin.auth().setCustomUserClaims(context.auth.uid, { role });
    return { success: true, role };
  } catch (e) {
    functions.logger.error('syncMyClaims error', e);
    throw new functions.https.HttpsError('internal', 'Failed to sync claims');
  }
});

// ===== PROJECT ANALYTICS (Phase 1) =====

/**
 * Get project statistics for dashboard
 */
exports.getProjectStats = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
  }
  
  try {
    const projectsSnapshot = await admin.firestore()
      .collection('projects')
      .where('createdBy', '==', context.auth.uid)
      .get();
    
    const projects = projectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    const stats = {
      totalProjects: projects.length,
      projectsByType: {
        hvac: projects.filter(p => p.type === 'hvac').length,
        electrical: projects.filter(p => p.type === 'electrical').length,
        plumbing: projects.filter(p => p.type === 'plumbing').length,
        fire: projects.filter(p => p.type === 'fire').length,
        integrated: projects.filter(p => p.type === 'integrated').length
      },
      recentActivity: projects
        .sort((a, b) => b.updatedAt?.toDate() - a.updatedAt?.toDate())
        .slice(0, 5)
        .map(p => ({
          id: p.id,
          name: p.name,
          type: p.type,
          updatedAt: p.updatedAt
        }))
    };
    
    return {
      success: true,
      stats
    };
  } catch (error) {
    functions.logger.error('Error getting project stats', error);
    throw new functions.https.HttpsError('internal', 'Failed to get project statistics');
  }
});

console.log('✅ MEP Flow Designer Cloud Functions loaded successfully');