<template>
  <view class="detail-container">
    <view class="detail-header">
      <button class="back-btn" @tap="goBack">返回</button>
      <text class="detail-title">膳食营养报告详情</text>
    </view>
    <view class="detail-content">
      <view v-if="sections.nutrition" class="section-block">
        <text class="section-title">营养摄入分析</text>
        <view class="section-list">
          <view v-for="(item, idx) in sections.nutrition" :key="idx" class="section-list-item">- {{ item }}</view>
        </view>
        <view v-if="chartDataArr.length" class="chart-block">
          <qiun-data-charts type="pie" :opts="chartOpts" :chartData="chartData" />
        </view>
      </view>
      <view v-if="sections.suggestion" class="section-block">
        <text class="section-title">饮食习惯建议</text>
        <view class="section-list">
          <view v-for="(item, idx) in sections.suggestion" :key="idx" class="section-list-item">{{ item }}</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import uCharts from '@/uni_modules/qiun-data-charts/components/qiun-data-charts/qiun-data-charts.vue'
export default {
  components: { 'qiun-data-charts': uCharts },
  data() {
    return {
      reportContent: '',
      sections: {
        analysis: [],
        nutrition: [],
        suggestion: []
      },
      chartData: {},
      chartDataArr: [],
      chartOpts: {
        legend: {
          position: 'right',
          float: 'center'
        },
        extra: {
          pie: {
            labelWidth: 30,
            border: false,
            activeOpacity: 0.5,
            activeRadius: 10,
            offsetAngle: 0,
            ringWidth: 30,
            customRadius: 90
          }
        }
      }
    }
  },
  onLoad(options) {
    console.log('options.reportContent:', options.reportContent)
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
      // 分析报告
      const analysisMatch = content.match(/【分析报告】[\s\S]*?：([\s\S]*?)【营养摄入分析】/);
      this.sections.analysis = analysisMatch ? analysisMatch[1].split(/\n- /).filter(s => s.trim()).map(s => s.replace(/^\s*-\s*/, '').trim()) : [];
      // 营养摄入分析
      const nutritionMatch = content.match(/【营养摄入分析】([\s\S]*?)(您的饮食中|【饮食习惯建议】)/);
      this.sections.nutrition = nutritionMatch ? nutritionMatch[1].split(/\n- /).filter(s => s.trim()).map(s => s.replace(/^\s*-\s*/, '').trim()) : [];
      // 饮食习惯建议
      const suggestionMatch = content.match(/【饮食习惯建议】([\s\S]*?)(希望|【chartData】|$)/);
      this.sections.suggestion = suggestionMatch ? suggestionMatch[1].split(/\n\d+\. /).filter(s => s.trim()).map((s, i) => (i > 0 ? (i + '. ' + s) : s)).filter(s => s) : [];
      // chartData
      const chartDataMatch = content.match(/【chartData】[\s\S]*?({[\s\S]*})/);
      if (chartDataMatch) {
        try {
          const obj = JSON.parse(chartDataMatch[1]);
          this.chartDataArr = Object.keys(obj).map(key => ({ name: key, value: obj[key] }));
          this.chartData = {
            series: [{
              data: this.chartDataArr
            }]
          };
        } catch (e) {
          this.chartDataArr = [];
          this.chartData = {};
        }
      } else {
        this.chartDataArr = [];
        this.chartData = {};
      }
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
.chart-block {
  margin-top: 24rpx;
  background: #f8f8f8;
  border-radius: 16rpx;
  padding: 24rpx;
}
</style>