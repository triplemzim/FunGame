export const CONTRACT_MS = 180000;
export const DAMAGE_GRACE_MS = 1500;
export const PROMOTION_REPUTATION = 40;
export const DEMOTION_REPUTATION = 45;
export const PROMOTION_MS = 700;
export const DEMOTION_MS = 500;

export const RANKS = Object.freeze([
  { name: 'Software Engineering Intern', shortName: 'Intern', target: 150, joke: 'Degree acquired. Production access pending.' },
  { name: 'Junior Software Engineer', shortName: 'Junior Software Engineer', target: 220, joke: 'Your first PR has only 47 review comments.' },
  { name: 'Software Engineer', shortName: 'Software Engineer', target: 280, joke: 'You may now restart services with confidence.' },
  { name: 'Senior Software Engineer', shortName: 'Senior Software Engineer', target: 340, joke: 'Congratulations. Production knows your number.' },
  { name: 'Tech Lead', shortName: 'Tech Lead', target: 400, joke: 'Your code now ships through other people.' },
  { name: 'Engineering Manager', shortName: 'Engineering Manager', target: 460, joke: 'Your busiest thread is now a calendar.' },
  { name: 'CTO', shortName: 'CTO', target: 520, joke: 'Every outage is now a strategy question.' },
  { name: 'CEO', shortName: 'CEO', target: null, joke: 'You automated the stand-up. Then scheduled a meeting about it.' },
].map(Object.freeze));

export const ITEM_TYPES = Object.freeze({
  build: Object.freeze({ label: 'Green CI build', category: 'reward', points: 30, color: '#d8ee9b', symbol: '✓', joke: 'All checks passed. Suspicious.' }),
  coffee: Object.freeze({ label: 'Coffee', category: 'coffee', points: 0, reputation: 12, color: '#eac886', symbol: '☕', joke: 'Critical infrastructure restored.' }),
  bug: Object.freeze({ label: 'Production bug', category: 'hazard', points: 0, reputation: -30, color: '#f0a496', symbol: '!', joke: 'Works locally. Trends globally.' }),
});

export const TERMINAL_PHASES = Object.freeze(['victory', 'dismissed', 'contractReview']);
