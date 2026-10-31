param()
$files = Get-ChildItem -Path "d:\Page\extension" -Filter "*.js" -Recurse | Where-Object { $_.Name -ne "assets_data.js" }
foreach ($file in $files) {
    $txt = [System.IO.File]::ReadAllText($file.FullName)
    $op = [System.Text.RegularExpressions.Regex]::Matches($txt, '\(').Count
    $cp = [System.Text.RegularExpressions.Regex]::Matches($txt, '\)').Count
    $ob = [System.Text.RegularExpressions.Regex]::Matches($txt, '\{').Count
    $cb = [System.Text.RegularExpressions.Regex]::Matches($txt, '\}').Count
    $obk = [System.Text.RegularExpressions.Regex]::Matches($txt, '\[').Count
    $cbk = [System.Text.RegularExpressions.Regex]::Matches($txt, '\]').Count
    
    $isOk = ($op -eq $cp) -and ($ob -eq $cb) -and ($obk -eq $cbk)
    Write-Host "$($file.Name) : $(if ($isOk) { 'PASS' } else { 'FAIL' }) (Parens: $op/$cp, Braces: $ob/$cb, Brackets: $obk/$cbk)"
}
