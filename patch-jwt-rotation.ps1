# patch-jwt-rotation.ps1
# Updates generate-ticket/index.ts to prefer the new SUPABASE_SECRET_KEYS
# (JSON dict, new-format key) over the legacy SUPABASE_SERVICE_ROLE_KEY,
# with a fallback so nothing breaks mid-transition.
#
# Run from the project root: C:\Users\marcu\tiershift-academy
#   .\patch-jwt-rotation.ps1

$ErrorActionPreference = "Stop"
$fnPath = ".\supabase\functions\generate-ticket\index.ts"

function FromB64($b64) {
    return [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($b64))
}

if (-not (Test-Path $fnPath)) {
    Write-Host "ERROR: Could not find $fnPath -- run this script from the project root." -ForegroundColor Red
    exit 1
}

$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$backupPath = ".\supabase\functions\generate-ticket\index.ts.backup-$timestamp"
Copy-Item $fnPath $backupPath
Write-Host "Backed up generate-ticket/index.ts -> $backupPath" -ForegroundColor Cyan

$content = Get-Content $fnPath -Raw
$originalHadCRLF = $content.Contains("`r`n")
if ($originalHadCRLF) {
    $content = $content.Replace("`r`n", "`n")
}

$oldClient = FromB64 "ICAgIGNvbnN0IHN1cGFiYXNlID0gY3JlYXRlQ2xpZW50KAogICAgICBEZW5vLmVudi5nZXQoIlNVUEFCQVNFX1VSTCIpISwKICAgICAgRGVuby5lbnYuZ2V0KCJTVVBBQkFTRV9TRVJWSUNFX1JPTEVfS0VZIikhLAogICAgKTs="
$newClient = FromB64 "ICAgIC8vIFByZWZlciBuZXctZm9ybWF0IHNlY3JldCBrZXk7IGZhbGwgYmFjayB0byBsZWdhY3kgc2VydmljZV9yb2xlIGtleSBpZiBub3QgeWV0IGF2YWlsYWJsZS4KICAgIGxldCBzZWNyZXRLZXk6IHN0cmluZyB8IHVuZGVmaW5lZDsKICAgIGNvbnN0IHNlY3JldEtleXNSYXcgPSBEZW5vLmVudi5nZXQoIlNVUEFCQVNFX1NFQ1JFVF9LRVlTIik7CiAgICBpZiAoc2VjcmV0S2V5c1JhdykgewogICAgICB0cnkgewogICAgICAgIGNvbnN0IHNlY3JldEtleXMgPSBKU09OLnBhcnNlKHNlY3JldEtleXNSYXcpOwogICAgICAgIHNlY3JldEtleSA9IHNlY3JldEtleXMuZGVmYXVsdDsKICAgICAgfSBjYXRjaCB7CiAgICAgICAgLy8gZmFsbCB0aHJvdWdoIHRvIGxlZ2FjeSBiZWxvdwogICAgICB9CiAgICB9CiAgICBpZiAoIXNlY3JldEtleSkgewogICAgICBzZWNyZXRLZXkgPSBEZW5vLmVudi5nZXQoIlNVUEFCQVNFX1NFUlZJQ0VfUk9MRV9LRVkiKTsKICAgIH0KCiAgICBjb25zdCBzdXBhYmFzZSA9IGNyZWF0ZUNsaWVudCgKICAgICAgRGVuby5lbnYuZ2V0KCJTVVBBQkFTRV9VUkwiKSEsCiAgICAgIHNlY3JldEtleSEsCiAgICApOw=="

$anchorCount = ([regex]::Matches($content, [regex]::Escape($oldClient))).Count
if ($anchorCount -ne 1) {
    Write-Host "ERROR: Expected exactly 1 match for the Supabase client init block, found $anchorCount. Aborting -- no changes made." -ForegroundColor Red
    exit 1
}
$content = $content.Replace($oldClient, $newClient)
Write-Host "EDIT OK -- generate-ticket now prefers SUPABASE_SECRET_KEYS with legacy fallback" -ForegroundColor Green

if ($originalHadCRLF) {
    $content = $content.Replace("`n", "`r`n")
}
[System.IO.File]::WriteAllText((Resolve-Path $fnPath), $content, [System.Text.UTF8Encoding]::new($false))

Write-Host ""
Write-Host "SUCCESS -- generate-ticket/index.ts patched." -ForegroundColor Green
Write-Host "Backup saved at: $backupPath" -ForegroundColor Cyan
Write-Host "Next: supabase functions deploy generate-ticket" -ForegroundColor Cyan
