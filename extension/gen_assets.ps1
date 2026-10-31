$map = @{
  'neutral' = 'cat_goblin.png';
  'huh' = 'cat_loading.png';
  'thumbs_up' = 'cat_thumbsup.png';
  'heart' = 'cat_heart.png';
  'shh' = 'cat_shh.png';
  'thinking' = 'cat_thinking_chin.png';
  'fist' = 'cat_smug_fist.png';
  'pointing' = 'cat_pointing.png';
  'head_pat' = 'cat_shocked.png';
  'close_up' = 'cat_cursed_stare.png';
  'side_look' = 'cat_eyebrow.png'
}

$sb = New-Object System.Text.StringBuilder
[void]$sb.AppendLine('// Pre-encoded Base64 Cat Meme Assets (Bypasses Google Meet CSP)')
[void]$sb.AppendLine('window.__CAT_MEME_BASE64__ = {')

foreach ($key in $map.Keys) {
  $file = Join-Path 'd:\Page\extension\assets' $map[$key]
  if (Test-Path $file) {
    $bytes = [System.IO.File]::ReadAllBytes($file)
    $b64 = [Convert]::ToBase64String($bytes)
    [void]$sb.AppendLine("  '$key': 'data:image/png;base64,$b64',")
    Write-Host "Loaded $key"
  } else {
    Write-Host "Missing file $file"
  }
}

[void]$sb.AppendLine('};')
[System.IO.File]::WriteAllText('d:\Page\extension\assets_data.js', $sb.ToString())
Write-Host 'Generated assets_data.js successfully!'
