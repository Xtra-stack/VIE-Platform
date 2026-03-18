#!/bin/bash

# Database restore script for recovering from backups
# Usage: ./scripts/restore.sh <backup_file>

set -e

if [ -z "$1" ]; then
    echo "❌ Usage: $0 <backup_file>"
    echo ""
    echo "Available backups:"
    ls -lh ./backups/vie_backup_*.tar.gz 2>/dev/null || echo "No backups found"
    exit 1
fi

BACKUP_FILE=$1
MONGO_HOST=${MONGO_HOST:-mongodb}
MONGO_PORT=${MONGO_PORT:-27017}
MONGO_DB=${MONGO_DB:-vie}
MONGO_USER=${MONGO_ROOT_USER:-admin}
MONGO_PASSWORD=${MONGO_ROOT_PASSWORD}
TEMP_RESTORE="/tmp/vie_restore_$$"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "🔄 Starting database restore..."
echo "Backup file: $BACKUP_FILE"
echo "Target database: $MONGO_DB"
echo ""
echo "⚠️  WARNING: This will overwrite the existing database!"
read -p "Are you sure? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "❌ Restore cancelled"
    exit 0
fi

echo ""

# Create temporary directory
mkdir -p "$TEMP_RESTORE"

# Extract backup
echo "⏳ Extracting backup..."
tar -xzf "$BACKUP_FILE" -C "$TEMP_RESTORE"

if [ $? -eq 0 ]; then
    echo "✅ Backup extracted"
else
    echo "❌ Failed to extract backup"
    rm -rf "$TEMP_RESTORE"
    exit 1
fi

# Restore database
echo "⏳ Restoring MongoDB database..."

mongorestore \
    --host "$MONGO_HOST:$MONGO_PORT" \
    --username "$MONGO_USER" \
    --password "$MONGO_PASSWORD" \
    --authenticationDatabase admin \
    --db "$MONGO_DB" \
    --drop \
    "$TEMP_RESTORE/mongodb/$MONGO_DB"

if [ $? -eq 0 ]; then
    echo "✅ Database restore completed"
else
    echo "❌ Database restore failed"
    rm -rf "$TEMP_RESTORE"
    exit 1
fi

# Cleanup
rm -rf "$TEMP_RESTORE"

echo ""
echo "✅ Restore process completed successfully!"
echo ""
echo "📝 Next steps:"
echo "  1. Verify the restored data"
echo "  2. Test application functionality"
echo "  3. Monitor logs for any issues"
