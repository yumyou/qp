package com.yanzu.module.member.service.iot;

import com.alibaba.fastjson.JSONObject;
import com.yanzu.framework.common.exception.ServiceException;
import com.yanzu.framework.common.exception.enums.GlobalErrorCodeConstants;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.ObjectUtils;

import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;


/**
 * Python IoT服务 - Java版本
 * 直接实现Python IoT服务的功能，无需调用外部Python服务
 */
@Slf4j
@Service
public class PythonIotService {

    @Value("${iot.api.baseUrl:http://hkapi.tchjjc.com}")
    private String baseUrl;
    
    @Value("${iot.api.username:YH18129635675}")
    private String apiUsername;
    
    @Value("${iot.api.password:18129635675}")
    private String apiPassword;
    
    @Value("${iot.api.timeout:30}")
    private int requestTimeout;
    
    private String token;
    private Long tokenExpiresAt;
    
    private final RestTemplate restTemplate;
    
    public PythonIotService() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * 设置设备属性
     * 
     * @param identifier 属性标识符
     * @param value 属性值
     * @param productKey 产品密钥
     * @param deviceName 设备名称
     * @return 设置是否成功
     * @throws ServiceException 当设置失败时抛出业务异常，包含具体错误信息
     */
    public boolean setDeviceProperty(String identifier, String value, String productKey, String deviceName) {
        try {
            // 参数验证
            if (ObjectUtils.isEmpty(identifier)) {
                String errorMsg = "属性标识符不能为空";
                log.error("设置设备属性失败: {}", errorMsg);
                throw new ServiceException(GlobalErrorCodeConstants.BAD_REQUEST.getCode(), errorMsg);
            }
            if (ObjectUtils.isEmpty(value)) {
                String errorMsg = "属性值不能为空";
                log.error("设置设备属性失败: {}", errorMsg);
                throw new ServiceException(GlobalErrorCodeConstants.BAD_REQUEST.getCode(), errorMsg);
            }
            if (ObjectUtils.isEmpty(productKey)) {
                String errorMsg = "产品密钥不能为空";
                log.error("设置设备属性失败: {}", errorMsg);
                throw new ServiceException(GlobalErrorCodeConstants.BAD_REQUEST.getCode(), errorMsg);
            }
            if (ObjectUtils.isEmpty(deviceName)) {
                String errorMsg = "设备名称不能为空";
                log.error("设置设备属性失败: {}", errorMsg);
                throw new ServiceException(GlobalErrorCodeConstants.BAD_REQUEST.getCode(), errorMsg);
            }

            // 获取有效token
            String validToken = getValidToken();
            if (ObjectUtils.isEmpty(validToken)) {
                String errorMsg = "获取有效token失败，请检查API用户名和密码配置";
                log.error("设置设备属性失败: {}", errorMsg);
                throw new ServiceException(GlobalErrorCodeConstants.INTERNAL_SERVER_ERROR.getCode(), errorMsg);
            }

            // 准备请求参数
            MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
            params.add("token", validToken);
            params.add("pk", productKey);
            params.add("deviceName", deviceName);
            params.add("identifier", identifier);
            params.add("value", value);

            // 设置请求头
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            
            HttpEntity<MultiValueMap<String, String>> requestEntity = new HttpEntity<>(params, headers);

            // 发送POST请求
            String url = baseUrl + "/api/thing/properties/set";
            log.info("发送设备属性设置请求: url={}, identifier={}, value={}, productKey={}, deviceName={}", 
                    url, identifier, value, productKey, deviceName);
            
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, requestEntity, String.class);
            
            if (response.getStatusCode().is2xxSuccessful()) {
                JSONObject result = JSONObject.parseObject(response.getBody());
                int code = result.getIntValue("code");
                String message = result.getString("message");
                
                if (code == 200) {
                    String successMsg = String.format("设备属性设置成功: identifier=%s, value=%s, productKey=%s, deviceName=%s", 
                            identifier, value, productKey, deviceName);
                    log.info(successMsg);
                    return true;
                } else {
                    String errorMsg = String.format("API返回错误: code=%d, message=%s", code, message);
                    log.error("设置设备属性失败: {}", errorMsg);
                    throw new ServiceException(GlobalErrorCodeConstants.INTERNAL_SERVER_ERROR.getCode(), errorMsg);
                }
            } else {
                String errorMsg = String.format("HTTP请求失败: statusCode=%s, body=%s", 
                        response.getStatusCode(), response.getBody());
                log.error("设置设备属性失败: {}", errorMsg);
                throw new ServiceException(GlobalErrorCodeConstants.INTERNAL_SERVER_ERROR.getCode(), errorMsg);
            }
        } catch (ServiceException e) {
            // 重新抛出ServiceException
            throw e;
        } catch (Exception e) {
            String errorMsg = String.format("设置设备属性异常: identifier=%s, value=%s, productKey=%s, deviceName=%s, error=%s", 
                    identifier, value, productKey, deviceName, e.getMessage());
            log.error(errorMsg, e);
            throw new ServiceException(GlobalErrorCodeConstants.INTERNAL_SERVER_ERROR.getCode(), errorMsg);
        }
    }




    
    /**
     * 获取有效token
     */
    private String getValidToken() {
        if (token != null && !isTokenExpired()) {
            return token;
        }
        
        // 刷新token
        return refreshToken();
    }

    /**
     * 检查token是否过期
     */
    private boolean isTokenExpired() {
        if (tokenExpiresAt == null) {
            return true;
        }
        return System.currentTimeMillis() / 1000 >= tokenExpiresAt;
    }

    /**
     * 刷新token
     */
    private String refreshToken() {
        try {
            String url = baseUrl + "/api/token?username=" + apiUsername + "&pwd=" + apiPassword;
            
            ResponseEntity<String> response = restTemplate.postForEntity(url, null, String.class);
            
            if (response.getStatusCode().is2xxSuccessful()) {
                JSONObject result = JSONObject.parseObject(response.getBody());
                this.token = result.getString("token");
                int expiresIn = result.getIntValue("expiresIn");
                this.tokenExpiresAt = System.currentTimeMillis() / 1000 + expiresIn;
                
                log.info("Token刷新成功");
                return this.token;
            } else {
                log.error("Token刷新失败: statusCode={}, body={}", response.getStatusCode(), response.getBody());
                return null;
            }
        } catch (Exception e) {
            log.error("Token刷新异常: {}", e.getMessage(), e);
            return null;
        }
    }

    /**
     * 获取设备属性
     * 
     * @param productKey 产品密钥
     * @param deviceName 设备名称
     * @return 设备属性结果
     */
    public JSONObject getDeviceProperties(String productKey, String deviceName) {
        try {
            if (ObjectUtils.isEmpty(productKey) || ObjectUtils.isEmpty(deviceName)) {
                log.error("获取设备属性参数不能为空");
                return createErrorResult("参数不能为空");
            }

            String validToken = getValidToken();
            if (ObjectUtils.isEmpty(validToken)) {
                return createErrorResult("获取有效token失败");
            }

            String url = baseUrl + "/api/thing/properties?token=" + validToken + 
                        "&pk=" + productKey + "&deviceName=" + deviceName;

            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            
            if (response.getStatusCode().is2xxSuccessful()) {
                JSONObject result = JSONObject.parseObject(response.getBody());
                return result;
            } else {
                return createErrorResult("请求失败: " + response.getStatusCode());
            }
        } catch (Exception e) {
            log.error("获取设备属性异常: productKey={}, deviceName={}, error={}", 
                    productKey, deviceName, e.getMessage(), e);
            return createErrorResult("获取设备属性异常: " + e.getMessage());
        }
    }

    /**
     * 获取设备状态
     * 
     * @param productKey 产品密钥
     * @param deviceName 设备名称
     * @return 设备状态结果
     */
    public JSONObject getDeviceStatus(String productKey, String deviceName) {
        try {
            if (ObjectUtils.isEmpty(productKey) || ObjectUtils.isEmpty(deviceName)) {
                log.error("获取设备状态参数不能为空");
                return createErrorResult("参数不能为空");
            }

            String validToken = getValidToken();
            if (ObjectUtils.isEmpty(validToken)) {
                return createErrorResult("获取有效token失败");
            }

            String url = baseUrl + "/api/thing/status?token=" + validToken + 
                        "&pk=" + productKey + "&deviceName=" + deviceName;

            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            
            if (response.getStatusCode().is2xxSuccessful()) {
                JSONObject result = JSONObject.parseObject(response.getBody());
                return result;
            } else {
                return createErrorResult("请求失败: " + response.getStatusCode());
            }
        } catch (Exception e) {
            log.error("获取设备状态异常: productKey={}, deviceName={}, error={}", 
                    productKey, deviceName, e.getMessage(), e);
            return createErrorResult("获取设备状态异常: " + e.getMessage());
        }
    }

    /**
     * 获取设备信息
     * 
     * @param productKey 产品密钥
     * @param deviceName 设备名称
     * @return 设备信息结果
     */
    public JSONObject getDeviceInfo(String productKey, String deviceName) {
        try {
            if (ObjectUtils.isEmpty(productKey) || ObjectUtils.isEmpty(deviceName)) {
                log.error("获取设备信息参数不能为空");
                return createErrorResult("参数不能为空");
            }

            String validToken = getValidToken();
            if (ObjectUtils.isEmpty(validToken)) {
                return createErrorResult("获取有效token失败");
            }

            String url = baseUrl + "/api/thing/info?token=" + validToken + 
                        "&pk=" + productKey + "&deviceName=" + deviceName;

            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            
            if (response.getStatusCode().is2xxSuccessful()) {
                JSONObject result = JSONObject.parseObject(response.getBody());
                return result;
            } else {
                return createErrorResult("请求失败: " + response.getStatusCode());
            }
        } catch (Exception e) {
            log.error("获取设备信息异常: productKey={}, deviceName={}, error={}", 
                    productKey, deviceName, e.getMessage(), e);
            return createErrorResult("获取设备信息异常: " + e.getMessage());
        }
    }

    /**
     * 健康检查
     * 
     * @return 健康检查结果
     */
    public JSONObject healthCheck() {
        JSONObject result = new JSONObject();
        result.put("status", "healthy");
        result.put("message", "Java IoT服务正常运行");
        result.put("token_status", new JSONObject() {{
            put("has_token", token != null);
            put("is_valid", token != null && !isTokenExpired());
        }});
        return result;
    }

    /**
     * 创建错误结果
     * 
     * @param message 错误消息
     * @return 错误结果
     */
    private JSONObject createErrorResult(String message) {
        JSONObject result = new JSONObject();
        result.put("code", 500);
        result.put("message", message);
        result.put("localizedMsg", message);
        result.put("data", null);
        return result;
    }
}