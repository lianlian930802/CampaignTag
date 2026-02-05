
import React from 'react';
import { 
  Table, 
  Database, 
  Settings, 
  BarChart3, 
  HelpCircle,
  Menu,
  Tags,
  ChevronDown,
  ChevronRight,
  User,
  FolderOpen,
  Briefcase,
  Download,
  ArrowLeft,
  Info,
  Globe,
  Bell,
  LayoutTemplate,
  Send
} from 'lucide-react';
import { ViewType } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeView, setActiveView }) => {
  const [openGroups, setOpenGroups] = React.useState<string[]>(['delivery']);

  const toggleGroup = (group: string) => {
    setOpenGroups(prev => 
      prev.includes(group) ? prev.filter(g => g !== group) : [...prev, group]
    );
  };

  const navGroups = [
    {
      id: 'delivery',
      label: '广告投放',
      items: [
        { id: 'asset-mgmt', label: '素材管理' },
        { id: 'explorer', label: '广告标签' },
      ]
    }
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-white font-sans text-slate-700">
      {/* 极简图标侧边栏 (最左侧) */}
      <aside className="w-14 bg-white border-r border-slate-100 flex flex-col items-center py-4 space-y-6 shrink-0">
        <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center text-white mb-2">
          <BarChart3 className="w-5 h-5" />
        </div>
        <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><Database className="w-5 h-5" /></button>
        <button className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><FolderOpen className="w-5 h-5" /></button>
        <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><Briefcase className="w-5 h-5" /></button>
        <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><Download className="w-5 h-5" /></button>
        <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><User className="w-5 h-5" /></button>
        <div className="flex-1"></div>
        <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><Menu className="w-5 h-5" /></button>
      </aside>

      {/* 导航侧边栏 (中间栏) */}
      <aside className="w-52 bg-slate-50/50 border-r border-slate-100 flex flex-col shrink-0">
        <div className="p-4">
          <button className="w-full flex items-center justify-between p-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 shadow-sm transition-all mb-4">
            <span className="flex items-center gap-2"><ArrowLeft className="w-4 h-4" /> 返回</span>
          </button>
          <div className="flex items-center justify-between text-[11px] text-slate-400 px-2 mb-4">
            <span className="truncate">投放中心</span>
            <Info className="w-3 h-3" />
          </div>

          <div className="space-y-1">
            <button 
              onClick={() => setActiveView('account-mgmt')}
              className={`w-full text-left px-3 py-2 rounded text-sm transition-colors flex items-center gap-2 ${activeView === 'account-mgmt' ? 'bg-indigo-50 text-indigo-700 font-medium' : 'hover:bg-slate-100'}`}
            >
              <Database className="w-4 h-4" /> 账户管理
            </button>

            {navGroups.map(group => (
              <div key={group.id} className="pt-2">
                <button 
                  onClick={() => toggleGroup(group.id)}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider hover:text-slate-600"
                >
                  <span className="flex items-center gap-2">
                    {group.id === 'delivery' ? <SendIcon className="w-3.5 h-3.5 rotate-[-45deg]" /> : <Table className="w-3.5 h-3.5" />}
                    {group.label}
                  </span>
                  {openGroups.includes(group.id) ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                </button>
                {openGroups.includes(group.id) && (
                  <div className="mt-1 space-y-0.5 pl-4">
                    {group.items.map(item => (
                      <button
                        key={item.id}
                        onClick={() => setActiveView(item.id as ViewType)}
                        className={`w-full text-left px-3 py-1.5 rounded text-sm transition-colors ${activeView === item.id ? 'text-indigo-600 font-medium bg-white shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'}`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <div className="pt-4 mt-4 border-t border-slate-100 space-y-1">
              <button 
                onClick={() => setActiveView('template-mgmt')}
                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors flex items-center gap-2 ${activeView === 'template-mgmt' ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-500 hover:bg-slate-100'}`}
              >
                <LayoutTemplate className="w-4 h-4" /> 模板管理
              </button>
              <button 
                onClick={() => setActiveView('tag-management')}
                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors flex items-center gap-2 ${activeView === 'tag-management' ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-500 hover:bg-slate-100'}`}
              >
                <Tags className="w-4 h-4" /> 标签管理
              </button>
              <button className="w-full text-left px-3 py-2 rounded text-sm text-slate-500 hover:bg-slate-100 flex items-center gap-2">
                <Settings className="w-4 h-4" /> 项目设置
              </button>
            </div>
          </div>
        </div>
        <div className="flex-1"></div>
        <div className="p-4 border-t border-slate-100">
           <button className="w-full flex items-center gap-2 p-2 text-xs text-slate-400 hover:text-slate-600">
             <Menu className="w-4 h-4" /> 收起侧边栏
           </button>
        </div>
      </aside>

      {/* 主界面 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 顶部标题栏 */}
        <header className="h-14 bg-white border-b border-slate-100 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded flex items-center justify-center text-white shadow-sm">
              <BarChart3 className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-800 tracking-tight">AI 营销平台</span>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer hover:text-slate-800">
              <Globe className="w-4 h-4" /> 简体(中文)
            </div>
            <button className="text-slate-400 hover:text-slate-600 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
              <div className="text-right">
                <div className="text-xs font-bold text-slate-700">AIADMIN</div>
                <div className="text-[10px] text-slate-400">admin@bluefocus.com</div>
              </div>
              <div className="w-8 h-8 rounded bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white uppercase shadow-sm">
                Admin
              </div>
            </div>
          </div>
        </header>

        {/* 内容区 */}
        <main className="flex-1 overflow-auto bg-slate-50/30">
          <div className="p-8 max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

const SendIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"></line>
    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
  </svg>
);

export default Layout;
