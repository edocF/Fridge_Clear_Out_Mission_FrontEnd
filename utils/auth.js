// 认证工具类
class Auth {
  // 保存登录信息
  static saveLoginInfo(loginInfo) {
    uni.setStorageSync('token', loginInfo.token);
    uni.setStorageSync('userId', loginInfo.id);
    uni.setStorageSync('username', loginInfo.username);
    uni.setStorageSync('email', loginInfo.email);
  }

  // 获取token
  static getToken() {
    return uni.getStorageSync('token'}

  // 获取用户ID
  static getUserId() {
    return uni.getStorageSync('userId');
  }

  // 获取用户名
  static getUsername() {
    return uni.getStorageSync('username');
  }

  // 检查是否已登录
  static isLoggedIn() {
    const token = this.getToken();
    return !!token;
  }

  // 清除登录信息
  static clearLoginInfo() {
    uni.removeStorageSync('token');
    uni.removeStorageSync('userId');
    uni.removeStorageSync('username');
    uni.removeStorageSync('email');
  }

  // 退出登录
  static logout() {
    this.clearLoginInfo();
    uni.reLaunch({
      url: '/pages/login/login'
    });
  }

  // 获取请求头
  static getAuthHeader() {
    const token = this.getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  // 检查token是否过期（简单检查）
  static isTokenExpired() {
    const token = this.getToken();
    if (!token) return true;
    
    try {
      // 简单的token格式检查，实际项目中应该解析JWT
      const parts = token.split('.');
      if (parts.length !== 3) return true;
      
      // 这里可以添加更复杂的token验证逻辑
      return false;
    } catch (error) {
      return true;
    }
  }
}

export default Auth; 