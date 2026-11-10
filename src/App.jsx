import { useCallback, useEffect, useMemo, useState } from 'react'
import ChinaMap from './components/ChinaMap'
import DetailPanel from './components/DetailPanel'
import ProvinceList from './components/ProvinceList'
import BreakHeatmap from './components/BreakHeatmap'
import './App.css'

export default function App() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [selectedCode, setSelectedCode] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetch('/data/school-breaks.json')
      .then((res) => {
        if (!res.ok) throw new Error(`无法加载数据（${res.status}）`)
        return res.json()
      })
      .then((json) => {
        if (cancelled) return
        setData(json)
        setSelectedCode(json.provinces[0]?.code ?? null)
        setLoading(false)
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message)
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  const selectedProvince = useMemo(() => {
    if (!data) return null
    return data.provinces.find((p) => p.code === selectedCode) ?? null
  }, [data, selectedCode])

  const handleSelect = useCallback((code) => {
    setSelectedCode(code)
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
          <h1 className="app-title">中国学期假期地图</h1>
          <p className="app-subtitle">
            {data.meta.schoolYear} 学年 · 数据更新于 {data.meta.datasetUpdatedAt}
          </p>
        </div>
      </header>
      <main className="app-main">
        <div className="app-main__heatmap">
          <BreakHeatmap provinces={data.provinces} />
        </div>
        <div className="app-main__body">
          <ProvinceList
            provinces={data.provinces}
            selectedCode={selectedCode}
            onSelect={handleSelect}
          />
          <div className="content-column">
            <section className="map-section" aria-label="中国地图">
              <ChinaMap
                provinces={data.provinces}
                selectedCode={selectedCode}
                onSelect={handleSelect}
              />
            </section>
            <DetailPanel province={selectedProvince} meta={data.meta} />
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
