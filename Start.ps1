$ErrorActionPreference = 'Stop'
$taskNode = Get-Command node -ErrorAction SilentlyContinue
if ($taskNode) { $taskRuntime = $taskNode.Source }
else { $taskRuntime = Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' }
if (-not (Test-Path -LiteralPath $taskRuntime)) { throw 'Node.js 실행 파일이 필요합니다.' }
Write-Host '브라우저에서 http://127.0.0.1:8000/ 를 여세요. 종료: Ctrl+C'
& $taskRuntime (Join-Path $PSScriptRoot 'server.mjs')
