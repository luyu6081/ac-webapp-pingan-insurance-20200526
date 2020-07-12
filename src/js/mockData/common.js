let flagOneDays = 24 * 60 * 60 * 1000
// mock data 前一天
const preOneDate = new Date(new Date().getTime() - flagOneDays).getTime()
// mock data 前两天
const preTwoDate = new Date(new Date().getTime() - flagOneDays * 2).getTime()

export const notiInfomation = [{
  id: '001',
  publishTm: new Date().getTime(),
  title: '收到了新消息内容很长很长',
  content: '这是内容',
  type: 'NOTIFY',
}, {
  id: '002',
  publishTm: preOneDate,
  title: '收到了新消息',
  content: '这是内容',
  type: 'NOTIFY',
}, {
  id: '003',
  publishTm: preTwoDate,
  title: '收到了新消息',
  content: '这是内容',
  type: 'NOTIFY',
}, {
  id: '004',
  publishTm: preTwoDate,
  title: '收到了新消息',
  content: '这是内容',
  type: 'NOTIFY',
}, {
  id: '005',
  publishTm: 1555729871000,
  title: '收到了新消息',
  content: '这是内容',
  type: 'NOTIFY',
}, {
  id: '006',
  publishTm: 1555729871000,
  title: '收到了新消息',
  content: '这是内容',
  type: 'NOTIFY',
}, {
  id: '007',
  publishTm: 1555729871000,
  title: '收到了新消息',
  content: '这是内容',
  type: 'NOTIFY',
}, {
  id: '008',
  publishTm: 1555729871000,
  title: '收到了新消息',
  content: '这是内容',
  type: 'NOTIFY',
}, {
  id: '009',
  publishTm: 1555729871000,
  title: '收到了新消息',
  content: '这是内容',
  type: 'NOTIFY',
}, {
  id: '010',
  publishTm: 1555729871000,
  title: '收到了新消息',
  content: '这是内容',
  type: 'NOTIFY',
}]

export const notiNotify = [{
  id: '001',
  publishTm: 1555946603000,
  title: '收到了新通知',
  content: '这是内容',
  type: 'INFORMATION',
}]

export const notiCommission = [{
  id: '001',
  publishTm: 1552187471000,
  title: '收到了新待办',
  content: '这是内容',
  type: 'COMMISSION',
}]
