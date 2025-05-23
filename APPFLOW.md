# AppFlow 在线打包指南

本文档提供使用Ionic AppFlow在线打包服务为护肤品成分查询系统生成安卓APK和iOS IPA的步骤指南。

## 准备工作

1. 安装所需的依赖包：

```bash
npm install -g @ionic/cli
npm install
```

2. 创建资源文件夹（如果不存在）：

```bash
mkdir -p resources
```

3. 准备应用图标和启动页资源：
   - 将一个高质量的1024x1024 PNG图标放入 `resources` 目录，命名为 `icon.png`
   - 将一个高质量的2732x2732 PNG启动图片放入 `resources` 目录，命名为 `splash.png`

4. 生成资源文件：

```bash
npm run resources
```

## AppFlow 账号设置

1. 创建Ionic账号：
   - 访问 https://dashboard.ionicframework.com 创建账号

2. 登录到Ionic CLI：

```bash
npm run appflow:login
```

3. 将本地项目关联到AppFlow：

```bash
npm run appflow:link
```
   - 如果这是一个新项目，系统会提示您创建一个新的AppFlow应用
   - 按照提示操作，给您的应用命名

## 上传代码到AppFlow

1. 确保代码已经提交到本地git仓库：

```bash
git add .
git commit -m "准备AppFlow打包"
```

2. 将代码推送到AppFlow：

```bash
npm run appflow:push
```

## 在AppFlow中构建应用

1. 登录AppFlow控制台： https://dashboard.ionicframework.com

2. 导航到您的项目 > Builds标签

3. 点击"New Build"按钮

4. 选择构建类型：
   - 选择"Android"生成APK
   - 选择"iOS"生成IPA（需要Apple开发者账号）

5. 选择构建配置：
   - Build Stack: 选择最新的稳定版本
   - Build Type: 选择"Debug"用于测试，"Release"用于生产
   - Environment: 选择"production"
   - 点击"Start Build"开始构建

6. 等待构建完成，下载生成的APK或IPA文件

## 定制构建选项

您可以在AppFlow控制台修改构建配置，或编辑项目中的以下文件：

- `appflow.config.json`: AppFlow特定配置
- `capacitor.config.json`: Capacitor应用配置
- `ionic.config.json`: Ionic项目配置

## Android构建注意事项

- 确保在AppFlow控制台或本地使用正确的版本号和版本代码
- 您可以上传自己的keystore文件来签名应用，或使用AppFlow生成的证书

## iOS构建注意事项

- 需要有效的Apple开发者账号
- 需要配置正确的证书和配置文件
- 在AppFlow控制台的"Certificates"部分上传必要的证书和配置文件

## 常见问题排解

1. 构建失败
   - 检查构建日志，寻找错误信息
   - 确保所有依赖项都已正确安装和配置
   - 验证应用ID和包名格式是否正确

2. 资源生成问题
   - 确保原始资源文件分辨率足够高
   - 检查资源文件格式（应为PNG）

3. 证书问题
   - 确保您的开发者证书和配置文件有效且未过期
   - 检查签名身份与配置文件是否匹配

## 更多资源

- [Ionic AppFlow 官方文档](https://ionicframework.com/docs/appflow)
- [Capacitor 文档](https://capacitorjs.com/docs) 