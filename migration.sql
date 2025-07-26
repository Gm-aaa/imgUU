-- 为现有的users表添加is_allowed字段
ALTER TABLE users ADD COLUMN is_allowed INTEGER DEFAULT 0;

-- 可选：将第一个用户设置为允许状态（假设第一个用户是管理员）
-- UPDATE users SET is_allowed = 1 WHERE id = (SELECT id FROM users ORDER BY created_at LIMIT 1);