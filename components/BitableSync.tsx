
import React from 'react';
import { Campaign, TagCategory } from '../types';
// Add Info to the imports from lucide-react
import { Download, ExternalLink, RefreshCw, Send, CheckCircle2, LayoutTemplate, Settings2, Info } from 'lucide-react';

interface BitableSyncProps {
  campaigns: Campaign[];
  tagCategories: TagCategory[];
}

const BitableSync: React.FC<BitableSyncProps> = ({ campaigns, tagCategories }) => {
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [lastSync, setLastSync] = React.useState<string | null>(null);

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setLastSync(new Date().toLocaleTimeString());
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
            <LayoutTemplate className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">飞书多维表格模板管理</h3>
            <p className="text-sm text-slate-500 mt-1">
              配置已打标数据的同步规则，自动将自定义标签映射到 Bitable 的单选或多选字段。
            </p>
            {lastSync && (
              <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-600 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                上次同步成功： {lastSync}
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 border border-slate-200 rounded-lg flex items-center gap-2 hover:bg-slate-50 text-sm font-medium text-slate-600 transition-colors">
            <Settings2 className="w-4 h-4" />
            映射设置
          </button>
          <button 
            onClick={handleSync}
            disabled={isSyncing}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2 hover:bg-indigo-700 text-sm font-bold shadow-md shadow-indigo-100 transition-all disabled:opacity-50"
          >
            {isSyncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {isSyncing ? '数据推送中...' : '推送到多维表格'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">数据映射配置表</span>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold">已启用</span>
          </div>
          <div className="flex items-center gap-4 text-[10px] text-slate-400">
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 bg-indigo-400 rounded-full"></div> 系统字段</span>
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 bg-purple-400 rounded-full"></div> 自定义标签</span>
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 bg-emerald-400 rounded-full"></div> 核心指标</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white">
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 border-b border-slate-100">Bitable 目标字段</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 border-b border-slate-100">映射逻辑 / 来源</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 border-b border-slate-100">字段类型</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 border-b border-slate-100">示例数据预览</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <tr>
                <td className="px-6 py-3 text-sm font-medium text-slate-700">广告系列 (Campaign)</td>
                <td className="px-6 py-3 text-sm text-slate-500">原始 Campaign Name</td>
                <td className="px-6 py-3"><span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[10px] font-bold">文本</span></td>
                <td className="px-6 py-3 text-sm text-slate-400 truncate max-w-[200px] italic">{campaigns[0]?.name}</td>
              </tr>
              {tagCategories.map(cat => (
                <tr key={cat.name}>
                  <td className="px-6 py-3 text-sm font-medium text-slate-700">{cat.name}</td>
                  <td className="px-6 py-3 text-sm text-slate-500">一级分类: {cat.name}</td>
                  <td className="px-6 py-3"><span className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded text-[10px] font-bold">单选</span></td>
                  <td className="px-6 py-3">
                    <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] text-slate-500 font-medium">
                      {cat.tags[0]?.label || '自动匹配中'}
                    </span>
                  </td>
                </tr>
              ))}
              <tr>
                <td className="px-6 py-3 text-sm font-medium text-slate-700">广告支出 (Spend)</td>
                <td className="px-6 py-3 text-sm text-slate-500">Total Ad Spend</td>
                <td className="px-6 py-3"><span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[10px] font-bold">数字</span></td>
                <td className="px-6 py-3 text-sm text-slate-500 font-mono">¥{campaigns[0]?.spend.toLocaleString()}</td>
              </tr>
              <tr>
                <td className="px-6 py-3 text-sm font-medium text-slate-700">转化量 (Conversions)</td>
                <td className="px-6 py-3 text-sm text-slate-500">Total Actions</td>
                <td className="px-6 py-3"><span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[10px] font-bold">数字</span></td>
                <td className="px-6 py-3 text-sm text-slate-500">{campaigns[0]?.conversions}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-gradient-to-r from-indigo-900 to-indigo-800 rounded-xl p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-100">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <h4 className="text-xl font-bold mb-3 flex items-center gap-2">
               {/* Fixed missing import for Info icon */}
               <Info className="w-5 h-5 text-indigo-300" />
               飞书报表同步建议
            </h4>
            <p className="text-indigo-100 text-sm leading-relaxed">
              在 Bitable 中开启“高级透视表”插件，即可利用已同步的自定义标签维度进行多级钻取分析。
              例如：按“产品线”查看各平台投放 ROI，或按“季节/活动”分析消耗趋势。
            </p>
          </div>
          <div className="flex gap-4">
            <button className="px-6 py-3 bg-indigo-700/50 hover:bg-indigo-700 text-white border border-indigo-500/30 rounded-lg font-bold text-sm transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" /> 导出同步日志
            </button>
            <a 
              href="https://www.feishu.cn/bitable" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-6 py-3 bg-white text-indigo-900 rounded-lg font-bold flex items-center gap-2 hover:bg-indigo-50 transition-colors shadow-lg shadow-black/10 shrink-0 text-sm"
            >
              跳转至飞书 <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
        {/* 背景装饰 */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-white/10 rounded-full opacity-50 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-48 h-48 bg-indigo-400/20 rounded-full opacity-30 blur-2xl"></div>
      </div>
    </div>
  );
};

export default BitableSync;
