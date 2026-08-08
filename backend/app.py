# ⚡ Affiliate Intelligence Studio — Single Unified Database Engine v71.0 (Port 5000)
# Single Source of Truth: ~/.affiliate_intel_db.sqlite

import sys
import os
import json
import time
import sqlite3
import urllib.parse
import urllib.request
import webbrowser
import base64
import re
from http.server import HTTPServer, SimpleHTTPRequestHandler

# ==================== SINGLE UNIFIED DATABASE CONFIGURATION ====================
UNIFIED_DB_PATH = os.path.expanduser("~/.affiliate_intel_db.sqlite")
IMAGE_SAVE_DIR = os.path.expanduser("~/Pictures/AffiliateIntel_Images")
os.makedirs(IMAGE_SAVE_DIR, exist_ok=True)

WEB_DIR = os.path.expanduser("~/Desktop/AffiliateIntelligenceStudio")

def init_single_unified_db():
    conn = sqlite3.connect(UNIFIED_DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS shopee_affiliate_items (
            item_id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            original_price REAL,
            sale_price REAL,
            commission_rate REAL,
            net_profit_thb REAL,
            affiliate_link TEXT NOT NULL,
            main_image_path TEXT,
            images_json TEXT,
            total_sold INTEGER DEFAULT 0,
            rating_star REAL DEFAULT 4.9,
            shop_name TEXT DEFAULT 'Shopee Official Store',
            video_prompt TEXT,
            status TEXT DEFAULT 'PENDING_VIDEO',
            deleted_at TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()

init_single_unified_db()

def get_single_db_connection():
    return sqlite3.connect(UNIFIED_DB_PATH)

def download_product_images(image_urls, item_id):
    saved_paths = []
    for idx, url in enumerate(image_urls[:4]):
        if not url or not url.startswith("http"):
            continue
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=5) as resp:
                if resp.status == 200:
                    filename = f"{item_id}_{idx}.jpg"
                    filepath = os.path.join(IMAGE_SAVE_DIR, filename)
                    with open(filepath, 'wb') as f:
                        f.write(resp.read())
                    saved_paths.append(filepath)
        except Exception as e:
            print(f"Image download note ({idx}): {e}")
    return saved_paths

def db_save_products(items):
    conn = get_single_db_connection()
    cursor = conn.cursor()
    saved_count = 0

    for item in items:
        item_id = str(item.get('item_id', item.get('id', f"sp_{int(time.time())}")))
        title = item.get('title', 'สินค้า Shopee Affiliate')
        desc = item.get('description', title)
        orig_price = float(item.get('original_price', item.get('origPrice', 590.0) or 590.0))
        sale_price = float(item.get('sale_price', item.get('price', 390.0) or 390.0))
        comm_rate = float(str(item.get('commission_rate', item.get('comm', 22.5))).replace('%', ''))
        net_profit = float(item.get('net_profit_thb', item.get('profit', round(sale_price * (comm_rate / 100.0), 2))))
        aff_link = item.get('affiliate_link', item.get('url', 'https://shopee.co.th?af_id=X4EBLKP&mmp_pid=an_15320530167'))
        main_img = item.get('main_image_path', item.get('img', 'https://down-th.img.susercontent.com/file/sg-11134201-7rd5e-m4p50n5z0c2g7b'))
        images_list = item.get('images', [main_img])
        shop_name = item.get('shop_name', item.get('shopName', 'Shopee Official Store'))
        status = item.get('status', 'PENDING_VIDEO')

        local_paths = download_product_images(images_list, item_id)
        if local_paths:
            main_img = local_paths[0]

        sql = """
            INSERT INTO shopee_affiliate_items (
                item_id, title, description, original_price, sale_price, commission_rate, net_profit_thb, affiliate_link, main_image_path, images_json, total_sold, rating_star, shop_name, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(item_id) DO UPDATE SET
                title = excluded.title, sale_price = excluded.sale_price, commission_rate = excluded.commission_rate, net_profit_thb = excluded.net_profit_thb, shop_name = excluded.shop_name, status = excluded.status
        """
        cursor.execute(sql, (
            item_id, title, desc, orig_price, sale_price, comm_rate, net_profit, aff_link, main_img, json.dumps(images_list), 1500, 4.9, shop_name, status
        ))
        saved_count += 1

    conn.commit()
    conn.close()
    return saved_count

def db_soft_delete(item_ids):
    conn = get_single_db_connection()
    cursor = conn.cursor()
    count = 0
    for i_id in item_ids:
        cursor.execute("UPDATE shopee_affiliate_items SET status = 'TRASH_BIN', deleted_at = CURRENT_TIMESTAMP WHERE item_id = ?", (i_id,))
        count += 1
    conn.commit()
    conn.close()
    return count

def db_permanent_delete(item_ids):
    conn = get_single_db_connection()
    cursor = conn.cursor()
    count = 0
    for i_id in item_ids:
        cursor.execute("DELETE FROM shopee_affiliate_items WHERE item_id = ?", (i_id,))
        count += 1
    conn.commit()
    conn.close()
    return count

def db_restore(item_ids):
    conn = get_single_db_connection()
    cursor = conn.cursor()
    count = 0
    for i_id in item_ids:
        cursor.execute("UPDATE shopee_affiliate_items SET status = 'PENDING_VIDEO', deleted_at = NULL WHERE item_id = ?", (i_id,))
        count += 1
    conn.commit()
    conn.close()
    return count

class SingleDatabaseHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length) if content_length > 0 else b'{}'
        try:
            body = json.loads(post_data.decode('utf-8'))
        except Exception:
            body = {}

        if self.path in ["/api/save_product", "/api/save_db_permanent"]:
            items = body if isinstance(body, list) else [body]
            count = db_save_products(items)
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(json.dumps({"status": "success", "db_file": UNIFIED_DB_PATH, "saved_count": count, "message": f"Saved {count} items to single unified SQLite database!"}, ensure_ascii=False).encode('utf-8'))
            return

        elif self.path == "/api/soft_delete_product":
            item_ids = body.get("item_ids", [body.get("item_id")]) if isinstance(body, dict) else body
            count = db_soft_delete(item_ids)
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(json.dumps({"status": "success", "count": count, "message": f"Moved {count} items to 30-Day Trash Bin in unified DB!"}, ensure_ascii=False).encode('utf-8'))
            return

        elif self.path == "/api/permanent_delete_product":
            item_ids = body.get("item_ids", [body.get("item_id")]) if isinstance(body, dict) else body
            count = db_permanent_delete(item_ids)
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(json.dumps({"status": "success", "count": count, "message": f"Permanently deleted {count} items from unified DB!"}, ensure_ascii=False).encode('utf-8'))
            return

        elif self.path == "/api/restore_product":
            item_ids = body.get("item_ids", [body.get("item_id")]) if isinstance(body, dict) else body
            count = db_restore(item_ids)
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(json.dumps({"status": "success", "count": count, "message": f"Restored {count} items in unified DB!"}, ensure_ascii=False).encode('utf-8'))
            return

        super().do_POST()

    def do_GET(self):
        if self.path in ["/api/fetch_products", "/api/search_db"]:
            conn = get_single_db_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT item_id, title, original_price, sale_price, commission_rate, net_profit_thb, affiliate_link, main_image_path, shop_name, status, created_at FROM shopee_affiliate_items WHERE status != 'TRASH_BIN' ORDER BY created_at DESC")
            rows = cursor.fetchall()
            items = []
            for r in rows:
                items.append({
                    "item_id": r[0], "title": r[1], "original_price": float(r[2]),
                    "sale_price": float(r[3]), "commission_rate": float(r[4]),
                    "net_profit_thb": float(r[5]), "affiliate_link": r[6],
                    "main_image_path": r[7], "shop_name": r[8], "status": r[9], "created_at": r[10]
                })
            conn.close()
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(json.dumps({"status": "success", "db_file": UNIFIED_DB_PATH, "count": len(items), "items": items}, ensure_ascii=False).encode('utf-8'))
            return

        elif self.path == "/api/fetch_trash_bin":
            conn = get_single_db_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT item_id, title, original_price, sale_price, commission_rate, net_profit_thb, affiliate_link, main_image_path, shop_name, status, deleted_at FROM shopee_affiliate_items WHERE status = 'TRASH_BIN' ORDER BY deleted_at DESC")
            rows = cursor.fetchall()
            items = []
            for r in rows:
                items.append({
                    "item_id": r[0], "title": r[1], "original_price": float(r[2]),
                    "sale_price": float(r[3]), "commission_rate": float(r[4]),
                    "net_profit_thb": float(r[5]), "affiliate_link": r[6],
                    "main_image_path": r[7], "shop_name": r[8], "status": r[9], "deleted_at": r[10]
                })
            conn.close()
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(json.dumps({"status": "success", "db_file": UNIFIED_DB_PATH, "count": len(items), "items": items}, ensure_ascii=False).encode('utf-8'))
            return

        elif self.path == "/api/test_ping":
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(json.dumps({"status": "success", "db_file": UNIFIED_DB_PATH, "message": "Single Unified SQLite Database Engine v71.0 is running OK!"}).encode('utf-8'))
            return

        super().do_GET()

if __name__ == '__main__':
    port = 5000
    print(f"🚀 Starting Single Unified SQLite Database Server v71.0 on Port {port}...")
    try:
        server = HTTPServer(('0.0.0.0', port), SingleDatabaseHandler)
        server.serve_forever()
    except Exception as e:
        print(f"Port {port} note: {e}")
