package com.yanzu.module.member.service.signin;

import com.yanzu.framework.common.exception.util.ServiceExceptionUtil;
import com.yanzu.module.member.controller.app.signin.vo.AppPointsRecordRespVO;
import com.yanzu.module.member.controller.app.signin.vo.AppSigninInfoRespVO;
import com.yanzu.module.member.controller.app.signin.vo.AppSigninRespVO;
import com.yanzu.module.member.dal.dataobject.points.UserPointsDO;
import com.yanzu.module.member.dal.dataobject.signin.SigninConfigDO;
import com.yanzu.module.member.dal.dataobject.signin.UserSigninDO;
import com.yanzu.module.member.dal.dataobject.user.MemberUserDO;
import com.yanzu.module.member.dal.mysql.points.UserPointsMapper;
import com.yanzu.module.member.dal.mysql.signin.SigninConfigMapper;
import com.yanzu.module.member.dal.mysql.signin.UserSigninMapper;
import com.yanzu.module.member.dal.mysql.user.MemberUserMapper;
import com.yanzu.module.member.dal.mysql.storeuser.StoreUserMapper;
import com.yanzu.module.member.dal.dataobject.storeuser.StoreUserDO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.Resource;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import static com.yanzu.module.member.enums.ErrorCodeConstants.USER_SIGNIN_ALREADY;

/**
 * 用户签到 Service 实现类
 *
 * @author 芋道源码
 */
@Service
@Slf4j
public class UserSigninServiceImpl implements UserSigninService {

    @Resource
    private UserSigninMapper userSigninMapper;
    @Resource
    private UserPointsMapper userPointsMapper;
    @Resource
    private SigninConfigMapper signinConfigMapper;
    @Resource
    private MemberUserMapper memberUserMapper;
    @Resource
    private StoreUserMapper storeUserMapper;

    @Override
    public AppSigninInfoRespVO getSigninInfo(Long userId, Long storeId) {
        // 获取用户信息
        MemberUserDO user = memberUserMapper.selectById(userId);
        if (user == null) {
            throw ServiceExceptionUtil.exception(USER_SIGNIN_ALREADY);
        }

        // 获取用户在当前门店的积分信息
        StoreUserDO storeUser = storeUserMapper.getByUserIdAndStoreId(userId, storeId);
        Integer totalPoints = 0;
        if (storeUser != null && storeUser.getGiftBalance() != null) {
            totalPoints = storeUser.getGiftBalance().intValue();
        }

        // 获取连续签到天数
        Integer consecutiveDays = userSigninMapper.selectConsecutiveDaysByUserId(userId);
        if (consecutiveDays == null) {
            consecutiveDays = 0;
        }

        // 检查今日是否已签到
        LocalDate today = LocalDate.now();
        UserSigninDO todaySignin = userSigninMapper.selectByUserIdAndDate(userId, today);
        boolean todaySigned = todaySignin != null;

        // 构建响应
        AppSigninInfoRespVO respVO = new AppSigninInfoRespVO();
        respVO.setConsecutiveDays(consecutiveDays);
        respVO.setTotalPoints(totalPoints);
        respVO.setTodaySigned(todaySigned);
        respVO.setTodayDate(today);

        return respVO;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public AppSigninRespVO doSignin(Long userId, Long storeId) {
        LocalDate today = LocalDate.now();

        // 检查今日是否已签到
        UserSigninDO todaySignin = userSigninMapper.selectByUserIdAndDate(userId, today);
        if (todaySignin != null) {
            throw ServiceExceptionUtil.exception(USER_SIGNIN_ALREADY);
        }

        // 获取用户信息
        MemberUserDO user = memberUserMapper.selectById(userId);
        if (user == null) {
            throw ServiceExceptionUtil.exception(USER_SIGNIN_ALREADY);
        }

        // 获取或创建用户门店关系
        StoreUserDO storeUser = storeUserMapper.getByUserIdAndStoreId(userId, storeId);
        if (storeUser == null) {
            // 如果用户在该门店没有记录，创建一个
            storeUser = StoreUserDO.builder()
                    .userId(userId)
                    .storeId(storeId)
                    .type(1) // 会员类型
                    .balance(BigDecimal.ZERO)
                    .giftBalance(BigDecimal.ZERO)
                    .status(1)
                    .build();
            storeUserMapper.insert(storeUser);
        }

        // 计算连续签到天数
        Integer consecutiveDays = userSigninMapper.selectConsecutiveDaysByUserId(userId);
        if (consecutiveDays == null) {
            consecutiveDays = 0;
        }

        // 检查昨天是否签到，如果没签到则重置连续天数
        LocalDate yesterday = today.minusDays(1);
        UserSigninDO yesterdaySignin = userSigninMapper.selectByUserIdAndDate(userId, yesterday);
        if (yesterdaySignin == null && consecutiveDays > 0) {
            consecutiveDays = 0;
        }

        // 计算本次签到天数
        consecutiveDays += 1;

        // 获取签到奖励配置
        SigninConfigDO config = signinConfigMapper.selectOne("consecutive_days", consecutiveDays, "status", 1);
        Integer pointsEarned = 10; // 默认奖励
        String description = "每日签到奖励";
        
        if (config != null) {
            pointsEarned = config.getPointsReward();
            description = config.getDescription();
        }

        // 更新用户在当前门店的积分（使用giftBalance字段）
        BigDecimal currentGiftBalance = storeUser.getGiftBalance() != null ? storeUser.getGiftBalance() : BigDecimal.ZERO;
        BigDecimal newGiftBalance = currentGiftBalance.add(new BigDecimal(pointsEarned));
        
        StoreUserDO updateStoreUser = new StoreUserDO();
        updateStoreUser.setId(storeUser.getId());
        updateStoreUser.setGiftBalance(newGiftBalance);
        storeUserMapper.updateById(updateStoreUser);

        // 创建签到记录
        UserSigninDO signinRecord = UserSigninDO.builder()
                .userId(userId)
                .signinDate(today)
                .consecutiveDays(consecutiveDays)
                .pointsEarned(pointsEarned)
                .build();
        userSigninMapper.insert(signinRecord);

        // 创建积分记录
        UserPointsDO pointsRecord = UserPointsDO.builder()
                .userId(userId)
                .points(pointsEarned)
                .totalPoints(newGiftBalance.intValue())
                .sourceType("SIGNIN")
                .sourceId(signinRecord.getId())
                .description(description)
                .build();
        userPointsMapper.insert(pointsRecord);

        // 构建响应
        AppSigninRespVO respVO = new AppSigninRespVO();
        respVO.setSuccess(true);
        respVO.setPointsEarned(pointsEarned);
        respVO.setConsecutiveDays(consecutiveDays);
        respVO.setTotalPoints(newGiftBalance.intValue());
        respVO.setDescription(description);

        return respVO;
    }

    @Override
    public List<AppPointsRecordRespVO> getPointsRecords(Long userId, Integer limit) {
        List<UserPointsDO> records = userPointsMapper.selectListByUserId(userId, limit);
        return records.stream().map(record -> {
            AppPointsRecordRespVO respVO = new AppPointsRecordRespVO();
            respVO.setId(record.getId());
            respVO.setPoints(record.getPoints());
            respVO.setTotalPoints(record.getTotalPoints());
            respVO.setSourceType(record.getSourceType());
            respVO.setDescription(record.getDescription());
            respVO.setCreateTime(record.getCreateTime());
            return respVO;
        }).collect(Collectors.toList());
    }

}
