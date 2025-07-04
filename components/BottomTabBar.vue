<template>
  <view class="tabbar">
    <view class="tabbar-item" :class="{active: active==='ai'}" @click="goTo('ai')">
      <uni-icons type="compose" size="26" /><text>AI食谱</text>
    </view>
    <view class="tabbar-item" :class="{active: active==='fridge'}" @click="goTo('fridge')">
      <uni-icons type="box" size="26" /><text>我的冰箱</text>
    </view>
    <view class="tabbar-item add-btn" @click="goTo('add')">
      <text class="plus-icon">+</text>
    </view>
    <view class="tabbar-item" :class="{active: active==='report'}" @click="goTo('report')">
      <uni-icons type="chat" size="26" /><text>报告</text>
    </view>
    <view class="tabbar-item" :class="{active: active==='person'}" @click="goTo('person')">
      <uni-icons type="person" size="26" /><text>个人</text>
    </view>
  </view>

  <!-- 添加方式弹窗 -->
  <AddModal
      v-if="showAddModal"
      @close="closeAddModal"
      @manual="goManualAdd"
      @photo="goPhotoAdd"
  />
</template>

<script>
import AddModal from '@/components/AddModal.vue'
export default {
  name: 'BottomTabBar',
  components: { AddModal },
  props: {
    active: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      showAddModal: false
    }
  },
  methods: {
    goTo(type) {
      if(type === 'fridge') {
        uni.reLaunch({ url: '/pages/index/index' })
      } else if(type === 'person') {
        uni.reLaunch({ url: '/pages/index/person' })
      } else if(type === 'ai') {
        uni.reLaunch({ url: '/pages/index/ai' })
      } else if(type === 'report') {
        uni.reLaunch({ url: '/pages/index/report' })
      } else if(type === 'add') {
        this.openAddModal()
      } else {
        uni.showToast({ title: '功能待开发', icon: 'none' })
      }
    },
    openAddModal(){
      console.log("OPEN THE MODAL");
      this.showAddModal = true;
    },
    closeAddModal() {
      console.log("ClOSE THE MODAL");
      this.showAddModal = false;
    },
    goManualAdd() {
      this.showAddModal = false;
      uni.navigateTo({ url: '/pages/food/manual-add' });
    },
    goPhotoAdd() {
      this.showAddModal = false;
      uni.navigateTo({ url: '/pages/food/photo-add' });
    }
  }
}
</script>

<style lang="scss" scoped>
.tabbar {
  height: 120rpx;
  background: $card-background;
  border-top: 1rpx solid $border-color;
  display: flex;
  justify-content: space-around;
  align-items: center;
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.tabbar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: $text-secondary;
  font-size: $font-size-xs;
  padding: $spacing-xs;
  border-radius: $border-radius-md;
  transition: all $transition-fast;

  &:active {
    background: rgba($primary-light, 0.1);
  }

  &.active {
    color: $primary-color;
    font-weight: 600;
  }
}

.add-btn {
  background: linear-gradient(135deg, #7bc47f 0%, #6bb36f 100%);
  color: #fff !important;
  border-radius: 50%;
  width: 120rpx;
  height: 120rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: -40rpx;
  box-shadow: 0 8rpx 24rpx rgba(123, 196, 127, 0.3);
  border: 4rpx solid #fff;
  transition: all 0.3s ease;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: -2rpx;
    left: -2rpx;
    right: -2rpx;
    bottom: -2rpx;
    background: linear-gradient(135deg, #7bc47f, #6bb36f, #5aa25f);
    border-radius: 50%;
    z-index: -1;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:active {
    transform: scale(0.9);
    box-shadow: 0 4rpx 12rpx rgba(123, 196, 127, 0.4);
    
    &::before {
      opacity: 1;
    }
  }
  
  &:hover {
    box-shadow: 0 12rpx 32rpx rgba(123, 196, 127, 0.4);
  }
  
  .plus-icon {
    font-size: 48rpx;
    font-weight: 600;
    color: #fff;
    line-height: 1;
    text-align: center;
  }
}
</style> 