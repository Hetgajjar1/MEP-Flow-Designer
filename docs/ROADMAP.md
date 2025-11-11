# MEP Flow Designer - Product Roadmap

## Current Status: Phase 2 Complete ✅

**What's Live**:
- ✅ Authentication with role-based access control (RBAC)
- ✅ Project CRUD operations
- ✅ Real-time dashboard with Firestore sync
- ✅ Placeholder calculation system (4 MEP systems)
- ✅ File upload/management with Cloud Storage
- ✅ Admin panel for user role management
- ✅ Custom claims integration
- ✅ Comprehensive security rules (Firestore + Storage)

---

## Phase 3: Real Calculations & Analytics (Q1 2026)

### Objectives
Replace placeholder calculations with industry-standard engineering formulas and add project analytics.

### Features

#### 3.1 HVAC Calculations
- [ ] Implement ASHRAE load calculation methods
  - Heating load (BTU/hr) using heat loss formula
  - Cooling load (BTU/hr) using CLTD method
  - Ventilation (CFM) per ASHRAE 62.1
- [ ] Climate data integration (pull weather data by location)
- [ ] Equipment sizing recommendations
- [ ] Energy efficiency calculations (EER, SEER)
- [ ] Duct sizing calculator

#### 3.2 Electrical Calculations
- [ ] Implement NEC Article 220 calculations
  - Total connected load by building type
  - Demand factors application
  - Branch circuit sizing
- [ ] Amperage calculations (single & 3-phase)
- [ ] Voltage drop calculations
- [ ] Panel schedule generator
- [ ] Conductor sizing per NEC Article 310

#### 3.3 Plumbing Calculations
- [ ] UPC fixture unit method for water supply
- [ ] Drainage fixture units (DFU) calculator
- [ ] Pipe sizing using Hunter Curve
- [ ] Water heater sizing
- [ ] Pressure loss calculations
- [ ] Backflow preventer selection

#### 3.4 Fire Protection Calculations
- [ ] NFPA 13 sprinkler demand calculations
- [ ] Hydrant flow requirements (NFPA 1142)
- [ ] Fire pump sizing (NFPA 20)
- [ ] Standpipe system calculations
- [ ] Occupancy hazard classification

#### 3.5 Analytics Dashboard
- [ ] Project statistics (total projects, by type, by status)
- [ ] Calculation history with version tracking
- [ ] Comparison tools (side-by-side project analysis)
- [ ] Export to PDF reports
- [ ] Data visualization (Chart.js integration)

#### 3.6 Calculation Modules
- Create `functions/calculations/` directory structure:
  ```
  functions/calculations/
  ├── hvac.js
  ├── electrical.js
  ├── plumbing.js
  ├── fire.js
  └── utils/
      ├── validation.js
      ├── conversion.js
      └── constants.js
  ```

**Effort Estimate**: 6-8 weeks  
**Priority**: High

---

## Phase 4: CAD Integration & Drawing Tools (Q2 2026)

### Objectives
Add 2D CAD-inspired drawing capabilities for creating simple MEP layouts.

### Features

#### 4.1 Drawing Canvas
- [ ] HTML5 Canvas-based drawing engine
- [ ] Pan & zoom controls
- [ ] Grid & snap-to-grid
- [ ] Layer management (architectural, HVAC, electrical, plumbing, fire)
- [ ] Drawing tools:
  - [ ] Line, rectangle, circle, polyline
  - [ ] Text annotations
  - [ ] Measurement tools
  - [ ] Symbols library (equipment, fixtures, devices)

#### 4.2 MEP Symbol Libraries
- [ ] HVAC: Diffusers, grilles, ductwork, equipment
- [ ] Electrical: Outlets, switches, panels, lights
- [ ] Plumbing: Fixtures, valves, pipes
- [ ] Fire: Sprinkler heads, pull stations, extinguishers

#### 4.3 Smart Objects
- [ ] Equipment objects with properties (BTU, watts, GPM)
- [ ] Auto-calculate loads from placed equipment
- [ ] Link drawing objects to calculation data
- [ ] Real-time updates when equipment changes

#### 4.4 Import/Export
- [ ] Import DWG/DXF files (via external library or service)
- [ ] Export to PDF/PNG
- [ ] Export to DXF (basic geometry)
- [ ] Import raster images as underlay (floor plans)

#### 4.5 Collaboration
- [ ] Real-time multi-user editing (Firestore-based)
- [ ] Cursor tracking for collaborators
- [ ] Change history & undo/redo
- [ ] Comments & markup tools

**Effort Estimate**: 10-12 weeks  
**Priority**: Medium-High

See [AUTOCAD_INTEGRATION.md](./AUTOCAD_INTEGRATION.md) for detailed CAD feature design.

---

## Phase 5: Advanced Features & Optimization (Q3 2026)

### Objectives
Add advanced engineering features, optimization tools, and mobile support.

### Features

#### 5.1 Optimization Engine
- [ ] Equipment selection optimizer (cost vs. efficiency)
- [ ] Energy modeling integration (DOE-2 or EnergyPlus wrapper)
- [ ] Load balancing for electrical panels
- [ ] Piping network optimization (shortest path, pressure balance)

#### 5.2 Code Compliance Checker
- [ ] Auto-check calculations against:
  - NEC (electrical)
  - ASHRAE 90.1 (energy)
  - UPC/IPC (plumbing)
  - NFPA (fire)
- [ ] Generate compliance reports
- [ ] Local code amendments (user-configurable)

#### 5.3 Collaboration & Review
- [ ] Project sharing (invite collaborators by email)
- [ ] Role-based permissions per project (owner, editor, viewer)
- [ ] Approval workflows (Designer → Engineer → Reviewer → Admin)
- [ ] Comments & issue tracking on projects
- [ ] Notification system (Firebase Cloud Messaging)

#### 5.4 Mobile App (Progressive Web App)
- [ ] Responsive design for tablets & phones
- [ ] Offline mode with IndexedDB caching
- [ ] Camera integration (photo uploads from site)
- [ ] QR code scanning (equipment tags)

#### 5.5 Integrations
- [ ] BIM integration (import/export IFC files)
- [ ] Autodesk Construction Cloud API
- [ ] Google Drive/Dropbox file sync
- [ ] Microsoft Teams notifications
- [ ] Zapier webhooks for custom workflows

**Effort Estimate**: 12-16 weeks  
**Priority**: Medium

---

## Phase 6: AI & Machine Learning (Q4 2026)

### Objectives
Leverage AI for intelligent design assistance and predictive analytics.

### Features

#### 6.1 AI-Powered Design Assistant
- [ ] Natural language input ("Design HVAC for 10,000 sq ft office")
- [ ] GPT-4 integration for design recommendations
- [ ] Auto-generate equipment schedules from requirements
- [ ] Suggest energy-efficient alternatives

#### 6.2 Machine Learning Models
- [ ] Load prediction models trained on historical data
- [ ] Equipment failure prediction (maintenance alerts)
- [ ] Anomaly detection in calculations
- [ ] Pattern recognition for similar projects

#### 6.3 Smart Autocomplete
- [ ] Predict user inputs based on project type
- [ ] Auto-fill common values (climate data, occupancy, etc.)
- [ ] Suggest typical equipment sizes

#### 6.4 Computer Vision
- [ ] Floor plan recognition from uploaded images
- [ ] Auto-trace walls, rooms from scanned drawings
- [ ] OCR for extracting dimensions from PDFs

**Effort Estimate**: 16-20 weeks  
**Priority**: Low (Innovation)

---

## Technical Debt & Maintenance

### Ongoing Tasks
- [ ] Migrate to TypeScript for type safety
- [ ] Add comprehensive unit tests (Jest)
- [ ] Implement E2E tests (Playwright)
- [ ] Set up CI/CD pipeline (GitHub Actions)
- [ ] Performance monitoring (Firebase Performance)
- [ ] Error tracking (Sentry or Firebase Crashlytics)
- [ ] Accessibility audit & fixes (WCAG 2.1 AA)
- [ ] Internationalization (i18n) for multi-language support
- [ ] Database backup automation
- [ ] Security audit & penetration testing

---

## Infrastructure Improvements

### Scalability
- [ ] Implement Cloud Functions caching (Redis)
- [ ] Add Cloud CDN for static assets
- [ ] Database sharding for large projects
- [ ] Implement rate limiting (Firebase App Check)

### DevOps
- [ ] Staging environment setup
- [ ] Blue-green deployment strategy
- [ ] Automated rollback on errors
- [ ] Load testing with k6 or Artillery

---

## Feature Requests (Community)

### High Demand
- [ ] Dark mode theme
- [ ] Keyboard shortcuts for power users
- [ ] Excel/CSV import for bulk data entry
- [ ] Gantt chart for project timelines
- [ ] Cost estimator integration (RSMeans data)

### Medium Demand
- [ ] Templates library (pre-configured projects)
- [ ] Custom calculation formulas (user-defined)
- [ ] Weather API integration (real-time conditions)
- [ ] Energy code compliance (Title 24, IECC)

### Low Demand
- [ ] 3D visualization (Three.js)
- [ ] VR/AR support for site walkthroughs
- [ ] Voice commands (Web Speech API)

---

## Competitive Analysis

### Competitors
- **Carrier HAP**: HVAC load calculations (desktop app)
- **Elite Software**: MEP suite (Windows-only)
- **eQuest**: Energy modeling (free, dated UI)
- **PipeFlow**: Plumbing calculations (standalone tool)

### Our Advantages
- ✅ **Cloud-Based**: No installation, accessible anywhere
- ✅ **Integrated**: All MEP systems in one platform
- ✅ **Collaborative**: Real-time multi-user editing
- ✅ **Modern UI**: Intuitive, mobile-friendly
- ✅ **Extensible**: Open API for custom integrations

### Gaps to Address
- ⚠️ Competitors have decades of formula refinement
- ⚠️ Desktop apps still preferred for complex projects
- ⚠️ Lack of advanced 3D modeling (vs. Revit, AutoCAD MEP)

**Strategy**: Focus on **ease of use**, **collaboration**, and **web-first** experience for small-to-medium projects. Partner with established tools for enterprise needs.

---

## Success Metrics

### Phase 3 (Real Calculations)
- **Goal**: 500 active users, 5,000 projects created
- **KPIs**:
  - Calculation accuracy validated by 10+ engineers
  - Average calculation time < 2 seconds
  - 80%+ user satisfaction (surveys)

### Phase 4 (CAD Integration)
- **Goal**: 1,000 active users, 50% using drawing tools
- **KPIs**:
  - 100+ symbols in library
  - Average drawing creation time < 30 minutes
  - 70%+ find drawing tools useful (survey)

### Phase 5 (Advanced Features)
- **Goal**: 2,500 active users, 20% paying subscribers
- **KPIs**:
  - 1,000+ projects with collaboration enabled
  - 50+ integrations active (API usage)
  - Revenue: $10K/month

### Phase 6 (AI Features)
- **Goal**: 5,000 active users, industry recognition
- **KPIs**:
  - AI assistant used in 40%+ projects
  - 90%+ AI recommendation acceptance rate
  - Featured in engineering publications

---

## Pricing Model (Future)

### Free Tier
- Up to 10 projects
- Basic calculations (placeholder limits)
- 100 MB file storage
- Community support

### Pro Tier ($29/month)
- Unlimited projects
- Real calculations with all formulas
- 10 GB file storage
- CAD drawing tools
- Priority support

### Team Tier ($99/month, up to 10 users)
- Everything in Pro
- Collaboration features
- Admin dashboard
- Audit logs
- Dedicated support

### Enterprise (Custom Pricing)
- Unlimited users
- Custom integrations
- On-premise deployment option
- SLA guarantees
- White-label branding

---

## Marketing & Go-to-Market

### Target Audience
- **Primary**: Small MEP engineering firms (1-20 employees)
- **Secondary**: Individual consulting engineers
- **Tertiary**: Architecture firms with in-house MEP

### Channels
- **Content Marketing**: Blog posts on MEP design best practices
- **SEO**: Target keywords "HVAC calculator", "electrical load calculation", etc.
- **Social Media**: LinkedIn posts, YouTube tutorials
- **Partnerships**: ASHRAE chapters, engineering associations
- **Paid Ads**: Google Ads for calculation-related searches

### Launch Strategy
- **Phase 3 Launch**: Beta program with 50 early adopters
- **Phase 4 Launch**: Public release, press release, trade show presence
- **Phase 5 Launch**: Freemium model, paid tiers introduced
- **Phase 6 Launch**: AI features as premium add-on

---

## Risk Assessment

### Technical Risks
- **Calculation Accuracy**: Mitigation → Validate with PE-certified engineers, reference implementations
- **Scalability**: Mitigation → Load testing, Cloud Functions quotas, database optimization
- **Security**: Mitigation → Regular audits, Firebase App Check, penetration testing

### Business Risks
- **Adoption**: Mitigation → Free tier, easy onboarding, compelling demos
- **Competition**: Mitigation → Focus on unique value (cloud, collaboration, modern UX)
- **Regulatory**: Mitigation → Ensure calculations meet code requirements, provide disclaimers

### Operational Risks
- **Team Capacity**: Mitigation → Hire contractors for specialized features (CAD, AI)
- **Maintenance Burden**: Mitigation → Automated testing, CI/CD, monitoring
- **Support Load**: Mitigation → Knowledge base, chatbot, tiered support model

---

## Long-Term Vision (2027+)

- **Industry Standard**: Become the go-to platform for cloud-based MEP design
- **Ecosystem**: Marketplace for third-party plugins & templates
- **Education**: Partner with universities for MEP engineering curriculum
- **Global Reach**: Multi-language support, international code compliance
- **Sustainability**: Carbon footprint calculator, green building certifications (LEED, WELL)

---

## Conclusion

MEP Flow Designer is positioned to disrupt traditional MEP software by offering a **modern, collaborative, cloud-first** experience. By incrementally adding real calculations, CAD tools, and AI features, we can capture market share from desktop incumbents while serving the next generation of engineers.

**Next Milestone**: Complete Phase 3 real calculations by Q1 2026. 🚀

