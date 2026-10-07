// 过滤掉机场自带的 ♻️自动选择 和 🔯故障转移 (Fallback) 策略组
// 适用于 Clash Verge Rev 的 Script (脚本) 功能

function main(config, profileName) {
  if (config["proxy-groups"]) {
    const removeTargets = ["♻️自动选择", "🔯故障转移"];
    
    // 1. 删除这两个策略组本身
    config["proxy-groups"] = config["proxy-groups"].filter(g => !removeTargets.includes(g.name));
    
    // 2. 从其他策略组的 proxies 列表中移除对它们的引用（防止报错）
    config["proxy-groups"].forEach(g => {
      if (g.proxies && Array.isArray(g.proxies)) {
        g.proxies = g.proxies.filter(p => !removeTargets.includes(p));
      }
    });
  }
  return config;
}
