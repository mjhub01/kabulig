$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$phpCommand = Get-Command php -ErrorAction Stop
$php = $phpCommand.Source
$sessionDir = Join-Path $root 'var\sessions'
New-Item -ItemType Directory -Path $sessionDir -Force | Out-Null
$env:PATH = "C:\Program Files\PostgreSQL\18\bin;$env:PATH"
& $php -d "session.save_path=$sessionDir" -S 127.0.0.1:8000 -t $root
