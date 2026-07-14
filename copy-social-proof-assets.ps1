# Copy social proof assets from Cursor workspace to public folder
# Run once: .\copy-social-proof-assets.ps1

$destination = ".\public\images\social-proof"
$source = "C:\\Users\\Julir\\.cursor\\projects\\c-Users-Julir-contractor-saas-backend-DemoInsurancePaperwork-jbuilttech-marketing\\assets"

# Create destination directory
New-Item -ItemType Directory -Force -Path $destination | Out-Null

# Copy and rename the Facebook insights images
# You can choose which image to use as the main insights display
$assets = @{
    "c__Users_Julir_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_facebooklGoal-f4d567eb-c67f-4d64-b00b-c955107d3ca4.png" = "facebook-goal.png"
    "c__Users_Julir_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_facebookStats-aaae9395-2e8a-4635-af49-e5d8ef474999.png" = "facebook-insights.png"
    "c__Users_Julir_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_facebookLinkClicks-b4118eb0-72f2-41dd-80ce-3f8a6b4211c8.png" = "facebook-link-clicks.png"
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