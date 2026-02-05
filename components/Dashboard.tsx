
import React from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend 
} from 'recharts';
import { Campaign, TagCategory } from '../types';
import { TrendingUp, DollarSign, Target, MousePointer2 } from 'lucide-react';

interface DashboardProps {
  campaigns: Campaign[];
}

const Dashboard: React.FC<DashboardProps> = ({ campaigns }) => {
  const totalSpend = campaigns.reduce((acc, c) => acc + c.spend, 0);
  const totalConversions = campaigns.reduce((acc, c) => acc + c.conversions, 0);
  const avgCPA = totalConversions > 0 ? totalSpend / totalConversions : 0;
  
  // 计算标签分布
  const tagCounts: Record<string, number> = {};
  campaigns.forEach(c => {
    c.tags.forEach(t => {
      tagCounts[t] = (tagCounts[t] || 0) + 1;
    });
  });

  const pieData = Object.entries(tagCounts).map(([name, value]) => ({ name, value }));
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#14B8A6'];

  const barData = campaigns.slice(0, 5).map(c => ({
    name: c.name.length > 8 ? c.name.substring(0, 8) + '...' : c.name,
    消耗: c.spend,
    转化: c.conversions * 10, // 为了图表显示比例更清晰进行缩放
  }));

  const stats = [
    { label: '总广告消耗', value: `¥${totalSpend.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: '总转化量', value: totalConversions.toLocaleString(), icon: Target, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: '平均转化成本', value: `¥${avgCPA.toFixed(2)}`, icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: '投放中系列', value: campaigns.length, icon: MousePointer2, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <span className="text-xs font-medium text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">+12.5%</span>
            </div>
            <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-6">消耗与转化趋势</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="消耗" fill="#6366F1" radius={[4, 4, 0, 0]} name="广告消耗 (¥)" />
                <Bar dataKey="转化" fill="#10B981" radius={[4, 4, 0, 0]} name="转化量 (x10)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-6">自定义标签分布</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [value, `标签: ${name}`]} />
                <Legend verticalAlign="bottom" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
