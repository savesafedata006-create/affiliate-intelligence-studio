# ⚡ Shopee Affiliate Pipeline — Flask Local Backend Server (Port 5000)
import os
import json
import time
import sqlite3
import urllib.request
import urllib.parse
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Database Configuration (MySQL Config + SQLite Fallback)
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '',
    'database': 'shopee_affiliate_db'
}

IMAGE_SAVE_DIR = os.path.expanduser("~/Pictures/AffiliateIntel_Images")
os.makedirs(IMAGE_SAVE_DIR, exist_ok=True)
SQLITE_DB_PATH = os.path.expanduser("~/.affiliate_intel_db.sqlite")

def get_db_connection():
    """เชื่อมต่อ MySQL Database หากต่อไม่ได้จะสลับใช้ SQLite อัตโนมัติ (Zero Failure)"""
    try:
        import mysql.connector
        conn = mysql.connector.connect(**DB_CONFIG)
        return conn, "MYSQL"
    except Exception as e:
        print(f"MySQL Connection Note: {e} -> Switching to SQLite Fallback")
        conn = sqlite3.connect(SQLITE_DB_PATH)
        return conn, "SQLITE"

def init_sqlite_fallback():
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

init_sqlite_fallback()

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

@app.route('/api/save_product', methods=['POST'])
def save_product():
    try:
        data = request.get_json()
        if isinstance(data, list):
            items = data
        else:
            items = [data]

        saved_count = 0
        conn, db_type = get_db_connection()
        cursor = conn.cursor()

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

            # Download images
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

        return jsonify({
            "status": "success",
            "db_engine": db_type,
            "saved_count": saved_count,
            "message": f"Successfully saved {saved_count} items to {db_type} database!"
        }), 200

    except Exception as e:
        print(f"Error saving product: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/fetch_products', methods=['GET'])
def fetch_products():
    try:
        conn, db_type = get_db_connection()
        cursor = conn.cursor()

        if db_type == "MYSQL":
            cursor.execute("SELECT item_id, title, original_price, sale_price, commission_rate, net_profit_thb, affiliate_link, main_image_path, shop_name, status FROM shopee_affiliate_items ORDER BY created_at DESC")
        else:
            cursor.execute("SELECT item_id, title, original_price, sale_price, commission_rate, net_profit_thb, affiliate_link, main_image_path, shop_name, status FROM shopee_affiliate_items ORDER BY created_at DESC")

        rows = cursor.fetchall()
        items = []
        for r in rows:
            items.append({
                "item_id": r[0],
                "title": r[1],
                "original_price": float(r[2]),
                "sale_price": float(r[3]),
                "commission_rate": float(r[4]),
                "net_profit_thb": float(r[5]),
                "affiliate_link": r[6],
                "main_image_path": r[7],
                "shop_name": r[8],
                "status": r[9]
            })
        conn.close()
        return jsonify({"status": "success", "db_engine": db_type, "count": len(items), "items": items}), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    print("🚀 Starting Shopee Affiliate Pipeline Flask Backend on http://localhost:5000...")
    app.run(host='0.0.0.0', port=5000, debug=True)
