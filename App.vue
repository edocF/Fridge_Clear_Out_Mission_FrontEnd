<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		},
	 globalData: {
	    foodList: [
		  { 
		    name: '', 
		    emoji: '🍅',
		    kcal: 0.0, 
		    carb: 0.0, 
		    protein: 0.0, 
		    fat: 0.0, 
		    price: '0.00', 
		    expired: false,
		    expSoon: false,
		    expiryDate: '',
		    image: 'https://example.com/tomato.jpg'
		    },
		  ],
	    loading: false
	  },
	  methods: {
	    async fetchFoodList() {
	      this.globalData.loading = true;
	      try {
	        const res = await uni.request({ url: 'http://localhost:8080/food' });
	        this.globalData.foodList = res.data.data;
	      } catch (error) {
	        alert("出错了",error);
	      } finally {
	        this.globalData.loading = false;
	      }
	    }
	  },
	  onLaunch() {
			const token = uni.getStorageSync('token');
			if (token) {
				// 这里可以加上token有效性校验逻辑（如有需要）
				uni.reLaunch({ url: '/pages/index/index' });
			} else {
				// 如果没有token，跳转到登录页
				uni.reLaunch({ url: '/pages/login/login' });
			}
			// this.fetchFoodList(); // 如需自动拉取数据可放在index页面
		}
	}
</script>

<style>
	/*每个页面公共css */
</style>
