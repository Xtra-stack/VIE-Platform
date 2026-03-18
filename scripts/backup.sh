#!/bin/bash

# Database backup script for production environments
# Usage: ./scripts/backup.sh

set -e

BACKUP_DIR=${BACKUP_DIR:-./backups}
BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/vie_backup_$BACKUP_DATE.tar.gz"
MONGO_HOST=${MONGO_HOST:-mongodb}
MONGO_PORT=${MONGO_PORT:-27017}
MONGO_DB=${MONGO_DB:-vie}
MONGO_USER=${MONGO_ROOT_USER:-admin}
MONGO_PASSWORD=${MONGO_ROOT_PASSWORD}
RETENTION_DAYS=${RETENTION_DAYS:-30}

echo "📦 Starting database backup..."
echo "Backup directory: $BACKUP_DIR"
echo "Target database: $MONGO_DB"
echo ""

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Create temporary backup
TEMP_BACKUP="/tmp/vie_backup_$BACKUP_DATE"
mkdir -p "$TEMP_BACKUP"

echo "⏳ Dumping MongoDB database..."

# Export database
mongodump \
    --host "$MONGO_HOST:$MONGO_PORT" \
    --username "$MONGO_USER" \
    --password "$MONGO_PASSWORD" \
    --authenticationDatabase admin \
    --db "$MONGO_DB" \
    --out "$TEMP_BACKUP/mongodb"

if [ $? -eq 0 ]; then
    echo "✅ MongoDB dump completed"
else
    echo "❌ MongoDB dump failed"
    rm -rf "$TEMP_BACKUP"
    exit 1
fi

# Create tar archive
echo "⏳ Creating archive..."
cd "$TEMP_BACKUP"
tar -czf "$BACKUP_FILE" .
cd - > /dev/null

if [ $? -eq 0 ]; then
    echo "✅ Archive created: $BACKUP_FILE"
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo "   Size: $BACKUP_SIZE"
else
    echo "❌ Archive creation failed"
    rm -rf "$TEMP_BACKUP"
    exit 1
fi

# Cleanup temporary files
rm -rf "$TEMP_BACKUP"

# Cleanup old backups
echo "🧹 Cleaning up old backups (older than $RETENTION_DAYS days)..."
find "$BACKUP_DIR" -name "vie_backup_*.tar.gz" -mtime +$RETENTION_DAYS -delete

# Count remaining backups
BACKUP_COUNT=$(find "$BACKUP_DIR" -name "vie_backup_*.tar.gz" | wc -l)
echo "✅ Backup completed"
echo "   Total backups retained: $BACKUP_COUNT"
echo ""

# Optional: Upload to S3
if [ ! -z "$S3_BUCKET" ]; then
    echo "📤 Uploading to S3..."
    if command -v aws &> /dev/null; then
        S3_KEY="database-backups/vie_backup_$BACKUP_DATE.tar.gz"
        aws s3 cp "$BACKUP_FILE" "s3://$S3_BUCKET/$S3_KEY" \
            --region "${AWS_REGION:-us-east-1}" \
            --metadata "backup-date=$BACKUP_DATE,database=$MONGO_DB"
        
        if [ $? -eq 0 ]; then
            echo "✅ Upload to S3 completed"
        else
            echo "⚠️  S3 upload failed (continuing anyway)"
        fi
    else
        echo "⚠️  AWS CLI not found, skipping S3 upload"
    fi
fi

echo "✅ Backup process completed successfully!"
