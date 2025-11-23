package com.yanzu.module.member.dal.dataobject.signin;

import com.baomidou.mybatisplus.annotation.KeySequence;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.yanzu.framework.mybatis.core.dataobject.BaseDO;
import lombok.*;

/**
 * 签到配置 DO
 *
 * @author 芋道源码
 */
@TableName("member_signin_config")
@KeySequence("member_signin_config_seq") // 用于 Oracle、PostgreSQL、Kingbase、DB2、H2 数据库的主键自增。如果是 MySQL 等数据库，可不写。
@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SigninConfigDO extends BaseDO {

    /**
     * 配置ID
     */
    @TableId
    private Long id;
    /**
     * 连续签到天数
     */
    private Integer consecutiveDays;
    /**
     * 奖励积分
     */
    private Integer pointsReward;
    /**
     * 奖励描述
     */
    private String description;
    /**
     * 状态：0-禁用，1-启用
     */
    private Integer status;

}
