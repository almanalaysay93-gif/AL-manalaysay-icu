$WshShell = New-Object -ComObject WScript.Shell
$DesktopPath = [System.Environment]::GetFolderPath('Desktop')
$ShortcutPath = Join-Path -Path $DesktopPath -ChildPath "AL Manalaysay ICU Drip Calculator.lnk"
$TargetExe = "e:\ai\claude\ALAi\Drips App\AL_Manalaysay_ICU_Drip_Calculator_Desktop\AL_Manalaysay_ICU_Drip_Calculator.exe"
$IconPath = "e:\ai\claude\ALAi\Drips App\app_icon.ico"

$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = $TargetExe
$Shortcut.WorkingDirectory = "e:\ai\claude\ALAi\Drips App\AL_Manalaysay_ICU_Drip_Calculator_Desktop"
$Shortcut.IconLocation = "$IconPath, 0"
$Shortcut.Description = "AL Manalaysay ICU Drip Calculator Desktop App"
$Shortcut.Save()

Write-Host "Created Desktop shortcut at: $ShortcutPath"
