// Interview answers stay out of public run snapshots until the player answers.
export const INTERVIEWS = Object.freeze([
  { id: 'junior-lunch-outage', targetRankIndex: 1, prompt: 'Production is down. Should you restart everything and immediately go to lunch?', answer: false,
    correctFeedback: 'Suspiciously responsible. You’re promoted.', incorrectFeedback: 'Management potential detected. Unfortunately, this is an engineering promotion.' },
  { id: 'junior-local-visionary', targetRankIndex: 1, prompt: 'Your fix passes locally. Test it before announcing you’re a visionary?', answer: true,
    correctFeedback: 'Evidence first. Personal branding can wait.', incorrectFeedback: 'Your laptop is impressed. Unfortunately, your laptop is not production.' },
  { id: 'junior-public-token', targetRankIndex: 1, prompt: 'An agent asks for a production token in a public issue. Paste it there to save time?', answer: false,
    correctFeedback: 'Good call. The internet does not need your deployment permissions.', incorrectFeedback: 'Fast onboarding. For everyone on the internet. Keep secrets out of public issues.' },
  { id: 'engineer-failing-test', targetRankIndex: 2, prompt: 'One test fails after your change. Investigate before merging?', answer: true,
    correctFeedback: 'You have discovered the intended purpose of tests.', incorrectFeedback: 'The red checkmark was not an artistic suggestion. Investigate first.' },
  { id: 'engineer-red-ci', targetRankIndex: 2, prompt: 'CI is red. Merge anyway because the dashboard would look better in green?', answer: false,
    correctFeedback: 'Correct. A green dashboard is earned, not negotiated.', incorrectFeedback: 'That is dashboard optimism. Fix the failure before merging.' },
  { id: 'engineer-imaginary-function', targetRankIndex: 2, prompt: 'An agent confidently suggests a function you have never seen. Verify that it exists before shipping?', answer: true,
    correctFeedback: 'Excellent. Confidence is not an API reference.', incorrectFeedback: 'A convincing function name is still imaginary until checked.' },
  { id: 'senior-incident-impact', targetRankIndex: 3, prompt: 'An outage alert arrives. Acknowledge it and check customer impact before polishing the incident title?', answer: true,
    correctFeedback: 'Solid priorities. The outage can have a clever name later.', incorrectFeedback: 'The title has excellent uptime. Check the actual service.' },
  { id: 'senior-load-test', targetRankIndex: 3, prompt: 'Run an unplanned load test against production during peak traffic just to see what happens?', answer: false,
    correctFeedback: 'Thank you for not inventing an incident.', incorrectFeedback: 'You found the breaking point. It was the plan. Coordinate the test first.' },
  { id: 'senior-debug-data', targetRankIndex: 3, prompt: 'Your debug screenshot contains customer secrets. Post it in a public help forum unchanged?', answer: false,
    correctFeedback: 'Correct. Redact the secrets before asking for help.', incorrectFeedback: 'Helpful context, unfortunate audience. Remove sensitive data before sharing.' },
  { id: 'lead-rewrite', targetRankIndex: 4, prompt: 'Before a major rewrite, clarify the problem and migration risks with the team?', answer: true,
    correctFeedback: 'Architecture has successfully met a requirement.', incorrectFeedback: 'A fresh repository is not yet a migration plan.' },
  { id: 'lead-agent-pr', targetRankIndex: 4, prompt: 'An agent rewrote twenty files. Approve the PR without review because it typed faster than you?', answer: false,
    correctFeedback: 'Good. Typing speed is not a review strategy.', incorrectFeedback: 'The agent shipped volume. You still own the review.' },
  { id: 'lead-interface', targetRankIndex: 4, prompt: 'Two services disagree about their data format. Agree on a clear contract before adding another workaround?', answer: true,
    correctFeedback: 'One shared contract. Several future headaches cancelled.', incorrectFeedback: 'Another workaround has joined the architecture. Define the contract first.' },
  { id: 'manager-scope', targetRankIndex: 5, prompt: 'The team flags an unrealistic deadline. Revisit scope and tradeoffs instead of pretending harder?', answer: true,
    correctFeedback: 'A plan has entered the calendar. Remarkable.', incorrectFeedback: 'Confidence was scheduled. Capacity was not. Revisit the plan.' },
  { id: 'manager-burnout', targetRankIndex: 5, prompt: 'The team is exhausted. Solve it with a mandatory 7 a.m. motivation meeting?', answer: false,
    correctFeedback: 'Correct. Rest has fewer slides and better attendance.', incorrectFeedback: 'The meeting is energized. The team remains exhausted.' },
  { id: 'manager-blame', targetRankIndex: 5, prompt: 'An incident had several causes. Blame the newest intern so the postmortem fits on one slide?', answer: false,
    correctFeedback: 'Good. Learn from the system instead of shortening the blame list.', incorrectFeedback: 'A tidy slide, an unchanged failure. Investigate the contributing causes.' },
  { id: 'cto-backups', targetRankIndex: 6, prompt: 'Before relying on backups, test that the team can actually restore them?', answer: true,
    correctFeedback: 'A backup has been promoted from a feeling to a capability.', incorrectFeedback: 'The files exist. Whether they restore is the important sequel.' },
  { id: 'cto-costs', targetRankIndex: 6, prompt: 'Cloud costs doubled. Delete the graph so the next board update looks calmer?', answer: false,
    correctFeedback: 'Correct. Visibility is cheaper than surprise invoices.', incorrectFeedback: 'The graph is gone. The invoice remains. Investigate the cost.' },
  { id: 'cto-agent-access', targetRankIndex: 6, prompt: 'An agent will deploy to production. Limit its permissions and prepare a rollback path?', answer: true,
    correctFeedback: 'Useful autonomy. Sensible guardrails. Very CTO of you.', incorrectFeedback: 'Full access is not a rollback plan. Scope permissions and prepare recovery.' },
  { id: 'ceo-uptime-promise', targetRankIndex: 7, prompt: 'Promise perfect uptime without asking engineering about the risks or investment?', answer: false,
    correctFeedback: 'Responsible promises. The golden chair is listening.', incorrectFeedback: 'Sales has a number. Engineering has a surprise. Agree on a credible commitment.' },
  { id: 'ceo-customer-update', targetRankIndex: 7, prompt: 'During a customer incident, support a clear update while engineers work on recovery?', answer: true,
    correctFeedback: 'Good leadership. You may now sit in the expensive chair.', incorrectFeedback: 'Silence is not a status update. Communicate clearly while the team recovers.' },
  { id: 'ceo-meeting-loop', targetRankIndex: 7, prompt: 'You automated the stand-up. Celebrate the saved time with seven mandatory meetings?', answer: false,
    correctFeedback: 'Time saved remains time saved. CEO approved.', incorrectFeedback: 'The calendar has achieved sentience. Keep the saved time for useful work.' },
].map(Object.freeze));

function offsetFor(seed, rank) {
  let value = 2166136261;
  for (const character of `${seed}:${rank}`) value = Math.imul(value ^ character.charCodeAt(0), 16777619);
  return value >>> 0;
}

export function selectInterviewQuestion(targetRankIndex, attempt, seed) {
  const pool = INTERVIEWS.filter(question => question.targetRankIndex === targetRankIndex);
  if (!pool.length) throw new RangeError('A promotion interview needs a valid target rank.');
  return pool[(offsetFor(seed, targetRankIndex) + attempt) % pool.length];
}
