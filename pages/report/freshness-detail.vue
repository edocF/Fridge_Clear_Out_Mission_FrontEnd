<template>
  <view class="detail-container">
    <view class="detail-header">
      <!-- 标题已移除 -->
    </view>
    <view class="detail-content">
      <view v-if="sections.summary" class="section-block summary-block" data-note="总体评价">
        <text class="section-text">{{ sections.summary }}</text>
      </view>
      <view v-if="sections.good" class="section-block" data-note="做得好的地方">
        <view class="section-list">
          <view v-for="(item, idx) in sections.good" :key="idx" class="section-list-item">- {{ item }}</view>
        </view>
      </view>
      <view v-if="sections.improve" class="section-block" data-note="可以改进的地方">
        <view class="section-list">
          <view v-for="(item, idx) in sections.improve" :key="idx" class="section-list-item">- {{ item }}</view>
        </view>
      </view>
      <view v-if="sections.tips" class="section-block tips-block" data-note="本周饮食小贴士">
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
      uni.reLaunch({ url: '/pages/index/report' });
    },
    parseReport(content) {
      // 简单正则分段解析
      const summaryMatch = content.match(/1\. 总体评价：([\s\S]*?)(2\.|$)/);
      const goodMatch = content.match(/2\. 【做得好的地方】：([\s\S]*?)(3\.|$)/);
      const improveMatch = content.match(/3\. 【可以改进的地方】：([\s\S]*?)(4\.|$)/);
      const tipsMatch = content.match(/4\. 【本周饮食小贴士】：([\s\S]*)/);
      
      // 做得好的地方和可以改进的地方按 - 分割
      this.sections.summary = summaryMatch ? summaryMatch[1].trim() : '';
      let goodArr = goodMatch ? goodMatch[1].split(/\n\s*(?:- |\d+\.\s*)/).filter(s => s.trim()).map(s => s.replace(/^\s*-\s*/, '').trim()) : [];
      if (goodArr.length && (goodArr[0] === ':' || goodArr[0] === '- :' || goodArr[0] === '')) {
        goodArr.shift();
      }
      this.sections.good = goodArr;
      let improveArr = improveMatch ? improveMatch[1].split(/\n\s*(?:- |\d+\.\s*)/).filter(s => s.trim()).map(s => s.replace(/^\s*-\s*/, '').trim()) : [];
      if (improveArr.length && (improveArr[0] === ':' || improveArr[0] === '- :' || improveArr[0] === '')) {
        improveArr.shift();
      }
      this.sections.improve = improveArr;
      this.sections.tips = tipsMatch ? tipsMatch[1].trim() : '';
      console.log('good:', this.sections.good);
      console.log('improve:', this.sections.improve);
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
  background: #fffbe6;
  border-radius: 18rpx 32rpx 18rpx 32rpx;
  box-shadow: 0 4rpx 24rpx #ffe58f88;
  margin-bottom: 32rpx;
  padding: 48rpx 24rpx 32rpx 40rpx;
  border: 2rpx dashed #ffd666;
  position: relative;
  overflow: visible;
}
.section-block::before {
  content: attr(data-note);
  position: absolute;
  left: 16rpx;
  top: -18rpx;
  background: #ffd666;
  color: #fff;
  font-size: 20rpx;
  padding: 4rpx 16rpx;
  border-radius: 16rpx 16rpx 16rpx 0;
  letter-spacing: 2rpx;
  font-weight: bold;
  box-shadow: 0 2rpx 8rpx #ffd66644;
  border-bottom: 2rpx solid #e0e0e0;
  width: max-content;
}

.tips-block {
  border-left: 8rpx solid #faad14;
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