package com.yanzu.module.member.dal.dataobject.signin;

import com.baomidou.mybatisplus.annotation.KeySequence;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.yanzu.framework.mybatis.core.dataobject.BaseDO;
import lombok.*;

import java.time.LocalDate;

/**
 * 用户签到记录 DO
 *
 * @author 芋道源码
 */
@TableName("member_user_signin")
@KeySequence("member_user_signin_seq") // 用于 Oracle、PostgreSQL、Kingbase、DB2、H2 数据库的主键自增。如果是 MySQL 等数据库，可不写。
@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSigninDO extends BaseDO {

    /**
     * 签到记录ID
     */
    @TableId
    private Long id;
    /**
     * 用户ID
     */
    private Long userId;
    /**
     * 签到日期
     */
    private LocalDate signinDate;
    /**
     * 连续签到天数
     */
    private Integer consecutiveDays;
    /**
     * 本次获得积分
     */
    private Integer pointsEarned;

}
