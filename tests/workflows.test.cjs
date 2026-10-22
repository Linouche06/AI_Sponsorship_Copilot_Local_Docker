const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const dir = process.env.WORKFLOWS_DIR || path.join(__dirname, '..', 'workflows');
const workflows = fs.readdirSync(dir).filter(f => f.endsWith('.json')).map(f => JSON.parse(fs.readFileSync(path.join(dir, f))));
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
const items = rows => rows.map(json => ({ json }));
async function run(name, rows, references = {}) {
  const node = workflows.flatMap(w => w.nodes).find(n => n.name === name);
  assert.ok(node, `Missing node ${name}`);
  const lookup = name => {
    assert.ok(Object.hasOwn(references, name), `Missing fixture for ${name}`);
    const data = items(references[name]);
    return { first: () => data[0], all: () => data };
  };
  const input = items(rows);
  return new AsyncFunction('$input', '$', '$json', node.parameters.jsCode)(
    { first: () => input[0], all: () => input }, lookup, rows[0]);
}
test('every Code node compiles and every graph edge targets an existing node', () => {
  for (const workflow of workflows) {
    const names = new Set(workflow.nodes.map(n => n.name));
    assert.equal(names.size, workflow.nodes.length);
    for (const n of workflow.nodes) if (n.parameters.jsCode) new AsyncFunction('$input', '$', '$json', n.parameters.jsCode);
    for (const [source, ports] of Object.entries(workflow.connections)) {
      assert.ok(names.has(source));
      for (const groups of Object.values(ports)) for (const group of groups) for (const edge of group) assert.ok(names.has(edge.node));
    }
  }
});
test('Telegram commands parse company names and bot mentions', async () => {
  for (const command of ['analyze', 'pitch', 'approve']) {
    const [out] = await run('Parse Command', [{ text: `/${command}@DemoBot Acme Software`, chat_id: '123', user_id: '123' }]);
    assert.equal(out.json.command, command);
    assert.equal(out.json.company, 'Acme Software');
  }
});
test('missing arguments and unknown commands do not enter action branches', async () => {
  for (const text of ['/approve', '/status Acme', 'hello']) {
    const [out] = await run('Parse Command', [{ text }]);
    assert.equal(out.json.command, 'help');
    assert.equal(out.json.valid, false);
  }
});
test('CRM updates preserve the value after the delimiter', async () => {
  const [out] = await run('Parse Command', [{ text: '/note Acme Software | Met at event | follow up' }]);
  assert.equal(out.json.command, 'update');
  assert.equal(out.json.action, 'note');
  assert.equal(out.json.value, 'Met at event | follow up');
});
test('draft subject is extracted and removed from the email body', async () => {
  const [out] = await run('Prepare Draft', [{ text: 'SUBJECT: Workshop proposal\nHello team,\nA tailored proposal.' }], {
    'Build Personalization Context': [{ company: 'Acme', company_key: 'acme', chat_id: '123' }]
  });
  assert.equal(out.json.subject, 'Workshop proposal');
  assert.equal(out.json.draft, 'Hello team,\nA tailored proposal.');
  assert.equal(out.json.status, 'Draft');
  assert.ok(out.json.reply_text.includes('\nSubject:'));
});
test('analysis extracts the model lines and computes a bounded score', async () => {
  const [out] = await run('Score and Format', [{ text: 'REASON: Technical audience fit.\nOPPORTUNITIES: Mentorship workshop.' }], {
    'Choose Company': [{ company: 'Acme', company_key: 'acme', tags: 'ai,cloud,software,students', partnership_ideas: 'Mentoring', chat_id: '123' }]
  });
  assert.equal(out.json.reason, 'Technical audience fit.');
  assert.equal(out.json.opportunities, 'Mentorship workshop.');
  assert.ok(out.json.score >= 0 && out.json.score <= 100);
});
function approvalFixtures(overrides = {}) {
  return {
    'Parse Command': [{ company: 'Acme', chat_id: '123', user_id: '123', ...overrides.request }],
    'Read Draft for Approval': [{ company: 'Acme', status: 'Draft', subject: 'Workshop', draft: 'Hello team, we would like to discuss a student workshop and explore a possible partnership.', ...overrides.draft }],
    'Read Company Recipient': [{ company: 'Acme', company_key: 'acme', contact_email: 'demo@example.com', contact_verified: 'YES', ...overrides.company }]
  };
}
test('email approval fails closed for missing owner, wrong user, groups and unverified contacts', async () => {
  for (const variant of [
    { organization: {} },
    { request: { user_id: '999' } },
    { request: { chat_id: '-123' } },
    { company: { contact_verified: 'NO' } },
    { company: { contact_email: 'invalid' } },
    { draft: { status: 'Sent' } }
  ]) {
    const [out] = await run('Validate Approval & Recipient', [variant.organization || { approver_telegram_id: '123' }], approvalFixtures(variant));
    assert.equal(out.json.approved, false);
  }
});
test('valid approval prepares the intended recipient without sending anything', async () => {
  const [out] = await run('Validate Approval & Recipient', [{ approver_telegram_id: '123' }], approvalFixtures());
  assert.equal(out.json.approved, true);
  assert.equal(out.json.recipient_email, 'demo@example.com');
});
test('bracketed sender and association placeholders block approval', async () => {
  for (const placeholder of ['[Sender Name]', '[Association Name]']) {
    const [out] = await run('Validate Approval & Recipient', [{ approver_telegram_id: '123' }], approvalFixtures({ draft: { draft: `Hello team, we would like to discuss a student workshop and explore a possible partnership. Regards, ${placeholder}` } }));
    assert.equal(out.json.approved, false, `${placeholder} must not be sent`);
  }
});
test('follow-ups exclude already reminded, completed, future and unowned rows', async () => {
  const base = { company_key: 'acme', company: 'Acme', next_followup: '2000-01-01', owner_chat_id: '123', status: 'Contacted' };
  const out = await run('Pick Due Followups', [base,
    { ...base, reminder_sent_for: base.next_followup },
    { ...base, status: 'Declined' },
    { ...base, status: 'Confirmed' },
    { ...base, next_followup: '2099-01-01' },
    { ...base, owner_chat_id: '' }
  ]);
  assert.equal(out.length, 1);
  assert.equal(out[0].json.chat_id, '123');
});
