/**
 * Generates public/data/school-breaks-2026.json — 2025–2026 school year nationwide coverage.
 * Run: node scripts/build-school-breaks.mjs && node scripts/generate-school-breaks-2025.mjs
 */

import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outPath = join(root, 'public/data/school-breaks-2026.json')

const NULL_SEASON = (note) => ({ start: null, end: null, note })

/** 2026 年秋季学期秋假（义务教育为主）；分段假用首尾日覆盖并于 note 说明 */
const AB = (start, end, note) => ({ start, end, note })

function breaks({ spring, summer, autumn, winter }) {
  return {
    spring: spring ?? NULL_SEASON('暂无统一春假安排'),
    summer: summer ?? NULL_SEASON('暑假结束日待秋季校历全文公布'),
    autumn: autumn ?? NULL_SEASON('暂无统一秋假安排'),
    winter,
  }
}

function city(
  name,
  { winter, summer, spring, autumn, source, updatedAt, illustrative = false, winterNote = '义务教育' },
) {
  return {
    name,
    breaks: breaks({
      spring,
      summer,
      autumn,
      winter: {
        start: winter[0],
        end: winter[1],
        note: winterNote,
      },
    }),
    source,
    updatedAt,
    illustrative,
  }
}

/** Provincial default applied when a city has no override */
function fromTemplate(name, tpl, override = {}) {
  return city(name, { ...tpl, ...override })
}

// --- reusable season fragments ---
const summerEndAug31 = { start: null, end: '2026-08-31', note: '义务教育；结束日以市通知为准' }
const summerJul4 = { start: '2026-07-04', end: '2026-08-31', note: '义务教育' }
const summerJul11 = { start: '2026-07-11', end: null, note: '结束日待秋季校历全文公布' }

const provinces = [
  {
    code: 'BJ',
    name: '北京',
    mapName: '北京市',
    svgName: 'Beijing',
    cities: [
      city('北京市', {
        winter: ['2026-01-24', '2026-03-01'],
        summer: { start: '2026-07-08', end: '2026-08-31', note: '义务教育' },
        spring: NULL_SEASON('暂无全省统一春假制度'),
        autumn: NULL_SEASON('暂无全省统一秋假制度'),
        source: 'https://jw.beijing.gov.cn/xxgk/2024zcwj/2024qtwj/202507/t20250704_4141331.html',
        updatedAt: '2025-07-04',
        illustrative: false,
      }),
    ],
  },
  {
    code: 'TJ',
    name: '天津',
    mapName: '天津市',
    svgName: 'Tianjin',
    cities: [
      city('天津市', {
        winter: ['2026-01-29', '2026-03-01'],
        summer: { start: '2026-07-05', end: '2026-08-31', note: '义务教育（第二学期校历惯例）' },
        spring: NULL_SEASON('探索春秋假中，无全市统一日期'),
        autumn: NULL_SEASON('探索春秋假中，无全市统一日期'),
        source: 'http://tj.bendibao.com/edu/202617/164399.shtm',
        updatedAt: '2026-01-07',
        illustrative: true,
      }),
    ],
  },
  {
    code: 'HE',
    name: '河北',
    mapName: '河北省',
    svgName: 'Hebei',
    cities: (() => {
      const tpl = {
        winter: ['2026-01-28', '2026-03-02'],
        summer: summerJul4,
        spring: NULL_SEASON('省里探索春秋假，各市错峰安排'),
        autumn: NULL_SEASON(
          '2026 年邯郸、邢台等市已公布秋假（如 9 月 28—30 日或 11 月），全省无统一日期',
        ),
        source: 'https://hbxw.hebnews.cn/news/583610.html',
        updatedAt: '2026-11-09',
        illustrative: true,
      }
      return ['石家庄市', '唐山市', '保定市', '邯郸市', '廊坊市'].map((n) => fromTemplate(n, tpl))
    })(),
  },
  {
    code: 'SX',
    name: '山西',
    mapName: '山西省',
    svgName: 'Shanxi',
    cities: (() => {
      const tpl = {
        winter: ['2026-01-31', '2026-03-02'],
        summer: summerJul4,
        spring: NULL_SEASON('以市校历为准'),
        autumn: NULL_SEASON('以市校历为准'),
        source: 'https://static.nfnews.com/content/202508/16/c11628864.html',
        updatedAt: '2025-08-16',
        illustrative: true,
      }
      return ['太原市', '大同市', '运城市', '临汾市', '长治市'].map((n) => {
        const autumnOverrides = {
          太原市: AB('2026-11-11', '2026-11-13', '原则上为11月第二个周三至周五（2026年）'),
          运城市: AB(
            '2026-11-05',
            '2026-11-09',
            '2026年秋假为11月5日、6日、9日三天，与周末衔接约5天',
          ),
        }
        return fromTemplate(n, tpl, { autumn: autumnOverrides[n] ?? tpl.autumn })
      })
    })(),
  },
  {
    code: 'NM',
    name: '内蒙古',
    mapName: '内蒙古自治区',
    svgName: 'Nei Mongol',
    cities: (() => {
      const tpl = {
        winter: ['2026-01-17', '2026-02-28'],
        summer: { start: '2026-07-16', end: '2026-08-31', note: '义务教育' },
        spring: NULL_SEASON('以盟市校历为准'),
        autumn: NULL_SEASON('以盟市校历为准'),
        source: 'http://hlj.people.com.cn/n2/2025/0825/c220005-41331353.html',
        updatedAt: '2025-08-25',
        illustrative: true,
        winterNote: '参照北方省份常见安排，以盟市通知为准',
      }
      const nmAutumn = {
        呼和浩特市: AB(
          '2026-11-30',
          '2026-12-02',
          '2026年秋假3天，与11月28—29日周末衔接；初三、高三一般不安排',
        ),
        赤峰市: AB('2026-11-28', '2026-12-02', '义务教育秋假，与周末衔接约5天'),
      }
      return ['呼和浩特市', '包头市', '鄂尔多斯市', '赤峰市', '呼伦贝尔市'].map((n) =>
        fromTemplate(n, tpl, { autumn: nmAutumn[n] ?? tpl.autumn }),
      )
    })(),
  },
  {
    code: 'LN',
    name: '辽宁',
    mapName: '辽宁省',
    svgName: 'Liaoning',
    cities: [
      city('沈阳市', {
        winter: ['2026-01-15', '2026-03-01'],
        summer: { start: '2026-07-15', end: '2026-08-31', note: '义务教育' },
        spring: NULL_SEASON('暂无统一春假'),
        autumn: AB(
          '2026-10-29',
          '2026-11-02',
          '2026年秋假含10月29—30日、11月2日等工作日，与周末衔接约5天',
        ),
        source: 'https://jyj.shenyang.gov.cn/jyyw/202508/t20250827_4895583.html',
        updatedAt: '2026-11-09',
        illustrative: true,
      }),
      ...['大连市', '鞍山市', '锦州市', '抚顺市'].map((n) =>
        fromTemplate(n, {
          winter: ['2026-01-20', '2026-03-01'],
          summer: { start: '2026-07-15', end: '2026-08-31', note: '义务教育' },
          spring: NULL_SEASON('以市校历为准'),
          autumn:
            n === '大连市'
              ? AB('2026-10-30', '2026-11-03', '2026年秋假，与周末衔接约5天')
              : AB('2026-10-30', '2026-11-04', '2026年秋假多在10月底至11月初，与周末连休'),
          source: 'https://jyj.shenyang.gov.cn/jyyw/202508/t20250827_4895583.html',
          updatedAt: '2026-11-09',
          illustrative: true,
          winterNote: '参照省内框架，具体以市教育局为准',
        }),
      ),
    ],
  },
  {
    code: 'JL',
    name: '吉林',
    mapName: '吉林省',
    svgName: 'Jilin',
    cities: (() => {
      const tpl = {
        winter: ['2026-01-16', '2026-02-28'],
        summer: { start: '2026-07-16', end: '2026-08-31', note: '义务教育' },
        spring: NULL_SEASON('以市州校历为准'),
        autumn: NULL_SEASON('以市州校历为准'),
        source: 'http://hlj.people.com.cn/n2/2025/0825/c220005-41331353.html',
        updatedAt: '2025-08-25',
        illustrative: true,
        winterNote: '参照东北省份常见安排，以市州通知为准',
      }
      return ['长春市', '吉林市', '延边朝鲜族自治州', '四平市', '通化市'].map((n) => fromTemplate(n, tpl))
    })(),
  },
  {
    code: 'HL',
    name: '黑龙江',
    mapName: '黑龙江省',
    svgName: 'Heilongjiang',
    cities: (() => {
      const tpl = {
        winter: ['2026-01-16', '2026-02-28'],
        summer: { start: '2026-07-16', end: '2026-08-31', note: '义务教育' },
        spring: NULL_SEASON('以市地校历为准'),
        autumn: NULL_SEASON('以市地校历为准'),
        source: 'http://hlj.people.com.cn/n2/2025/0825/c220005-41331353.html',
        updatedAt: '2025-08-25',
        illustrative: false,
      }
      return ['哈尔滨市', '齐齐哈尔市', '大庆市', '牡丹江市', '佳木斯市'].map((n) => fromTemplate(n, tpl))
    })(),
  },
  {
    code: 'SH',
    name: '上海',
    mapName: '上海市',
    svgName: 'Shanghai',
    cities: [
      city('上海市', {
        winter: ['2026-02-02', '2026-02-27'],
        summer: { start: '2026-07-01', end: '2026-08-31', note: '中小学统一校历' },
        spring: NULL_SEASON('暂无统一春假制度'),
        autumn: NULL_SEASON('暂无统一秋假制度'),
        source: 'https://edu.sh.gov.cn/xxgk2_zdgz_jcjy_05/20250418/13e7f8c39763419cb70972d1d409b721.html',
        updatedAt: '2025-04-22',
        illustrative: false,
      }),
    ],
  },
  {
    code: 'JS',
    name: '江苏',
    mapName: '江苏省',
    svgName: 'Jiangsu',
    cities: (() => {
      const jsAutumn = {
        南京市: AB('2026-11-16', '2026-11-18', '全省推行春秋假，与11月14—15日周末连休共5天'),
        无锡市: AB('2026-11-16', '2026-11-18', '义务教育秋假，与周末连休共5天'),
        徐州市: AB('2026-11-18', '2026-11-20', '部分区县实行，与周末连休共5天'),
        常州市: AB('2026-11-16', '2026-11-18', '义务教育秋假，与周末连休共5天'),
        苏州市: AB('2026-11-16', '2026-11-18', '义务教育秋假，与周末连休共5天'),
        南通市: AB('2026-11-26', '2026-11-30', '与周末连休共5天（含11月28—29日）'),
        扬州市: AB('2026-11-16', '2026-11-18', '义务教育秋假，与周末连休共5天'),
        镇江市: AB('2026-11-26', '2026-11-30', '秋假含11月26、27、30日，与周末衔接'),
        泰州市: AB('2026-11-16', '2026-11-18', '义务教育秋假，与周末连休共5天'),
        盐城市: AB('2026-11-16', '2026-11-18', '义务教育秋假，与周末连休共5天'),
        淮安市: AB('2026-11-18', '2026-11-20', '部分区县实行，与周末连休共5天'),
        连云港市: AB('2026-11-18', '2026-11-20', '部分区县实行，与周末连休共5天'),
        宿迁市: AB('2026-11-14', '2026-11-18', '秋假与双休日连休共5天'),
      }
      const jsWinter = {
        winter: ['2026-02-07', '2026-03-04'],
        summer: { start: '2026-07-05', end: null, note: '结束日待各市秋季通知（省内第二学期校历尚未全省统一发文）' },
        spring: NULL_SEASON('全省未统一春假；南京等地偶有学期中活动假'),
        autumn: NULL_SEASON('全省未统一秋假'),
        source: 'http://js.news.cn/20260128/4a3d8ca67cfd49949789d126bc5f6c9c/c.html',
        updatedAt: '2026-11-09',
        illustrative: false,
      }
      const cities = [
        '南京市',
        '无锡市',
        '徐州市',
        '常州市',
        '苏州市',
        '南通市',
        '扬州市',
        '镇江市',
        '泰州市',
        '盐城市',
        '淮安市',
        '连云港市',
        '宿迁市',
      ]
      return cities.map((n) => {
        const extra =
          n === '南京市'
            ? {
                source: 'https://edu.nanjing.gov.cn/xwdt/yw/202602/t20260226_5796293.html',
                updatedAt: '2026-11-09',
                illustrative: false,
              }
            : n === '连云港市'
              ? {
                  source: 'https://www.lyg.gov.cn/zglygzfmhwz/rdhy/content/d36d64d1-67e8-4f16-a255-694e53d2b2b4.shtml',
                  updatedAt: '2026-11-09',
                }
              : { updatedAt: '2026-11-09' }
        return fromTemplate(n, jsWinter, {
          ...extra,
          autumn: jsAutumn[n],
        })
      })
    })(),
  },
  {
    code: 'ZJ',
    name: '浙江',
    mapName: '浙江省',
    svgName: 'Zhejiang',
    cities: [
      city('杭州市', {
        winter: ['2026-02-07', '2026-03-04'],
        summer: { start: '2026-07-04', end: null, note: '杭州惯例，结束日待确认' },
        spring: { start: '2026-04-03', end: '2026-04-05', note: '春秋假制度（区县可微调）' },
        autumn: AB(
          '2026-09-28',
          '2026-09-30',
          '主城区2026年秋假，与中秋国庆衔接可连休；三县一市多为11月12、13、16日',
        ),
        source: 'http://news.cnnb.com.cn/system/2026/09/03/030810930.shtml',
        updatedAt: '2026-11-09',
        illustrative: false,
      }),
      city('宁波市', {
        winter: ['2026-02-07', '2026-03-03'],
        summer: { start: '2026-07-05', end: '2026-08-31', note: '义务教育' },
        spring: NULL_SEASON('春秋假各约 3 天，2027 年春假另文公布'),
        autumn: AB('2026-11-25', '2026-11-27', '2026年全市统一秋假，与周末连休共5天'),
        source: 'http://news.cnnb.com.cn/system/2026/09/03/030810930.shtml',
        updatedAt: '2026-11-09',
        illustrative: false,
      }),
      city('温州市', {
        winter: ['2026-02-07', '2026-03-03'],
        summer: summerJul4,
        spring: NULL_SEASON('春秋假各约 3 天，市级弹性安排'),
        autumn: NULL_SEASON(
          '2026年各县市区分两批：11月11—13日或11月16—18日，具体以县市区通知为准',
        ),
        source: 'http://news.cnnb.com.cn/system/2026/09/03/030810930.shtml',
        updatedAt: '2026-11-09',
        illustrative: false,
      }),
      city('嘉兴市', {
        winter: ['2026-02-07', '2026-03-03'],
        summer: summerJul4,
        spring: NULL_SEASON('春秋假制度，春假多与五一衔接'),
        autumn: AB('2026-11-11', '2026-11-13', '2026年全市统一秋假3天'),
        source: 'http://news.cnnb.com.cn/system/2026/09/03/030810930.shtml',
        updatedAt: '2026-11-09',
        illustrative: false,
      }),
      city('湖州市', {
        winter: ['2026-02-07', '2026-03-03'],
        summer: summerJul4,
        spring: NULL_SEASON('春秋假制度'),
        autumn: AB(
          '2026-11-12',
          '2026-11-16',
          '2026年秋假为11月12、13、16日（分段），与周末衔接',
        ),
        source: 'https://epaper.zjjyzx.com.cn/html/2026-09/08/content_155847_3818335.htm',
        updatedAt: '2026-11-09',
        illustrative: false,
      }),
      city('绍兴市', {
        winter: ['2026-02-08', '2026-03-03'],
        summer: summerJul4,
        spring: NULL_SEASON('春秋假制度'),
        autumn: NULL_SEASON('2026年分三批：11月11—13日、16—18日或13/16/17日，区县不同'),
        source: 'http://news.cnnb.com.cn/system/2026/09/03/030810930.shtml',
        updatedAt: '2026-11-09',
        illustrative: false,
      }),
      city('金华市', {
        winter: ['2026-02-09', '2026-03-03'],
        summer: summerJul4,
        spring: NULL_SEASON('初三年级不安排春假'),
        autumn: AB('2026-11-13', '2026-11-17', '2026年秋假为11月13、16、17日，与周末连休'),
        source: 'http://news.cnnb.com.cn/system/2026/09/03/030810930.shtml',
        updatedAt: '2026-11-09',
        illustrative: false,
      }),
      city('衢州市', {
        winter: ['2026-02-07', '2026-03-03'],
        summer: summerJul4,
        spring: NULL_SEASON('春秋假制度'),
        autumn: AB('2026-11-18', '2026-11-20', '2026年全市统一秋假3天'),
        source: 'http://news.cnnb.com.cn/system/2026/09/03/030810930.shtml',
        updatedAt: '2026-11-09',
        illustrative: false,
      }),
      city('舟山市', {
        winter: ['2026-02-08', '2026-03-03'],
        summer: summerJul4,
        spring: NULL_SEASON('春秋假制度'),
        autumn: AB('2026-11-18', '2026-11-20', '2026年秋假3天；区县可参照或自主安排'),
        source: 'https://www.cztv.com/newsDetail/894841',
        updatedAt: '2026-11-09',
        illustrative: false,
      }),
      city('台州市', {
        winter: ['2026-02-10', '2026-03-03'],
        summer: summerJul4,
        spring: NULL_SEASON('春秋假 3 天，县市区确定'),
        autumn: AB('2026-11-11', '2026-11-13', '2026年全市统一秋假3天'),
        source: 'http://news.cnnb.com.cn/system/2026/09/03/030810930.shtml',
        updatedAt: '2026-11-09',
        illustrative: false,
      }),
      city('丽水市', {
        winter: ['2026-02-07', '2026-03-04'],
        summer: { start: '2026-07-05', end: null, note: '3 月 5 日正式上课' },
        spring: NULL_SEASON('春假 2—3 天，可与五一连休'),
        autumn: AB('2026-11-09', '2026-11-11', '2026年全市统一秋假3天'),
        source: 'http://news.cnnb.com.cn/system/2026/09/03/030810930.shtml',
        updatedAt: '2026-11-09',
        illustrative: false,
      }),
    ],
  },
  {
    code: 'AH',
    name: '安徽',
    mapName: '安徽省',
    svgName: 'Anhui',
    cities: [
      city('合肥市', {
        winter: ['2026-02-05', '2026-03-04'],
        summer: { start: '2026-07-01', end: '2026-08-31', note: '义务教育' },
        spring: NULL_SEASON('以市管县通知为准'),
        autumn: NULL_SEASON('以市管县通知为准'),
        source: 'https://view.inews.qq.com/a/20251223A050RX00',
        updatedAt: '2025-12-23',
        illustrative: true,
      }),
      city('芜湖市', {
        winter: ['2026-02-06', '2026-03-01'],
        summer: { start: '2026-07-01', end: '2026-08-31', note: '义务教育' },
        spring: NULL_SEASON('以市校历为准'),
        autumn: AB(
          '2026-11-19',
          '2026-11-23',
          '2026年秋假含11月19、20、23日，与周末连休共5天',
        ),
        source: 'https://jyj.wuhu.gov.cn/openness/public/6596321/40159645.html',
        updatedAt: '2026-11-09',
        illustrative: true,
      }),
      ...['蚌埠市', '阜阳市', '安庆市'].map((n) =>
        fromTemplate(n, {
          winter: ['2026-02-05', '2026-03-04'],
          summer: { start: '2026-07-01', end: '2026-08-31', note: '义务教育' },
          spring: NULL_SEASON('以市校历为准'),
          autumn: NULL_SEASON('以市校历为准'),
          source: 'https://view.inews.qq.com/a/20251223A050RX00',
          updatedAt: '2025-12-23',
          illustrative: true,
        }),
      ),
    ],
  },
  {
    code: 'FJ',
    name: '福建',
    mapName: '福建省',
    svgName: 'Fujian',
    cities: [
      city('福州市', {
        winter: ['2026-01-31', '2026-02-25'],
        summer: { start: '2026-07-04', end: '2026-08-31', note: '义务教育' },
        spring: NULL_SEASON('以闽教办基〔2025〕11 号及市通知为准'),
        autumn: NULL_SEASON('2026年区县错峰：多数区11月18—20日，长乐/马尾11月23—25日，福清11月16—18日'),
        source: 'https://www.chinanews.com.cn/edu/2026/10-10/10709987.shtml',
        updatedAt: '2026-11-09',
        illustrative: false,
      }),
      ...['厦门市', '泉州市', '漳州市', '龙岩市'].map((n) =>
        fromTemplate(n, {
          winter: ['2026-02-07', '2026-03-03'],
          summer: { start: '2026-07-03', end: '2026-08-31', note: '义务教育' },
          spring: NULL_SEASON('省厅框架下以市通知为准'),
          autumn:
            n === '厦门市'
              ? AB('2026-11-25', '2026-11-27', '2026年秋假，与周末连休共5天')
              : NULL_SEASON('2026年各县区错峰安排，以市教育局通知为准'),
          source: 'https://fjnews.fjsen.com/2025-08/07/content_32011866.htm',
          updatedAt: '2026-11-09',
          illustrative: n !== '厦门市',
        }),
      ),
    ],
  },
  {
    code: 'JX',
    name: '江西',
    mapName: '江西省',
    svgName: 'Jiangxi',
    cities: (() => {
      const tpl = {
        winter: ['2026-01-31', '2026-03-02'],
        summer: summerJul4,
        spring: NULL_SEASON('以设区市校历为准'),
        autumn: NULL_SEASON('以设区市校历为准'),
        source: 'https://static.nfnews.com/content/202508/16/c11628864.html',
        updatedAt: '2025-08-16',
        illustrative: true,
      }
      return ['南昌市', '赣州市', '九江市', '上饶市', '宜春市'].map((n) => fromTemplate(n, tpl))
    })(),
  },
  {
    code: 'SD',
    name: '山东',
    mapName: '山东省',
    svgName: 'Shandong',
    cities: [
      city('济南市', {
        winter: ['2026-02-03', '2026-03-03'],
        summer: { start: '2026-07-04', end: '2026-08-31', note: '义务教育' },
        spring: NULL_SEASON('部分地市探索春秋假'),
        autumn: NULL_SEASON('2026年秋假由各区县确定（多数区为11月4—6日或11月上旬）'),
        source: 'https://www.thepaper.cn/newsDetail_forward_34368996',
        updatedAt: '2026-11-09',
        illustrative: false,
      }),
      city('青岛市', {
        winter: ['2026-02-03', '2026-03-03'],
        summer: { start: '2026-07-06', end: '2026-08-31', note: '义务教育' },
        spring: NULL_SEASON('以市通知为准'),
        autumn: AB('2026-11-05', '2026-11-09', '2026年秋假5天（已与周末衔接安排）'),
        source: 'http://edu.qingdao.gov.cn/tzgg/202506/t20250610_9645107.shtml',
        updatedAt: '2026-11-09',
        illustrative: false,
      }),
      city('烟台市', {
        winter: ['2026-01-31', '2026-03-04'],
        summer: { start: '2026-07-04', end: '2026-08-31', note: '义务教育' },
        spring: NULL_SEASON('2026年春假4月30日及5月6—7日'),
        autumn: AB(
          '2026-11-06',
          '2026-11-10',
          '2026年秋假为11月6、9、10日三天，与11月7—8日周末连休共5天',
        ),
        source: 'http://www.sd.xinhuanet.com/20261105/1f92ac0528c748109be379d44f430101/c.html',
        updatedAt: '2026-11-09',
        illustrative: false,
      }),
      ...['潍坊市', '临沂市'].map((n) =>
        fromTemplate(n, {
          winter: ['2026-02-04', '2026-03-04'],
          summer: { start: '2026-07-06', end: '2026-08-31', note: '义务教育' },
          spring: NULL_SEASON('部分地市探索春秋假'),
          autumn:
            n === '临沂市'
              ? AB('2026-11-13', '2026-11-17', '2026年秋假为11月13、16、17日，与周末连休共5天')
              : AB('2026-11-06', '2026-11-10', '2026年秋假为11月6、9—10日，与周末连休共5天'),
          source:
            n === '临沂市'
              ? 'https://www.linyi.gov.cn/info/6418/503099.htm'
              : 'https://www.bjnews.com.cn/detail/1788861233019667.html',
          updatedAt: '2026-11-09',
          illustrative: false,
        }),
      ),
    ],
  },
  {
    code: 'HA',
    name: '河南',
    mapName: '河南省',
    svgName: 'Henan',
    cities: [
      city('郑州市', {
        winter: ['2026-02-06', '2026-03-04'],
        summer: { start: '2026-07-05', end: '2026-08-31', note: '义务教育' },
        spring: NULL_SEASON('以省辖市通知为准'),
        autumn: NULL_SEASON('以省辖市通知为准'),
        source: 'https://zzjy.zhengzhou.gov.cn/gzdt/9834884.jhtml',
        updatedAt: '2026-01-07',
        illustrative: false,
      }),
      ...['洛阳市', '南阳市', '新乡市', '商丘市'].map((n) =>
        fromTemplate(n, {
          winter: ['2026-02-06', '2026-03-04'],
          summer: { start: '2026-07-05', end: '2026-08-31', note: '义务教育' },
          spring: NULL_SEASON('全省多市统一寒假框架'),
          autumn: NULL_SEASON('以省辖市通知为准'),
          source: 'https://m.thepaper.cn/newsDetail_forward_32345165',
          updatedAt: '2026-01-08',
          illustrative: true,
        }),
      ),
    ],
  },
  {
    code: 'HB',
    name: '湖北',
    mapName: '湖北省',
    svgName: 'Hubei',
    cities: [
      city('武汉市', {
        winter: ['2026-01-31', '2026-03-03'],
        summer: summerJul4,
        spring: NULL_SEASON('以武汉市校历为准'),
        autumn: NULL_SEASON('武汉城区暂无统一秋假'),
        source: 'http://m.cnhubei.com/content/2025-09/02/content_19468079.html',
        updatedAt: '2025-09-02',
        illustrative: false,
      }),
      city('恩施土家族苗族自治州', {
        winter: ['2026-01-31', '2026-03-04'],
        summer: summerJul11,
        spring: NULL_SEASON('春假不少于1周，2026年各县市自定并与周末/短假衔接'),
        autumn: NULL_SEASON(
          '全州义务教育秋假不少于1周，2026年各县市自定（例：咸丰县10月28—30日）；非国庆法定假',
        ),
        source: 'https://feng.ifeng.com/c/8xULd4M7i9H',
        updatedAt: '2026-11-09',
        illustrative: false,
      }),
      ...['襄阳市', '宜昌市', '黄石市', '荆州市'].map((n) =>
        fromTemplate(n, {
          winter: ['2026-01-31', '2026-03-04'],
          summer: summerJul4,
          spring: NULL_SEASON('以市州校历为准'),
          autumn: NULL_SEASON('以市州校历为准'),
          source: 'https://static.nfnews.com/content/202508/16/c11628864.html',
          updatedAt: '2025-08-16',
          illustrative: true,
        }),
      ),
    ],
  },
  {
    code: 'HN',
    name: '湖南',
    mapName: '湖南省',
    svgName: 'Hunan',
    cities: [
      city('长沙市', {
        winter: ['2026-02-01', '2026-03-03'],
        summer: { start: '2026-07-12', end: '2026-08-29', note: '普通中小学、职校' },
        spring: NULL_SEASON('2027年春假为4月2日、4月6日（2026年春假以正式校历为准）'),
        autumn: AB(
          '2026-11-12',
          '2026-11-16',
          '2026年秋假为11月12、13、16日三天，与周末衔接',
        ),
        source: 'https://www.chinanews.com/sh/2026/10-24/10720330.shtml',
        updatedAt: '2026-11-09',
        illustrative: false,
      }),
      ...['株洲市', '衡阳市', '岳阳市', '常德市'].map((n) => {
        const hnAutumn = {
          株洲市: AB('2026-11-16', '2026-11-18', '2026年秋假1—9年级，与周末连休共5天'),
          衡阳市: AB('2026-11-11', '2026-11-13', '2026年义务教育秋假，与周末连休共5天'),
          岳阳市: AB('2026-11-18', '2026-11-20', '2026年秋假，与周末衔接'),
          常德市: NULL_SEASON('2026年秋假以市教育局公布为准（湖南多市已实行）'),
        }
        return fromTemplate(n, {
          winter: ['2026-02-01', '2026-03-03'],
          summer: { start: '2026-07-12', end: '2026-08-29', note: '义务教育' },
          spring: NULL_SEASON('以市州校历为准'),
          autumn: hnAutumn[n] ?? NULL_SEASON('以市州校历为准'),
          source: 'https://www.chinanews.com/sh/2026/10-24/10720330.shtml',
          updatedAt: '2026-11-09',
          illustrative: n === '常德市',
        })
      }),
    ],
  },
  {
    code: 'GD',
    name: '广东',
    mapName: '广东省',
    svgName: 'Guangdong',
    cities: [
      city('广州市', {
        winter: ['2026-01-31', '2026-03-02'],
        summer: summerJul11,
        spring: NULL_SEASON('鼓励有条件的区探索春假，非全市统一'),
        autumn: NULL_SEASON('部分地区探索中'),
        source: 'https://www.gz.gov.cn/zfjg/gzsjyj/tzgg/content/post_10330220.html',
        updatedAt: '2025-06-27',
        illustrative: false,
      }),
      city('深圳市', {
        winter: ['2026-01-31', '2026-03-02'],
        summer: summerJul11,
        spring: NULL_SEASON('2027年春假4月1—2日（2026年春假以市通知为准）'),
        autumn: AB('2026-11-17', '2026-11-20', '2026年全市义务教育阶段统一秋假4天'),
        source: 'https://www.chinanews.com.cn/edu/2026/10-10/10709987.shtml',
        updatedAt: '2026-11-09',
        illustrative: false,
      }),
      city('佛山市', {
        winter: ['2026-01-31', '2026-03-02'],
        summer: summerJul11,
        spring: NULL_SEASON('春秋假试点'),
        autumn: AB('2026-11-11', '2026-11-13', '2026年义务教育秋假，与周末连休共5天'),
        source: 'https://www.chinanews.com/sh/2026/10-24/10720330.shtml',
        updatedAt: '2026-11-09',
        illustrative: false,
      }),
      city('东莞市', {
        winter: ['2026-01-31', '2026-03-02'],
        summer: summerJul11,
        spring: NULL_SEASON('以市校历为准'),
        autumn: NULL_SEASON('探索中'),
        source: 'https://static.nfnews.com/content/202510/24/c11845344.html',
        updatedAt: '2025-10-24',
        illustrative: true,
      }),
      city('惠州市', {
        winter: ['2026-01-31', '2026-03-02'],
        summer: { start: '2026-07-04', end: null, note: '义务教育' },
        spring: NULL_SEASON('以市校历为准'),
        autumn: NULL_SEASON('探索中'),
        source: 'https://static.nfnews.com/content/202510/24/c11845344.html',
        updatedAt: '2025-10-24',
        illustrative: true,
      }),
    ],
  },
  {
    code: 'GX',
    name: '广西',
    mapName: '广西壮族自治区',
    svgName: 'Guangxi Zhuang',
    cities: (() => {
      const tpl = {
        winter: ['2026-01-31', '2026-03-02'],
        summer: summerJul11,
        spring: NULL_SEASON('以市通知为准'),
        autumn: NULL_SEASON('以市通知为准'),
        source: 'https://static.nfnews.com/content/202508/16/c11628864.html',
        updatedAt: '2025-08-16',
        illustrative: true,
      }
      return ['南宁市', '柳州市', '桂林市', '玉林市', '百色市'].map((n) => fromTemplate(n, tpl))
    })(),
  },
  {
    code: 'HI',
    name: '海南',
    mapName: '海南省',
    svgName: 'Hainan',
    cities: [
      city('海口市', {
        winter: ['2026-01-17', '2026-03-02'],
        summer: summerJul11,
        spring: NULL_SEASON('消费促进方案提及探索，无统一日期'),
        autumn: AB('2026-11-18', '2026-11-22', '2026年秋假连休5天（市县差异大，以本市通知为准）'),
        source: 'http://news.hainan.net/edu/2026/01/06/4800867.shtml',
        updatedAt: '2026-11-09',
        illustrative: true,
      }),
      ...['三亚市', '儋州市', '琼海市', '文昌市'].map((n) =>
        fromTemplate(n, {
          winter: ['2026-01-17', '2026-03-02'],
          summer: summerJul11,
          spring: NULL_SEASON('参照省全日制中小学校历'),
          autumn: NULL_SEASON('探索中'),
          source: 'http://news.hainan.net/edu/2026/01/06/4800867.shtml',
          updatedAt: '2026-01-06',
          illustrative: true,
        }),
      ),
    ],
  },
  {
    code: 'CQ',
    name: '重庆',
    mapName: '重庆市',
    svgName: 'Chongqing',
    cities: [
      city('重庆市', {
        winter: ['2026-01-31', '2026-03-04'],
        summer: { start: '2026-07-02', end: null, note: '义务教育；高中 7 月 9 日起' },
        spring: NULL_SEASON('2026年起探索春秋假，春假由区县确定'),
        autumn: NULL_SEASON('2026年起探索春秋假，11月每次2—3天，区县/学校确定具体日期'),
        source: 'https://jw.cq.gov.cn/zwxx_209/gggs/202506/t20250625_14744176.html',
        updatedAt: '2026-11-09',
        illustrative: true,
      }),
    ],
  },
  {
    code: 'SC',
    name: '四川',
    mapName: '四川省',
    svgName: 'Sichuan',
    cities: [
      city('成都市', {
        winter: ['2026-01-31', '2026-03-02'],
        summer: summerJul4,
        spring: NULL_SEASON('市级以省框架执行为主'),
        autumn: NULL_SEASON('2026年秋假3天，由各区（市）县在11月第二周后确定并与周末连休'),
        source: 'https://cbgc.scol.com.cn/news/7953501',
        updatedAt: '2026-11-09',
        illustrative: true,
      }),
      ...['绵阳市', '南充市', '宜宾市', '泸州市', '德阳市'].map((n) => {
        const scAutumn = {
          绵阳市: AB('2026-11-18', '2026-11-20', '2026年秋假第三周后3天，与周末连休共5天'),
          南充市: AB('2026-11-04', '2026-11-06', '2026年秋假3天，高三毕业年级除外'),
          宜宾市: AB('2026-11-18', '2026-11-20', '中心城区第一批11月18—20日；部分县市11月23—25日'),
          泸州市: AB('2026-11-11', '2026-11-13', '2026年幼儿园、一至八年级秋假，与周末连休共5天'),
          德阳市: NULL_SEASON('2026年分两批：11月18—20日或11月25—27日，按属地确定'),
        }
        return fromTemplate(n, {
          winter: ['2026-01-31', '2026-03-02'],
          summer: n === '泸州市' ? { start: '2026-07-05', end: null, note: '义务教育' } : summerJul4,
          spring: NULL_SEASON('以市州校历为准'),
          autumn: scAutumn[n] ?? NULL_SEASON('以市州校历为准'),
          source: 'https://cbgc.scol.com.cn/news/7953501',
          updatedAt: '2026-11-09',
          illustrative: n === '德阳市',
        })
      }),
    ],
  },
  {
    code: 'GZ',
    name: '贵州',
    mapName: '贵州省',
    svgName: 'Guizhou',
    cities: [
      city('贵阳市', {
        winter: ['2026-01-24', '2026-03-02'],
        summer: summerJul11,
        spring: NULL_SEASON('省级方案探索中，市县不一'),
        autumn: NULL_SEASON('省级指导意见：2026年秋假原则上3天，11月中旬由市县确定'),
        source: 'https://www.gywb.cn/pages/web/2025/06/12/afff65f17c4f4f57bb67a376de278153.html',
        updatedAt: '2026-11-09',
        illustrative: true,
      }),
      ...['遵义市', '六盘水市', '毕节市', '黔东南苗族侗族自治州'].map((n) =>
        fromTemplate(n, {
          winter: ['2026-01-24', '2026-03-02'],
          summer: summerJul11,
          spring: NULL_SEASON('以市州校历为准'),
          autumn: NULL_SEASON('2026年秋假原则上11月中旬3天，以市州通知为准'),
          source: 'https://www.gywb.cn/pages/web/2025/06/12/afff65f17c4f4f57bb67a376de278153.html',
          updatedAt: '2025-06-12',
          illustrative: true,
        }),
      ),
    ],
  },
  {
    code: 'YN',
    name: '云南',
    mapName: '云南省',
    svgName: 'Yunnan',
    cities: (() => {
      const tpl = {
        winter: ['2026-01-17', '2026-03-02'],
        summer: summerJul11,
        spring: NULL_SEASON('以州市校历为准'),
        autumn: NULL_SEASON('以州市校历为准'),
        source: 'https://static.nfnews.com/content/202508/16/c11628864.html',
        updatedAt: '2025-08-16',
        illustrative: true,
      }
      return ['昆明市', '曲靖市', '大理白族自治州', '红河哈尼族彝族自治州', '玉溪市'].map((n) =>
        fromTemplate(n, tpl),
      )
    })(),
  },
  {
    code: 'XZ',
    name: '西藏',
    mapName: '西藏自治区',
    svgName: 'Xizang (Tibet) ',
    cities: (() => {
      const tpl = {
        winter: ['2026-01-15', '2026-03-05'],
        summer: { start: '2026-07-15', end: '2026-08-31', note: '义务教育；高原地区以地市通知为准' },
        spring: NULL_SEASON('以地市通知为准'),
        autumn: NULL_SEASON('以地市通知为准'),
        source: 'https://static.nfnews.com/content/202508/16/c11628864.html',
        updatedAt: '2025-08-16',
        illustrative: true,
        winterNote: '演示数据，请核对自治区教育厅/地市通知',
      }
      return ['拉萨市', '日喀则市', '林芝市', '昌都市', '山南市'].map((n) => fromTemplate(n, tpl))
    })(),
  },
  {
    code: 'SN',
    name: '陕西',
    mapName: '陕西省',
    svgName: 'Shaanxi',
    cities: [
      city('西安市', {
        winter: ['2026-02-02', '2026-03-05'],
        summer: { start: '2026-07-15', end: null, note: '7 月中旬前后' },
        spring: NULL_SEASON('汉中等地有试点报道，西安暂无统一春假'),
        autumn: NULL_SEASON('部分地市探索中'),
        source: 'https://static.nfnews.com/content/202508/16/c11628864.html',
        updatedAt: '2025-08-16',
        illustrative: true,
      }),
      city('榆林市', {
        winter: ['2026-01-17', '2026-03-02'],
        summer: { start: '2026-07-05', end: '2026-08-31', note: '义务教育' },
        spring: NULL_SEASON('以市通知为准'),
        autumn: NULL_SEASON('以市通知为准'),
        source: 'https://news.qq.com/rain/a/20250531A03NDX00',
        updatedAt: '2025-05-31',
        illustrative: false,
      }),
      city('汉中市', {
        winter: ['2026-02-02', '2026-03-04'],
        summer: summerJul4,
        spring: NULL_SEASON('有春秋假试点报道'),
        autumn: NULL_SEASON('探索中'),
        source: 'https://xa.bendibao.com/edu/jiaoyuzixun/list16.htm',
        updatedAt: '2026-01-04',
        illustrative: true,
      }),
      ...['咸阳市', '宝鸡市'].map((n) =>
        fromTemplate(n, {
          winter: ['2026-02-02', '2026-03-05'],
          summer: { start: '2026-07-08', end: null, note: '义务教育' },
          spring: NULL_SEASON('以市通知为准'),
          autumn: NULL_SEASON('以市通知为准'),
          source: 'https://static.nfnews.com/content/202508/16/c11628864.html',
          updatedAt: '2025-08-16',
          illustrative: true,
        }),
      ),
    ],
  },
  {
    code: 'GS',
    name: '甘肃',
    mapName: '甘肃省',
    svgName: 'Gansu',
    cities: (() => {
      const tpl = {
        winter: ['2026-01-20', '2026-03-02'],
        summer: { start: '2026-07-15', end: '2026-08-31', note: '义务教育' },
        spring: NULL_SEASON('以市州校历为准'),
        autumn: NULL_SEASON('以市州校历为准'),
        source: 'https://static.nfnews.com/content/202508/16/c11628864.html',
        updatedAt: '2025-08-16',
        illustrative: true,
      }
      return ['兰州市', '天水市', '酒泉市', '张掖市', '武威市'].map((n) => fromTemplate(n, tpl))
    })(),
  },
  {
    code: 'QH',
    name: '青海',
    mapName: '青海省',
    svgName: 'Quinghai',
    cities: (() => {
      const tpl = {
        winter: ['2026-01-15', '2026-03-02'],
        summer: { start: '2026-07-15', end: '2026-08-31', note: '义务教育' },
        spring: NULL_SEASON('以市州校历为准'),
        autumn: NULL_SEASON('以市州校历为准'),
        source: 'https://static.nfnews.com/content/202508/16/c11628864.html',
        updatedAt: '2025-08-16',
        illustrative: true,
      }
      return ['西宁市', '海东市', '海西蒙古族藏族自治州', '玉树藏族自治州', '格尔木市'].map((n) =>
        fromTemplate(n, tpl),
      )
    })(),
  },
  {
    code: 'NX',
    name: '宁夏',
    mapName: '宁夏回族自治区',
    svgName: 'Ningxia Hui',
    cities: (() => {
      const tpl = {
        winter: ['2026-01-20', '2026-03-02'],
        summer: { start: '2026-07-10', end: '2026-08-31', note: '义务教育' },
        spring: NULL_SEASON('以市通知为准'),
        autumn: NULL_SEASON('以市通知为准'),
        source: 'https://static.nfnews.com/content/202508/16/c11628864.html',
        updatedAt: '2025-08-16',
        illustrative: true,
      }
      return ['银川市', '石嘴山市', '吴忠市', '固原市', '中卫市'].map((n) => fromTemplate(n, tpl))
    })(),
  },
  {
    code: 'XJ',
    name: '新疆',
    mapName: '新疆维吾尔自治区',
    svgName: 'Xinjiang Uygur',
    cities: (() => {
      const tpl = {
        winter: ['2026-01-10', '2026-03-01'],
        summer: { start: '2026-07-01', end: '2026-08-31', note: '义务教育' },
        spring: NULL_SEASON('以地州市校历为准'),
        autumn: NULL_SEASON('以地州市校历为准'),
        source: 'https://static.nfnews.com/content/202508/16/c11628864.html',
        updatedAt: '2025-08-16',
        illustrative: true,
        winterNote: '南北疆差异大，以地州市教育局通知为准',
      }
      return ['乌鲁木齐市', '喀什地区', '伊犁哈萨克自治州', '昌吉回族自治州', '克拉玛依市'].map((n) =>
        fromTemplate(n, tpl),
      )
    })(),
  },
  {
    code: 'HK',
    name: '香港',
    mapName: '香港特别行政区',
    svgName: 'Hong Kong',
    cities: [
      city('香港', {
        winter: [null, null],
        summer: { start: '2026-07-10', end: '2026-08-31', note: '中小學暑假大致區間（以教育局學年曆為準）' },
        spring: NULL_SEASON('本地學年分段與內地「春假」制度不同'),
        autumn: NULL_SEASON('以教育局學年曆及學校公布為準'),
        source: 'https://www.edb.gov.hk/',
        updatedAt: '2025-09-01',
        illustrative: true,
        winterNote: 'Christmas/New Year 及農曆新年假期分段安排，請查教育局學年曆',
      }),
    ],
  },
  {
    code: 'MO',
    name: '澳门',
    mapName: '澳门特别行政区',
    svgName: 'Macau',
    cities: [
      city('澳门', {
        winter: [null, null],
        summer: { start: '2026-07-15', end: '2026-08-31', note: '非高等教育階段暑假大致區間' },
        spring: NULL_SEASON('本地學制與內地「春假」不同'),
        autumn: NULL_SEASON('以教青局及學校校曆為準'),
        source: 'https://www.dsedj.gov.mo/',
        updatedAt: '2025-09-01',
        illustrative: true,
        winterNote: '農曆新年等法定假期分段，請查教青局校曆',
      }),
    ],
  },
]

const dataset = {
  meta: {
    schoolYear: '2025—2026',
    datasetUpdatedAt: '2026-11-09',
    disclaimer:
      '默认展示义务教育（小学、初中）区间；高三、初三等年级安排可能不同，请以各地教育局正式校历为准。部分西部/外省城市在无市级原文时沿用媒体汇总或省级框架，并标注 illustrative。',
  },
  provinces,
}

writeFileSync(outPath, `${JSON.stringify(dataset, null, 2)}\n`, 'utf8')

const cityCount = provinces.reduce((n, p) => n + p.cities.length, 0)
console.log(`Wrote ${provinces.length} provinces, ${cityCount} cities → ${outPath}`)
