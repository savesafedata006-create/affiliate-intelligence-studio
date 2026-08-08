-- ⚡ Shopee Affiliate Pipeline — MySQL Database Schema

CREATE DATABASE IF NOT EXISTS shopee_affiliate_db;
USE shopee_affiliate_db;

CREATE TABLE IF NOT EXISTS shopee_affiliate_items (
    item_id VARCHAR(100) PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    original_price DECIMAL(10,2),
    sale_price DECIMAL(10,2),
    commission_rate DECIMAL(5,2),
    net_profit_thb DECIMAL(10,2),
    affiliate_link TEXT NOT NULL,
    main_image_path TEXT,
    images_json JSON,
    total_sold INT DEFAULT 0,
    rating_star DECIMAL(3,2) DEFAULT 4.9,
    shop_name VARCHAR(255) DEFAULT 'Shopee Official Store',
    video_prompt TEXT,
    status VARCHAR(50) DEFAULT 'PENDING_VIDEO',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
