/*
 * Tests for js/accommodation.js — the pure data + generation core.
 * Run: node --test test/
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const A = require('../js/accommodation.js');

const TRACK_IDS = ['disability', 'pregnancy', 'lactation', 'religious'];

function baseState(trackId, answers = {}, includeLaw = true) {
  return { trackId, answers, includeLaw };
}

const FULL_DISABILITY = {
  name: 'Maria Torres',
  position: 'Human Services Analyst 2',
  agency: 'Department of Human Services',
  unit: 'Self-Sufficiency',
  supervisor: 'Jordan Lee',
  location: 'Building C, Salem',
  schedule: 'Mon\u2013Fri 8:00\u20135:00',
  phone: '555-0100',
  date: 'Monday, November 17, 2026',
  limitation: 'Standing longer than 15 minutes causes significant pain.',
  functions: 'Intake counter shifts.',
  accommodations: ['Part-time or modified work schedule', 'Telework or hybrid arrangement'],
  otherText: 'a quiet room one afternoon a week',
  requestDetail: 'A sit-stand desk converter for my workstation.',
  howHelps: 'Lets me keep processing cases at full speed.',
  durationType: 'temporary',
  until: 'mid-March',
  history: 'Started in September.',
  documentation: 'provider',
  tried: 'Borrowed a colleague\u2019s chair; it helped.',
  meeting: 'Weekdays after 10 a.m.',
  contact: 'Email preferred'
};

test('module loads and exposes its API', () => {
  assert.equal(typeof A.buildEmployeeText, 'function');
  assert.equal(typeof A.buildManagerText, 'function');
  assert.equal(typeof A.todayLabel, 'function');
  assert.deepEqual(Object.keys(A.TRACKS).sort(), [...TRACK_IDS].sort());
});

test('every track generates a non-empty employee letter with header block', () => {
  for (const id of TRACK_IDS) {
    const text = A.buildEmployeeText(baseState(id, { date: 'Tuesday, November 17, 2026', supervisor: 'Jordan Lee' }));
    assert.ok(text.length > 200, `${id}: letter too short (${text.length})`);
    assert.ok(text.includes('Date: Tuesday, November 17, 2026'), `${id}: missing date`);
    assert.ok(text.includes('To: Jordan Lee'), `${id}: missing To line`);
    assert.ok(text.includes('From: '), `${id}: missing From line`);
    assert.ok(/REASONABLE ACCOMMODATION REQUEST|BREAK TIME AND PRIVATE SPACE|RELIGIOUS ACCOMMODATION REQUEST/.test(text), `${id}: missing letter title`);
  }
});

test('full disability letter contains identity, sections, bullets, and law line', () => {
  const text = A.buildEmployeeText(baseState('disability', FULL_DISABILITY));
  assert.ok(text.includes('From: Maria Torres \u2014 Human Services Analyst 2, Department of Human Services / Self-Sufficiency'));
  assert.ok(text.includes('Work location: Building C, Salem'));
  assert.ok(text.includes('Work schedule: Mon\u2013Fri 8:00\u20135:00'));
  assert.ok(text.includes('1. WHAT THIS REQUEST IS ABOUT'));
  assert.ok(text.includes('2. HOW IT AFFECTS MY WORK'));
  assert.ok(text.includes('Standing longer than 15 minutes causes significant pain.'));
  assert.ok(text.includes('3. WHAT I AM ASKING FOR'));
  assert.ok(text.includes('\u2022 Part-time or modified work schedule'));
  assert.ok(text.includes('\u2022 Telework or hybrid arrangement'));
  assert.ok(text.includes('Other: a quiet room one afternoon a week'));
  assert.ok(text.includes('Request, in my own words:'));
  assert.ok(text.includes('How this will help me keep doing my job:'));
  assert.ok(text.includes('4. HOW LONG I EXPECT TO NEED THIS'));
  assert.ok(text.includes('Temporary \u2014 expected to last until mid-March.'));
  assert.ok(text.includes('5. DOCUMENTATION'));
  assert.ok(text.includes('functional documentation'));
  assert.ok(text.includes('6. STEPS I HAVE ALREADY TAKEN'));
  assert.ok(text.includes('Borrowed a colleague\u2019s chair; it helped.'));
  assert.ok(text.includes('7. INTERACTIVE PROCESS'));
  assert.ok(text.includes('Weekdays after 10 a.m.'));
  assert.ok(text.includes('Requested under Statewide Policy 50.020.10'));
  assert.ok(text.includes('seven calendar days'));
});

test('includeLaw=false drops the law line but keeps the process footnote', () => {
  const text = A.buildEmployeeText(baseState('disability', FULL_DISABILITY, false));
  assert.ok(!text.includes('Requested under Statewide Policy 50.020.10'));
  assert.ok(text.includes('interactive process described in Statewide Policy 50.020.10'));
  assert.ok(text.includes('seven calendar days'));
});

test('empty answers produce bracketed fill-ins and never undefined/NaN', () => {
  for (const id of TRACK_IDS) {
    for (const kind of ['employee', 'manager']) {
      const text = kind === 'employee'
        ? A.buildEmployeeText(baseState(id, {}))
        : A.buildManagerText(baseState(id, {}));
      assert.ok(!text.includes('undefined'), `${id}/${kind}: "undefined" leaked`);
      assert.ok(!text.includes('NaN'), `${id}/${kind}: "NaN" leaked`);
      assert.ok(text.includes('[manager name]') || text.includes('[employee name]') || text.includes('[your name]'),
        `${id}/${kind}: expected a bracketed fill-in`);
    }
  }
});

test('lactation letter is a notification: child age line, no "how it affects" section', () => {
  const text = A.buildEmployeeText(baseState('lactation', {
    childAge: '4 months old',
    date: 'Tuesday, November 17, 2026',
    accommodations: ['Reasonable rest periods to express milk, as often as I need them'],
    durationType: 'unsure',
    documentation: 'notice'
  }));
  assert.ok(text.includes('notifying you that I need to express milk at work'));
  assert.ok(text.includes('The child I am expressing milk for is 4 months old.'));
  assert.ok(!text.includes('HOW IT AFFECTS MY WORK'), 'lactation should not use the impact section');
  assert.ok(text.includes('2. WHAT I AM ASKING FOR'), 'lactation numbering should skip impact');
  assert.ok(text.includes('Statewide Policy 60.000.30'));
  assert.ok(text.includes('Not sure yet'));
});

test('religious letter uses observance + conflict prompts', () => {
  const text = A.buildEmployeeText(baseState('religious', {
    limitation: 'Weekly holy day from Friday sundown to Saturday sundown.',
    functions: 'Friday evening shifts.',
    durationType: 'ongoing',
    documentation: 'statement'
  }));
  assert.ok(text.includes('The observance or practice:'));
  assert.ok(text.includes('Work schedule or duties it conflicts with:'));
  assert.ok(text.includes('sincerely held belief'));
  assert.ok(text.includes('Ongoing \u2014 no expected end date.'));
});

test('manager summary carries the 7-day acknowledgment duty and fill-in brackets', () => {
  const text = A.buildManagerText(baseState('disability', FULL_DISABILITY));
  assert.ok(text.includes('SUMMARY FOR HR / EMPLOYEE SERVICES'));
  assert.ok(text.includes('Employee: Maria Torres \u2014 Human Services Analyst 2'));
  assert.ok(text.includes('Request type: Disability accommodation'));
  assert.ok(text.includes('within seven calendar days of receipt (Statewide Policy 50.020.10)'));
  assert.ok(text.includes('[fill in date]'));
  assert.ok(text.includes('WHAT THE EMPLOYEE REPORTS'));
  assert.ok(text.includes('\u2022 Part-time or modified work schedule'));
  assert.ok(text.includes('Expected duration: Temporary \u2014 until mid-March'));
  assert.ok(text.includes('Documentation status:'));
  assert.ok(text.includes('SUGGESTED NEXT STEPS'));
  assert.ok(text.includes('Give primary consideration'));
  assert.ok(text.includes('separate from personnel files'));
});

test('duration variants render the right line', () => {
  const mk = (durationType, extra = {}) =>
    A.buildEmployeeText(baseState('pregnancy', { limitation: 'x', durationType, ...extra }));
  assert.ok(mk('ongoing').includes('Ongoing \u2014 no expected end date.'));
  assert.ok(mk('unsure').includes('Not sure yet \u2014 my needs may change.'));
  assert.ok(mk('temporary', { until: 'June 1' }).includes('Temporary \u2014 expected to last until June 1.'));
  assert.ok(mk(undefined).includes('[choose: ongoing, temporary, or not sure yet]'));
  assert.ok(mk('temporary', {}).includes('[approximate end date]'));
});

test('multi-line answers keep their line breaks', () => {
  const text = A.buildEmployeeText(baseState('disability', {
    limitation: 'Line one.\nLine two.',
    durationType: 'ongoing'
  }));
  assert.ok(text.includes('Line one.\nLine two.'));
});

test('data integrity: doc options all have sentences; field ids unique; options non-empty', () => {
  const seen = {};
  for (const id of TRACK_IDS) {
    const t = A.TRACKS[id];
    const docField = t.docsFields[0];
    for (const opt of docField.options) {
      assert.ok(t.docsText[opt.value], `${id}: docsText missing for "${opt.value}"`);
    }
    assert.ok(t.requestOptions.length >= 5, `${id}: requestOptions too thin`);
    const ids = []
      .concat(A.IDENTITY_FIELDS, t.impactFields, t.docsFields, A.DURATION_FIELDS, A.PROCESS_FIELDS)
      .map((f) => f.id);
    ids.push('accommodations', 'otherText', 'requestDetail', 'howHelps');
    const dupes = ids.filter((x, i) => ids.indexOf(x) !== i);
    assert.deepEqual(dupes, [], `${id}: duplicate field ids ${dupes}`);
    seen[id] = true;
  }
  assert.equal(Object.keys(seen).length, 4);
});

test('todayLabel returns a readable date', () => {
  const label = A.todayLabel();
  assert.ok(label.length > 8);
  assert.ok(/\d{4}/.test(label));
});
