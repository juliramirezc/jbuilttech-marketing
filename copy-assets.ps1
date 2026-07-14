# Copy hero assets from Cursor workspace to public folder
# Run once: .\copy-assets.ps1

$destination = ".\public\images\hero"
$source = "C:\Users\Julir\.cursor\projects\c-Users-Julir-contractor-saas-backend-DemoInsurancePaperwork-jbuilttech-marketing\assets"

# Create destination directory
New-Item -ItemType Directory -Force -Path $destination | Out-Null

# Copy and rename assets
$assets = @{
    "c__Users_Julir_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_image1-d633dcb2-ad4b-42ba-8839-492bc26a18a3.png" = "blueprint-house.png"
    "c__Users_Julir_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_image2-0ce36890-60bc-4828-90fa-f44044634d39.png" = "house-framing.png"
    "c__Users_Julir_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_image3-d608bc5b-1eea-4381-a7f5-fe039c440d18.png" = "finished-home.png"
    "c__Users_Julir_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_image4-5e55dd26-0806-459b-8a60-c056e5ebad23.png" = "digital-mockups.png"
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
