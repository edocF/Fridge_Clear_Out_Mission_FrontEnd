<template>
  <view class="profile-edit-container">
    <!-- 返回按钮 -->
    <view class="back-btn" @click="goBack">
      <uni-icons type="left" size="20" color="#666" />
      <text class="back-text">返回</text>
    </view>

    <!-- 页面标题 -->
    <view class="page-title">
      <text class="title-text">个人信息</text>
    </view>

    <!-- 个人信息卡片 -->
    <view class="info-card">
      <view class="avatar-section">
        <image class="avatar" :src="getAvatarUrl()" @click="uploadAvatar" />
        <view class="avatar-tip">
          <text class="tip-text">点击更换头像</text>
        </view>
      </view>
      
      <view class="form-section">
        <!-- 用户名 -->
        <view class="form-item">
          <text class="form-label">用户名</text>
          <input 
            v-model="editingUsername" 
            class="form-input" 
            placeholder="请输入用户名"
            maxlength="20"
          />
        </view>
        
        <!-- 邮箱（只读） -->
        <view class="form-item">
          <text class="form-label">邮箱</text>
          <text class="form-value">{{userInfo.email || ''}}</text>
        </view>
        
        <!-- 新密码 -->
        <view class="form-item">
          <text class="form-label">新密码</text>
          <input 
            v-model="newPassword" 
            type="password" 
            class="form-input" 
            placeholder="请输入新密码（可选）"
            maxlength="20"
          />
        </view>
        
        <!-- 确认密码 -->
        <view class="form-item">
          <text class="form-label">确认密码</text>
          <input 
            v-model="confirmPassword" 
            type="password" 
            class="form-input" 
            placeholder="请再次输入新密码"
            maxlength="20"
          />
        </view>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="action-buttons">
      <button class="save-btn" @click="saveProfile">保存</button>
      <button class="cancel-btn" @click="goBack">取消</button>
    </view>
  </view>
</template>

<script>
import config from '@/config/index.js'

export default {
  data() {
    return {
      userInfo: {},
      editingUsername: '',
      newPassword: '',
      confirmPassword: '',
      originalImage: '',
      successCount: 0,
      totalRequests: 0
    }
  },
  onLoad() {
    this.fetchUserInfo();
  },
  methods: {
    getAvatarUrl() {
      if (this.userInfo.image && this.userInfo.image.trim() !== '') {
        return this.userInfo.image;
      }
      return '/static/default-avatar.png';
    },
    fetchUserInfo(callback) {
      const token = uni.getStorageSync('token');
      uni.request({
        url: `${config.baseUrl}/personalInfo`,
        method: 'GET',
        header: {
          'token': token
        },
        success: (res) => {
          if (res.statusCode === 200 && (res.data.code === '1' || res.data.code === 1)) {
            this.userInfo = res.data.data;
            this.editingUsername = this.userInfo.username || '';
            this.originalImage = this.userInfo.image || '';
            // 如果有回调函数，执行回调
            if (callback && typeof callback === 'function') {
              callback();
            }
          } else {
            uni.showToast({ title: res.data.msg || '获取用户信息失败', icon: 'none' });
          }
        },
        fail: () => {
          uni.showToast({ title: '获取用户信息失败', icon: 'none' });
        }
      });
    },
    uploadAvatar() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          const tempFilePath = res.tempFilePaths[0];
          this.uploadImage(tempFilePath);
        },
        fail: (err) => {
          uni.showToast({ title: '选择图片失败', icon: 'none' });
        }
      });
    },
    uploadImage(filePath) {
      const token = uni.getStorageSync('token');
      uni.uploadFile({
        url: `${config.baseUrl}/upload`,
        filePath: filePath,
        name: 'file',
        header: {
          'token': token
        },
        success: (res) => {
          try {
            const data = JSON.parse(res.data);
            if (data.code === 1 || data.code === '1') {
              this.userInfo.image = data.data;
              uni.showToast({ title: '头像上传成功', icon: 'success' });
            } else {
              uni.showToast({ title: data.msg || '头像上传失败', icon: 'none' });
            }
          } catch (e) {
            uni.showToast({ title: '头像上传失败', icon: 'none' });
          }
        },
        fail: (err) => {
          uni.showToast({ title: '头像上传失败', icon: 'none' });
        }
      });
    },
    saveProfile() {
      if (this.editingUsername.trim() === '') {
        uni.showToast({ title: '用户名不能为空', icon: 'none' });
        return;
      }

      if (this.newPassword || this.confirmPassword) {
        if (this.newPassword !== this.confirmPassword) {
          uni.showToast({ title: '两次输入的密码不一致', icon: 'none' });
          return;
        }
        if (this.newPassword.length < 6) {
          uni.showToast({ title: '密码长度不能少于6位', icon: 'none' });
          return;
        }
      }

      const token = uni.getStorageSync('token');
      let hasChanges = false;
      this.successCount = 0;
      this.totalRequests = 0;

      // 检查是否有用户名变更
      if (this.editingUsername !== this.userInfo.username) {
        hasChanges = true;
        this.totalRequests++;
        this.updateUsername(token);
      }

      // 检查是否有密码变更
      if (this.newPassword && this.newPassword.trim() !== '') {
        hasChanges = true;
        this.totalRequests++;
        this.updatePassword(token);
      }

      // 检查是否有头像变更
      if (this.userInfo.image && this.userInfo.image !== this.originalImage) {
        hasChanges = true;
        this.totalRequests++;
        this.updateAvatar(token);
      }

      if (!hasChanges) {
        uni.showToast({ title: '没有需要保存的更改', icon: 'none' });
        return;
      }

      // 如果没有需要发送的请求，直接返回
      if (this.totalRequests === 0) {
        uni.showToast({ title: '保存成功', icon: 'success' });
        setTimeout(() => {
          this.goBack();
        }, 800);
      }
    },
    updateUsername(token) {
      uni.request({
        url: `${config.baseUrl}/personalInfo/update-username`,
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
          'token': token
        },
        data: { username: this.editingUsername },
        success: (res) => {
          if (res.statusCode === 200 && (res.data.code === '1' || res.data.code === 1)) {
            // 立即更新本地用户信息
            this.userInfo.username = this.editingUsername;
            this.successCount++;
            this.checkAllRequestsComplete();
          } else {
            uni.showToast({ title: res.data.msg || '用户名更新失败', icon: 'none' });
          }
        },
        fail: () => {
          uni.showToast({ title: '用户名更新失败', icon: 'none' });
        }
      });
    },
    updatePassword(token) {
      uni.request({
        url: `${config.baseUrl}/personalInfo/update-password`,
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
          'token': token
        },
        data: { password: this.newPassword },
        success: (res) => {
          if (res.statusCode === 200 && (res.data.code === '1' || res.data.code === 1)) {
            this.successCount++;
            this.checkAllRequestsComplete();
          } else {
            uni.showToast({ title: res.data.msg || '密码更新失败', icon: 'none' });
          }
        },
        fail: () => {
          uni.showToast({ title: '密码更新失败', icon: 'none' });
        }
      });
    },
    updateAvatar(token) {
      uni.request({
        url: `${config.baseUrl}/personalInfo/avatar`,
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
          'token': token
        },
        data: { image: this.userInfo.image },
        success: (res) => {
          if (res.statusCode === 200 && (res.data.code === '1' || res.data.code === 1)) {
            this.successCount++;
            this.checkAllRequestsComplete();
          } else {
            uni.showToast({ title: res.data.msg || '头像更新失败', icon: 'none' });
          }
        },
        fail: () => {
          uni.showToast({ title: '头像更新失败', icon: 'none' });
        }
      });
    },
    checkAllRequestsComplete() {
      if (this.successCount >= this.totalRequests) {
        // 重新获取用户信息以确保显示最新数据，获取完成后再返回
        this.fetchUserInfo(() => {
          uni.showToast({ title: '保存成功', icon: 'success' });
          // 延迟返回，确保数据刷新完成
          setTimeout(() => {
            this.goBack();
          }, 1000);
        });
      }
    },
    goBack() {
      // 返回上一页并传递更新标志
      const pages = getCurrentPages();
      if (pages.length > 1) {
        const prevPage = pages[pages.length - 2];
        // 设置上一页需要刷新的标志
        if (prevPage && prevPage.$vm) {
          prevPage.$vm.needRefresh = true;
        }
      }
      uni.navigateBack();
    }
  }
}
</script>

<style lang="scss" scoped>
.profile-edit-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 30rpx;
  padding-top: 120rpx;
}

.back-btn {
  position: fixed;
  top: 60rpx;
  left: 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 16rpx 24rpx;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 50rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.12);
  border: 1rpx solid rgba(123, 196, 127, 0.2);
  z-index: 100;
  transition: all 0.3s ease;
  
  &:active {
    transform: scale(0.95);
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  }
  
  .back-text {
    font-size: 28rpx;
    color: #333;
    font-weight: 500;
  }
}

.page-title {
  text-align: center;
  margin-bottom: 60rpx;
  
  .title-text {
    font-size: 36rpx;
    color: #333;
    font-weight: 600;
  }
}

.info-card {
  background: white;
  border-radius: 20rpx;
  padding: 40rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
  margin-bottom: 60rpx;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 60rpx;
}

.avatar {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  border: 4rpx solid #7bc47f;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.avatar-tip {
  .tip-text {
    font-size: 24rpx;
    color: #999;
  }
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 40rpx;
}

.form-item {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 2rpx solid rgba(123, 196, 127, 0.1);
}

.form-label {
  font-size: 32rpx;
  color: #333;
  font-weight: 500;
  min-width: 120rpx;
}

.form-input {
  flex: 1;
  height: 64rpx;
  background: rgba(123, 196, 127, 0.1);
  border-radius: 16rpx;
  padding: 0 20rpx;
  font-size: 32rpx;
  border: 2rpx solid transparent;
  transition: all 0.3s;
  
  &:focus {
    border-color: #7bc47f;
    background: rgba(123, 196, 127, 0.15);
  }
}

.form-value {
  flex: 1;
  font-size: 32rpx;
  color: #999;
  padding-left: 20rpx;
}

.action-buttons {
  display: flex;
  gap: 20rpx;
  margin-top: 60rpx;
}

.save-btn {
  flex: 1;
  height: 88rpx;
  background: #7bc47f;
  color: white;
  border-radius: 16rpx;
  font-size: 32rpx;
  font-weight: 500;
  border: none;
  transition: all 0.3s;
  
  &:active {
    background: #6bb36f;
    transform: scale(0.98);
  }
}

.cancel-btn {
  flex: 1;
  height: 88rpx;
  background: transparent;
  color: #999;
  border: 2rpx solid rgba(153, 153, 153, 0.3);
  border-radius: 16rpx;
  font-size: 32rpx;
  font-weight: 500;
  transition: all 0.3s;
  
  &:active {
    background: rgba(153, 153, 153, 0.1);
    transform: scale(0.98);
  }
}
</style> 