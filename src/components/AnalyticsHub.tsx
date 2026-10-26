import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  ShieldCheck, 
  Clock, 
  HelpCircle, 
  ArrowUpRight, 
  Activity,
  Layers,
  Sparkles,
  PieChart
} from 'lucide-react';
import { mockAnalyticsData } from '../data/mockData';

export const AnalyticsHub: React.FC = () => {
  const data = mockAnalyticsData;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Analytics Banner */}
      <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <BarChart3 size={20} style={{ color: '#6366f1' }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Brand Governance Intelligence & Drift Analytics</h2>
          </div>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
            Organizational metrics tracking brand compliance velocity, recurring guideline friction points, and guideline clarity.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="pill pill-success" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>
            <Activity size={12} />
            <span>Health Status: Enterprise Prime</span>
          </span>
        </div>
      </div>

      {/* Top 4 Metric KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
        
        {/* KPI 1 */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Brand Health Index</span>
            <ShieldCheck size={16} style={{ color: '#10b981' }} />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#34d399', fontFamily: 'var(--font-display)' }}>
            {data.healthIndex}%
          </div>
          <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <TrendingUp size={12} style={{ color: '#10b981' }} />
            <span>+4.2% higher consistency vs. last quarter</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Pre-Publication Audits</span>
            <Layers size={16} style={{ color: '#6366f1' }} />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
            {data.totalAuditsThisMonth.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>
            Across 14 distributed teams and 3 PR agencies
          </div>
        </div>

        {/* KPI 3 */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Prevented High-Risk Claims</span>
            <AlertTriangle size={16} style={{ color: '#f59e0b' }} />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#fbbf24', fontFamily: 'var(--font-display)' }}>
            {data.preventedHighRiskViolations}
          </div>
          <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>
            Unsupported stats & prohibited absolutes caught early
          </div>
        </div>

        {/* KPI 4 */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Avg. Review Turnaround</span>
            <Clock size={16} style={{ color: '#38bdf8' }} />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'var(--font-display)' }}>
            {data.avgReviewTurnaroundHours} hrs
          </div>
          <div style={{ fontSize: '0.725rem', color: '#34d399' }}>
            Accelerated from 4.8 days ({data.turnaroundReductionPercent}% reduction)
          </div>
        </div>

      </div>

      {/* Breakthrough Feature 2: Guideline Ambiguity & Friction Radar */}
      <div className="glass-card" style={{ border: '1px solid rgba(99, 102, 241, 0.35)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={18} style={{ color: '#818cf8' }} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>
              Guideline Ambiguity & Friction Radar (Named Improvement #2)
            </h3>
          </div>
          <span className="pill pill-suggestion" style={{ fontSize: '0.7rem' }}>
            Continuous Guideline Refinement Loop
          </span>
        </div>

        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          Identifies brand rules that generate the most creator friction, exemption requests, or repeat violations—empowering brand guardians to clarify ambiguous documentation.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
          {data.frictionRadar.map(item => (
            <div
              key={item.ruleId}
              style={{
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="font-mono" style={{ fontSize: '0.725rem', color: '#818cf8', fontWeight: 600 }}>
                  {item.ruleId}
                </span>
                <span
                  className="pill"
                  style={{
                    fontSize: '0.65rem',
                    background: item.frictionScore > 75 ? 'var(--danger-bg)' : item.frictionScore > 50 ? 'var(--warning-bg)' : 'var(--success-bg)',
                    color: item.frictionScore > 75 ? '#fb7185' : item.frictionScore > 50 ? '#fbbf24' : '#34d399'
                  }}
                >
                  Friction Index: {item.frictionScore}/100
                </span>
              </div>

              <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                {item.ruleTitle}
              </div>

              {/* Progress Bar */}
              <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div style={{
                  width: `${item.frictionScore}%`,
                  height: '100%',
                  backgroundColor: item.frictionScore > 75 ? '#f43f5e' : item.frictionScore > 50 ? '#f59e0b' : '#10b981',
                  borderRadius: 'var(--radius-full)'
                }} />
              </div>

              <div style={{
                marginTop: '0.35rem',
                padding: '0.5rem',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.725rem',
                color: 'var(--text-secondary)'
              }}>
                <strong style={{ color: '#c7d2fe' }}>Brand Director Recommendation:</strong> {item.recommendation}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Layout: Repeated Mistakes & Department Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '1.5rem' }}>
        
        {/* Repeated Mistakes Breakdown */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <PieChart size={18} style={{ color: '#f59e0b' }} />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Repeated Brand Inconsistencies by Category</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {data.repeatedMistakesByCategory.map(item => (
              <div key={item.category}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{item.category}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{item.count} incidents ({item.percentage}%)</span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                  <div style={{
                    width: `${item.percentage * 2}%`,
                    maxWidth: '100%',
                    height: '100%',
                    backgroundColor: item.color,
                    borderRadius: 'var(--radius-full)'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Department Compliance Matrix */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Layers size={18} style={{ color: '#10b981' }} />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Team & Agency Compliance Comparison</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {data.departmentCompliance.map(dep => (
              <div
                key={dep.department}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                    {dep.department}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {dep.auditsCount} pre-publication scans completed
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: dep.score >= 90 ? '#34d399' : dep.score >= 80 ? '#fbbf24' : '#fb7185' }}>
                    {dep.score}%
                  </div>
                  <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)' }}>Compliance Rate</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
