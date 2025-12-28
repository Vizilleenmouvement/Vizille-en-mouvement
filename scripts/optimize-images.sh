#!/bin/bash
# Script d'optimisation des images pour Vizille en Mouvement
# Ce script compresse les images PNG et JPG et génère des versions WebP

echo "🖼️  Optimisation des images Vizille en Mouvement"
echo "================================================="

# Vérifier si les outils sont installés
check_tool() {
    if ! command -v $1 &> /dev/null; then
        echo "⚠️  $1 n'est pas installé. Installation recommandée:"
        echo "   brew install $1"
        return 1
    fi
    return 0
}

# Dossier source
IMAGES_DIR="./images"
BACKUP_DIR="./images-backup"

# Créer une sauvegarde
if [ ! -d "$BACKUP_DIR" ]; then
    echo "📁 Création de la sauvegarde..."
    cp -r "$IMAGES_DIR" "$BACKUP_DIR"
fi

echo ""
echo "📊 Taille actuelle des images:"
du -sh "$IMAGES_DIR"
echo ""

# Liste des fichiers à optimiser
echo "📋 Fichiers trouvés:"
ls -lh "$IMAGES_DIR"/*.{png,jpg,jpeg} 2>/dev/null
echo ""

# Option 1: Utiliser ImageMagick (si disponible)
if check_tool "convert"; then
    echo "🔄 Optimisation avec ImageMagick..."

    for img in "$IMAGES_DIR"/*.png; do
        if [ -f "$img" ]; then
            filename=$(basename "$img")
            echo "  Optimisation: $filename"
            convert "$img" -strip -quality 85 "$img"
        fi
    done

    for img in "$IMAGES_DIR"/*.{jpg,jpeg}; do
        if [ -f "$img" ]; then
            filename=$(basename "$img")
            echo "  Optimisation: $filename"
            convert "$img" -strip -quality 85 "$img"
        fi
    done
fi

# Option 2: Générer des WebP
if check_tool "cwebp"; then
    echo ""
    echo "🔄 Génération des versions WebP..."

    for img in "$IMAGES_DIR"/*.{png,jpg,jpeg}; do
        if [ -f "$img" ]; then
            filename=$(basename "$img")
            name="${filename%.*}"
            echo "  WebP: $name.webp"
            cwebp -q 80 "$img" -o "$IMAGES_DIR/$name.webp" 2>/dev/null
        fi
    done
fi

echo ""
echo "📊 Nouvelle taille des images:"
du -sh "$IMAGES_DIR"
echo ""

echo "✅ Optimisation terminée!"
echo ""
echo "💡 Pour une compression plus agressive, utilisez:"
echo "   npx @squoosh/cli --webp '{\"quality\":75}' images/*.png"
echo "   npx @squoosh/cli --mozjpeg '{\"quality\":80}' images/*.jpg"
