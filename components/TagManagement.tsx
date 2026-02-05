
import React, { useState, useMemo } from 'react';
import { 
  Plus, Trash2, GripVertical, Hash, 
  Info, Tags, AlertCircle, Save, Check, X, AlertTriangle
} from 'lucide-react';
import { TagCategory, Campaign } from '../types';

interface TagManagementProps {
  tagCategories: TagCategory[];
  setTagCategories: React.Dispatch<React.SetStateAction<TagCategory[]>>;
  campaigns: Campaign[];
}

const PRESET_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#6366F1', 
  '#EC4899', '#8B5CF6', '#14B8A6', '#F97316', '#475569'
];

const TagManagement: React.FC<TagManagementProps> = ({ tagCategories, setTagCategories, campaigns }) => {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(tagCategories[0]?.name || '');
  
  // Error Modal State
  const [errorModal, setErrorModal] = useState<{ show: boolean, title: string, tagName: string, count: number }>({
    show: false,
    title: '',
    tagName: '',
    count: 0
  });

  const addCategory = () => {
    const names = newCategoryName.split('\n').map(s => s.trim()).filter(Boolean);
    if (names.length === 0) return;
    let updatedCategories = [...tagCategories];
    names.forEach(name => {
      if (!updatedCategories.some(c => c.name === name)) {
        updatedCategories.push({ name, tags: [] });
      }
    });
    setTagCategories(updatedCategories);
    setNewCategoryName('');
  };

  const deleteCategory = (name: string) => {
    const category = tagCategories.find(c => c.name === name);
    if (!category) return;
    
    // Check if any tag in this category is currently being used by any campaign
    const usedTagsList = category.tags.filter(tag => 
      campaigns.some(c => c.tags.some(t => t.trim() === tag.label.trim()))
    );

    if (usedTagsList.length > 0) {
      setErrorModal({
        show: true,
        title: '无法删除该维度',
        tagName: `分类: ${name}`,
        count: usedTagsList.length
      });
      return;
    }

    if (confirm(`确定要删除分类 "${name}" 吗？该分类下的所有二级标签也将被删除。`)) {
      setTagCategories(tagCategories.filter(c => c.name !== name));
      if (selectedCategoryId === name) setSelectedCategoryId('');
    }
  };

  const addTag = (categoryName: string) => {
    const labels = newTagName.split('\n').map(s => s.trim()).filter(Boolean);
    if (labels.length === 0) return;
    setTagCategories(prev => prev.map(cat => {
      if (cat.name === categoryName) {
        const newTags = [...cat.tags];
        labels.forEach(label => {
          if (!newTags.some(t => t.label === label)) {
            newTags.push({
              id: `tag-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              label,
              color: PRESET_COLORS[newTags.length % PRESET_COLORS.length],
              category: categoryName
            });
          }
        });
        return { ...cat, tags: newTags };
      }
      return cat;
    }));
    setNewTagName('');
  };

  const deleteTag = (categoryName: string, tagId: string, tagLabel: string) => {
    // Robust check for tag usage in campaigns
    const usedInCampaigns = campaigns.filter(c => 
      c.tags.some(t => t.trim() === tagLabel.trim())
    );
    
    if (usedInCampaigns.length > 0) {
      setErrorModal({
        show: true,
        title: '标签正在使用中',
        tagName: tagLabel,
        count: usedInCampaigns.length
      });
      return;
    }

    setTagCategories(tagCategories.map(cat => {
      if (cat.name === categoryName) {
        return { ...cat, tags: cat.tags.filter(t => t.id !== tagId) };
      }
      return cat;
    }));
  };

  const selectedCategory = useMemo(() => 
    tagCategories.find(c => c.name === selectedCategoryId),
    [tagCategories, selectedCategoryId]
  );

  return (
    <div className="space-y-10 pb-20 relative">
      <div className="flex items-center justify-between border-b border-slate-200 pb-6">
        <div>
          <h3 className="font-bold text-slate-800 flex items-center gap-2 text-2xl tracking-tight">
            <Tags className="w-7 h-7 text-indigo-600" />
            标签体系管理
          </h3>
          <p className="text-sm text-slate-400 mt-1">配置全局通用的多级打标维度，用于对广告系列进行精细化分类</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* L1 Categories Column */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[550px] overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50">
            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-3 flex items-center gap-1.5"><Plus className="w-3 h-3" /> 新增打标维度 (L1)</p>
            <div className="flex gap-2">
              <input type="text" placeholder="输入维度名称..." className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 outline-none" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCategory()} />
              <button onClick={addCategory} className="px-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-xs font-bold transition-all">添加</button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
            {tagCategories.map((cat) => (
              <div key={cat.name} onClick={() => setSelectedCategoryId(cat.name)} className={`group flex items-center justify-between p-3.5 rounded-xl cursor-pointer transition-all ${selectedCategoryId === cat.name ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm' : 'hover:bg-slate-50 text-slate-600 border border-transparent'}`}>
                <span className="text-sm font-bold">{cat.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-white px-2 py-0.5 rounded-full border border-slate-100 text-slate-400 font-bold">{cat.tags.length}</span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteCategory(cat.name); }} 
                    className="p-1.5 opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-white rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* L2 Tags Column */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[550px] overflow-hidden">
          {selectedCategory ? (
            <>
              <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 text-lg">"{selectedCategory.name}" 的二级标签</h4>
                  <p className="text-xs text-slate-400 mt-0.5">L2 具体可选标签值</p>
                </div>
                <div className="flex gap-2">
                  <input type="text" placeholder="输入标签值..." className="w-48 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none" value={newTagName} onChange={(e) => setNewTagName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTag(selectedCategory.name)} />
                  <button onClick={() => addTag(selectedCategory.name)} className="px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold text-xs">新增</button>
                </div>
              </div>
              <div className="p-6 flex-1 overflow-y-auto grid grid-cols-2 lg:grid-cols-3 gap-4 content-start custom-scrollbar">
                {selectedCategory.tags.map((tag) => (
                  <div key={tag.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl bg-slate-50/20 group hover:border-indigo-100 hover:bg-white hover:shadow-md transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tag.color }}></div>
                      <span className="text-sm text-slate-700 font-bold">{tag.label}</span>
                    </div>
                    <button 
                      onClick={() => deleteTag(selectedCategory.name, tag.id, tag.label)} 
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {selectedCategory.tags.length === 0 && <div className="col-span-full py-32 text-center text-slate-300 italic text-sm">暂无标签值</div>}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <Info className="w-12 h-12 text-slate-100 mb-4" />
              <p className="text-sm font-medium">请从左侧选择一个维度进行管理</p>
            </div>
          )}
        </div>
      </div>

      {/* Error Modal (Tag in use) */}
      {errorModal.show && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 w-full max-w-md p-10 animate-in zoom-in-95 duration-200 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center text-red-500 mb-6">
              <AlertTriangle className="w-10 h-10" />
            </div>
            <h4 className="font-bold text-2xl text-slate-800 mb-2">{errorModal.title}</h4>
            <div className="text-sm text-slate-500 leading-relaxed mb-8">
              <p>标签/维度 <span className="text-indigo-600 font-bold">"{errorModal.tagName}"</span></p>
              <p className="mt-1">目前正在 <span className="text-slate-800 font-extrabold underline decoration-indigo-300 underline-offset-4">{errorModal.count}</span> 个广告系列中使用。</p>
              <p className="mt-4 text-slate-400">请先在 <span className="font-bold text-slate-600">广告标签</span> 页面移除相关标记后再尝试删除。</p>
            </div>
            <button 
              onClick={() => setErrorModal({ show: false, title: '', tagName: '', count: 0 })}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-xl hover:bg-black transition-all"
            >
              我知道了
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TagManagement;
