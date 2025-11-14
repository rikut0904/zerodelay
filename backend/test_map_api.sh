#!/bin/bash

echo "==================================="
echo "マップAPI テストスクリプト"
echo "==================================="
echo ""

BASE_URL="http://localhost:8080"

# サーバーが起動しているか確認
echo "1. ヘルスチェック"
curl -s ${BASE_URL}/health | jq . || echo "ヘルスチェック失敗"
echo ""
echo ""

# 全ての場所を取得
echo "2. 全てのマップ場所を取得 (GET /api/map/places)"
curl -s ${BASE_URL}/api/map/places | jq . || echo "場所の取得に失敗"
echo ""
echo ""

# 範囲指定で場所を取得
echo "3. 指定範囲内の場所を取得 (POST /api/map/places/bounds)"
echo "   範囲: 北緯37.0, 南緯36.0, 東経137.0, 西経136.0"
curl -s -X POST ${BASE_URL}/api/map/places/bounds \
  -H "Content-Type: application/json" \
  -d '{
    "north_lat": 37.0,
    "south_lat": 36.0,
    "east_lon": 137.0,
    "west_lon": 136.0
  }' | jq . || echo "範囲検索に失敗"
echo ""
echo ""

echo "==================================="
echo "テスト完了"
echo "==================================="
