const config = require('@ej/tailwind-config')
const Lodash = require('lodash')

const selfConfig = {
  theme: {
    extend: {
      colors: {
        transparent: 'transparent',

        black: '#000',
        white: '#fff',

        gray: {
          lightest: '#fafafa',
          lighter: '#f5f5f5',
          light: '#e4e4e4',
          default: '#ccc',
          dark: '#999',
          darker: '#666',
          darkest: '#333',
        },
        red: {
          lighter: '#ffe1e1',
          light: '#ffa5a5',
          default: '#ff6a6a',
        },
        orange: {
          lighter: '#ffe3cb',
          light: '#ffbf8a',
          default: '#eb8f43',
        },
        yellow: {
          lighter: '#ffedbb',
          light: '#ffdc7b',
          default: '#ffcc3f',
        },
        green: {
          lighter: '#d8ffec',
          light: '#8be0b6',
          default: '#4ec189',
        },
        blue: {
          lighter: '#e2ecff',
          light: '#9cbaf2',
          default: '#477de9',
        },
        purple: {
          lighter: '#ebdfff',
          light: '#be94ff',
          default: '#8e45ff',
        },
      },
      fill: theme => ({
        ...theme('colors'),

        current: 'currentColor',
      }),
      fontFamily: {
        sans: [
          '-apple-system',
          '"Noto Sans"',
          '"Helvetica Neue"',
          'Helvetica',
          '"Nimbus Sans L"',
          'Arial',
          '"Liberation Sans"',
          '"PingFang SC"',
          '"Hiragino Sans GB"',
          '"Noto Sans CJK SC"',
          '"Source Han Sans SC"',
          '"Source Han Sans CN"',
          '"Microsoft YaHei"',
          '"Wenquanyi Micro Hei"',
          '"WenQuanYi Zen Hei"',
          '"ST Heiti"',
          'SimHei',
          '"WenQuanYi Zen Hei Sharp"',
          'sans-serif',
        ],
        serif: [
          'Georgia',
          '"Nimbus Roman No9 L"',
          '"Songti SC"',
          '"Noto Serif CJK SC"',
          '"Source Han Serif SC"',
          '"Source Han Serif CN"',
          'STSong',
          '"AR PL New Sung"',
          '"AR PL SungtiL GB"',
          'NSimSun',
          'SimSun',
          '"WenQuanYi Bitmap Song"',
          '"AR PL UMing CN"',
          '"AR PL UMing HK"',
          '"AR PL UMing TW"',
          '"AR PL UMing TW MBE"',
          'PMingLiU',
          'MingLiU',
          'serif',
        ],
        mono: [
          'Menlo',
          'Monaco',
          'Consolas',
          '"Liberation Mono"',
          '"Courier New"',
          'monospace',
        ],
      },
      fontSize: {
        'xs': '10px',
        'sm': '12px',
        'base': '14px',
        'lg': '16px',
        'xl': '20px',
        '2xl': '24px',
        '3xl': '30px',
        '4xl': '38px',
      },
      lineHeight: {
        'none': '1',
        'sm': '20px',
        'base': '22px',
        'lg': '24px',
        'xl': '28px',
        '2xl': '32px',
        '3xl': '38px',
        '4xl': '46px',
      },
      spacing: {
        xs: '5px',
        sm: '10px',
        md: '20px',
        lg: '30px',
        xl: '50px',
      },
      borderRadius: {
        none: '0',
        sm: '2px',
        default: '4px',
        full: '9999px',
      },
      boxShadow: {
        default: '0 0 8px rgba(0, 0, 0, 0.15)',
      },
    },
  },
  variants: {
    textColor: ['responsive', 'hover', 'focus'],
    fill: ['responsive', 'hover', 'focus'],
  },
  plugins: [
    ({addUtilities}) => {
      const newUtilities = {
        '.bg-theme-color': {
          background: '#477de9',
        },
        '.text-theme-color': {
          color: '#477de9',
        },
        '.border-theme-color': {
          borderColor: '#477de9',
        },
        '.fill-theme-color': {
          fill: '#477de9',
        },
      }

      addUtilities(newUtilities, ['responsive', 'hover'])
    },
  ],
}

selfConfig.theme.extend = Lodash.merge(config.theme, selfConfig.theme.extend)

module.exports = selfConfig
