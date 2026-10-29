import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.resolve(__dirname, '../client/dist');
const indexPath = path.join(distDir, 'index.html');

if (!fs.existsSync(indexPath)) {
  console.error('Error: client/dist/index.html does not exist. Run vite build first.');
  process.exit(1);
}

const indexHtml = fs.readFileSync(indexPath, 'utf8');

// List of all SPA routes to generate physical index.html files for
const spaRoutes = [
  'login',
  'register',
  'forgot-password',
  'resources',
  'about',
  'contact',
  'help',
  'dashboard',
  'my-bookings',
  'notifications',
  'profile',
  'settings',
  'owner',
  'owner/resources',
  'owner/requests',
  'owner/availability',
  'owner/reports',
  'admin',
  'admin/users',
  'admin/resources',
  'admin/bookings',
  'admin/incidents',
  'admin/audit-logs',
  'resources/1',
  'resources/2',
  'resources/3',
  'resources/4',
  'resources/5',
  'resources/6',
  'resources/7',
  'resources/8'
];

console.log('[SPA Route Generator] Creating static route entrypoints in dist...');

for (const route of spaRoutes) {
  const routeDir = path.join(distDir, route);
  if (!fs.existsSync(routeDir)) {
    fs.mkdirSync(routeDir, { recursive: true });
  }
  fs.writeFileSync(path.join(routeDir, 'index.html'), indexHtml, 'utf8');
}

// Write 404.html fallback
fs.writeFileSync(path.join(distDir, '404.html'), indexHtml, 'utf8');

console.log(`✓ Successfully generated ${spaRoutes.length} SPA route entrypoints + 404.html!`);
