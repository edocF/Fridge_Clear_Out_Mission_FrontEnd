<template>
  <view class="recipe-container">
    <!-- 顶部栏 -->
    <view class="recipe-header">
      <view class="back-button" @click="goBack">
        <text class="back-icon">←</text>
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
    <!-- <view v-if="recipes.length" class="recipe-name-bar">
      <text class="recipe-name-value">{{recipes[currentPage].name}}</text>
    </view> -->

    <!-- 加载状态 -->
    <view v-if="loading" class="loading-container">
      <text class="loading-icon">⏳</text>
      <text class="loading-text">AI正在为您生成食谱...</text>
    </view>

    <!-- 详情卡片：标题与标签 -->
    <view class="recipe-detail-card">
      <text class="main-title">{{recipes[currentPage].name}}</text>
      <view class="recipe-tags">
        <text class="recipe-tag" v-for="(tag, tagIdx) in recipes[currentPage].tags" :key="tagIdx">{{tag}}</text>
      </view>
    </view>

    <!-- 详情卡片：食材清单 -->
    <view class="recipe-detail-card">
      <text class="section-title">食材清单</text>
      <view class="ingredient-table">
        <view class="ingredient-row" v-for="(ing, ingIdx) in recipes[currentPage].ingredients" :key="ingIdx">
          <text class="ingredient-name">{{ ing.name }}</text>
          <text class="ingredient-amount">{{ ing.amount ? ing.amount : '\u00A0' }}</text>
        </view>
      </view>
    </view>

    <!-- 详情卡片：烹饪步骤 -->
    <view class="recipe-detail-card">
      <text class="section-title">烹饪步骤</text>
      <view class="step-list">
        <view class="step-item" v-for="(step, stepIdx) in recipes[currentPage].steps" :key="stepIdx">
          <view class="step-number">{{stepIdx + 1}}</view>
          <text class="step-content">{{step}}</text>
        </view>
      </view>
    </view>

    <!-- 详情卡片：营养分析 -->
    <view class="recipe-detail-card" v-if="recipes[currentPage].nutrition.length">
      <text class="section-title">营养分析</text>
      <view class="nutrition-list">
        <view class="nutrition-item" v-for="(nut, nutIdx) in recipes[currentPage].nutrition" :key="nutIdx">{{nut}}</view>
      </view>
    </view>

    <!-- 详情卡片：小贴士 -->
    <view class="recipe-detail-card" v-if="recipes[currentPage].tips.length">
      <text class="section-title">小贴士</text>
      <view class="tips-list">
        <view class="tips-item" v-for="(tip, tipIdx) in recipes[currentPage].tips" :key="tipIdx">{{tip}}</view>
      </view>
    </view>

    <!-- 恢复：食谱列表（分页）和重新生成按钮 -->
    <view v-if="recipes.length" class="recipe-list">
      <view class="recipe-footer">
        <button class="save-btn" @click="handleRegenerate">
          <view class="save-btn-content">
            <text class="refresh-icon">🔄</text>
            <text class="save-btn-text">重新生成</text>
          </view>
        </button>
      </view>
      <view class="pagination-bar" v-if="recipes.length > 1">
        <button class="page-btn prev-btn" :disabled="currentPage === 0" @click="prevPage">
          <text class="page-icon">◀</text>
          <text class="page-text">上一页</text>
        </button>
        <view class="page-indicator-container">
          <text class="page-indicator">{{currentPage + 1}} / {{recipes.length}}</text>
        </view>
        <button class="page-btn next-btn" :disabled="currentPage === recipes.length - 1" @click="nextPage">
          <text class="page-text">下一页</text>
          <text class="page-icon">▶</text>
        </button>
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
  onBackPress(e) {
    this.goBack();
    return true; // 阻止默认返回
  },
  methods: {
    goBack() {
      if (getCurrentPages().length > 1) {
        uni.navigateBack();
      } else {
        uni.reLaunch({
          url: '/pages/index/index'
        });
      }
    },
    async handleRegenerate() {
      if (this.loading) return;
      
      this.loading = true;
      this.error = '';
      
      try {
        await this.generateRecipesFromAPI();
      } catch (err) {
        console.error('重新生成食谱失败:', err);
        this.error = '重新生成失败，请重试';
      } finally {
        this.loading = false;
      }
    },
    async generateRecipesFromAPI() {
      const token = uni.getStorageSync('token');
      if (!token) {
        uni.showToast({ title: '请先登录', icon: 'none' });
        return;
      }
      
      // 准备食材数据
      const foods = this.selectedFoods.map(f => ({
        name: f.name,
        emoji: f.emoji || ''
      }));
      
      // 准备食谱选项
      const recipeOption = {
        dietOptions: this.dietType,
        cuisineOptions: this.cuisineType,
        timeOptions: this.timeLimit
      };
      
      uni.showLoading({ title: 'AI正在重新生成食谱...' });
      
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
        
        if (response.data.code === 1) {
          // 更新食谱内容
          let recipeContent = response.data.data;
          if (typeof recipeContent === 'object' && recipeContent !== null && 'code' in recipeContent) {
            recipeContent = recipeContent.data;
          }
          
          this.recipeContent = recipeContent;
          this.recipes = this.parseRecipes(this.recipeContent);
          this.currentPage = 0;
          
          if (!this.recipes.length) {
            this.error = '未找到合适的食谱，请尝试其他食材';
          } else {
            uni.showToast({ title: '食谱重新生成成功', icon: 'success' });
          }
        } else {
          uni.showToast({ title: response.data.msg || '重新生成食谱失败', icon: 'none' });
          this.error = response.data.msg || '重新生成失败';
        }
      } catch (err) {
        uni.hideLoading();
        console.error('重新生成食谱请求失败:', err);
        uni.showToast({ title: '网络错误', icon: 'none' });
        this.error = '网络错误，请检查网络连接';
      }
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
            const line = s.replace(/^\s*-\s*/, '').trim();
            // 先按逗号分割
            let [left, method] = line.split('，');
            method = method ? method.trim() : '';
            let name = left, amount = '';
            // 优先匹配"冒号/空格/破折号+任意非空内容"结尾
            const match = left.match(/(.+?)[：:：\-\s]+(.+)$/);
            if (match) {
              name = match[1].trim();
              amount = match[2].trim();
            } else {
              // 检查"适量""少许""若干""适当""适中"结尾
              const approxMatch = left.match(/(.+?)(适量|少许|若干|适当|适中)$/);
              if (approxMatch) {
                name = approxMatch[1].trim();
                amount = approxMatch[2].trim();
              }
            }
            name = name.replace(/[：:：\s]+$/, ''); // 去除结尾冒号、空格
            return { name, amount, method };
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
        // 添加页面切换动画效果
        uni.showToast({ 
          title: `第${this.currentPage + 1}个食谱`, 
          icon: 'none',
          duration: 1000
        });
      }
    },
    prevPage() {
      if (this.currentPage > 0) {
        this.currentPage--;
        // 添加页面切换动画效果
        uni.showToast({ 
          title: `第${this.currentPage + 1}个食谱`, 
          icon: 'none',
          duration: 1000
        });
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
  justify-content: center;
  padding: 48rpx 32rpx 32rpx 32rpx;
  background: #fff;
  border-bottom: 2rpx solid #e0ffe6;
  position: relative;
}

.back-button {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fdf9;
  border: 2rpx solid #e0ffe6;
  border-radius: 16rpx;
  padding: 12rpx 20rpx;
  position: absolute;
  left: 32rpx;
  gap: 8rpx;
  min-width: 120rpx;
  transition: all 0.3s ease;
}

.back-button:active {
  background: #f0f9f2;
  transform: scale(0.95);
}

.back-icon {
  font-size: 28rpx;
  color: #7bc47f;
  font-weight: 500;
}

.back-text {
  font-size: 26rpx;
  color: #7bc47f;
  font-weight: 500;
}

.recipe-title {
  font-size: 44rpx;
  font-weight: bold;
  color: #2e7d4b;
  text-align: center;
  background: linear-gradient(135deg, #2e7d4b 0%, #7bc47f 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 2rpx 4rpx rgba(46, 125, 75, 0.1);
}

.selected-foods {
  background: #fff;
  padding: 32rpx;
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 28rpx;
  color: #25643b;
  font-weight: bold;
  border-left: 8rpx solid #25643b;
  padding-left: 16rpx;
  margin-bottom: 24rpx;
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
  font-size: 28rpx;
}

.food-name {
  font-size: 24rpx;
  color: #2e7d4b;
  font-weight: 500;
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
  font-size: 36rpx;
  color: #2e7d4b;
}

.loading-text {
  margin-top: 24rpx;
  font-size: 26rpx;
  color: #2e7d4b;
  font-weight: 500;
}

.recipe-list {
  background: #fff;
  margin: 24rpx 32rpx;
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 24rpx #d0e7d2;
}

.recipe-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 24rpx;
}

.save-btn {
  background: linear-gradient(135deg, #7bc47f 0%, #6bb36f 100%);
  color: #fff;
  font-size: 26rpx;
  padding: 0;
  border-radius: 32rpx;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 64rpx;
  min-width: 200rpx;
  box-shadow: 0 4rpx 12rpx rgba(123, 196, 127, 0.3);
  transition: all 0.3s ease;
  
  &:active {
    transform: scale(0.95);
    box-shadow: 0 2rpx 8rpx rgba(123, 196, 127, 0.4);
  }
}
.save-btn-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
}

.refresh-icon {
  font-size: 22rpx;
  color: #fff;
}
.save-btn-text {
  font-size: 26rpx;
  color: #fff;
  margin-left: 2rpx;
  font-weight: 500;
}

.pagination-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 24rpx;
  margin: 32rpx 0 0 0;
  padding: 24rpx;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 24rpx;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.page-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  background: linear-gradient(135deg, #7bc47f 0%, #6bb36f 100%);
  color: #fff;
  font-size: 24rpx;
  padding: 16rpx 24rpx;
  border-radius: 32rpx;
  border: none;
  box-shadow: 0 4rpx 12rpx rgba(123, 196, 127, 0.3);
  transition: all 0.3s ease;
  min-width: 140rpx;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s ease;
  }
  
  &:active {
    transform: scale(0.95);
    box-shadow: 0 2rpx 8rpx rgba(123, 196, 127, 0.4);
    
    &::before {
      left: 100%;
    }
  }
}

.page-btn:disabled {
  background: linear-gradient(135deg, #e0e0e0 0%, #d0d0d0 100%);
  color: #bdbdbd;
  box-shadow: none;
  
  &:active {
    transform: none;
  }
}

.page-icon {
  font-size: 18rpx;
  font-weight: bold;
}

.page-text {
  font-size: 24rpx;
  font-weight: 500;
}

.page-indicator-container {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(123, 196, 127, 0.15) 0%, rgba(123, 196, 127, 0.05) 100%);
  padding: 16rpx 32rpx;
  border-radius: 24rpx;
  border: 2rpx solid rgba(123, 196, 127, 0.3);
  box-shadow: 0 2rpx 8rpx rgba(123, 196, 127, 0.1);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2rpx;
    background: linear-gradient(90deg, transparent, #7bc47f, transparent);
  }
}

.page-indicator {
  font-size: 26rpx;
  color: #2e7d4b;
  font-weight: bold;
  text-shadow: 0 1rpx 2rpx rgba(46, 125, 75, 0.1);
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
  font-size: 36rpx;
  color: #ff6b6b;
}

.error-text {
  margin: 24rpx 0;
  font-size: 26rpx;
  color: #ff6b6b;
  text-align: center;
  font-weight: 500;
}

.retry-btn {
  background: #4caf50;
  color: #fff;
  font-size: 26rpx;
  padding: 16rpx 48rpx;
  border-radius: 32rpx;
  border: none;
  font-weight: 500;
}

.recipe-detail-card {
  background: #fff;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 24rpx #d0e7d2;
  margin: 24rpx 0;
  padding: 32rpx;
}
.main-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #2e7d4b;
  text-align: center;
  margin-bottom: 16rpx;
  border-bottom: 2rpx solid #e0ffe6;
  padding-bottom: 12rpx;
}
.recipe-tags {
  display: flex;
  gap: 16rpx;
  justify-content: center;
  margin-bottom: 8rpx;
  flex-wrap: wrap;
  margin-top: 24rpx;
}
.recipe-tag {
  background: #e0ffe6;
  color: #2e7d4b;
  border-radius: 32rpx;
  padding: 10rpx 24rpx;
  font-size: 24rpx;
  font-weight: 500;
}
.section-title {
  font-size: 28rpx;
  color: #25643b;
  font-weight: bold;
  border-left: 8rpx solid #25643b;
  padding-left: 16rpx;
  margin-bottom: 24rpx;
}
.nutrition-list, .tips-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}
.nutrition-item, .tips-item {
  background: #f6fff8;
  border-radius: 16rpx;
  padding: 16rpx 20rpx;
  font-size: 24rpx;
  color: #2e7d4b;
  font-weight: 500;
}
.ingredient-table {
  width: 100%;
  display: flex;
  flex-direction: column;
}
.ingredient-row {
  display: flex;
  align-items: center;
  background: #e0ffe6;
  border-radius: 16rpx;
  margin-bottom: 0;
  min-height: 48rpx;
  font-size: 24rpx;
  color: #2e7d4b;
  padding: 0 20rpx;
}
.ingredient-name {
  flex: 1;
  text-align: left;
  font-weight: 500;
  min-width: 80rpx;
}
.ingredient-amount {
  min-width: 80rpx;
  max-width: 60%;
  text-align: right;
  font-weight: 500;
  white-space: nowrap;
}
.step-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}
.step-item {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
  background: #f6fff8;
  border-radius: 16rpx;
  padding: 16rpx 20rpx;
}
.step-number {
  width: 40rpx;
  height: 40rpx;
  background: #7bc47f;
  color: #fff;
  border-radius: 50%;
  text-align: center;
  line-height: 40rpx;
  font-weight: bold;
  margin-right: 8rpx;
  font-size: 24rpx;
}
.step-content {
  font-size: 24rpx;
  color: #333;
  word-break: break-all;
  font-weight: 500;
}
</style> 