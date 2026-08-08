# ⚡ Shopee Affiliate Pipeline — Export Data to Google Flow AI Video Generator
import os
import json
import sqlite3
import time

SQLITE_DB_PATH = os.path.expanduser("~/.affiliate_intel_db.sqlite")
EXPORT_PATH_DESKTOP = os.path.expanduser("~/Desktop/payload_google_flow.json")
EXPORT_PATH_LOCAL = "payload_google_flow.json"

DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '',
    'database': 'shopee_affiliate_db'
}

def get_db_connection():
    try:
        import mysql.connector
        conn = mysql.connector.connect(**DB_CONFIG)
        return conn, "MYSQL"
    except Exception:
        conn = sqlite3.connect(SQLITE_DB_PATH)
        return conn, "SQLITE"

def generate_flow_video_prompt(title, sale_price, shop_name):
    visual_prompt = f"Vertical 9:16 portrait. High-end commercial product video shot of {title}. Slow push-in tracking shot, ultra-realistic textures, soft studio diffused lighting, 8K photorealistic, 60fps, cinema-grade presentation."
    negative_prompt = "blurry, distorted, low quality, watermark, logo, grain, noise, low resolution, extra limbs, bad framing"
    hook_script = f"ใครกำลังมองหา {title.split()[0]} อยู่? หยุดดูคลิปนี้ด่วนเลยครับ!"
    body_script = f"สินค้าชิ้นนี้จากร้าน {shop_name} คุ้มค่ามาก ปกติแพงมาก วันนี้ลดเหลือเพียง ฿{sale_price} เท่านั้น!"
    cta_script = "พิกัดกดที่หน้าร้าน collshp.com/namkhangcollection หรือ ตะกร้าเหลืองซ้ายล่างได้เลยครับ"

    return {
        "visual_prompt_9_16": visual_prompt,
        "negative_prompt": negative_prompt,
        "voice_script": {
            "hook_3s": hook_script,
            "body": body_script,
            "cta": cta_script
        }
    }

def export_google_flow_payload():
    print("🚀 Starting Google Flow Export Process...")
    conn, db_type = get_db_connection()
    cursor = conn.cursor()

    if db_type == "MYSQL":
        cursor.execute("SELECT item_id, title, sale_price, commission_rate, net_profit_thb, affiliate_link, main_image_path, shop_name FROM shopee_affiliate_items WHERE status = 'PENDING_VIDEO'")
    else:
        cursor.execute("SELECT item_id, title, sale_price, commission_rate, net_profit_thb, affiliate_link, main_image_path, shop_name FROM shopee_affiliate_items WHERE status = 'PENDING_VIDEO' OR status = 'PERMANENT_SAVED' OR status = 'READY_FOR_FLOW'")

    rows = cursor.fetchall()

    if not rows:
        print("⚠️ No items pending video generation found. Generating full catalog payload...")
        cursor.execute("SELECT item_id, title, sale_price, commission_rate, net_profit_thb, affiliate_link, main_image_path, shop_name FROM shopee_affiliate_items LIMIT 10")
        rows = cursor.fetchall()

    payload_items = []
    updated_ids = []

    for r in rows:
        item_id, title, sale_price, comm_rate, profit_thb, aff_link, main_img, shop_name = r
        prompt_pack = generate_flow_video_prompt(title, sale_price, shop_name or "Shopee Official Store")

        item_data = {
            "item_id": item_id,
            "title": title,
            "sale_price_thb": float(sale_price),
            "commission_rate_percent": float(comm_rate),
            "estimated_net_profit_thb": float(profit_thb),
            "affiliate_link": aff_link,
            "main_image_path": main_img,
            "shop_name": shop_name,
            "google_flow_prompts": prompt_pack,
            "shopee_vdo_tags": {
                "partner_id": "an_15320530167",
                "referral_code": "X4EBLKP",
                "ep2_tagging": f"https://s.shopee.co.th/20uSXcvwRR?af_id=X4EBLKP&mmp_pid=an_15320530167"
            }
        }
        payload_items.append(item_data)
        updated_ids.append(item_id)

    # Export JSON files
    export_payload = {
        "pipeline": "Shopee Affiliate Data Extractor -> Google Flow AI",
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "total_items": len(payload_items),
        "verified_partner_id": "an_15320530167",
        "verified_referral_code": "X4EBLKP",
        "items": payload_items
    }

    with open(EXPORT_PATH_DESKTOP, 'w', encoding='utf-8') as f:
        json.dump(export_payload, f, ensure_ascii=False, indent=2)
    with open(EXPORT_PATH_LOCAL, 'w', encoding='utf-8') as f:
        json.dump(export_payload, f, ensure_ascii=False, indent=2)

    # Update status to EXPORTED_TO_FLOW
    for i_id in updated_ids:
        if db_type == "MYSQL":
            cursor.execute("UPDATE shopee_affiliate_items SET status = 'EXPORTED_TO_FLOW' WHERE item_id = %s", (i_id,))
        else:
            cursor.execute("UPDATE shopee_affiliate_items SET status = 'EXPORTED_TO_FLOW' WHERE item_id = ?", (i_id,))

    conn.commit()
    conn.close()

    print(f"✅ Google Flow Export Completed Successfully!")
    print(f"📦 Total Items Exported: {len(payload_items)}")
    print(f"📁 Desktop File Path: {EXPORT_PATH_DESKTOP}")
    print(f"📁 Local File Path: {EXPORT_PATH_LOCAL}")

if __name__ == '__main__':
    export_google_flow_payload()
