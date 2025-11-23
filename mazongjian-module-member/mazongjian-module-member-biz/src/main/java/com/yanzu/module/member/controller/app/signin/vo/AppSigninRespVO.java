package com.yanzu.module.member.controller.app.signin.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Schema(description = "用户 App - 签到响应")
@Data
public class AppSigninRespVO {

    @Schema(description = "签到成功", requiredMode = Schema.RequiredMode.REQUIRED, example = "true")
    private Boolean success;

    @Schema(description = "获得积分", requiredMode = Schema.RequiredMode.REQUIRED, example = "20")
    private Integer pointsEarned;

    @Schema(description = "连续签到天数", requiredMode = Schema.RequiredMode.REQUIRED, example = "3")
    private Integer consecutiveDays;

    @Schema(description = "总积分", requiredMode = Schema.RequiredMode.REQUIRED, example = "150")
    private Integer totalPoints;

    @Schema(description = "奖励描述", example = "连续3天签到奖励")
    private String description;

}
