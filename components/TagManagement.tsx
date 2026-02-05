
import React, { useState } from 'react';
import { 
  Plus, Trash2, GripVertical, Hash, 
  Info, Tags, AlertCircle, Save, Check, Bookmark, BookmarkPlus, X
} from 'lucide-react';
import { TagCategory, Campaign, TagCombination } from '../types';

interface TagManagementProps {
  tagCategories: TagCategory[];
  setTagCategories: React.Dispatch<React.SetStateAction<TagCategory[]>>;
  campaigns: Campaign[];
}

const PRESET_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#6366F1', 
  '#EC4899', '#8B5CF6', '#14B8A6', '#F97316', '#475569'
];

const TagManagement: React.FC<TagManagementProps> = ({ tagCategories, setTagCategories }) => {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(tagCategories[0]?.name || '');
  const [combinations, setCombinations] = useState<TagCombination[]>([]);
  const [isCreatingCombination, setIsCreatingCombination] = useState(false);
  const [newCombinationName, setNewCombinationName] = useState('');
  const [tempCombinationTags, setTempCombinationTags] = useState<Record<string, string>>({});

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

  const deleteTag = (categoryName: string, tagId: string) => {
    setTagCategories(tagCategories.map(cat => {
      if (cat.name === categoryName) {
        return { ...cat, tags: cat.tags.filter(t => t.id !== tagId) };
      }
      return cat;
    }));
  };

  const saveCombination = () => {
    if (!newCombinationName.trim()) return;
    // Fix: Cast the values to string[] as Object.values can sometimes return unknown[] depending on the TS target environment
    const tagList = Object.values(tempCombinationTags) as string[];
    if (tagList.length === 0) return;
    const newCombo: TagCombination = {
      id: Date.now().toString(),
      name: newCombinationName,
      tags: tagList
    };
    setCombinations([...combinations, newCombo]);
    setNewCombinationName('');
    setTempCombinationTags({});
    setIsCreatingCombination(false);
  };

  const deleteCombination = (id: string) => {
    setCombinations(combinations.filter(c => c.id !== id));
  };

  const toggleTagInCombination = (categoryName: string, tagLabel: string) => {
    setTempCombinationTags(prev => {
      const next = { ...prev };
      if (next[categoryName] === tagLabel) {
        delete next[categoryName];
      } else {
        next[categoryName] = tagLabel;
      }
      return next;
    });
  };

  const selectedCategory = tagCategories.find(c => c.name === selectedCategoryId);

  return (
    <div className="space-y-10 pb-20">
      <div className="flex items-center justify-between border-b border-slate-200 pb-6">
        <div>
          <h3 className="font-bold text-slate-800 flex items-center gap-2 text-2xl tracking-tight">
            <Tags className="w-7 h-7 text-indigo-600" />
            标签体系与预设管理
          </h3>
          <p className="text-sm text-slate-400 mt-1">配置全局通用的多级打标维度，并可保存常用的组合推荐</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[550px] overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50">
            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-3 flex items-center gap-1.5"><Plus className="w-3 h-3" /> 新增打标维度 (L1)</p>
            <div className="flex gap-2">
              <input type="text" placeholder="输入维度名称..." className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 outline-none" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCategory()} />
              <button onClick={addCategory} className="px-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-xs font-bold transition-all">添加</button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {tagCategories.map((cat) => (
              <div key={cat.name} onClick={() => setSelectedCategoryId(cat.name)} className={`group flex items-center justify-between p-3.5 rounded-xl cursor-pointer transition-all ${selectedCategoryId === cat.name ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'hover:bg-slate-50 text-slate-600 border border-transparent'}`}>
                <span className="text-sm font-bold">{cat.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-white px-2 py-0.5 rounded-full border border-slate-100 text-slate-400 font-bold">{cat.tags.length}</span>
                  <button onClick={(e) => { e.stopPropagation(); deleteCategory(cat.name); }} className="p-1 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>

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
              <div className="p-6 flex-1 overflow-y-auto grid grid-cols-2 lg:grid-cols-3 gap-4 content-start">
                {selectedCategory.tags.map((tag) => (
                  <div key={tag.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl bg-slate-50/20 group hover:border-indigo-100 hover:bg-white hover:shadow-sm transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tag.color }}></div>
                      <span className="text-sm text-slate-700 font-bold">{tag.label}</span>
                    </div>
                    <button onClick={() => deleteTag(selectedCategory.name, tag.id)} className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
                {selectedCategory.tags.length === 0 && <div className="col-span-full py-32 text-center text-slate-300 italic text-sm">暂无标签值</div>}
              </div>
            </>
          ) : <div className="flex flex-col items-center justify-center h-full text-slate-400"><Info className="w-12 h-12 text-slate-100 mb-4" /><p className="text-sm font-medium">请从左侧选择一个维度进行管理</p></div>}
        </div>
      </div>

      <div className="space-y-6">
        <h4 className="font-bold text-slate-800 flex items-center gap-2 text-xl">
          <Bookmark className="w-6 h-6 text-indigo-600" />
          已保存的标签组合 (Presets)
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {combinations.map(combo => (
            <div key={combo.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-200 transition-all group">
              <div className="flex items-center justify-between mb-4">
                <h5 className="font-bold text-slate-800 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600"><Bookmark className="w-4 h-4" /></div>
                  {combo.name}
                </h5>
                <button onClick={() => deleteCombination(combo.id)} className="p-2 text-slate-300 hover:text-red-500 rounded-lg hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-4 h-4" /></button>
              </div>
              <div className="flex flex-wrap gap-2">
                {combo.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-slate-50 text-slate-500 text-[10px] font-bold rounded-lg border border-slate-100">{tag}</span>
                ))}
              </div>
            </div>
          ))}
          {combinations.length === 0 && <div className="col-span-full py-16 text-center text-slate-400 italic bg-white rounded-2xl border border-dashed border-slate-200">创建您的预设模板后将在此显示</div>}
        </div>
      </div>

      {isCreatingCombination && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white"><BookmarkPlus className="w-6 h-6" /></div>
                <div><h4 className="font-bold text-xl text-slate-800">创建常用组合</h4><p className="text-xs text-slate-400">每个维度只能选择一个核心标签值</p></div>
              </div>
              <button onClick={() => setIsCreatingCombination(false)} className="p-3 hover:bg-white rounded-2xl text-slate-400 transition-all border border-transparent hover:border-slate-200"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">组合名称</label>
                <input type="text" placeholder="例如: 夏季运动鞋大促专用打标" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none text-sm font-bold" value={newCombinationName} onChange={e => setNewCombinationName(e.target.value)} />
              </div>
              {tagCategories.map(cat => (
                <div key={cat.name} className="space-y-4">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div> {cat.name}</p>
                  <div className="flex flex-wrap gap-2">
                    {cat.tags.map(tag => (
                      <button key={tag.id} onClick={() => toggleTagInCombination(cat.name, tag.label)} className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${tempCombinationTags[cat.name] === tag.label ? 'bg-indigo-600 text-white border-transparent shadow-lg shadow-indigo-100 scale-105' : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-200 hover:bg-slate-50'}`}>{tag.label}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button onClick={saveCombination} disabled={!newCombinationName || Object.keys(tempCombinationTags).length === 0} className="px-10 py-4 bg-slate-900 text-white rounded-2xl text-sm font-bold hover:bg-black transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed">保存并发布组合</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TagManagement;
