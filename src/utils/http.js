import {ApolloLink} from 'apollo-link'
import {onError} from 'apollo-link-error'
import router from '@/router'
import {Message} from 'element-ui'

import runtimeArgs from '@/runtime-args'

function goto () {
  const httpLogin = runtimeArgs.VUE_APP_LOGIN_URL
  let url = `${httpLogin}?redirect_url=${encodeURIComponent(location.href)}`
  console.log(url)
  location.href = url
}

export const addDatesLink = new ApolloLink((operation, forward) => {
  return forward(operation).map(response => {
    // todo: 收到的返回值 优化, response.data.data
    // if (response.data) {
    //   return response.data.data
    // } else {
    //   return response
    // }
    return response
  })
})

export const errorLink = onError(({graphQLErrors, networkError}) => {
  /*
  * 我只接受几个共有的code
  * 未登录，权限接口
  * 服务器错误  500的
  * 如果是 graphQLErrors 错误 继续执行
  * 如果是 networkError 错误 断代码
  */
  if (graphQLErrors) {
    let extensions = graphQLErrors[0].extensions
    if (extensions) {
      let code = graphQLErrors[0].extensions.code
      if (code) {
        if (code === '401') {
          goto()
        } else if (code === '302') {
          Message({
            type: 'error',
            message: '302错误',
          })
        } else if (code === '400') {
          Message({
            type: 'error',
            message: '参数错误',
          })
        } else if (code === '403') {
          Message({
            type: 'error',
            message: '暂无权限',
          })
          setTimeout(() => {
            router.push({name: 'home'})
          }, 3000)
        } else if (code === '500') {
          Message({
            type: 'error',
            message: '后端服务不可用，请联系管理员 ',
          })
        } else if (code === '606') {
          Message({
            type: 'error',
            message: '该用户已被禁止登陆，请联系管理员',
          })
        }
        console.log(extensions)
      }
    } else {
      // 其他的错误 去单独的接口中处理
    }
  }
  if (networkError) {
    if (networkError.statusCode === 1401) {
      // location.reload()
      networkError.message = ''
      Message({
        type: 'info',
        message: '请重新刷新页面',
      })
    } else {
      console.log(`[Network error]: ${networkError}`)
      throw Error(networkError.message)
    }
  }
})
