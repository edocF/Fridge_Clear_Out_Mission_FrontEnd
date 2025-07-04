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
	  },
	  onLaunch() {
			const token = uni.getStorageSync('token');
			if (token) {
				// 校验 token 有效性
				uni.request({
					url: `${require('@/config/index.js').default.baseUrl}/food`,
					method: 'GET',
					header: {
						'token': token
					},
					success: (res) => {
						if (res.statusCode === 200) {
				uni.reLaunch({ url: '/pages/index/index' });
						} else {
							uni.removeStorageSync('token');
							uni.reLaunch({ url: '/pages/login/login' });
						}
					},
					fail: () => {
						uni.removeStorageSync('token');
						uni.reLaunch({ url: '/pages/login/login' });
					}
				});
			} else {
				uni.reLaunch({ url: '/pages/login/login' });
			}
		}
	}
</script>

<style>
	/*每个页面公共css */
</style>
