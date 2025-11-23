package com.yanzu.module.member.dal.mysql.userfavorite;

import com.yanzu.framework.mybatis.core.mapper.BaseMapperX;
import com.yanzu.module.member.dal.dataobject.userfavorite.UserFavoriteDO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 用户收藏门店 Mapper
 *
 * @author 芋道源码
 */
@Mapper
public interface UserFavoriteMapper extends BaseMapperX<UserFavoriteDO> {

    /**
     * 根据用户ID获取收藏的门店ID列表
     *
     * @param userId 用户ID
     * @return 门店ID列表
     */
    List<Long> selectStoreIdsByUserId(@Param("userId") Long userId);

    /**
     * 根据用户ID和门店ID查询收藏记录
     *
     * @param userId 用户ID
     * @param storeId 门店ID
     * @return 收藏记录
     */
    UserFavoriteDO selectByUserIdAndStoreId(@Param("userId") Long userId, @Param("storeId") Long storeId);

    /**
     * 根据用户ID删除所有收藏记录
     *
     * @param userId 用户ID
     * @return 删除的记录数
     */
    int deleteByUserId(@Param("userId") Long userId);

    /**
     * 根据用户ID和门店ID查询已删除的收藏记录
     *
     * @param userId 用户ID
     * @param storeId 门店ID
     * @return 已删除的收藏记录
     */
    UserFavoriteDO selectDeletedByUserIdAndStoreId(@Param("userId") Long userId, @Param("storeId") Long storeId);

    /**
     * 恢复已删除的收藏记录
     *
     * @param id 记录ID
     * @return 更新的记录数
     */
    int restoreById(@Param("id") Long id);

}
