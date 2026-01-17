const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

if (process.env.EAS_BUILD === 'true') {
    console.log('🚀 [EAS HOOKS] Starting build-time fixes...');

    try {
        const iosPath = path.join(process.cwd(), 'ios');

        // 1. Build web assets
        console.log('📦 [1/3] Building web assets...');
        execSync('npm run build', { stdio: 'inherit' });

        // 2. Handle iOS platform (Add or Sync)
        console.log('🍎 [2/3] Preparing iOS platform...');

        if (fs.existsSync(iosPath)) {
            console.log('ℹ️ iOS folder already exists. Checking content...');
            // If it exists, we sync. Sync is more reliable for existing folders.
            try {
                execSync('npx cap sync ios', { stdio: 'inherit' });
            } catch (e) {
                console.log('⚠️ Sync failed, attempting to add instead...');
                execSync('npx cap add ios', { stdio: 'inherit' });
            }
        } else {
            console.log('✨ iOS folder not found. Adding fresh platform...');
            execSync('npx cap add ios', { stdio: 'inherit' });
        }

        // 3. Patch Podfile
        const podfilePath = path.join(iosPath, 'App', 'Podfile');
        console.log(`🔍 [3/3] Looking for Podfile at: ${podfilePath}`);

        if (fs.existsSync(podfilePath)) {
            let content = fs.readFileSync(podfilePath, 'utf8');
            if (!content.includes('use_modular_headers!')) {
                console.log('💉 Injecting use_modular_headers! into Podfile...');
                content = "use_modular_headers!\n" + content;
                fs.writeFileSync(podfilePath, content);
                console.log('✅ Podfile patched successfully.');
            } else {
                console.log('ℹ️ Podfile already patched.');
            }
        } else {
            console.error('❌ CRITICAL ERROR: Podfile not found after sync/add. Listing directory...');
            try {
                const files = execSync('find ios -maxdepth 3', { encoding: 'utf8' });
                console.log(files);
            } catch (e) { }
        }

        console.log('🏁 [EAS HOOKS] Finished successfully.');
    } catch (error) {
        console.error('💥 [EAS HOOKS] FATAL ERROR:', error.message);
        if (error.stdout) console.log('STDOUT:', error.stdout.toString());
        if (error.stderr) console.error('STDERR:', error.stderr.toString());
        process.exit(1);
    }
} else {
    console.log('🏠 [EAS HOOKS] Local environment. Skipping.');
}
