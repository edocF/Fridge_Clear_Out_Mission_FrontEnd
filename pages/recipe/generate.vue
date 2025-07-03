<template>
  <view class="recipe-container">
    <!-- 顶部栏 -->
    <view class="recipe-header">
      <view class="back-button" @click="goBack">
        <uni-icons type="back" size="24" color="#2e7d4b" />
      </view>
      <text class="recipe-title">AI 食谱生成</text>
    </view>

    <!-- 已选食材 -->
    <view class="selected-foods">
      <text class="section-title">已选食材</text>
      <view class="food-tags">
        <view class="food-tag" v-for="(food, idx) in selectedFoods" :key="idx">
          <text class="food-emoji">{{getFoodEmoji(food.name)}}</text>
          <text class="food-name">{{food.name}}</text>
        </view>
      </view>
    </view>

    <!-- 加载状态 -->
    <view v-if="loading" class="loading-container">
      <text class="loading-icon">⏳</text>
      <text class="loading-text">AI正在为您生成食谱...</text>
    </view>

    <!-- 食谱内容 -->
    <view v-else-if="recipeContent" class="recipe-content-container">
      <view class="recipe-text">
        <text>{{recipeContent}}</text>
      </view>
    </view>

    <!-- 错误提示 -->
    <view v-if="error" class="error-container">
      <text class="error-icon">⚠️</text>
      <text class="error-text">{{error}}</text>
      <button class="retry-btn" @click="generateRecipes">重试</button>
    </view>
  </view>
</template>

<script>
import config from '@/config/index.js'
import Auth from '@/utils/auth.js'

export default {
  data() {
    return {
      selectedFoods: [],
      recipeContent: '',
      loading: false,
      error: '',
      dietType: '均衡',
      cuisineType: '中式',
      timeLimit: '不限时间'
    }
  },
  onLoad(options) {
    if (options.foods) {
      // 解析食材数据，转换为FoodInfoForRecipe格式
      const foodNames = JSON.parse(options.foods);
      this.selectedFoods = foodNames.map(name => ({
        id: null,
        name: name,
        expired: false,
        expSoon: false,
        fridgeId: null
      }));
    }
    if (options.dietType) {
      this.dietType = options.dietType;
    }
    if (options.cuisineType) {
      this.cuisineType = options.cuisineType;
    }
    if (options.timeLimit) {
      this.timeLimit = options.timeLimit;
    }
    
    // 自动生成食谱
    this.generateRecipes();
  },
  methods: {
    goBack() {
      uni.navigateBack();
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
    async generateRecipes() {
      if (this.selectedFoods.length === 0) {
        this.error = '请先选择食材';
        return;
      }

      this.loading = true;
      this.error = '';
      this.recipeContent = '';

      try {
        // 检查登录状态
        if (!Auth.isLoggedIn()) {
          this.error = '请先登录';
          return;
        }

        const response = await uni.request({
          url: `${config.baseUrl}/recipe`,
          method: 'POST',
          header: {
            'Content-Type': 'application/json',
            ...Auth.getAuthHeader()
          },
          data: {
            recipeOption: {
              dietOptions: this.dietType,
              cuisineOptions: this.cuisineType,
              timeOptions: this.timeLimit
            },
            foodInfoForRecipes: this.selectedFoods
          }
        });

        if (response.statusCode === 200 && response.data.code === 200) {
          this.recipeContent = response.data.data || '';
          if (!this.recipeContent) {
            this.error = '未找到合适的食谱，请尝试其他食材';
          }
        } else {
          this.error = response.data.msg || '生成食谱失败';
        }
      } catch (err) {
        console.error('生成食谱失败:', err);
        this.error = '网络错误，请检查网络连接';
      } finally {
        this.loading = false;
      }
    },
    saveRecipe(recipe) {
      // 这里可以添加收藏食谱的逻辑
      uni.showToast({
        title: '收藏成功',
        icon: 'success'
      });
    }
  }
}
</script>

<style scoped>
.recipe-container {
  min-height: 100vh;
  background: #eafaf1;
  padding-bottom: 32rpx;
}

.recipe-header {
  display: flex;
  align-items: center;
  padding: 48rpx 32rpx 32rpx 32rpx;
  background: #fff;
  border-bottom: 2rpx solid #e0ffe6;
}

.back-button {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
}

.recipe-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #2e7d4b;
}

.selected-foods {
  background: #fff;
  padding: 32rpx;
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 28rpx;
  color: #7bc47f;
  margin-bottom: 16rpx;
}

.food-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.food-tag {
  display: flex;
  align-items: center;
  background: #e0ffe6;
  padding: 12rpx 24rpx;
  border-radius: 32rpx;
  gap: 8rpx;
}

.food-emoji {
  font-size: 32rpx;
}

.food-name {
  font-size: 26rpx;
  color: #2e7d4b;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 32rpx;
  background: #fff;
  margin: 24rpx 32rpx;
  border-radius: 24rpx;
}

.loading-icon {
  font-size: 40rpx;
  color: #2e7d4b;
}

.loading-text {
  margin-top: 24rpx;
  font-size: 28rpx;
  color: #2e7d4b;
}

.recipe-content-container {
  background: #fff;
  margin: 24rpx 32rpx;
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 24rpx #d0e7d2;
}

.recipe-text {
  font-size: 28rpx;
  color: #333;
  line-height: 1.8;
  white-space: pre-wrap;
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 32rpx;
  background: #fff;
  margin: 24rpx 32rpx;
  border-radius: 24rpx;
}

.error-icon {
  font-size: 40rpx;
  color: #ff6b6b;
}

.error-text {
  margin: 24rpx 0;
  font-size: 28rpx;
  color: #ff6b6b;
  text-align: center;
}

.retry-btn {
  background: #4caf50;
  color: #fff;
  font-size: 28rpx;
  padding: 16rpx 48rpx;
  border-radius: 32rpx;
  border: none;
}
</style> 