let HttpErrors = [
  {
    key: 'login',
    value: '401',
    name: '用户未登录',
  },
  {
    key: '401',
    value: 401,
    name: 'token无效或已过期 ',
  },
  {
    key: '400',
    value: '400',
    name: '参数传递错误 ',
  },
  {
    key: '403',
    value: '403',
    name: '无权访问 ',
  },
  {
    key: '500',
    value: '500',
    name: '后端服务不可用，请联系管理员',
  },
]
export default {
  HttpErrors,
}
