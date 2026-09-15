// 國立臺北大學 全校學院與學系結構資料庫
const DEPARTMENTS_DATA = [
  {
    college: '法律學院',
    collegeKey: 'law',
    departments: [
      { id: 'law_f', name: '法律學系（法學組）' },
      { id: 'law_j', name: '法律學系（司法組）' },
      { id: 'law_e', name: '法律學系（財經法組）' }
    ]
  },
  {
    college: '商學院',
    collegeKey: 'business',
    departments: [
      { id: 'ba', name: '企業管理學系' },
      { id: 'cf', name: '金融與合作經營學系' },
      { id: 'acc', name: '會計學系' },
      { id: 'stat', name: '統計學系' },
      { id: 'lsm', name: '休閒運動管理學系' }
    ]
  },
  {
    college: '社會科學學院',
    collegeKey: 'social_sci',
    departments: [
      { id: 'econ', name: '經濟學系' },
      { id: 'soc', name: '社會學系' },
      { id: 'sw', name: '社會工作學系' }
    ]
  },
  {
    college: '公共事務學院',
    collegeKey: 'public_affairs',
    departments: [
      { id: 'pa', name: '公共行政暨政策學系' },
      { id: 'pf', name: '財政學系' },
      { id: 'rebe', name: '不動產與城鄉環境學系' }
    ]
  },
  {
    college: '人文學院',
    collegeKey: 'humanities',
    departments: [
      { id: 'cl', name: '中國文學系' },
      { id: 'flal', name: '應用外語學系' },
      { id: 'hist', name: '歷史學系' }
    ]
  },
  {
    college: '電機資訊學院',
    collegeKey: 'eecs',
    departments: [
      { id: 'cs', name: '資訊工程學系', default: true },
      { id: 'ee', name: '電機工程學系' },
      { id: 'ce', name: '通訊工程學系' }
    ]
  }
];

if (typeof window !== 'undefined') {
  window.DEPARTMENTS_DATA = DEPARTMENTS_DATA;
}
