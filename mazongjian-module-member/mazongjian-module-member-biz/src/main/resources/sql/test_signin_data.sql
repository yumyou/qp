-- 签到功能测试数据

-- 插入测试签到配置数据（如果不存在）
INSERT IGNORE INTO `member_signin_config` (`consecutive_days`, `points_reward`, `description`, `status`) VALUES
(1, 10, '每日签到奖励', 1),
(2, 15, '连续2天签到奖励', 1),
(3, 20, '连续3天签到奖励', 1),
(7, 50, '连续7天签到奖励', 1),
(15, 100, '连续15天签到奖励', 1),
(30, 200, '连续30天签到奖励', 1);

-- 为测试用户添加一些积分（假设用户ID为1，门店ID为1，使用giftBalance字段）
INSERT IGNORE INTO `member_store_user` (`user_id`, `store_id`, `type`, `balance`, `gift_balance`, `status`) VALUES
(1, 1, 1, 0, 50, 1);

-- 插入一些测试签到记录
INSERT IGNORE INTO `member_user_signin` (`user_id`, `signin_date`, `consecutive_days`, `points_earned`) VALUES
(1, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 1, 10),
(1, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 2, 15);

-- 插入一些测试积分记录
INSERT IGNORE INTO `member_user_points` (`user_id`, `points`, `total_points`, `source_type`, `description`) VALUES
(1, 10, 10, 'SIGNIN', '每日签到奖励'),
(1, 15, 25, 'SIGNIN', '连续2天签到奖励'),
(1, 20, 45, 'SIGNIN', '连续3天签到奖励');
