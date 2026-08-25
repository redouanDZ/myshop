-- Migration 007: Create Store Settings and Marketing Pixels Table
CREATE TABLE IF NOT EXISTS store_settings (
    setting_key VARCHAR(100) NOT NULL PRIMARY KEY,
    setting_value TEXT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO store_settings (setting_key, setting_value) VALUES
('store_name', 'المتجر الإلكتروني (MYSHOP)'),
('store_phone', '0550000000'),
('store_whatsapp', '213550000000'),
('store_email', 'contact@myshop.dz'),
('store_address', 'الجزائر العاصمة، الجزائر'),
('store_currency', 'دج'),
('facebook_pixel_id', ''),
('tiktok_pixel_id', ''),
('google_analytics_id', ''),
('snapchat_pixel_id', ''),
('announcement_bar_text', 'توصيل سريع متوفر لـ 58 ولاية والدفع عند الاستلام!')
ON DUPLICATE KEY UPDATE setting_key = setting_key;
