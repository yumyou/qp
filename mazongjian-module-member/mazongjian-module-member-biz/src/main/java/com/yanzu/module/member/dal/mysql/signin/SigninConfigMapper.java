package com.yanzu.module.member.dal.mysql.signin;

import com.yanzu.framework.mybatis.core.mapper.BaseMapperX;
import com.yanzu.module.member.dal.dataobject.signin.SigninConfigDO;
import org.apache.ibatis.annotations.Mapper;

/**
 * 签到配置 Mapper
 *
 * @author 芋道源码
 */
@Mapper
public interface SigninConfigMapper extends BaseMapperX<SigninConfigDO> {

}
