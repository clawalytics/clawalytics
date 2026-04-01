# Clawalytics CN

面向 OpenClaw / Claude Code 用户的成本分析仪表盘，现在支持作为 Windows 桌面应用分发。

它可以帮你把词元消耗、成本趋势、会话记录、Agent 使用情况和安全监控集中到一个界面里查看，更适合长期盯运营数据和日常使用。

## 你可以拿它做什么

- 查看总成本、月度成本、日成本和词元分布
- 跟踪 OpenClaw 多个 Agent 的消耗和趋势
- 分析不同渠道、不同模型的成本占比
- 查看最近会话、历史会话和安全事件
- 在 Windows 桌面端接收 OpenClaw 词元/成本更新通知

## Windows 桌面版

现在仓库已经提供可安装的 Windows 桌面版本。

- Release 页面: https://github.com/xinmo114514/clawalytics-cn/releases
- 当前 Windows 安装包命名规则: `Clawalytics-版本-win-x64-setup.exe`
- 安装完成后会像普通软件一样出现在开始菜单和桌面快捷方式中

### 桌面版特性

- Win11 风格窗口壳和更现代的标题栏
- 支持开机自启，并可选择“启动后直接打开主窗口”或“静默启动到托盘”
- 关闭按钮支持弹出选择:
  - 最小化到托盘
  - 退出应用
  - 取消
- 支持记住关闭时的选择
- 托盘菜单可重新打开窗口，也可以重置为“下次关闭时再次询问”
- 托盘里的 `Quit` 会真正退出程序，不会继续驻留后台
- 当 OpenClaw 词元/成本更新时，会触发原生 Windows 通知

### 安装与使用说明

- `Clawalytics-<version>-win-x64-setup.exe`
  - 推荐普通用户使用
  - 安装后会自动创建开始菜单和桌面快捷方式
- `Clawalytics-<version>-win-x64-portable.exe`
  - 适合免安装、临时使用或放到 U 盘中运行
  - 不会走完整安装流程
- 安装完成后，第一次打开应用，建议先在右上角设置里确认:
  - OpenClaw 数据目录
  - Gateway 日志目录
  - 是否开启开机自启
  - 开机后显示主窗口，还是直接驻留托盘
  - 点击关闭按钮时是询问、最小化到托盘，还是直接退出

## Web / CLI 方式

如果你更习惯命令行，也可以继续按原来的方式运行：

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 生产构建
pnpm build

# 启动服务
pnpm start
```

默认启动后，页面会运行在：

```text
http://localhost:9174
```

## 从源码构建 Windows 安装包

```bash
pnpm install
pnpm build:desktop
```

构建完成后，产物默认在：

```text
release/Clawalytics-<version>-win-x64-setup.exe
release/Clawalytics-<version>-win-x64-portable.exe
release/win-unpacked/Clawalytics.exe
```

## 主要功能

### 成本与词元分析

- 生命周期、月度、周、日成本统计
- 输入/输出/缓存读写词元拆分
- 缓存节省成本统计
- 模型使用分布和 30 天趋势图

### OpenClaw Agent 分析

- 多 Agent 成本追踪
- 单 Agent 详情查看
- 每日趋势和词元分布
- 会话与请求聚合统计

### 安全与监控

- 已配对设备列表
- 待处理配对请求
- 安全告警
- 连接事件和审计日志

## 配置

配置文件默认位于：

```text
~/.clawalytics/config.yaml
```

常见配置项包括：

- OpenClaw 数据路径
- Gateway 日志路径
- 安全告警开关
- 价格接口地址

## 项目结构

```text
src/
  client/       React 前端
  server/       Express 后端
electron/       Electron 桌面主进程
scripts/        构建与发布辅助脚本
dist/           编译输出
release/        Windows 打包产物
```

## 技术栈

- 前端: React 19, TanStack Router, TanStack Query, Tailwind CSS
- 后端: Express, better-sqlite3, WebSocket
- 桌面端: Electron
- 构建: Vite, TypeScript, electron-builder

## License

MIT
