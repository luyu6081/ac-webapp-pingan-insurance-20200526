import Vue from 'vue'
import VueApollo from 'vue-apollo'
import 'isomorphic-unfetch'
import {createApolloClient, restartWebsockets} from 'vue-cli-plugin-apollo/graphql-client'
import {InMemoryCache} from 'apollo-cache-inmemory'

import runtimeArgs from '@/runtime-args'

import {errorLink, addDatesLink} from '@/utils/http'

// Install the vue plugin
Vue.use(VueApollo)

// Name of the localStorage item
const AUTH_TOKEN = 'apollo-token'

// Http endpoint
const httpEndpoint = runtimeArgs.VUE_APP_GRAPHQL_HTTP || 'http://10.1.1.176:20001/graphql'

// Config
const defaultOptions = {
  // You can use `https` for secure connection (recommended in production)
  httpEndpoint,
  // You can use `wss` for secure connection (recommended in production)
  // Use `null` to disable subscriptions
  wsEndpoint: null, // process.env.VUE_APP_GRAPHQL_WS || 'ws://10.1.1.176:20001/graphql',
  // LocalStorage token
  tokenName: AUTH_TOKEN,
  // Enable Automatic Query persisting with Apollo Engine
  persisting: false,
  // Use websockets for everything (no HTTP)
  // You need to pass a `wsEndpoint` for this to work
  websocketsOnly: false,
  // Is being rendered on the server?
  ssr: false,

  // Override default apollo link
  // note: don't override httpLink here, specify httpLink options in the
  // httpLinkOptions property of defaultOptions.
  // link: myLink
  httpLinkOptions: {
    includeExtensions: true,
    credentials: 'include',
  },
  link: errorLink.concat(addDatesLink),

  // Override default cache
  cache: new InMemoryCache({freezeResults: false}),

  // Override the way the Authorization header is set
  // getAuth: (tokenName) => ...

  // Additional ApolloClient options
  // apollo: { ... }

  // Client local data (see apollo-link-state)
  // clientState: { resolvers: { ... }, defaults: { ... } }
}

// Call this in the Vue app file
export function createProvider (options = {}) {
  // Create apollo client
  const {apolloClient, wsClient} = createApolloClient({
    ...defaultOptions,
    ...options,
  })
  apolloClient.wsClient = wsClient

  // Create vue apollo provider
  const apolloProvider = new VueApollo({
    defaultClient: apolloClient,
    clients: {
      ucClient: apolloClient,
      apolloClient,
    },
    defaultOptions: {
      $query: {
        // fetchPolicy: 'cache-and-network',
      },
    },
  })

  return apolloProvider
}

// Manually call this when user log in
export async function onLogin (apolloClient, token) {
  if (typeof localStorage !== 'undefined' && token) {
    localStorage.setItem(AUTH_TOKEN, token)
  }
  if (apolloClient.wsClient) restartWebsockets(apolloClient.wsClient)
  try {
    await apolloClient.resetStore()
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('%cError on cache reset (login)', 'color: orange;', e.message)
  }
}

// Manually call this when user log out
export async function onLogout (apolloClient) {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(AUTH_TOKEN)
  }
  if (apolloClient.wsClient) restartWebsockets(apolloClient.wsClient)
  try {
    await apolloClient.resetStore()
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('%cError on cache reset (logout)', 'color: orange;', e.message)
  }
}
