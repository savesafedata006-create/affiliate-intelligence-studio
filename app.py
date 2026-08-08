# ⚡ Affiliate Intelligence Studio — Universal Database & 30-Day Trash Bin Engine v70.0
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

# ==================== CONFIGURATION & DIRECTORIES ====================
APP_KEY = os.environ.get("SHOPEE_APP_KEY", "an_15320530167")
APP_SECRET = os.environ.get("SHOPEE_APP_SECRET", "X4EBLKP_SECRET")

IMAGE_SAVE_DIR = os.path.expanduser("~/Pictures/AffiliateIntel_Images")
os.makedirs(IMAGE_SAVE_DIR, exist_ok=True)

DB_PATH = os.path.expanduser("~/.affiliate_intel_db.sqlite")
WEB_DIR = os.path.expanduser("~/Desktop/AffiliateIntelligenceStudio")

def init_db():
    conn = sqlite3.connect(DB_PATH)
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

init_db()

def get_db_connection():
    try:
        import mysql.connector
        conn = mysql.connector.connect(host='localhost', user='root', password='', database='shopee_affiliate_db')
        return conn, "MYSQL"
    except Exception:
        conn = sqlite3.connect(DB_PATH)
        return conn, "SQLITE"

def save_products_permanently(items):
    conn, db_type = get_db_connection()
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

        if db_type == "MYSQL":
            sql = """
                INSERT INTO shopee_affiliate_items (
                    item_id, title, description, original_price, sale_price, commission_rate, net_profit_thb, affiliate_link, main_image_path, images_json, total_sold, rating_star, shop_name, status
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE
                    title = VALUES(title), sale_price = VALUES(sale_price), commission_rate = VALUES(commission_rate), net_profit_thb = VALUES(net_profit_thb), status = VALUES(status)
            """
            cursor.execute(sql, (
                item_id, title, desc, orig_price, sale_price, comm_rate, net_profit, aff_link, main_img, json.dumps(images_list), 1500, 4.9, shop_name, status
            ))
        else:
            sql = """
                INSERT INTO shopee_affiliate_items (
                    item_id, title, description, original_price, sale_price, commission_rate, net_profit_thb, affiliate_link, main_image_path, images_json, total_sold, rating_star, shop_name, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(item_id) DO UPDATE SET
                    title = excluded.title, sale_price = excluded.sale_price, commission_rate = excluded.commission_rate, net_profit_thb = excluded.net_profit_thb, status = excluded.status
            """
            cursor.execute(sql, (
                item_id, title, desc, orig_price, sale_price, comm_rate, net_profit, aff_link, main_img, json.dumps(images_list), 1500, 4.9, shop_name, status
            ))
        saved_count += 1

    conn.commit()
    conn.close()
    return saved_count, db_type

def soft_delete_products(item_ids):
    """ย้ายสินค้าเข้าถังขยะ 30 วันในฐานข้อมูลถาวร"""
    conn, db_type = get_db_connection()
    cursor = conn.cursor()
    deleted_count = 0

    for i_id in item_ids:
        if db_type == "MYSQL":
            cursor.execute("UPDATE shopee_affiliate_items SET status = 'TRASH_BIN', deleted_at = CURRENT_TIMESTAMP WHERE item_id = %s", (i_id,))
        else:
            cursor.execute("UPDATE shopee_affiliate_items SET status = 'TRASH_BIN', deleted_at = CURRENT_TIMESTAMP WHERE item_id = ?", (i_id,))
        deleted_count += 1

    conn.commit()
    conn.close()
    return deleted_count

def permanent_delete_products(item_ids):
    """ลบสินค้าออกจากฐานข้อมูลถาวร 100%"""
    conn, db_type = get_db_connection()
    cursor = conn.cursor()
    deleted_count = 0

    for i_id in item_ids:
        if db_type == "MYSQL":
            cursor.execute("DELETE FROM shopee_affiliate_items WHERE item_id = %s", (i_id,))
        else:
            cursor.execute("DELETE FROM shopee_affiliate_items WHERE item_id = ?", (i_id,))
        deleted_count += 1

    conn.commit()
    conn.close()
    return deleted_count

def restore_products_from_trash(item_ids):
    """กู้คืนสินค้าจากถังขยะกลับเข้าสู่ระบบถาวร"""
    conn, db_type = get_db_connection()
    cursor = conn.cursor()
    restored_count = 0

    for i_id in item_ids:
        if db_type == "MYSQL":
            cursor.execute("UPDATE shopee_affiliate_items SET status = 'PENDING_VIDEO', deleted_at = NULL WHERE item_id = %s", (i_id,))
        else:
            cursor.execute("UPDATE shopee_affiliate_items SET status = 'PENDING_VIDEO', deleted_at = NULL WHERE item_id = ?", (i_id,))
        restored_count += 1

    conn.commit()
    conn.close()
    return restored_count

# ==================== CUSTOM REQUEST HANDLER WITH HARDENED DB PERSISTENCE ====================
class UniversalPipelineHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=WEB_DIR, **kwargs)

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
            count, db_type = save_products_permanently(items)
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(json.dumps({"status": "success", "db_engine": db_type, "saved_count": count, "message": f"Saved {count} items permanently to {db_type}!"}, ensure_ascii=False).encode('utf-8'))
            return

        elif self.path == "/api/soft_delete_product":
            item_ids = body.get("item_ids", [body.get("item_id")]) if isinstance(body, dict) else body
            count = soft_delete_products(item_ids)
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(json.dumps({"status": "success", "count": count, "message": f"Moved {count} items to 30-Day Trash Bin!"}, ensure_ascii=False).encode('utf-8'))
            return

        elif self.path == "/api/permanent_delete_product":
            item_ids = body.get("item_ids", [body.get("item_id")]) if isinstance(body, dict) else body
            count = permanent_delete_products(item_ids)
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(json.dumps({"status": "success", "count": count, "message": f"Permanently deleted {count} items from database!"}, ensure_ascii=False).encode('utf-8'))
            return

        elif self.path == "/api/restore_product":
            item_ids = body.get("item_ids", [body.get("item_id")]) if isinstance(body, dict) else body
            count = restore_products_from_trash(item_ids)
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(json.dumps({"status": "success", "count": count, "message": f"Restored {count} items to main catalog!"}, ensure_ascii=False).encode('utf-8'))
            return

        super().do_POST()

    def do_GET(self):
        if self.path in ["/api/fetch_products", "/api/search_db"]:
            conn, db_type = get_db_connection()
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
            self.wfile.write(json.dumps({"status": "success", "db_engine": db_type, "count": len(items), "items": items}, ensure_ascii=False).encode('utf-8'))
            return

        elif self.path == "/api/fetch_trash_bin":
            conn, db_type = get_db_connection()
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
            self.wfile.write(json.dumps({"status": "success", "db_engine": db_type, "count": len(items), "items": items}, ensure_ascii=False).encode('utf-8'))
            return

        elif self.path == "/api/test_ping":
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(json.dumps({"status": "success", "message": "Backend Hardened Database Engine v70.0 is running OK!"}).encode('utf-8'))
            return
        super().do_GET()

if __name__ == '__main__':
    url = "http://127.0.0.1:8080"
    print(f"🚀 Starting Database & 30-Day Trash Bin Server v70.0 at {url}...")
    try:
        server = HTTPServer(('0.0.0.0', 8080), UniversalPipelineHandler)
        server.serve_forever()
    except Exception as e:
        print(f"Server note: {e}")
