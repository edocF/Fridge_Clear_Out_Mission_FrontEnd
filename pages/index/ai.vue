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
import Auth from '@/utils/auth.js'

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
      return this.userFoods.length > 0 ? this.userFoods : (getApp().globalData.foodList || []);
    }
  },
  onLoad() {
    // 获取用户冰箱中的食材
    this.fetchUserFoods();
  },
  methods: {
    async fetchUserFoods() {
      this.loading = true;
      try {
        if (!Auth.isLoggedIn()) {
          uni.showToast({
            title: '请先登录',
            icon: 'none'
          });
          return;
        }

        const response = await uni.request({
          url: `${config.baseUrl}/recipe/foods`,
          method: 'GET',
          header: {
            ...Auth.getAuthHeader()
          }
        });

        if (response.statusCode === 200 && response.data.code === 200) {
          // 转换为前端需要的格式
          this.userFoods = response.data.data.map(food => ({
            id: food.id,
            name: food.name,
            emoji: this.getFoodEmoji(food.name),
            kcal: 0,
            carb: 0,
            protein: 0,
            fat: 0,
            price: '0.00',
            expired: food.expired,
            expSoon: food.expSoon,
            expiryDate: '',
            image: ''
          }));
        } else {
          uni.showToast({
            title: response.data.msg || '获取食材失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('获取用户食材失败:', error);
        uni.showToast({
          title: '网络错误',
          icon: 'none'
        });
      } finally {
        this.loading = false;
      }
    },
    getFoodEmoji(foodName) {
      const foodMap = {
        '黄色番茄': '🍅',
        '苹果': '🍎',
        '香蕉': '🍌',
        '鸡蛋': '🥚',
        '牛奶': '🥛',
        '面包': '🍞',
        '米饭': '🍚',
        '面条': '🍜',
        '青菜': '🥬',
        '胡萝卜': '🥕',
        '土豆': '🥔',
        '洋葱': '🧅',
        '大蒜': '🧄',
        '辣椒': '🌶️',
        '黄瓜': '🥒',
        '茄子': '🍆',
        '豆腐': '🧈',
        '猪肉': '🥩',
        '鸡肉': '🍗',
        '鱼肉': '🐟',
        '虾': '🦐',
        '蟹': '🦀'
      };
      return foodMap[foodName] || '🍽️';
    },
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
        // 跳转到食谱生成页面，传递过滤条件
        uni.navigateTo({
          url: `/pages/recipe/generate?foods=${JSON.stringify(this.selectedFoods.map(f => f.name))}&dietType=${this.dietOptions[this.dietIndex].value}&cuisineType=${this.cuisineOptions[this.cuisineIndex].value}&timeLimit=${this.timeOptions[this.timeIndex].value}`
        });
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
      uni.navigateTo({
        url: `/pages/recipe/generate?foods=${JSON.stringify(expiringFoods.map(f => f.name))}&dietType=${this.dietOptions[this.dietIndex].value}&cuisineType=${this.cuisineOptions[this.cuisineIndex].value}&timeLimit=${this.timeOptions[this.timeIndex].value}`
      });
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