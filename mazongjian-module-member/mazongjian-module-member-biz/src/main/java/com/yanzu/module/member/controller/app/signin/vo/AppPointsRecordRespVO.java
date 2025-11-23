package com.yanzu.module.member.controller.app.signin.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;

@Schema(description = "用户 App - 积分记录响应")
@Data
public class AppPointsRecordRespVO {

    @Schema(description = "记录ID", requiredMode = Schema.RequiredMode.REQUIRED, example = "1")
    private Long id;

    @Schema(description = "积分变动数量", requiredMode = Schema.RequiredMode.REQUIRED, example = "20")
    private Integer points;

    @Schema(description = "变动后总积分", requiredMode = Schema.RequiredMode.REQUIRED, example = "150")
    private Integer totalPoints;

    @Schema(description = "积分来源类型", requiredMode = Schema.RequiredMode.REQUIRED, example = "SIGNIN")
    private String sourceType;

    @Schema(description = "积分变动描述", requiredMode = Schema.RequiredMode.REQUIRED, example = "连续3天签到奖励")
    private String description;

    @Schema(description = "创建时间", requiredMode = Schema.RequiredMode.REQUIRED, example = "2025-01-29 10:30:00")
    private LocalDateTime createTime;

}
