# ☁️ 云端长截图服务（GitHub Actions 版）

把长截图功能搬到 GitHub 免费云端：**不依赖你的电脑**，随时随地打开网页、输入网址、点一下，GitHub 的云服务器就用 Playwright + Chromium 帮你把整页从头截到尾，存回你的仓库并展示。

---

## 一、它能做什么
- 输入任意网址 → 云端整页长截图（高清，deviceScaleFactor=2）
- 支持 **JPG / PNG / WebP** 三种格式
- 支持 **整页长截图** 与 **仅当前视口** 两种模式
- 可自定义视口宽度和加载等待时间
- 完全跑在 GitHub 云端，免费（2000 分钟/月，单次最长 30 分钟）

## 二、重要说明：关于"24 小时云端运行"
GitHub Actions 是**云端按需触发**的服务，不是"常驻 24 小时的服务器进程"：
- 你点"生成截图" → GitHub 云服务器启动一个临时容器 → 跑 Playwright 截图 → 结束。
- 服务**随时可用**，结果存在你的 GitHub 仓库里，不依赖你的电脑。
- 免费额度 2000 分钟/月；单次任务最长 30 分钟（本工作流已设上限）。

如果你需要**真正 7×24 常驻的 HTTP 接口**（别人能直接调 API 拿到图），那要用 Render / Fly.io / Railway 的免费层跑一个常驻服务——告诉我，我可以另做一版。

---

## 三、部署步骤（一次性）

### 方式 A：一键部署（推荐，最简单）
1. 准备一个 **Classic PAT**（个人访问令牌）：
   - 打开 https://github.com → 头像 → Settings → Developer settings → Personal access tokens → Tokens (classic) → **Generate new token (classic)**
   - 勾选 **`repo`**（全部子项）和 **`workflow`**
   - 生成后复制令牌（只显示一次）
2. 双击本目录下的 **`部署到GitHub.bat`**
3. 按提示输入：GitHub 用户名、PAT
4. 脚本会自动：建仓库 → 推送全部文件 → 开启 GitHub Pages
5. 看到 `🎉 部署完成！` 和网页入口地址即成功

> 你的 PAT 只在本地 `.bat` 里使用，通过 REST API 推送到 GitHub，**不会发给任何第三方**。

### 方式 B：手动部署（懂 git 的用户）
```bash
# 1. 在 GitHub 新建仓库 cloud-screenshot（公开）
# 2. 把本目录所有文件提交并推送：
git init
git add .
git commit -m "init cloud screenshot"
git branch -M main
git remote add origin https://github.com/<你的用户名>/cloud-screenshot.git
git push -u origin main
# 3. 仓库 Settings → Pages → Source 选 main 分支 / 根目录，保存
# 4. Settings → Actions → 确认工作流已启用
```

---

## 四、日常使用流程（部署后每次都这样）
1. 打开网页入口：`https://<你的用户名>.github.io/cloud-screenshot/`
2. **① 连接 GitHub**：填 用户名 / 仓库名(cloud-screenshot) / PAT，点"保存设置"
3. **② 截图设置**：填目标网址（必须带 `http://` 或 `https://`）、选格式(JPG/PNG/WebP)、选模式(整页/视口)、可改宽度与等待
4. 点 **🚀 生成云端截图**
5. 等待约 1~2 分钟（云端安装 Chromium + 截图），下方自动显示结果，点"下载图片"保存

> 也可以在 GitHub 仓库的 **Actions** 标签页手动触发：选 `云端长截图` 工作流 → Run workflow → 填参数 → 运行。

---

## 五、文件说明
| 文件 | 作用 |
|------|------|
| `.github/workflows/screenshot.yml` | GitHub Actions 工作流：触发 → 装 Chromium → 截图 → 提交回仓库 |
| `screenshot.js` | Playwright 截图脚本（被工作流调用） |
| `package.json` | 依赖声明（playwright） |
| `index.html` | GitHub Pages 网页前端（webshot 风格 UI） |
| `.nojekyll` | 关闭 Jekyll，确保静态页正常 |
| `deploy.js` | 一键部署脚本（REST API 推送，无需 git/gh） |
| `部署到GitHub.bat` | Windows 一键部署启动器 |

---

## 六、常见问题
- **截图空白/不完整**：把"加载等待(ms)"调大（如 3000~5000），等动态内容加载完再截。
- **触发没反应**：检查 PAT 是否勾了 `workflow` 权限；检查仓库名是否填对。
- **图片打不开**：等 1 分钟再刷新（Pages / raw 有缓存）；确认 Actions 里该次运行是绿色成功。
- **想截需要登录的页面**：当前为公开云端截图，无法带你的登录态；如需登录态截图需升级为带密钥的常驻服务版本。
