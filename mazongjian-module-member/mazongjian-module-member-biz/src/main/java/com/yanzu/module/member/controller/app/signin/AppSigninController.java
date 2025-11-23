package com.yanzu.module.member.controller.app.signin;

import com.yanzu.framework.common.pojo.CommonResult;
import com.yanzu.framework.security.core.annotations.PreAuthenticated;
import com.yanzu.module.member.controller.app.signin.vo.AppPointsRecordRespVO;
import com.yanzu.module.member.controller.app.signin.vo.AppSigninInfoRespVO;
import com.yanzu.module.member.controller.app.signin.vo.AppSigninRespVO;
import com.yanzu.module.member.service.signin.UserSigninService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import java.util.List;

import static com.yanzu.framework.common.pojo.CommonResult.success;
import static com.yanzu.framework.security.core.util.SecurityFrameworkUtils.getLoginUserId;

@Tag(name = "miniapp - 用户签到")
@RestController
@RequestMapping("/member/signin")
@Validated
@Slf4j
public class AppSigninController {

    @Resource
    private UserSigninService userSigninService;

    @GetMapping("/info")
    @Operation(summary = "获取用户签到信息")
    @PreAuthenticated
    @Parameter(name = "storeId", description = "门店ID", required = true, example = "1")
    public CommonResult<AppSigninInfoRespVO> getSigninInfo(@RequestParam("storeId") Long storeId) {
        return success(userSigninService.getSigninInfo(getLoginUserId(), storeId));
    }

    @PostMapping("/do")
    @Operation(summary = "执行签到")
    @PreAuthenticated
    @Parameter(name = "storeId", description = "门店ID", required = true, example = "1")
    public CommonResult<AppSigninRespVO> doSignin(@RequestParam("storeId") Long storeId) {
        return success(userSigninService.doSignin(getLoginUserId(), storeId));
    }

    @GetMapping("/points/records")
    @Operation(summary = "获取用户积分记录")
    @PreAuthenticated
    @Parameter(name = "limit", description = "限制条数", example = "10")
    public CommonResult<List<AppPointsRecordRespVO>> getPointsRecords(@RequestParam(value = "limit", defaultValue = "10") Integer limit) {
        return success(userSigninService.getPointsRecords(getLoginUserId(), limit));
    }

}
