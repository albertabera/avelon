const fs = require('fs');
const path = require('path');

const podfilePath = path.join(process.cwd(), 'ios', 'App', 'Podfile');

console.log('Checking for Podfile at:', podfilePath);

if (fs.existsSync(podfilePath)) {
    let content = fs.readFileSync(podfilePath, 'utf8');
    if (!content.includes('use_modular_headers!')) {
        // Insert use_modular_headers! at the top
        content = "use_modular_headers!\n" + content;
        fs.writeFileSync(podfilePath, content);
        console.log('Successfully patched Podfile with use_modular_headers!');
    } else {
        console.log('Podfile already contains use_modular_headers!.');
    }
} else {
    console.error('Error: Podfile not found at ' + podfilePath);
    process.exit(1);
}
