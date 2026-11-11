/**
 * Script de generación de evidencia visual para el Hub de Proyectos & Entregables (#proyectos).
 * Ejecuta Microsoft Edge en modo headless a través del protocolo Chrome DevTools (CDP)
 * sin dependencias externas (offline-first nativo), capturando capturas PNG en las 3 vistas
 * (Kanban, Bento, Lista) a lo largo de 6 resoluciones responsive (320, 390, 768, 1440, 1920 y 2560 px).
 */

const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const {
  CDPClient,
  getJson,
  wait,
  resolveEdgePath,
  getFreePort,
  waitForTarget,
  waitForPage
} = require('../tools/text-layout/scripts/text-layout-browser-engine.cjs');

const VIEWPORTS = [
  { width: 320, height: 800, label: '320px', name: '320' },
  { width: 390, height: 844, label: '390px', name: '390' },
  { width: 768, height: 1024, label: '768px', name: '768' },
  { width: 1440, height: 900, label: '1440px', name: '1440' },
  { width: 1920, height: 1080, label: '1920px', name: '1920' },
  { width: 2560, height: 1440, label: '2560px', name: '2560' }
];

const VIEWS = [
  { id: 'kanban', label: 'kanban', title: 'Tablero Kanban' },
  { id: 'bento', label: 'bento', title: 'Galería Bento' },
  { id: 'list', label: 'lista', title: 'Lista Compacta' }
];

async function captureProjectsHubVisuals(rootDir = path.resolve(__dirname, '..')) {
  const edgePath = resolveEdgePath();
  if (!edgePath) {
    throw new Error('No se encontró Microsoft Edge en las rutas estándar de Windows.');
  }

  const outDir = path.join(rootDir, 'docs', 'visual-evidence', 'projects-hub');
  fs.mkdirSync(outDir, { recursive: true });

  const port = await getFreePort();
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'edge-visual-evidence-'));

  console.log(`Iniciando Microsoft Edge Headless en puerto ${port}...`);
  const browser = spawn(edgePath, [
    `--remote-debugging-port=${port}`,
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${userDataDir}`,
    '--disable-background-networking',
    '--disable-sync',
    '--disable-component-update',
    '--disable-default-apps',
    '--allow-file-access-from-files',
    '--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1',
    'about:blank'
  ], { stdio: 'ignore', windowsHide: true });

  let cdp = null;
  const manifest = {
    generatedAt: new Date().toISOString(),
    project: 'capacitacion-ia',
    component: '#proyectos (Hub de Proyectos & Entregables)',
    totalScreenshots: 0,
    screenshots: []
  };

  try {
    await waitForTarget(port, 40);
    const tabs = await getJson(`http://127.0.0.1:${port}/json/list`);
    const tab = tabs.find(item => item.type === 'page');
    if (!tab || !tab.webSocketDebuggerUrl) {
      throw new Error('Microsoft Edge no publicó pestaña de depuración.');
    }

    cdp = new CDPClient(tab.webSocketDebuggerUrl);
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('Network.enable');

    const indexPath = path.join(rootDir, 'index.html');
    const targetUrl = pathToFileURL(indexPath).href;
    console.log(`Navegando a: ${targetUrl}`);
    await cdp.send('Page.navigate', { url: targetUrl });
    await waitForPage(cdp, 120, targetUrl);

    // Activar la vista #proyectos
    await cdp.evaluate(`(() => {
      if (typeof window.switchPage === 'function') {
        window.switchPage('proyectos');
      }
      window.location.hash = 'proyectos';
      const el = document.getElementById('proyectos');
      if (el) {
        el.classList.add('active');
        el.scrollIntoView();
      }
      return true;
    })()`);
    await wait(300);

    for (const view of VIEWS) {
      console.log(`\nConfigurando vista: ${view.title} (${view.id})...`);
      await cdp.evaluate(`((viewId) => {
        if (window.projectsHubInstance && typeof window.projectsHubInstance.setViewMode === 'function') {
          window.projectsHubInstance.setViewMode(viewId);
        }
      })('${view.id}')`);
      await wait(200);

      for (const vp of VIEWPORTS) {
        process.stdout.write(`  Capturando ${view.label} @ ${vp.label}... `);
        await cdp.send('Emulation.setDeviceMetricsOverride', {
          width: vp.width,
          height: vp.height,
          deviceScaleFactor: 1,
          mobile: vp.width < 640
        });
        await cdp.send('Emulation.setPageScaleFactor', { pageScaleFactor: 1 });
        await cdp.evaluate('window.scrollTo(0, 0)');
        await wait(250);

        const { data } = await cdp.send('Page.captureScreenshot', { format: 'png' });
        const fileName = `${view.label}-${vp.label}.png`;
        const filePath = path.join(outDir, fileName);
        const buffer = Buffer.from(data, 'base64');
        fs.writeFileSync(filePath, buffer);

        manifest.screenshots.push({
          fileName,
          view: view.id,
          viewLabel: view.title,
          viewportWidth: vp.width,
          viewportHeight: vp.height,
          viewportLabel: vp.label,
          fileSizeBytes: buffer.length
        });
        manifest.totalScreenshots += 1;
        console.log(`OK (${(buffer.length / 1024).toFixed(1)} KB)`);
      }
    }

    const manifestPath = path.join(outDir, 'manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
    console.log(`\nManifiesto de evidencia guardado en: ${manifestPath}`);
    console.log(`Total capturas generadas: ${manifest.totalScreenshots}`);
    return manifest;
  } finally {
    if (cdp) cdp.close();
    browser.kill();
    try {
      fs.rmSync(userDataDir, { recursive: true, force: true });
    } catch {
      // Ignorar fallo de limpieza temporal
    }
  }
}

if (require.main === module) {
  captureProjectsHubVisuals()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Error generando evidencias visuales:', err);
      process.exit(1);
    });
}

module.exports = { captureProjectsHubVisuals, VIEWPORTS, VIEWS };
