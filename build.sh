#!/usr/bin/env bash
# Gera os arquivos minificados usados pelo index.html.
# O site continua 100% estático: este passo só é necessário ao editar script.js/style.css.
set -euo pipefail
cd "$(dirname "$0")"

npx --yes terser@5 script.js --module -c passes=2 -m --comments false --ecma 2020 -o script.min.js
npx --yes csso-cli@4 style.css -o style.min.css

printf 'script.min.js  %s\nstyle.min.css  %s\n' \
  "$(wc -c < script.min.js) bytes" "$(wc -c < style.min.css) bytes"
