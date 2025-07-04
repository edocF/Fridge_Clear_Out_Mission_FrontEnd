<template>
  <view class="detail-container">
    <view class="detail-header">
      <!-- 标题已移除 -->
    </view>
    <view class="detail-content">
      <view v-if="sections.category" class="section-block" data-note="消耗大类分析">
        <text class="section-text">{{ sections.category }}</text>
      </view>
      <view v-if="sections.supply" class="section-block" data-note="补货建议">
        <view class="section-list">
          <view v-for="(item, idx) in sections.supply" :key="idx" class="section-list-item">- {{ item }}</view>
        </view>
      </view>
      <view v-if="sections.habit" class="section-block" data-note="消耗习惯分析">
        <text class="section-text">{{ sections.habit }}</text>
      </view>
      <view v-if="sections.blessing" class="section-block" data-note="NOTE">
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
        category: '',
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
      uni.reLaunch({ url: '/pages/index/report' });
    },
    parseReport(content) {
      // 1. 消耗大类分析
      const categoryMatch = content.match(/1\. 【消耗大类分析】：([\s\S]*?)(2\.|$)/);
      // 2. 补货建议
      const supplyMatch = content.match(/2\. 【补货建议】：([\s\S]*?)(3\.|$)/);
      // 3. 消耗习惯分析
      const habitMatch = content.match(/3\. 【消耗习惯分析】：([\s\S]*?)(4\.|$)/);
      // 4. 总结与鼓励
      const blessingMatch = content.match(/4\. 【总结与鼓励】：([\s\S]*?)(希望|$)/);
      // 结尾祝福
      const hopeMatch = content.match(/(希望[\s\S]*)$/);

      this.sections.category = categoryMatch ? categoryMatch[1].trim() : '';
      this.sections.supply = supplyMatch
        ? supplyMatch[1].split(/\n\s*- /).filter(s => s.trim()).map(s => s.replace(/^\s*-\s*/, '').trim())
        : [];
      this.sections.habit = habitMatch ? habitMatch[1].trim() : '';
      // blessing为总结与鼓励+希望
      this.sections.blessing = (blessingMatch ? blessingMatch[1].trim() : '') + (hopeMatch ? '\n' + hopeMatch[1].trim() : '');
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
.section-block::after {
  display: none;
}
.section-block .section-list,
.section-block .section-text {
  position: relative;
}
.section-block .section-list::after,
.section-block .section-text::after {
  display: none;
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