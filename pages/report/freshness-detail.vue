<template>
  <view class="detail-container">
    <view class="detail-header">
      <button class="back-btn" @tap="goBack">返回</button>
      <text class="detail-title">保鲜报告详情</text>
    </view>
    <view class="detail-content">
      <view v-if="sections.summary" class="section-block summary-block">
        <text class="section-title">总体评价</text>
        <text class="section-text">{{ sections.summary }}</text>
      </view>
      <view v-if="sections.good" class="section-block">
        <text class="section-title">做得好的地方</text>
        <view class="section-list">
          <view v-for="(item, idx) in sections.good" :key="idx" class="section-list-item">- {{ item }}</view>
        </view>
      </view>
      <view v-if="sections.improve" class="section-block">
        <text class="section-title">可以改进的地方</text>
        <view class="section-list">
          <view v-for="(item, idx) in sections.improve" :key="idx" class="section-list-item">- {{ item }}</view>
        </view>
      </view>
      <view v-if="sections.tips" class="section-block tips-block">
        <text class="section-title">本周饮食小贴士</text>
        <text class="section-text">{{ sections.tips }}</text>
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
        summary: '',
        good: [],
        improve: [],
        tips: ''
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
      uni.navigateBack(); // 返回上一页
    },
    parseReport(content) {
      // 简单正则分段解析
      const summaryMatch = content.match(/1\. 总体评价：([\s\S]*?)(2\.|$)/);
      const goodMatch = content.match(/2\. 【做得好的地方】：([\s\S]*?)(3\.|$)/);
      const improveMatch = content.match(/3\. 【可以改进的地方】：([\s\S]*?)(4\.|$)/);
      const tipsMatch = content.match(/4\. 【本周饮食小贴士】：([\s\S]*)/);
      this.sections.summary = summaryMatch ? summaryMatch[1].trim() : '';
      // 做得好的地方和可以改进的地方按 - 分割
      this.sections.good = goodMatch ? goodMatch[1].split(/\n\s*- /).filter(s => s.trim()).map(s => s.replace(/^\s*-\s*/, '').trim()) : [];
      this.sections.improve = improveMatch ? improveMatch[1].split(/\n\s*- /).filter(s => s.trim()).map(s => s.replace(/^\s*-\s*/, '').trim()) : [];
      this.sections.tips = tipsMatch ? tipsMatch[1].trim() : '';
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
.summary-block {
  border-left: 8rpx solid #4CAF50;
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