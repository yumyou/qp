package com.yanzu.module.member.service.deviceinfo;

import cn.hutool.http.HttpRequest;
import cn.hutool.http.HttpUtil;
import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import cn.hutool.crypto.SecureUtil;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.yanzu.framework.common.pojo.PageResult;
import com.yanzu.module.member.controller.admin.deviceinfo.vo.*;
import com.yanzu.module.member.convert.deviceinfo.DeviceInfoConvert;
import com.yanzu.module.member.dal.dataobject.deviceinfo.DeviceInfoDO;
import com.yanzu.module.member.dal.mysql.deviceinfo.DeviceInfoMapper;
import com.yanzu.module.member.enums.AppEnum;
import com.yanzu.module.member.service.iot.IotDeviceService;
import com.yanzu.module.member.service.iot.device.IotDeviceBaseVO;
import com.yanzu.module.member.service.iot.device.IotDeviceConfigWifiReqVO;
import com.yanzu.module.member.service.iot.device.IotDeviceContrlReqVO;
import com.yanzu.module.member.service.iot.device.IotDeviceSetAutoLockReqVO;
import com.yanzu.module.member.service.storeinfo.StoreInfoService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.ObjectUtils;
import org.springframework.util.StringUtils;
import org.springframework.validation.annotation.Validated;

import javax.annotation.Resource;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import static com.yanzu.framework.common.exception.util.ServiceExceptionUtil.exception;
import static com.yanzu.framework.security.core.util.SecurityFrameworkUtils.getLoginUserId;
import static com.yanzu.framework.web.core.util.WebFrameworkUtils.getLoginUserType;
import static com.yanzu.module.member.enums.ErrorCodeConstants.*;

/**
 * 设备管理 Service 实现类
 *
 * @author 芋道源码
 */
@Service
@Validated
@Slf4j
public class DeviceInfoServiceImpl implements DeviceInfoService {

    @Resource
    private DeviceInfoMapper deviceInfoMapper;

    @Resource
    private IotDeviceService iotDeviceService;

    @Resource
    private StoreInfoService storeInfoService;

    @Value("${sciener.clientId:}")
    private String scienerClientId;
    @Value("${sciener.clientSecret:}")
    private String scienerClientSecret;
    @Value("${sciener.username:}")
    private String scienerUsername;
    @Value("${sciener.password:}")
    private String scienerPasswordMd5;


    @Override
    @Transactional
    public void createDeviceInfo(DeviceInfoCreateReqVO createReqVO) {
        //如果不是共用设备  那新增的设备不能存在
        if (!createReqVO.getShare()) {
            int i = deviceInfoMapper.countBySN(createReqVO.getDeviceSn());
            if (i > 0) {
                throw exception(DEVICE_DATA_EXISTS_ERROR);
            }
        }
        //有的设备每个房间只能存在一个
        if (!ObjectUtils.isEmpty(createReqVO.getRoomId())) {
            switch (createReqVO.getType()) {
                case 1:
                case 3:
                case 5:
                case 9:
                case 10:
                case 11:
                case 12:
                case 13:
                    int c = deviceInfoMapper.countByTypeAndRoomId(createReqVO.getType(), createReqVO.getRoomId());
                    if (c > 0) {
                        throw exception(DEVICE_ADD_MAX_NUM_ERROR);
                    }
                    break;
            }
        }
        String data = null;
        // 与 App 端保持一致：
        if (createReqVO.getType() != null && createReqVO.getType().intValue() == 5) {
            // 门锁：获取锁信息（Sciener）
            if (StringUtils.hasText(scienerClientId) && StringUtils.hasText(scienerClientSecret)
                    && StringUtils.hasText(scienerUsername) && StringUtils.hasText(scienerPasswordMd5)) {
                String tokenResp = HttpRequest.post("https://cnapi.sciener.com/oauth2/token")
                        .form("clientId", scienerClientId)
                        .form("clientSecret", scienerClientSecret)
                        .form("username", scienerUsername)
                        .form("password", normalizeScienerPassword(scienerPasswordMd5))
                        .execute()
                        .body();
                log.info("[Admin] Sciener token resp: {}", tokenResp);
                if (!StringUtils.hasText(tokenResp)) {
                    throw exception(DEVICE_IOT_OP_ERROR, "Sciener获取token返回为空");
                }
                JSONObject tokenJson = JSONUtil.parseObj(tokenResp);
                String accessToken = tokenJson.getStr("access_token");
                if (!StringUtils.hasText(accessToken)) {
                    throw exception(DEVICE_IOT_OP_ERROR, "Sciener获取token失败:" + tokenResp);
                }
                String url = String.format("https://cnapi.sciener.com/v3/key/get?clientId=%s&accessToken=%s&lockId=%s&date=%d",
                        scienerClientId, accessToken, createReqVO.getDeviceSn(), System.currentTimeMillis());
                String detailResp = HttpUtil.get(url);
                log.info("[Admin] Sciener lock detail resp: {}", detailResp);
                if (!StringUtils.hasText(detailResp)) {
                    throw exception(DEVICE_IOT_OP_ERROR, "Sciener获取锁详情返回为空");
                }
                data = detailResp;
            } else {
                throw exception(DEVICE_IOT_OP_ERROR, "Sciener配置不完整，请设置sciener.clientId/clientSecret/username/password");
            }
        } else if (createReqVO.getType() != null && createReqVO.getType().intValue() == 14) {
            // 电控：保存 productKey + deviceName + identifier
            com.alibaba.fastjson.JSONObject obj = new com.alibaba.fastjson.JSONObject();
            obj.put("productKey", createReqVO.getDeviceSn());
            if (createReqVO.getDeviceName() != null && createReqVO.getDeviceName().length() > 0) {
                obj.put("deviceName", createReqVO.getDeviceName());
            }
            if (createReqVO.getIdentifier() != null && createReqVO.getIdentifier().length() > 0) {
                obj.put("identifier", createReqVO.getIdentifier());
            }
            data = obj.toJSONString();
        } else {
            // 其它类型：与 App 一致，暂不调用 iot 绑定
            data = null;
        }

        if (createReqVO.getType() != null && (createReqVO.getType().intValue() == 5 || createReqVO.getType().intValue() == 14)) {
            if (!StringUtils.hasText(data)) {
                throw exception(DEVICE_IOT_OP_ERROR, "设备数据为空，添加失败");
            }
        }
        // 插入
        DeviceInfoDO deviceInfo = DeviceInfoConvert.INSTANCE.convert(createReqVO);
        deviceInfo.setDeviceData(data);
        deviceInfoMapper.insert(deviceInfo);

    }

    private String normalizeScienerPassword(String configured) {
        if (configured == null) {
            return null;
        }
        String trimmed = configured.trim();
        String lower = trimmed.toLowerCase();
        if (lower.matches("^[a-f0-9]{32}$")) {
            return lower;
        }
        return SecureUtil.md5(trimmed).toLowerCase();
    }


    @Override
    @Transactional
    public void deleteDeviceInfo(Long id) {
        DeviceInfoDO deviceInfoDO = deviceInfoMapper.selectById(id);
        if (ObjectUtils.isEmpty(deviceInfoDO)) {
            throw exception(DATA_NOT_EXISTS);
        }
        // 管理后台删除设备时，管理员可以删除所有设备，不需要权限检查
        // 如果是App端调用，则保持原有的权限检查逻辑
        // 这里通过检查用户类型来判断是否为管理后台操作
        // 管理后台用户类型为ADMIN，可以删除所有设备
        // 与 app 端一致：仅对非门锁/电控尝试物联网解绑；失败记录日志并忽略
        // boolean needIotUnbind = deviceInfoDO.getType() != null
        //         && deviceInfoDO.getType().intValue() != 5
        //         && deviceInfoDO.getType().intValue() != 14;
        // if (needIotUnbind) {
        //     try {
        //         if (deviceInfoDO.getShare()) {
        //             if (deviceInfoMapper.countBySN(deviceInfoDO.getDeviceSn()) == 1) {
        //                 iotDeviceService.unbind(deviceInfoDO.getDeviceSn());
        //             }
        //         } else {
        //             iotDeviceService.unbind(deviceInfoDO.getDeviceSn());
        //         }
        //     } catch (Exception ex) {
        //         log.warn("[Admin] 设备解绑失败，忽略继续删除。sn:{} err:{}", deviceInfoDO.getDeviceSn(), ex.getMessage());
        //     }
        // }
        // 删除
        deviceInfoMapper.deleteById(id);
    }

    private void validateDeviceInfoExists(Long id) {
        if (deviceInfoMapper.selectById(id) == null) {
            throw exception(DATA_NOT_EXISTS);
        }
    }

    @Override
    public DeviceInfoDO getDeviceInfo(Long id) {
        return deviceInfoMapper.selectById(id);
    }

    @Override
    public List<DeviceInfoDO> getDeviceInfoList(Collection<Long> ids) {
        return deviceInfoMapper.selectBatchIds(ids);
    }

    @Override
    public PageResult<DeviceInfoRespVO> getDeviceInfoPage(DeviceInfoPageReqVO reqVO, boolean isAdmin) {
        //检查权限
        storeInfoService.checkPermisson(null, null, getLoginUserType(), AppEnum.member_user_type.ADMIN.getValue());
        IPage<DeviceInfoRespVO> page = new Page<>(reqVO.getPageNo(), reqVO.getPageSize());
        deviceInfoMapper.getDeviceInfoPage(page, reqVO, getLoginUserId(), isAdmin);
        return new PageResult<>(page.getRecords(), page.getTotal());
    }

    @Override
    public List<DeviceInfoDO> getDeviceInfoList(DeviceInfoExportReqVO exportReqVO) {
        return deviceInfoMapper.selectList(exportReqVO);
    }

    @Override
    @Transactional
    public void bind(DeviceInfoBindReqVO reqVO) {
        //如果设备已经被绑定了， 就更新绑定关系
        DeviceInfoDO deviceInfoDO = deviceInfoMapper.selectById(reqVO.getDeviceId());
        if (ObjectUtils.isEmpty(deviceInfoDO)) {
            throw exception(DATA_NOT_EXISTS);
        }
        //有的设备每个房间只能存在一个
        if (!ObjectUtils.isEmpty(reqVO.getRoomId()) && reqVO.getRoomId().compareTo(deviceInfoDO.getRoomId()) != 0) {
            switch (deviceInfoDO.getType()) {
                case 1:
                case 3:
                case 5:
                case 9:
                case 10:
                case 11:
                case 12:
                case 13:
                    int c = deviceInfoMapper.countByTypeAndRoomId(deviceInfoDO.getType(), reqVO.getRoomId());
                    if (c > 0) {
                        throw exception(DEVICE_ADD_MAX_NUM_ERROR);
                    }
                    break;
            }
        }
        deviceInfoMapper.updateBindInfo(deviceInfoDO.getDeviceId(), reqVO.getRoomId());
    }

    @Override
    public void configWifi(DeviceInfoConfigWifiReqVO reqVO) {
        DeviceInfoDO deviceInfoDO = deviceInfoMapper.selectById(reqVO.getDeviceId());
        if (ObjectUtils.isEmpty(deviceInfoDO)) {
            throw exception(DATA_NOT_EXISTS);
        }
        //只能操作自己的设备
        if (!deviceInfoDO.getCreator().equals(String.valueOf(getLoginUserId()))) {
            throw exception(DEVICE_DELETE_PERMISSION_ERROR);
        }
        IotDeviceConfigWifiReqVO vo = new IotDeviceConfigWifiReqVO();
        vo.setDeviceSn(deviceInfoDO.getDeviceSn());
        vo.setSsid(reqVO.getSsid());
        vo.setPasswd(reqVO.getPasswd());
        iotDeviceService.configWifi(vo);
    }

    @Override
    public void setLockAutoLock(DeviceInfoSetAutoLockReqVO reqVO) {
        DeviceInfoDO deviceInfoDO = deviceInfoMapper.selectById(reqVO.getDeviceId());
        if (ObjectUtils.isEmpty(deviceInfoDO)) {
            throw exception(DATA_NOT_EXISTS);
        }
        //只能操作自己的设备
        if (!deviceInfoDO.getCreator().equals(String.valueOf(getLoginUserId()))) {
            throw exception(DEVICE_DELETE_PERMISSION_ERROR);
        }
        IotDeviceSetAutoLockReqVO vo = new IotDeviceSetAutoLockReqVO();
        vo.setDeviceSn(deviceInfoDO.getDeviceSn());
        vo.setSecend(reqVO.getSecend());
        iotDeviceService.setLockAutoLock(vo);
    }

    @Override
    public void control(DeviceControlReqVO reqVO) {
        DeviceInfoDO deviceInfoDO = deviceInfoMapper.selectById(reqVO.getDeviceId());
        if (ObjectUtils.isEmpty(deviceInfoDO)) {
            throw exception(DATA_NOT_EXISTS);
        }
        //只能操作自己的设备
        if (!deviceInfoDO.getCreator().equals(String.valueOf(getLoginUserId()))) {
            throw exception(DEVICE_DELETE_PERMISSION_ERROR);
        }
        IotDeviceBaseVO<IotDeviceContrlReqVO> vo = new IotDeviceBaseVO();
        List<IotDeviceContrlReqVO> param = new ArrayList<>(1);
        IotDeviceContrlReqVO iotDeviceContrlReqVO = new IotDeviceContrlReqVO();
        iotDeviceContrlReqVO.setOutlet(0).setCmd(reqVO.getCmd());
        param.add(iotDeviceContrlReqVO);
        vo.setDeviceSn(deviceInfoDO.getDeviceSn()).setParams(param);
        boolean flag = iotDeviceService.control(vo);
        if (!flag) {
            throw exception(DEVICE_OPRATION_ERROR);
        }
    }
}
