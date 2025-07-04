<template>
  <view class="manual-add-container">
    <view class="content-wrapper">
          <!-- 窗口样式的返回按钮 -->
    <view class="window-back-button" @click="goBack">
      <text class="back-text">返回</text>
    </view>
      
      <view class="header">
        <text class="title">手动添加食物</text>
      </view>
          <view class="form">
        <view class="form-item">
          <text class="label">食物名称</text>
          <input v-model="form.name" placeholder="请输入食物名称" :disabled="loading" />
        </view>
        <button class="submit-btn" @click="submit" :disabled="loading">{{ loading ? '添加中...' : '添加' }}</button>
      </view>
    </view>
    
    <view v-if="loading" class="loading-mask">
      <view class="loading-content">
        <view class="loading-spinner"></view>
        <text class="loading-text">AI营养师为你生成食物信息中</text>
      </view>
    </view>
  </view>
</template>

<script>
import config from '@/config/index.js'
export default {
  data() {
    return {
      form: {
        name: ''
      },
      loading: false
    }
  },
  methods: {
    goBack() {
      uni.navigateBack();
    },
    submit() {
      if (this.loading) return;
      if (!this.form.name) {
        uni.showToast({ title: '请输入食物名称', icon: 'none' });
        return;
      }
      this.loading = true;
      const token = uni.getStorageSync('token');
      uni.request({
        url: `${config.baseUrl}/food`,
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
          'token': token
        },
        data: {
          name: this.form.name
        },
        success: (res) => {
          this.loading = false;
          if (res.statusCode === 200 && (res.data.code === '1' || res.data.code === 1)) {
      uni.showToast({ title: '添加成功', icon: 'success' });
            // 通知上一页刷新
            const pages = getCurrentPages();
            if (pages.length > 1) {
              const prevPage = pages[pages.length - 2];
              if (prevPage && prevPage.$vm && prevPage.$vm.fetchFoodList) {
                prevPage.$vm.fetchFoodList();
              }
            }
      setTimeout(() => uni.navigateBack(), 1000);
          } else {
            uni.showToast({ title: res.data.msg || '添加失败', icon: 'none' });
          }
        },
        fail: (error) => {
          this.loading = false;
          uni.showToast({ title: '添加失败', icon: 'none' });
        }
      });
    }
  }
}
</script>

<style scoped>
.manual-add-container {
  min-height: 100vh;
  background: #eafaf1;
  padding: 48rpx 32rpx;
}

.content-wrapper {
  position: relative;
}
.header {
  text-align: center;
  margin-bottom: 32rpx;
}
.title {
  font-size: 40rpx;
  color: #2e7d4b;
  font-weight: bold;
}

.window-back-button {
  position: fixed !important;
  top: 40rpx !important;
  left: 32rpx !important;
  z-index: 9999 !important;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  border: 1rpx solid #d0d0d0;
  border-radius: 8rpx;
  padding: 8rpx 16rpx;
  min-width: 80rpx;
  transition: all 0.2s ease;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
  cursor: pointer;
}

.window-back-button:active {
  background: #f0f0f0;
  transform: scale(0.98);
}

.back-text {
  font-size: 24rpx;
  color: #666666;
  font-weight: 400;
}
.form {
  background: #fff;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 24rpx #d0e7d2;
  padding: 32rpx;
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}
.form-item {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}
.label {
  font-size: 28rpx;
  color: #7bc47f;
}
input {
  background: #f8f8f8;
  border-radius: 12rpx;
  padding: 16rpx;
  font-size: 28rpx;
  border: none;
}
.submit-btn {
  background: #05b214;
  color: #fff;
  font-size: 32rpx;
  border-radius: 16rpx;
  height: 88rpx;
  margin-top: 24rpx;
  font-weight: bold;
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
</style> 