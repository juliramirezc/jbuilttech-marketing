# Setup script to copy hero assets to public directory
# Run this once: .\setup-assets.ps1

$projectRoot = $PSScriptRoot
$assetsSource = "C:\Users\Julir\.cursor\projects\c-Users-Julir-contractor-saas-backend-DemoInsurancePaperwork-jbuilttech-marketing\assets"
$heroDestination = Join-Path $projectRoot "public\images\hero"

# Create directories
New-Item -ItemType Directory -Force -Path $heroDestination | Out-Null

# Copy and rename hero assets
Copy-Item "$assetsSource\c__Users_Julir_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_image1-b110268a-8931-4d52-a0d6-11bc7424f551.png" "$heroDestination\blueprint-to-home.png" -Force
Copy-Item "$assetsSource\c__Users_Julir_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_image2-24229943-82ed-4a42-96dd-d27f7b813af5.png" "$heroDestination\construction-framing.png" -Force
Copy-Item "$assetsSource\c__Users_Julir_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_image3-c79c2247-7c0d-4999-a15a-176b10b5ee10.png" "$heroDestination\finished-home.png" -Force
Copy-Item "$assetsSource\c__Users_Julir_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_image4-862e0b0c-3dc6-4fa3-a416-3821ec1c0eca.png" "$heroDestination\digital-mockups.png" -Force

Write-Host "Assets copied successfully to $heroDestination" -ForegroundColor Green
Get-ChildItem $heroDestination
