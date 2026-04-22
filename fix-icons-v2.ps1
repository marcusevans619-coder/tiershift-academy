# Fix garbled icons in App.js by replacing the NAV array

$file = "src\App.js"
$content = Get-Content $file -Raw

# Find and replace the NAV array with clean text icons
$oldNav = 'const NAV = \[[\s\S]*?\];'
$newNav = @'
const NAV = [
  { id: "dashboard", label: "Dashboard", icon: "#" },
  { id: "tracks", label: "Career Tracks", icon: ">" },
  { id: "paths", label: "Learning Paths", icon: "P" },
  { id: "labs", label: "Labs", icon: "L" },
  { id: "badges", label: "Badges", icon: "B" },
  { id: "certs", label: "Certifications", icon: "C" },
  { id: "profile", label: "Profile", icon: "U" },
];
'@

$content = $content -replace $oldNav, $newNav

# Also fix the Sign Out button icon
$content = $content -replace '<span>[^<]*</span> Sign Out', '<span>X</span> Sign Out'

# Fix StatCard icons (fire and trophy)
$content = $content -replace 'icon:"[^"]*" value:\{streak\}', 'icon:"*" value:{streak}'
$content = $content -replace 'icon:"[^"]*" value:\{badgeCount\}', 'icon:"+" value:{badgeCount}'

# Write back
[System.IO.File]::WriteAllText("$pwd\$file", $content)

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "  Icons fixed successfully!    " -ForegroundColor Green  
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Refresh browser: Ctrl+Shift+R" -ForegroundColor Yellow
Write-Host ""
