import React from 'react';
import { 
  FileEdit, 
  Eye, 
  BookOpen, 
  GitPullRequest, 
  BarChart3,
  CheckCheck
} from 'lucide-react';

export type ActiveTab = 'editor' | 'visual' | 'vault' | 'workflow' | 'analytics';

interface NavigationProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  pendingIssuesCount: number;
  commentsCount: number;
  isApproved: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onChangeTab,
  pendingIssuesCount,
  commentsCount,
  isApproved
}) => {
  return (
    <nav className="main-nav">
      <button 
        className={`nav-tab-btn ${activeTab === 'editor' ? 'active' : ''}`}
        onClick={() => onChangeTab('editor')}
      >
        <FileEdit size={16} />
        <span>Pre-Publication Studio</span>
        {pendingIssuesCount > 0 ? (
          <span className="nav-counter alert" title={`${pendingIssuesCount} pending brand issues`}>
            {pendingIssuesCount}
          </span>
        ) : isApproved ? (
          <CheckCheck size={14} style={{ color: '#10b981' }} />
        ) : null}
      </button>

      <button 
        className={`nav-tab-btn ${activeTab === 'visual' ? 'active' : ''}`}
        onClick={() => onChangeTab('visual')}
      >
        <Eye size={16} />
        <span>Visual & Asset Inspector</span>
      </button>

      <button 
        className={`nav-tab-btn ${activeTab === 'vault' ? 'active' : ''}`}
        onClick={() => onChangeTab('vault')}
      >
        <BookOpen size={16} />
        <span>Brand Vault & Knowledge Base</span>
      </button>

      <button 
        className={`nav-tab-btn ${activeTab === 'workflow' ? 'active' : ''}`}
        onClick={() => onChangeTab('workflow')}
      >
        <GitPullRequest size={16} />
        <span>Review & Approvals Hub</span>
        {commentsCount > 0 && (
          <span className="nav-counter" title={`${commentsCount} comments`}>
            {commentsCount}
          </span>
        )}
      </button>

      <button 
        className={`nav-tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
        onClick={() => onChangeTab('analytics')}
      >
        <BarChart3 size={16} />
        <span>Governance Analytics</span>
      </button>
    </nav>
  );
};
