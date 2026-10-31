function Test-Huh([array]$rows, [double]$avgFaceLum) {
  $darkThresh = [Math]::Min(38.0, [Math]::Max(22.0, $avgFaceLum * 0.42))
  $maxVerticalGap = 0
  $currentStreak = 0
  $totalDark = 0

  for ($y = 0; $y -lt $rows.Count; $y++) {
    $openCols = 0
    $row = $rows[$y]
    for ($c = 0; $c -lt $row.Count; $c++) {
      if ($row[$c] -lt $darkThresh) {
        $openCols++
        $totalDark++
      }
    }
    if ($openCols -ge 2) {
      $currentStreak++
      if ($currentStreak -gt $maxVerticalGap) { $maxVerticalGap = $currentStreak }
    } else {
      $currentStreak = 0
    }
  }
  return [PSCustomObject]@{
    DarkThresh = $darkThresh
    MaxGap = $maxVerticalGap
    TotalDark = $totalDark
    IsHuh = ($maxVerticalGap -ge 3 -and $totalDark -ge 6)
  }
}

$closed = @(
  @(80, 80, 80),
  @(34, 34, 34),
  @(65, 65, 65),
  @(28, 28, 28),
  @(60, 60, 60),
  @(35, 35, 35),
  @(80, 80, 80)
)

$open = @(
  @(80, 80, 80),
  @(65, 65, 65),
  @(22, 22, 22),
  @(20, 20, 20),
  @(21, 21, 21),
  @(25, 25, 25),
  @(60, 60, 60),
  @(80, 80, 80)
)

Write-Host "--- CLOSED MOUTH ---"
Test-Huh $closed 85.0 | Format-List
Write-Host "--- OPEN MOUTH HUH ---"
Test-Huh $open 85.0 | Format-List
