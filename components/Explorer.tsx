
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Check, 
  X, 
  Tags, 
  AlertCircle,
  Database,
  Plus,
  Trash2,
  CheckSquare,
  Square,
  Layers,
  Sparkles,
  ChevronDown,
  LayoutGrid,
  Box,
  Tag as TagIcon,
  PlusCircle,
  ChevronRight,
  Upload,
  Download,
  FileText,
  AlertTriangle,
  Info
} from 'lucide-react';
import { Campaign, TagCategory } from '../types';

interface ExplorerProps {
  campaigns: Campaign[];
  setCampaigns: React.Dispatch<React.SetStateAction<Campaign[]>>;
  tagCategories: TagCategory[];
}

type PlatformTab = 'Google';
type LevelTab = 'campaign' | 'adgroup' | 'adtag';

interface ImportRow {
  id: string;
  platform: string;
  tags: string[];
  isValid: boolean;
  statusMessage?: string;
}

const Explorer: React.FC<ExplorerProps> = ({ campaigns, setCampaigns, tagCategories }) => {
  const [activeLevel, setActiveLevel] = useState<LevelTab>('campaign');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<PlatformTab>('Google');
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkTagModal, setShowBulkTagModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [filterSearchTerm, setFilterSearchTerm] = useState('');
  const [newCampaignName, setNewCampaignName] = useState('');
  
  // Import State
  const [importRows, setImportRows] = useState<ImportRow[]>([]);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modal Internal State
  const [modalActiveCategory, setModalActiveCategory] = useState<string>(tagCategories[0]?.name || '');
  const [modalSearchL2, setModalSearchL2] = useState('');

  const platforms: PlatformTab[] = ['Google'];
  const filterDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
        setShowFilterDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(c => {
      const matchPlatform = c.platform === activeTab;
      const matchSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchTags = filterTags.length === 0 || filterTags.every(t => c.tags.includes(t));
      return matchPlatform && matchSearch && matchTags;
    });
  }, [campaigns, activeTab, searchTerm, filterTags]);

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredCampaigns.length && filteredCampaigns.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredCampaigns.map(c => c.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleTag = (campaignIds: string[], tagLabel: string, categoryTags: string[]) => {
    setCampaigns(prev => prev.map(c => {
      if (campaignIds.includes(c.id)) {
        const hasTag = c.tags.includes(tagLabel);
        if (hasTag) {
          return { ...c, tags: c.tags.filter(t => t !== tagLabel) };
        } else {
          const otherTags = c.tags.filter(t => !categoryTags.includes(t));
          return { ...c, tags: [...otherTags, tagLabel] };
        }
      }
      return c;
    }));
  };

  const handleDownloadTemplate = () => {
    const headers = ['Campaign ID', 'Platform (媒体)', 'Tags (标签, 逗号分隔)'];
    // Use an existing ID for the sample to help users test correctly
    const sampleId = campaigns[0]?.id || '2';
    const sampleRow = [sampleId, 'Google', '运动鞋, 夏季, 效果营销'];
    const csvContent = [headers, sampleRow].map(e => e.join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "campaign_tags_template.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingFile(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = (event.target?.result as string).replace(/^\ufeff/, ""); // Remove BOM
      const lines = text.split(/\r?\n/).filter(line => line.trim());
      
      const rows: ImportRow[] = lines.slice(1).map(line => {
        const parts = line.split(',').map(s => s.trim());
        const [id, platform, ...rest] = parts;
        const tagsStr = rest.join(','); // Join the rest of columns back as tags
        
        const exists = campaigns.some(c => c.id === id);
        
        return {
          id: id || '',
          platform: platform || '',
          tags: tagsStr ? tagsStr.split(/[，,]/).map(t => t.trim()).filter(Boolean) : [],
          isValid: !!id && exists,
          statusMessage: !id ? 'ID 不能为空' : (exists ? undefined : `ID [${id}] 不在列表中`)
        };
      });
      setImportRows(rows);
      setIsProcessingFile(false);
      // Reset input to allow re-uploading the same file
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const confirmImport = () => {
    const validRows = importRows.filter(r => r.isValid);
    setCampaigns(prev => prev.map(c => {
      const importData = validRows.find(r => r.id === c.id);
      if (importData) {
        return { ...c, tags: importData.tags };
      }
      return c;
    }));
    setShowImportModal(false);
    setImportRows([]);
  };

  const handleAddCampaign = () => {
    if (!newCampaignName.trim()) return;
    const newCampaign: Campaign = {
      id: Math.floor(1000000000 + Math.random() * 9000000000).toString(),
      name: newCampaignName,
      platform: activeTab,
      spend: 0,
      impressions: 0,
      clicks: 0,
      conversions: 0,
      tags: [],
      status: 'active',
    };
    setCampaigns(prev => [...prev, newCampaign]);
    setNewCampaignName('');
    setShowAddModal(false);
  };

  const isTagActiveForAll = (tagLabel: string) => {
    return selectedIds.length > 0 && selectedIds.every(id => campaigns.find(c => id === c.id)?.tags.includes(tagLabel));
  };

  const activeCategory = useMemo(() => 
    tagCategories.find(c => c.name === modalActiveCategory) || tagCategories[0], 
    [tagCategories, modalActiveCategory]
  );

  const filteredTagCategories = useMemo(() => {
    if (!filterSearchTerm.trim()) return tagCategories;
    return tagCategories.map(cat => ({
      ...cat,
      tags: cat.tags.filter(tag => 
        tag.label.toLowerCase().includes(filterSearchTerm.toLowerCase()) ||
        cat.name.toLowerCase().includes(filterSearchTerm.toLowerCase())
      )
    })).filter(cat => cat.tags.length > 0);
  }, [tagCategories, filterSearchTerm]);

  return (
    <div className="space-y-6 relative min-h-[700px]">
      {/* Header & Main Actions */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
            广告标签
            <span className="px-2 py-0.5 bg-slate-100 text-slate-400 text-xs rounded-md font-medium">Tagging</span>
          </h2>
          <p className="text-xs text-slate-400">精细化打标体系：支持多维标签分类与批量操作</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="搜索名称或 ID..." 
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 outline-none text-sm transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowImportModal(true)}
              className="px-4 py-2.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-bold transition-all flex items-center gap-2"
            >
              <Upload className="w-4 h-4" /> 批量导入
            </button>
            <button 
              onClick={() => setShowBulkTagModal(true)}
              disabled={selectedIds.length === 0}
              className={`px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold transition-all border shadow-sm ${
                selectedIds.length > 0 
                  ? 'border-indigo-200 text-indigo-600 bg-white hover:bg-indigo-50' 
                  : 'border-slate-100 text-slate-300 bg-slate-50 cursor-not-allowed'
              }`}
            >
              <Tags className="w-4 h-4" />
              批量打标 {selectedIds.length > 0 && <span className="ml-1 bg-indigo-600 text-white min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center text-[10px]">{selectedIds.length}</span>}
            </button>
            <button 
              onClick={() => setShowAddModal(true)}
              className="px-5 py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl flex items-center gap-2 text-sm font-bold transition-all shadow-lg"
            >
              <Plus className="w-4 h-4" /> 新增系列
            </button>
          </div>
        </div>
      </div>

      {/* Platform Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl w-fit">
        {platforms.map(platform => (
          <button
            key={platform}
            onClick={() => { setActiveTab(platform); setSelectedIds([]); }}
            className={`px-6 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === platform ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            {platform}
          </button>
        ))}
      </div>

      {/* Level Tabs & Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200">
        <div className="flex items-center">
          <button onClick={() => setActiveLevel('campaign')} className={`px-6 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${activeLevel === 'campaign' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}><LayoutGrid className="w-4 h-4" />广告系列</button>
          <button className="px-6 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 border-transparent text-slate-400 opacity-60"><Box className="w-4 h-4" />广告组 <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded ml-1">迭代中</span></button>
          <button className="px-6 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 border-transparent text-slate-400 opacity-60"><TagIcon className="w-4 h-4" />广告标签 <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded ml-1">迭代中</span></button>
        </div>
        <div className="relative pb-2 md:pb-0" ref={filterDropdownRef}>
          <button 
            onClick={() => setShowFilterDropdown(!showFilterDropdown)} 
            className={`px-4 py-2 rounded-xl text-xs font-bold border flex items-center gap-2 transition-all ${filterTags.length > 0 ? 'bg-indigo-50 text-indigo-600 border-indigo-200 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
          >
            <Filter className="w-3.5 h-3.5" /> 
            {filterTags.length > 0 ? `已选维度: ${filterTags.length}` : '按标签维度筛选'} 
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showFilterDropdown ? 'rotate-180' : ''}`} />
          </button>
          
          {showFilterDropdown && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-3 border-b border-slate-100 bg-slate-50/50">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="搜索标签或维度..." 
                    className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all"
                    value={filterSearchTerm}
                    onChange={(e) => setFilterSearchTerm(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>
              <div className="max-h-80 overflow-y-auto p-1 custom-scrollbar">
                {filteredTagCategories.length > 0 ? (
                  filteredTagCategories.map(cat => (
                    <div key={cat.name} className="mb-2 last:mb-0">
                      <div className="px-3 py-1.5 flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{cat.name}</span>
                        <div className="flex-1 h-px bg-slate-100"></div>
                      </div>
                      <div className="space-y-0.5">
                        {cat.tags.map(tag => (
                          <button 
                            key={tag.id} 
                            onClick={() => setFilterTags(prev => prev.includes(tag.label) ? prev.filter(t => t !== tag.label) : [...prev, tag.label])} 
                            className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${filterTags.includes(tag.label) ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-50 text-slate-600'}`}
                          >
                            <span className="flex items-center gap-2.5">
                              <div className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: tag.color}}></div>
                              {tag.label}
                            </span>
                            {filterTags.includes(tag.label) && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-slate-400 text-xs italic">未找到匹配的标签</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Campaign Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="w-12 px-6 py-5"><button onClick={toggleSelectAll} className="text-slate-400 hover:text-indigo-600">{selectedIds.length === filteredCampaigns.length && filteredCampaigns.length > 0 ? <CheckSquare className="w-5 h-5 text-indigo-600" /> : <Square className="w-5 h-5" />}</button></th>
              <th className="px-6 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">广告系列名称</th>
              <th className="px-6 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">系列 ID</th>
              <th className="px-6 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">已选标签</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredCampaigns.map((campaign) => (
              <tr key={campaign.id} className={`hover:bg-indigo-50/20 transition-all cursor-pointer group ${selectedIds.includes(campaign.id) ? 'bg-indigo-50/40' : ''}`} onClick={() => toggleSelectOne(campaign.id)}>
                <td className="px-6 py-5" onClick={(e) => { e.stopPropagation(); toggleSelectOne(campaign.id); }}>{selectedIds.includes(campaign.id) ? <CheckSquare className="w-5 h-5 text-indigo-600" /> : <Square className="w-5 h-5 text-slate-300" />}</td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <Database className={`w-4 h-4 ${selectedIds.includes(campaign.id) ? 'text-indigo-600' : 'text-slate-300'}`} />
                    <span className="font-bold text-slate-700 text-sm">{campaign.name}</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className="text-[11px] font-mono text-slate-500 tracking-tighter">{campaign.id}</span>
                </td>
                <td className="px-6 py-5">
                  <div className="flex flex-wrap gap-2">
                    {campaign.tags.length > 0 ? campaign.tags.map(tagLabel => (
                      <span key={tagLabel} className="inline-flex items-center px-2.5 py-0.5 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100 text-[11px] font-bold whitespace-nowrap">{tagLabel}</span>
                    )) : <span className="text-[10px] text-slate-300 italic flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> 未打标</span>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* BULK IMPORT MODAL */}
      {showImportModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white"><Upload className="w-6 h-6" /></div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">批量导入标签</h3>
                  <p className="text-xs text-slate-400 mt-0.5">上传填写后的文件快速同步标签数据</p>
                </div>
              </div>
              <button onClick={() => {setShowImportModal(false); setImportRows([]);}} className="p-2 hover:bg-white rounded-xl text-slate-400 transition-all border border-transparent hover:border-slate-100"><X className="w-6 h-6" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {!importRows.length ? (
                <div className="space-y-6">
                  {/* Warning Box */}
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                       <p className="text-sm text-amber-800 leading-relaxed font-bold">
                        导入注意事项
                      </p>
                      <p className="text-xs text-amber-700 leading-relaxed">
                        1. 导入数据前，请确保 Campaign ID 已存在于下方列表中。<br/>
                        2. 匹配规则为 ID 强匹配，请检查 CSV 中的 ID 是否包含空格或引号。<br/>
                        3. <span className="underline">测试提示：</span> 当前可用的 ID 有：{campaigns.slice(0, 3).map(c => c.id).join(', ')}。
                      </p>
                    </div>
                  </div>

                  {/* Upload Area */}
                  <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-10 flex flex-col items-center text-center hover:bg-slate-100/50 transition-all group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <input type="file" ref={fileInputRef} className="hidden" accept=".csv" onChange={handleFileUpload} />
                    <div className="w-14 h-14 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:border-indigo-200 shadow-sm transition-all mb-4">
                      {isProcessingFile ? <RefreshCw className="w-7 h-7 animate-spin" /> : <FileText className="w-7 h-7" />}
                    </div>
                    <h4 className="font-bold text-slate-800 mb-2 text-lg">点击或拖拽文件至此处上传</h4>
                    <p className="text-sm text-slate-400 max-w-sm">
                      请上传填写完整的 CSV 文件进行数据解析
                    </p>
                  </div>

                  {/* Minimized Template Download */}
                  <div className="flex items-center justify-between p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <Download className="w-4 h-4 text-indigo-500" />
                      <span className="text-sm text-slate-600 font-medium">还没有标准模板？</span>
                    </div>
                    <button 
                      onClick={handleDownloadTemplate}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-white px-4 py-2 rounded-lg border border-indigo-100 shadow-sm transition-all"
                    >
                      点击下载模板 (.csv)
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-800 flex items-center gap-2">
                      <Check className="w-5 h-5 text-emerald-500" />
                      解析结果预览 ({importRows.filter(r => r.isValid).length} 条有效)
                    </h4>
                    <button onClick={() => setImportRows([])} className="text-xs font-bold text-slate-400 hover:text-indigo-600 px-3 py-1 bg-slate-50 rounded-lg">重新上传</button>
                  </div>

                  <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                          <th className="px-6 py-3 font-bold text-slate-400 text-[10px] uppercase">系列 ID</th>
                          <th className="px-6 py-3 font-bold text-slate-400 text-[10px] uppercase">媒体</th>
                          <th className="px-6 py-3 font-bold text-slate-400 text-[10px] uppercase">导入标签</th>
                          <th className="px-6 py-3 font-bold text-slate-400 text-[10px] uppercase">状态</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {importRows.map((row, idx) => (
                          <tr key={idx} className={row.isValid ? '' : 'bg-red-50/30'}>
                            <td className="px-6 py-3 font-mono text-[11px] text-slate-500">{row.id || '-'}</td>
                            <td className="px-6 py-3 text-slate-500">{row.platform}</td>
                            <td className="px-6 py-3">
                              <div className="flex flex-wrap gap-1">
                                {row.tags.map(t => <span key={t} className="px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[10px] font-bold border border-indigo-100">{t}</span>)}
                              </div>
                            </td>
                            <td className="px-6 py-3">
                              {row.isValid ? (
                                <span className="flex items-center gap-1 text-emerald-600 text-[11px] font-bold"><Check className="w-3 h-3" /> 正常</span>
                              ) : (
                                <span className="flex items-center gap-1 text-red-500 text-[11px] font-bold" title={row.statusMessage}><AlertTriangle className="w-3 h-3" /> {row.statusMessage || '解析错误'}</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-4">
              <button onClick={() => {setShowImportModal(false); setImportRows([]);}} className="px-6 py-3 text-slate-400 font-bold hover:bg-white rounded-xl transition-all">取消</button>
              <button 
                onClick={confirmImport}
                disabled={!importRows.some(r => r.isValid)}
                className="px-12 py-3 bg-slate-900 text-white rounded-xl font-bold shadow-xl hover:bg-black transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                确认导入并同步
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BULK TAG MODAL */}
      {showBulkTagModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 w-full max-w-6xl flex overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh]">
            <div className="w-72 border-r border-slate-100 flex flex-col bg-slate-50/30 shrink-0">
              <div className="p-8 border-b border-slate-100 flex items-center gap-3">
                 <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white"><Tags className="w-5 h-5" /></div>
                 <h4 className="font-bold text-slate-800">打标维度 (L1)</h4>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-1">
                {tagCategories.map(cat => (
                  <button
                    key={cat.name}
                    onClick={() => setModalActiveCategory(cat.name)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all group ${
                      modalActiveCategory === cat.name 
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm' 
                        : 'hover:bg-white text-slate-500 border border-transparent hover:border-slate-100'
                    }`}
                  >
                    <span className="font-bold text-sm">{cat.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${modalActiveCategory === cat.name ? 'bg-white text-indigo-600 shadow-sm' : 'bg-slate-100 text-slate-400'}`}>
                      {cat.tags.length}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 flex flex-col bg-white">
              <div className="p-8 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shrink-0">
                <div>
                  <h3 className="text-2xl font-bold text-slate-800 tracking-tight">"{activeCategory?.name}" 二级标签</h3>
                  <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-bold">L2 标签选择范围</p>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="在当前维度搜索..." 
                    className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm w-72 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                    value={modalSearchL2}
                    onChange={(e) => setModalSearchL2(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-8 bg-slate-50/20 custom-scrollbar">
                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {activeCategory?.tags.filter(t => t.label.toLowerCase().includes(modalSearchL2.toLowerCase())).map(tag => {
                    const isActive = isTagActiveForAll(tag.label);
                    return (
                      <button
                        key={tag.id}
                        onClick={() => toggleTag(selectedIds, tag.label, activeCategory.tags.map(t => t.label))}
                        className={`p-3 rounded-xl text-left border transition-all flex flex-col gap-2.5 group relative ${
                          isActive 
                            ? 'bg-white border-indigo-600 shadow-lg shadow-indigo-100 ring-1 ring-indigo-600' 
                            : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-sm text-slate-600'
                        }`}
                      >
                        <div className={`w-2.5 h-2.5 rounded-full transition-transform group-hover:scale-110 shadow-sm`} style={{ backgroundColor: tag.color }}></div>
                        <span className={`text-[11px] font-bold truncate ${isActive ? 'text-indigo-700' : 'text-slate-500'}`}>{tag.label}</span>
                        {isActive && <div className="absolute top-2.5 right-2.5 p-0.5 bg-indigo-600 rounded-full text-white scale-75"><Check className="w-3 h-3" /></div>}
                      </button>
                    );
                  })}
                  {activeCategory?.tags.length === 0 && <div className="col-span-full py-20 text-center text-slate-300 italic">该维度下暂无可用标签</div>}
                </div>
              </div>
              <div className="p-8 border-t border-slate-100 bg-slate-50/30 flex items-center justify-end shrink-0">
                <div className="flex items-center gap-3">
                  <button onClick={() => setShowBulkTagModal(false)} className="px-6 py-2.5 text-slate-400 text-sm font-bold hover:bg-white rounded-xl transition-all">取消</button>
                  <button onClick={() => setShowBulkTagModal(false)} className="px-10 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-xl hover:bg-black transition-all">绑定</button>
                </div>
              </div>
            </div>
            <button onClick={() => setShowBulkTagModal(false)} className="absolute top-8 right-8 p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-all z-[110]"><X className="w-6 h-6" /></button>
          </div>
        </div>
      )}

      {/* Add Campaign Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 w-full max-md p-10 animate-in zoom-in-95 duration-200">
            <h4 className="font-bold text-2xl text-slate-800 mb-8">新增广告系列</h4>
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-3">系列名称</label>
                <input type="text" autoFocus className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none text-sm" placeholder="例如: US_Promo_V1" value={newCampaignName} onChange={e => setNewCampaignName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddCampaign()} />
              </div>
            </div>
            <div className="flex gap-4 mt-12">
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-4 text-slate-500 hover:bg-slate-50 rounded-2xl">取消</button>
              <button onClick={handleAddCampaign} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg">确认添加</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const RefreshCw = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
    <path d="M3 3v5h5"></path>
    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path>
    <path d="M16 16h5v5"></path>
  </svg>
);

export default Explorer;
