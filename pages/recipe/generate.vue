<template>
  <view class="recipe-container">
    <!-- 顶部栏 -->
    <view class="recipe-header">
      <view class="back-button" @click="goBack">
        <uni-icons type="back" size="28" color="#2e7d4b" />
        <text class="back-text">返回</text>
      </view>
      <text class="recipe-title">AI 食谱生成</text>
    </view>

    <!-- 已选食材 -->
    <view class="selected-foods">
      <text class="section-title">已选食材</text>
      <view class="food-tags">
        <view class="food-tag" v-for="(food, idx) in selectedFoods" :key="idx">
          <text class="food-emoji" v-if="food.emoji">{{food.emoji}}</text>
          <text class="food-name">{{food.name}}</text>
        </view>
      </view>
    </view>

    <!-- 新增：食谱名称专栏 -->
    <view v-if="recipes.length" class="recipe-name-bar">
      <text class="recipe-name-label">食谱名称：</text>
      <text class="recipe-name-value">{{recipes[currentPage].name}}</text>
    </view>

    <!-- 加载状态 -->
    <view v-if="loading" class="loading-container">
      <text class="loading-icon">⏳</text>
      <text class="loading-text">AI正在为您生成食谱...</text>
    </view>

    <!-- 食谱列表（分页） -->
    <view v-else-if="recipes.length" class="recipe-list">
      <view class="recipe-card">
        <!-- 移除原有食谱名称展示，已在上方专栏展示 -->
        <view class="recipe-header">
          <view class="recipe-tags">
            <text class="recipe-tag" v-for="(tag, tagIdx) in recipes[currentPage].tags" :key="tagIdx">{{tag}}</text>
          </view>
        </view>
        <view class="recipe-content">
          <view class="recipe-ingredients">
            <text class="section-title">食材清单</text>
            <view class="ingredient-list">
              <view class="ingredient-item" v-for="(ing, ingIdx) in recipes[currentPage].ingredients" :key="ingIdx">
                <text class="ingredient-name">{{ing.name}}</text>
                <text class="ingredient-amount">{{ing.amount}}</text>
              </view>
            </view>
          </view>
          <view class="recipe-steps">
            <text class="section-title">烹饪步骤</text>
            <view class="step-list">
              <view class="step-item" v-for="(step, stepIdx) in recipes[currentPage].steps" :key="stepIdx">
                <text class="step-number">{{stepIdx + 1}}</text>
                <text class="step-content">{{step}}</text>
              </view>
            </view>
          </view>
          <view v-if="recipes[currentPage].nutrition.length" class="recipe-nutrition">
            <text class="section-title">营养分析</text>
            <view class="nutrition-list">
              <view class="nutrition-item" v-for="(nut, nutIdx) in recipes[currentPage].nutrition" :key="nutIdx">{{nut}}</view>
            </view>
          </view>
          <view v-if="recipes[currentPage].tips.length" class="recipe-tips">
            <text class="section-title">小贴士</text>
            <view class="tips-list">
              <view class="tips-item" v-for="(tip, tipIdx) in recipes[currentPage].tips" :key="tipIdx">{{tip}}</view>
            </view>
          </view>
        </view>
        <view class="recipe-footer">
          <button class="save-btn" @click="handleRegenerate">
            <view class="save-btn-content">
              <uni-icons type="refresh" size="22" color="#fff" />
              <text class="save-btn-text">重新生成</text>
            </view>
          </button>
        </view>
      </view>
      <view class="pagination-bar" v-if="recipes.length > 1">
        <button class="page-btn" :disabled="currentPage === 0" @click="prevPage">上一页</button>
        <text class="page-indicator">{{currentPage + 1}} / {{recipes.length}}</text>
        <button class="page-btn" :disabled="currentPage === recipes.length - 1" @click="nextPage">下一页</button>
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

export default {
  data() {
    return {
      selectedFoods: [],
      recipeContent: '',
      recipes: [],
      loading: false,
      error: '',
      dietType: '均衡',
      cuisineType: '中式',
      timeLimit: '不限时间',
      currentPage: 0
    }
  },
  onLoad(options) {
    if (options.foods) {
      // foods为[{name, emoji}]或[{name}]数组
      let foods = JSON.parse(options.foods);
      // 兼容无emoji的情况
      this.selectedFoods = foods.map(f => ({ name: f.name, emoji: f.emoji || '' }));
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
    if (options.recipeContent) {
      this.recipeContent = decodeURIComponent(options.recipeContent);
      this.recipes = this.parseRecipes(this.recipeContent);
      if (!this.recipes.length) {
        this.error = '未找到合适的食谱，请尝试其他食材';
      }
    }
  },
  methods: {
    goBack() {
      uni.navigateBack();
    },
    handleRegenerate() {
      if (this.loading) return;
      this.loading = true;
      setTimeout(() => {
        this.generateRecipes();
        this.loading = false;
      }, 600); // 模拟loading动画
    },
    generateRecipes() {
      // 重新解析本地 recipeContent
      this.error = '';
      this.recipes = this.parseRecipes(this.recipeContent);
      this.currentPage = 0;
      if (!this.recipes.length) {
        this.error = '未找到合适的食谱，请尝试其他食材';
      }
    },
    parseRecipes(content) {
      // 按 --- 分割每个食谱
      const recipeBlocks = content.split(/\n---+\n/).map(s => s.trim()).filter(Boolean);
      const recipes = recipeBlocks.map(block => {
        // 标题
        const nameMatch = block.match(/###\s*([^\n]+)/);
        const name = nameMatch ? nameMatch[1].replace(/：$/, '').trim() : 'AI食谱';
        // 标签
        const tags = [];
        const scene = block.match(/【适用场景】：([^\n]+)/);
        if (scene) tags.push(scene[1].trim());
        const cuisine = block.match(/【菜系风格】：([^\n]+)/);
        if (cuisine) tags.push(cuisine[1].trim());
        const time = block.match(/【烹饪时长】：([^\n]+)/);
        if (time) tags.push(time[1].trim());
        // 食材
        const ingredientsBlock = block.match(/【食材清单】：([\s\S]*?)(【|$)/);
        let ingredients = [];
        if (ingredientsBlock) {
          ingredients = ingredientsBlock[1].split(/\n- /).filter(s => s.trim()).map(s => {
            const arr = s.replace(/^\s*-\s*/, '').split('：');
            return { name: arr[0], amount: arr[1] || '' };
          });
        }
        // 步骤
        const stepsBlock = block.match(/【烹饪步骤】：([\s\S]*?)(【|$)/);
        let steps = [];
        if (stepsBlock) {
          steps = stepsBlock[1].split(/\n\d+\. /).filter(s => s.trim()).map(s => s.replace(/^\d+\.\s*/, '').trim()).filter(s => s);
        }
        // 营养分析
        const nutritionBlock = block.match(/【营养分析】：([\s\S]*?)(【|$)/);
        let nutrition = [];
        if (nutritionBlock) {
          nutrition = nutritionBlock[1].split(/\n- /).filter(s => s.trim()).map(s => s.replace(/^\s*-\s*/, '').trim());
        }
        // 小贴士
        const tipsBlock = block.match(/【小贴士】：([\s\S]*)/);
        let tips = [];
        if (tipsBlock) {
          tips = tipsBlock[1].split(/\n\d+\. /).filter(s => s.trim()).map(s => s.replace(/^\d+\.\s*/, '').trim()).filter(s => s);
        }
        return { name, tags, ingredients, steps, nutrition, tips };
      });
      return recipes;
    },
    nextPage() {
      if (this.currentPage < this.recipes.length - 1) {
        this.currentPage++;
      }
    },
    prevPage() {
      if (this.currentPage > 0) {
        this.currentPage--;
      }
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
  width: auto;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-right: 24rpx;
  gap: 8rpx;
}
.back-text {
  font-size: 28rpx;
  color: #2e7d4b;
  margin-left: 4rpx;
}

.recipe-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #2e7d4b;
}

.recipe-name-bar {
  display: flex;
  align-items: center;
  background: #fff;
  padding: 24rpx 32rpx 0 32rpx;
  margin-bottom: 0;
  gap: 12rpx;
}
.recipe-name-label {
  font-size: 28rpx;
  color: #7bc47f;
  font-weight: bold;
}
.recipe-name-value {
  font-size: 32rpx;
  color: #2e7d4b;
  font-weight: bold;
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

.recipe-list {
  background: #fff;
  margin: 24rpx 32rpx;
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 24rpx #d0e7d2;
}

.recipe-card {
  background: #fff;
  padding: 40rpx 36rpx;
  margin-bottom: 24rpx;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 24rpx #d0e7d2;
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}

.recipe-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.recipe-name {
  font-size: 36rpx;
  font-weight: bold;
  color: #2e7d4b;
  letter-spacing: 2rpx;
}

.recipe-tags {
  display: flex;
  gap: 16rpx;
}

.recipe-tag {
  background: #e0ffe6;
  padding: 10rpx 24rpx;
  border-radius: 32rpx;
  font-size: 26rpx;
  color: #2e7d4b;
}

.recipe-content {
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}

.recipe-ingredients, .recipe-steps, .recipe-nutrition, .recipe-tips {
  margin-bottom: 16rpx;
}

.ingredient-list, .step-list, .nutrition-list, .tips-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.ingredient-item, .nutrition-item, .tips-item {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  background: #e0ffe6;
  padding: 12rpx 20rpx;
  border-radius: 16rpx;
  font-size: 26rpx;
  color: #2e7d4b;
  margin-bottom: 0;
}

.ingredient-name, .ingredient-amount {
  font-size: 26rpx;
  margin-right: 16rpx;
}

.step-item {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
  line-height: 1.8;
}

.step-number {
  font-size: 28rpx;
  color: #7bc47f;
  margin-right: 8rpx;
  font-weight: bold;
}

.step-content {
  font-size: 26rpx;
  color: #333;
  word-break: break-all;
}

.recipe-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 24rpx;
}

.save-btn {
  background: #4caf50;
  color: #fff;
  font-size: 28rpx;
  padding: 0;
  border-radius: 32rpx;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 56rpx;
  min-width: 180rpx;
}
.save-btn-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
}
.save-btn-text {
  font-size: 28rpx;
  color: #fff;
  margin-left: 2rpx;
}

.pagination-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 32rpx;
  margin: 32rpx 0 0 0;
}

.page-btn {
  background: #e0ffe6;
  color: #2e7d4b;
  font-size: 28rpx;
  padding: 12rpx 32rpx;
  border-radius: 32rpx;
  border: none;
}

.page-btn:disabled {
  background: #f0f0f0;
  color: #bdbdbd;
}

.page-indicator {
  font-size: 28rpx;
  color: #2e7d4b;
  font-weight: bold;
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