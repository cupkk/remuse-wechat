-- 数据库索引优化脚本
-- 针对高频查询字段添加索引，提升查询性能

-- 用户表索引
CREATE INDEX IF NOT EXISTS idx_users_wechat_openid ON users(wechat_openid);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_is_guest ON users(is_guest);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- 藏品表索引
CREATE INDEX IF NOT EXISTS idx_items_user_id ON items(user_id);
CREATE INDEX IF NOT EXISTS idx_items_category ON items(category);
CREATE INDEX IF NOT EXISTS idx_items_created_at ON items(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_items_user_category ON items(user_id, category);
CREATE INDEX IF NOT EXISTS idx_items_user_created ON items(user_id, created_at DESC);

-- 贴纸表索引
CREATE INDEX IF NOT EXISTS idx_stickers_user_id ON stickers(user_id);
CREATE INDEX IF NOT EXISTS idx_stickers_item_id ON stickers(item_id);
CREATE INDEX IF NOT EXISTS idx_stickers_created_at ON stickers(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stickers_user_created ON stickers(user_id, created_at DESC);

-- 展馆表索引
CREATE INDEX IF NOT EXISTS idx_halls_user_id ON halls(user_id);
CREATE INDEX IF NOT EXISTS idx_halls_is_public ON halls(is_public);
CREATE INDEX IF NOT EXISTS idx_halls_created_at ON halls(created_at DESC);

-- 记忆表索引
CREATE INDEX IF NOT EXISTS idx_memories_user_id ON memories(user_id);
CREATE INDEX IF NOT EXISTS idx_memories_item_id ON memories(item_id);
CREATE INDEX IF NOT EXISTS idx_memories_created_at ON memories(created_at DESC);

-- 改造指南表索引
CREATE INDEX IF NOT EXISTS idx_guides_user_id ON guides(user_id);
CREATE INDEX IF NOT EXISTS idx_guides_item_id ON guides(item_id);
CREATE INDEX IF NOT EXISTS idx_guides_created_at ON guides(created_at DESC);

-- 拼豆图表索引
CREATE INDEX IF NOT EXISTS idx_perlers_user_id ON perlers(user_id);
CREATE INDEX IF NOT EXISTS idx_perlers_item_id ON perlers(item_id);
CREATE INDEX IF NOT EXISTS idx_perlers_created_at ON perlers(created_at DESC);

-- 查询性能优化建议：
-- 1. 对于联合查询，优先使用最左匹配原则
-- 2. 避免在索引字段上使用函数运算
-- 3. 定期使用ANALYZE TABLE更新统计信息
-- 4. 慢查询可使用EXPLAIN QUERY PLAN分析执行计划

-- 查看索引使用情况（SQLite）：
-- SELECT * FROM sqlite_master WHERE type='index';
