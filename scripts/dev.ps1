# PowerShell script for Windows development

param(
    [Parameter(Position=0)]
    [string]$Command = "help"
)

function Show-Help {
    Write-Host "flowcn - Docker-based development commands (Windows PowerShell)"
    Write-Host ""
    Write-Host "Usage: .\scripts\dev.ps1 <command>"
    Write-Host ""
    Write-Host "Commands:"
    Write-Host "  dev       - Start development server with hot reload"
    Write-Host "  build     - Build all packages and apps"
    Write-Host "  test      - Run all tests"
    Write-Host "  install   - Install dependencies"
    Write-Host "  shell     - Open a shell in the dev container"
    Write-Host "  clean     - Clean Docker volumes and images"
    Write-Host "  help      - Show this help message"
}

function Start-Dev {
    Write-Host "Starting development server..."
    docker compose up dev
}

function Start-Build {
    Write-Host "Building all packages..."
    docker compose run --rm dev pnpm build
}

function Start-Test {
    Write-Host "Running tests..."
    docker compose run --rm dev pnpm test
}

function Start-Install {
    Write-Host "Installing dependencies..."
    docker compose run --rm dev pnpm install
}

function Start-Shell {
    Write-Host "Opening shell in dev container..."
    docker compose run --rm dev sh
}

function Start-Clean {
    Write-Host "Cleaning Docker volumes and images..."
    docker compose down -v
    docker rmi flowcn-dev, flowcn-prod -ErrorAction SilentlyContinue
    Write-Host "Cleanup complete"
}

switch ($Command.ToLower()) {
    "dev" { Start-Dev }
    "build" { Start-Build }
    "test" { Start-Test }
    "install" { Start-Install }
    "shell" { Start-Shell }
    "clean" { Start-Clean }
    "help" { Show-Help }
    default {
        Write-Host "Unknown command: $Command"
        Write-Host ""
        Show-Help
        exit 1
    }
}
