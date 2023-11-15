$totalTime = 0
$iterations = 50

for ($i = 0; $i -lt $iterations; $i++) {
    $executionTime = (Measure-Command { cargo run }).TotalMilliseconds
    $totalTime += $executionTime
    # Write-Host "Iteration $i: $executionTime ms"
    Write-Host "Iteration $($i): $executionTime ms"
}

$averageTime = $totalTime / $iterations
Write-Host "Average execution time: $averageTime ms"
