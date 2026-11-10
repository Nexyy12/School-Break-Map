/**
 * Generates public/data/school-breaks-2025.json — 2024—2025 学年.
 * Uses school-breaks-2026.json only for province/city coverage; winter/summer dates
 * may be −1y shifted from 2026 where no override exists. Spring/autumn are NEVER
 * copied or shifted from 2026; only explicit CITY_OVERRIDES / PROVINCE_OVERRIDES.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const inPath = join(root, 'public/data/school-breaks-2026.json')
const outPath = join(root, 'public/data/school-breaks-2025.json')

const CALENDAR_YEAR = 2025
const NO_SPRING_AUTUMN_JS =
  '江苏省在2024—2025学年无全省统一春秋假制度；2026年秋季学期起全省推行义务教育秋假（见2026年数据集）'
const NO_SPRING_2025 =
  '2024—2025学年未查到本市义务教育统一春假日期公布（以教育局校历为准）'
const NO_AUTUMN_2025 =
  '2024—2025学年未查到本市义务教育统一秋假日期公布（以教育局校历为准）'
const NO_SD_SPRING_AUTUMN =
  '山东省2024—2025学年未全省推行义务教育春秋假；部分地市自2026年春季学期起安排春秋假（见2026年数据集）'

const NULL_SPRING = { start: null, end: null, note: NO_SPRING_2025 }
const NULL_AUTUMN = { start: null, end: null, note: NO_AUTUMN_2025 }

const ZJ_AUTUMN_XINHUA =
  'https://www.news.cn/edu/20251011/a7617103990d48f6917c437401f01a79/c.html'

function shiftIso(iso, yearDelta) {
  if (!iso || typeof iso !== 'string') return iso
  const [y, m, d] = iso.split('-').map(Number)
  return `${y + yearDelta}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

function shiftRanges(ranges, yearDelta) {
  if (!ranges?.length) return ranges
  return ranges.map((r) => ({
    start: r.start ? shiftIso(r.start, yearDelta) : r.start,
    end: r.end ? shiftIso(r.end, yearDelta) : r.end,
  }))
}

function shiftBreakDates(br) {
  if (!br) return br
  return {
    ...br,
    start: br.start ? shiftIso(br.start, -1) : br.start,
    end: br.end ? shiftIso(br.end, -1) : br.end,
    ranges: shiftRanges(br.ranges, -1),
  }
}

/**
 * Province-level patches (province code → breaks + metadata).
 */
const PROVINCE_OVERRIDES = {
  JS: {
    spring: { start: null, end: null, note: NO_SPRING_AUTUMN_JS },
    autumn: { start: null, end: null, note: NO_SPRING_AUTUMN_JS },
    winter: {
      start: '2025-01-18',
      end: '2025-02-12',
      note: '义务教育（省教育厅办公室寒假通知，全省统一）',
    },
    summer: {
      start: '2025-07-01',
      end: null,
      note: '全省拟于2025年6月30日学期结束，7月1日起暑假',
    },
    source:
      'https://jyt.jiangsu.gov.cn/art/2024/12/30/art_58320_11459254.html',
    updatedAt: '2024-12-30',
    illustrative: false,
  },
  SD: {
    spring: { start: null, end: null, note: NO_SD_SPRING_AUTUMN },
    autumn: { start: null, end: null, note: NO_SD_SPRING_AUTUMN },
    illustrative: true,
  },
}

/** Researched 2024—2025 overrides: city name → partial breaks patch */
const CITY_OVERRIDES = {
  北京市: {
    winter: {
      start: '2025-01-12',
      end: '2025-02-16',
      note: '义务教育（京教办〔2024〕8号）',
    },
    summer: {
      start: '2025-07-07',
      end: '2025-08-31',
      note: '义务教育',
    },
    spring: { start: null, end: null, note: '暂无全省统一春假制度' },
    autumn: { start: null, end: null, note: '暂无全省统一秋假制度' },
    source:
      'https://jw.beijing.gov.cn/xxgk/2024zcwj/2024qtwj/202404/t20240408_3611941.html',
    updatedAt: '2024-03-15',
    illustrative: false,
  },
  上海市: {
    winter: { start: '2025-01-23', end: '2025-02-22', note: '中小学统一校历（义务教育）' },
    summer: { start: '2025-07-01', end: '2025-08-31', note: '中小学统一校历' },
    source:
      'https://edu.sh.gov.cn/xxgk2_zdgz_jcjy_05/20250418/13e7f8c39763419cb70972d1d409b721.html',
    updatedAt: '2024-04-22',
    illustrative: true,
  },
  杭州市: {
    autumn: {
      start: '2025-09-28',
      end: '2025-09-30',
      note:
        '2025学年主城区秋假3天（9/28—30，可与国庆连休）；桐庐、淳安、建德错峰为11月10—12日',
      uncertain: true,
      ranges: [{ start: '2025-11-10', end: '2025-11-12' }],
    },
    spring: {
      start: '2025-04-04',
      end: '2025-04-06',
      note: '春秋假制度（区县可微调，2025年春假以区县通知为准）',
    },
    winter: { start: '2025-01-22', end: '2025-02-12', note: '义务教育' },
    summer: { start: '2025-07-04', end: null, note: '结束日待秋季校历' },
    source:
      'https://edu.hangzhou.com.cn/xxdt/content/2025-09/04/content_9075958.htm',
    updatedAt: '2025-09-04',
    illustrative: false,
  },
  宁波市: {
    autumn: {
      start: '2025-11-12',
      end: '2025-11-14',
      note: '义务教育秋假3天，与11/15—16周末连休共5天',
    },
    winter: { start: '2025-01-22', end: '2025-02-12', note: '义务教育' },
    summer: { start: '2025-07-05', end: '2025-08-31', note: '义务教育' },
    spring: { start: null, end: null, note: NO_SPRING_2025 },
    source: ZJ_AUTUMN_XINHUA,
    updatedAt: '2025-10-11',
    illustrative: false,
  },
  温州市: {
    autumn: {
      start: '2025-11-17',
      end: '2025-11-19',
      note: '全市县市区统一，义务教育一至九年级（九年级仅秋假）',
    },
    source: 'https://news.66wz.com/system/2025/10/11/105703064.shtml',
    updatedAt: '2025-10-11',
    illustrative: false,
  },
  嘉兴市: {
    autumn: {
      start: '2025-11-12',
      end: '2025-11-14',
      note: '全市义务段秋假3天，与周末连休共5天',
    },
    source: ZJ_AUTUMN_XINHUA,
    updatedAt: '2025-10-11',
    illustrative: false,
  },
  湖州市: {
    autumn: {
      start: '2025-11-12',
      end: '2025-11-14',
      note: '全市区县统一意见，义务段一至九年级（九年级仅秋假）',
    },
    source: 'https://m.thepaper.cn/newsDetail_forward_31754944',
    updatedAt: '2025-10-10',
    illustrative: false,
  },
  绍兴市: {
    autumn: {
      start: '2025-11-17',
      end: '2025-11-19',
      note: '全市6区县（市）义务教育秋假统一安排',
    },
    source: 'http://sx.bendibao.com/edu/20251015/32903.shtm',
    updatedAt: '2025-10-15',
    illustrative: false,
  },
  金华市: {
    autumn: {
      start: '2025-11-21',
      end: '2025-11-25',
      note: '市区3天含周末连休5日；兰溪等县区错峰为11月12—16日',
      uncertain: true,
      ranges: [{ start: '2025-11-12', end: '2025-11-16' }],
    },
    source: ZJ_AUTUMN_XINHUA,
    updatedAt: '2025-10-11',
    illustrative: false,
  },
  衢州市: {
    autumn: {
      start: '2025-11-19',
      end: '2025-11-21',
      note: '义务教育秋假3天，与周末连休共5天',
    },
    source: ZJ_AUTUMN_XINHUA,
    updatedAt: '2025-10-11',
    illustrative: false,
  },
  舟山市: {
    autumn: {
      start: '2025-11-19',
      end: '2025-11-21',
      note: '义务教育秋假暂定3天，与周末连休共5天',
    },
    source: ZJ_AUTUMN_XINHUA,
    updatedAt: '2025-10-11',
    illustrative: false,
  },
  台州市: {
    autumn: {
      start: '2025-11-12',
      end: '2025-11-14',
      note: '各县市区（含椒江、三门等）2025年秋假统一为3天',
    },
    source: ZJ_AUTUMN_XINHUA,
    updatedAt: '2025-10-10',
    illustrative: false,
  },
  丽水市: {
    autumn: {
      start: '2025-11-19',
      end: '2025-11-21',
      note: '市教育局推行春秋假，秋假3天与周末连休共5天',
    },
    source: 'http://zj.people.com.cn/n2/2025/1101/c186327-41398402.html',
    updatedAt: '2025-10-23',
    illustrative: false,
  },
  苏州市: {
    winter: {
      start: '2025-01-20',
      end: '2025-02-16',
      note: '义务教育（苏州2024-2025一学期校历）',
    },
    summer: { start: null, end: null, note: '2025年暑假结束日待各市秋季通知' },
    spring: { start: null, end: null, note: NO_SPRING_AUTUMN_JS },
    autumn: { start: null, end: null, note: NO_SPRING_AUTUMN_JS },
    source: 'http://suzhou.xdf.cn/news/202408/198724012.html',
    updatedAt: '2024-08-19',
    illustrative: true,
  },
  广州市: {
    winter: { start: '2025-01-20', end: '2025-02-16', note: '义务教育' },
    summer: { start: '2025-07-14', end: null, note: '结束日待秋季校历' },
    source: 'https://www.gz.gov.cn/zfjg/gzsjyj/tzgg/content/post_10330220.html',
    updatedAt: '2024-06-27',
    illustrative: true,
  },
  深圳市: {
    winter: { start: '2025-01-20', end: '2025-02-16', note: '义务教育' },
    autumn: {
      start: '2024-11-22',
      end: '2024-11-24',
      note:
        '2024年全市义务教育阶段秋假试点（2024—2025学年）；2025年视图保留已公布日期',
    },
    illustrative: true,
  },
  武汉市: {
    winter: { start: '2025-01-18', end: '2025-02-16', note: '义务教育' },
    summer: { start: '2025-07-05', end: '2025-08-31', note: '义务教育' },
    source: 'http://m.cnhubei.com/content/2025-09/02/content_19468079.html',
    updatedAt: '2024-09-02',
    illustrative: true,
  },
  济南市: {
    winter: {
      start: '2025-01-18',
      end: '2025-02-12',
      note: '义务教育（2024—2025学年度周历）',
    },
    summer: {
      start: '2025-07-05',
      end: '2025-08-31',
      note: '义务教育',
    },
    spring: { start: null, end: null, note: NO_SD_SPRING_AUTUMN },
    autumn: { start: null, end: null, note: NO_SD_SPRING_AUTUMN },
    source:
      'http://jnedu.jinan.gov.cn/attach/0/d9fd2d6491564415b1697c87ae8c49e6.pdf',
    updatedAt: '2024-10-01',
    illustrative: false,
  },
  青岛市: {
    winter: {
      start: '2025-01-15',
      end: '2025-02-12',
      note: '义务教育（2024—2025学年第二学期校历，2月13日报到）',
    },
    summer: {
      start: '2025-07-07',
      end: '2025-08-31',
      note: '义务教育',
    },
    spring: { start: null, end: null, note: NO_SD_SPRING_AUTUMN },
    autumn: { start: null, end: null, note: NO_SD_SPRING_AUTUMN },
    source:
      'http://www.qingdao.gov.cn/zwgk/xxgk/jyj/ywfl/tzgg/202412/t20241211_8683853.shtml',
    updatedAt: '2024-12-11',
    illustrative: false,
  },
  烟台市: {
    winter: {
      start: '2025-01-11',
      end: '2025-02-12',
      note: '义务教育（2024—2025学年寒假通知，2月13日开学）',
    },
    summer: {
      start: '2025-07-14',
      end: '2025-08-31',
      note: '义务教育',
    },
    spring: { start: null, end: null, note: NO_SD_SPRING_AUTUMN },
    autumn: { start: null, end: null, note: NO_SD_SPRING_AUTUMN },
    source: 'https://news.qq.com/rain/a/20241215A01X0100',
    updatedAt: '2024-12-15',
    illustrative: false,
  },
  潍坊市: {
    winter: {
      start: '2025-01-16',
      end: '2025-02-12',
      note: '义务教育（市区2024—2025学年第一学期至1月15日结束）',
    },
    summer: {
      start: '2025-07-07',
      end: '2025-08-31',
      note: '义务教育',
    },
    spring: { start: null, end: null, note: NO_SD_SPRING_AUTUMN },
    autumn: { start: null, end: null, note: NO_SD_SPRING_AUTUMN },
    source: 'https://weifang.dzwww.com/wfxwn/202505/t20250527_15986622.htm',
    updatedAt: '2025-05-27',
    illustrative: false,
  },
  临沂市: {
    winter: {
      start: '2025-01-16',
      end: '2025-02-13',
      note: '义务教育（2024—2025学年，2月14日开学）',
    },
    summer: {
      start: '2025-07-07',
      end: '2025-08-31',
      note: '义务教育',
    },
    spring: { start: null, end: null, note: NO_SD_SPRING_AUTUMN },
    autumn: { start: null, end: null, note: NO_SD_SPRING_AUTUMN },
    source: 'https://meili.lywww.com/info_48407.html',
    updatedAt: '2025-06-10',
    illustrative: false,
  },
}

function mergeBreakPatch(city, patch) {
  const next = { ...city, breaks: { ...city.breaks } }
  if (patch.source) next.source = patch.source
  if (patch.updatedAt) next.updatedAt = patch.updatedAt
  if (typeof patch.illustrative === 'boolean') next.illustrative = patch.illustrative
  for (const season of ['spring', 'summer', 'autumn', 'winter']) {
    if (patch[season]) {
      next.breaks[season] = { ...city.breaks[season], ...patch[season] }
    }
  }
  return next
}

function applyProvinceOverride(province, city) {
  const patch = PROVINCE_OVERRIDES[province.code]
  if (!patch) return city
  return mergeBreakPatch(city, patch)
}

function applyCityOverride(city) {
  const patch = CITY_OVERRIDES[city.name]
  if (!patch) return city
  return mergeBreakPatch(city, patch)
}

/** Remove 2026-source wording; never keep shifted autumn with 2026 notes. */
function scrub2026Contamination(city) {
  let next = { ...city, breaks: { ...city.breaks } }
  const hasOverride = Boolean(CITY_OVERRIDES[city.name])

  for (const season of ['spring', 'autumn', 'summer', 'winter']) {
    const b = next.breaks[season]
    if (!b) continue
    const note = b.note ?? ''
  if (!note.includes('2026') && !note.includes('2026年')) continue

    if (season === 'spring' || season === 'autumn') {
      if (hasOverride && city.illustrative === false && b.start) {
        next.breaks[season] = { ...b, note: note.replace(/2026年/g, '') }
        continue
      }
      next.breaks[season] = {
        start: null,
        end: null,
        note: season === 'autumn' ? NO_AUTUMN_2025 : NO_SPRING_2025,
      }
      continue
    }
    next.breaks[season] = {
      ...b,
      note: note.replace(/2026年[^；。，、]*[；。，、]?/g, '').trim() || b.note.replace(/2026/g, '') || '义务教育',
    }
  }

  if (next.updatedAt?.startsWith('2026') && !hasOverride) {
    next.illustrative = true
  }
  return next
}

const src = JSON.parse(readFileSync(inPath, 'utf8'))

const provinces = src.provinces.map((province) => ({
  ...province,
  cities: province.cities.map((city) => {
    const base = {
      ...city,
      breaks: {
        spring: { ...NULL_SPRING },
        autumn: { ...NULL_AUTUMN },
        summer: shiftBreakDates(city.breaks.summer),
        winter: shiftBreakDates(city.breaks.winter),
      },
    }
    let next = applyProvinceOverride(province, base)
    next = applyCityOverride(next)
    next = scrub2026Contamination(next)
    return next
  }),
}))

const dataset = {
  meta: {
    schoolYear: '2024—2025',
    calendarYear: CALENDAR_YEAR,
    datasetUpdatedAt: '2025-11-10',
    disclaimer:
      '默认展示义务教育（小学、初中）区间。春假、秋假仅收录有出处的 2024—2025 学年公布日期，不从 2026 数据集偏移填充。寒暑假无市级原文时可能由 2026 数据−1 年推导并标注 illustrative。江苏省 2024—2025 学年无全省春秋假；山东省春秋假自 2026 年春季学期起在部分地市推行。',
    derivedFrom: 'school-breaks-2026.json',
  },
  provinces,
}

writeFileSync(outPath, `${JSON.stringify(dataset, null, 2)}\n`, 'utf8')

const cityCount = provinces.reduce((n, p) => n + p.cities.length, 0)
const js = provinces.find((p) => p.code === 'JS')
const jsAutumn = js?.cities.filter((c) => c.breaks.autumn?.start).length ?? 0
const autumnNonNull = provinces.reduce(
  (n, p) => n + p.cities.filter((c) => c.breaks.autumn?.start).length,
  0,
)
const ref2026 = JSON.stringify(dataset).match(/2026/g)?.length ?? 0
const sd = provinces.find((p) => p.code === 'SD')
console.log(
  `Wrote ${provinces.length} provinces, ${cityCount} cities → ${outPath}`,
)
console.log(
  `江苏秋假有日期城市数: ${jsAutumn}（应为0）；全国秋假有日期: ${autumnNonNull}；JSON内「2026」出现次数: ${ref2026}`,
)
if (sd) {
  for (const c of sd.cities) {
    console.log(
      `  山东 ${c.name}: 秋假 ${c.breaks.autumn?.start ?? 'null'}; 冬 ${c.breaks.winter?.start}—${c.breaks.winter?.end}`,
    )
  }
}
