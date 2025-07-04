<template>
  <view class="report-container">
    <DailyRecipeCard :recipe="dailyRecipe" />
    <view style="height: 32rpx;" />
    <!-- 保鲜报告入口 -->
    <view class="report-box" @tap="goToFreshnessReport" :class="{disabled: loading}" :disabled="loading">
      <text class="report-title">查看保鲜报告</text>
    </view>
    <!-- 膳食营养报告入口 -->
    <view class="report-box" @tap="goToNutritionReport" :class="{disabled: loading}" :disabled="loading">
      <text class="report-title">查看膳食营养报告</text>
    </view>
    <!-- 食物消耗报告入口 -->
    <view class="report-box" @tap="goToConsumptionReport" :class="{disabled: loading}" :disabled="loading">
      <text class="report-title">查看食物消耗报告</text>
    </view>
    <view v-if="loading" class="loading-mask">
      <view class="loading-content">
        <view class="loading-spinner"></view>
        <text class="loading-text">AI营养师正在为你生成报告</text>
      </view>
    </view>
    <!-- 底部导航栏 -->
    <BottomTabBar active="report" />
  </view>
</template>

<script>
import BottomTabBar from '@/components/BottomTabBar.vue'
import DailyRecipeCard from '@/components/DailyRecipeCard.vue'
import config from '@/config/index.js'

export default {
  components: { BottomTabBar, DailyRecipeCard },
  data() {
    return {
      loading: false,
      dailyRecipe: {
        name: '牛油果牛肉沙拉',
        tags: ['均衡', '高蛋白']
      }
    }
  },
  methods: {
    goToFreshnessReport() {
      if (this.loading) return;
      this.loading = true;
      const token = uni.getStorageSync('token');
      uni.request({
        url: `${config.baseUrl}/reports/freshness`,
        method: 'GET',
        header: {
          'token': token
        },
        success: (res) => {
          this.loading = false;
          if (res.data && res.data.code === 1) {
            uni.navigateTo({
              url: '/pages/report/freshness-detail?reportContent=' + encodeURIComponent(res.data.data)
            });
          } else {
            uni.showToast({
              title: res.data && res.data.message ? res.data.message : '获取失败',
              icon: 'none'
            });
          }
        },
        fail: (err) => {
          this.loading = false;
          uni.showToast({
            title: '获取保鲜报告失败',
            icon: 'none'
          });
          console.error('获取保鲜报告失败:', err);
        }
      });
    },
    goToNutritionReport() {
      if (this.loading) return;
      this.loading = true;
      const token = uni.getStorageSync('token');
      uni.request({
        url: `${config.baseUrl}/reports/nutrition`,
        method: 'POST',
        header: {
          'token': token,
          'Content-Type': 'application/json'
        },
        data: {
          start: '2025-06-29T00:00:00',
          end: '2025-07-03T23:59:59'
        },
        success: (res) => {
          this.loading = false;
          if (res.data && res.data.code === 1) {
            uni.navigateTo({
              url: '/pages/report/nutrition-detail?reportContent=' + encodeURIComponent(res.data.data)
            });
          } else {
            uni.showToast({
              title: res.data && res.data.message ? res.data.message : '获取失败',
              icon: 'none'
            });
          }
        },
        fail: (err) => {
          this.loading = false;
          uni.showToast({
            title: '获取膳食营养报告失败',
            icon: 'none'
          });
          console.error('获取膳食营养报告失败:', err);
        }
      });
    },
    goToConsumptionReport() {
      if (this.loading) return;
      this.loading = true;
      const token = uni.getStorageSync('token');
      uni.request({
        url: `${config.baseUrl}/reports/consumption`,
        method: 'POST',
        header: {
          'token': token,
          'Content-Type': 'application/json'
        },
        data: {
          start: '2025-06-29T00:00:00',
          end: '2025-07-03T23:59:59'
        },
        success: (res) => {
          this.loading = false;
          if (res.data && res.data.code === 1) {
            uni.navigateTo({
              url: '/pages/report/consumption-detail?reportContent=' + encodeURIComponent(res.data.data)
            });
          } else {
            uni.showToast({
              title: res.data && res.data.message ? res.data.message : '获取失败',
              icon: 'none'
            });
          }
        },
        fail: (err) => {
          this.loading = false;
          uni.showToast({
            title: '获取食物消耗报告失败',
            icon: 'none'
          });
          console.error('获取食物消耗报告失败:', err);
        }
      });
    }
  }
}
</script>

<style scoped>
.report-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  background: #f8f8f8;
  padding-top: 40rpx;
  padding-bottom: 140rpx;
}
.report-box {
  width: 90vw;
  max-width: 600rpx;
  min-width: 320rpx;
  height: 120rpx;
  background: #fff;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 24rpx 0;
  font-size: 36rpx;
  color: #4CAF50;
  font-weight: bold;
  transition: box-shadow 0.2s;
}
.report-box:active {
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.10);
}
.report-title {
  letter-spacing: 2rpx;
}
.loading-mask {
  position: fixed;
  left: 0; right: 0; top: 0; bottom: 0;
  background: rgba(0,0,0,0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
.loading-content {
  background: #fff;
  border-radius: 24rpx;
  padding: 48rpx 32rpx;
  box-shadow: 0 8rpx 48rpx #b2b2ff44;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32rpx;
}
.loading-spinner {
  width: 60rpx;
  height: 60rpx;
  border: 6rpx solid #e0e0e0;
  border-top: 6rpx solid #4caf50;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.loading-text {
  font-size: 30rpx;
  color: #2e7d4b;
  margin-top: 12rpx;
}
.disabled {
  opacity: 0.5;
  pointer-events: none;
}
</style>