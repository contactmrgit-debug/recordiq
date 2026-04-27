$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$compileArgs = @(
  'exec',
  '--',
  'tsc',
  '-p',
  'tsconfig.regression.json'
)

function Restore-TrackedTmpRegressionFiles {
  $trackedFiles = @(git ls-files -- 'tmp-regression')

  foreach ($file in $trackedFiles) {
    if ([string]::IsNullOrWhiteSpace($file)) {
      continue
    }

    $processStartInfo = New-Object System.Diagnostics.ProcessStartInfo
    $processStartInfo.FileName = 'git'
    $processStartInfo.Arguments = "show HEAD:$file"
    $processStartInfo.WorkingDirectory = $root
    $processStartInfo.UseShellExecute = $false
    $processStartInfo.RedirectStandardOutput = $true
    $processStartInfo.RedirectStandardError = $true
    $processStartInfo.CreateNoWindow = $true

    $process = New-Object System.Diagnostics.Process
    $process.StartInfo = $processStartInfo

    if (-not $process.Start()) {
      throw "Failed to restore $file"
    }

    $outputStream = New-Object System.IO.MemoryStream
    $process.StandardOutput.BaseStream.CopyTo($outputStream)
    $process.WaitForExit()

    if ($process.ExitCode -ne 0) {
      $errorText = $process.StandardError.ReadToEnd()
      throw "Failed to restore $file`: $errorText"
    }

    $restoredText = [System.Text.Encoding]::UTF8.GetString($outputStream.ToArray())
    $normalizedText = $restoredText -replace "`r?`n", "`r`n"
    [System.IO.File]::WriteAllText(
      (Join-Path $root $file),
      $normalizedText,
      [System.Text.UTF8Encoding]::new($false)
    )
  }
}

function Remove-UntrackedTmpRegressionFiles {
  $untrackedFiles = @(git ls-files --others --exclude-standard -- 'tmp-regression')

  foreach ($file in $untrackedFiles) {
    if ([string]::IsNullOrWhiteSpace($file)) {
      continue
    }

    Remove-Item -LiteralPath (Join-Path $root $file) -Force
  }
}

function Clear-TmpRegression {
  Restore-TrackedTmpRegressionFiles
  Remove-UntrackedTmpRegressionFiles
}

Push-Location $root
try {
  Clear-TmpRegression

  & npm @compileArgs

  $env:TIMELINE_REGRESSION_WRITE_OUTPUT = '0'
  & node -r ./scripts/register-regression-paths.cjs tmp-regression/test-regression/run-regression.js
}
finally {
  Clear-TmpRegression
  Pop-Location
}
