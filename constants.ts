
import { Campaign, TagCategory, BitableTemplate } from './types';

export const INITIAL_CAMPAIGNS: Campaign[] = [
  { id: '2', name: 'US_效果_运动鞋_谷歌搜索', platform: 'Google', spend: 8900.00, impressions: 250000, clicks: 12000, conversions: 1200, tags: ['效果营销', '运动鞋'], status: 'active' },
  { id: '5', name: 'UK_品牌认知_谷歌展示广告', platform: 'Google', spend: 4500.00, impressions: 800000, clicks: 4000, conversions: 50, tags: ['品牌'], status: 'active' },
];

export const TAG_CATEGORIES: TagCategory[] = [
  {
    name: '营销目标',
    tags: [
      { id: 't1', label: '品牌', color: '#3B82F6', category: '营销目标' },
      { id: 't2', label: '效果营销', color: '#10B981', category: '营销目标' },
      { id: 't3', label: '再营销', color: '#F59E0B', category: '营销目标' },
    ],
  },
  {
    name: '季节/活动',
    tags: [
      { id: 't4', label: '夏季', color: '#EF4444', category: '季节/活动' },
      { id: 't5', label: '冬季', color: '#6366F1', category: '季节/活动' },
      { id: 't6', label: '闪购', color: '#EC4899', category: '季节/活动' },
    ],
  },
  {
    name: '产品线',
    tags: [
      { id: 'p1', label: '运动鞋', color: '#8B5CF6', category: '产品线' },
      { id: 'p2', label: '服装', color: '#14B8A6', category: '产品线' },
      { id: 'p3', label: '配饰', color: '#F97316', category: '产品线' },
      { id: 'p4', label: '达人营销', color: '#f43f5e', category: '产品线' },
      { id: 'p5', label: '户外装备', color: '#10B981', category: '产品线' },
      { id: 'p6', label: '智能穿戴', color: '#3B82F6', category: '产品线' },
      { id: 'p7', label: '个护美妆', color: '#EC4899', category: '产品线' },
      { id: 'p8', label: '家居用品', color: '#6B7280', category: '产品线' },
      { id: 'p9', label: '数码配件', color: '#111827', category: '产品线' },
      { id: 'p10', label: '宠物用品', color: '#D946EF', category: '产品线' },
      { id: 'p11', label: '童装童鞋', color: '#FACC15', category: '产品线' },
      { id: 'p12', label: '母婴产品', color: '#FB923C', category: '产品线' },
      { id: 'p13', label: '健身器械', color: '#4ADE80', category: '产品线' },
      { id: 'p14', label: '生活小家电', color: '#2DD4BF', category: '产品线' },
      { id: 'p15', label: '潮流玩具', color: '#A855F7', category: '产品线' },
    ],
  },
];

export const BITABLE_TEMPLATES: BitableTemplate[] = [
  {
    id: 'tmpl_1',
    name: 'Google预算调整模板',
    description: '用于动态调整 Google Ads 各系列的每日预算，支持自动化同步与审批流程。',
    url: 'https://feishu.cn/base/template/google_budget_adj',
    icon: '💰'
  },
  {
    id: 'tmpl_2',
    name: 'Meta广告创编模板',
    description: '集成 Meta 广告架构的创编规范，支持批量素材管理与文案预览。',
    url: 'https://feishu.cn/base/template/meta_creative_build',
    icon: '📱'
  },
  {
    id: 'tmpl_3',
    name: 'Google预算下线模板',
    description: '管理投放结束或异常下线的 Google 系列，自动归档并统计消耗偏差。',
    url: 'https://feishu.cn/base/template/google_offline_mgmt',
    icon: '🛑'
  },
  {
    id: 'tmpl_4',
    name: 'Google数据分析模板',
    description: '全量 Google 投放数据透视，包含转化漏斗、关键词贡献度及人群画像分析。',
    url: 'https://feishu.cn/base/template/google_data_analysis',
    icon: '📈'
  }
];
