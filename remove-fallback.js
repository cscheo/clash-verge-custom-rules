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

  // 正则转义函数，防止目标组名字含有特殊字符 (如 "🔯故障转移(Auto)") 破坏正则
  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // 4. 【致命修复】放弃粗暴的逗号 split，改用尾部精准正则替换，完美兼容逻辑规则 AND,(...),Proxy
  if (config.rules && Array.isArray(config.rules)) {
    config.rules = config.rules.map(rule => {
      for (const target of groupsToRemove) {
        const escapedTarget = escapeRegExp(target);
        // 匹配逗号后的目标组名，且它必须在句尾，或者紧跟着逗号 (如 ,no-resolve)
        const regex = new RegExp(`,${escapedTarget}(,|$)`);
        if (regex.test(rule)) {
          // 安全替换为接盘组，保留后面的附加参数 ($1)
          return rule.replace(regex, `,${safeProxy}$1`);
        }
      }
      return rule;
    });
  }

  return config;
}
