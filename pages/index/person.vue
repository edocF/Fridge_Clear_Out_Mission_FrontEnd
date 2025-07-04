<template>
  <view class="person-container">
    <!-- 个人信息卡片 -->
    <view class="info-card">
      <view class="avatar-section">
        <image class="avatar" :src="getAvatarUrl()" />
        <view class="user-info">
          <text class="username">{{userInfo.username || '用户'}}</text>
          <text class="email">{{userInfo.email || ''}}</text>
        </view>
      </view>
      
      <!-- 个人信息编辑按钮 -->
      <view class="edit-profile-btn" @click="goToProfileEdit">
        <uni-icons type="gear" size="20" color="#7bc47f" />
        <text class="edit-text">编辑个人信息</text>
        <uni-icons type="right" size="16" color="#999" />
      </view>
    </view>

    <!-- 个人偏好 -->
    <view class="section-card">
      <view class="section-header">
        <text class="section-title">个人偏好</text>
      </view>
      <view class="preference-list">
        <view class="preference-item" v-for="(pref, idx) in preferences" :key="idx">
          <view class="pref-info">
            <uni-icons :type="pref.icon" size="24" color="#7bc47f" />
            <text class="pref-name">{{pref.name}}</text>
          </view>
          <view class="pref-options">
            <view 
              v-for="option in pref.options" 
              :key="option"
              class="option-tag"
              :class="{'selected': pref.value === option}"
              @click="editMode && updatePreference(pref, option)"
              @tap="editMode && updatePreference(pref, option)"
            >
              {{option}}
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 饮食禁忌 -->
    <view class="section-card">
      <view class="section-header">
        <text class="section-title">饮食禁忌</text>
      </view>
      <view class="restriction-list">
        <view class="restriction-edit">
          <view class="restriction-tags">
            <view 
              v-for="(tag, idx) in restrictionTags" 
              :key="idx"
              class="restriction-tag"
              :class="{'selected': selectedRestrictions.includes(tag)}"
              @click="editMode && toggleRestriction(tag)"
            >
              {{tag}}
            </view>
          </view>
          <view class="add-restriction">
            <input 
              type="text" 
              v-model="newRestriction" 
              placeholder="添加其他禁忌" 
              @confirm="addRestriction"
              :disabled="!editMode"
              class="restriction-input"
              maxlength="20"
            />
            <button class="add-btn" @click="addRestriction" :disabled="!editMode || !newRestriction.trim()">添加</button>
          </view>
        </view>
      </view>
    </view>

    <view class="form-actions">
      <button class="save-btn" v-if="editMode" @click="submitProfile">保存</button>
      <button class="cancel-btn" v-if="editMode" @click="cancelEdit">取消</button>
      <button class="edit-btn-main" v-else @click="startEdit">编辑</button>
    </view>

    <!-- 底部导航栏 -->
    <BottomTabBar active="person" />
  </view>
</template>

<script>
import BottomTabBar from '@/components/BottomTabBar.vue'
import config from '@/config/index.js'

export default {
  components: { BottomTabBar },
  data() {
    return {
      editMode: false,
      isEditingPreference: false,
      isEditingRestriction: false,
      isToggling: false,
      userInfo: {},
      preferences: [
        { 
          icon: 'heart', 
          name: '口味偏好', 
          value: '清淡',
          options: ['清淡', '适中', '重口']
        },
        { 
          icon: 'star', 
          name: '调味偏好', 
          value: '无',
          options: ['无', '少糖', '少盐', '少油']
        }
      ],
      restrictionTags: ['海鲜过敏', '乳糖不耐受', '麸质过敏', '花生过敏', '素食'],
      selectedRestrictions: [],
      newRestriction: '',
      needRefresh: false
    }
  },
  onLoad() {
    this.fetchUserInfo();
  },
  onShow() {
    // 每次页面显示时重新获取用户信息，确保显示最新数据
    // 如果是从编辑页面返回，强制刷新
    if (this.needRefresh) {
      this.fetchUserInfo(() => {
        this.needRefresh = false;
        console.log('用户信息已刷新');
      });
    } else {
      // 正常显示时也刷新，确保数据最新
      this.fetchUserInfo();
    }
  },
  methods: {//添加获取用户信息和头像上传
    getAvatarUrl() {
      // 如果用户有上传头像，使用用户头像
      if (this.userInfo.image && this.userInfo.image.trim() !== '') {
        return this.userInfo.image;
      }
      // 否则使用默认头像
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
            // 回显个人偏好
            if (this.userInfo.dietaryPreferences) {
              const tastePref = this.preferences.find(p => p.name === '口味偏好');
              if (tastePref) {
                tastePref.value = this.userInfo.dietaryPreferences;
              }
            }
            if (this.userInfo.seasoningPreferences) {
              const seasoningPref = this.preferences.find(p => p.name === '调味偏好');
              if (seasoningPref) {
                seasoningPref.value = this.userInfo.seasoningPreferences;
              }
            }
            // 回显饮食禁忌
            if (this.userInfo.dietaryTaboos && Array.isArray(this.userInfo.dietaryTaboos)) {
              this.selectedRestrictions = [...this.userInfo.dietaryTaboos];
            }
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
    updatePreference(pref, value) {
      console.log('点击偏好选项:', pref.name, value, '编辑模式:', this.editMode);
      if (!this.editMode) {
        console.log('非编辑模式，忽略点击');
        return;
      }
      pref.value = value;
      console.log('更新偏好成功:', pref.name, '新值:', value);
      uni.showToast({ title: '已选择: ' + value, icon: 'success' });
    },
    toggleRestriction(tag) {
      console.log('点击禁忌标签:', tag, '编辑模式:', this.editMode);
        const index = this.selectedRestrictions.indexOf(tag);
      if (index === -1) {
        this.selectedRestrictions.push(tag);
        console.log('添加禁忌:', tag, '当前禁忌列表:', this.selectedRestrictions);
        uni.showToast({ title: '已添加禁忌: ' + tag, icon: 'success' });
      } else {
        this.selectedRestrictions.splice(index, 1);
        console.log('移除禁忌:', tag, '当前禁忌列表:', this.selectedRestrictions);
        uni.showToast({ title: '已移除禁忌: ' + tag, icon: 'none' });
      }
      
      // 延迟重置标志，防止重复触发
      setTimeout(() => {
        this.isToggling = false;
      }, 300);
    },
    addRestriction() {
      console.log('添加自定义禁忌:', this.newRestriction, '编辑模式:', this.editMode);
      if (!this.editMode) {
        console.log('非编辑模式，忽略添加');
        return;
      }
      const restriction = this.newRestriction.trim();
      if (!restriction) {
        uni.showToast({ title: '请输入禁忌内容', icon: 'none' });
        return;
      }
      if (this.selectedRestrictions.includes(restriction)) {
        uni.showToast({ title: '该禁忌已存在', icon: 'none' });
        return;
      }
      this.selectedRestrictions.push(restriction);
      this.newRestriction = '';
      console.log('添加自定义禁忌成功:', restriction, '当前禁忌列表:', this.selectedRestrictions);
      uni.showToast({ title: '添加禁忌成功: ' + restriction, icon: 'success' });
    },
    startEdit() {
      this.editMode = true;
      console.log('进入编辑模式');
      console.log('当前偏好设置:', this.preferences);
      console.log('当前禁忌设置:', this.selectedRestrictions);
      console.log('预设禁忌标签:', this.restrictionTags);
      uni.showToast({ title: '已进入编辑模式，可以修改偏好和禁忌', icon: 'success' });
    },

    async submitProfile() {
      // 检查是否有未添加的自定义禁忌
      if (this.newRestriction && this.newRestriction.trim() !== '') {
        uni.showModal({
          title: '提示',
          content: '您输入了自定义禁忌但未点击添加，是否先添加？',
          confirmText: '添加',
          cancelText: '放弃添加',
          success: (res) => {
            if (res.confirm) {
              // 用户选择添加
              this.addRestriction();
              // 添加完成后再次尝试保存
              setTimeout(() => {
                this.submitProfile();
              }, 500);
            } else {
              // 用户选择放弃添加，直接退出编辑模式
              this.newRestriction = '';
              this.editMode = false;
              uni.showToast({ title: '已取消添加', icon: 'none' });
            }
          }
        });
        return;
      }
      
      this.performSave();
    },
    performSave() {
      const token = uni.getStorageSync('token');
      const dietaryPreferences = this.preferences.find(p => p.name === '口味偏好')?.value || '';
      const seasoningPreferences = this.preferences.find(p => p.name === '调味偏好')?.value || '';
      const dietaryTaboos = this.selectedRestrictions;
      
      console.log('准备保存的数据:', {
        dietaryPreferences,
        seasoningPreferences,
        dietaryTaboos
      });
          
      uni.request({
        url: `${config.baseUrl}/personalInfo`,
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
          'token': token
        },
        data: {
          dietaryPreferences,
          seasoningPreferences,
          dietaryTaboos
        },
        success: (res) => {
          console.log('保存响应:', res);
          if (res.statusCode === 200) {
            if (res.data.code === '1' || res.data.code === 1) {
              uni.showToast({ title: '保存成功', icon: 'success' });
              // 重新获取用户信息以确保数据同步
              this.fetchUserInfo();
              // 询问用户是否退出编辑模式
              setTimeout(() => {
                uni.showModal({
                  title: '保存成功',
                  content: '是否退出编辑模式？',
                  confirmText: '退出',
                  cancelText: '继续编辑',
                  success: (modalRes) => {
                    if (modalRes.confirm) {
                      this.editMode = false;
                    }
                  }
                });
              }, 1000);
            } else {
              console.error('保存失败，错误信息:', res.data);
              uni.showToast({ title: res.data.msg || '保存失败', icon: 'none' });
            }
          } else {
            console.error('HTTP状态码错误:', res.statusCode);
            uni.showToast({ title: '网络错误，请重试', icon: 'none' });
          }
        },
        fail: (err) => {
          console.error('保存失败:', err);
          uni.showToast({ title: '网络错误，请检查网络连接', icon: 'none' });
        }
      });
    },
    cancelEdit() {
      this.editMode = false;
      // 重新获取用户信息，恢复原始数据
      this.fetchUserInfo();
      uni.showToast({ title: '已取消编辑', icon: 'none' });
    },
    goToProfileEdit() {
      uni.navigateTo({
        url: '/pages/index/profile-edit'
      });
    }
  }
}
</script>

<style lang="scss" scoped>
.person-container {
  min-height: 100vh;
  background: $background-color;
  padding: $spacing-lg;
  padding-bottom: 140rpx;
}

.info-card {
  background: $card-background;
  border-radius: $border-radius-xl;
  padding: $spacing-xl;
  box-shadow: $shadow-sm;
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: $spacing-md;
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  border: 4rpx solid $primary-light;
  box-shadow: $shadow-sm;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;
}

.username {
  font-size: $font-size-lg;
  color: $text-primary;
  font-weight: 600;
}

.username-input {
  font-size: $font-size-lg;
  color: $text-primary;
  font-weight: 600;
  background: transparent;
  border: none;
  outline: none;
  width: 100%;
  
  &:focus {
    border-bottom: 2rpx solid $primary-color;
  }
}

.password-section {
  margin-top: $spacing-lg;
  padding-top: $spacing-lg;
  border-top: 2rpx solid rgba($primary-light, 0.1);
}

.password-item {
  display: flex;
  align-items: center;
  margin-bottom: $spacing-md;
  gap: $spacing-md;
}

.password-label {
  font-size: $font-size-sm;
  color: $text-secondary;
  min-width: 120rpx;
}

.password-input {
  flex: 1;
  height: 64rpx;
  background: rgba($primary-light, 0.1);
  border-radius: $border-radius-lg;
  padding: 0 $spacing-md;
  font-size: $font-size-sm;
  border: 2rpx solid transparent;
  transition: all $transition-fast;
  
  &:focus {
    border-color: $primary-color;
    background: rgba($primary-light, 0.15);
  }
}

.email {//添加邮箱显示的CSS样式
  font-size: $font-size-sm;
  color: $text-secondary;
}

.edit-profile-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-md;
  margin-top: $spacing-md;
  background: rgba($primary-light, 0.1);
  border-radius: $border-radius-lg;
  border: 2rpx solid transparent;
  transition: all $transition-fast;
  
  &:active {
    background: rgba($primary-light, 0.2);
    border-color: $primary-color;
  }
  
  .edit-text {
    flex: 1;
    font-size: $font-size-md;
    color: $text-primary;
    margin-left: $spacing-sm;
  }
}

.section-card {
  background: $card-background;
  border-radius: $border-radius-xl;
  padding: $spacing-xl;
  margin-top: $spacing-lg;
  box-shadow: $shadow-sm;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-md;
}

.section-title {
  font-size: $font-size-lg;
  color: $text-primary;
  font-weight: 600;
}

.preference-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.preference-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-sm 0;
  border-bottom: 2rpx solid rgba($primary-light, 0.1);
  transition: background-color $transition-fast;
  
  &:active {
    background-color: rgba($primary-light, 0.05);
  }
}

.pref-info {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
}

.pref-name {
  font-size: $font-size-md;
  color: $text-primary;
}

.pref-value {
  font-size: $font-size-md;
  color: $text-secondary;
}

.edit-btn {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color $transition-fast;
  
  &:active {
    background-color: rgba($primary-light, 0.1);
  }
}

.pref-options {
  display: flex;
  gap: $spacing-md;
  flex-wrap: wrap;
}

.option-tag {
  padding: 8rpx $spacing-md;
  border-radius: $border-radius-lg;
  font-size: $font-size-sm;
  color: $text-secondary;
  background: rgba($primary-light, 0.1);
  transition: all $transition-fast;
  cursor: pointer;
  user-select: none;
  border: 2rpx solid transparent;
  
  &:active {
    transform: scale(0.95);
  }
  
  &.selected {
    background: $primary-color;
    color: #fff;
    border-color: $primary-color;
    box-shadow: 0 2rpx 8rpx rgba($primary-color, 0.3);
  }
}

.restriction-list {
  margin-top: $spacing-md;
}

.restriction-edit {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.restriction-tags {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-sm;
}

.restriction-tag {
  padding: 8rpx $spacing-md;
  border-radius: $border-radius-lg;
  font-size: $font-size-sm;
  color: $text-secondary;
  background: rgba($primary-light, 0.1);
  transition: all $transition-fast;
  cursor: pointer;
  user-select: none;
  border: 2rpx solid transparent;
  
  &:active {
    transform: scale(0.95);
  }
  
  &.selected {
    background: $primary-color;
    color: #fff;
    border-color: $primary-color;
    box-shadow: 0 2rpx 8rpx rgba($primary-color, 0.3);
    font-weight: 500;
  }
}

.add-restriction {
  display: flex;
  gap: $spacing-sm;
  margin-top: $spacing-sm;
  
  .restriction-input {
    flex: 1;
    height: 64rpx;
    background: rgba($primary-light, 0.1);
    border-radius: $border-radius-lg;
    padding: 0 $spacing-md;
    font-size: $font-size-sm;
    border: 2rpx solid transparent;
    transition: all $transition-fast;
    
    &:focus {
      border-color: $primary-color;
      background: rgba($primary-light, 0.15);
    }
    
    &:disabled {
      background: rgba($text-secondary, 0.1);
      color: $text-secondary;
    }
  }
  
  .add-btn {
    height: 64rpx;
    padding: 0 $spacing-lg;
    background: $primary-color;
    color: #fff;
    border-radius: $border-radius-lg;
    font-size: $font-size-sm;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    transition: all $transition-fast;
    
    &:active {
      transform: scale(0.95);
    }
    
    &:disabled {
      background: rgba($text-secondary, 0.3);
      color: rgba($text-secondary, 0.5);
    }
  }
}

.restriction-display {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-sm;
  min-height: 64rpx;
  align-items: center;
}

.empty-text {
  font-size: $font-size-sm;
  color: $text-secondary;
}

.form-actions {
  display: flex;
  justify-content: center;
  margin: 32rpx 0 0 0;
  gap: 32rpx;
}
.save-btn {
  background: #4caf50;
  color: #fff;
  font-size: 32rpx;
  border-radius: 16rpx;
  height: 88rpx;
  font-weight: bold;
  flex: 1;
}
.cancel-btn {
  background: #ff9800;
  color: #fff;
  font-size: 32rpx;
  border-radius: 16rpx;
  height: 88rpx;
  font-weight: bold;
  flex: 1;
  margin-left: 16rpx;
}
.edit-btn-main {
  background: #7bc47f;
  color: #fff;
  font-size: 32rpx;
  border-radius: 16rpx;
  height: 88rpx;
  font-weight: bold;
  flex: 1;
}
</style> 