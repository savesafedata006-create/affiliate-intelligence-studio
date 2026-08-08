# ⚡ Shopee Affiliate Pipeline — Universal Zero-Dependency Backend Server v65.0
import sys
import os
import json
import time
import sqlite3
import urllib.parse
import urllib.request
import webbrowser
import re
from http.server import HTTPServer, SimpleHTTPRequestHandler

# ==================== CONFIGURATION & DIRECTORIES ====================
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '',
    'database': 'shopee_affiliate_db'
}

IMAGE_SAVE_DIR = os.path.expanduser("~/Pictures/AffiliateIntel_Images")
os.makedirs(IMAGE_SAVE_DIR, exist_ok=True)

SQLITE_DB_PATH = os.path.expanduser("~/.affiliate_intel_db.sqlite")
WEB_DIR = os.path.expanduser("~/Desktop/AffiliateIntelligenceStudio")

def init_db():
    conn = sqlite3.connect(SQLITE_DB_PATH)
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
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()

init_db()

def get_db_connection():
    try:
        import mysql.connector
        conn = mysql.connector.connect(**DB_CONFIG)
        return conn, "MYSQL"
    except Exception:
        conn = sqlite3.connect(SQLITE_DB_PATH)
        return conn, "SQLITE"

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

def save_products_handler(items):
    conn, db_type = get_db_connection()
    cursor = conn.cursor()
    saved_count = 0

    for item in items:
        item_id = str(item.get('item_id', f"sp_{int(time.time())}"))
        title = item.get('title', 'สินค้า Shopee Affiliate')
        desc = item.get('description', title)
        orig_price = float(item.get('original_price', 590.0))
        sale_price = float(item.get('sale_price', 390.0))
        comm_rate = float(item.get('commission_rate', 22.5))
        net_profit = float(item.get('net_profit_thb', round(sale_price * (comm_rate / 100.0), 2)))
        aff_link = item.get('affiliate_link', 'https://shopee.co.th?af_id=X4EBLKP&mmp_pid=an_15320530167')
        main_img = item.get('main_image_path', 'https://down-th.img.susercontent.com/file/sg-11134201-7rd5e-m4p50n5z0c2g7b')
        images_list = item.get('images', [main_img])
        shop_name = item.get('shop_name', 'Shopee Official Store')
        status = item.get('status', 'PENDING_VIDEO')

        local_paths = download_product_images(images_list, item_id)
        if local_paths:
            main_img = local_paths[0]

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

# ==================== UNIVERSAL CORS HANDLER ====================
class UniversalPipelineHandler(SimpleHTTPRequestHandler):
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
        if self.path == "/api/save_product" or self.path == "/api/save_db_permanent":
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            try:
                data = json.loads(post_data.decode('utf-8'))
                items = data if isinstance(data, list) else [data]
                count, db_type = save_products_handler(items)
                
                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                res = {
                    "status": "success",
                    "db_engine": db_type,
                    "saved_count": count,
                    "message": f"Successfully saved {count} items to {db_type} database!"
                }
                self.wfile.write(json.dumps(res, ensure_ascii=False).encode('utf-8'))
                return
            except Exception as e:
                self.send_response(500)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                self.wfile.write(json.dumps({"status": "error", "message": str(e)}).encode('utf-8'))
                return
        super().do_POST()

    def do_GET(self):
        if self.path == "/api/fetch_products" or self.path == "/api/search_db":
            conn, db_type = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT item_id, title, original_price, sale_price, commission_rate, net_profit_thb, affiliate_link, main_image_path, shop_name, status FROM shopee_affiliate_items ORDER BY created_at DESC")
            rows = cursor.fetchall()
            items = []
            for r in rows:
                items.append({
                    "item_id": r[0], "title": r[1], "original_price": float(r[2]),
                    "sale_price": float(r[3]), "commission_rate": float(r[4]),
                    "net_profit_thb": float(r[5]), "affiliate_link": r[6],
                    "main_image_path": r[7], "shop_name": r[8], "status": r[9]
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
            self.wfile.write(json.dumps({"status": "success", "message": "Backend server is running OK!"}).encode('utf-8'))
            return
        super().do_GET()

if __name__ == '__main__':
    port = 5000
    print(f"🚀 Starting Universal Zero-Dependency Shopee Pipeline Server on Port {port}...")
    
    server_address = ('0.0.0.0', port)
    try:
        httpd = HTTPServer(server_address, UniversalPipelineHandler)
        print(f"✅ Server running successfully on http://localhost:{port}")
        httpd.serve_forever()
    except Exception as e:
        print(f"Port {port} note: {e}. Trying Port 5001...")
        try:
            port = 5001
            httpd = HTTPServer(('0.0.0.0', port), UniversalPipelineHandler)
            print(f"✅ Server running successfully on http://localhost:{port}")
            httpd.serve_forever()
        except Exception as err:
            print(f"Fatal server error: {err}")
