const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Find best source image
const candidateImages = [
  path.join(__dirname, '../src/assets/images/marketbd_new_logo_1786193246085.jpg'),
  path.join(__dirname, '../src/assets/images/marketbd_tight_logo_1786193572191.jpg'),
  path.join(__dirname, '../public/logo.jpg'),
  path.join(__dirname, '../public/favicon.jpg')
];

let sourceImagePath = null;
for (const cand of candidateImages) {
  if (fs.existsSync(cand)) {
    sourceImagePath = cand;
    break;
  }
}

if (!sourceImagePath) {
  console.error('Source image not found!');
  process.exit(1);
}

console.log('Using source image:', sourceImagePath);

const resDir = path.join(__dirname, '../android/app/src/main/res');

const densities = [
  { name: 'mipmap-mdpi', launcherSize: 48, fgSize: 108 },
  { name: 'mipmap-hdpi', launcherSize: 72, fgSize: 162 },
  { name: 'mipmap-xhdpi', launcherSize: 96, fgSize: 216 },
  { name: 'mipmap-xxhdpi', launcherSize: 144, fgSize: 324 },
  { name: 'mipmap-xxxhdpi', launcherSize: 192, fgSize: 432 }
];

async function generate() {
  // Ensure directories
  for (const d of densities) {
    const targetDir = path.join(resDir, d.name);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
  }

  const anyDpiDir = path.join(resDir, 'mipmap-anydpi-v26');
  if (!fs.existsSync(anyDpiDir)) {
    fs.mkdirSync(anyDpiDir, { recursive: true });
  }

  const drawableDir = path.join(resDir, 'drawable');
  if (!fs.existsSync(drawableDir)) {
    fs.mkdirSync(drawableDir, { recursive: true });
  }

  const valuesDir = path.join(resDir, 'values');
  if (!fs.existsSync(valuesDir)) {
    fs.mkdirSync(valuesDir, { recursive: true });
  }

  // Create colors.xml
  const colorsXml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#090F1E</color>
    <color name="colorPrimary">#059669</color>
    <color name="colorPrimaryDark">#047857</color>
    <color name="colorAccent">#10B981</color>
    <color name="windowBackground">#090F1E</color>
</resources>
`;
  fs.writeFileSync(path.join(valuesDir, 'colors.xml'), colorsXml);

  // Create strings.xml
  const stringsXml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">MarketBD</string>
</resources>
`;
  fs.writeFileSync(path.join(valuesDir, 'strings.xml'), stringsXml);

  // Create drawable/ic_launcher_background.xml
  const bgXml = `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <path
        android:fillColor="#090F1E"
        android:pathData="M0,0h108v108h-108z" />
</vector>
`;
  fs.writeFileSync(path.join(drawableDir, 'ic_launcher_background.xml'), bgXml);

  // Create mipmap-anydpi-v26/ic_launcher.xml
  const anyDpiLauncherXml = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@drawable/ic_launcher_background" />
    <foreground android:drawable="@mipmap/ic_launcher_foreground" />
</adaptive-icon>
`;
  fs.writeFileSync(path.join(anyDpiDir, 'ic_launcher.xml'), anyDpiLauncherXml);
  fs.writeFileSync(path.join(anyDpiDir, 'ic_launcher_round.xml'), anyDpiLauncherXml);

  for (const d of densities) {
    const targetDir = path.join(resDir, d.name);

    // 1. Standard square/rounded icon with dark navy padding & subtle radius
    const size = d.launcherSize;
    const cornerRadius = Math.round(size * 0.22);
    
    // Create base rounded launcher icon
    const roundedMask = Buffer.from(
      `<svg><rect x="0" y="0" width="${size}" height="${size}" rx="${cornerRadius}" ry="${cornerRadius}" fill="#fff"/></svg>`
    );

    const logoInnerSize = Math.round(size * 0.82);
    const logoResized = await sharp(sourceImagePath)
      .resize(logoInnerSize, logoInnerSize, { fit: 'contain', background: { r: 9, g: 15, b: 30, alpha: 0 } })
      .toBuffer();

    const launcherWithBg = await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 9, g: 15, b: 30, alpha: 1 }
      }
    })
      .composite([{ input: logoResized, gravity: 'center' }])
      .composite([{ input: roundedMask, blend: 'dest-in' }])
      .png()
      .toFile(path.join(targetDir, 'ic_launcher.png'));

    // 2. Round icon (for circle launchers)
    const circleMask = Buffer.from(
      `<svg><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#fff"/></svg>`
    );

    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 9, g: 15, b: 30, alpha: 1 }
      }
    })
      .composite([{ input: logoResized, gravity: 'center' }])
      .composite([{ input: circleMask, blend: 'dest-in' }])
      .png()
      .toFile(path.join(targetDir, 'ic_launcher_round.png'));

    // 3. Foreground icon for Adaptive Icons (108dp canvas, ~72dp safe zone in center)
    const fgSize = d.fgSize;
    const innerFgSize = Math.round(fgSize * 0.65);
    const fgLogo = await sharp(sourceImagePath)
      .resize(innerFgSize, innerFgSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toBuffer();

    await sharp({
      create: {
        width: fgSize,
        height: fgSize,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
      .composite([{ input: fgLogo, gravity: 'center' }])
      .png()
      .toFile(path.join(targetDir, 'ic_launcher_foreground.png'));

    console.log(`Generated icons for ${d.name} (${size}x${size}, fg: ${fgSize}x${fgSize})`);
  }

  console.log('All Android Launcher Icons generated successfully!');
}

generate().catch(err => {
  console.error(err);
  process.exit(1);
});
