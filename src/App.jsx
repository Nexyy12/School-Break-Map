import { useCallback, useEffect, useMemo, useState } from 'react'
import DetailPanel from './components/DetailPanel'
import ProvinceList from './components/ProvinceList'
import BreakHeatmap from './components/BreakHeatmap'
import DateBreakCityList from './components/DateBreakCityList'
import './App.css'

const YEAR_OPTIONS = [2025, 2026]

export default function App() {
  const [year, setYear] = useState(2026)
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [selectedCode, setSelectedCode] = useState(null)
  const [loading, setLoading] = useState(true)
  const [heatmapBreakKey, setHeatmapBreakKey] = useState('autumn')
  const [selectedHeatmapDate, setSelectedHeatmapDate] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetch(`/data/school-breaks-${year}.json`)
      .then((res) => {
        if (!res.ok) throw new Error(`无法加载 ${year} 年数据（${res.status}）`)
        return res.json()
      })
      .then((json) => {
        if (cancelled) return
        setData(json)
        setSelectedCode(json.provinces[0]?.code ?? null)
        setSelectedHeatmapDate(null)
        setLoading(false)
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message)
          setData(null)
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [year])

  const selectedProvince = useMemo(() => {
    if (!data) return null
    return data.provinces.find((p) => p.code === selectedCode) ?? null
  }, [data, selectedCode])

  const handleSelect = useCallback((code) => {
    setSelectedCode(code)
  }, [])

  const handleBreakKeyChange = useCallback((key) => {
    setHeatmapBreakKey(key)
    setSelectedHeatmapDate(null)
  }, [])

  const handleYearChange = useCallback((nextYear) => {
    setYear(nextYear)
    setSelectedHeatmapDate(null)
  }, [])

  if (loading) {
    return (
      <div className="app app--loading">
        <p>正在加载校历数据…</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="app app--error">
        <p>加载失败：{error ?? '未知错误'}</p>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header__inner">
          <div className="app-header__row">
            <div>
              <h1 className="app-title">中国学期假期地图</h1>
              <p className="app-subtitle">
                {data.meta.schoolYear} 学年 · 数据更新于{' '}
                {data.meta.datasetUpdatedAt}
              </p>
            </div>
            <YearPicker year={year} onChange={handleYearChange} />
          </div>
        </div>
      </header>
      <main className="app-main">
        <div className="app-main__heatmap">
          <BreakHeatmap
            provinces={data.provinces}
            breakKey={heatmapBreakKey}
            onBreakKeyChange={handleBreakKeyChange}
            selectedDate={selectedHeatmapDate}
            onSelectDate={setSelectedHeatmapDate}
          />
        </div>
        <div className="app-main__body">
          <ProvinceList
            provinces={data.provinces}
            selectedCode={selectedCode}
            onSelect={handleSelect}
          />
          <div className="content-column content-column--detail">
            {selectedHeatmapDate ? (
              <DateBreakCityList
                provinces={data.provinces}
                breakKey={heatmapBreakKey}
                selectedDate={selectedHeatmapDate}
                provinceCode={selectedCode}
                provinceName={selectedProvince?.name}
              />
            ) : (
              <DetailPanel province={selectedProvince} meta={data.meta} />
            )}
          </div>
        </div>
      </main>
      <footer className="app-footer">
        <p>
          本演示数据标注来源链接；春秋假试点政策仍在扩散，开学季请核对教育厅最新通知。
        </p>
      </footer>
    </div>
  )
}

function YearPicker({ year, onChange }) {
  return (
    <div className="year-picker" role="radiogroup" aria-label="选择学年数据年份">
      {YEAR_OPTIONS.map((y) => (
        <label key={y} className="year-picker__option">
          <input
            type="radio"
            name="data-year"
            value={y}
            checked={year === y}
            onChange={() => onChange(y)}
          />
          <span>{y}</span>
        </label>
      ))}
    </div>
  )
}
