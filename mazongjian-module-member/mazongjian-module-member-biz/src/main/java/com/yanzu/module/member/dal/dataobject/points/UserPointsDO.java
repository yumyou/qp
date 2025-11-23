package com.yanzu.module.member.dal.dataobject.points;

import com.baomidou.mybatisplus.annotation.KeySequence;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.yanzu.framework.mybatis.core.dataobject.BaseDO;
import lombok.*;

/**
 * 用户积分记录 DO
 *
 * @author 芋道源码
 */
@TableName("member_user_points")
@KeySequence("member_user_points_seq") // 用于 Oracle、PostgreSQL、Kingbase、DB2、H2 数据库的主键自增。如果是 MySQL 等数据库，可不写。
@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserPointsDO extends BaseDO {

    /**
     * 积分记录ID
     */
    @TableId
    private Long id;
    /**
     * 用户ID
     */
    private Long userId;
    /**
     * 积分变动数量（正数为增加，负数为减少）
     */
    private Integer points;
    /**
     * 变动后总积分
     */
    private Integer totalPoints;
    /**
     * 积分来源类型：SIGNIN-签到，CONSUME-消费，ADMIN-管理员调整
     */
    private String sourceType;
    /**
     * 来源记录ID（如签到记录ID）
     */
    private Long sourceId;
    /**
     * 积分变动描述
     */
    private String description;

}
