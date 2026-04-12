$path = Join-Path $PSScriptRoot 'skill-classification-atl-confluence-body.md'
$body = Get-Content -LiteralPath $path -Raw -Encoding UTF8
$body = $body -replace '(?s)^<!--.*?-->\r?\n', ''
$obj = [ordered]@{
  cloudId       = 'a5cab9f1-9fa7-40f1-9025-cd77c2fdcfb4'
  spaceId       = '443678722'
  title         = 'Skill Classification for ATL'
  body          = $body
  contentFormat = 'markdown'
  parentId      = '463175682'
  status        = 'current'
}
$json = $obj | ConvertTo-Json -Depth 5 -Compress
$out = Join-Path $PSScriptRoot 'mcp-create-confluence-payload.json'
[System.IO.File]::WriteAllText($out, $json, [System.Text.UTF8Encoding]::new($false))
Write-Output ((Get-Item $out).Length)
