<template>
  <view class="daily-recipe-card">
    <view class="header">
      <text class="emoji">👨‍⚕️</text>
      <text class="title">每日推荐食谱</text>
      <text class="ai-label">由AI营养师推荐</text>
    </view>
    <view class="recipe-name">
      <text class="dish-emoji">{{ computedEmoji }}</text>
      <text class="dish-name">{{ recipe.name }}</text>
    </view>
    <view class="reason">
      <text class="reason-label">推荐理由：</text>
      <text class="reason-text">{{ computedReason }}</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'DailyRecipeCard',
  props: {
    recipe: {
      type: Object,
      required: true
      // 结构示例：{ name: '牛油果牛肉沙拉', tags: ['均衡', '高蛋白'] }
    }
  },
  computed: {
    computedEmoji() {
      // 根据菜名或标签自动选择emoji
      const name = this.recipe.name || '';
      const tags = this.recipe.tags ? this.recipe.tags.join('') : '';
      if (/牛油果|沙拉|蔬菜|素|菜|生菜|水果/.test(name + tags)) return '🥗';
      if (/牛肉|鸡肉|鸭肉|肉|蛋白/.test(name + tags)) return '🍖';
      if (/汤|粥|羹/.test(name + tags)) return '🍲';
      if (/饭|米|主食|面|粥/.test(name + tags)) return '🍚';
      if (/鱼|虾|海鲜/.test(name + tags)) return '🐟';
      if (/甜品|蛋糕|糖/.test(name + tags)) return '🍰';
      return '🍽️';
    },
    computedReason() {
      // 根据标签或菜名自动生成推荐理由
      const tags = this.recipe.tags || [];
      if (tags.includes('高蛋白')) return '高蛋白，助力肌肉修复和增强体力';
      if (tags.includes('低脂')) return '低脂肪，适合控制体重';
      if (tags.includes('均衡')) return '营养均衡，满足日常所需';
      if (tags.includes('高纤维')) return '高纤维，有助于肠道健康';
      if (tags.includes('补铁')) return '富含铁元素，适合补血';
      // 默认理由
      return '营养丰富，适合今日推荐';
    }
  }
}
</script>

<style scoped>
.daily-recipe-card {
  background: linear-gradient(135deg, #e0ffe6 0%, #f6fff8 100%);
  border-radius: 24rpx;
  box-shadow: 0 4rpx 16rpx #d0e7d2;
  padding: 28rpx 20rpx 20rpx 20rpx;
  margin: 40rpx 0 32rpx 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  max-width: 90vw;
  min-width: 320rpx;
}
.header {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 16rpx;
}
.emoji {
  font-size: 40rpx;
}
.title {
  font-size: 32rpx;
  font-weight: bold;
  color: #25643b;
}
.ai-label {
  font-size: 22rpx;
  color: #7bc47f;
  background: #fff;
  border-radius: 16rpx;
  padding: 4rpx 16rpx;
  margin-left: 12rpx;
}
.recipe-name {
  display: flex;
  align-items: center;
  font-size: 28rpx;
  font-weight: bold;
  color: #2e7d4b;
  margin-bottom: 12rpx;
}
.dish-emoji {
  font-size: 32rpx;
  margin-right: 8rpx;
}
.reason {
  font-size: 24rpx;
  color: #25643b;
  background: #eafaf1;
  border-radius: 12rpx;
  padding: 12rpx 16rpx;
  margin-top: 8rpx;
  width: 100%;
}
.reason-label {
  font-weight: bold;
  margin-right: 4rpx;
}
.reason-text {
  color: #4caf50;
}
</style> 