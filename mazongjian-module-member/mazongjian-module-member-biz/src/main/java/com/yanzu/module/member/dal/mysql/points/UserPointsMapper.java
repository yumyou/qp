package com.yanzu.module.member.dal.mysql.points;

import com.yanzu.framework.mybatis.core.mapper.BaseMapperX;
import com.yanzu.framework.mybatis.core.query.LambdaQueryWrapperX;
import com.yanzu.module.member.dal.dataobject.points.UserPointsDO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 用户积分记录 Mapper
 *
 * @author 芋道源码
 */
@Mapper
public interface UserPointsMapper extends BaseMapperX<UserPointsDO> {

    /**
     * 查询用户积分记录列表
     *
     * @param userId 用户ID
     * @param limit 限制条数
     * @return 积分记录列表
     */
    List<UserPointsDO> selectListByUserId(@Param("userId") Long userId, @Param("limit") Integer limit);

}
