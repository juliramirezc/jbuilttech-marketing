# Copy visibility assets from Cursor workspace to public folder
# Run once: .\copy-visibility-assets.ps1

$destination = ".\public\images\visibility"
$source = "C:\\Users\\Julir\\.cursor\\projects\\c-Users-Julir-contractor-saas-backend-DemoInsurancePaperwork-jbuilttech-marketing\\assets"

# Create destination directory
New-Item -ItemType Directory -Force -Path $destination | Out-Null

# Copy the Facebook insights image
$assets = @{
    "c__Users_Julir_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_facebook-insights-6079c127-aa9b-4e4a-a765-b76311ead968.png" = "facebook-insights.png"
}

foreach ($item in $assets.GetEnumerator()) {
    $srcPath = Join-Path $source $item.Key
    $dstPath = Join-Path $destination $item.Value
    
    if (Test-Path $srcPath) {
        Copy-Item $srcPath $dstPath -Force
        Write-Host "Copied: $($item.Value)" -ForegroundColor Green
    } else {
        Write-Host "NOT FOUND: $($item.Key)" -ForegroundColor Red
    }
}

Write-Host "`nAssets in $destination`:"
Get-ChildItem $destination | Format-Table Name, Length