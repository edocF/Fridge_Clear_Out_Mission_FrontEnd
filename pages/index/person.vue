<template>
  <view class="person-container">
    <!-- 个人信息卡片 -->
    <view class="info-card">
      <view class="avatar-section">
        <image class="avatar" src="https://cdn.uviewui.com/uview/album/1.jpg" />
        <view class="user-info">
          <text class="username">张三</text>
        </view>
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
            />
            <button class="add-btn" @click="addRestriction" :disabled="!editMode">添加</button>
          </view>
        </view>
      </view>
    </view>

    <view class="form-actions">
      <button class="save-btn" v-if="editMode" @click="submitProfile">保存</button>
      <button class="edit-btn-main" v-else @click="editMode = true">编辑</button>
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
      restrictionTags: ['海鲜过敏', '乳糖不耐', '麸质过敏', '花生过敏', '素食'],
      selectedRestrictions: [],
      newRestriction: ''
    }
  },
  methods: {
    updatePreference(pref, value) {
      if (!this.editMode) return;
      pref.value = value;
    },
    toggleRestriction(tag) {
      if (!this.editMode) return;
      const index = this.selectedRestrictions.indexOf(tag);
      if (index === -1) {
        this.selectedRestrictions.push(tag);
      } else {
        this.selectedRestrictions.splice(index, 1);
      }
    },
    addRestriction() {
      if (!this.editMode) return;
      if (this.newRestriction && !this.selectedRestrictions.includes(this.newRestriction)) {
        this.selectedRestrictions.push(this.newRestriction);
        this.newRestriction = '';
      }
    },
    async submitProfile() {
      const token = uni.getStorageSync('token');
      const preferences = this.preferences.map(p => ({ name: p.name, value: p.value }));
      const restrictions = this.selectedRestrictions;
      uni.request({
        url: `${config.baseUrl}/user/profile`,
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
          'token': token
        },
        data: {
          preferences,
          restrictions
        },
        success: (res) => {
          if (res.statusCode === 200 && (res.data.code === '1' || res.data.code === 1)) {
            uni.showToast({ title: '保存成功', icon: 'success' });
            this.editMode = false;
          } else {
            uni.showToast({ title: res.data.msg || '保存失败', icon: 'none' });
          }
        },
        fail: () => {
          uni.showToast({ title: '保存失败', icon: 'none' });
        }
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
  gap: $spacing-sm;
}

.option-tag {
  padding: 4rpx $spacing-sm;
  border-radius: $border-radius-sm;
  font-size: $font-size-sm;
  color: $text-secondary;
  background: rgba($primary-light, 0.1);
  transition: all $transition-fast;
  
  &:active {
    transform: scale(0.95);
  }
  
  &.selected {
    background: $primary-color;
    color: #fff;
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
  
  &:active {
    transform: scale(0.95);
  }
  
  &.selected {
    background: $primary-color;
    color: #fff;
  }
}

.add-restriction {
  display: flex;
  gap: $spacing-sm;
  margin-top: $spacing-sm;
  
  input {
    flex: 1;
    height: 64rpx;
    background: rgba($primary-light, 0.1);
    border-radius: $border-radius-lg;
    padding: 0 $spacing-md;
    font-size: $font-size-sm;
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
    
    &:active {
      transform: scale(0.95);
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