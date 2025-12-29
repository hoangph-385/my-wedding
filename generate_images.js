const fs = require('fs');
const path = require('path');

// Usage: node generate_images.js [folder]
// If folder provided (e.g., "src"), scans that folder and writes prefixed paths to images.json at project root.
const folderArg = process.argv[2] || '';
const targetDir = folderArg ? path.join(__dirname, folderArg) : __dirname;
const outFile = path.join(__dirname, 'images.json');

if (!fs.existsSync(targetDir)) {
  console.error(`Target directory not found: ${targetDir}`);
  process.exit(1);
}

fs.readdir(targetDir, (err, files) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  const imgs = files
    .filter(f => /\.(jpe?g|png|gif)$/i.test(f))
    .sort((a,b) => a.localeCompare(b, undefined, {numeric:true, sensitivity:'base'}));

  // Build output paths: if folderArg provided, prefix each filename with folderArg/filename
  const prefix = folderArg ? folderArg.replace(/\\\\/g, '/').replace(/\\$/,'') : '';
  const outList = imgs.map(f => prefix ? path.posix.join(prefix, f) : f);

  fs.writeFileSync(outFile, JSON.stringify(outList, null, 2), 'utf8');
  console.log(`Wrote ${outList.length} images to ${outFile}`);

  // Also write a small JS file that embeds the list so static hosting can load it directly
  const genFile = path.join(__dirname, 'generated-images.js');
  const genContent = `window.__IMAGES_GENERATED = ${JSON.stringify(outList, null, 2)};\n`;
  fs.writeFileSync(genFile, genContent, 'utf8');
  console.log(`Wrote embedded manifest to ${genFile}`);
});
