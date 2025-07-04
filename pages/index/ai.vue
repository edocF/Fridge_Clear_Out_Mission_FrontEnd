<template>
  <view class="ai-container">
    <!-- 顶部栏 -->
    <view class="ai-top-bar">
      <text class="ai-title">AI 菜谱</text>
      <view class="ai-filters">
        <view class="filter-item">
          <picker @change="onDietChange" :value="dietIndex" :range="dietOptions" range-key="label">
            <view class="picker-content">
              <text class="icon">🏆</text>
              <text>{{dietOptions[dietIndex].label}}</text>
              <text class="arrow">▼</text>
            </view>
          </picker>
        </view>
        <view class="filter-item">
          <picker @change="onCuisineChange" :value="cuisineIndex" :range="cuisineOptions" range-key="label">
            <view class="picker-content">
              <text class="icon">🍽️</text>
              <text>{{cuisineOptions[cuisineIndex].label}}</text>
              <text class="arrow">▼</text>
            </view>
          </picker>
        </view>
        <view class="filter-item">
          <picker @change="onTimeChange" :value="timeIndex" :range="timeOptions" range-key="label">
            <view class="picker-content">
              <text class="icon">⏰</text>
              <text>{{timeOptions[timeIndex].label}}</text>
              <text class="arrow">▼</text>
            </view>
          </picker>
        </view>
      </view>
    </view>
    <!-- 食材卡片 -->
    <view class="ai-food-list">
      <view class="ai-food-card" v-for="(food, idx) in foodList" :key="idx" 
            @click="isSelectMode ? toggleSelect(food) : showFoodDetail(food)"
            :class="{'selected': isSelectMode && selectedFoods.some(f => f.name === food.name)}">
        <view class="ai-food-img">
          <text class="food-emoji">{{food.emoji}}</text>
        </view>
        <view class="ai-food-info">
          <view class="ai-food-header">
            <text class="ai-food-name">{{food.name}}</text>
            <text class="ai-food-weight">100g</text>
          </view>
          <view class="ai-food-kcal">
            <text class="icon">🔥</text>
            <text class="kcal">{{food.kcal}} 千卡</text>
          </view>
          <view class="ai-food-nutrition">
            <view class="nutrient"><text class="icon">🌿</text><text>{{food.carb}}g</text></view>
            <view class="nutrient"><text class="icon">💪</text><text>{{food.protein}}g</text></view>
            <view class="nutrient"><text class="icon">🔥</text><text>{{food.fat}}g</text></view>
            <view class="nutrient"><text class="icon">💰</text><text>{{food.price}}</text></view>
          </view>
        </view>
        <view v-if="isSelectMode" class="select-indicator">
          <text class="select-icon">{{selectedFoods.some(f => f.name === food.name) ? '✅' : '⭕'}}</text>
        </view>
      </view>
    </view>
    <!-- 主要功能按钮 -->
    <view class="ai-btns">
      <button class="ai-btn gradient-main" @click="generateFromExpiring">
        <text class="btn-icon">🔄</text>临期食材生成
      </button>
      <button class="ai-btn gradient-sub" @click="toggleSelectMode">
        <text class="btn-icon">🍽️</text>
        {{isSelectMode ? '确认选择' : '自选食材生成'}}
      </button>
    </view>
    <!-- 底部导航栏 -->
    <BottomTabBar @add="openAddModal" active="ai" />
  </view>
</template>

<script>
import BottomTabBar from '@/components/BottomTabBar.vue'
import AddModal from '@/components/AddModal.vue'
import config from '@/config/index.js'

export default {
  components: { BottomTabBar, AddModal },
  data() {
    return {
      dietIndex: 0,
      cuisineIndex: 0,
      timeIndex: 0,
      dietOptions: [
        { label: '均衡', value: '均衡' },
        { label: '增肌', value: '增肌' },
        { label: '减脂', value: '减脂' },
        { label: '素食', value: '素食' },
        { label: '无麸质', value: '无麸质' }
      ],
      cuisineOptions: [
        { label: '中式', value: '中式' },
        { label: '西式', value: '西式' },
        { label: '日式', value: '日式' },
        { label: '韩式', value: '韩式' },
        { label: '意式', value: '意式' }
      ],
      timeOptions: [
        { label: '不限时间', value: '不限时间' },
        { label: '15分钟内', value: '15分钟内' },
        { label: '30分钟内', value: '30分钟内' },
        { label: '1小时内', value: '1小时内' }
      ],
      isSelectMode: false,
      selectedFoods: [],
      showAddModal: false,
      userFoods: [],
      loading: false
    }
  },
  computed: {
    foodList() {
      const foods = this.userFoods.length > 0 ? this.userFoods : (getApp().globalData.foodList || []);
      return foods.filter(food => !food.expired);
    }
  },
  onLoad() {
    // 获取用户冰箱中的食材
  },
  methods: {
    fetchFoodList() {
      // 调用全局方法获取食物列表
      if (getApp().fetchFoodList) {
        getApp().fetchFoodList();
      }
    },
    onDietChange(e) {
      this.dietIndex = e.detail.value;
      this.updateRecipes();
    },
    onCuisineChange(e) {
      this.cuisineIndex = e.detail.value;
      this.updateRecipes();
    },
    onTimeChange(e) {
      this.timeIndex = e.detail.value;
      this.updateRecipes();
    },
    updateRecipes() {
      // 这里可以根据选择的过滤条件更新食谱
      console.log('更新食谱', {
        diet: this.dietOptions[this.dietIndex].value,
        cuisine: this.cuisineOptions[this.cuisineIndex].value,
        time: this.timeOptions[this.timeIndex].value
      });
    },
    showFoodDetail(food) {
      uni.navigateTo({
        url: `/pages/food/detail?food=${encodeURIComponent(JSON.stringify(food))}`
      });
    },
    toggleSelectMode() {
      if (this.isSelectMode && this.selectedFoods.length > 0) {
        // 生成食谱接口参数
        const foods = this.selectedFoods.map(f => ({
          id: f.id,
          name: f.name,
          expired: f.expired,
          expSoon: f.expSoon,
          fridgeId: f.fridgeId
        }));
        const recipeOption = {
          dietOptions: this.dietOptions[this.dietIndex].value,
          cuisineOptions: this.cuisineOptions[this.cuisineIndex].value,
          timeOptions: this.timeOptions[this.timeIndex].value
        };
        this.generateRecipeApi(recipeOption, foods);
      }
      this.isSelectMode = !this.isSelectMode;
      if (!this.isSelectMode) {
        this.selectedFoods = [];
      }
    },
    toggleSelect(food) {
      const index = this.selectedFoods.findIndex(f => f.name === food.name);
      if (index === -1) {
        this.selectedFoods.push(food);
      } else {
        this.selectedFoods.splice(index, 1);
      }
    },
    generateFromExpiring() {
      const expiringFoods = this.foodList.filter(food => food.expSoon || food.expired);
      if (expiringFoods.length === 0) {
        uni.showToast({
          title: '没有临期食材',
          icon: 'none'
        });
        return;
      }
      const foods = expiringFoods.map(f => ({
        id: f.id,
        name: f.name,
        expired: f.expired,
        expSoon: f.expSoon,
        fridgeId: f.fridgeId
      }));
      const recipeOption = {
        dietOptions: this.dietOptions[this.dietIndex].value,
        cuisineOptions: this.cuisineOptions[this.cuisineIndex].value,
        timeOptions: this.timeOptions[this.timeIndex].value
      };
      this.generateRecipeApi(recipeOption, foods);
    },
    async generateRecipeApi(recipeOption, foods) {
      const token = uni.getStorageSync('token');
      if (!token) {
        uni.showToast({ title: '请先登录', icon: 'none' });
        return;
      }
      uni.showLoading({ title: 'AI正在为您生成食谱...' });
      try {
        const response = await uni.request({
          url: `${config.baseUrl}/recipe`,
          method: 'POST',
          header: {
            'Content-Type': 'application/json',
            'token': token
          },
          data: {
            recipeOption,
            foodInfoForRecipes: foods
          }
        });
        uni.hideLoading();
        if ( response.data.code === 1) {
          // 直接将完整食谱内容传递到generate页面
          let recipeContent = response.data.data;
          if (typeof recipeContent === 'object' && recipeContent !== null && 'code' in recipeContent) {
            recipeContent = recipeContent.data;
          }
          uni.navigateTo({
            url: `/pages/recipe/generate?foods=${encodeURIComponent(JSON.stringify(foods.map(f => ({name: f.name, emoji: f.emoji})) ))}&dietType=${recipeOption.dietOptions}&cuisineType=${recipeOption.cuisineOptions}&timeLimit=${recipeOption.timeOptions}&recipeContent=${encodeURIComponent(recipeContent)}`
          });
        } else {
          uni.showToast({ title: response.data.msg || '生成食谱失败', icon: 'none' });
        }
      } catch (err) {
        uni.hideLoading();
        uni.showToast({ title: '网络错误', icon: 'none' });
      }
    },
    openAddModal() {
      this.showAddModal = true;
    }
  }
}
</script>

<style lang="scss" scoped>
.ai-container {
  min-height: 100vh;
  background: $background-color;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-bottom: 140rpx;
}

.ai-top-bar {
  display: flex;
  flex-direction: column;
  padding: $spacing-xl $spacing-lg 0;
  background: $card-background;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  position: sticky;
  top: 0;
  z-index: 100;
}

.ai-title {
  font-size: $font-size-xl;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: $spacing-md;
}

.ai-filters {
  display: flex;
  justify-content: space-between;
  gap: $spacing-sm;
  margin-bottom: $spacing-md;
}

.filter-item {
  flex: 1;
  background: rgba($primary-light, 0.05);
  border-radius: $border-radius-lg;
  overflow: hidden;
  transition: background-color $transition-fast;
  
  &:active {
    background: rgba($primary-light, 0.1);
  }
}

.picker-content {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-sm;
  gap: $spacing-xs;
}

.picker-content text {
  font-size: $font-size-sm;
  color: $primary-color;
  font-weight: 500;
}

.icon {
  font-size: 20rpx;
}

.arrow {
  font-size: 16rpx;
  color: $primary-color;
}

.ai-food-list {
  margin: $spacing-lg 0 0 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.ai-food-card {
  width: 92vw;
  background: $card-background;
  border-radius: $border-radius-xl;
  box-shadow: $shadow-sm;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: $spacing-lg;
  margin-bottom: $spacing-md;
  position: relative;
  transition: all $transition-fast;
  
  &:active {
    transform: scale(0.98);
  }
  
  &.selected {
    background: rgba($primary-light, 0.05);
    border: 2rpx solid $primary-color;
  }
}

.ai-food-img {
  width: 90rpx;
  height: 90rpx;
  background: rgba($primary-light, 0.1);
  border-radius: $border-radius-lg;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: $spacing-md;
}

.food-emoji {
  font-size: $font-size-xxl;
}

.ai-food-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.ai-food-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ai-food-name {
  font-size: $font-size-md;
  font-weight: 500;
  color: $text-primary;
}

.ai-food-weight {
  font-size: $font-size-sm;
  color: $text-secondary;
}

.ai-food-kcal {
  display: flex;
  align-items: center;
  font-size: $font-size-sm;
  color: $primary-color;
  margin: $spacing-xs 0;
}

.kcal {
  margin-left: $spacing-xs;
}

.ai-food-nutrition {
  display: flex;
  align-items: center;
  gap: $spacing-md;
}

.nutrient {
  display: flex;
  align-items: center;
  font-size: $font-size-xs;
  color: $primary-color;
  gap: $spacing-xs;
}

.select-indicator {
  position: absolute;
  right: $spacing-md;
  top: 50%;
  transform: translateY(-50%);
}

.select-icon {
  font-size: 24rpx;
}

.ai-btns {
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin: $spacing-lg 0 0 0;
  padding: 0 $spacing-lg;
  gap: $spacing-lg;
}

.ai-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: $font-size-md;
  font-weight: 500;
  border: none;
  border-radius: $border-radius-lg;
  height: 88rpx;
  margin: 0;
  box-shadow: $shadow-sm;
  transition: transform $transition-fast;
  
  &:active {
    transform: scale(0.98);
  }
}

.btn-icon {
  margin-right: 8rpx;
  font-size: 22rpx;
}

.gradient-main {
  background: linear-gradient(90deg, $primary-color 0%, $primary-light 100%);
  color: #fff;
}

.gradient-sub {
  background: linear-gradient(90deg, rgba($primary-light, 0.1) 0%, rgba($primary-light, 0.2) 100%);
  color: $primary-color;
}
</style> 