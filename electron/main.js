const { app, BrowserWindow, ipcMain, screen, powerSaveBlocker } = require('electron');
const path = require('path');
const os = require('os');
const { exec } = require('child_process');

let mainWindow = null;
let powerBlockerId = null;

function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  mainWindow = new BrowserWindow({
    width: width || 1280,
    height: height || 800,
    fullscreen: true,
    autoHideMenuBar: true,
    title: 'Витринный ценник — Мониторинг Промо',
    icon: path.join(__dirname, '../public/favicon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false
    }
  });

  // Prevent display sleep while price tag is running on showcase
  try {
    powerBlockerId = powerSaveBlocker.start('prevent-display-sleep');
  } catch (e) {
    console.error('Power blocker error:', e);
  }

  // Load URL or build
  const isDev = !app.isPackaged && process.env.NODE_ENV !== 'production';
  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'), {
      hash: 'showcase'
    });
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
    if (powerBlockerId !== null && powerSaveBlocker.isStarted(powerBlockerId)) {
      powerSaveBlocker.stop(powerBlockerId);
    }
  });
}

// System Hardware Specs Detection via Windows WMI / PowerShell / Node OS
ipcMain.handle('get-system-specs', async () => {
  return new Promise((resolve) => {
    const isWindows = process.platform === 'win32';
    const primaryDisplay = screen.getPrimaryDisplay();
    const resolution = `${primaryDisplay.size.width} x ${primaryDisplay.size.height}`;
    
    // Basic Node OS detection
    const totalRamGB = Math.round(os.totalmem() / (1024 * 1024 * 1024));
    const cpus = os.cpus();
    const cpuModel = cpus && cpus.length > 0 ? cpus[0].model.trim() : 'Intel Core Processor';
    
    let specs = {
      cpu: cpuModel,
      ram: `${totalRamGB} GB`,
      resolution: resolution,
      disk: '512 GB SSD',
      gpu: 'Intel(R) UHD Graphics',
      os: 'Microsoft Windows 11 Pro'
    };

    if (!isWindows) {
      if (process.platform === 'darwin') specs.os = 'macOS';
      else specs.os = 'Linux OS';
      return resolve(specs);
    }

    // PowerShell query on Windows for exact hardware names
    const psCmd = `powershell -NoProfile -Command "
      $cpu = (Get-CimInstance Win32_Processor | Select-Object -First 1 -ExpandProperty Name);
      $ram = [math]::Round((Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory / 1GB);
      $gpu = (Get-CimInstance Win32_VideoController | Select-Object -First 1 -ExpandProperty Name);
      $os = (Get-CimInstance Win32_OperatingSystem).Caption;
      $disk = (Get-CimInstance Win32_DiskDrive | Select-Object -First 1);
      $diskGB = if ($disk) { [math]::Round($disk.Size / 1GB) } else { 512 };
      @{ cpu=$cpu; ram=$ram; gpu=$gpu; os=$os; disk=$diskGB } | ConvertTo-Json
    "`;

    exec(psCmd, { timeout: 4000 }, (error, stdout) => {
      if (!error && stdout) {
        try {
          const parsed = JSON.parse(stdout.trim());
          if (parsed.cpu) specs.cpu = parsed.cpu;
          if (parsed.ram) specs.ram = `${parsed.ram} GB`;
          if (parsed.gpu) specs.gpu = parsed.gpu;
          if (parsed.os) specs.os = parsed.os;
          if (parsed.disk) specs.disk = `${parsed.disk} GB SSD`;
        } catch (e) {
          console.error('PowerShell parse error:', e);
        }
      }
      resolve(specs);
    });
  });
});

ipcMain.handle('toggle-fullscreen', () => {
  if (mainWindow) {
    const isFull = mainWindow.isFullScreen();
    mainWindow.setFullScreen(!isFull);
    return !isFull;
  }
  return false;
});

ipcMain.handle('quit-app', () => {
  app.quit();
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
