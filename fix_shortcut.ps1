$wsh = New-Object -ComObject WScript.Shell

$targetExe = "e:\ai\claude\ALAi\Drips App\AL_Manalaysay_ICU_Drip_Calculator.exe"
$workDir = "e:\ai\claude\ALAi\Drips App"
$iconPath = "e:\ai\claude\ALAi\Drips App\app_icon.ico"

$desktopFolders = @(
    [System.Environment]::GetFolderPath('Desktop'),
    "C:\Users\Admin\Desktop",
    "C:\Users\Admin\OneDrive\Desktop",
    "C:\Users\Public\Desktop"
)

foreach ($folder in $desktopFolders) {
    if (Test-Path $folder) {
        $shortcutPath = Join-Path -Path $folder -ChildPath "AL Manalaysay ICU Drip Calculator.lnk"
        
        # Remove old broken shortcut if present
        if (Test-Path $shortcutPath) {
            Remove-Item $shortcutPath -Force -ErrorAction SilentlyContinue
        }

        $shortcut = $wsh.CreateShortcut($shortcutPath)
        $shortcut.TargetPath = $targetExe
        $shortcut.WorkingDirectory = $workDir
        $shortcut.IconLocation = "$iconPath, 0"
        $shortcut.Description = "AL Manalaysay ICU Drip Calculator"
        $shortcut.Save()

        Write-Host "Created shortcut at: $shortcutPath"
    }
}
