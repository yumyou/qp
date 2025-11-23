package com.yanzu.module.member.service.signin;

import com.yanzu.module.member.controller.app.signin.vo.AppSigninInfoRespVO;
import com.yanzu.module.member.controller.app.signin.vo.AppSigninRespVO;
import com.yanzu.module.member.controller.app.signin.vo.AppPointsRecordRespVO;

import java.util.List;

/**
 * 用户签到 Service 接口
 *
 * @author 芋道源码
 */
public interface UserSigninService {

    /**
     * 获取用户签到信息
     *
     * @param userId 用户ID
     * @param storeId 门店ID
     * @return 签到信息
     */
    AppSigninInfoRespVO getSigninInfo(Long userId, Long storeId);

    /**
     * 执行签到
     *
     * @param userId 用户ID
     * @param storeId 门店ID
     * @return 签到结果
     */
    AppSigninRespVO doSignin(Long userId, Long storeId);

    /**
     * 获取用户积分记录列表
     *
     * @param userId 用户ID
     * @param limit 限制条数
     * @return 积分记录列表
     */
    List<AppPointsRecordRespVO> getPointsRecords(Long userId, Integer limit);

}
