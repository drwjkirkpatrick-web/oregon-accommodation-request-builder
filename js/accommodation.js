/*!
 * Oregon Accommodation Request Builder — core data + plain-text generation.
 *
 * Privacy by design: this module is pure. It computes strings from answers
 * held in the page's memory only. No storage, no network calls, no cookies,
 * no localStorage. Closing or refreshing the tab erases everything.
 *
 * Wording and structure are grounded in the sources listed in docs/RESEARCH.md
 * (DAS Statewide Policies 50.020.10 and 60.000.30; ORS 659A.112, 659A.033,
 * 659A.146, 659A.147, 653.077; OAR 839-006-0206; BOLI guidance; the DAS
 * sample Reasonable Accommodation Request form).
 *
 * Unofficial community tool — not legal advice, not affiliated with the
 * State of Oregon. Your agency's official process always governs.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.ACCOMMODATION = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ------------------------------------------------------------------ */
  /* Shared identity fields (every track asks these — mirrors the DAS    */
  /* sample Reasonable Accommodation Request form).                      */
  /* ------------------------------------------------------------------ */

  var IDENTITY_FIELDS = [
    { id: 'name',       type: 'text', label: 'Your name',                       placeholder: 'e.g., Maria Torres' },
    { id: 'position',   type: 'text', label: 'Position title (classification)', placeholder: 'e.g., Human Services Analyst 2' },
    { id: 'agency',     type: 'text', label: 'Agency or department',             placeholder: 'e.g., Department of Human Services' },
    { id: 'unit',       type: 'text', label: 'Section / work unit (optional)',   placeholder: 'e.g., Self-Sufficiency, Salem office' },
    { id: 'supervisor', type: 'text', label: 'Your manager\u2019s name',         placeholder: 'e.g., Jordan Lee' },
    { id: 'location',   type: 'text', label: 'Work location (optional)',         placeholder: 'e.g., Building C, Salem \u2014 or "hybrid"' },
    { id: 'schedule',   type: 'text', label: 'Work schedule (optional)',          placeholder: 'e.g., Mon\u2013Fri 8:00\u20135:00, telework Tue/Thu' },
    { id: 'phone',      type: 'text', label: 'Work phone (optional)',             placeholder: '' }
  ];

  /* ------------------------------------------------------------------ */
  /* Shared duration + documentation + wrap-up fields                    */
  /* ------------------------------------------------------------------ */

  var DURATION_FIELDS = [
    {
      id: 'durationType', type: 'radio', label: 'How long do you expect to need this?', options: [
        { value: 'ongoing',   label: 'Ongoing \u2014 no expected end date' },
        { value: 'temporary', label: 'Temporary \u2014 I expect it to last until a certain time' },
        { value: 'unsure',    label: 'Not sure yet \u2014 my needs may change' }
      ]
    },
    { id: 'until', type: 'text', label: 'If temporary: about when do you expect it to end? (optional)', placeholder: 'e.g., mid-March, or after my next provider visit' },
    { id: 'history', type: 'textarea', label: 'How long has this been affecting you, and how do you expect it to change? (optional)', hint: 'The official state form asks: \u201cHow long have you experienced this \u2026 How long do you expect it to continue?\u201d', placeholder: '' }
  ];

  var PROCESS_FIELDS = [
    { id: 'tried',   type: 'textarea', label: 'Have you already tried anything, or talked with anyone about this? (optional)', placeholder: 'e.g., I borrowed a colleague\u2019s ergonomic chair for a week and it helped; I mentioned this to my lead on Oct 2.' },
    { id: 'meeting', type: 'text',     label: 'Good times for an interactive process meeting (optional)', placeholder: 'e.g., Weekdays after 10 a.m., Teams works best' },
    { id: 'contact', type: 'text',     label: 'Best way to reach you (optional)', placeholder: 'e.g., Email preferred' }
  ];

  /* ------------------------------------------------------------------ */
  /* Tracks                                                              */
  /* ------------------------------------------------------------------ */

  var TRACKS = {

    disability: {
      id: 'disability',
      label: 'Disability or health condition',
      summary: 'A physical or mental impairment is affecting my ability to do my job.',
      typeLabel: 'Disability accommodation (ADA / ORS 659A.112 / Statewide Policy 50.020.10)',
      letterTitle: 'REASONABLE ACCOMMODATION REQUEST \u2014 DISABILITY',
      introLine: 'A disability (a physical or mental impairment) is affecting my ability to perform my job, and I am requesting a reasonable accommodation so I can keep doing the essential functions of my position.',
      lawLine: 'Requested under Statewide Policy 50.020.10 (ADA and Reasonable Accommodation in Employment), ORS 659A.112, and OAR 839-006-0206.',
      impactTitle: 'How it affects your work',
      impactFields: [
        {
          id: 'limitation', type: 'textarea',
          label: 'What is difficult for you at work right now?',
          hint: 'Describe the task and what is hard. You do not have to name a diagnosis to start this process \u2014 Oregon law requires accommodation for \u201cknown limitations,\u201d and your agency may later ask your provider for functional information if needed.',
          placeholder: 'e.g., Standing longer than 15 minutes causes significant back pain. Reading printed text for long stretches causes headaches and eye strain.'
        },
        {
          id: 'functions', type: 'textarea',
          label: 'Which parts of your job does this affect?',
          hint: 'Essential functions are the core duties your position exists to perform. Naming them helps your manager respond faster.',
          placeholder: 'e.g., Field visits (driving and site walks), intake interviews at the counter, the Friday on-call rotation.'
        }
      ],
      requestTitle: 'What you are asking for',
      requestOptions: [
        'Making my workspace or facility more accessible (reserved parking, closer entrance, accessible workstation)',
        'Part-time or modified work schedule',
        'Job restructuring \u2014 reassigning marginal, non-essential duties',
        'Modified equipment or devices (ergonomic chair, sit-stand desk, screen reader, voice-to-text, amplified phone)',
        'Telework or hybrid arrangement',
        'Additional or longer breaks or rest periods',
        'Adjusted policies, training materials, or examinations',
        'A qualified reader or interpreter',
        'Leave of absence, or an adjusted schedule for treatment or appointments',
        'Reassignment to a vacant position I am qualified for'
      ],
      docsFields: [
        {
          id: 'documentation', type: 'radio', label: 'Supporting documentation', options: [
            { value: 'provider',   label: 'I can ask my health care provider for functional documentation if the agency needs it' },
            { value: 'have',       label: 'I already have documentation from my provider I can share' },
            { value: 'questions',  label: 'I have questions about what documentation is needed before obtaining it' },
            { value: 'conversation', label: 'I would like to start with a conversation first' }
          ]
        }
      ],
      docsText: {
        provider:      'I can ask my health care provider for functional documentation if the agency needs it as part of the interactive process.',
        have:          'I already have documentation from my health care provider that I can share.',
        questions:     'I have questions about what documentation is needed, and would like to discuss it before obtaining anything.',
        conversation:  'I would like to start with a conversation before any documentation is provided.'
      }
    },

    pregnancy: {
      id: 'pregnancy',
      label: 'Pregnancy, childbirth, or a related condition',
      summary: 'A limitation related to pregnancy or childbirth is affecting my work.',
      typeLabel: 'Pregnancy-related accommodation (ORS 659A.146\u2013147 / Statewide Policy 50.020.10)',
      letterTitle: 'REASONABLE ACCOMMODATION REQUEST \u2014 PREGNANCY OR RELATED CONDITION',
      introLine: 'A limitation related to pregnancy, childbirth, or a related medical condition is affecting my work, and I am requesting a reasonable accommodation.',
      lawLine: 'Requested under Statewide Policy 50.020.10 and ORS 659A.147 (which requires reasonable accommodation of known limitations related to pregnancy, childbirth, or related medical conditions).',
      impactTitle: 'How it affects your work',
      impactFields: [
        {
          id: 'limitation', type: 'textarea',
          label: 'What limitation are you experiencing?',
          hint: 'Common examples: needing to sit more, limits on lifting or standing, more frequent breaks or bathroom access, food and water at your workstation, morning nausea, appointment scheduling.',
          placeholder: 'e.g., I need to sit rather than stand for most of the shift, and I should not lift items over 15 pounds.'
        },
        {
          id: 'functions', type: 'textarea',
          label: 'Which parts of your job does this affect?',
          hint: 'Essential functions are the core duties your position exists to perform.',
          placeholder: 'e.g., Warehouse pulls and the standing intake counter.'
        }
      ],
      requestTitle: 'What you are asking for',
      requestOptions: [
        'Acquisition or modification of equipment or devices (including a stool or chair at my station)',
        'More frequent or longer break periods, or periodic rest',
        'Assistance with manual labor',
        'Modification of my work schedule or job assignment',
        'Ability to sit while working',
        'Access to water and food at my workstation',
        'An adjusted schedule for prenatal appointments'
      ],
      docsFields: [
        {
          id: 'documentation', type: 'radio', label: 'Supporting documentation', options: [
            { value: 'statement',  label: 'This request describes a limitation; I understand the agency may ask for more information' },
            { value: 'have',       label: 'I have documentation from my provider I can share' },
            { value: 'questions',  label: 'I have questions about what documentation is needed' }
          ]
        }
      ],
      docsText: {
        statement: 'This request describes a limitation related to pregnancy or a related condition. I understand the agency may ask for more information as part of the interactive process.',
        have:      'I have documentation from my health care provider that I can share.',
        questions: 'I have questions about what documentation is needed, and would like to discuss it.'
      }
    },

    lactation: {
      id: 'lactation',
      label: 'Expressing milk at work',
      summary: 'I need break time and a private space to express milk at work.',
      typeLabel: 'Lactation accommodation (ORS 653.077 / Statewide Policy 60.000.30)',
      letterTitle: 'BREAK TIME AND PRIVATE SPACE FOR EXPRESSING MILK \u2014 NOTIFICATION AND REQUEST',
      introLine: 'I am notifying you that I need to express milk at work, and I am requesting the break time and private space that make that possible. Oregon law asks employees to give notice when possible; the state provides a private location and rest periods for expressing milk for up to two years after the birth of the child (Statewide Policy 60.000.30).',
      lawLine: 'Requested under Statewide Policy 60.000.30 (Expression of Milk and Unpaid Rest Periods) and ORS 653.077.',
      impactTitle: 'About your situation',
      impactFields: [
        {
          id: 'childAge', type: 'text',
          label: 'How old is the child you are expressing milk for? (optional)',
          hint: 'Statewide Policy 60.000.30 provides reasonable rest periods for up to two years after the birth.',
          placeholder: 'e.g., 4 months old'
        },
        {
          id: 'limitation', type: 'textarea',
          label: 'Anything else your manager should know? (optional)',
          placeholder: 'e.g., I return from parental leave on the 1st, and I expect to need to express about twice per shift.'
        }
      ],
      requestTitle: 'What you are asking for',
      requestOptions: [
        'A private location (not a restroom) near my work area, with a door that closes and a \u201cdo not disturb\u201d sign',
        'Reasonable rest periods to express milk, as often as I need them',
        'Breaks coordinated with my existing rest and meal periods when possible',
        'The ability to bring a cooler or insulated container to store milk (and to use an available refrigerator if one is offered)',
        'A temporary change in some job duties, if my regular duties do not allow for breaks'
      ],
      docsFields: [
        {
          id: 'documentation', type: 'radio', label: 'Documentation', options: [
            { value: 'notice',     label: 'This is my notification \u2014 no documentation needed to start' },
            { value: 'questions',  label: 'I have questions about how breaks and space will work' }
          ]
        }
      ],
      docsText: {
        notice:    'This letter is my notification that I will need to express milk at work. No documentation is needed to start; I am glad to work out the schedule details together.',
        questions: 'I have questions about how breaks and space will work, and would like to discuss them.'
      }
    },

    religious: {
      id: 'religious',
      label: 'Religious observance or practice',
      summary: 'A sincerely held religious observance conflicts with part of my work schedule or duties.',
      typeLabel: 'Religious accommodation (ORS 659A.033)',
      letterTitle: 'RELIGIOUS ACCOMMODATION REQUEST',
      introLine: 'A sincerely held religious observance or practice conflicts with part of my work schedule or duties, and I am requesting an accommodation.',
      lawLine: 'Requested under ORS 659A.033 (religious observances and practices; determination of reasonable accommodation).',
      impactTitle: 'About the observance',
      impactFields: [
        {
          id: 'limitation', type: 'textarea',
          label: 'What is the religious observance or practice that needs accommodation?',
          hint: 'Oregon law protects sincerely held religious beliefs, observances, and practices.',
          placeholder: 'e.g., My faith observes a weekly holy day from Friday sundown to Saturday sundown.'
        },
        {
          id: 'functions', type: 'textarea',
          label: 'Which part of your work schedule or duties does it conflict with?',
          placeholder: 'e.g., I am regularly scheduled for Friday evening shifts.'
        }
      ],
      requestTitle: 'What you are asking for',
      requestOptions: [
        'Use of accrued vacation or other leave for a religious holy day',
        'A schedule change or shift swap for a recurring observance (weekly holy day, prayer times)',
        'Time off for a religious holiday or observance',
        'An exception to the dress or grooming policy for religious clothing or practice',
        'A private space and brief time for prayer during the workday'
      ],
      docsFields: [
        {
          id: 'documentation', type: 'radio', label: 'Documentation', options: [
            { value: 'statement', label: 'I can provide a short written statement about my sincerely held belief if the agency requests it' },
            { value: 'none',     label: 'Nothing to provide at this time \u2014 happy to discuss' }
          ]
        }
      ],
      docsText: {
        statement: 'I can provide a short written statement about my sincerely held belief if the agency requests it.',
        none:      'No documentation to provide at this time \u2014 happy to discuss.'
      }
    }
  };

  /* ------------------------------------------------------------------ */
  /* Helpers                                                             */
  /* ------------------------------------------------------------------ */

  function clean(v) {
    return (typeof v === 'string') ? v.replace(/[ \t]+/g, ' ').trim() : '';
  }

  function block(v) {
    return (typeof v === 'string') ? v.replace(/\n{3,}/g, '\n\n').trim() : '';
  }

  function bracket(name) {
    return '[' + name + ']';
  }

  function todayLabel() {
    try {
      return new Date().toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      });
    } catch (e) {
      return new Date().toDateString();
    }
  }

  function bullets(items) {
    return items.map(function (s) { return '  \u2022 ' + s; }).join('\n');
  }

  function nonEmpty(arr) {
    return arr.filter(function (s) { return typeof s === 'string' && s.trim() !== ''; });
  }

  function checkedLabels(state) {
    var track = TRACKS[state.trackId];
    var chosen = state.answers.accommodations || [];
    return chosen.map(function (value) {
      var idx = track.requestOptions.indexOf(value);
      return idx >= 0 ? track.requestOptions[idx] : value;
    });
  }

  function requestBullets(state) {
    var out = checkedLabels(state).slice();
    var other = clean(state.answers.otherText);
    if (other) { out.push('Other: ' + other); }
    return out;
  }

  /* ------------------------------------------------------------------ */
  /* Employee letter                                                     */
  /* ------------------------------------------------------------------ */

  function buildEmployeeText(state) {
    var track = TRACKS[state.trackId];
    if (!track) { return ''; }
    var a = state.answers || {};
    var out = [];

    out.push(track.letterTitle);
    out.push('');
    out.push('Date: ' + (clean(a.date) || todayLabel()));
    out.push('To: ' + (clean(a.supervisor) || bracket('manager name')));
    var from = clean(a.name) || bracket('your name');
    from += ' \u2014 ' + (clean(a.position) || bracket('position title'));
    from += ', ' + (clean(a.agency) || bracket('agency'));
    if (clean(a.unit)) { from += ' / ' + clean(a.unit); }
    out.push('From: ' + from);
    if (clean(a.location)) { out.push('Work location: ' + clean(a.location)); }
    if (clean(a.schedule)) { out.push('Work schedule: ' + clean(a.schedule)); }
    if (clean(a.phone)) { out.push('Phone: ' + clean(a.phone)); }
    out.push('');

    /* Section 1 — what this is about */
    out.push('1. WHAT THIS REQUEST IS ABOUT');
    out.push(track.introLine);
    if (state.trackId === 'lactation' && clean(a.childAge)) {
      out.push('The child I am expressing milk for is ' + clean(a.childAge) + '.');
    }
    out.push('');

    /* Section 2 — how it affects my work */
    if (state.trackId !== 'lactation') {
      out.push('2. HOW IT AFFECTS MY WORK');
      if (state.trackId === 'religious') {
        out.push('The observance or practice:');
        out.push(block(a.limitation) || bracket('describe the observance or practice'));
        out.push('');
        out.push('Work schedule or duties it conflicts with:');
        out.push(block(a.functions) || bracket('describe the conflict'));
      } else {
        out.push('What is difficult right now:');
        out.push(block(a.limitation) || bracket('describe what is difficult at work'));
        out.push('');
        out.push('Parts of my job most affected:');
        out.push(block(a.functions) || bracket('which essential functions are affected'));
      }
      out.push('');
    }

    /* Section 3 — what I am asking for */
    out.push((state.trackId === 'lactation' ? '2' : '3') + '. WHAT I AM ASKING FOR');
    var items = requestBullets(state);
    if (items.length) {
      out.push(bullets(items));
    } else {
      out.push(bracket('describe the accommodation you are requesting'));
    }
    out.push('');
    var detail = block(a.requestDetail);
    if (detail) {
      out.push('Request, in my own words:');
      out.push(detail);
      out.push('');
    }
    var helps = block(a.howHelps);
    if (helps) {
      out.push('How this will help me keep doing my job:');
      out.push(helps);
      out.push('');
    }

    /* Section 4 — duration */
    out.push((state.trackId === 'lactation' ? '3' : '4') + '. HOW LONG I EXPECT TO NEED THIS');
    if (a.durationType === 'temporary') {
      out.push('Temporary \u2014 expected to last until ' + (clean(a.until) || bracket('approximate end date')) + '.');
    } else if (a.durationType === 'unsure') {
      out.push('Not sure yet \u2014 my needs may change.');
    } else if (a.durationType === 'ongoing') {
      out.push('Ongoing \u2014 no expected end date.');
    } else {
      out.push(bracket('choose: ongoing, temporary, or not sure yet'));
    }
    var hist = block(a.history);
    if (hist) { out.push(hist); }
    out.push('');

    /* Section 5 — documentation */
    out.push((state.trackId === 'lactation' ? '4' : '5') + '. DOCUMENTATION');
    var docs = track.docsText[a.documentation];
    out.push(docs || 'I would like to discuss what documentation, if any, is needed.');
    out.push('');

    /* Section 6 — what I have already tried */
    var tried = block(a.tried);
    if (tried) {
      out.push((state.trackId === 'lactation' ? '5' : '6') + '. STEPS I HAVE ALREADY TAKEN');
      out.push(tried);
      out.push('');
    }

    /* Section 7 — interactive process */
    var meeting = clean(a.meeting);
    var contact = clean(a.contact);
    if (meeting || contact) {
      out.push((state.trackId === 'lactation' ? '6' : '7') + '. INTERACTIVE PROCESS');
      if (meeting) { out.push('Good times for a meeting: ' + meeting); }
      if (contact) { out.push('Best way to reach me: ' + contact); }
      out.push('');
    }

    /* Footer */
    out.push('\u2014\u2014\u2014');
    if (state.includeLaw !== false) { out.push(track.lawLine); }
    out.push('This request is submitted for the interactive process described in Statewide Policy 50.020.10: agencies acknowledge written accommodation requests within seven calendar days of receipt, and federal and state law prohibit retaliation for asking about or requesting an accommodation.');
    return out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
  }

  /* ------------------------------------------------------------------ */
  /* Manager summary for HR / Employee Services                          */
  /* ------------------------------------------------------------------ */

  function buildManagerText(state) {
    var track = TRACKS[state.trackId];
    if (!track) { return ''; }
    var a = state.answers || {};
    var out = [];

    out.push('SUMMARY FOR HR / EMPLOYEE SERVICES');
    out.push('(Forwarded by the manager. Bracketed fields are for the manager to complete.)');
    out.push('');
    out.push('Employee: ' + (clean(a.name) || bracket('employee name')) + ' \u2014 ' + (clean(a.position) || bracket('position')));
    out.push('Agency / unit: ' + (clean(a.agency) || bracket('agency')) + (clean(a.unit) ? ' / ' + clean(a.unit) : ''));
    out.push('Supervisor: ' + (clean(a.supervisor) || bracket('manager name')));
    out.push('Request type: ' + track.typeLabel);
    out.push('Date received by manager: ' + bracket('fill in date'));
    out.push('Written acknowledgment due: within seven calendar days of receipt (Statewide Policy 50.020.10) \u2014 by ' + bracket('fill in date'));
    out.push('');
    out.push('WHAT THE EMPLOYEE REPORTS');
    out.push('Limitation described:');
    out.push(block(a.limitation) || bracket('see attached request'));
    if (state.trackId !== 'lactation' && block(a.functions)) {
      out.push('');
      out.push('Essential functions affected:');
      out.push(block(a.functions));
    }
    if (state.trackId === 'lactation' && clean(a.childAge)) {
      out.push('Child\u2019s age: ' + clean(a.childAge));
    }
    out.push('');
    out.push('Accommodation requested:');
    var items = requestBullets(state);
    out.push(items.length ? bullets(items) : bracket('see attached request'));
    out.push('');
    var durLabel;
    if (a.durationType === 'temporary') {
      durLabel = 'Temporary \u2014 until ' + (clean(a.until) || bracket('approximate end date'));
    } else if (a.durationType === 'ongoing') {
      durLabel = 'Ongoing \u2014 no expected end date';
    } else if (a.durationType === 'unsure') {
      durLabel = 'Not sure yet \u2014 needs may change';
    } else {
      durLabel = bracket('not specified');
    }
    out.push('Expected duration: ' + durLabel);
    out.push('Documentation status: ' + (track.docsText[a.documentation] || 'To be discussed.'));
    var tried = block(a.tried);
    if (tried) {
      out.push('Already tried: ' + tried.replace(/\n+/g, ' '));
    }
    out.push('');
    out.push('SUGGESTED NEXT STEPS');
    out.push('1. Acknowledge the request in writing within seven calendar days.');
    out.push('2. Route to HR / Employee Services and the agency ADA coordinator per agency procedure.');
    out.push('3. Schedule the interactive process meeting with the employee; for disability requests, functional medical documentation may be requested from the employee\u2019s provider through HR.');
    out.push('4. Give primary consideration to the specific accommodation requested; alternatives may be identified together in the interactive process.');
    out.push('5. Keep medical and accommodation information confidential and separate from personnel files.');
    out.push('6. Communicate the decision in writing.');
    return out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
  }

  /* ------------------------------------------------------------------ */

  return {
    VERSION: '1.0.0',
    TRACKS: TRACKS,
    IDENTITY_FIELDS: IDENTITY_FIELDS,
    DURATION_FIELDS: DURATION_FIELDS,
    PROCESS_FIELDS: PROCESS_FIELDS,
    buildEmployeeText: buildEmployeeText,
    buildManagerText: buildManagerText,
    todayLabel: todayLabel
  };
}));
