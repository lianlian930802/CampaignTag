
import React from 'react';
import Layout from './components/Layout';
import Explorer from './components/Explorer';
import TagManagement from './components/TagManagement';
import TemplateManagement from './components/TemplateManagement';
import { Campaign, ViewType, TagCategory } from './types';
import { INITIAL_CAMPAIGNS, TAG_CATEGORIES } from './constants';

const App: React.FC = () => {
  const [activeView, setActiveView] = React.useState<ViewType>('account-mgmt');
  const [campaigns, setCampaigns] = React.useState<Campaign[]>(INITIAL_CAMPAIGNS);
  const [tagCategories, setTagCategories] = React.useState<TagCategory[]>(TAG_CATEGORIES);

  const renderView = () => {
    switch (activeView) {
      case 'explorer':
        return (
          <Explorer 
            campaigns={campaigns} 
            setCampaigns={setCampaigns} 
            tagCategories={tagCategories} 
            setTagCategories={setTagCategories}
          />
        );
      case 'tag-management':
        return (
          <TagManagement 
            tagCategories={tagCategories} 
            setTagCategories={setTagCategories} 
            campaigns={campaigns}
          />
        );
      case 'template-mgmt':
        return <TemplateManagement />;
      case 'account-mgmt':
        return (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <h2 className="text-xl font-bold text-slate-800 mb-4">账户管理</h2>
            <p className="text-slate-500">正在加载 Impact, Awin, Levanta 等账户数据...</p>
            <div className="mt-8 flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          </div>
        );
      default:
        return (
          <div className="p-20 text-center text-slate-400 italic">
            此功能页面模块正在构建中...
          </div>
        );
    }
  };

  return (
    <Layout activeView={activeView} setActiveView={setActiveView}>
      {renderView()}
    </Layout>
  );
};

export default App;
