package com.yanzu.module.member.controller.app.user.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import javax.validation.constraints.NotNull;

@Schema(description = "App - 收藏门店 Request VO")
@Data
public class AppFavoriteStoreReqVO {

    @Schema(description = "门店ID", requiredMode = Schema.RequiredMode.REQUIRED, example = "1")
    @NotNull(message = "门店ID不能为空")
    private Long storeId;

}

