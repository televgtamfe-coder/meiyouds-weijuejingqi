# demo5 算法联调入口

更新日期：2026-10-29。

## 发布位置

- 沿用 `televgtamfe-coder/meiyouds-weijuejingqi`，不更换原首页或 hash 路由。
- GitHub Pages：`/meiyouds-weijuejingqi/demo5/`。
- 现有 Vercel 项目：`/demo5/`。
- 源码在 `public/demo5/`；Vite 原有构建复制到 `dist/demo5/`；`scripts/build-standalone.js` 再复制到 Pages 使用的 `docs/demo5/`。

## 运行方式与边界

公网版通过固定版本 Pyodide 0.27.7 在浏览器内执行 Python。`python/service.py`、`python/body_age/`、原始输入处理与本地算法版相同，不另写 JavaScript 计算公式。`source-hashes.json` 记录发布时原算法文件摘要。

`browser-runtime.js` 只在 demo5 页面内接管现有 `/api/` 调用，以 `python/browser_bridge.py` 调用原 Session。测试记录通过 sessionStorage 保留在当前标签页，跨页与刷新可恢复，不提供跨设备同步。关闭标签页后不可依赖记录仍然存在；浏览器禁用或耗尽存储时有提示。日期按浏览器本地日期更新。

Python运行环境已随站点发布在vendor/pyodide，首次下载约14 MB；加载等待上限45秒，失败时更新记录区状态并允许重试。无需访问第三方CDN，不显示伪造计算结果。仅供模拟联调，不填写真实个人健康信息。评分、年龄规则缺失阻断和 `can_publish=false` 均保留。

泌尿生殖困扰选4～6分自动追问；支持多选、互斥的“没有明显困扰”、保存及回填；不重复扣分。睡眠追问保持原行为。

## 验证与发布

1. `npm ci`，`npm run build`，`node scripts/build-standalone.js`。
2. `python -m unittest discover -s tests/demo5`。
3. 运行 `tests/demo5/browser_smoke.py`，通过 `DEMO5_URL` 指定本地或公网完整 demo5 目录地址。浏览器测试需要安装 Playwright 及 Chromium。
4. 推送原仓库 main，等待既有 Deploy GitHub Pages 工作流成功，并实测 Pages 的 demo5 与原 scene1 入口。
5. 用户明确要求时才更新已有 Vercel 项目。不得新建项目，须先确认 `.vercel/project.json` 指向原项目。

浏览器测试覆盖七个合成场景与 Python 输出一致、百分制评分、睡眠及泌尿弹窗、跨页回填、模拟不改原记录、非法输入、版本冲突、手机宽度、零网络 API 请求。工程验证不代表医学有效性验证。

## 回退

回退本次新增的 `public/demo5/` 和构建脚本中对应复制语句，再执行原发布流程即可。无需改变原站点路由、仓库名称或部署项目。

Pages发布来源必须设为GitHub Actions（build_type=workflow），不得同时从main/docs旧路径发布，否则会覆盖工作流产物导致demo5出现404。
