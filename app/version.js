/**
 * CCA-2 Application Version Configuration
 * 
 * PHASE 6 INSTRUCTIONS:
 * For Phase 6 demo:
 * 1. For Build #1: Keep APP_VERSION as 'Version 1.0 - Hello World'
 * 2. For Build #2: Change APP_VERSION to 'Version 2.0 - CI/CD Updated!'
 * 3. Commit and push to trigger automated Jenkins pipeline.
 */

const APP_VERSION = 'Version 2.0 - CI/CD Updated!';
// const APP_VERSION = 'Version 2.0 - CI/CD Updated!'; // Uncomment for Phase 6 Demo!

const BUILD_METADATA = {
    course: 'Cloud Computing & DevOps (CCA-2)',
    institution: 'MIT World Peace University (MIT-WPU)',
    author: 'Aryan',
    releaseChannel: 'Production',
    nodePort: 30080
};

module.exports = {
    APP_VERSION,
    BUILD_METADATA
};
