#!/bin/bash
echo "🚀 Memulai Proses Update Redfox ERP..."

# 1. Tarik kode terbaru dari GitHub (jika Anda coding di laptop)
# git pull origin main 

echo "📦 Membangun ulang aset visual (React/Tailwind)..."
docker exec -i redvox-erp-app-1 npm run build

echo "🧹 Membersihkan Cache Laravel..."
docker exec -i redvox-erp-app-1 php artisan optimize:clear

echo "✅ Update Selesai, Bos Win! Sistem sudah menggunakan kode terbaru."