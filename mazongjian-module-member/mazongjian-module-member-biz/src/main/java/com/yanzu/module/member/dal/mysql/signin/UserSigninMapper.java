package com.yanzu.module.member.dal.mysql.signin;

import com.yanzu.framework.mybatis.core.mapper.BaseMapperX;
import com.yanzu.module.member.dal.dataobject.signin.UserSigninDO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDate;

/**
 * 用户签到记录 Mapper
 *
 * @author 芋道源码
 */
@Mapper
public interface UserSigninMapper extends BaseMapperX<UserSigninDO> {

    /**
     * 查询用户今日是否已签到
     *
     * @param userId 用户ID
     * @param signinDate 签到日期
     * @return 签到记录
     */
    UserSigninDO selectByUserIdAndDate(@Param("userId") Long userId, @Param("signinDate") LocalDate signinDate);

    /**
     * 查询用户连续签到天数
     *
     * @param userId 用户ID
     * @return 连续签到天数
     */
    Integer selectConsecutiveDaysByUserId(@Param("userId") Long userId);

}
