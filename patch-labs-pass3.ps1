# patch-labs-pass3.ps1
# Adds a dedicated user_labs insert for completed ticket attempts, using the
# REAL schema columns (lab_ticket_id, status, score, feedback, submitted_at)
# instead of the shared handleComplete's broken lab_id/completed_at write.
#
# Run from the project root AFTER patch-labs.ps1 (Pass 2) has already been applied:
#   .\patch-labs-pass3.ps1

$ErrorActionPreference = "Stop"
$labsPath = ".\src\Labs.js"

function FromB64($b64) {
    return [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($b64))
}

if (-not (Test-Path $labsPath)) {
    Write-Host "ERROR: Could not find $labsPath -- run this script from the project root." -ForegroundColor Red
    exit 1
}

$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$backupPath = ".\src\Labs.js.backup-pass3-$timestamp"
Copy-Item $labsPath $backupPath
Write-Host "Backed up Labs.js -> $backupPath" -ForegroundColor Cyan

$content = Get-Content $labsPath -Raw
$originalHadCRLF = $content.Contains("`r`n")
if ($originalHadCRLF) {
    $content = $content.Replace("`r`n", "`n")
}

$insertAnchor  = FromB64 "ICBjb25zdCBoYW5kbGVDb21wbGV0ZSA9IGFzeW5jICgpID0+IHs="
$newHandler    = FromB64 "ICBjb25zdCBoYW5kbGVUaWNrZXRDb21wbGV0ZSA9IGFzeW5jICgpID0+IHsKICAgIHNldENvbXBsZXRpbmcodHJ1ZSk7CiAgICBhd2FpdCBzdXBhYmFzZS5mcm9tKCJ1c2VyX2xhYnMiKS5pbnNlcnQoewogICAgICB1c2VyX2lkOiB1c2VyLmlkLAogICAgICBsYWJfdGlja2V0X2lkOiBsYWIuaWQsCiAgICAgIHN0YXR1czogImNvbXBsZXRlZCIsCiAgICAgIHNjb3JlOiBzY29yZVJlc3VsdC5zY29yZSwKICAgICAgZmVlZGJhY2s6IEpTT04uc3RyaW5naWZ5KHNjb3JlUmVzdWx0KSwKICAgICAgc3VibWl0dGVkX2F0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCkKICAgIH0pOwogICAgYXdhaXQgaGFuZGxlQ29tcGxldGUoKTsKICB9OwoKICBjb25zdCBoYW5kbGVDb21wbGV0ZSA9IGFzeW5jICgpID0+IHs="
$oldButton     = FromB64 "PGJ1dHRvbiBvbkNsaWNrPXtoYW5kbGVDb21wbGV0ZX0gZGlzYWJsZWQ9e2NvbXBsZXRpbmd9IHN0eWxlPXt7cGFkZGluZzoiMTJweCAyNHB4IixiYWNrZ3JvdW5kOlQuY3lhbixjb2xvcjpULmJnLGJvcmRlcjoibm9uZSIsYm9yZGVyUmFkaXVzOjgsZm9udFdlaWdodDo2MDAsY3Vyc29yOmNvbXBsZXRpbmc/IndhaXQiOiJwb2ludGVyIixvcGFjaXR5OmNvbXBsZXRpbmc/MC43OjF9fT4="
$newButton     = FromB64 "PGJ1dHRvbiBvbkNsaWNrPXtoYW5kbGVUaWNrZXRDb21wbGV0ZX0gZGlzYWJsZWQ9e2NvbXBsZXRpbmd9IHN0eWxlPXt7cGFkZGluZzoiMTJweCAyNHB4IixiYWNrZ3JvdW5kOlQuY3lhbixjb2xvcjpULmJnLGJvcmRlcjoibm9uZSIsYm9yZGVyUmFkaXVzOjgsZm9udFdlaWdodDo2MDAsY3Vyc29yOmNvbXBsZXRpbmc/IndhaXQiOiJwb2ludGVyIixvcGFjaXR5OmNvbXBsZXRpbmc/MC43OjF9fT4="

# ============================================================
# EDIT 1 -- Insert handleTicketComplete before handleComplete
# ============================================================
$anchor1Count = ([regex]::Matches($content, [regex]::Escape($insertAnchor))).Count
if ($anchor1Count -ne 1) {
    Write-Host "ERROR: Expected exactly 1 match for handleComplete anchor, found $anchor1Count. Aborting -- no changes made." -ForegroundColor Red
    exit 1
}
$content = $content.Replace($insertAnchor, $newHandler)
Write-Host "EDIT 1/2 OK -- handleTicketComplete inserted" -ForegroundColor Green

# ============================================================
# EDIT 2 -- Point the ticket branch's Continue button at the new handler
# ============================================================
$anchor2Count = ([regex]::Matches($content, [regex]::Escape($oldButton))).Count
if ($anchor2Count -ne 1) {
    Write-Host "ERROR: Expected exactly 1 match for ticket Continue button, found $anchor2Count." -ForegroundColor Red
    Write-Host "Restoring original file from backup. No changes were kept." -ForegroundColor Yellow
    Copy-Item $backupPath $labsPath -Force
    exit 1
}
$content = $content.Replace($oldButton, $newButton)
Write-Host "EDIT 2/2 OK -- Continue button now uses handleTicketComplete" -ForegroundColor Green

if ($originalHadCRLF) {
    $content = $content.Replace("`n", "`r`n")
}
[System.IO.File]::WriteAllText((Resolve-Path $labsPath), $content, [System.Text.UTF8Encoding]::new($false))

Write-Host ""
Write-Host "SUCCESS -- Labs.js patched (Pass 3)." -ForegroundColor Green
Write-Host "Backup saved at: $backupPath" -ForegroundColor Cyan
Write-Host "Run 'npm start' to test locally before deploying." -ForegroundColor Cyan
