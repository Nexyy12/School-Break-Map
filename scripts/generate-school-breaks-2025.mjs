/**
 * Derives public/data/school-breaks-2025.json from school-breaks-2026.json.
 * Shifts calendar seasons for 2024—2025 学年; applies researched overrides where available.
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

function shiftIso(iso, yearDelta) {
  if (!iso || typeof iso !== 'string') return iso
  const [y, m, d] = iso.split('-').map(Number)
  return `${y + yearDelta}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

/** All seasons use −1y so the 2025 dataset heatmap stays in the 2025 calendar bucket. */
function shiftBreakDates(br) {
  if (!br) return br
  return {
    ...br,
    start: br.start ? shiftIso(br.start, -1) : br.start,
    end: br.end ? shiftIso(br.end, -1) : br.end,
  }
}

/**
 * Province-level patches (province code → breaks + metadata).
 * Applied before per-city overrides; cities may still override winter/summer.
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
      start: '2024-09-28',
      end: '2024-09-30',
      note:
        '主城区2024年秋假（属2024—2025学年第一学期）；在「2025」年视图仍显示该历史公布日期',
    },
    spring: {
      start: '2025-04-04',
      end: '2025-04-06',
      note: '春秋假制度（区县可微调，2025年春假以区县通知为准）',
    },
    winter: { start: '2025-01-22', end: '2025-02-12', note: '义务教育' },
    summer: { start: '2025-07-04', end: null, note: '结束日待秋季校历' },
    source: 'https://www.hzzx.gov.cn/cshz/content/2024-09/04/content_8782808_0.htm',
    updatedAt: '2024-09-04',
    illustrative: false,
  },
  宁波市: {
    winter: { start: '2025-01-22', end: '2025-02-12', note: '义务教育' },
    summer: { start: '2025-07-05', end: '2025-08-31', note: '义务教育' },
    source: 'http://news.cnnb.com.cn/system/2024/06/17/030593478.shtml',
    updatedAt: '2024-06-17',
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
        '2024年全市义务教育阶段秋假试点（属2024—2025学年）；2025年视图保留已公布日期',
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

/** Drop illustrative autumn dates that fall before CALENDAR_YEAR (auto-shift artefacts). */
function sanitizeAutumnForCalendarYear(city) {
  const a = city.breaks?.autumn
  if (!a?.start) return city
  const y = Number(a.start.slice(0, 4))
  if (y >= CALENDAR_YEAR) return city
  if (city.illustrative === false) return city
  return mergeBreakPatch(city, {
    autumn: {
      start: null,
      end: null,
      note: '2025年视图不展示由2026数据偏移得到的上一自然年秋季日期；以2024—2025学年本市通知为准',
    },
  })
}

const src = JSON.parse(readFileSync(inPath, 'utf8'))

const provinces = src.provinces.map((province) => ({
  ...province,
  cities: province.cities.map((city) => {
    const shifted = {
      ...city,
      breaks: {
        spring: shiftBreakDates(city.breaks.spring),
        summer: shiftBreakDates(city.breaks.summer),
        autumn: shiftBreakDates(city.breaks.autumn),
        winter: shiftBreakDates(city.breaks.winter),
      },
    }
    let next = applyProvinceOverride(province, shifted)
    next = applyCityOverride(next)
    next = sanitizeAutumnForCalendarYear(next)
    return next
  }),
}))

const dataset = {
  meta: {
    schoolYear: '2024—2025',
    calendarYear: CALENDAR_YEAR,
    datasetUpdatedAt: '2025-11-10',
    disclaimer:
      '默认展示义务教育（小学、初中）区间。无市级原文的城市可能由2026数据集按学年−1年偏移推导并标注illustrative；秋假与「2025」年选择器对齐自然年2025，已核对城市除外（如杭州2024年秋假试点）。江苏省2024—2025学年无全省春秋假。',
    derivedFrom: 'school-breaks-2026.json',
  },
  provinces,
}

writeFileSync(outPath, `${JSON.stringify(dataset, null, 2)}\n`, 'utf8')

const cityCount = provinces.reduce((n, p) => n + p.cities.length, 0)
const js = provinces.find((p) => p.code === 'JS')
const jsAutumn = js?.cities.filter((c) => c.breaks.autumn?.start).length ?? 0
const autumn2024 = provinces.reduce(
  (n, p) =>
    n +
    p.cities.filter((c) => {
      const s = c.breaks.autumn?.start
      return s && s.startsWith('2024')
    }).length,
  0,
)
console.log(
  `Wrote ${provinces.length} provinces, ${cityCount} cities → ${outPath}`,
)
console.log(
  `江苏秋假有日期城市数: ${jsAutumn}（应为0）；全国秋假仍含2024年日期的已核对城市: ${autumn2024}`,
)
