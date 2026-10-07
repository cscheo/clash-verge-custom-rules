# Clash Verge Custom Rules

这是个人的 Clash Verge Rev 配置备份仓库，包含国内直连增强、AI 防风控专属分流及部分界面/策略组精简代码。

## 文件说明与使用方法

1. **`direct-rules.yaml`** (路由规则增强)
   - **功能**：防止优酷、B站、抖音等高流量国内网站偷跑代理；修复 ChatGPT 等服务因机场节点乱切导致的验证码/支付风控；单独将所有 Gemini/Google AI 的域名引导至 `♊Gemini` 策略组。
   - **用法**：在 Clash Verge 中新建 `Merge (Rules)`，填入此文件内容，并绑定到你的机场配置上。

2. **`gemini-groups.yaml`** (策略组增强)
   - **功能**：新建名为 `♊Gemini` 的专属策略组，并指定特定的国家/节点。同时从 YAML 层面屏蔽了机场的“自动选择”和“故障转移”策略组。
   - **用法**：在 Clash Verge 中新建 `Merge (Groups)`，填入此文件内容。

3. **`remove-fallback.js`** (高级去冗余脚本)
   - **功能**：通过 JavaScript 动态过滤掉机场自带的 `♻️自动选择` 和 `🔯故障转移`，并清除其它策略组对它们的引用，保证没有报错。
   - **用法**：在 Clash Verge 中新建 `Script`，填入此文件内容。

> **提示**：在使用时，由于你在 `gemini-groups.yaml` 和 `remove-fallback.js` 中都写了删除冗余策略组的逻辑，两者都生效，但建议保留以防万一。
