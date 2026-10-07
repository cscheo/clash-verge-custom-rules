// Clash Verge Rev 全局强力杀毒脚本：动态彻底清理多余策略组
// 自动识别所有自动切换、容灾类型的组并删除，深度清洗悬空规则防崩溃

function main(config, profileName) {
  if (!config["proxy-groups"]) return config;

  const keywordRegex = /(自动|故障|测试|Auto|Fallback|Url-Test)/i;
  
  const groupsToRemove = config["proxy-groups"].filter(g => {
    return keywordRegex.test(g.name) || g.type === "url-test" || g.type === "fallback";
  }).map(g => g.name);

  if (groupsToRemove.length === 0) return config;

  let safeProxy = "DIRECT"; // 最安全的回落节点
  const firstValidGroup = config["proxy-groups"].find(g => 
    g.type === 'select' && !groupsToRemove.includes(g.name)
  );
  if (firstValidGroup) {
    safeProxy = firstValidGroup.name;
  }

  config["proxy-groups"].forEach(g => {
    if (g.proxies && Array.isArray(g.proxies)) {
      g.proxies = g.proxies.filter(p => !groupsToRemove.includes(p));
    }
  });
  config["proxy-groups"] = config["proxy-groups"].filter(g => !groupsToRemove.includes(g.name));

  if (config.rules && Array.isArray(config.rules)) {
    config.rules = config.rules.map(rule => {
      let parts = rule.split(",");
      
      // 处理逻辑规则 AND,(DOMAIN,baidu.com),(NETWORK,UDP),Proxy
      // 逻辑规则或普通规则，Proxy 永远在最后一位（或者倒数第二位紧跟 no-resolve）
      let targetIndex = parts.length - 1;
      if (parts[targetIndex] === "no-resolve") {
        targetIndex = parts.length - 2;
      }

      // 防止数组越界
      if (targetIndex >= 0 && groupsToRemove.includes(parts[targetIndex])) {
        parts[targetIndex] = safeProxy;
        return parts.join(",");
      }
      
      return rule;
    });
  }

  return config;
}
