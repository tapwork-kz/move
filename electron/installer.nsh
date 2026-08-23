; Custom NSIS Installer Script for Showcase Price Tag (Kiosk Mode Setup)

!include "nsDialogs.nsh"
!include "LogicLib.nsh"

Var ShowcaseDialog
Var HwndSyncTimezone
Var HwndCreatePromo
Var HwndSetSchedule
Var HwndWakeTime
Var HwndSleepTime

!macro customPage
  Page custom ShowcaseKioskPage ShowcaseKioskPageLeave
!macroend

Function ShowcaseKioskPage
  !insertmacro MUI_HEADER_TEXT "Настройка витринного режима Windows" "Автозапуск ценника, расписание таймеров и синхронизация времени для ноутбуков"

  nsDialogs::Create 1018
  Pop $ShowcaseDialog
  ${If} $ShowcaseDialog == error
    Abort
  ${EndIf}

  ; 1. Checkbox: Timezone sync (Astana UTC+5)
  ${NSD_CreateCheckbox} 10u 10u 280u 13u "Синхронизировать точное время (Астана, UTC+5)"
  Pop $HwndSyncTimezone
  ${NSD_SetState} $HwndSyncTimezone 1 ; BST_CHECKED by default

  ; 2. Checkbox: Promo guest session
  ${NSD_CreateCheckbox} 10u 28u 280u 13u "Создать отдельный сеанс витрины «Promo» (Автозапуск ценника)"
  Pop $HwndCreatePromo
  ${NSD_SetState} $HwndCreatePromo 1 ; BST_CHECKED by default

  ; 3. Checkbox: Schedule power on/off
  ${NSD_CreateCheckbox} 10u 46u 280u 13u "Авто-расписание: Включение в 09:30, Выключение в 22:30"
  Pop $HwndSetSchedule
  ${NSD_SetState} $HwndSetSchedule 1 ; BST_CHECKED by default

  ; Time inputs
  ${NSD_CreateLabel} 24u 64u 110u 12u "Время включения витрины:"
  Pop $0
  ${NSD_CreateText} 140u 62u 50u 12u "09:30"
  Pop $HwndWakeTime

  ${NSD_CreateLabel} 24u 80u 110u 12u "Время выключения витрины:"
  Pop $0
  ${NSD_CreateText} 140u 78u 50u 12u "22:30"
  Pop $HwndSleepTime

  ${NSD_CreateLabel} 10u 100u 280u 28u "• Утром в 09:30 ноутбук автоматически включается и открывает ценник на весь экран.$\r$\n• Вечером в 22:30 ноутбук планово выключается."
  Pop $0

  nsDialogs::Show
FunctionEnd

Function ShowcaseKioskPageLeave
  ${NSD_GetState} $HwndSyncTimezone $0
  ${NSD_GetState} $HwndCreatePromo $1
  ${NSD_GetState} $HwndSetSchedule $2
  ${NSD_GetText} $HwndWakeTime $3
  ${NSD_GetText} $HwndSleepTime $4

  WriteRegStr HKLM "Software\ShowcasePriceTag" "SyncTime" "$0"
  WriteRegStr HKLM "Software\ShowcasePriceTag" "CreatePromo" "$1"
  WriteRegStr HKLM "Software\ShowcasePriceTag" "SetPowerSchedule" "$2"
  WriteRegStr HKLM "Software\ShowcasePriceTag" "WakeTime" "$3"
  WriteRegStr HKLM "Software\ShowcasePriceTag" "SleepTime" "$4"
FunctionEnd

!macro customInstall
  DetailPrint "Применение настроек витринного режима Windows..."
  
  ReadRegStr $0 HKLM "Software\ShowcasePriceTag" "SyncTime"
  ReadRegStr $1 HKLM "Software\ShowcasePriceTag" "CreatePromo"
  ReadRegStr $2 HKLM "Software\ShowcasePriceTag" "SetPowerSchedule"
  ReadRegStr $3 HKLM "Software\ShowcasePriceTag" "WakeTime"
  ReadRegStr $4 HKLM "Software\ShowcasePriceTag" "SleepTime"

  ${If} $3 == ""
    StrCpy $3 "09:30"
  ${EndIf}
  ${If} $4 == ""
    StrCpy $4 "22:30"
  ${EndIf}

  ; Execute PowerShell setup script
  nsExec::ExecToLog 'powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$INSTDIR\resources\app\electron\setup_kiosk.ps1" -WakeTime "$3" -SleepTime "$4" -CreatePromo "$1" -SyncTime "$0" -SetPowerSchedule "$2" -AppPath "$INSTDIR\${APP_EXECUTABLE_FILENAME}"'
!macroend
