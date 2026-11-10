import china from '@svg-maps/china'

export default function ChinaMap({
  provinces,
  selectedCode,
  highlightedCodes,
  onSelect,
}) {
  const bySvgName = new Map(provinces.map((p) => [p.svgName, p]))
  const highlightSet = new Set(highlightedCodes ?? [])

  const resolveProvince = (locationName) => bySvgName.get(locationName)

  const handleLocation = (location) => {
    const prov = resolveProvince(location.name)
    if (prov) onSelect(prov.code)
  }

  return (
    <div className="china-map" role="img" aria-label="中国省级行政区划地图">
      <svg viewBox={china.viewBox} className="china-map__svg">
        {china.locations.map((location) => {
          const prov = resolveProvince(location.name)
          const isSelected = prov && prov.code === selectedCode
          const isOnBreak = prov && highlightSet.has(prov.code)
          const isSeeded = Boolean(prov)

          return (
            <path
              key={location.id}
              d={location.path}
              className={[
                'china-map__region',
                isSeeded ? 'china-map__region--seeded' : '',
                isOnBreak ? 'china-map__region--break-day' : '',
                isSelected ? 'china-map__region--selected' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              tabIndex={isSeeded ? 0 : -1}
              role={isSeeded ? 'button' : undefined}
              aria-label={prov ? prov.name : location.name}
              title={prov ? prov.mapName : undefined}
              onClick={() => isSeeded && handleLocation(location)}
              onKeyDown={(e) => {
                if (isSeeded && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault()
                  handleLocation(location)
                }
              }}
            />
          )
        })}
      </svg>
      <p className="china-map__legend">
        <span className="legend-swatch legend-swatch--seeded" /> 已收录
        <span className="legend-swatch legend-swatch--other" /> 暂未收录
        {highlightedCodes?.length > 0 ? (
          <>
            <span className="legend-swatch legend-swatch--break-day" /> 选中日在假
          </>
        ) : null}
      </p>
    </div>
  )
}
