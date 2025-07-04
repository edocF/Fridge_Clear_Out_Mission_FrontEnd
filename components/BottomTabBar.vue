<template>
  <view class="tabbar">
    <view class="tabbar-item" :class="{active: active==='ai'}" @click="goTo('ai')">
      <uni-icons type="compose" size="26" /><text>AI食谱</text>
    </view>
    <view class="tabbar-item fridge-item" :class="{active: active==='fridge'}" @click="goTo('fridge')">
      <uni-icons type="box" size="26" /><text>我的冰箱</text>
    </view>
    <view class="tabbar-item report-item" :class="{active: active==='report'}" @click="goTo('report')">
      <uni-icons type="chat" size="26" /><text>报告</text>
    </view>
    <view class="tabbar-item" :class="{active: active==='person'}" @click="goTo('person')">
      <uni-icons type="person" size="26" /><text>个人</text>
    </view>
    <!-- 圆形按钮绝对定位，不影响tabbar-item布局 -->
    <view class="add-btn" @click="goTo('add')">
      <text class="add-icon">+</text>
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

.fridge-item {
  margin-left: -30rpx;
}

.report-item {
  margin-left: 120rpx;
}

.add-btn {
  position: absolute;
  left: 50%;
  top: -40rpx;
  transform: translateX(-50%);
  background: $primary-color;
  color: #fff !important;
  border-radius: 50%;
  width: 100rpx;
  height: 100rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: $shadow-md;
  border: 4rpx solid $card-background;
  transition: transform $transition-fast;
  z-index: 101;

  &:active {
    transform: scale(0.95);
  }
}

.add-icon {
  color: #fff;
  font-size: 60rpx;
  font-weight: bold;
  line-height: 100rpx;
  text-align: center;
  width: 100rpx;
  height: 100rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style> 