<#
==========================================================================
 TierShift Academy - Batch Lesson Generator
==========================================================================
 What it does, per module:
   1. Searches YouTube for a relevant medium-length video
   2. Ranks candidates by channel subscriber count (authority signal)
   3. Calls the generate-lesson edge function to AI-write the lesson
   4. Inserts the result into the `lessons` table
   Skips any module that already has a lesson (safe to re-run after a
   partial failure - it won't duplicate work).
==========================================================================
#>

param(
    [int]$Limit = 0,
    [switch]$DryRun,
    [int]$DelaySeconds = 15,
    [int]$RelevancePoolSize = 5,
    [hashtable]$Overrides = @{}
)

$SUPABASE_URL = "https://bbyvxfluwsiutmoosesz.supabase.co"

if ($env:SUPABASE_SERVICE_ROLE_KEY) {
    $ServiceRoleKey = $env:SUPABASE_SERVICE_ROLE_KEY
} else {
    $SecureKey = Read-Host "Paste your Supabase service_role key" -AsSecureString
    $ServiceRoleKey = [System.Net.NetworkCredential]::new('', $SecureKey).Password
}

function Get-JwtRole {
    param([string]$Jwt)
    try {
        $payload = $Jwt.Split('.')[1]
        while ($payload.Length % 4 -ne 0) { $payload += "=" }
        $payload = $payload.Replace('-','+').Replace('_','/')
        $json = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($payload))
        return ($json | ConvertFrom-Json).role
    } catch { return $null }
}
$keyRole = Get-JwtRole -Jwt $ServiceRoleKey
if ($keyRole -ne "service_role") {
    Write-Error "STOPPING: this key's role is '$keyRole', not 'service_role'. Get the correct one from Supabase Dashboard -> Project Settings -> API Keys -> Legacy API Keys -> service_role, then re-run."
    exit 1
}
Write-Host "Key verified: role = service_role" -ForegroundColor Green

$envLocalPath = ".\.env.local"
if (-not (Test-Path $envLocalPath)) {
    Write-Error "Could not find .env.local at $envLocalPath - run this script from the project root."
    exit 1
}
$ytLine = Get-Content $envLocalPath | Where-Object { $_ -match '^REACT_APP_YOUTUBE_API_KEY=' }
if (-not $ytLine) {
    Write-Error "REACT_APP_YOUTUBE_API_KEY not found in .env.local"
    exit 1
}
$YouTubeKey = ($ytLine -replace '^REACT_APP_YOUTUBE_API_KEY=', '').Trim()

$modules = @(
    @{ id = "7905aae1-ea10-48f5-9fa0-f7b01043000c"; name = "Linux CLI & Bash Scripting"; track = "t1t2" }
    @{ id = "52f681c3-761d-4982-8e01-cf0c26068482"; name = "Advanced PowerShell Scripting"; track = "t1t2" }
    @{ id = "68608671-65bd-49c2-8cbd-3cc89e77fc91"; name = "Security Monitoring & Log Analysis"; track = "t1t2" }
    @{ id = "e33372e4-9987-40ec-a52f-de99bd27b126"; name = "VLAN Configuration & Trunking"; track = "t1t2" }
    @{ id = "8ff82b27-6407-4396-8672-ec9b340d0426"; name = "Azure AD / Entra ID Hybrid Identity"; track = "t1t2" }
    @{ id = "e000d70c-aa92-4395-81b6-3e081387f7af"; name = "Bash Essentials for Server Administration"; track = "t1t2" }
    @{ id = "23754534-9dc6-430c-b818-e031ac90bad0"; name = "Subnetting & CIDR in Practice"; track = "t1t2" }
    @{ id = "d9dcc596-787d-4a3c-8b9c-1bd78ac365d1"; name = "Incident Response Workflow"; track = "t1t2" }
    @{ id = "80d4c658-3225-4cca-9a28-35293383311b"; name = "VPN Tunneling & Remote Access"; track = "t1t2" }
    @{ id = "e4743357-b7b2-4f98-a482-a8b957082960"; name = "Permission Auditing & Access Reviews"; track = "t1t2" }
    @{ id = "82dff785-8b6c-40b6-a3e9-7dfae3970731"; name = "Virtualization & VMware Essentials"; track = "t1t2" }
    @{ id = "fa4261b0-d220-45c2-875a-c5bf72f6e0ac"; name = "Enterprise Wireless Design & RF"; track = "network" }
    @{ id = "eba7913e-8ea2-4758-a07a-62fad10fe55e"; name = "OSPF Design & Implementation"; track = "network" }
    @{ id = "e0d40bf5-c793-42f8-86c4-f269be30309f"; name = "BGP & OSPF Routing Protocols"; track = "network" }
    @{ id = "f44a45ac-2745-4996-9986-87664f77f478"; name = "Next-Gen Firewall Design & Policy"; track = "network" }
    @{ id = "aabee796-cb7f-49ee-b10e-c153e1f9e779"; name = "SD-WAN Architecture & Deployment"; track = "network" }
    @{ id = "75176608-57c6-424f-b713-be804d40bc7c"; name = "BGP Fundamentals & ISP Peering"; track = "network" }
    @{ id = "7de024c6-3f3d-4b9f-bdb9-c5e634e538af"; name = "Wireless Security & Authentication"; track = "network" }
    @{ id = "a595d906-8508-4af4-8a67-83abc9c47fd9"; name = "SASE & Cloud-Delivered Security"; track = "network" }
    @{ id = "fe1c6751-378e-4c2c-b5ac-391a4fc3092b"; name = "Wireless Troubleshooting & Optimization"; track = "network" }
)

if (-not $Overrides) { $Overrides = @{} }
if ($Limit -gt 0) { $modules = $modules | Select-Object -First $Limit }

function Get-ErrorDetail {
    param($ErrorRecord)
    try {
        if ($ErrorRecord.Exception.Response) {
            $stream = $ErrorRecord.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($stream)
            $body = $reader.ReadToEnd()
            if ($body) { return $body }
        }
    } catch {}
    return $ErrorRecord.Exception.Message
}

function Get-BestVideo {
    param([string]$ModuleName)
    $query = [System.Uri]::EscapeDataString("$ModuleName IT training tutorial")
    $searchUrl = "https://www.googleapis.com/youtube/v3/search?part=snippet&q=$query&type=video&maxResults=10&videoDuration=medium&key=$YouTubeKey"
    $searchRes = Invoke-RestMethod -Uri $searchUrl -Method Get
    $candidates = $searchRes.items
    if (-not $candidates -or $candidates.Count -eq 0) { throw "No YouTube results found for '$ModuleName'" }
    $channelIds = ($candidates | ForEach-Object { $_.snippet.channelId } | Select-Object -Unique) -join ","
    $channelsUrl = "https://www.googleapis.com/youtube/v3/channels?part=statistics&id=$channelIds&key=$YouTubeKey"
    $channelsRes = Invoke-RestMethod -Uri $channelsUrl -Method Get
    $subMap = @{}
    foreach ($ch in $channelsRes.items) {
        $subs = 0
        if ($ch.statistics.subscriberCount) { $subs = [long]$ch.statistics.subscriberCount }
        $subMap[$ch.id] = $subs
    }
    $pool = $candidates | Select-Object -First $RelevancePoolSize
    $best = $pool | Sort-Object -Property @{Expression = { $subMap[$_.snippet.channelId] }; Descending = $true} | Select-Object -First 1
    $bestSubs = $subMap[$best.snippet.channelId]
    return @{
        videoId      = $best.id.videoId
        videoTitle   = [System.Net.WebUtility]::HtmlDecode($best.snippet.title)
        channelTitle = [System.Net.WebUtility]::HtmlDecode($best.snippet.channelTitle)
        subscribers  = $bestSubs
    }
}

function Test-LessonExists {
    param([string]$ModuleId)
    $url = "$SUPABASE_URL/rest/v1/lessons?module_id=eq.$ModuleId&select=id"
    $headers = @{ "apikey" = $ServiceRoleKey; "Authorization" = "Bearer $ServiceRoleKey" }
    $existing = Invoke-RestMethod -Uri $url -Headers $headers -Method Get
    return ($existing.Count -gt 0)
}

function Invoke-GenerateLesson {
    param([string]$VideoId, [string]$VideoTitle, [string]$ModuleName, [int]$MaxRetries = 3, [int]$RetryBaseSeconds = 30)
    $headers = @{ "Authorization" = "Bearer $ServiceRoleKey"; "Content-Type" = "application/json" }
    $body = @{ videoId = $VideoId; videoTitle = $VideoTitle; moduleName = $ModuleName } | ConvertTo-Json
    for ($attempt = 1; $attempt -le $MaxRetries; $attempt++) {
        try {
            return Invoke-RestMethod -Uri "$SUPABASE_URL/functions/v1/generate-lesson" -Headers $headers -Method Post -Body $body
        } catch {
            $detail = Get-ErrorDetail -ErrorRecord $_
            $isRateLimited = $detail -match '429|rate-limited|rate limit|500|Internal Server Error'
            if ($isRateLimited -and $attempt -lt $MaxRetries) {
                $wait = $RetryBaseSeconds * $attempt
                Write-Host "    Rate-limited by OpenRouter (attempt $attempt/$MaxRetries) - waiting $wait seconds, then retrying..." -ForegroundColor DarkYellow
                Start-Sleep -Seconds $wait
            } else {
                throw $detail
            }
        }
    }
}

function Save-Lesson {
    param([string]$ModuleId, [string]$ModuleName, [string]$VideoId, [string]$Outline)
    $content = "VIDEO:$VideoId`n`n$Outline"
    $body = @{ module_id = $ModuleId; title = $ModuleName; content = $content; lesson_number = 1 } | ConvertTo-Json -Depth 5
    $headers = @{ "apikey" = $ServiceRoleKey; "Authorization" = "Bearer $ServiceRoleKey"; "Content-Type" = "application/json"; "Prefer" = "return=representation" }
    return Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/lessons" -Headers $headers -Method Post -Body $body
}

$results = @()
Write-Host "=== TierShift Academy: Batch Lesson Generator ===" -ForegroundColor Cyan
Write-Host "Processing $($modules.Count) module(s)$(if ($DryRun) { ' [DRY RUN - no DB writes]' })`n"

foreach ($mod in $modules) {
    Write-Host "----------------------------------------"
    Write-Host "Module: $($mod.name) [$($mod.track)]" -ForegroundColor Yellow
    try {
        if (-not $DryRun -and (Test-LessonExists -ModuleId $mod.id)) {
            Write-Host "  SKIP - lesson already exists" -ForegroundColor DarkGray
            $results += [PSCustomObject]@{ Module = $mod.name; Track = $mod.track; Status = "Skipped"; Detail = "Already has lesson" }
            continue
        }
        if ($Overrides.ContainsKey($mod.id)) {
            $ov = $Overrides[$mod.id]
            $video = @{ videoId = $ov.videoId; videoTitle = $ov.videoTitle; channelTitle = "Manual override"; subscribers = "n/a" }
            Write-Host "  Using manual override: `"$($video.videoTitle)`""
        } else {
            Write-Host "  Searching YouTube..."
            $video = Get-BestVideo -ModuleName $mod.name
            Write-Host "  Selected: `"$($video.videoTitle)`" - $($video.channelTitle) ($($video.subscribers) subs)"
        }
        Write-Host "  Generating lesson via AI..."
        $gen = Invoke-GenerateLesson -VideoId $video.videoId -VideoTitle $video.videoTitle -ModuleName $mod.name
        if ($gen.error) { throw "generate-lesson returned an error: $($gen.error)" }
        if (-not $gen.outline) { throw "generate-lesson returned no outline" }
        if ($gen.outline.Length -lt 200) { throw "Outline suspiciously short ($($gen.outline.Length) chars). Content: $($gen.outline)" }
        if ($DryRun) {
            Write-Host "  [DRY RUN] Outline generated ($($gen.outline.Length) chars) - not saved" -ForegroundColor Magenta
            $results += [PSCustomObject]@{ Module = $mod.name; Track = $mod.track; Status = "DryRun-OK"; Detail = $video.videoTitle }
        } else {
            Write-Host "  Saving lesson..."
            Save-Lesson -ModuleId $mod.id -ModuleName $mod.name -VideoId $video.videoId -Outline $gen.outline | Out-Null
            Write-Host "  SAVED" -ForegroundColor Green
            $results += [PSCustomObject]@{ Module = $mod.name; Track = $mod.track; Status = "Success"; Detail = $video.videoTitle }
        }
    }
    catch {
        $detail = Get-ErrorDetail -ErrorRecord $_
        Write-Host "  FAILED: $detail" -ForegroundColor Red
        $results += [PSCustomObject]@{ Module = $mod.name; Track = $mod.track; Status = "Failed"; Detail = $detail }
    }
    if ($mod -ne $modules[-1]) {
        Write-Host "  Waiting $DelaySeconds seconds (rate-limit safety)..."
        Start-Sleep -Seconds $DelaySeconds
    }
}

Write-Host "`n=== SUMMARY ===" -ForegroundColor Cyan
$results | Format-Table -AutoSize -Wrap
$results | Export-Csv -Path ".\lesson-generation-log.csv" -NoTypeInformation
Write-Host "`nFull log saved to .\lesson-generation-log.csv"