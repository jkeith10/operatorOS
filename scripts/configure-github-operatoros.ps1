# Requires GitHub CLI: https://cli.github.com/
# Run from repo root after: gh auth login
#
# Updates repository "About" metadata and repository topics.

$ErrorActionPreference = "Stop"
$Repo = "jkeith10/operatorOS"

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
  Write-Host "Install GitHub CLI (gh), run 'gh auth login', then re-run this script." -ForegroundColor Yellow
  Write-Host "Manual checklist: doc/RELEASING.md (GitHub repository settings)." -ForegroundColor Yellow
  exit 1
}

$Description = "AI agent control plane—goals, governance, budgets, board UI. Apache-2.0. Fork of Paperclip."
$Homepage = "https://github.com/jkeith10/operatorOS"

gh repo edit $Repo --description $Description --homepage $Homepage

$topics = @(
  "operatoros", "ai-agents", "multi-agent-systems", "orchestration",
  "openclaw", "paperclip", "typescript", "react", "nodejs"
)
foreach ($t in $topics) {
  gh repo edit $Repo --add-topic $t 2>$null
}

Write-Host "Updated About and topics for $Repo." -ForegroundColor Green
Write-Host "Add branch protection via GitHub UI (Settings > Branches) — see doc/RELEASING.md." -ForegroundColor Cyan
