-- 签到功能相关数据库表结构
-- 注意：积分使用现有的 member_store_user.gift_balance 字段，不需要添加新字段

-- 1. 创建用户签到记录表
CREATE TABLE `member_user_signin` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '签到记录ID',
  `user_id` bigint NOT NULL COMMENT '用户ID',
  `signin_date` date NOT NULL COMMENT '签到日期',
  `consecutive_days` int NOT NULL DEFAULT 1 COMMENT '连续签到天数',
  `points_earned` int NOT NULL DEFAULT 0 COMMENT '本次获得积分',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `creator` varchar(64) DEFAULT '' COMMENT '创建者',
  `updater` varchar(64) DEFAULT '' COMMENT '更新者',
  `deleted` bit(1) NOT NULL DEFAULT b'0' COMMENT '是否删除',
  `tenant_id` bigint NOT NULL DEFAULT 0 COMMENT '租户编号',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_signin_date` (`user_id`, `signin_date`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_signin_date` (`signin_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户签到记录表';

-- 3. 创建用户积分记录表
CREATE TABLE `member_user_points` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '积分记录ID',
  `user_id` bigint NOT NULL COMMENT '用户ID',
  `points` int NOT NULL COMMENT '积分变动数量（正数为增加，负数为减少）',
  `total_points` int NOT NULL COMMENT '变动后总积分',
  `source_type` varchar(32) NOT NULL COMMENT '积分来源类型：SIGNIN-签到，CONSUME-消费，ADMIN-管理员调整',
  `source_id` bigint DEFAULT NULL COMMENT '来源记录ID（如签到记录ID）',
  `description` varchar(255) DEFAULT '' COMMENT '积分变动描述',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `creator` varchar(64) DEFAULT '' COMMENT '创建者',
  `updater` varchar(64) DEFAULT '' COMMENT '更新者',
  `deleted` bit(1) NOT NULL DEFAULT b'0' COMMENT '是否删除',
  `tenant_id` bigint NOT NULL DEFAULT 0 COMMENT '租户编号',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_source_type` (`source_type`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户积分记录表';

-- 4. 创建签到配置表（可选，用于配置签到奖励规则）
CREATE TABLE `member_signin_config` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '配置ID',
  `consecutive_days` int NOT NULL COMMENT '连续签到天数',
  `points_reward` int NOT NULL COMMENT '奖励积分',
  `description` varchar(255) DEFAULT '' COMMENT '奖励描述',
  `status` tinyint NOT NULL DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `creator` varchar(64) DEFAULT '' COMMENT '创建者',
  `updater` varchar(64) DEFAULT '' COMMENT '更新者',
  `deleted` bit(1) NOT NULL DEFAULT b'0' COMMENT '是否删除',
  `tenant_id` bigint NOT NULL DEFAULT 0 COMMENT '租户编号',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_consecutive_days` (`consecutive_days`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='签到配置表';

-- 插入默认签到配置数据
INSERT INTO `member_signin_config` (`consecutive_days`, `points_reward`, `description`, `status`) VALUES
(1, 10, '每日签到奖励', 1),
(2, 15, '连续2天签到奖励', 1),
(3, 20, '连续3天签到奖励', 1),
(7, 50, '连续7天签到奖励', 1),
(15, 100, '连续15天签到奖励', 1),
(30, 200, '连续30天签到奖励', 1);
