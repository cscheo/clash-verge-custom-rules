// Clash Verge Rev 全局强力杀毒脚本：动态彻底清理多余策略组
// 自动识别所有自动切换、容灾类型的组并删除，深度清洗悬空规则防崩溃

function main(config, profileName) {
  if (!config["proxy-groups"]) return config;

  // 1. 定义识别特征：名字包含以下关键字，或底层类型为 url-test/fallback
  const keywordRegex = /(自动|故障|测试|Auto|Fallback|Url-Test)/i;
  
  // 智能抓取要删除的组名列表
  const groupsToRemove = config["proxy-groups"].filter(g => {
    return keywordRegex.test(g.name) || g.type === "url-test" || g.type === "fallback";
  }).map(g => g.name);

  // 如果没有发现需要清理的组，直接返回
  if (groupsToRemove.length === 0) return config;

  // 2. 动态寻找“安全接盘侠” (找第一个有效且没被标记删除的 select 手动组)
  let safeProxy = "GLOBAL";
  const firstValidGroup = config["proxy-groups"].find(g => 
    g.type === 'select' && !groupsToRemove.includes(g.name)
  );
  if (firstValidGroup) {
    safeProxy = firstValidGroup.name;
  }

  // 3. 抹除目标策略组，并剔除其他保留组对它们的内部引用
  config["proxy-groups"].forEach(g => {
    if (g.proxies && Array.isArray(g.proxies)) {
      g.proxies = g.proxies.filter(p => !groupsToRemove.includes(p));
    }
  });
  config["proxy-groups"] = config["proxy-groups"].filter(g => !groupsToRemove.includes(g.name));

  // 4. 【核心防御】深度清洗 rules 路由规则，解决悬空指针导致启动崩溃的问题
  if (config.rules && Array.isArray(config.rules)) {
    config.rules = config.rules.map(rule => {
      let parts = rule.split(",");
      
      // 常见规则 (如 DOMAIN-SUFFIX,google.com,自动选择)
      if (parts.length >= 3) {
        if (groupsToRemove.includes(parts[2])) {
          parts[2] = safeProxy; 
          return parts.join(",");
        }
      } 
      // MATCH 规则 (如 MATCH,故障转移)
      else if (parts.length === 2 && parts[0] === "MATCH") {
        if (groupsToRemove.includes(parts[1])) {
          parts[1] = safeProxy;
          return parts.join(",");
        }
      }
      return rule;
    });
  }

  return config;
}
