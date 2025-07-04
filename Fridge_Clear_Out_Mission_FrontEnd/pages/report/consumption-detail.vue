<template>
  <view class="detail-container">
    <view class="detail-header">
      <button class="back-btn" @tap="goBack">返回</button>
      <text class="detail-title">食物消耗报告详情</text>
    </view>
    <view class="detail-content">
      <view v-if="sections.category" class="section-block">
        <text class="section-title">消耗大类分析</text>
        <view class="section-list">
          <view v-for="(item, idx) in sections.category" :key="idx" class="section-list-item">- {{ item }}</view>
        </view>
      </view>
      <view v-if="sections.supply" class="section-block">
        <text class="section-title">补货建议</text>
        <view class="section-list">
          <view v-for="(item, idx) in sections.supply" :key="idx" class="section-list-item">- {{ item }}</view>
        </view>
      </view>
      <view v-if="sections.habit" class="section-block">
        <text class="section-title">消耗习惯分析</text>
        <text class="section-text">{{ sections.habit }}</text>
      </view>
      <view v-if="sections.blessing" class="section-block tips-block">
        <text class="section-text">{{ sections.blessing }}</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      reportContent: '',
      sections: {
        category: [],
        supply: [],
        habit: '',
        blessing: ''
      }
    }
  },
  onLoad(options) {
    if (options.reportContent) {
      this.reportContent = decodeURIComponent(options.reportContent)
      this.parseReport(this.reportContent)
    }
  },
  methods: {
    goBack() {
      uni.navigateBack();
    },
    parseReport(content) {
      // 1. 消耗大类分析
      const categoryMatch = content.match(/1\. 【消耗大类分析】：([\s\S]*?)(2\.|$)/);
      // 2. 补货建议
      const supplyMatch = content.match(/2\. 【补货建议】：([\s\S]*?)(3\.|$)/);
      // 3. 消耗习惯分析
      const habitMatch = content.match(/3\. 【消耗习惯分析】：([\s\S]*?)(希望|$)/);
      // 结尾祝福
      const blessingMatch = content.match(/(希望[\s\S]*)$/);
      // 按 - 分割
      this.sections.category = categoryMatch ? categoryMatch[1].split(/\n\s*- /).filter(s => s.trim()).map(s => s.replace(/^\s*-\s*/, '').trim()) : [];
      this.sections.supply = supplyMatch ? supplyMatch[1].split(/\n\s*- /).filter(s => s.trim()).map(s => s.replace(/^\s*-\s*/, '').trim()) : [];
      this.sections.habit = habitMatch ? habitMatch[1].trim() : '';
      this.sections.blessing = blessingMatch ? blessingMatch[1].trim() : '';
    }
  }
}
</script>

<style scoped>
.detail-container {
  padding: 40rpx;
  background: #f8f8f8;
  min-height: 100vh;
}
.detail-header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30rpx;
  position: relative;
}
.back-btn {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  font-size: 28rpx;
  background: #f0f0f0;
  color: #4CAF50;
  border-radius: 10rpx;
  padding: 10rpx 20rpx;
}
.detail-title {
  font-size: 40rpx;
  font-weight: bold;
  text-align: center;
}
.detail-content {
  margin-top: 10rpx;
}
.section-block {
  background: #fff;
  border-radius: 18rpx;
  box-shadow: 0 2rpx 8rpx #e0e7ef44;
  margin-bottom: 32rpx;
  padding: 32rpx 24rpx;
}
.tips-block {
  border-left: 8rpx solid #faad14;
}
.section-title {
  font-size: 32rpx;
  color: #4CAF50;
  font-weight: bold;
  margin-bottom: 18rpx;
  display: block;
}
.section-list {
  margin-left: 8rpx;
}
.section-list-item {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 10rpx;
  line-height: 1.7;
}
.section-text {
  font-size: 28rpx;
  color: #333;
  line-height: 1.7;
  display: block;
}
</style>