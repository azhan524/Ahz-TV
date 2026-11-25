param(
  [string]$Path = (
    Join-Path $PSScriptRoot '..\vendor\airplay-windows\airplay-windows.exe'
  )
)

$ErrorActionPreference = 'Stop'
$resolvedPath = (Resolve-Path -LiteralPath $Path).Path
$bytes = [IO.File]::ReadAllBytes($resolvedPath)
$replacements = @(
  @{
    Old = "AirPlay-Windows`0AppleTV3,2"
    New = "Ahz-Stream`0`0`0`0`0`0AppleTV3,2"
    Label = 'window title'
  },
  @{
    Old = 'AirPlay Windows'
    New = 'Ahz-Stream     '
    Label = 'titlebar wordmark'
  }
)

function Find-Bytes($haystack, $needle) {
  $hits = New-Object System.Collections.Generic.List[int]
  for ($i = 0; $i -le $haystack.Length - $needle.Length; $i++) {
    $matched = $true
    for ($j = 0; $j -lt $needle.Length; $j++) {
      if ($haystack[$i + $j] -ne $needle[$j]) {
        $matched = $false
        break
      }
    }
    if ($matched) {
      $hits.Add($i)
    }
  }
  return $hits
}

$changed = $false
foreach ($replacement in $replacements) {
  $oldBytes = [Text.Encoding]::ASCII.GetBytes($replacement.Old)
  $newBytes = [Text.Encoding]::ASCII.GetBytes($replacement.New)
  if ($newBytes.Length -ne $oldBytes.Length) {
    throw "$($replacement.Label) replacement must preserve the original byte length."
  }

  $oldHits = Find-Bytes $bytes $oldBytes
  $newHits = Find-Bytes $bytes $newBytes
  if ($oldHits.Count -eq 1) {
    $offset = $oldHits[0]
    [Array]::Copy($newBytes, 0, $bytes, $offset, $newBytes.Length)
    "Renamed $($replacement.Label) at 0x$($offset.ToString('X8'))"
    $changed = $true
  } elseif ($newHits.Count -eq 1) {
    "$($replacement.Label) is already branded."
  } else {
    throw "Expected exactly one $($replacement.Label); found $($oldHits.Count) upstream and $($newHits.Count) branded."
  }
}

if ($changed) {
  [IO.File]::WriteAllBytes($resolvedPath, $bytes)
}

$sha = [Security.Cryptography.SHA256]::Create()
try {
  $digest = $sha.ComputeHash([IO.File]::ReadAllBytes($resolvedPath))
} finally {
  $sha.Dispose()
}
$hash = -join ($digest | ForEach-Object { $_.ToString('X2') })
"SHA256=$hash"
