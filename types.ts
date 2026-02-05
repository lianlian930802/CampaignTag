
export interface Campaign {
  id: string;
  name: string;
  platform: 'Google';
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  tags: string[];
  status: 'active' | 'paused' | 'completed';
}

export interface TagDefinition {
  id: string;
  label: string;
  color: string;
  category: string;
}

export interface TagCategory {
  name: string;
  tags: TagDefinition[];
}

export interface TagCombination {
  id: string;
  name: string;
  tags: string[]; // List of tag labels
}

export interface BitableTemplate {
  id: string;
  name: string;
  description: string;
  url: string;
  icon: string;
}

export interface BoundBitable {
  id: string;
  templateId: string;
  name: string;
  url: string;
  boundAt: string;
}

export type ViewType = 
  | 'explorer' 
  | 'template-mgmt'
  | 'tag-management' 
  | 'account-mgmt' 
  | 'asset-mgmt'
  | 'snapchat-delivery';
