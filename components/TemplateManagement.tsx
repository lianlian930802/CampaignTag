
import React, { useState, useMemo } from 'react';
import { 
  LayoutTemplate, 
  ExternalLink, 
  Link as LinkIcon, 
  Plus, 
  Trash2, 
  Globe, 
  ArrowUpRight,
  Search,
  X,
  Database,
  Layers,
  FileSpreadsheet,
  Clock
} from 'lucide-react';
import { BitableTemplate, BoundBitable } from '../types';
import { BITABLE_TEMPLATES } from '../constants';

const TemplateManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [boundBitables, setBoundBitables] = useState<BoundBitable[]>([
    { id: 'b_1', templateId: 'tmpl_1', name: '2024夏季大促预算监控', url: 'https://feishu.cn/base/instance_1', boundAt: '2024-05-20' },
    { id: 'b_2', templateId: 'tmpl_4', name: 'Q3 Google全量分析表', url: 'https://feishu.cn/base/instance_2', boundAt: '2024-06-15' }
  ]);
  const [showBindForm, setShowBindForm] = useState<string | null>(null);
  const [bindData, setBindData] = useState({ name: '' });

  const handleOpenTemplate = (url: string) => {
    window.open(url, '_blank');
  };

  const filteredTemplates = useMemo(() => {
    return BITABLE_TEMPLATES.filter(tmpl => 
      tmpl.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tmpl.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const handleBindTable = (templateId: string) => {
    if (!bindData.name) return;
    const newBound: BoundBitable = {
      id: `b_${Date.now()}`,
      templateId,
      name: bindData.name,
      url: 'https://feishu.cn/base/new_instance', // Placeholder URL
      boundAt: new Date().toISOString().split('T')[0]
    };
    // Adds a new row to the list below
    setBoundBitables([newBound, ...boundBitables]);
    setBindData({ name: '' });
    setShowBindForm(null);
  };

  const unbindTable = (id: string) => {
    if (confirm('确认解除绑定此多维表？')) {
      setBoundBitables(boundBitables.filter(b => b.id !== id));
    }
  };

  const getTemplateName = (id: string) => {
    return BITABLE_TEMPLATES.find(t => t.id === id)?.name || '未知模板';
  };

  return (
    <div className="space-y-10 pb-20">
      {/* 1. 顶部搜索与标题 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-800 flex items-center gap-2 text-2xl tracking-tight">
            <LayoutTemplate className="w-7 h-7 text-indigo-600" />
            Bitable 模板与中心
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            选择标准模板并绑定您编辑后的多维表，系统将自动开始数据同步任务。
          </p>
        </div>
        
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="搜索模板..." 
            className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white text-sm shadow-sm transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-slate-100 rounded-full text-slate-400">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. 模板选择区域 - 网格布局 */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Layers className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-slate-800">1. 选择官方标准模板</h4>
          <span className="text-xs text-slate-400 font-normal">点击图标打开飞书，保存副本后进行编辑</span>
        </div>

        {filteredTemplates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredTemplates.map((tmpl) => (
              <div key={tmpl.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all group relative overflow-hidden">
                <div className="flex items-start justify-between mb-3">
                  <div className="text-3xl grayscale group-hover:grayscale-0 transition-all duration-300">
                    {tmpl.icon}
                  </div>
                  <button 
                    onClick={() => handleOpenTemplate(tmpl.url)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
                <h5 className="font-bold text-slate-800 text-sm mb-1">{tmpl.name}</h5>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-normal mb-4">
                  {tmpl.description}
                </p>
                <button 
                  onClick={() => setShowBindForm(tmpl.id)}
                  className="w-full py-2 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3 h-3" /> 创建
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-10 text-center text-slate-400 text-sm bg-white rounded-2xl border border-dashed border-slate-200">
            未找到相关模板
          </div>
        )}
      </section>

      {/* 3. 已绑定多维表区域 - 列表布局 (防止无限拉长) */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-slate-800">2. 已绑定的多维表管理</h4>
            <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full font-bold ml-2">
              {boundBitables.length} 个实例已启用同步
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">多维表名称</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">所选模板源</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">同步时间</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">管理操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {boundBitables.map((bound) => (
                <tr key={bound.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-indigo-50 flex items-center justify-center text-indigo-500">
                        <Database className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-700">{bound.name}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Globe className="w-2.5 h-2.5" /> 飞书云端实例
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-medium border border-slate-200">
                      {getTemplateName(bound.templateId)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-slate-300" />
                      {bound.boundAt}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => window.open(bound.url, '_blank')}
                        className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all flex items-center gap-1.5 shadow-sm"
                      >
                        跳转查看 <ArrowUpRight className="w-3 h-3" />
                      </button>
                      <button 
                        onClick={() => unbindTable(bound.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="解除绑定"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {boundBitables.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-20 text-center text-slate-300 italic text-sm">
                    暂无已绑定的多维表，请在上方选择模板进行首次同步。
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* 绑定弹窗 */}
      {showBindForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-8 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                <LinkIcon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-xl text-slate-800">创建同步任务</h4>
                <p className="text-xs text-slate-400">将您的副本多维表与系统挂钩</p>
              </div>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">飞书多维表格名称</label>
                <input 
                  type="text" 
                  autoFocus
                  placeholder="例如: 2024Q4广告预算管理" 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-sm transition-all"
                  value={bindData.name}
                  onChange={e => setBindData({ name: e.target.value })}
                  onKeyDown={e => e.key === 'Enter' && handleBindTable(showBindForm)}
                />
              </div>
            </div>
            
            <div className="flex gap-4 mt-10">
              <button 
                onClick={() => {
                  setShowBindForm(null);
                  setBindData({ name: '' });
                }}
                className="flex-1 py-3 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors"
              >
                取消
              </button>
              <button 
                onClick={() => handleBindTable(showBindForm)}
                className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
              >
                确认创建
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateManagement;
