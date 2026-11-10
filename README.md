# 中国学期假期地图（School Break Map）

Vite + React 演示站：按省、市汇总 **2024—2025** 与 **2025—2026** 学年春假、暑假、秋假、寒假起止与说明，数据来自公开校历与政策报道（见 JSON 内 `source` 字段）。页头可切换 **2025 / 2026** 数据年份。

## 本地运行

```bash
npm install
npm run dev
```

浏览器访问终端提示的本地地址（默认 `http://localhost:5173`）。

## 构建

```bash
npm run build
npm run preview
```

## 数据更新

主数据文件：

- [`public/data/school-breaks-2026.json`](public/data/school-breaks-2026.json) — 2025—2026 学年（由 `node scripts/build-school-breaks.mjs` 生成）
- [`public/data/school-breaks-2025.json`](public/data/school-breaks-2025.json) — 2024—2025 学年（由 `node scripts/generate-school-breaks-2025.mjs` 在 2026 基础上偏移并覆盖调研城市）

重新生成：

```bash
node scripts/build-school-breaks.mjs
node scripts/generate-school-breaks-2025.mjs
```

- 省级记录含 `name`、`mapName`（与地图省份全称对应）、`cities` 数组
- 每个城市含四季 `breaks`（`spring` / `summer` / `autumn` / `winter`），字段 `start`、`end`（ISO 日期或 `null`）、`note`；多批次/区县错峰时可加 `ranges`（`{start,end}` 数组）、`uncertain: true`（热力图合并各段并做周末延伸，卡片日期仍可只看 `start`/`end`）
- 务必填写 `source`、`updatedAt`；非一级来源可设 `illustrative: true`

方案与采集策略见项目文档 [school-breaks-plan.md](https://github.com/Nexyy12/School-Break-Map/blob/main/docs/school-breaks-plan.md)（若已同步至仓库）。

## 技术栈

- [Vite](https://vite.dev/) + [React](https://react.dev/)
- 中国省级地图：[`@svg-maps/china`](https://www.npmjs.com/package/@svg-maps/china)
