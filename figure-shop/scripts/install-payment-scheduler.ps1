param([string]$TaskName = "FigureShop-PaymentReconciliation")
$ErrorActionPreference = "Stop"
$projectDirectory = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$nodeExecutable = (Get-Command node.exe).Source
$runner = Join-Path $projectDirectory "node_modules\tsx\dist\cli.mjs"
$reconcileScript = Join-Path $projectDirectory "scripts\reconcile-payments.ts"
if (-not (Test-Path -LiteralPath $runner)) { throw "Run npm install first." }
$arguments = '"' + $runner + '" "' + $reconcileScript + '"'
$action = New-ScheduledTaskAction -Execute $nodeExecutable -Argument $arguments -WorkingDirectory $projectDirectory
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(1) -RepetitionInterval (New-TimeSpan -Minutes 5)
$settings = New-ScheduledTaskSettingsSet -MultipleInstances IgnoreNew -ExecutionTimeLimit (New-TimeSpan -Minutes 10) -StartWhenAvailable
Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Settings $settings -Description "Reconcile Figure Shop payment attempts every five minutes while this user is logged on."
