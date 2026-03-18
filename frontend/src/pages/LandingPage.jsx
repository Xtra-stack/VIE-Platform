import React from 'react';
import { useNavigate } from 'react-router-dom';
import { startDemoTrial } from '../services/api.js';
import { removeToken, setToken } from '../utils/auth.js';
import './LandingPage.css';

export default function LandingPage() {
  const navigate = useNavigate();

  const handleStartDemoTrial = async () => {
    try {
      const result = await startDemoTrial();
      removeToken();
      setToken(result.token, result.user.role, null, 'DEMO');
      navigate('/demo/dashboard', { replace: true });
    } catch (error) {
      alert(error.message || 'Failed to start demo trial');
    }
  };

  const workflowEvents = [
    'Task assigned by Manager',
    'Senior reviews approach',
    'Junior submits code',
    'Skill XP awarded',
  ];

  const learningGaps = [
    'Code repositories without team workflow',
    'Solo projects without real review cycles',
    'Tutorials that skip deployment & logistics',
    'Practice without accountability or mentorship',
  ];

  const learningFeatures = [
    'In-Browser Code Editor (Monaco)',
    'Simulated Terminal Environment',
    'Real-Time Code Review Workflow',
    'Skill Mastery Tracking System',
    'Measurable Learning Outcomes',
  ];

  const stats = [
    { label: 'Learning Roles', value: '4' },
    { label: 'Skill Categories', value: '7' },
    { label: 'Review Signals', value: '9' },
    { label: 'Accountability Loops', value: '∞' },
  ];

  const workflowSteps = [
    'Manager structures industry-style scenario',
    'Senior provides mentorship & guidance',
    'Junior builds in simulated environment',
    'Feedback loops drive skill level-up',
  ];

  const roleOutcomes = [
    {
      role: 'ADMIN',
      title: 'Organization Strategist',
      description: 'Shape the entire learning platform strategy and experience.',
      outcomes: [
        'Design workspace structure and team hierarchy',
        'Monitor organizational skill development metrics',
        'Allocate resources and set learning goals',
        'Configure role-based access controls',
      ],
    },
    {
      role: 'MANAGER',
      title: 'Project Lead & Scenario Designer',
      description: 'Define real-world tasks and ensure project delivery excellence.',
      outcomes: [
        'Structure industry-realistic project tasks',
        'Set success criteria and learning objectives',
        'Track team velocity and milestone completion',
        'Guide delivery while mentoring grows teams',
      ],
    },
    {
      role: 'SENIOR',
      title: 'Technical Mentor & Gate Keeper',
      description: 'Elevate code quality and accelerate learner growth through feedback.',
      outcomes: [
        'Review code submissions with expert precision',
        'Provide actionable, learning-focused feedback',
        'Maintain quality standards and best practices',
        'Unlock achievement badges and celebrate wins',
      ],
    },
    {
      role: 'JUNIOR',
      title: 'Learner & Developer in Training',
      description: 'Build real projects and grow from mentorship and hands-on work.',
      outcomes: [
        'Complete scoped, real-world tasks',
        'Apply feedback and iterate rapidly',
        'Track skill progress across 7 categories',
        'Earn achievements through consistent effort',
      ],
    },
  ];

  return (
    <div className="lp-page">
      <div className="lp-ambient" aria-hidden="true">
        <span className="lp-glow lp-glow-1"></span>
        <span className="lp-glow lp-glow-2"></span>
        <span className="lp-glow lp-glow-3"></span>
        <span className="lp-grid-sheen"></span>
      </div>

      <nav className="lp-nav">
        <div className="lp-nav-inner">
          <div className="lp-logo" aria-label="VIE Virtual Industry Experience">
            <span className="lp-logo-mark">
              <svg className="lp-logo-icon" viewBox="0 0 48 48" aria-hidden="true">
                <rect x="6" y="6" width="36" height="36" rx="10" />
                <path d="M16 17l8 14 8-14" />
                <path d="M16 31h16" />
              </svg>
              <span className="lp-logo-word">VIE</span>
            </span>
            <span className="lp-logo-stack">
              <span className="lp-logo-text">Virtual Industry Experience</span>
              <span className="lp-logo-sub">Learning Platform</span>
            </span>
          </div>

          <div className="lp-nav-links">
            <a className="lp-nav-link" href="#workflow">Workflow</a>
            <a className="lp-nav-link" href="#roles">Roles</a>
            <a className="lp-nav-link" href="#features">Features</a>
            <button className="lp-nav-btn" type="button" onClick={handleStartDemoTrial}>
              Start Demo
            </button>
          </div>
        </div>
      </nav>

      <main className="lp-main">
        <section className="lp-hero" id="top">
          <div className="lp-hero-grid">
            <div className="lp-hero-copy">
              <p className="lp-eyebrow">Industry simulation. Real learning outcomes.</p>
              <h1 className="lp-title">
                Learn how to ship code
                <span className="lp-title-accent">with your entire team</span>
              </h1>
              <p className="lp-subtitle">
                VIE combines in-browser coding, mentorship, peer review, and skill tracking into a complete 
                software delivery simulation. No setup, no deployments—just learning how real-world teams build.
              </p>
              <div className="lp-hero-actions">
                <button className="lp-btn lp-btn-primary" type="button" onClick={handleStartDemoTrial}>
                  Start Demo Trial
                </button>
                <button className="lp-btn lp-btn-ghost" type="button" onClick={() => navigate('/register')}>
                  Create Account
                </button>
                <button className="lp-btn lp-btn-link" type="button" onClick={() => navigate('/login')}>
                  Team Login
                </button>
              </div>
              <div className="lp-metric-grid">
                {stats.map((stat) => (
                  <div key={stat.label} className="lp-metric-card">
                    <span className="lp-metric-value">{stat.value}</span>
                    <span className="lp-metric-label">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lp-hero-panel">
              <div className="lp-panel-card">
                <div className="lp-panel-header">
                  <span className="lp-panel-title">Live Workflow Monitor</span>
                  <span className="lp-panel-pill">Realtime</span>
                </div>
                <div className="lp-panel-lines" aria-label="Workflow milestones">
                  {workflowEvents.map((event) => (
                    <div key={event} className="lp-panel-line">{`> ${event}`}</div>
                  ))}
                </div>
                <div className="lp-panel-footer">
                  <span className="lp-panel-meta">Last sync: just now</span>
                  <span className="lp-panel-meta">Learning: enabled</span>
                </div>
              </div>
              <div className="lp-panel-card lp-panel-secondary">
                <h3>What's different about VIE</h3>
                <ul>
                  <li>Built-in code editor (no local setup)</li>
                  <li>Peer code review as core workflow</li>
                  <li>Automatic skill progression tracking</li>
                  <li>Role-based learning paths (Admin→Manager→Senior→Junior)</li>
                </ul>
                <button className="lp-btn lp-btn-ghost" type="button" onClick={() => navigate('/register')}>
                  Create Free Account
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="lp-section lp-section-contrast" id="why">
          <div className="lp-section-head">
            <p className="lp-section-kicker">The learning gap</p>
            <h2>Learning to code is not learning to ship</h2>
            <p>
              Tutorials and solo projects teach syntax. Real-world development requires workflow understanding: 
              requirements, planning, code review, feedback integration, and shipping. VIE fills this gap.
            </p>
          </div>
          <div className="lp-grid lp-grid-4">
            {learningGaps.map((gap) => (
              <div key={gap} className="lp-card lp-gap-card">
                <p>{gap}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="lp-section" id="workflow">
          <div className="lp-section-head">
            <p className="lp-section-kicker">How it works</p>
            <h2>From assignment to approval in four steps</h2>
          </div>
          <div className="lp-flow">
            {workflowSteps.map((step, index) => (
              <div key={step} className="lp-flow-step">
                <span className="lp-step-index">Step {index + 1}</span>
                <h3>{step}</h3>
              </div>
            ))}
          </div>
        </section>

        <section className="lp-section lp-section-contrast" id="roles">
          <div className="lp-section-head">
            <p className="lp-section-kicker">Role-based learning architecture</p>
            <h2>Every role teaches something different</h2>
            <p>
              VIE structures learning around real industry roles. Each role has distinct responsibilities, 
              learning outcomes, and accountability mechanisms.
            </p>
          </div>
          <div className="lp-grid lp-grid-4">
            {roleOutcomes.map((item) => (
              <article key={item.role} className="lp-card lp-role-card">
                <span className="lp-role-badge">{item.role}</span>
                <h3>{item.title}</h3>
                <p className="lp-role-desc">{item.description}</p>
                <ul className="lp-role-outcomes">
                  {item.outcomes.map((outcome) => (
                    <li key={outcome}>{outcome}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="lp-section" id="features">
          <div className="lp-section-head">
            <p className="lp-section-kicker">Core Platform Features</p>
            <h2>Technology built for learning, not just coding</h2>
            <p>
              Every feature in VIE serves a learning objective. We combine tools, workflows, and 
              accountability mechanisms to create industry-realistic practice.
            </p>
          </div>
          <div className="lp-grid lp-grid-5">
            {learningFeatures.map((feature) => (
              <div key={feature} className="lp-card lp-feature-card">
                <h3>{feature}</h3>
              </div>
            ))}
          </div>
        </section>

        <section className="lp-section lp-terminal" id="signals">
          <div className="lp-section-head">
            <p className="lp-section-kicker">Workflow signals</p>
            <h2>Transparent, measurable progress</h2>
            <p>
              VIE logs every important moment in the learning journey. See exactly when learners take 
              action, mentors provide feedback, and skills level up.
            </p>
          </div>
          <div className="lp-signal-terminal">
            <p>{'> junior-user submitted code-snapshot'}</p>
            <p>{'> senior-mentor reviewed: "2 changes requested"'}</p>
            <p>{'> junior-user resubmitted with fixes'}</p>
            <p>{'> review approved ✓'}</p>
            <p>{'> skill "backend-dev" level 2 → 3 +50 XP'}</p>
            <p>{'> achievement unlocked: "Code Refiner"'}</p>
          </div>
        </section>

        <section className="lp-cta" id="cta">
          <div className="lp-cta-head">
            <h2>Ready to learn how real teams ship?</h2>
            <p>Choose your path and start the industry simulation experience.</p>
          </div>
          <div className="lp-entry-grid">
            <div className="lp-entry-card" onClick={handleStartDemoTrial} role="button" tabIndex={0}>
              <div className="lp-entry-icon lp-icon-demo">
                <span className="lp-icon-glyph">{'</>'}</span>
                <span className="lp-icon-label">DEMO</span>
              </div>
              <h3>Start Demo Trial</h3>
              <p>Experience the full workflow (10 min)</p>
              <span className="lp-entry-cta">Try Now →</span>
            </div>

            <div className="lp-entry-card" onClick={() => navigate('/admin/register')} role="button" tabIndex={0}>
              <div className="lp-entry-icon lp-icon-workspace">
                <span className="lp-icon-glyph">{'{}'}</span>
                <span className="lp-icon-label">ADMIN</span>
              </div>
              <h3>Create Organization</h3>
              <p>Launch a workspace for multiple teams</p>
              <span className="lp-entry-cta">Launch →</span>
            </div>

            <div className="lp-entry-card" onClick={() => navigate('/login')} role="button" tabIndex={0}>
              <div className="lp-entry-icon lp-icon-team">
                <span className="lp-icon-glyph">{'→'}</span>
                <span className="lp-icon-label">LOGIN</span>
              </div>
              <h3>Team Login</h3>
              <p>Join an existing workspace</p>
              <span className="lp-entry-cta">Sign In →</span>
            </div>

            <div className="lp-entry-card" onClick={() => navigate('/register')} role="button" tabIndex={0}>
              <div className="lp-entry-icon lp-icon-account">
                <span className="lp-icon-glyph">{'✓'}</span>
                <span className="lp-icon-label">CREATE</span>
              </div>
              <h3>Create Account</h3>
              <p>Start as an individual learner</p>
              <span className="lp-entry-cta">Get Started →</span>
            </div>
          </div>
        </section>
      </main>

      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div>
            <button className="lp-footer-link" type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              About VIE
            </button>
            <button className="lp-footer-link" type="button" onClick={() => navigate('/login')}>
              Team Login
            </button>
            <button className="lp-footer-link" type="button" onClick={() => navigate('/admin/login')}>
              Admin Login
            </button>
            <button className="lp-footer-link" type="button" onClick={() => navigate('/admin/register')}>
              Create Workspace
            </button>
          </div>
          <div className="lp-footer-meta">
            <a className="lp-footer-link" href="mailto:contact@vie-platform.dev">Contact</a>
            <span className="lp-copyright">© {new Date().getFullYear()} VIE. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
