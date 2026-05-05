#!/bin/zsh
# deploy.sh — push + rafraîchissement automatique Facebook OG
# Usage : ./deploy.sh "message de commit"

set -e
cd "$(dirname "$0")"

MSG="${1:-mise à jour}"

echo "🔧 Génération des pages-passerelles articles (pour preview Facebook)..."
node scripts/generer-pages-articles.js

echo "📦 Commit et push..."
git add -A
git commit -m "$MSG" 2>/dev/null || echo "  (rien à committer)"
git pull --rebase --quiet
git push

echo "📘 Ouverture du débogueur Facebook..."
URL="${2:-https://vizilleenmouvement.fr}"
ENCODED=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$URL', safe=''))")
open "https://developers.facebook.com/tools/debug/?q=${ENCODED}"

echo "✅ Déployé : $MSG"
