<template>
  <view class="detail-container">
    <view class="detail-header">
      <!-- 标题已移除 -->
    </view>
    <view class="detail-content">
      <view v-if="sections.nutrition" class="section-block" data-note="营养摄入分析">
        <view class="section-list">
          <view v-for="(item, idx) in sections.nutrition" :key="idx" class="section-list-item">- {{ item }}</view>
        </view>
        <view v-if="chartDataArr.length" class="chart-block">
          <qiun-data-charts type="pie" :opts="chartOpts" :chartData="chartData" />
        </view>
      </view>
      <view v-if="sections.suggestion" class="section-block" data-note="饮食习惯建议">
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
          float: 'top',
          margin:15
        },
        extra: {
          pie: {
            labelWidth: 40,
            border: false,
            activeOpacity: 0.5,
            activeRadius: 10,
            offsetAngle: 30,
            ringWidth: 30,
            customRadius: 70
          }
        }
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
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
}
</style>