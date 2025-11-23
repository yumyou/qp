package com.yanzu.module.member.controller.app.user.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;

@Schema(description = "App - 收藏门店 Response VO")
@Data
public class AppFavoriteStoreRespVO {

    @Schema(description = "门店ID", example = "1")
    private Long storeId;

    @Schema(description = "门店名称", example = "测试门店")
    private String storeName;

    @Schema(description = "门店地址", example = "北京市朝阳区")
    private String address;

    @Schema(description = "门店状态", example = "0")
    private Integer status;

    @Schema(description = "收藏时间")
    private LocalDateTime createTime;

    @Schema(description = "门店图片", example = "https://example.com/image.jpg")
    private String headImg;

}

