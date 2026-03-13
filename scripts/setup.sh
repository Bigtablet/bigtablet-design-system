#!/usr/bin/env sh
# setup.sh — Bigtablet Design System installer
# Usage: curl -fsSL https://raw.githubusercontent.com/Bigtablet/bigtablet-design-system/main/scripts/setup.sh | sh

set -e

PACKAGE="@bigtablet/design-system"
PEER_REACT="react@^19 react-dom@^19"
PEER_LUCIDE="lucide-react"

# ── Colors ───────────────────────────────────────────────────────────────────
if [ -t 1 ]; then
  BOLD="\033[1m"; RESET="\033[0m"
  GREEN="\033[32m"; CYAN="\033[36m"; YELLOW="\033[33m"; GRAY="\033[90m"
else
  BOLD=""; RESET=""; GREEN=""; CYAN=""; YELLOW=""; GRAY=""
fi

info()    { printf "${CYAN}ℹ ${RESET}%s\n" "$*"; }
success() { printf "${GREEN}✔ ${RESET}%s\n" "$*"; }
warn()    { printf "${YELLOW}⚠ ${RESET}%s\n" "$*"; }
step()    { printf "\n${BOLD}%s${RESET}\n" "$*"; }
code()    { printf "${GRAY}  %s${RESET}\n" "$*"; }

# ── Banner ────────────────────────────────────────────────────────────────────
printf "\n${BOLD}${CYAN}Bigtablet Design System — Setup${RESET}\n"
printf "${GRAY}─────────────────────────────────${RESET}\n\n"

# ── Detect package manager ────────────────────────────────────────────────────
detect_pm() {
  if [ -f "pnpm-lock.yaml" ]; then echo "pnpm"
  elif [ -f "bun.lockb" ] || [ -f "bun.lock" ]; then echo "bun"
  elif [ -f "yarn.lock" ]; then echo "yarn"
  else echo "npm"
  fi
}

PM=$(detect_pm)
info "Detected package manager: ${BOLD}${PM}${RESET}"

# ── Detect environment ────────────────────────────────────────────────────────
detect_env() {
  for config_file in next.config.js next.config.ts next.config.mjs next.config.cjs; do
    if [ -f "$config_file" ]; then
      echo "nextjs"
      return
    fi
  done
  echo "react"
}

ENV=$(detect_env)
info "Detected environment:     ${BOLD}${ENV}${RESET}"

# ── Decide peer deps ──────────────────────────────────────────────────────────
if [ "$ENV" = "nextjs" ]; then
  PEERS="$PEER_LUCIDE"
  # next + react already in project, only lucide-react is truly new
else
  PEERS="$PEER_REACT $PEER_LUCIDE"
fi

# ── Install ───────────────────────────────────────────────────────────────────
step "1 / 3  Installing packages"

# run_install: avoids eval while keeping the command visible in logs
run_install() {
  info "Running: ${BOLD}$*${RESET}"
  "$@"
}

# shellcheck disable=SC2086  # intentional word-split on $PEERS
case "$PM" in
  pnpm) run_install pnpm add "$PACKAGE" $PEERS ;;
  bun)  run_install bun  add "$PACKAGE" $PEERS ;;
  yarn) run_install yarn add "$PACKAGE" $PEERS ;;
  npm)  run_install npm install "$PACKAGE" $PEERS ;;
esac

success "Packages installed"

# ── Print setup instructions ──────────────────────────────────────────────────
step "2 / 3  CSS import"
info "Add the following import once at the root of your app:"

if [ "$ENV" = "nextjs" ]; then
  printf "\n"
  code "// app/layout.tsx  (or pages/_app.tsx)"
  code "import '@bigtablet/design-system/style.css';"
else
  printf "\n"
  code "// src/main.tsx  (or index.tsx)"
  code "import '@bigtablet/design-system/style.css';"
fi

# ── Provider setup ────────────────────────────────────────────────────────────
step "3 / 3  Provider setup (Alert & Toast)"
info "Wrap your app with the required providers:"

if [ "$ENV" = "nextjs" ]; then
  printf "\n"
  code "// app/layout.tsx"
  code "import { AlertProvider, ToastProvider } from '@bigtablet/design-system/next';"
  code ""
  code "export default function RootLayout({ children }) {"
  code "  return ("
  code "    <html lang=\"ko\">"
  code "      <body>"
  code "        <AlertProvider>"
  code "          <ToastProvider>{children}</ToastProvider>"
  code "        </AlertProvider>"
  code "      </body>"
  code "    </html>"
  code "  );"
  code "}"
else
  printf "\n"
  code "// src/main.tsx"
  code "import { AlertProvider, ToastProvider } from '@bigtablet/design-system';"
  code ""
  code "ReactDOM.createRoot(document.getElementById('root')!).render("
  code "  <AlertProvider>"
  code "    <ToastProvider><App /></ToastProvider>"
  code "  </AlertProvider>"
  code ");"
fi

# ── Done ──────────────────────────────────────────────────────────────────────
printf "\n${GREEN}${BOLD}✔ Bigtablet Design System setup complete!${RESET}\n"
info "Docs: https://github.com/Bigtablet/bigtablet-design-system"
printf "\n"
