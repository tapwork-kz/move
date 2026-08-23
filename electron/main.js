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

// Apply Kiosk Power Schedule, Promo User, and Timezone via PowerShell
ipcMain.handle('apply-kiosk-schedule', async (event, config = {}) => {
  return new Promise((resolve) => {
    if (process.platform !== 'win32') {
      return resolve({ success: true, message: 'Настройки сохранены (эмуляция для не-Windows среды)' });
    }

    const wakeTime = config.wakeTime || '09:30';
    const sleepTime = config.sleepTime || '22:30';
    const createPromo = config.createPromo !== false;
    const syncTime = config.syncTime !== false;
    const setSchedule = config.setSchedule !== false;
    const exePath = app.getPath('exe');

    const scriptPath = path.join(__dirname, 'setup_kiosk.ps1');
    const psCmd = `powershell -NoProfile -ExecutionPolicy Bypass -File "${scriptPath}" -WakeTime "${wakeTime}" -SleepTime "${sleepTime}" -CreatePromo "${createPromo}" -SyncTime "${syncTime}" -SetPowerSchedule "${setSchedule}" -AppPath "${exePath}"`;

    exec(psCmd, { timeout: 15000 }, (error, stdout, stderr) => {
      if (error) {
        console.error('Kiosk setup error:', error, stderr);
        return resolve({ success: false, error: stderr || error.message });
      }
      resolve({ success: true, output: stdout });
    });
  });
});

// Force Sync Time to Astana UTC+5
ipcMain.handle('sync-astana-time', async () => {
  return new Promise((resolve) => {
    if (process.platform !== 'win32') {
      return resolve({ success: true, message: 'Время синхронизировано' });
    }

    const psCmd = `powershell -NoProfile -Command "
      tzutil /s 'Qyzylorda Standard Time';
      Start-Service w32time -ErrorAction SilentlyContinue;
      w32tm /config /manualpeerlist:'pool.ntp.org time.windows.com time.google.com' /syncfromflags:manual /reliable:YES /update | Out-Null;
      w32tm /resync /force | Out-Null;
      (Get-Date).ToString('dd.MM.yyyy HH:mm:ss')
    "`;

    exec(psCmd, { timeout: 10000 }, (error, stdout) => {
      if (error) {
        return resolve({ success: false, error: error.message });
      }
      resolve({ success: true, time: stdout.trim() });
    });
  });
});

// Get Kiosk Schedule Status
ipcMain.handle('get-kiosk-status', async () => {
  return new Promise((resolve) => {
    if (process.platform !== 'win32') {
      return resolve({
        isWindows: false,
        wakeTime: '09:30',
        sleepTime: '22:30',
        timezone: 'UTC+5 (Astana)',
        hasPromoUser: true
      });
    }

    const psCmd = `powershell -NoProfile -Command "
      $tz = (Get-TimeZone).DisplayName;
      $wake = (Get-ScheduledTask -TaskName 'ShowcasePriceTag_Wakeup' -ErrorAction SilentlyContinue);
      $shut = (Get-ScheduledTask -TaskName 'ShowcasePriceTag_Shutdown' -ErrorAction SilentlyContinue);
      $user = (Get-LocalUser -Name 'Promo' -ErrorAction SilentlyContinue);
      @{ 
        timezone = $tz; 
        hasWakeTask = [bool]$wake; 
        hasShutTask = [bool]$shut; 
        hasPromoUser = [bool]$user;
        currentTime = (Get-Date).ToString('HH:mm:ss')
      } | ConvertTo-Json
    "`;

    exec(psCmd, { timeout: 5000 }, (error, stdout) => {
      if (!error && stdout) {
        try {
          const parsed = JSON.parse(stdout.trim());
          return resolve({ isWindows: true, ...parsed });
        } catch (e) {}
      }
      resolve({ isWindows: true, timezone: 'UTC+05:00', hasWakeTask: false, hasShutTask: false });
    });
  });
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
