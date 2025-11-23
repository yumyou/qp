package com.yanzu.module.member.controller.app.signin.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDate;

@Schema(description = "用户 App - 签到信息响应")
@Data
public class AppSigninInfoRespVO {

    @Schema(description = "连续签到天数", requiredMode = Schema.RequiredMode.REQUIRED, example = "5")
    private Integer consecutiveDays;

    @Schema(description = "总积分", requiredMode = Schema.RequiredMode.REQUIRED, example = "100")
    private Integer totalPoints;

    @Schema(description = "今日是否已签到", requiredMode = Schema.RequiredMode.REQUIRED, example = "false")
    private Boolean todaySigned;

    @Schema(description = "今日签到日期", example = "2025-01-29")
    private LocalDate todayDate;

}
