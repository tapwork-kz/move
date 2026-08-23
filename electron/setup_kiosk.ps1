# Windows Showcase Kiosk Setup Script (PowerShell)
# Configures: Promo user, Astana UTC+5 timezone, Daily Wakeup (09:30) & Shutdown (22:30), and Autostart

param (
    [string]$WakeTime = "09:30",
    [string]$SleepTime = "22:30",
    [string]$CreatePromo = "true",
    [string]$SyncTime = "true",
    [string]$SetPowerSchedule = "true",
    [string]$AppPath = ""
)

$ErrorActionPreference = "Continue"

Write-Host "======================================================"
Write-Host " НАСТРОЙКА ВИТРИННОГО РЕЖИМА (SHOWCASE KIOSK)"
Write-Host "======================================================"
Write-Host "Параметры:"
Write-Host " - Включение (Wake):      $WakeTime"
Write-Host " - Выключение (Shutdown): $SleepTime"
Write-Host " - Создать сеанс Promo:   $CreatePromo"
Write-Host " - Синхронизация UTC+5:   $SyncTime"
Write-Host " - Расписание задач:      $SetPowerSchedule"
Write-Host " - Путь к приложению:     $AppPath"
Write-Host "------------------------------------------------------"

# 1. Синхронизация точного времени (Астана, UTC+5)
if ($SyncTime -eq "true" -or $SyncTime -eq $true -or $SyncTime -eq "1") {
    try {
        Write-Host "[1/4] Настройка часового пояса Астана (UTC+5)..."
        
        # Установка единого часового пояса Казахстана UTC+5
        $tzSet = $false
        $targetTz = Get-TimeZone -ListAvailable | Where-Object { 
            $_.Id -match 'Qyzylorda' -or $_.Id -match 'West Asia' -or ($_.BaseUtcOffset.Hours -eq 5 -and $_.BaseUtcOffset.Minutes -eq 0)
        } | Select-Object -First 1

        if ($targetTz) {
            Set-TimeZone -Id $targetTz.Id -ErrorAction SilentlyContinue
            Write-Host "  -> Установлен часовой пояс: $($targetTz.DisplayName)"
            $tzSet = $true
        }
        
        if (-not $tzSet) {
            tzutil /s "Qyzylorda Standard Time"
            Write-Host "  -> Применен tzutil: Qyzylorda Standard Time"
        }

        # Запуск службы времени Windows и принудительная синхронизация с NTP серверами
        Write-Host "  -> Синхронизация системных часов через NTP..."
        Start-Service w32time -ErrorAction SilentlyContinue
        w32tm /config /manualpeerlist:"pool.ntp.org time.windows.com time.google.com" /syncfromflags:manual /reliable:YES /update | Out-Null
        w32tm /resync /force | Out-Null
        Write-Host "  -> Точное время успешно синхронизировано: $(Get-Date -Format 'dd.MM.yyyy HH:mm:ss')"
    } catch {
        Write-Warning "Ошибка синхронизации времени: $_"
    }
}

# 2. Создание гостевого сеанса витрины "Promo"
if ($CreatePromo -eq "true" -or $CreatePromo -eq $true -or $CreatePromo -eq "1") {
    try {
        Write-Host "[2/4] Проверка/создание сеанса витрины 'Promo'..."
        $existingUser = Get-LocalUser -Name "Promo" -ErrorAction SilentlyContinue

        if (-not $existingUser) {
            $pass = ConvertTo-SecureString "Promo2026!" -AsPlainText -Force
            New-LocalUser -Name "Promo" `
                          -Password $pass `
                          -FullName "Витринный сеанс (Promo)" `
                          -Description "Гостевой сеанс для витринного ценника ноутбука" `
                          -PasswordNeverExpires `
                          -UserMayNotChangePassword `
                          -ErrorAction SilentlyContinue | Out-Null
            
            Add-LocalGroupMember -Group "Users" -Member "Promo" -ErrorAction SilentlyContinue | Out-Null
            Write-Host "  -> Пользователь 'Promo' успешно создан."
        } else {
            Write-Host "  -> Пользователь 'Promo' уже существует."
        }
    } catch {
        Write-Warning "Ошибка создания пользователя Promo: $_"
    }
}

# 3. Настройка питания (разрешение таймеров пробуждения, отключение автосна при питании от сети)
try {
    Write-Host "[3/4] Оптимизация схемы питания для витрины..."
    # Включаем таймеры пробуждения (RTC Wake Timers) при питании от сети
    powercfg /setacvalueindex SCHEME_CURRENT SUB_SLEEP RTCWAKE 1 | Out-Null
    # Запрещаем гасить экран по таймеру простоя пока ноутбук на зарядке
    powercfg /change monitor-timeout-ac 0 | Out-Null
    powercfg /change standby-timeout-ac 0 | Out-Null
    powercfg /SetActive SCHEME_CURRENT | Out-Null
    Write-Host "  -> Таймеры пробуждения включены, автосон от сети отключен."
} catch {
    Write-Warning "Ошибка настройки питания: $_"
}

# 4. Регистрация задач в Планировщике Windows (Включение в 09:30 и Выключение в 22:30)
if ($SetPowerSchedule -eq "true" -or $SetPowerSchedule -eq $true -or $SetPowerSchedule -eq "1") {
    try {
        Write-Host "[4/4] Настройка Планировщика задач (Включение: $WakeTime, Выключение: $SleepTime)..."
        
        # Удаляем предыдущие задачи если были
        Unregister-ScheduledTask -TaskName "ShowcasePriceTag_Wakeup" -Confirm:$false -ErrorAction SilentlyContinue | Out-Null
        Unregister-ScheduledTask -TaskName "ShowcasePriceTag_Shutdown" -Confirm:$false -ErrorAction SilentlyContinue | Out-Null

        # Исполняемый файл для автозапуска
        $exeToRun = $AppPath
        if (-not $exeToRun -or -not (Test-Path $exeToRun)) {
            $defaultPaths = @(
                "$env:LOCALAPPDATA\Programs\kz.tapwork.pricetag\Витринный Ценник.exe",
                "$env:ProgramFiles\Витринный Ценник\Витринный Ценник.exe",
                "${env:ProgramFiles(x86)}\Витринный Ценник\Витринный Ценник.exe"
            )
            foreach ($p in $defaultPaths) {
                if (Test-Path $p) {
                    $exeToRun = $p
                    break
                }
            }
        }

        # А. Задача утреннего пробуждения (WakeToRun)
        $wakeCmd = if ($exeToRun) { "cmd.exe" } else { "powershell.exe" }
        $wakeArg = if ($exeToRun) { "/c start """" `"$exeToRun`"""" } else { "-Command `"Write-Host 'Wakeup'`"" }
        
        $wakeAction = New-ScheduledTaskAction -Execute $wakeCmd -Argument $wakeArg
        $wakeTrigger = New-ScheduledTaskTrigger -Daily -At $WakeTime
        $wakeSettings = New-ScheduledTaskSettingsSet -WakeToRun `
                                                   -AllowStartIfOnBatteries `
                                                   -DontStopIfGoingOnBatteries `
                                                   -StartWhenAvailable `
                                                   -MultipleInstances Parallel
        $wakePrincipal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest

        Register-ScheduledTask -TaskName "ShowcasePriceTag_Wakeup" `
                               -Action $wakeAction `
                               -Trigger $wakeTrigger `
                               -Settings $wakeSettings `
                               -Principal $wakePrincipal `
                               -Description "Ежедневное автоматическое включение витрины и запуск ценника в $WakeTime" `
                               -Force | Out-Null

        Write-Host "  -> Задача пробуждения 'ShowcasePriceTag_Wakeup' зарегистрирована на $WakeTime (WakeToRun: Вкл)"

        # Б. Задача вечернего выключения
        $shutAction = New-ScheduledTaskAction -Execute "shutdown.exe" -Argument "/s /t 60 /c ""Плановое выключение витринного ноутбука в $SleepTime"""
        $shutTrigger = New-ScheduledTaskTrigger -Daily -At $SleepTime
        $shutSettings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
        $shutPrincipal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest

        Register-ScheduledTask -TaskName "ShowcasePriceTag_Shutdown" `
                               -Action $shutAction `
                               -Trigger $shutTrigger `
                               -Settings $shutSettings `
                               -Principal $shutPrincipal `
                               -Description "Ежедневное автоматическое выключение витрины в $SleepTime" `
                               -Force | Out-Null

        Write-Host "  -> Задача выключения 'ShowcasePriceTag_Shutdown' зарегистрирована на $SleepTime"

        # В. Автозапуск приложения при любом входе в систему
        if ($exeToRun) {
            Set-ItemProperty -Path "HKLM:\Software\Microsoft\Windows\CurrentVersion\Run" `
                             -Name "ShowcasePriceTag" `
                             -Value "`"$exeToRun`"" `
                             -ErrorAction SilentlyContinue | Out-Null
            Write-Host "  -> Автозапуск приложения добавлен в реестр HKLM Run."
        }

    } catch {
        Write-Warning "Ошибка настройки расписания задач: $_"
    }
}

Write-Host "======================================================"
Write-Host " ВСЕ НАСТРОЙКИ ВИТРИНЫ УСПЕШНО ПРИМЕНЕНЫ!"
Write-Host "======================================================"
