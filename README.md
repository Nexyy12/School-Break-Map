# 中国学期假期地图（School Break Map）

Vite + React 演示站：按省、市汇总 **2025—2026 学年** 春假、暑假、秋假、寒假起止与说明，数据来自公开校历与政策报道（见 JSON 内 `source` 字段）。

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

编辑 [`public/data/school-breaks.json`](public/data/school-breaks.json)：

- 省级记录含 `name`、`mapName`（与地图省份全称对应）、`cities` 数组
- 每个城市含四季 `breaks`（`spring` / `summer` / `autumn` / `winter`），字段 `start`、`end`（ISO 日期或 `null`）、`note`
- 务必填写 `source`、`updatedAt`；非一级来源可设 `illustrative: true`

方案与采集策略见项目文档 [school-breaks-plan.md](https://github.com/Nexyy12/School-Break-Map/blob/main/docs/school-breaks-plan.md)（若已同步至仓库）。

## 技术栈

- [Vite](https://vite.dev/) + [React](https://react.dev/)
- 中国省级地图：[`@svg-maps/china`](https://www.npmjs.com/package/@svg-maps/china)
