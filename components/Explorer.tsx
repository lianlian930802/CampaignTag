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
  Sparkles,
  ChevronDown,
  LayoutGrid,
  Box,
  Tag as TagIcon,
  Upload,
  Download,
  FileText,
  AlertTriangle,
  ChevronRight,
  Settings,
  ArrowRight,
  List,
  Info,
  History,
  Zap
} from 'lucide-react';
import { Campaign, TagCategory, ParsingRule, TagDefinition } from '../types';

interface ExplorerProps {
  campaigns: Campaign[];
  setCampaigns: React.Dispatch<React.SetStateAction<Campaign[]>>;
  tagCategories: TagCategory[];
  setTagCategories: React.Dispatch<React.SetStateAction<TagCategory[]>>;
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

interface MappingConfig {
  mode: 'new' | 'existing' | 'none';
  target: string;
}

const PRESET_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#6366F1', 
  '#EC4899', '#8B5CF6', '#14B8A6', '#F97316', '#475569'
];

const Explorer: React.FC<ExplorerProps> = ({ campaigns, setCampaigns, tagCategories, setTagCategories }) => {
  const [activeLevel, setActiveLevel] = useState<LevelTab>('campaign');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<PlatformTab>('Google');
  const [filterTags, setFilterTags] = useState<string[]>([]);
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTagMethodSelect, setShowTagMethodSelect] = useState(false);
  const [showBulkTagModal, setShowBulkTagModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAutoParseModal, setShowAutoParseModal] = useState(false);
  
  // Auto Parse Logic State
  const [parseStep, setParseStep] = useState(1);
  const [newRuleName, setNewRuleName] = useState('');
  const [selectedDelimiter, setSelectedDelimiter] = useState('_');
  
  // 初始化假数据规则
  const [parsingRules, setParsingRules] = useState<ParsingRule[]>([
    {
      id: 'rule_1',
      name: 'Google标准投放规则',
      delimiter: '_',
      mappings: [
        { index: 0, categoryName: '地区' },
        { index: 1, categoryName: '营销目标' },
        { index: 2, categoryName: '产品线' }
      ],
      createdAt: '2024-03-20'
    },
    {
      id: 'rule_2',
      name: '季节性大促解析 (横杠)',
      delimiter: '-',
      mappings: [
        { index: 0, categoryName: '产品线' },
        { index: 1, categoryName: '季节/活动' }
      ],
      createdAt: '2024-04-12'
    },
    {
      id: 'rule_3',
      name: '多维品牌系列解析',
      delimiter: '—',
      mappings: [
        { index: 0, categoryName: '地区' },
        { index: 2, categoryName: '营销目标' }
      ],
      createdAt: '2024-05-01'
    }
  ]);
  
  const [ruleMappings, setRuleMappings] = useState<Record<number, MappingConfig>>({});

  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [filterSearchTerm, setFilterSearchTerm] = useState('');
  const [newCampaignName, setNewCampaignName] = useState('');
  
  const [importRows, setImportRows] = useState<ImportRow[]>([]);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const filterDropdownRef = useRef<HTMLDivElement>(null);

  // Modal Internal State
  const [modalActiveCategory, setModalActiveCategory] = useState<string>(tagCategories[0]?.name || '');
  const [modalSearchL2, setModalSearchL2] = useState('');

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

  const isTagActiveForAll = (tagLabel: string) => {
    if (selectedIds.length === 0) return false;
    return selectedIds.every(id => {
      const campaign = campaigns.find(c => c.id === id);
      return campaign?.tags.includes(tagLabel);
    });
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

  const previewCampaign = useMemo(() => {
    if (selectedIds.length === 0) return null;
    return campaigns.find(c => c.id === selectedIds[0]);
  }, [selectedIds, campaigns]);

  const parsedParts = useMemo(() => {
    if (!previewCampaign || !selectedDelimiter) return [];
    return previewCampaign.name.split(selectedDelimiter).map(p => p.trim());
  }, [previewCampaign, selectedDelimiter]);

  const handleSelectExistingRule = (ruleId: string) => {
    const rule = parsingRules.find(r => r.id === ruleId);
    if (!rule) return;
    setNewRuleName(rule.name);
    setSelectedDelimiter(rule.delimiter);
    
    const newMappings: Record<number, MappingConfig> = {};
    rule.mappings.forEach(m => {
      newMappings[m.index] = { mode: 'existing', target: m.categoryName };
    });
    setRuleMappings(newMappings);
  };

  const handleConfirmAutoParse = () => {
    if (!newRuleName || !selectedDelimiter) return;

    const mappingEntries = Object.entries(ruleMappings) as [string, MappingConfig][];
    const validMappings = mappingEntries
      .filter(([, config]) => config.mode !== 'none' && config.target)
      .map(([idx, config]) => ({
        index: parseInt(idx),
        categoryName: config.target
      }));

    const existingRuleIndex = parsingRules.findIndex(r => r.name === newRuleName);
    const newRule: ParsingRule = {
      id: existingRuleIndex > -1 ? parsingRules[existingRuleIndex].id : Date.now().toString(),
      name: newRuleName,
      delimiter: selectedDelimiter,
      mappings: validMappings,
      createdAt: new Date().toISOString().split('T')[0]
    };

    if (existingRuleIndex > -1) {
      const updatedRules = [...parsingRules];
      updatedRules[existingRuleIndex] = newRule;
      setParsingRules(updatedRules);
    } else {
      setParsingRules(prev => [...prev, newRule]);
    }

    const updatedTagCategories = [...tagCategories];
    const updatedCampaigns = campaigns.map(c => {
      if (!selectedIds.includes(c.id)) return c;

      const parts = c.name.split(selectedDelimiter).map(p => p.trim());
      const newTagsToAdd: string[] = [];

      validMappings.forEach(mapping => {
        const tagValue = parts[mapping.index];
        if (!tagValue) return;

        let cat = updatedTagCategories.find(tc => tc.name === mapping.categoryName);
        if (!cat) {
          cat = { name: mapping.categoryName, tags: [] };
          updatedTagCategories.push(cat);
        }

        if (!cat.tags.some(t => t.label === tagValue)) {
          cat.tags.push({
            id: `tag-${Date.now()}-${Math.random()}`,
            label: tagValue,
            color: PRESET_COLORS[cat.tags.length % PRESET_COLORS.length],
            category: cat.name
          });
        }
        newTagsToAdd.push(tagValue);
      });

      const currentTags = [...c.tags];
      newTagsToAdd.forEach(nt => {
        if (!currentTags.includes(nt)) currentTags.push(nt);
      });

      return { ...c, tags: currentTags };
    });

    setTagCategories(updatedTagCategories);
    setCampaigns(updatedCampaigns);
    setShowAutoParseModal(false);
    resetAutoParseForm();
  };

  const resetAutoParseForm = () => {
    setParseStep(1);
    setNewRuleName('');
    setSelectedDelimiter('_');
    setRuleMappings({});
  };

  const handleDownloadTemplate = () => {
    const headers = ['Campaign ID', 'Platform (媒体)', 'Tags (标签, 逗号分隔)'];
    const sampleId = campaigns[0]?.id || '2';
    const sampleRow = [sampleId, 'Google', '运动鞋, 夏季, 效果营销'];
    const csvContent = [headers, sampleRow].map(e => e.join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "campaign_tags_template.csv");
    link.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessingFile(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = (event.target?.result as string).replace(/^\ufeff/, "");
      const lines = text.split(/\r?\n/).filter(line => line.trim());
      const rows: ImportRow[] = lines.slice(1).map(line => {
        const parts = line.split(',').map(s => s.trim());
        const [id, platform, ...rest] = parts;
        const tagsStr = rest.join(',');
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
    };
    reader.readAsText(file);
  };

  const confirmImport = () => {
    const validRows = importRows.filter(r => r.isValid);
    setCampaigns(prev => prev.map(c => {
      const importData = validRows.find(r => r.id === c.id);
      if (importData) return { ...c, tags: importData.tags };
      return c;
    }));
    setShowImportModal(false);
    setImportRows([]);
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
          <p className="text-xs text-slate-400">精细化打标体系：支持多维标签分类、批量操作及规则智能解析</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="搜索名称或 ID..." 
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 outline-none text-sm transition-all bg-white shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowImportModal(true)}
              className="px-4 py-2.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-sm"
            >
              <Upload className="w-4 h-4" /> 批量导入
            </button>
            <button 
              onClick={() => setShowTagMethodSelect(true)}
              disabled={selectedIds.length === 0}
              className={`px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold transition-all border shadow-sm ${
                selectedIds.length > 0 
                  ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white border-transparent hover:shadow-indigo-200 hover:shadow-lg' 
                  : 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed'
              }`}
            >
              <Tags className="w-4 h-4" />
              批量打标
            </button>
            <button 
              onClick={() => setShowAddModal(true)}
              className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl flex items-center gap-2 text-sm font-bold transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" /> 新增系列
            </button>
          </div>
        </div>
      </div>

      {/* Level Tabs & Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200">
        <div className="flex items-center">
          <button onClick={() => setActiveLevel('campaign')} className={`px-6 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${activeLevel === 'campaign' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}><LayoutGrid className="w-4 h-4" />广告系列</button>
          <button className="px-6 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 border-transparent text-slate-400 opacity-60 cursor-not-allowed"><Box className="w-4 h-4" />广告组 <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded ml-1">迭代中</span></button>
        </div>
        <div className="relative pb-2 md:pb-0" ref={filterDropdownRef}>
          <button 
            onClick={() => setShowFilterDropdown(!showFilterDropdown)} 
            className={`px-4 py-2 rounded-xl text-xs font-bold border flex items-center gap-2 transition-all ${filterTags.length > 0 ? 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
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
                    className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all"
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

      {/* TAGGING METHOD SELECTION MODAL - Compact Design */}
      {showTagMethodSelect && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md"><Tags className="w-5 h-5" /></div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">打标方式</h3>
                  <p className="text-[10px] text-slate-400">已选中 {selectedIds.length} 个系列</p>
                </div>
              </div>
              <button onClick={() => setShowTagMethodSelect(false)} className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 transition-all"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="p-4 space-y-2">
              {/* AI Smart Parsing Option - Promoted */}
              <button 
                onClick={() => { setShowTagMethodSelect(false); setShowAutoParseModal(true); setParseStep(1); }}
                className="w-full group p-4 bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-2xl text-left hover:shadow-lg hover:shadow-indigo-100 transition-all border border-transparent flex items-center gap-4"
              >
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">AI 智能解析</span>
                    <span className="px-1.5 py-0.5 bg-white/20 rounded text-[9px] text-white font-bold tracking-tighter uppercase">推荐</span>
                  </div>
                  <p className="text-[11px] text-indigo-100/70 mt-0.5">自动解析规则，批量一键打标</p>
                </div>
                <ChevronRight className="w-4 h-4 text-white/50 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Manual Option */}
              <button 
                onClick={() => { setShowTagMethodSelect(false); setShowBulkTagModal(true); }}
                className="w-full group p-4 bg-white border border-slate-200 rounded-2xl text-left hover:border-indigo-200 hover:bg-slate-50 transition-all flex items-center gap-4"
              >
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 group-hover:text-indigo-600 transition-colors shrink-0">
                  <Tags className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <span className="font-bold text-slate-800 text-sm">手动批量打标</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">选择维度手动应用标签</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            
            <div className="px-6 py-4 bg-slate-50/50 flex justify-center border-t border-slate-50">
              <p className="text-[10px] text-slate-400 flex items-center gap-1.5 italic">
                <Info className="w-3 h-3" /> 支持保存自定义规则，方便后续复用
              </p>
            </div>
          </div>
        </div>
      )}

      {/* AUTO PARSE MODAL (Combined with Rule Management) */}
      {showAutoParseModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg"><Sparkles className="w-6 h-6" /></div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">智能解析与规则管理</h3>
                  <p className="text-xs text-slate-400 mt-0.5">第 {parseStep} 步 / 共 2 步: {parseStep === 1 ? '配置解析规则' : '映射维度详情'}</p>
                </div>
              </div>
              <button onClick={() => {setShowAutoParseModal(false); resetAutoParseForm();}} className="p-2 hover:bg-white rounded-xl text-slate-400 transition-all border border-transparent hover:border-slate-100"><X className="w-6 h-6" /></button>
            </div>

            <div className="flex-1 p-8 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {parseStep === 1 ? (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                    <div className="space-y-3">
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <TagIcon className="w-3 h-3" /> 解析规则名称
                      </label>
                      <input 
                        type="text" 
                        placeholder="输入新规则名称..." 
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none text-sm font-bold"
                        value={newRuleName}
                        onChange={e => setNewRuleName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <History className="w-3 h-3" /> 选择已有规则
                      </label>
                      <select 
                        className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none text-sm font-medium shadow-sm"
                        onChange={(e) => handleSelectExistingRule(e.target.value)}
                        value={parsingRules.find(r => r.name === newRuleName)?.id || ""}
                      >
                        <option value="">-- 选择已有解析规则 --</option>
                        {parsingRules.map(rule => (
                          <option key={rule.id} value={rule.id}>{rule.name} (分隔符: {rule.delimiter})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <LayoutGrid className="w-3 h-3" /> 输入分隔字符
                    </label>
                    <div className="flex flex-col gap-3">
                      <input 
                        type="text" 
                        maxLength={5}
                        placeholder="输入分隔符，如 — 或 _" 
                        className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none text-sm font-bold"
                        value={selectedDelimiter}
                        onChange={e => setSelectedDelimiter(e.target.value.replace(/[\s\n]/g, ''))}
                      />
                      <div className="flex items-center gap-2 text-[10px] text-amber-600 font-bold bg-amber-50 px-3 py-2 rounded-xl border border-amber-100">
                        <AlertCircle className="w-3.5 h-3.5" />
                        规则保存提示：点击下一步后，您的匹配配置将自动关联到该规则名称。
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      解析预览样本: <span className="text-slate-800 bg-indigo-50 px-2 py-0.5 rounded ml-1">{previewCampaign?.name}</span>
                    </p>
                  </div>
                  
                  <div className="bg-slate-50/50 rounded-2xl border border-slate-200 overflow-hidden">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-white border-b border-slate-100 font-bold text-slate-400">
                        <tr>
                          <th className="px-5 py-4 w-16 text-center">顺序</th>
                          <th className="px-5 py-4">提取字符</th>
                          <th className="px-5 py-4 w-52">匹配方式</th>
                          <th className="px-5 py-4">一级标签</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {parsedParts.map((part, idx) => {
                          const config = ruleMappings[idx] || { mode: 'none', target: '' };
                          return (
                            <tr key={idx} className="hover:bg-white transition-colors">
                              <td className="px-5 py-5 font-mono text-slate-400 text-center text-sm">{idx + 1}</td>
                              <td className="px-5 py-5">
                                <span className="px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-100 font-bold shadow-sm inline-block">
                                  {part}
                                </span>
                              </td>
                              <td className="px-5 py-5">
                                <select 
                                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all shadow-sm"
                                  value={config.mode}
                                  onChange={(e) => setRuleMappings({
                                    ...ruleMappings,
                                    [idx]: { mode: e.target.value as any, target: '' }
                                  })}
                                >
                                  <option value="none">不映射 (忽略)</option>
                                  <option value="existing">映射已有标签</option>
                                  <option value="new">新建标签</option>
                                </select>
                              </td>
                              <td className="px-5 py-5">
                                {config.mode === 'existing' && (
                                  <select 
                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all shadow-sm"
                                    value={config.target}
                                    onChange={(e) => setRuleMappings({
                                      ...ruleMappings,
                                      [idx]: { ...config, target: e.target.value }
                                    })}
                                  >
                                    <option value="">选择已有 L1 维度...</option>
                                    {tagCategories.map(cat => (
                                      <option key={cat.name} value={cat.name}>{cat.name}</option>
                                    ))}
                                  </select>
                                )}
                                {config.mode === 'new' && (
                                  <input 
                                    type="text"
                                    placeholder="输入新维度名称 (如: 投放地区)"
                                    className="w-full bg-white border border-indigo-100 rounded-xl px-4 py-2.5 text-xs font-bold focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all shadow-sm"
                                    value={config.target}
                                    onChange={(e) => setRuleMappings({
                                      ...ruleMappings,
                                      [idx]: { ...config, target: e.target.value }
                                    })}
                                  />
                                )}
                                {config.mode === 'none' && (
                                  <span className="text-slate-300 italic px-2">该片段将不进行打标</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                        {parsedParts.length === 0 && (
                          <tr>
                            <td colSpan={4} className="px-4 py-20 text-center text-slate-300 italic border border-dashed border-slate-100 m-4 rounded-xl">
                              未检测到匹配的分隔符。请返回 Step 1 调整。
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
              {parseStep === 2 && (
                <button onClick={() => setParseStep(1)} className="px-6 py-3 text-slate-400 font-bold hover:bg-white rounded-xl transition-all flex items-center gap-2 border border-transparent hover:border-slate-100">上一步</button>
              )}
              <div className="flex-1"></div>
              <div className="flex gap-3">
                <button onClick={() => {setShowAutoParseModal(false); resetAutoParseForm();}} className="px-6 py-3 text-slate-400 font-bold hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-100">取消</button>
                {parseStep === 1 ? (
                  <button 
                    onClick={() => setParseStep(2)}
                    disabled={!newRuleName || !selectedDelimiter}
                    className="px-10 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    下一步 <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button 
                    onClick={handleConfirmAutoParse}
                    disabled={(Object.values(ruleMappings) as MappingConfig[]).filter(v => v.mode !== 'none' && v.target).length === 0}
                    className="px-12 py-3 bg-slate-900 text-white rounded-xl font-bold shadow-xl hover:bg-black transition-all disabled:opacity-50"
                  >
                    确认并自动打标
                  </button>
                )}
              </div>
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
              <div className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
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
                  <button onClick={() => setShowBulkTagModal(false)} className="px-10 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-xl hover:bg-black transition-all">确认绑定</button>
                </div>
              </div>
            </div>
            <button onClick={() => setShowBulkTagModal(false)} className="absolute top-8 right-8 p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-all z-[110]"><X className="w-6 h-6" /></button>
          </div>
        </div>
      )}

      {/* ADD MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 w-full max-w-md p-10 animate-in zoom-in-95 duration-200">
            <h4 className="font-bold text-2xl text-slate-800 mb-8">新增广告系列</h4>
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-3">系列名称</label>
                <input 
                  type="text" 
                  autoFocus 
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none text-sm" 
                  placeholder="例如: US_Promo_V1" 
                  value={newCampaignName} 
                  onChange={e => setNewCampaignName(e.target.value)} 
                />
              </div>
            </div>
            <div className="flex gap-4 mt-12">
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-4 text-slate-500 hover:bg-slate-50 rounded-2xl transition-all">取消</button>
              <button onClick={() => {
                if (!newCampaignName) return;
                const newC: Campaign = {
                  id: Math.floor(Math.random() * 1000000).toString(),
                  name: newCampaignName,
                  platform: 'Google',
                  spend: 0,
                  impressions: 0,
                  clicks: 0,
                  conversions: 0,
                  tags: [],
                  status: 'active'
                };
                setCampaigns(prev => [...prev, newC]);
                setShowAddModal(false);
                setNewCampaignName('');
              }} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg hover:bg-indigo-700 transition-all">确认添加</button>
            </div>
          </div>
        </div>
      )}

      {/* BULK IMPORT MODAL */}
      {showImportModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white"><Upload className="w-6 h-6" /></div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">批量导入标签</h3>
                  <p className="text-xs text-slate-400 mt-0.5">通过 CSV 文件批量更新广告系列的标签信息</p>
                </div>
              </div>
              <button onClick={() => {setShowImportModal(false); setImportRows([]);}} className="p-2 hover:bg-white rounded-xl text-slate-400 transition-all border border-transparent hover:border-slate-100"><X className="w-6 h-6" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {!importRows.length ? (
                <div className="space-y-6">
                  <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-10 flex flex-col items-center text-center hover:bg-slate-100/50 transition-all group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <input type="file" ref={fileInputRef} className="hidden" accept=".csv" onChange={handleFileUpload} />
                    <div className="w-14 h-14 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-indigo-600 shadow-sm transition-all mb-4">
                       <FileText className="w-7 h-7" />
                    </div>
                    <h4 className="font-bold text-slate-800 mb-2 text-lg">点击选择或拖拽文件</h4>
                    <p className="text-sm text-slate-400">仅支持 .csv 格式文件</p>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl">
                    <span className="text-sm text-slate-600 font-medium">需要标准导入模板？</span>
                    <button onClick={handleDownloadTemplate} className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-white px-4 py-2 rounded-lg border border-indigo-100 shadow-sm transition-all">下载模板 (.csv)</button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-800 flex items-center gap-2">导入预览 ({importRows.filter(r => r.isValid).length} 条有效数据)</h4>
                  <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-100 font-bold text-[10px] text-slate-400 uppercase">
                        <tr><th className="px-6 py-3">ID</th><th className="px-6 py-3">标签</th><th className="px-6 py-3">状态</th></tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {importRows.map((row, idx) => (
                          <tr key={idx} className={row.isValid ? '' : 'bg-red-50/30'}>
                            <td className="px-6 py-3 font-mono">{row.id}</td>
                            <td className="px-6 py-3">{row.tags.join(', ')}</td>
                            <td className="px-6 py-3">{row.isValid ? <span className="text-emerald-600">有效</span> : <span className="text-red-500">{row.statusMessage}</span>}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
            <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-4">
              <button onClick={() => setShowImportModal(false)} className="px-6 py-3 text-slate-400 font-bold hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-100">取消</button>
              <button onClick={confirmImport} disabled={!importRows.some(r => r.isValid)} className="px-12 py-3 bg-slate-900 text-white rounded-xl font-bold shadow-xl hover:bg-black transition-all disabled:opacity-30">确认导入</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Explorer;