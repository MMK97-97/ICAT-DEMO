(() => {
  'use strict';

  const $ = id => document.getElementById(id);
  const $$ = sel => [...document.querySelectorAll(sel)];
  const STORAGE = 'icat-demo-v21';
  const ROLE_STORAGE = 'icat_role_v21';
  const LOGIN_STORAGE = 'icat_logged_in_v21';
  const COMMITTEE_EMAIL = 'committee@icat.demo';
  const ORGANIZER_EMAIL = 'organizer@icat.demo';
  const ORGANIZER_PHONE = '+18135550999';
  const YOUTUBE_CHANNEL_URL = 'https://www.youtube.com/@ICAT-FT20';
  const YOUTUBE_LIVE_URL = `${YOUTUBE_CHANNEL_URL}/live`;
  const YOUTUBE_CHANNEL_HANDLE = '@ICAT-FT20';
  const LOGIN_EMAIL_STORAGE = 'icat_login_email_v32';


  // Android persistence adapter. In the browser this is a no-op wrapper around localStorage.
  // In the Android WebView, persistent keys are mirrored to the app-private SQLite database
  // through ICATNative. Existing localStorage data is migrated automatically the first time a
  // key is requested on the upgraded Android build.
  const browserPersistentStorage = window.localStorage;
  const persistentStore = {
    nativeAvailable() {
      return !!(window.ICATNative && typeof window.ICATNative.dbGet === 'function' && typeof window.ICATNative.dbSet === 'function');
    },
    get(key) {
      try {
        if (this.nativeAvailable()) {
          const nativeValue = window.ICATNative.dbGet(String(key));
          if (nativeValue !== null && nativeValue !== undefined) {
            const value = String(nativeValue);
            if (browserPersistentStorage.getItem(key) !== value) browserPersistentStorage.setItem(key, value);
            return value;
          }
          const legacy = browserPersistentStorage.getItem(key);
          if (legacy !== null) window.ICATNative.dbSet(String(key), String(legacy));
          return legacy;
        }
      } catch (error) {
        console.warn('ICAT local database read fallback', error);
      }
      return browserPersistentStorage.getItem(key);
    },
    set(key, value) {
      const text = String(value);
      browserPersistentStorage.setItem(key, text);
      try {
        if (this.nativeAvailable()) window.ICATNative.dbSet(String(key), text);
      } catch (error) {
        console.warn('ICAT local database write fallback', error);
      }
    },
    remove(key) {
      browserPersistentStorage.removeItem(key);
      try {
        if (this.nativeAvailable() && typeof window.ICATNative.dbRemove === 'function') window.ICATNative.dbRemove(String(key));
      } catch (error) {
        console.warn('ICAT local database remove fallback', error);
      }
    }
  };

  const demo = {
    user: { name: 'Manoj', fullName: 'Manoj Kumar', role: 'member', team: 'Thunderbolts', email: 'captain@icat.demo', phone: '+18135550101' },
    league: {
      id: 'fwwl',
      name: 'Florida West Coast Winter League',
      season: 'Winter 2026',
      format: '20 Overs',
      region: 'Florida West Coast',
      status: 'active'
    },
    teams: [
      { id: 'tb', name: 'Thunderbolts', captain: 'Manoj', email: 'captain@icat.demo', phone: '+18135550101', color: 'teal' },
      { id: 'bs', name: 'Bay Strikers', captain: 'Arjun', email: 'arjun@icat.demo', phone: '+18135550102', color: 'blue' },
      { id: 'tt', name: 'Tampa Titans', captain: 'Rahul', email: 'rahul@icat.demo', phone: '+18135550103', color: 'violet' },
      { id: 'cc', name: 'Clearwater CC', captain: 'Sameer', email: 'sameer@icat.demo', phone: '+18135550104', color: 'amber' }
    ],
    squads: {
      Thunderbolts: [
        ['Manoj Kumar', 'Captain · Batter'], ['Ashish Rao', 'All-rounder'], ['Ravi Patel', 'Batter'], ['Kiran Shah', 'Bowler'],
        ['Sai Reddy', 'Wicketkeeper'], ['Nikhil Jain', 'All-rounder'], ['Aditya Singh', 'Bowler'], ['Vivek Kumar', 'Batter'],
        ['Rohan Das', 'All-rounder'], ['Pranav Nair', 'Bowler'], ['Deepak Mehta', 'Batter'], ['Sanjay Iyer', 'Bowler'],
        ['Arun G', 'All-rounder'], ['Karthik B', 'Batter']
      ],
      'Bay Strikers': [
        ['Arjun Menon', 'Captain · Batter'], ['Vikram Shah', 'Wicketkeeper'], ['Naveen Kumar', 'Batter'], ['Rohit Nair', 'All-rounder'],
        ['Aman Patel', 'Bowler'], ['Harish Reddy', 'Batter'], ['Siddharth Rao', 'All-rounder'], ['Neel Shah', 'Bowler'],
        ['Varun Mehta', 'Batter'], ['Kunal Iyer', 'Bowler'], ['Ajay Singh', 'All-rounder'], ['Nitin Das', 'Bowler'],
        ['Saurabh Jain', 'Batter']
      ],
      'Tampa Titans': [
        ['Rahul Desai', 'Captain · All-rounder'], ['Akash Patel', 'Batter'], ['Vijay Nair', 'Wicketkeeper'], ['Gaurav Shah', 'Bowler'],
        ['Ritesh Kumar', 'Batter'], ['Dhruv Rao', 'All-rounder'], ['Manish Reddy', 'Bowler'], ['Jay Mehta', 'Batter'],
        ['Ishan Jain', 'All-rounder'], ['Tarun Singh', 'Bowler'], ['Mihir Das', 'Batter'], ['Parth Iyer', 'Bowler']
      ],
      'Clearwater CC': [
        ['Sameer Khan', 'Captain · Batter'], ['Imran Patel', 'Wicketkeeper'], ['Faisal Ahmed', 'Batter'], ['Zaid Khan', 'All-rounder'],
        ['Omar Ali', 'Bowler'], ['Bilal Shah', 'Batter'], ['Hamza Raza', 'All-rounder'], ['Adeel Mir', 'Bowler'],
        ['Yusuf Khan', 'Batter'], ['Farhan Ali', 'Bowler'], ['Rehan Ahmed', 'All-rounder'], ['Danish Raza', 'Bowler']
      ]
    },
    matches: [
      {
        id: 'live1', week: 4, date: '2026-09-07', time: '14:30', venue: 'Tampa Cricket Ground', leagueId: 'fwwl',
        teamA: 'Tampa Titans', teamB: 'Clearwater CC', overs: 20, status: 'live', innings: '1st Innings',
        scoreA: '87/3', scoreB: 'Yet to bat', oversA: '10.4', batsman: 'Rahul Desai 34*', bowler: 'Omar Ali 2/18', crr: '8.15',
        tossWinner: 'Tampa Titans', decision: 'bat', rosterA: [], rosterB: []
      },
      {
        id: 'tb-live-test', week: 4, date: '2026-09-07', time: '16:00', venue: 'Tampa Cricket Ground', leagueId: 'fwwl',
        teamA: 'Thunderbolts', teamB: 'Bay Strikers', overs: 20, status: 'live', innings: '1st Innings',
        scoreA: '0/0', scoreB: 'Yet to bat', oversA: '0.0', batsman: 'Manoj Kumar 0*', bowler: 'Aman Patel 0/0', crr: '0.00',
        tossWinner: 'Thunderbolts', decision: 'bat', battingTeam: 'Thunderbolts', currentInnings: 0, rosterA: [], rosterB: []
      },
      { id: 'm1', week: 1, date: '2026-08-23', time: '08:30', venue: 'Tampa Cricket Ground', leagueId: 'fwwl', teamA: 'Thunderbolts', teamB: 'Clearwater CC', overs: 20, status: 'result', scoreA: '164/6', scoreB: '151/9', result: 'Thunderbolts won by 13 runs' },
      { id: 'm2', week: 2, date: '2026-08-30', time: '14:00', venue: 'USF Cricket Field', leagueId: 'fwwl', teamA: 'Bay Strikers', teamB: 'Tampa Titans', overs: 20, status: 'result', scoreA: '142/8', scoreB: '143/5', result: 'Tampa Titans won by 5 wickets' },
      { id: 'm3', week: 3, date: '2026-09-06', time: '09:00', venue: 'Tampa Cricket Ground', leagueId: 'fwwl', teamA: 'Clearwater CC', teamB: 'Bay Strikers', overs: 20, status: 'result', scoreA: '128/10', scoreB: '129/7', result: 'Bay Strikers won by 3 wickets' },
      { id: 'm4', week: 4, date: '2026-09-13', time: '08:30', venue: 'Tampa Cricket Ground', leagueId: 'fwwl', teamA: 'Thunderbolts', teamB: 'Bay Strikers', overs: 20, status: 'scheduled', tossWinner: '', decision: 'bat', rosterA: [], rosterB: [] },
      { id: 'm5', week: 4, date: '2026-09-13', time: '14:00', venue: 'USF Cricket Field', leagueId: 'fwwl', teamA: 'Tampa Titans', teamB: 'Clearwater CC', overs: 20, status: 'scheduled', tossWinner: '', decision: 'bat', rosterA: [], rosterB: [] },
      { id: 'm6', week: 5, date: '2026-09-20', time: '09:00', venue: 'Tampa Cricket Ground', leagueId: 'fwwl', teamA: 'Thunderbolts', teamB: 'Tampa Titans', overs: 20, status: 'scheduled', tossWinner: '', decision: 'bat', rosterA: [], rosterB: [] }
    ],
    points: [
      { team: 'Thunderbolts', p: 3, w: 2, l: 1, nrr: '+0.842', pts: 4 },
      { team: 'Bay Strikers', p: 3, w: 2, l: 1, nrr: '+0.327', pts: 4 },
      { team: 'Tampa Titans', p: 3, w: 1, l: 2, nrr: '-0.104', pts: 2 },
      { team: 'Clearwater CC', p: 3, w: 1, l: 2, nrr: '-0.665', pts: 2 }
    ],
    stats: {
      batting: [
        { player: 'Manoj Kumar', team: 'Thunderbolts', value: 188, label: 'Runs', detail: 'Avg 62.7 · SR 148.0' },
        { player: 'Arjun Menon', team: 'Bay Strikers', value: 172, label: 'Runs', detail: 'Avg 57.3 · SR 139.8' },
        { player: 'Rahul Desai', team: 'Tampa Titans', value: 149, label: 'Runs', detail: 'Avg 49.7 · SR 136.4' },
        { player: 'Sameer Khan', team: 'Clearwater CC', value: 141, label: 'Runs', detail: 'Avg 47.0 · SR 132.1' },
        { player: 'Ashish Rao', team: 'Thunderbolts', value: 132, label: 'Runs', detail: 'Avg 44.0 · SR 128.4' },
        { player: 'Harish Reddy', team: 'Bay Strikers', value: 126, label: 'Runs', detail: 'Avg 42.0 · SR 126.0' },
        { player: 'Akash Patel', team: 'Tampa Titans', value: 119, label: 'Runs', detail: 'Avg 39.7 · SR 124.0' },
        { player: 'Faisal Ahmed', team: 'Clearwater CC', value: 114, label: 'Runs', detail: 'Avg 38.0 · SR 121.3' },
        { player: 'Ravi Patel', team: 'Thunderbolts', value: 108, label: 'Runs', detail: 'Avg 36.0 · SR 119.8' },
        { player: 'Bilal Shah', team: 'Clearwater CC', value: 102, label: 'Runs', detail: 'Avg 34.0 · SR 118.6' },
        { player: 'Ritesh Kumar', team: 'Tampa Titans', value: 96, label: 'Runs', detail: 'Avg 32.0 · SR 116.9' },
        { player: 'Vivek Kumar', team: 'Thunderbolts', value: 91, label: 'Runs', detail: 'Avg 30.3 · SR 115.2' }
      ],
      bowling: [
        { player: 'Kiran Shah', team: 'Thunderbolts', value: 9, label: 'Wickets', detail: 'Econ 6.20' },
        { player: 'Omar Ali', team: 'Clearwater CC', value: 8, label: 'Wickets', detail: 'Econ 6.71' },
        { player: 'Aman Patel', team: 'Bay Strikers', value: 7, label: 'Wickets', detail: 'Econ 7.05' },
        { player: 'Gaurav Shah', team: 'Tampa Titans', value: 7, label: 'Wickets', detail: 'Econ 7.12' },
        { player: 'Aditya Singh', team: 'Thunderbolts', value: 6, label: 'Wickets', detail: 'Econ 6.88' },
        { player: 'Neel Shah', team: 'Bay Strikers', value: 6, label: 'Wickets', detail: 'Econ 7.18' },
        { player: 'Manish Reddy', team: 'Tampa Titans', value: 6, label: 'Wickets', detail: 'Econ 7.31' },
        { player: 'Adeel Mir', team: 'Clearwater CC', value: 5, label: 'Wickets', detail: 'Econ 6.95' },
        { player: 'Pranav Nair', team: 'Thunderbolts', value: 5, label: 'Wickets', detail: 'Econ 7.24' },
        { player: 'Kunal Iyer', team: 'Bay Strikers', value: 5, label: 'Wickets', detail: 'Econ 7.42' },
        { player: 'Farhan Ali', team: 'Clearwater CC', value: 4, label: 'Wickets', detail: 'Econ 7.08' },
        { player: 'Sanjay Iyer', team: 'Thunderbolts', value: 4, label: 'Wickets', detail: 'Econ 7.51' }
      ],
      allrounder: [
        { player:'Ashish Rao', team:'Thunderbolts', runs:132, wickets:6, catches:4, runOuts:1, stumpings:0 },
        { player:'Nikhil Jain', team:'Thunderbolts', runs:86, wickets:5, catches:5, runOuts:1, stumpings:0 },
        { player:'Rohan Das', team:'Thunderbolts', runs:74, wickets:4, catches:3, runOuts:2, stumpings:0 },
        { player:'Arun G', team:'Thunderbolts', runs:61, wickets:3, catches:4, runOuts:1, stumpings:0 },
        { player:'Rohit Nair', team:'Bay Strikers', runs:118, wickets:6, catches:4, runOuts:1, stumpings:0 },
        { player:'Siddharth Rao', team:'Bay Strikers', runs:82, wickets:5, catches:5, runOuts:2, stumpings:0 },
        { player:'Ajay Singh', team:'Bay Strikers', runs:77, wickets:4, catches:3, runOuts:1, stumpings:0 },
        { player:'Rahul Desai', team:'Tampa Titans', runs:149, wickets:5, catches:4, runOuts:1, stumpings:0 },
        { player:'Dhruv Rao', team:'Tampa Titans', runs:94, wickets:6, catches:3, runOuts:2, stumpings:0 },
        { player:'Ishan Jain', team:'Tampa Titans', runs:70, wickets:4, catches:5, runOuts:1, stumpings:0 },
        { player:'Zaid Khan', team:'Clearwater CC', runs:105, wickets:5, catches:4, runOuts:2, stumpings:0 },
        { player:'Hamza Raza', team:'Clearwater CC', runs:79, wickets:4, catches:3, runOuts:2, stumpings:0 },
        { player:'Rehan Ahmed', team:'Clearwater CC', runs:65, wickets:4, catches:4, runOuts:1, stumpings:0 }
      ],
      fielding: [
        { player:'Sai Reddy', team:'Thunderbolts', wicketkeeper:true, catches:8, runOuts:2, stumpings:4 },
        { player:'Vikram Shah', team:'Bay Strikers', wicketkeeper:true, catches:7, runOuts:1, stumpings:5 },
        { player:'Vijay Nair', team:'Tampa Titans', wicketkeeper:true, catches:9, runOuts:2, stumpings:2 },
        { player:'Imran Patel', team:'Clearwater CC', wicketkeeper:true, catches:6, runOuts:2, stumpings:4 },
        { player:'Manoj Kumar', team:'Thunderbolts', wicketkeeper:false, catches:5, runOuts:1, stumpings:0 },
        { player:'Ashish Rao', team:'Thunderbolts', wicketkeeper:false, catches:4, runOuts:1, stumpings:0 },
        { player:'Arjun Menon', team:'Bay Strikers', wicketkeeper:false, catches:6, runOuts:1, stumpings:0 },
        { player:'Rohit Nair', team:'Bay Strikers', wicketkeeper:false, catches:4, runOuts:2, stumpings:0 },
        { player:'Rahul Desai', team:'Tampa Titans', wicketkeeper:false, catches:4, runOuts:1, stumpings:0 },
        { player:'Dhruv Rao', team:'Tampa Titans', wicketkeeper:false, catches:3, runOuts:2, stumpings:0 },
        { player:'Sameer Khan', team:'Clearwater CC', wicketkeeper:false, catches:5, runOuts:1, stumpings:0 },
        { player:'Zaid Khan', team:'Clearwater CC', wicketkeeper:false, catches:4, runOuts:2, stumpings:0 }
      ],
      sixes: [
        { player: 'Manoj Kumar', team: 'Thunderbolts', value: 12, label: 'Sixes', detail: '3 matches' },
        { player: 'Rahul Desai', team: 'Tampa Titans', value: 10, label: 'Sixes', detail: '3 matches' },
        { player: 'Arjun Menon', team: 'Bay Strikers', value: 8, label: 'Sixes', detail: '3 matches' }
      ]
    },
    venues: [
      { name: 'Tampa Cricket Ground', city: 'Tampa, FL', matches: 4, note: 'Primary league venue · natural wicket' },
      { name: 'USF Cricket Field', city: 'Tampa, FL', matches: 3, note: 'Afternoon fixtures · large outfield' },
      { name: 'Sarasota Cricket Club', city: 'Sarasota, FL', matches: 2, note: 'West coast rotation venue' }
    ],
    stories: [['Game Day', 'Thunderbolts'], ['MVP', 'Week 3'], ['Top 6s', 'Highlights'], ['Fixtures', 'Week 4'], ['Committee', 'Update']],
    announcements: [
      { title: 'Week 4 fixtures confirmed', date: 'Sep 6', text: 'Captains should confirm team availability by Friday 8 PM.' },
      { title: 'Ground timing update', date: 'Sep 5', text: 'Morning matches must complete warm-up before 8:20 AM.' },
      { title: 'MVP submissions open', date: 'Sep 3', text: 'Upload one official MVP photo after each completed match.' }
    ],
    notifications: [],
    availability: { m4: 'yes', m6: 'unknown' },
    memberAvailability: {},
    teamAvailability: {
      m4: {
        'Manoj Kumar': 'yes', 'Ashish Rao': 'yes', 'Ravi Patel': 'yes', 'Kiran Shah': 'unknown', 'Sai Reddy': 'yes',
        'Nikhil Jain': 'no', 'Aditya Singh': 'yes', 'Vivek Kumar': 'unknown', 'Rohan Das': 'yes', 'Pranav Nair': 'yes',
        'Deepak Mehta': 'unknown', 'Sanjay Iyer': 'no', 'Arun G': 'yes', 'Karthik B': 'unknown'
      }
    },
    playerRequests: [],
    mvpPosts: [],
    mediaDrafts: [],
    organizer: { name: 'ICAT Organizer', email: 'organizer@icat.demo', phone: '+18135550999' },
    adminAccess: {
      'captain@icat.demo': true,
      'arjun@icat.demo': false,
      'rahul@icat.demo': false,
      'sameer@icat.demo': false
    },
    playerDirectory: {},
    adminMessages: [
      { id:'msg1', type:'request', from:'Manoj', team:'Thunderbolts', subject:'Practice slot request', message:'Please review an additional Friday practice slot before Week 5.', status:'open', createdAt:'2026-09-06T18:00:00.000Z' },
      { id:'msg2', type:'feedback', from:'Arjun', team:'Bay Strikers', subject:'Match center feedback', message:'The match center workflow is working well. Please add a final roster confirmation step.', status:'open', createdAt:'2026-09-06T19:15:00.000Z' }
    ]
  };

  let state = load();
  if (persistentStore.get(STORAGE) === null) persistentStore.set(STORAGE, JSON.stringify(state));
  let role = persistentStore.get(ROLE_STORAGE) || 'member';
  let activeMatchTab = 'live';
  let activeLeagueTab = 'matches';
  let activeAdminTab = 'matches';
  let activeOrganizerTab = 'overview';
  let activeStatsCategory = 'batting';
  let activeAvailabilityMatchId = '';
  const statsTeamFilter = { batting: 'All Teams', bowling: 'All Teams' };
  function statsScope() {
    const requested = new URLSearchParams(location.search).get('scope');
    if (requested === 'me' && isMember()) return 'me';
    if (requested === 'team' && isAdmin()) return 'team';
    return 'league';
  }

  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function load() {
    try {
      const saved = JSON.parse(persistentStore.get(STORAGE) || '{}');
      const merged = { ...clone(demo), ...saved };
      merged.squads = { ...clone(demo.squads), ...(saved.squads || {}) };
      merged.teamAvailability = { ...clone(demo.teamAvailability), ...(saved.teamAvailability || {}) };
      merged.memberAvailability = { ...clone(demo.memberAvailability || {}), ...(saved.memberAvailability || {}) };
      const mergeStatRows = (defaults, savedRows) => {
        const map = new Map((defaults || []).map(r => [`${r.player}|${r.team}`, clone(r)]));
        (savedRows || []).forEach(r => map.set(`${r.player}|${r.team}`, { ...(map.get(`${r.player}|${r.team}`) || {}), ...clone(r) }));
        return [...map.values()];
      };
      const savedStats = saved.stats || {};
      merged.stats = { ...clone(demo.stats), ...savedStats };
      ['batting','bowling','allrounder','fielding','sixes'].forEach(k => { merged.stats[k] = mergeStatRows(demo.stats[k] || [], savedStats[k] || []); });
      merged.adminAccess = { ...clone(demo.adminAccess), ...(saved.adminAccess || {}) };
      // Keep the Thunderbolts live-scoring test fixture available when upgrading
      // from an older locally saved demo state whose matches array predates it.
      const tbTestFixture = demo.matches.find(m => m.id === 'tb-live-test');
      if (tbTestFixture) {
        if (!Array.isArray(merged.matches)) merged.matches = clone(demo.matches);
        const existingTest = merged.matches.find(m => m.id === tbTestFixture.id);
        if (!existingTest) merged.matches.push(clone(tbTestFixture));
      }
      const demoDirectory = {};
      Object.entries(demo.squads).forEach(([teamName, squad]) => {
        const team = demo.teams.find(t => t.name === teamName);
        squad.forEach((player, index) => {
          const name = player[0];
          const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.|\.$/g, '');
          demoDirectory[name] = {
            email: index === 0 && team?.email ? team.email : `${slug}@icat.demo`,
            phone: index === 0 && team?.phone ? team.phone : '',
            team: teamName
          };
        });
      });
      merged.playerDirectory = { ...demoDirectory, ...clone(demo.playerDirectory), ...(saved.playerDirectory || {}) };
      merged.adminMessages = Array.isArray(saved.adminMessages) ? saved.adminMessages : clone(demo.adminMessages);
      merged.notifications = Array.isArray(saved.notifications) ? saved.notifications : clone(demo.notifications || []);
      merged.mediaDrafts = Array.isArray(saved.mediaDrafts) ? saved.mediaDrafts : clone(demo.mediaDrafts || []);
      merged.playerRequests = Array.isArray(saved.playerRequests) ? saved.playerRequests : clone(demo.playerRequests || []);
      merged.organizer = { ...clone(demo.organizer), ...(saved.organizer || {}) };
      return merged;
    } catch {
      return clone(demo);
    }
  }
  function save() { persistentStore.set(STORAGE, JSON.stringify(state)); }

  function addAppNotification({ key = '', title = 'ICAT Update', text = '', audience = 'all', players = [], team = '', kind = 'update' } = {}) {
    state.notifications ||= [];
    if (key && state.notifications.some(n => n && n.key === key)) return false;
    state.notifications.push({
      id: `nt${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      key,
      title,
      text,
      audience,
      players: Array.isArray(players) ? [...new Set(players.filter(Boolean))] : [],
      team,
      kind,
      createdAt: new Date().toISOString()
    });
    return true;
  }

  function notificationVisibleToCurrentUser(n) {
    if (!n) return false;
    if (!n.audience || n.audience === 'all') return true;
    if (n.audience === 'organizer') return isOrganizer();
    if (n.audience === 'admins') return isAdmin();
    if (n.audience === 'team') return !isOrganizer() && !!n.team && n.team === state.user?.team;
    if (n.audience === 'players') return !isOrganizer() && (n.players || []).includes(state.user?.fullName);
    return false;
  }

  function announcementVisibleToCurrentUser(a) {
    if (!a) return false;
    const audience = a.audience || 'all';
    if (audience === 'admins') return isAdmin();
    return true;
  }

  function currentNotifications() {
    const dynamic = (state.notifications || []).filter(notificationVisibleToCurrentUser).slice().sort((a,b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
    const standard = (state.announcements || []).filter(announcementVisibleToCurrentUser).map((a, i) => ({ id: a.id || `announcement_${i}`, title: a.title, text: a.text, date: a.date, kind: 'announcement', createdAt: a.createdAt || '' }));
    return [...dynamic, ...standard];
  }

  function refreshNotificationBadge() {
    const count = currentNotifications().length;
    $$('.bell-btn b').forEach(b => {
      b.textContent = count > 99 ? '99+' : String(count);
      b.classList.toggle('hidden', count === 0);
    });
  }

  function notifyRosterUpdated(team, count, reason = 'updated') {
    addAppNotification({
      key: `roster_${team}_${Date.now()}_${Math.random().toString(36).slice(2,5)}`,
      title: `Roster Updated · ${team}`,
      text: `${team} roster has been ${reason}. ${count} player${count === 1 ? '' : 's'} currently registered.`,
      audience: 'all',
      kind: 'roster'
    });
  }

  function matchParticipants(m) {
    if (!m) return [];
    const a = Array.isArray(m.rosterA) && m.rosterA.length ? m.rosterA : (state.squads[m.teamA] || []).slice(0, 11).map(p => p[0]);
    const b = Array.isArray(m.rosterB) && m.rosterB.length ? m.rosterB : (state.squads[m.teamB] || []).slice(0, 11).map(p => p[0]);
    return [...new Set([...a, ...b].filter(Boolean))];
  }

  function notifyMatchCompleted(m) {
    if (!m || m.completionNotified) return;
    const players = matchParticipants(m);
    if (!players.length) return;
    addAppNotification({
      key: `match_complete_${m.id}`,
      title: `Match Completed · ${m.teamA} vs ${m.teamB}`,
      text: m.result || `Final: ${m.scoreA || '—'} · ${m.scoreB || '—'}. Thanks for playing.`,
      audience: 'players',
      players,
      kind: 'match'
    });
    m.completionNotified = true;
  }

  function initials(name) { return String(name || '').split(/\s+/).slice(0, 2).map(x => x[0]).join('').toUpperCase(); }
  function escapeHtml(value) { return String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch])); }
  function dateLabel(d) { return new Date(`${d}T12:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric', weekday: 'short' }); }
  function dateLong(d) { return new Date(`${d}T12:00:00`).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }); }
  function isAdmin() { return role === 'admin'; }
  function isOrganizer() { return role === 'organizer'; }
  function isMember() { return role === 'member'; }
  function isAdminOrOrganizer() { return isAdmin() || isOrganizer(); }

  const SCORING_SESSION_KEY = 'icat_selected_match';
  const STREAM_MATCH_KEY = 'icat_stream_match_id';

  function otherMatchTeam(m, team) {
    if (!m) return '';
    if (m.teamA === team) return m.teamB;
    if (m.teamB === team) return m.teamA;
    return '';
  }

  function firstBattingTeam(m) {
    if (!m) return '';
    if (m.tossWinner && [m.teamA, m.teamB].includes(m.tossWinner)) {
      return String(m.decision || 'bat').toLowerCase() === 'bowl' ? otherMatchTeam(m, m.tossWinner) : m.tossWinner;
    }
    if (m.batFirst === 'A') return m.teamA;
    if (m.batFirst === 'B') return m.teamB;
    if (m.status === 'live') {
      if (/yet\s+to\s+bat/i.test(String(m.scoreB || ''))) return m.teamA;
      if (/yet\s+to\s+bat/i.test(String(m.scoreA || ''))) return m.teamB;
    }
    return '';
  }

  function currentBattingTeam(m) {
    if (!m) return '';
    if (m.battingTeam && [m.teamA, m.teamB].includes(m.battingTeam)) return m.battingTeam;
    const first = firstBattingTeam(m);
    if (!first) return '';
    const secondInnings = Number(m.currentInnings) === 1 || /(?:2nd|second)\s+innings/i.test(String(m.innings || ''));
    return secondInnings ? otherMatchTeam(m, first) : first;
  }

  function adminOwnsMatch(m) {
    return !!(isAdmin() && m && state.user?.team && [m.teamA, m.teamB].includes(state.user.team));
  }

  function localDateKey(d = new Date()) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function isMatchDay(m) {
    return !!(m && String(m.date || '').slice(0, 10) === localDateKey());
  }

  function canAdminScoreMatch(m) {
    return !!(adminOwnsMatch(m) && isMatchDay(m) && m.status !== 'result' && currentBattingTeam(m) === state.user.team);
  }

  function canAdminStreamMatch(m) {
    return !!(canAdminScoreMatch(m) && m.status === 'live');
  }

  function selectedScoringMatch() {
    try {
      const raw = sessionStorage.getItem(SCORING_SESSION_KEY);
      if (!raw) return null;
      const selected = JSON.parse(raw);
      const stored = state.matches.find(m => m.id === selected.id);
      if (!stored) return null;
      const merged = { ...stored, ...selected };
      return canAdminScoreMatch(merged) ? stored : null;
    } catch { return null; }
  }

  function authorizedStreamMatch() {
    const selectedId = sessionStorage.getItem(STREAM_MATCH_KEY);
    if (selectedId) {
      const selected = state.matches.find(m => m.id === selectedId);
      if (selected && canAdminStreamMatch(selected)) return selected;
    }
    const eligible = state.matches.find(m => canAdminStreamMatch(m));
    if (eligible) sessionStorage.setItem(STREAM_MATCH_KEY, eligible.id);
    return eligible || null;
  }
  const PAGE_ROUTES = {
    home: 'home.html',
    matches: { live: 'matches-live.html', upcoming: 'matches-upcoming.html', recent: 'matches-recent.html' },
    league: { overview: 'league.html', matches: 'league-matches.html', table: 'league-table.html', stats: 'stats.html', squads: 'squads.html', venues: 'venues.html' },
    team: 'teams.html',
    media: { highlights: 'media-highlights.html', announcements: 'media-announcements.html', gallery: 'gallery.html' },
    availability: 'availability.html',
    schedule: 'schedule.html',
    more: 'more.html',
    announcements: 'announcements.html',
    galleryPublic: 'public-gallery.html',
    teamIcat: 'team-icat.html',
    privacy: 'privacy-policy.html',
    terms: 'terms.html',
    admin: { matches: 'admin-matches.html', squads: 'admin-squads.html', availability: 'admin-availability.html', schedule: 'admin-schedule.html', contact: 'admin-contact.html' },
    organizer: { overview: 'organizer.html', teams: 'organizer-teams.html', players: 'organizer-players.html', access: 'organizer-access.html', rosters: 'organizer-rosters.html', schedule: 'organizer-schedule.html', announcements: 'organizer-announcements.html', inbox: 'organizer-inbox.html' },
    score: 'live-scoring.html',
    stream: 'live-studio.html',
    notifications: 'notifications.html',
    matchCenter: 'match-center.html'
  };

  function currentPageConfig() {
    const body = document.body;
    return {
      page: body.dataset.page || 'login',
      view: body.dataset.view || 'home',
      tab: body.dataset.tab || ''
    };
  }

  function routeUrl(name, options = {}) {
    const target = PAGE_ROUTES[name];
    if (!target) return 'home.html';
    if (typeof target === 'string') return target;
    const tab = options.tab || (name === 'matches' ? 'live' : name === 'league' ? 'matches' : name === 'media' ? 'highlights' : name === 'admin' ? 'matches' : name === 'organizer' ? 'overview' : '');
    return target[tab] || Object.values(target)[0];
  }

  // v3.2.26 — browser Back / Android swipe-back recovery.
  // A page restored from the browser back-forward cache can retain the
  // temporary `page-leaving` class. Reset it whenever a page is shown again
  // so the UI can never remain faded/blank after Back or swipe-back.
  function restoreVisiblePageState() {
    const root = document.documentElement;
    root.classList.remove('page-leaving');
    root.classList.add('page-ready', 'page-restoring');
    if (document.body) {
      document.body.style.opacity = '';
      document.body.style.visibility = '';
      document.body.style.pointerEvents = '';
    }
    // Back/forward cache restores should appear immediately with no
    // second entrance animation. Remove the guard only after two paints.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      root.classList.remove('page-restoring');
    }));
  }
  window.addEventListener('pageshow', restoreVisiblePageState, { capture: true });
  window.addEventListener('popstate', restoreVisiblePageState, { capture: true });
  window.addEventListener('pagehide', () => document.documentElement.classList.remove('page-leaving'), { capture: true });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) restoreVisiblePageState(); });

  function transitionNavigate(url, replace = false) {
    const here = location.pathname.split('/').pop() || 'index.html';
    if (here === url) return;
    const go = () => replace ? location.replace(url) : (location.href = url);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { go(); return; }
    document.documentElement.classList.add('page-leaving');
    window.setTimeout(go, 150);
  }

  function activateLocal(name, options = {}) {
    if (['admin', 'score', 'stream'].includes(name) && !isAdmin()) {
      toast('Captain / Admin access is required');
      transitionNavigate('home.html');
      return;
    }
    if (name === 'organizer' && !isOrganizer()) {
      toast('Organizer access is required');
      transitionNavigate('home.html');
      return;
    }
    if (name === 'media' && isMember()) { toast('Media Center is available to Admin access only'); transitionNavigate('home.html'); return; }
    if (['availability', 'schedule'].includes(name) && !isMember()) { transitionNavigate(isAdmin() ? routeUrl('admin', { tab: name === 'availability' ? 'availability' : 'schedule' }) : 'home.html'); return; }
    if (name === 'media' && isMember()) {
      toast('Media Center is available to Admin access only');
      transitionNavigate('home.html');
      return;
    }
    if (['availability', 'schedule'].includes(name) && !isMember()) {
      transitionNavigate(isAdmin() ? routeUrl('admin', { tab: name === 'availability' ? 'availability' : 'schedule' }) : 'home.html');
      return;
    }
    if (name === 'score' && !selectedScoringMatch()) {
      const eligible = state.matches.find(m => canAdminScoreMatch(m));
      if (eligible) { loadMatchIntoScorer(eligible); return; }
      toast('Live Scoring is available only to your team Admin on match day while your team is batting');
      transitionNavigate(routeUrl('admin', { tab: 'matches' }));
      return;
    }
    if (name === 'stream' && !authorizedStreamMatch()) {
      toast('Live Streaming is available only to the batting team admin during their live match');
      transitionNavigate(routeUrl('admin', { tab: 'matches' }));
      return;
    }
    $$('.view').forEach(v => v.classList.toggle('active', v.dataset.view === name));
    $$('[data-route]').forEach(b => b.classList.toggle('active', b.dataset.route === name));
    if (name === 'home') renderHome();
    if (name === 'matches') renderMatches(options.tab || activeMatchTab);
    if (name === 'league') renderLeague(options.tab || activeLeagueTab);
    if (name === 'team') renderTeam();
    if (name === 'availability') renderMemberAvailability();
    if (name === 'schedule') renderMemberSchedule();
    if (name === 'media') renderMedia(options.tab || 'highlights');
    if (name === 'more') renderMore();
    if (name === 'announcements') renderPublicAnnouncements();
    if (name === 'galleryPublic') renderPublicGallery();
    if (name === 'notifications') renderNotifications();
    if (name === 'matchCenter') renderMatchCenterPage();
    if (name === 'admin') renderAdmin(options.tab || activeAdminTab);
    if (name === 'organizer') renderOrganizer(options.tab || activeOrganizerTab);
    closeDrawer();
    window.scrollTo({ top: 0, behavior: 'auto' });
  }
  function toast(text) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = text;
    const root = $('toastRoot') || document.body; root.appendChild(t);
    setTimeout(() => t.remove(), 2800);
  }

  function resolveRosterUser(email) {
    const normalized = String(email || '').trim().toLowerCase();
    if (!normalized) return null;
    const directoryHit = Object.entries(state.playerDirectory || {}).find(([, meta]) => String(meta?.email || '').trim().toLowerCase() === normalized);
    if (directoryHit) {
      const [fullName, meta] = directoryHit;
      return { name: fullName.split(/\s+/)[0] || fullName, fullName, team: meta.team || '', email: meta.email || normalized, phone: meta.phone || '' };
    }
    const team = state.teams.find(t => String(t.email || '').trim().toLowerCase() === normalized);
    if (team) {
      const captainRow = (state.squads[team.name] || []).find(p => /captain/i.test(p[1])) || (state.squads[team.name] || [])[0];
      const fullName = captainRow?.[0] || team.captain;
      return { name: String(fullName).split(/\s+/)[0], fullName, team: team.name, email: team.email, phone: team.phone || '' };
    }
    return null;
  }

  function adminGrantedForEmail(email) {
    const normalized = String(email || '').trim().toLowerCase();
    const user = resolveRosterUser(normalized);
    if (!normalized || !user) return false;
    const onCurrentRoster = (state.squads[user.team] || []).some(p => p[0] === user.fullName);
    if (!onCurrentRoster) return false;
    return Object.entries(state.adminAccess || {}).some(([key, value]) => value === true && String(key || '').trim().toLowerCase() === normalized);
  }

  function teamAdminUsers(teamName) {
    const rows = [];
    const seen = new Set();
    (state.squads[teamName] || []).forEach(player => {
      const fullName = player[0];
      const meta = state.playerDirectory?.[fullName] || {};
      const email = String(meta?.email || '').trim();
      const normalized = email.toLowerCase();
      if (!email || seen.has(normalized) || !adminGrantedForEmail(email)) return;
      seen.add(normalized);
      rows.push({ name: fullName, email, phone: String(meta?.phone || '').trim(), team: teamName });
    });
    return rows.slice(0, 2);
  }

  function memberAvailabilityMap() {
    const key = String(state.user.email || '').trim().toLowerCase();
    state.memberAvailability ||= {};
    state.memberAvailability[key] ||= {};
    return state.memberAvailability[key];
  }

  function applyRoleUI() {
    $$('.admin-only').forEach(el => el.classList.toggle('hidden', !isAdmin()));
    $$('.organizer-only').forEach(el => el.classList.toggle('hidden', !isOrganizer()));
    $$('.member-only').forEach(el => el.classList.toggle('hidden', !isMember()));
    $$('.drawer-profile-list [data-route="team"], .drawer-profile-list [data-league-shortcut="stats"]').forEach(el => el.classList.toggle('hidden', isOrganizer()));
    const loginEmail = persistentStore.get(LOGIN_EMAIL_STORAGE) || '';
    if (!isOrganizer() && loginEmail) {
      const loginUser = resolveRosterUser(loginEmail);
      if (loginUser) Object.assign(state.user, loginUser);
    }
    const rolePill = $('roleStatusPill');
    if (rolePill) {
      const label = isOrganizer() ? 'ORGANIZER' : isAdmin() ? 'ADMIN' : 'MEMBER';
      rolePill.textContent = label;
      rolePill.className = `role-status-pill ${isOrganizer() ? 'role-organizer' : isAdmin() ? 'role-admin' : 'role-member'}`;
    }
    const drawerName = isOrganizer() ? (state.organizer?.name || 'ICAT Organizer') : (state.user.name || 'Member');
    const drawerRole = isOrganizer() ? 'League Organizer' : isAdmin() ? 'Captain · Admin · Scorer' : 'League Member';
    if ($('drawerUserRole')) $('drawerUserRole').textContent = drawerRole;
    if ($('drawerUserName')) $('drawerUserName').textContent = drawerName;
    const profileName = isOrganizer() ? (state.organizer?.name || 'ICAT Organizer') : (state.user.fullName || state.user.name || 'ICAT Player');
    const profileEmail = isOrganizer() ? (state.organizer?.email || 'organizer@icat.demo') : (state.user.email || '');
    const profileTeam = isOrganizer() ? 'League Organizer' : (state.user.team || 'ICAT');
    const profileInitials = profileName.split(/\s+/).filter(Boolean).slice(0,2).map(x => x[0]).join('').toUpperCase() || 'IC';
    if ($('drawerProfileName')) $('drawerProfileName').textContent = profileName;
    if ($('drawerProfileEmail')) $('drawerProfileEmail').textContent = profileEmail;
    if ($('drawerProfileTeam')) $('drawerProfileTeam').childNodes[0].nodeValue = profileTeam;
    if ($('drawerProfileAvatar')) $('drawerProfileAvatar').textContent = profileInitials;
    if ($('drawerProfileLabel')) $('drawerProfileLabel').textContent = isOrganizer() ? 'ICAT ORGANIZER' : isAdmin() ? 'ICAT CAPTAIN / ADMIN' : 'ICAT PLAYER';
    refreshNotificationBadge();
    document.body.dataset.role = role;
  }

  function route(name, options = {}) {
    // Organizer Home always means the Organizer Dashboard. This prevents the
    // organizer role from falling back into the public/member Home page.
    if (isOrganizer() && name === 'home') {
      transitionNavigate('organizer.html');
      return;
    }
    if (['admin', 'score', 'stream'].includes(name) && !isAdmin()) {
      toast('Captain / Admin access is required');
      transitionNavigate('home.html');
      return;
    }
    if (name === 'organizer' && !isOrganizer()) {
      toast('Organizer access is required');
      transitionNavigate('home.html');
      return;
    }
    if (name === 'score' && !selectedScoringMatch()) {
      const eligible = state.matches.find(m => canAdminScoreMatch(m));
      if (eligible) { loadMatchIntoScorer(eligible); return; }
      toast('Live Scoring is available only to your team Admin on match day while your team is batting');
      transitionNavigate(routeUrl('admin', { tab: 'matches' }));
      return;
    }
    if (name === 'stream' && !authorizedStreamMatch()) {
      toast('Live Studio is available only while your team is batting in a live match');
      transitionNavigate(routeUrl('admin', { tab: 'matches' }));
      return;
    }
    transitionNavigate(routeUrl(name, options));
  }

  function openDrawer() { $('drawer').classList.add('open'); $('drawerBackdrop').classList.add('open'); }
  function closeDrawer() { $('drawer').classList.remove('open'); $('drawerBackdrop').classList.remove('open'); }

  function liveCard(m, compact = false) {
    const chase = m.note || (m.innings && /need/i.test(m.innings) ? m.innings : `${m.teamA} batting · ${m.oversA || '0.0'} overs`);
    return `<article class="live-score-card live-score-card-v3 ${compact ? 'compact' : ''}" data-match-id="${m.id}">
      <div class="live-card-head"><span>${escapeHtml(state.league.name).toUpperCase()}</span><span class="live-now-chip"><i></i> LIVE</span></div>
      <div class="live-score-main live-score-main-v3">
        <div class="live-team"><span class="team-crest-v3 ${teamColor(m.teamA)}">${initials(m.teamA)}</span><div><strong>${escapeHtml(m.teamA)}</strong><small>${escapeHtml(m.batsman || 'Batting')}</small></div></div>
        <div class="live-score-center"><strong>${escapeHtml(m.scoreA)}</strong><span>${escapeHtml(m.oversA || '0.0')} overs</span><small>VS</small></div>
        <div class="live-team right"><div><strong>${escapeHtml(m.teamB)}</strong><small>${escapeHtml(m.bowler || 'Bowling')}</small></div><span class="team-crest-v3 ${teamColor(m.teamB)}">${initials(m.teamB)}</span></div>
      </div>
      <div class="live-chase-line">${escapeHtml(chase)}</div>
      <div class="live-card-footer"><span>CRR <b>${escapeHtml(m.crr || '—')}</b></span><span>WEEK ${m.week}</span><button class="ghost-btn small open-live-match" data-match-id="${m.id}">Match Center ›</button><button class="ghost-btn small watch-live-match" data-match-id="${m.id}">Watch ›</button>${canAdminScoreMatch(m) ? `<button class="gold-mini score-live-match" data-match-id="${m.id}">Live Scoring ›</button>` : ''}</div>
    </article>`;
  }

  function resultCard(m, compact = false) {
    return `<article class="result-card-v21 result-card-v3 ${compact ? 'compact' : ''}">
      <div class="result-card-top"><span>${escapeHtml(state.league.name).toUpperCase()} · WEEK ${m.week}</span><span>${dateLabel(m.date)}</span></div>
      <div class="result-team-row"><div><span class="team-crest-v3 ${teamColor(m.teamA)}">${initials(m.teamA)}</span><strong>${escapeHtml(m.teamA)}</strong><small>${escapeHtml(m.scoreA)}</small></div><span class="final-chip">FINAL</span><div class="right"><small>${escapeHtml(m.scoreB)}</small><strong>${escapeHtml(m.teamB)}</strong><span class="team-crest-v3 ${teamColor(m.teamB)}">${initials(m.teamB)}</span></div></div>
      <div class="result-line">${escapeHtml(m.result)}</div>
    </article>`;
  }

  function upcomingCard(m, adminActions = false) {
    return `<article class="fixture-card-v21 fixture-card-v3">
      <div class="fixture-date"><span>FWCWL · WEEK ${m.week}</span><strong>${dateLabel(m.date)}</strong><small>${escapeHtml(m.time)} · ${escapeHtml(m.venue)}</small></div>
      <div class="fixture-matchup"><div><span class="team-crest-v3 ${teamColor(m.teamA)}">${initials(m.teamA)}</span><strong>${escapeHtml(m.teamA)}</strong></div><b>VS</b><div><strong>${escapeHtml(m.teamB)}</strong><span class="team-crest-v3 ${teamColor(m.teamB)}">${initials(m.teamB)}</span></div></div>
      <div class="fixture-meta"><span>20 Overs</span><button class="ghost-btn small open-live-match" data-match-id="${m.id}">Venue Details</button></div>
      ${adminActions && isAdmin() ? `<div class="card-actions"><button class="ghost-btn small edit-match" data-match-id="${m.id}">Edit Match Center</button>${canAdminScoreMatch(m) ? `<button class="gold-mini score-match" data-match-id="${m.id}">Open Scoring</button>` : ''}</div>` : ''}
    </article>`;
  }

  function teamColor(teamName) {
    const t = state.teams.find(x => x.name === teamName);
    return t ? t.color : 'blue';
  }

  function renderHome() {
    const live = state.matches.filter(m => m.status === 'live');
    const recent = state.matches.filter(m => m.status === 'result').slice().sort((a, b) => b.date.localeCompare(a.date));
    $('homeLiveCount').textContent = live.length;
    $('homeLiveMatches').innerHTML = live.length ? live.map(m => liveCard(m)).join('') : `<div class="empty-state"><strong>No match is live right now</strong><span>Upcoming matches are available in Matches.</span></div>`;
    $('homeRecentResults').innerHTML = recent.slice(0, 3).map(m => resultCard(m, true)).join('');
    $('homeAnnouncements').innerHTML = state.announcements.slice(0, 3).map(a => `<div class="announcement"><strong>${escapeHtml(a.title)}</strong><small>${escapeHtml(a.date)} · ${escapeHtml(a.text)}</small></div>`).join('');
    bindDynamic();
  }

  function renderMatches(tab = 'live') {
    activeMatchTab = tab;
    $$('#matchesTabs button').forEach(b => b.classList.toggle('active', b.dataset.matchTab === tab));
    const liveCount = state.matches.filter(m => m.status === 'live').length;
    $('matchesLiveBadge').textContent = `${liveCount} LIVE`;
    const panel = $('matchesPanel');
    if (tab === 'live') {
      const rows = state.matches.filter(m => m.status === 'live');
      panel.innerHTML = `<div class="matches-section-label"><span>LIVE · LEAGUE</span><strong>${escapeHtml(state.league.name)}</strong></div><div class="live-match-stack">${rows.length ? rows.map(m => liveCard(m)).join('') : '<div class="empty-state"><strong>No live matches</strong><span>Check Upcoming for the next fixtures.</span></div>'}</div>`;
    }
    if (tab === 'upcoming') {
      const rows = state.matches.filter(m => m.status === 'scheduled').slice().sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
      panel.innerHTML = `<div class="fixture-grid-v21">${rows.map(m => upcomingCard(m, false)).join('')}</div>`;
    }
    if (tab === 'recent') {
      const rows = state.matches.filter(m => m.status === 'result').slice().sort((a, b) => b.date.localeCompare(a.date));
      panel.innerHTML = `<div class="results-grid-v21">${rows.map(m => resultCard(m)).join('')}</div>`;
    }
    bindDynamic();
  }

  function renderVenueDirectory(filter = 'all') {
    const list = document.querySelector('.venue-list-v3');
    if (!list) return;
    const key = String(filter || 'all').toLowerCase();
    const rows = state.venues.filter(v => {
      if (key === 'all') return true;
      const hay = `${v.name || ''} ${v.city || ''}`.toLowerCase();
      if (key === 'st-petersburg') return hay.includes('st. petersburg') || hay.includes('saint petersburg');
      return hay.includes(key);
    });
    list.innerHTML = rows.length ? rows.map(v => `<article class="venue-detail-card" data-venue-name="${escapeHtml(v.name)}" role="button" tabindex="0" aria-label="View ${escapeHtml(v.name)} venue details"><b>⌖</b><div><strong>${escapeHtml(v.name)}</strong><small>${escapeHtml(v.city)}</small><p>${escapeHtml(v.note)}</p></div><span>${v.matches} fixtures</span><i>›</i></article>`).join('') : `<div class="empty-state small-empty"><strong>No venues in this filter</strong><span>Try another location.</span></div>`;
  }

  function bindVenueFilters() {
    $$('.venue-filter-v3 button').forEach(btn => {
      btn.onclick = () => {
        $$('.venue-filter-v3 button').forEach(x => x.classList.remove('active'));
        btn.classList.add('active');
        renderVenueDirectory(btn.dataset.venueFilter || 'all');
      };
    });
  }

  function openVenueDetails(name) {
    const venue = state.venues.find(v => v.name === name);
    if (!venue) { toast('Venue details are unavailable'); return; }
    const fixtures = state.matches
      .filter(m => m.venue === venue.name)
      .slice()
      .sort((a, b) => `${a.date || ''}${a.time || ''}`.localeCompare(`${b.date || ''}${b.time || ''}`));
    const fixtureList = fixtures.length ? fixtures.map(m => `<article class="admin-match-card ${escapeHtml(m.status || 'scheduled')}"><div class="admin-match-status"><span>${m.status === 'live' ? 'LIVE NOW' : m.status === 'result' ? 'FINAL' : `WEEK ${m.week || '—'}`}</span><small>${escapeHtml(dateLabel(m.date))} · ${escapeHtml(m.time || '—')}</small></div><div class="admin-match-teams"><strong>${escapeHtml(m.teamA)}</strong><b>VS</b><strong>${escapeHtml(m.teamB)}</strong><small>${escapeHtml(m.overs || 20)} overs</small></div><div class="admin-match-actions"><button class="ghost-btn small venue-open-match" data-match-id="${escapeHtml(m.id)}">Match Center</button></div></article>`).join('') : `<div class="empty-state small-empty"><strong>No fixtures scheduled</strong><span>There are no league matches assigned to this venue yet.</span></div>`;
    modal('Venue Details', `<section class="dash-card"><div class="section-row"><div><div class="card-kicker">VENUE</div><h3>${escapeHtml(venue.name)}</h3><p>${escapeHtml(venue.city)}</p></div><span class="status-badge">${fixtures.length} FIXTURE${fixtures.length === 1 ? '' : 'S'}</span></div><p>${escapeHtml(venue.note || 'Venue details not provided')}</p></section><div class="admin-match-list">${fixtureList}</div>`);
    $$('.venue-open-match').forEach(b => b.onclick = () => { closeModal(); openLiveMatchDetails(b.dataset.matchId); });
  }

  function renderLeague(tab = 'matches') {
    activeLeagueTab = tab;
    $$('#leagueTabs button').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    const p = $('leaguePanel');
    if (tab === 'overview') {
      const live = state.matches.filter(m => m.status === 'live').length;
      const total = state.matches.length;
      p.innerHTML = `<div class="league-glance-v3"><div class="section-row v3-section-title"><h3>LEAGUE AT A GLANCE</h3><span>WINTER 2026</span></div><div class="glance-grid-v3"><article><b>♟</b><strong>${state.teams.length}</strong><span>TEAMS</span></article><article><b>●</b><strong>${total}</strong><span>MATCHES</span></article><article><b>⌖</b><strong>${state.venues.length}</strong><span>VENUES</span></article><article><b>♕</b><strong>${live}</strong><span>LIVE</span></article></div><div class="section-row v3-section-title"><h3>QUICK ACCESS</h3><span>EXPLORE LEAGUE</span></div><div class="league-quick-v3"><button data-league-panel="table"><b>♕</b><span><strong>Points Table</strong><small>Standings and rankings</small></span><i>›</i></button><button data-league-panel="stats"><b>▥</b><span><strong>Player Statistics</strong><small>Top runs, wickets and more</small></span><i>›</i></button><button data-league-panel="venues"><b>⌖</b><span><strong>Venues</strong><small>Grounds and match details</small></span><i>›</i></button><button data-league-panel="matches"><b>▣</b><span><strong>League Matches</strong><small>Live and upcoming fixtures</small></span><i>›</i></button></div></div>`;
    }
    if (tab === 'matches') {
      const live = state.matches.filter(m => m.status === 'live');
      const scheduled = state.matches.filter(m => m.status === 'scheduled');
      p.innerHTML = `<div class="league-section"><div class="section-row"><h3>Live</h3><button class="text-btn league-go-live">All live →</button></div>${live.map(m => liveCard(m, true)).join('')}</div><div class="league-section"><div class="section-row"><h3>Upcoming</h3><span class="muted">${scheduled.length} fixtures</span></div><div class="fixture-grid-v21">${scheduled.map(m => upcomingCard(m, false)).join('')}</div></div>`;
    }
    if (tab === 'table') {
      p.innerHTML = `<div class="league-panel-scroll table-card-v21"><table class="points-table"><thead><tr><th>#</th><th>Team</th><th>P</th><th>W</th><th>L</th><th>NRR</th><th>Pts</th></tr></thead><tbody>${state.points.map((r, i) => `<tr><td><span class="rank-chip">${i + 1}</span></td><td><strong>${escapeHtml(r.team)}</strong></td><td>${r.p}</td><td>${r.w}</td><td>${r.l}</td><td>${r.nrr}</td><td><strong class="points-strong">${r.pts}</strong></td></tr>`).join('')}</tbody></table></div>`;
    }
    if (tab === 'stats') {
      p.innerHTML = `<section class="player-stats-v3"><div class="stats-v3-head"><div><h2>Player Statistics</h2></div><span>WINTER 2026⌄</span></div><div class="stats-cats-v3"><button class="active stats-category-btn" data-stats-category="batting">🏏<span>BATTING</span></button><button class="stats-category-btn" data-stats-category="bowling">●<span>BOWLING</span></button><button class="stats-category-btn" data-stats-category="allrounder">★<span>ALL ROUNDER</span></button><button class="stats-category-btn" data-stats-category="fielding">◈<span>FIELDING</span></button></div><div id="statsCategoryPanel"></div></section>`;
      renderStatsPanel(activeStatsCategory);
    }
    if (tab === 'squads') {
      p.innerHTML = `<div class="squad-team-grid">${state.teams.map(t => `<article class="squad-team-card"><div class="squad-team-head"><span class="team-badge ${t.color}">${initials(t.name)}</span><div><strong>${escapeHtml(t.name)}</strong><small>Captain · ${escapeHtml(t.captain)}</small></div><span>${(state.squads[t.name] || []).length} players</span></div><div class="squad-preview">${(state.squads[t.name] || []).slice(0, 5).map(p => `<div><b>${escapeHtml(p[0])}</b><small>${escapeHtml(p[1])}</small></div>`).join('')}</div><button class="ghost-btn small view-squad" data-team="${escapeHtml(t.name)}">View Squad</button></article>`).join('')}</div>`;
    }
    if (tab === 'venues') {
      p.innerHTML = `<section class="venues-page-v3"><div class="venues-head-v3"><div><span>EXPLORE · PLAY · PLAN · TOGETHER</span><h2>Venues</h2></div></div><div class="venue-search-v3">⌕ <span>Search venues in Tampa Bay...</span></div><div class="venue-filter-v3"><button class="active" data-venue-filter="all">All Venues</button><button data-venue-filter="tampa">⌖ Tampa</button><button data-venue-filter="st-petersburg">⌖ St. Petersburg</button><button data-venue-filter="clearwater">⌖ Clearwater</button></div><div class="venue-list-v3">${state.venues.map((v,i)=>`<article class="venue-detail-card" data-venue-name="${escapeHtml(v.name)}" role="button" tabindex="0" aria-label="View ${escapeHtml(v.name)} venue details"><b>⌖</b><div><strong>${escapeHtml(v.name)}</strong><small>${escapeHtml(v.city)}</small><p>${escapeHtml(v.note)}</p></div><span>${v.matches} fixtures</span><i>›</i></article>`).join('')}</div></section>`;
    }
    bindDynamic();
  }


  function statsTeamOptions(selected) {
    return ['All Teams', ...state.teams.map(t => t.name)].map(team => `<option value="${escapeHtml(team)}" ${team === selected ? 'selected' : ''}>${escapeHtml(team)}</option>`).join('');
  }

  function statsRowsForTeam(rows, team) {
    return team === 'All Teams' ? rows : rows.filter(r => r.team === team);
  }

  function renderStatsPanel(category = 'batting') {
    activeStatsCategory = category;
    $$('.stats-category-btn').forEach(b => b.classList.toggle('active', b.dataset.statsCategory === category));
    const panel = $('statsCategoryPanel');
    if (!panel) return;
    const scope = statsScope();
    const scopedRows = rows => scope === 'me' ? rows.filter(r => r.player === state.user.fullName) : scope === 'team' ? rows.filter(r => r.team === state.user.team) : rows;
    const scopeControl = selected => scope === 'league'
      ? `<select class="stats-team-filter" id="${category}TeamFilter" aria-label="Filter ${category} leaderboard by team">${statsTeamOptions(selected)}</select>`
      : `<span class="status-badge">${scope === 'me' ? 'MY STATS' : escapeHtml(state.user.team)}</span>`;

    if (category === 'batting') {
      const selected = scope === 'league' ? statsTeamFilter.batting : (scope === 'team' ? state.user.team : 'All Teams');
      let rows = scopedRows(state.stats.batting || []).slice().sort((a,b) => Number(b.value) - Number(a.value));
      if (scope === 'league') rows = statsRowsForTeam(rows, selected);
      panel.innerHTML = `<div class="section-row v3-section-title stats-filter-head"><h3>BATTING LEADERBOARD</h3>${scopeControl(selected)}</div><div class="stats-table-v3"><div class="stats-tr stats-th"><span>#</span><span>PLAYER</span><span>TEAM</span><span>RUNS</span><span>AVG</span><span>SR</span></div>${rows.length ? rows.map((r,i)=>{const bits=String(r.detail||'').split(' · ');const avg=(bits[0]||'').replace('Avg ','');const sr=(bits[1]||'').replace('SR ','');return `<div class="stats-tr ${i===0?'leader':''}"><span>${i+1}</span><strong>${escapeHtml(r.player)}</strong><b>${initials(r.team)}</b><strong>${r.value}</strong><span>${avg}</span><span>${sr}</span></div>`}).join('') : `<div class="stats-filter-empty">No batting statistics available.</div>`}</div>`;
      const filter = $('battingTeamFilter');
      if (scope === 'league' && filter) filter.onchange = () => { statsTeamFilter.batting = filter.value; renderStatsPanel('batting'); };
      return;
    }

    if (category === 'bowling') {
      const selected = scope === 'league' ? statsTeamFilter.bowling : (scope === 'team' ? state.user.team : 'All Teams');
      let rows = scopedRows(state.stats.bowling || []).slice().sort((a,b) => Number(b.value) - Number(a.value));
      if (scope === 'league') rows = statsRowsForTeam(rows, selected);
      panel.innerHTML = `<div class="section-row v3-section-title stats-filter-head"><h3>BOWLING LEADERS</h3>${scopeControl(selected)}</div><div class="mini-stat-list-v3">${rows.length ? rows.map((r,i)=>`<div><b>${i+1}</b><strong>${escapeHtml(r.player)}</strong><span>${escapeHtml(r.team)}</span><em>${r.value} ${escapeHtml(r.label)} · ${escapeHtml(r.detail)}</em></div>`).join('') : `<div class="stats-filter-empty">No bowling statistics available.</div>`}</div>`;
      const filter = $('bowlingTeamFilter');
      if (scope === 'league' && filter) filter.onchange = () => { statsTeamFilter.bowling = filter.value; renderStatsPanel('bowling'); };
      return;
    }

    if (category === 'allrounder') {
      const rows = scopedRows(state.stats.allrounder || []).map(r => {
        const fielding = Number(r.catches||0) + Number(r.runOuts||0) + Number(r.stumpings||0);
        const impact = Number(r.runs||0) + Number(r.wickets||0)*20 + Number(r.catches||0)*8 + Number(r.runOuts||0)*10 + Number(r.stumpings||0)*10;
        return { ...r, fielding, impact };
      }).sort((a,b) => b.impact - a.impact || b.runs - a.runs);
      panel.innerHTML = `<div class="section-row v3-section-title"><h3>ALL ROUNDER RANKINGS</h3><span>BATTING · BOWLING · FIELDING</span></div><div class="mini-stat-list-v3 stats-role-list">${rows.length ? rows.map((r,i)=>`<div><b>${i+1}</b><strong>${escapeHtml(r.player)}</strong><span>${escapeHtml(r.team)}</span><em>${r.runs} R · ${r.wickets} W · ${r.fielding} FIELD · ${r.impact} IMPACT</em></div>`).join('') : `<div class="stats-filter-empty">No all-rounder statistics available.</div>`}</div>`;
      return;
    }

    const all = scopedRows(state.stats.fielding || []);
    const keepers = all.filter(r => r.wicketkeeper).map(r => ({...r,total:Number(r.catches||0)+Number(r.runOuts||0)+Number(r.stumpings||0)})).sort((a,b)=>b.total-a.total || b.stumpings-a.stumpings || b.catches-a.catches);
    const catches = all.slice().sort((a,b)=>Number(b.catches||0)-Number(a.catches||0) || Number(b.runOuts||0)-Number(a.runOuts||0));
    const runouts = all.slice().sort((a,b)=>Number(b.runOuts||0)-Number(a.runOuts||0) || Number(b.catches||0)-Number(a.catches||0));
    const compact = (rows, metric, label) => rows.filter(r => Number(r[metric]||0)>0).slice(0,10).map((r,i)=>`<div><b>${i+1}</b><strong>${escapeHtml(r.player)}</strong><span>${escapeHtml(r.team)}</span><em>${r[metric]} ${label}</em></div>`).join('');
    panel.innerHTML = `<div class="section-row v3-section-title"><h3>BEST WICKETKEEPER</h3><span>CATCHES · RUN OUTS · STUMPINGS</span></div><div class="mini-stat-list-v3">${keepers.length ? keepers.map((r,i)=>`<div><b>${i+1}</b><strong>${escapeHtml(r.player)}</strong><span>${escapeHtml(r.team)}</span><em>${r.catches} C · ${r.runOuts} RO · ${r.stumpings} ST · ${r.total} TOTAL</em></div>`).join('') : `<div class="stats-filter-empty">No wicketkeeper statistics available.</div>`}</div><div class="section-row v3-section-title"><h3>MOST CATCHES</h3><span>LEAGUE</span></div><div class="mini-stat-list-v3">${compact(catches,'catches','CATCHES')}</div><div class="section-row v3-section-title"><h3>MOST RUN OUTS</h3><span>LEAGUE</span></div><div class="mini-stat-list-v3">${compact(runouts,'runOuts','RUN OUTS')}</div>`;
  }

  function statBoard(title, rows, accent) {
    return `<section class="stat-board ${accent}"><div class="card-kicker">LEAGUE STATS</div><h3>${title}</h3><div class="stat-list">${rows.map((r, i) => `<div class="stat-row"><span class="stat-rank">${i + 1}</span><div class="stat-player"><strong>${escapeHtml(r.player)}</strong><small>${escapeHtml(r.team)} · ${escapeHtml(r.detail)}</small></div><div class="stat-value"><strong>${r.value}</strong><small>${escapeHtml(r.label)}</small></div></div>`).join('')}</div></section>`;
  }

  function adminTeamMatches() {
    return state.matches
      .filter(m => m.teamA === state.user.team || m.teamB === state.user.team)
      .slice()
      .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  }

  function renderAdminAvailability(matchId = '') {
    const p = $('adminPanel');
    if (!p) return;
    const matches = adminTeamMatches();
    if (!matches.length) {
      p.innerHTML = `<div class="empty-state"><strong>No team matches found</strong></div>`;
      bindDynamic();
      return;
    }
    const next = getNextMatchForTeam(state.user.team);
    const chosen = matches.find(m => m.id === matchId) || matches.find(m => m.id === activeAvailabilityMatchId) || next || matches[0];
    activeAvailabilityMatchId = chosen.id;
    const squad = state.squads[state.user.team] || [];
    const map = state.teamAvailability[chosen.id] || {};
    const av = getAvailabilitySummary(chosen.id, state.user.team);
    p.innerHTML = `<section class="availability-admin-card">
      <div class="availability-admin-head"><div><div class="card-kicker">TEAM AVAILABILITY BY MATCH</div><h3>${escapeHtml(state.user.team)}</h3><p>Only your team players are shown. Select any team match to review posted availability.</p></div><div class="availability-summary"><span class="av-yes">${av.yes} Available</span><span class="av-no">${av.no} Unavailable</span><span class="av-pending">${av.unknown} Pending</span></div></div>
      <div class="admin-work-actions" style="margin:12px 0 16px"><label style="width:100%">Match<select id="adminAvailabilityMatchSelect">${matches.map(m => `<option value="${escapeHtml(m.id)}" ${m.id === chosen.id ? 'selected' : ''}>Week ${m.week} · ${escapeHtml(m.teamA)} vs ${escapeHtml(m.teamB)} · ${dateLabel(m.date)}</option>`).join('')}</select></label></div>
      <div class="availability-admin-head match-availability-selected"><div><div class="card-kicker">SELECTED MATCH</div><h3>${escapeHtml(chosen.teamA)} vs ${escapeHtml(chosen.teamB)}</h3><p>${dateLong(chosen.date)} · ${escapeHtml(chosen.time)} · ${escapeHtml(chosen.venue)}</p></div><span class="status-badge">${escapeHtml(String(chosen.status || 'scheduled').toUpperCase())}</span></div>
      <div class="availability-admin-table"><div class="availability-table-head"><span>Player</span><span>Role</span><span>Status</span></div>${squad.map(player => { const st = map[player[0]] || 'unknown'; return `<div class="availability-table-row"><div><span class="player-dot ${st}"></span><strong>${escapeHtml(player[0])}</strong></div><span>${escapeHtml(player[1])}</span><b class="availability-status ${st}">${statusLabel(st)}</b></div>`; }).join('')}</div>
    </section>`;
    const select = $('adminAvailabilityMatchSelect');
    if (select) select.onchange = () => renderAdminAvailability(select.value);
    bindDynamic();
  }

  function renderAdmin(tab = 'matches') {
    if (!isAdmin()) return;
    if (tab === 'captains') tab = 'matches';
    activeAdminTab = tab;
    $$('#adminTabs button').forEach(b => b.classList.toggle('active', b.dataset.adminTab === tab));

    const p = $('adminPanel');
    if (tab === 'squads') {
      p.innerHTML = `<section class="admin-work-card"><div class="admin-work-head"><div><div class="card-kicker">SQUAD MANAGEMENT</div><h3>Edit registered squad</h3></div><div class="admin-work-actions"><select id="squadTeamSelect">${state.teams.map(t => `<option value="${escapeHtml(t.name)}">${escapeHtml(t.name)}</option>`).join('')}</select><button id="adminRequestPlayerBtn" class="primary-btn small">Request New Player</button></div></div><div id="adminSquadEditor"></div></section><section class="admin-work-card requests-card"><div class="admin-work-head"><div><div class="card-kicker">ORGANIZER APPROVAL</div><h3>Player requests</h3></div></div><div id="playerRequestList"></div></section>`;
      $('squadTeamSelect').value = state.user.team;
      renderAdminSquadEditor();
      renderPlayerRequests();
      $('squadTeamSelect').onchange = renderAdminSquadEditor;
      $('adminRequestPlayerBtn').onclick = requestPlayer;
    }
    if (tab === 'availability') {
      renderAdminAvailability(activeAvailabilityMatchId);
      return;
    }
    if (tab === 'schedule') {
      const rows = adminTeamMatches();
      p.innerHTML = `<section class="admin-work-card"><div class="admin-work-head"><div><div class="card-kicker">${escapeHtml(state.league.season.toUpperCase())}</div><h3>${escapeHtml(state.user.team)} · Entire Season Schedule</h3></div><span class="request-status">${rows.length} MATCHES</span></div><div class="admin-match-list">${rows.length ? rows.map(m => {
        const opponent = m.teamA === state.user.team ? m.teamB : m.teamA;
        const score = m.status === 'result' ? `${escapeHtml(m.scoreA || '')} · ${escapeHtml(m.scoreB || '')}` : m.status === 'live' ? `${escapeHtml(m.scoreA || '')} · ${escapeHtml(m.oversA || '0.0')} overs` : `${m.overs} overs`;
        return `<article class="admin-match-card ${escapeHtml(m.status || 'scheduled')}"><div class="admin-match-status"><span>${m.status === 'live' ? 'LIVE NOW' : `WEEK ${m.week}`}</span><small>${dateLabel(m.date)} · ${escapeHtml(m.time)}</small></div><div class="admin-match-teams"><strong>${escapeHtml(state.user.team)}</strong><b>VS</b><strong>${escapeHtml(opponent)}</strong><small>${escapeHtml(m.venue)} · ${score}</small>${m.result ? `<small>${escapeHtml(m.result)}</small>` : ''}</div></article>`;
      }).join('') : '<div class="empty-state"><strong>No matches in this season</strong></div>'}</div></section>`;
    }
    if (tab === 'matches') {
      const rows = adminTeamMatches().filter(m => ['live', 'scheduled'].includes(m.status));
      p.innerHTML = `<div class="admin-match-list">${rows.map(m => `<article class="admin-match-card ${m.status}"><div class="admin-match-status"><span>${m.status === 'live' ? 'LIVE NOW' : `WEEK ${m.week}`}</span><small>${dateLabel(m.date)} · ${escapeHtml(m.time)}</small></div><div class="admin-match-teams"><strong>${escapeHtml(m.teamA)}</strong><b>VS</b><strong>${escapeHtml(m.teamB)}</strong><small>${escapeHtml(m.venue)} · ${m.overs} overs</small></div><div class="admin-match-actions"><button class="ghost-btn small edit-match" data-match-id="${m.id}">Edit Match Center</button>${canAdminScoreMatch(m) ? `<button class="primary-btn small score-match" data-match-id="${m.id}">${m.status === 'live' ? 'Open Live Scoring' : 'Open Scoring'}</button>` : ''}</div></article>`).join('')}</div>`;
    }
    if (tab === 'contact') {
      const mine = (state.adminMessages || []).filter(x => x.from === state.user.fullName || x.team === state.user.team).slice().reverse();
      p.innerHTML = `<div class="admin-contact-grid"><section class="admin-work-card"><div class="admin-work-head"><div><div class="card-kicker">CONTACT ORGANIZER</div><h3>Request · Complaint · Feedback</h3></div></div><div class="form-grid two"><label>Type<select id="adminMsgType"><option value="request">Request</option><option value="complaint">Complaint</option><option value="feedback">Feedback</option></select></label><label>Send via<select id="adminMsgChannel"><option value="app">ICAT Inbox</option><option value="email">ICAT Inbox + Email</option><option value="whatsapp">ICAT Inbox + WhatsApp</option></select></label><label class="span2">Subject<input id="adminMsgSubject" placeholder="Short subject"></label><label class="span2">Message<textarea id="adminMsgBody" rows="6" placeholder="Write your message to the organizer"></textarea></label></div><button class="primary-btn full" id="sendAdminMessageBtn">Send to Organizer</button></section><section class="admin-work-card"><div class="admin-work-head"><div><div class="card-kicker">SUBMITTED</div><h3>Your recent messages</h3></div></div><div class="organizer-inbox-list">${mine.length ? mine.map(messageCard).join('') : '<div class="empty-state small-empty"><strong>No messages yet</strong><span>Your organizer requests, complaints and feedback will appear here.</span></div>'}</div></section></div>`;
      $('sendAdminMessageBtn').onclick = sendAdminMessage;
    }
    bindDynamic();
  }

  function messageCard(m) {
    const type = String(m.type || 'request').toUpperCase();
    const date = m.createdAt ? new Date(m.createdAt).toLocaleString() : '';
    return `<article class="org-message-card ${escapeHtml(m.type || 'request')}"><div class="org-message-top"><span>${type}</span><b class="message-status ${escapeHtml(m.status || 'open')}">${escapeHtml((m.status || 'open').toUpperCase())}</b></div><h4>${escapeHtml(m.subject || 'Message')}</h4><p>${escapeHtml(m.message || '')}</p><small>${escapeHtml(m.from || 'Admin')} · ${escapeHtml(m.team || '')} · ${escapeHtml(date)}</small>${isOrganizer() && (m.status || 'open') !== 'resolved' ? `<button class="text-btn resolve-admin-message" data-message-id="${escapeHtml(m.id)}">Mark Resolved</button>` : ''}</article>`;
  }

  function renderOrganizer(tab = 'overview') {
    if (!isOrganizer()) return;
    activeOrganizerTab = tab;
    $$('#organizerTabs button').forEach(b => b.classList.toggle('active', b.dataset.organizerTab === tab));
    const p = $('organizerPanel');
    if (!p) return;
    const pendingPlayerRequests = (state.playerRequests || []).filter(x => !x.status || x.status === 'pending').length;
    const openMessages = (state.adminMessages || []).filter(x => (x.status || 'open') !== 'resolved').length + pendingPlayerRequests;
    if ($('organizerKpis')) $('organizerKpis').innerHTML = `
      <div class="admin-kpi organizer-inbox-kpi"><span>INBOX</span><strong>${openMessages}</strong><small>Open items</small></div>`;

    if (tab === 'overview') {
      p.innerHTML = `<div class="organizer-overview-grid"><section class="organizer-action-grid"><button data-organizer-shortcut="teams"><b>♟</b><strong>Add / Manage Teams</strong><small>League team directory</small></button><button data-organizer-shortcut="players"><b>♙+</b><strong>Add Players</strong><small>Assign players to squads</small></button><button data-organizer-shortcut="access"><b>⚙</b><strong>Admin Access</strong><small>Grant or revoke captain access</small></button><button data-organizer-shortcut="rosters"><b>XL</b><strong>Roster Excel Upload</strong><small>Organizer-only roster import</small></button><button data-organizer-shortcut="schedule"><b>▣</b><strong>Schedule Excel Upload</strong><small>Update league fixtures</small></button><button data-organizer-shortcut="announcements"><b>!</b><strong>Announcements</strong><small>Send to everyone or admins</small></button><button data-organizer-shortcut="inbox"><b>✉</b><strong>Admin Inbox</strong><small>Requests, complaints, feedback</small></button></section><section class="admin-work-card"><div class="admin-work-head"><div><div class="card-kicker">ADMIN DIRECTORY</div><h3>Reach Captains / Admins</h3></div></div><div class="captain-admin-grid compact-org">${state.teams.map(t => organizerAdminCard(t)).join('')}</div></section></div>`;
    }
    if (tab === 'teams') {
      p.innerHTML = `<section class="admin-work-card"><div class="admin-work-head"><div><div class="card-kicker">LEAGUE TEAMS</div><h3>Team Management</h3></div><button class="primary-btn small" id="organizerAddTeamBtn">+ Add Team</button></div><div class="organizer-team-list">${state.teams.map(t => `<article><div class="captain-avatar ${t.color}">${initials(t.name)}</div><div><strong>${escapeHtml(t.name)}</strong><small>Captain · ${escapeHtml(t.captain)} · ${(state.squads[t.name]||[]).length} players</small></div><div><button class="ghost-btn small captain-email" data-email="${escapeHtml(t.email)}">Email</button><button class="ghost-btn small captain-wa" data-phone="${escapeHtml(t.phone)}">WhatsApp</button></div></article>`).join('')}</div></section>`;
      $('organizerAddTeamBtn').onclick = organizerAddTeam;
    }
    if (tab === 'players') {
      const selected = state.teams[0]?.name || '';
      p.innerHTML = `<section class="admin-work-card"><div class="admin-work-head"><div><div class="card-kicker">PLAYER DIRECTORY</div><h3>Add Players</h3></div><div class="admin-work-actions"><select id="organizerPlayerTeam">${state.teams.map(t=>`<option>${escapeHtml(t.name)}</option>`).join('')}</select><button class="primary-btn small" id="organizerAddPlayerBtn">+ Add Player</button></div></div><div id="organizerPlayerList"></div></section>`;
      $('organizerPlayerTeam').value = selected;
      $('organizerPlayerTeam').onchange = renderOrganizerPlayerList;
      $('organizerAddPlayerBtn').onclick = organizerAddPlayer;
      renderOrganizerPlayerList();
    }
    if (tab === 'access') {
      p.innerHTML = `<section class="admin-work-card"><div class="admin-work-head"><div><div class="card-kicker">ACCESS CONTROL</div><h3>Captain / Admin Access</h3><p>Organizer controls who can use Match Center, Live Scoring, Live Studio and league notifications.</p></div></div><div class="captain-admin-grid">${state.teams.map(t => organizerAdminCard(t, true)).join('')}</div></section>`;
    }
    if (tab === 'rosters') {
      p.innerHTML = `<section class="excel-import-card"><div class="excel-import-icon">XL</div><div class="excel-import-copy"><div class="card-kicker">ORGANIZER ONLY</div><h3>Team Roster Excel Upload</h3><p>Upload an Excel workbook to replace the selected team's registered roster.</p><div class="excel-columns">Columns: <b>Player Name</b>, <b>Role</b>, <b>Email</b>, <b>Contact</b></div></div><div class="excel-import-controls"><select id="rosterImportTeam">${state.teams.map(t=>`<option>${escapeHtml(t.name)}</option>`).join('')}</select><label class="file-drop-btn">Choose Excel<input type="file" id="rosterExcelFile" accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"></label><a class="ghost-btn small template-link" href="templates/ICAT-Roster-Upload-Template.xlsx" download>Download Template</a></div><div class="excel-preview" id="rosterImportPreview"><span>No file selected</span></div></section>`;
      $('rosterExcelFile').onchange = handleRosterExcel;
    }
    if (tab === 'schedule') {
      p.innerHTML = `<section class="excel-import-card"><div class="excel-import-icon">▣</div><div class="excel-import-copy"><div class="card-kicker">LEAGUE SCHEDULE</div><h3>Schedule Excel Upload</h3><p>Import or update league fixtures. Existing matches not included in the workbook are preserved.</p><div class="excel-columns">Columns: <b>Home Team</b>, <b>Away Team</b>, <b>Date</b>, <b>Time</b>, <b>Venue</b></div></div><div class="excel-import-controls"><label class="file-drop-btn">Choose Excel<input type="file" id="scheduleExcelFile" accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"></label><a class="ghost-btn small template-link" href="templates/ICAT-League-Schedule-Template.xlsx" download>Download Template</a></div><div class="excel-preview" id="scheduleImportPreview"><span>No file selected</span></div></section>`;
      $('scheduleExcelFile').onchange = handleScheduleExcel;
    }
    if (tab === 'announcements') {
      const history = (state.announcements || []).slice().sort((a,b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
      p.innerHTML = `<section class="admin-work-card"><div class="admin-work-head"><div><div class="card-kicker">LEAGUE COMMUNICATION</div><h3>Announcements</h3></div></div><div class="form-grid two"><label>To<select id="organizerAnnouncementAudience"><option value="all">Everyone</option><option value="admins">Admins</option></select></label><label>Subject<input id="organizerAnnouncementSubject" placeholder="Announcement subject"></label><label class="span2">Announcement<textarea id="organizerAnnouncementBody" rows="6" placeholder="Write the announcement"></textarea></label></div><button class="primary-btn full" id="sendOrganizerAnnouncementBtn">Send Announcement</button></section><section class="admin-work-card"><div class="admin-work-head"><div><div class="card-kicker">SENT ANNOUNCEMENTS</div><h3>History</h3></div></div><div class="organizer-inbox-list">${history.length ? history.map(a => `<article class="announcement"><strong>${escapeHtml(a.title || 'Announcement')}</strong><small>${escapeHtml((a.audience || 'all') === 'admins' ? 'ADMINS' : 'EVERYONE')} · ${escapeHtml(a.date || '')}${a.text ? ` · ${escapeHtml(a.text)}` : ''}</small></article>`).join('') : '<div class="empty-state"><strong>No announcements yet</strong></div>'}</div></section>`;
      $('sendOrganizerAnnouncementBtn').onclick = sendOrganizerAnnouncement;
    }

    if (tab === 'inbox') {
      const requests = (state.playerRequests || []).slice().reverse();
      const messages = (state.adminMessages || []).slice().sort((a,b)=>String(b.createdAt||'').localeCompare(String(a.createdAt||'')));
      const mvpSubmissions = (state.mediaDrafts || []).filter(x => x && x.kind === 'image' && x.image).slice().sort((a,b)=>String(b.createdAt||'').localeCompare(String(a.createdAt||'')));
      const pendingCount = requests.filter(r => !r.status || r.status === 'pending').length + messages.filter(m => (m.status || 'open') !== 'resolved').length;
      p.innerHTML = `
        ${mvpSubmissions.length ? `<section class="admin-work-card organizer-mvp-submissions"><div class="admin-work-head"><div><div class="card-kicker">MVP SUBMISSIONS</div><h3>Admin MVP Pictures</h3></div><span class="request-status">${mvpSubmissions.length} RECEIVED</span></div><div class="organizer-mvp-grid">${mvpSubmissions.map(organizerMvpCard).join('')}</div></section>` : ''}
        <section class="admin-work-card"><div class="admin-work-head"><div><div class="card-kicker">ORGANIZER INBOX</div><h3>Requests · Complaints · Feedback</h3></div><span class="request-status">${pendingCount} OPEN</span></div>
          ${requests.length ? `<div class="organizer-inbox-list organizer-player-request-list">${requests.map(playerApprovalCard).join('')}</div>` : ''}
          <div class="organizer-inbox-list">${messages.length ? messages.map(messageCard).join('') : (!requests.length ? '<div class="empty-state"><strong>Inbox clear</strong></div>' : '')}</div>
        </section>`;
    }
    bindDynamic();
  }

  function playerApprovalCard(r) {
    const action = r.action === 'remove' ? 'REMOVE PLAYER' : 'ADD PLAYER';
    const status = r.status || 'pending';
    const roleName = r.role ? ` · ${escapeHtml(r.role)}` : '';
    return `<article class="org-message-card request"><div class="org-message-top"><span>${action}</span><b class="message-status ${escapeHtml(status)}">${escapeHtml(status.toUpperCase())}</b></div><h4>${escapeHtml(r.name || 'Player')}</h4><p>${escapeHtml(r.email || '')}${r.phone ? ` · ${escapeHtml(r.phone)}` : ''}${roleName}${r.note ? ` · ${escapeHtml(r.note)}` : ''}</p><small>${escapeHtml(r.team || '')} · Requested by ${escapeHtml(r.requestedBy || 'Captain/Admin')} · ${r.createdAt ? escapeHtml(new Date(r.createdAt).toLocaleString()) : ''}</small>${isOrganizer() && status === 'pending' ? `<div class="request-approval-actions"><button class="ghost-btn small reject-player-request" data-request-id="${escapeHtml(r.id)}">Reject</button><button class="primary-btn small approve-player-request" data-request-id="${escapeHtml(r.id)}">Approve</button></div>` : ''}</article>`;
  }

  function organizerMvpCard(x) {
    const id = x.id || x.createdAt || '';
    const posted = !!x.instagramPosted;
    return `<article class="organizer-mvp-card"><img src="${x.image}" alt="MVP submission from ${escapeHtml(x.team || 'ICAT')}"><div><span class="card-kicker">${escapeHtml(x.team || 'ICAT')} · MVP</span><p>${escapeHtml(x.note || '')}</p><small>${x.createdAt ? escapeHtml(new Date(x.createdAt).toLocaleString()) : ''}</small><div class="organizer-mvp-actions"><a class="ghost-btn small" href="${x.image}" download="${escapeHtml(x.fileName || 'ICAT-MVP.jpg')}">Download</a>${posted ? '<span class="access-state on">INSTAGRAM POSTED</span>' : `<button class="primary-btn small mark-mvp-instagram" data-mvp-id="${escapeHtml(id)}">Mark Posted on Instagram</button>`}</div></div></article>`;
  }

  function approvePlayerRequest(id) {
    if (!isOrganizer()) return;
    const r = (state.playerRequests || []).find(x => x.id === id);
    if (!r || (r.status && r.status !== 'pending')) return;
    state.squads[r.team] ||= [];
    if (r.action === 'remove') {
      const idx = state.squads[r.team].findIndex(p => p[0] === r.name);
      if (idx >= 0) state.squads[r.team].splice(idx, 1);
      const meta = state.playerDirectory?.[r.name];
      if (meta?.email) state.adminAccess[meta.email] = false;
      if (state.playerDirectory) delete state.playerDirectory[r.name];
      r.status = 'approved';
      r.resolvedAt = new Date().toISOString();
      notifyRosterUpdated(r.team, state.squads[r.team].length, 'updated after an approved player removal');
      save();
      renderOrganizer('inbox');
      toast('Player removal approved');
      return;
    }
    if (!state.squads[r.team].some(p => p[0].toLowerCase() === String(r.name || '').toLowerCase())) {
      state.squads[r.team].push([r.name, r.role || 'Batter']);
      state.playerDirectory ||= {};
      state.playerDirectory[r.name] = { email: r.email || '', phone: r.phone || '', team: r.team };
    }
    r.status = 'approved';
    r.resolvedAt = new Date().toISOString();
    notifyRosterUpdated(r.team, state.squads[r.team].length, 'updated after an approved player addition');
    save();
    renderOrganizer('inbox');
    toast('Player addition approved');
  }

  function rejectPlayerRequest(id) {
    if (!isOrganizer()) return;
    const r = (state.playerRequests || []).find(x => x.id === id);
    if (!r || (r.status && r.status !== 'pending')) return;
    r.status = 'rejected';
    r.resolvedAt = new Date().toISOString();
    save();
    renderOrganizer('inbox');
    toast('Player request rejected');
  }

  function markMvpPostedOnInstagram(id) {
    if (!isOrganizer()) return;
    const x = (state.mediaDrafts || []).find(item => String(item.id || item.createdAt || '') === String(id));
    if (!x || x.instagramPosted) return;
    x.instagramPosted = true;
    x.instagramPostedAt = new Date().toISOString();
    addAppNotification({
      key: `mvp_instagram_${x.id || x.createdAt}`,
      title: 'MVP Posted on Instagram',
      text: `${x.team || 'ICAT'} MVP has been posted on ICAT Instagram.`,
      audience: 'all',
      kind: 'mvp'
    });
    save();
    renderOrganizer('inbox');
    toast('Instagram notification sent to everyone');
  }

  function organizerAdminCard(t, withAccess = false) {
    const admins = teamAdminUsers(t.name);
    const adminNames = admins.length ? admins.map(a => escapeHtml(a.name)).join(' · ') : 'No admin assigned';
    return `<article class="captain-admin-card"><div class="captain-avatar ${t.color}">${initials(t.captain)}</div><div><div class="card-kicker">${escapeHtml(t.name)}</div><h3>${escapeHtml(t.captain)}</h3><p>${escapeHtml(t.email)}<br>${escapeHtml(t.phone)}</p>${withAccess ? `<small class="team-admin-current">ADMIN${admins.length === 2 ? 'S' : ''}: ${adminNames}</small>` : ''}</div><div class="captain-actions"><button class="ghost-btn small captain-wa" data-phone="${escapeHtml(t.phone)}">WhatsApp</button><button class="ghost-btn small captain-email" data-email="${escapeHtml(t.email)}">Email</button>${withAccess ? `${admins.length ? `<button class="danger-mini organizer-admin-remove" data-team="${escapeHtml(t.name)}">Remove Admin</button><button class="primary-btn small organizer-admin-change" data-team="${escapeHtml(t.name)}">Change Admin</button>` : `<button class="primary-btn small organizer-admin-change sole" data-team="${escapeHtml(t.name)}">Grant Admin</button>`}<span class="access-state ${admins.length ? 'on' : 'off'}">${admins.length ? `${admins.length}/2 ADMIN ON` : 'ADMIN OFF'}</span>` : ''}</div></article>`;
  }

  function organizerAdminPicker(teamName) {
    if (!isOrganizer()) { toast('Organizer access is required'); return; }
    const squad = state.squads[teamName] || [];
    const current = new Set(teamAdminUsers(teamName).map(a => String(a.email || '').toLowerCase()));
    const options = squad.map(p => {
      const meta = state.playerDirectory?.[p[0]] || {};
      const email = String(meta.email || '').trim();
      const checked = email && current.has(email.toLowerCase());
      return `<label class="check-player admin-pick-row"><input type="checkbox" class="organizer-admin-pick" value="${escapeHtml(email)}" ${checked ? 'checked' : ''} ${email ? '' : 'disabled'}><span><strong>${escapeHtml(p[0])}</strong><small>${email ? escapeHtml(email) : 'Email required before Admin access can be granted'}</small></span></label>`;
    }).join('');
    modal(`Admin Access · ${teamName}`, `<div class="section-row"><div><span class="card-kicker">SELECT UP TO 2</span><h3>Team Admins</h3></div><span class="access-state on admin-pick-count">${current.size}/2</span></div><div class="organizer-admin-picker">${options}</div>`, `<button class="ghost-btn" id="adminPickCancel">Cancel</button><button class="primary-btn" id="adminPickSave">Save Admin Access</button>`);
    $('adminPickCancel').onclick = closeModal;
    const picks = () => $$('.organizer-admin-pick:checked');
    $$('.organizer-admin-pick').forEach(input => input.onchange = () => {
      if (picks().length > 2) { input.checked = false; toast('Maximum 2 admins per team'); }
      const count = document.querySelector('.admin-pick-count');
      if (count) count.textContent = `${picks().length}/2`;
    });
    $('adminPickSave').onclick = () => {
      const selected = picks().map(x => String(x.value || '').trim().toLowerCase()).filter(Boolean);
      if (selected.length > 2) { toast('Maximum 2 admins per team'); return; }
      Object.keys(state.adminAccess || {}).forEach(email => {
        const user = resolveRosterUser(email);
        if (user?.team === teamName) state.adminAccess[email] = false;
      });
      selected.forEach(email => { state.adminAccess[email] = true; });
      save(); closeModal(); renderOrganizer('access'); toast(`${selected.length} admin${selected.length === 1 ? '' : 's'} assigned to ${teamName}`);
    };
  }

  function organizerRemoveAdmin(teamName) {
    if (!isOrganizer()) { toast('Organizer access is required'); return; }
    const admins = teamAdminUsers(teamName);
    if (!admins.length) { toast('No admin access is active for this team'); return; }
    modal(`Remove Admin · ${teamName}`, `<div class="organizer-remove-admin-list">${admins.map(a => `<button class="danger-mini organizer-remove-one" data-email="${escapeHtml(a.email)}"><span>${escapeHtml(a.name)}</span><small>${escapeHtml(a.email)}</small><b>REMOVE</b></button>`).join('')}</div>`, `<button class="ghost-btn" id="removeAdminCancel">Cancel</button>${admins.length > 1 ? '<button class="danger-btn" id="removeAllAdmins">Remove Both</button>' : ''}`);
    $('removeAdminCancel').onclick = closeModal;
    $$('.organizer-remove-one').forEach(b => b.onclick = () => { state.adminAccess[b.dataset.email] = false; save(); closeModal(); renderOrganizer('access'); toast('Admin access removed'); });
    if ($('removeAllAdmins')) $('removeAllAdmins').onclick = () => { admins.forEach(a => { state.adminAccess[a.email] = false; }); save(); closeModal(); renderOrganizer('access'); toast('Admin access removed'); };
  }

  function renderOrganizerPlayerList() {
    const team = $('organizerPlayerTeam')?.value;
    const root = $('organizerPlayerList');
    if (!team || !root) return;
    const squad = state.squads[team] || [];
    root.innerHTML = `<div class="squad-editor-list">${squad.map((p,i)=>{const d=state.playerDirectory?.[p[0]]||{};return `<div class="squad-editor-row"><div class="squad-player-index">${String(i+1).padStart(2,'0')}</div><div class="squad-player-copy"><strong>${escapeHtml(p[0])}</strong><small>${escapeHtml(p[1])}${d.email?` · ${escapeHtml(d.email)}`:''}${d.phone?` · ${escapeHtml(d.phone)}`:''}</small></div></div>`}).join('')}</div>`;
  }

  function sendOrganizerAnnouncement() {
    if (!isOrganizer()) { toast('Organizer access is required'); return; }
    const audience = String($('organizerAnnouncementAudience')?.value || 'all');
    const subject = String($('organizerAnnouncementSubject')?.value || '').trim();
    const text = String($('organizerAnnouncementBody')?.value || '').trim();
    if (!subject) { toast('Add an announcement subject'); return; }
    if (!text) { toast('Write the announcement'); return; }
    state.announcements ||= [];
    state.announcements.unshift({
      id: `ann${Date.now()}_${Math.random().toString(36).slice(2,6)}`,
      title: subject,
      text,
      audience: audience === 'admins' ? 'admins' : 'all',
      date: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
      createdAt: new Date().toISOString()
    });
    save();
    refreshNotificationBadge();
    renderOrganizer('announcements');
    toast(audience === 'admins' ? 'Announcement sent to admins' : 'Announcement sent to everyone');
  }

  function organizerAddTeam() {
    if(!isOrganizer()){toast('Organizer access is required');return;}
    modal('Add League Team', `<div class="form-grid two"><label>Team Name<input id="otName" placeholder="Team name"></label><label>Captain Name<input id="otCaptain" placeholder="Captain full name"></label><label>Email<input id="otEmail" type="email" placeholder="captain@email.com"></label><label>WhatsApp / Contact<input id="otPhone" placeholder="+1..."></label></div>`, `<button class="ghost-btn" id="otCancel">Cancel</button><button class="primary-btn" id="otSave">Add Team</button>`);
    $('otCancel').onclick = closeModal;
    $('otSave').onclick = () => {
      const name=$('otName').value.trim(), captain=$('otCaptain').value.trim(), email=$('otEmail').value.trim(), phone=$('otPhone').value.trim();
      if(!name||!captain||!email||!phone){toast('Team, captain, email and contact are required');return;}
      if(state.teams.some(t=>t.name.toLowerCase()===name.toLowerCase())){toast('Team already exists');return;}
      const colors=['teal','blue','violet','amber'];
      state.teams.push({id:`t${Date.now()}`,name,captain,email,phone,color:colors[state.teams.length%colors.length]});
      state.squads[name]=[]; state.adminAccess[email]=false; save(); closeModal(); renderOrganizer('teams'); toast('Team added');
    };
  }

  function organizerAddPlayer() {
    if(!isOrganizer()){toast('Organizer access is required');return;}
    const defaultTeam = $('organizerPlayerTeam')?.value || state.teams[0]?.name || '';
    modal('Add Player', `<div class="form-grid two"><label>Team<select id="opTeam">${state.teams.map(t=>`<option ${t.name===defaultTeam?'selected':''}>${escapeHtml(t.name)}</option>`).join('')}</select></label><label>Full Name<input id="opName" placeholder="Player full name"></label><label>Role<select id="opRole">${['Batter','Bowler','All-rounder','Wicketkeeper','Captain · Batter'].map(r=>`<option>${r}</option>`).join('')}</select></label><label>Email<input id="opEmail" type="email" placeholder="player@email.com"></label><label>Contact<input id="opPhone" placeholder="+1..."></label></div>`, `<button class="ghost-btn" id="opCancel">Cancel</button><button class="primary-btn" id="opSave">Add Player</button>`);
    $('opCancel').onclick = closeModal;
    $('opSave').onclick = () => {
      const team=$('opTeam').value,name=$('opName').value.trim(),roleName=$('opRole').value,email=$('opEmail').value.trim(),phone=$('opPhone').value.trim();
      if(!name){toast('Player full name is required');return;}
      state.squads[team] ||= [];
      if(state.squads[team].some(p=>p[0].toLowerCase()===name.toLowerCase())){toast('Player already exists in this squad');return;}
      state.squads[team].push([name,roleName]); state.playerDirectory[name]={email,phone,team}; notifyRosterUpdated(team, state.squads[team].length, 'updated'); save(); refreshNotificationBadge(); closeModal(); renderOrganizer('players'); toast('Player added · everyone notified');
    };
  }

  function sendAdminMessage() {
    if (!isAdmin()) return;
    const type=$('adminMsgType').value, channel=$('adminMsgChannel').value, subject=$('adminMsgSubject').value.trim(), message=$('adminMsgBody').value.trim();
    if(!subject||!message){toast('Subject and message are required');return;}
    const item={id:`msg${Date.now()}`,type,from:state.user.fullName,team:state.user.team,subject,message,status:'open',createdAt:new Date().toISOString()};
    state.adminMessages ||= []; state.adminMessages.push(item); save();
    if(channel==='email') setTimeout(()=>openExternal(`mailto:${encodeURIComponent(state.organizer?.email||ORGANIZER_EMAIL)}?subject=${encodeURIComponent(`[ICAT ${type.toUpperCase()}] ${subject}`)}&body=${encodeURIComponent(message)}`),100);
    if(channel==='whatsapp') setTimeout(()=>openExternal(`https://wa.me/${String(state.organizer?.phone||ORGANIZER_PHONE).replace(/\D/g,'')}?text=${encodeURIComponent(`[ICAT ${type.toUpperCase()}] ${subject}\n\n${message}`)}`),100);
    $('adminMsgSubject').value=''; $('adminMsgBody').value=''; renderAdmin('contact'); toast('Sent to organizer inbox');
  }

  function normalizeHeader(s){ return String(s||'').trim().toLowerCase().replace(/[^a-z0-9]+/g,''); }
  function getRowValue(row, aliases){ const map={}; Object.keys(row||{}).forEach(k=>map[normalizeHeader(k)]=row[k]); for(const a of aliases){const key=normalizeHeader(a);if(map[key]!==undefined&&map[key]!==null&&String(map[key]).trim()!=='')return map[key];} return ''; }
  function excelDate(value){
    if(value instanceof Date && !isNaN(value)) return value.toISOString().slice(0,10);
    if(typeof value==='number' && isFinite(value)){
      const d=new Date(Date.UTC(1899,11,30)+Math.round(value*86400000));
      return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')}`;
    }
    const s=String(value||'').trim(); if(!s)return '';
    const d=new Date(s); if(!isNaN(d)) return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    return s;
  }
  function excelTime(value){
    if(typeof value==='number' && isFinite(value)){
      const total=Math.round((value%1)*24*60); return `${String(Math.floor(total/60)%24).padStart(2,'0')}:${String(total%60).padStart(2,'0')}`;
    }
    const s=String(value||'').trim(); if(!s)return '';
    const m=s.match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);
    if(m){let h=Number(m[1]),min=m[2],ap=(m[3]||'').toUpperCase();if(ap==='PM'&&h<12)h+=12;if(ap==='AM'&&h===12)h=0;return `${String(h).padStart(2,'0')}:${min}`;}
    return s;
  }
  function parseCsvText(text){
    const rows=[]; let row=[],cell='',quoted=false;
    for(let i=0;i<text.length;i++){
      const ch=text[i],next=text[i+1];
      if(ch==='"'&&quoted&&next==='"'){cell+='"';i++;continue;}
      if(ch==='"'){quoted=!quoted;continue;}
      if(ch===','&&!quoted){row.push(cell);cell='';continue;}
      if((ch==='\n'||ch==='\r')&&!quoted){if(ch==='\r'&&next==='\n')i++;row.push(cell);cell='';if(row.some(x=>String(x).trim()!==''))rows.push(row);row=[];continue;}
      cell+=ch;
    }
    row.push(cell); if(row.some(x=>String(x).trim()!==''))rows.push(row);
    if(!rows.length)return [];
    const headers=rows[0].map(x=>String(x).trim());
    return rows.slice(1).map(r=>Object.fromEntries(headers.map((h,i)=>[h,r[i]??''])));
  }
  async function parseSimpleXlsx(file){
    if(!window.JSZip) throw new Error('Excel engine unavailable');
    const zip=await JSZip.loadAsync(await file.arrayBuffer());
    const shared=[];
    const sharedFile=zip.file('xl/sharedStrings.xml');
    if(sharedFile){
      const xml=new DOMParser().parseFromString(await sharedFile.async('text'),'application/xml');
      [...xml.getElementsByTagNameNS('*','si')].forEach(si=>shared.push([...si.getElementsByTagNameNS('*','t')].map(t=>t.textContent||'').join('')));
    }
    const sheetFile=zip.file('xl/worksheets/sheet1.xml');
    if(!sheetFile) throw new Error('First worksheet not found');
    const xml=new DOMParser().parseFromString(await sheetFile.async('text'),'application/xml');
    const matrix=[];
    [...xml.getElementsByTagNameNS('*','row')].forEach(rowEl=>{
      const row=[];
      [...rowEl.getElementsByTagNameNS('*','c')].forEach(c=>{
        const ref=c.getAttribute('r')||'';
        const letters=(ref.match(/[A-Z]+/)||['A'])[0];
        let col=0; for(const ch of letters) col=col*26+(ch.charCodeAt(0)-64); col-=1;
        const type=c.getAttribute('t')||'';
        let value='';
        if(type==='inlineStr') value=[...c.getElementsByTagNameNS('*','t')].map(t=>t.textContent||'').join('');
        else {
          const v=c.getElementsByTagNameNS('*','v')[0]?.textContent??'';
          if(type==='s') value=shared[Number(v)]??'';
          else if(type==='b') value=v==='1';
          else if(v!==''&&!isNaN(Number(v))) value=Number(v);
          else value=v;
        }
        row[col]=value;
      });
      matrix.push(row);
    });
    if(!matrix.length)return [];
    const headers=(matrix[0]||[]).map(x=>String(x??'').trim());
    return matrix.slice(1).map(r=>Object.fromEntries(headers.map((h,i)=>[h,r?.[i]??''])));
  }
  function readExcelRows(file, done){
    const name=String(file.name||'').toLowerCase();
    if(name.endsWith('.csv')){
      const reader=new FileReader(); reader.onload=e=>{try{done(parseCsvText(String(e.target.result||'')));}catch(err){console.error(err);toast('Unable to read this CSV file');}}; reader.readAsText(file); return;
    }
    parseSimpleXlsx(file).then(done).catch(err=>{console.error(err);toast('Unable to read this Excel file. Use the ICAT .xlsx template.');});
  }
  function handleRosterExcel(e){
    if(!isOrganizer()){toast('Organizer access is required');return;}
    const file=e.target.files?.[0];
    if(!file)return;
    const team=$('rosterImportTeam').value;
    const preview=$('rosterImportPreview');
    preview.innerHTML='<span>Reading workbook…</span>';
    readExcelRows(file,rows=>{
      const parsed=rows.map(r=>({
        name:String(getRowValue(r,['Player Name','Full Name','Name','Player'])).trim(),
        role:String(getRowValue(r,['Role','Player Role'])).trim()||'Batter',
        email:String(getRowValue(r,['Email','Email Address'])).trim(),
        phone:String(getRowValue(r,['Contact','Phone','Mobile','Contact Number'])).trim()
      })).filter(r=>r.name);
      if(!parsed.length){preview.innerHTML='<span>No valid players found. Check the template headers.</span>';return;}
      preview.innerHTML=`<div class="excel-preview-head"><strong>${parsed.length} players ready for ${escapeHtml(team)}</strong><button class="primary-btn small" id="confirmRosterImport">Replace Roster</button></div><div class="excel-preview-rows">${parsed.slice(0,8).map(r=>`<div><b>${escapeHtml(r.name)}</b><span>${escapeHtml(r.role)}${r.email?` · ${escapeHtml(r.email)}`:''}</span></div>`).join('')}${parsed.length>8?`<small>+ ${parsed.length-8} more</small>`:''}</div>`;
      $('confirmRosterImport').onclick=()=>{
        const previous = state.squads[team] || [];
        const nextNames = new Set(parsed.map(r=>r.name));
        previous.forEach(p=>{ if(!nextNames.has(p[0])) { const meta=state.playerDirectory?.[p[0]]; if(meta?.email) state.adminAccess[meta.email]=false; if(state.playerDirectory) delete state.playerDirectory[p[0]]; } });
        state.squads[team]=parsed.map(r=>[r.name,r.role]);
        parsed.forEach(r=>state.playerDirectory[r.name]={email:r.email,phone:r.phone,team});
        notifyRosterUpdated(team, parsed.length, 'updated');
        save();
        refreshNotificationBadge();
        toast(`${parsed.length} roster players imported · everyone notified`);
        renderOrganizer('rosters');
      };
    });
  }
  function handleScheduleExcel(e){
    if(!isOrganizer()){toast('Organizer access is required');return;}
    const file=e.target.files?.[0]; if(!file)return; const preview=$('scheduleImportPreview'); preview.innerHTML='<span>Reading workbook…</span>';
    readExcelRows(file,rows=>{const parsed=rows.map(r=>({date:excelDate(getRowValue(r,['Date','Match Date'])),time:excelTime(getRowValue(r,['Time','Match Time'])),venue:String(getRowValue(r,['Venue','Ground'])).trim(),teamA:String(getRowValue(r,['Home Team','Team A','Team1'])).trim(),teamB:String(getRowValue(r,['Away Team','Team B','Team2'])).trim()})).filter(r=>r.date&&r.teamA&&r.teamB&&r.venue);if(!parsed.length){preview.innerHTML='<span>No valid matches found. Check the template headers.</span>';return;}preview.innerHTML=`<div class="excel-preview-head"><strong>${parsed.length} fixtures ready</strong><button class="primary-btn small" id="confirmScheduleImport">Import / Update</button></div><div class="excel-preview-rows">${parsed.slice(0,6).map(r=>`<div><b>${escapeHtml(r.teamA)} vs ${escapeHtml(r.teamB)}</b><span>${escapeHtml(r.date)} · ${escapeHtml(r.time)} · ${escapeHtml(r.venue)}</span></div>`).join('')}</div>`;$('confirmScheduleImport').onclick=()=>{let nextWeek=Math.max(0,...state.matches.map(x=>Number(x.week)||0))+1;parsed.forEach((m,i)=>{const idx=state.matches.findIndex(x=>x.status==='scheduled'&&x.teamA===m.teamA&&x.teamB===m.teamB);if(idx>=0){state.matches[idx]={...state.matches[idx],date:m.date,time:m.time,venue:m.venue};}else{state.matches.push({id:`xlsx${Date.now()}_${i}`,week:nextWeek++,date:m.date,time:m.time,venue:m.venue,leagueId:'fwwl',teamA:m.teamA,teamB:m.teamB,overs:20,status:'scheduled',tossWinner:'',decision:'bat',rosterA:[],rosterB:[]});}});addAppNotification({key:`schedule_update_${Date.now()}_${Math.random().toString(36).slice(2,5)}`,title:'League Schedule Updated',text:`${parsed.length} fixture${parsed.length === 1 ? '' : 's'} ${parsed.length === 1 ? 'was' : 'were'} added or updated by the organizer.`,audience:'all',kind:'schedule'});save();refreshNotificationBadge();toast(`${parsed.length} schedule rows imported · everyone notified`);renderOrganizer('schedule');};});
  }

  function renderAdminSquadEditor() {
    const select = $('squadTeamSelect');
    if (!select || !$('adminSquadEditor')) return;
    const team = select.value;
    const squad = state.squads[team] || [];
    $('adminSquadEditor').innerHTML = `<div class="squad-editor-list">${squad.map((p, i) => `<div class="squad-editor-row"><div class="squad-player-index">${String(i + 1).padStart(2, '0')}</div><div class="squad-player-copy"><strong>${escapeHtml(p[0])}</strong><small>${escapeHtml(p[1])}</small></div><button class="text-btn edit-player-role" data-team="${escapeHtml(team)}" data-index="${i}">Edit Role</button><button class="danger-mini request-remove-player" data-team="${escapeHtml(team)}" data-index="${i}">Request Removal</button></div>`).join('')}</div>`;
    bindDynamic();
  }

  function renderPlayerRequests() {
    if (!$('playerRequestList')) return;
    const requests = state.playerRequests.slice().reverse();
    $('playerRequestList').innerHTML = requests.length ? requests.map(r => `<div class="request-row"><div><strong>${r.action === 'remove' ? 'Remove · ' : 'Add · '}${escapeHtml(r.name)}</strong><small>${escapeHtml(r.team)}${r.email ? ` · ${escapeHtml(r.email)}` : ''}${r.phone ? ` · ${escapeHtml(r.phone)}` : ''}</small></div><span class="request-status">${escapeHtml((r.status || 'pending').toUpperCase())}</span></div>`).join('') : `<div class="empty-state small-empty"><strong>No player requests</strong><span>Additions and removals require organizer approval.</span></div>`;
  }

  function getNextMatchForTeam(team) {
    return state.matches.filter(m => m.status === 'scheduled' && (m.teamA === team || m.teamB === team)).slice().sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))[0] || null;
  }

  function getAvailabilitySummary(matchId, team = state.user.team) {
    const squad = state.squads[team] || [];
    const map = state.teamAvailability[matchId] || {};
    return squad.reduce((a, p) => { const st = map[p[0]] || 'unknown'; a[st] = (a[st] || 0) + 1; return a; }, { yes: 0, no: 0, unknown: 0 });
  }

  function statusLabel(st) { return st === 'yes' ? 'Available' : st === 'no' ? 'Unavailable' : 'Pending'; }

  function renderTeam() {
    const teamName = state.user.team;
    const squad = state.squads[teamName] || [];
    const currentTeam = state.teams.find(t => t.name === teamName) || state.teams[0];
    const requestedScope = new URLSearchParams(location.search).get('scope');
    const teamScope = requestedScope === 'my' && !isOrganizer() ? 'my' : 'league';
    const showcaseTeams = teamScope === 'my' ? state.teams.filter(t => t.name === teamName) : state.teams;
    const subtitle = document.querySelector('.teams-title-v3 .page-sub');
    if (subtitle) subtitle.textContent = teamScope === 'my' ? 'YOUR TEAM · REGISTERED SQUAD' : `${state.teams.length} TEAMS · PARTICIPATING TEAMS AND SQUADS`;
    if ($('teamsShowcase')) $('teamsShowcase').innerHTML = showcaseTeams.map(t => `<button class="team-showcase-card ${t.color}" data-team-showcase="${escapeHtml(t.name)}"><span class="team-art-v3">${initials(t.name)}</span><strong>${escapeHtml(t.name).toUpperCase()}</strong><small>${(state.squads[t.name]||[]).length} PLAYERS · VIEW SQUAD</small><i>›</i></button>`).join('');
    const myTeamPanel = document.querySelector('.my-team-panel-v3');
    if (myTeamPanel) myTeamPanel.classList.toggle('hidden', teamScope !== 'my');
    const myTeamTitle = document.querySelector('.my-team-panel-v3 .section-row h3');
    if (myTeamTitle) myTeamTitle.textContent = teamName;
    if ($('rosterGrid')) $('rosterGrid').innerHTML = squad.map((p, i) => `<article class="roster-card"><div class="avatar-sm">${initials(p[0])}</div><div><strong>${escapeHtml(p[0])}</strong><small>${escapeHtml(p[1])}</small></div><span>#${String(i + 1).padStart(2, '0')}</span></article>`).join('');
    const matches = state.matches.filter(m => m.status === 'scheduled' && (m.teamA === teamName || m.teamB === teamName));
    const availabilityList = $('availabilityList');
    const availabilityHeader = availabilityList?.previousElementSibling;
    if (availabilityList) {
      availabilityList.classList.add('hidden');
      if (availabilityHeader) availabilityHeader.classList.add('hidden');
      if (false) availabilityList.innerHTML = matches.map(m => {
        const value = state.availability[m.id] || 'unknown';
        return `<article class="availability-card"><div><div class="card-kicker">WEEK ${m.week}</div><strong>${escapeHtml(m.teamA)} vs ${escapeHtml(m.teamB)}</strong><small>${dateLabel(m.date)} · ${escapeHtml(m.time)} · ${escapeHtml(m.venue)}</small></div><div class="availability-actions"><button class="yes availability-choice ${value === 'yes' ? 'active' : ''}" data-match-id="${m.id}" data-value="yes">Available</button><button class="no availability-choice ${value === 'no' ? 'active' : ''}" data-match-id="${m.id}" data-value="no">Unavailable</button></div></article>`;
      }).join('');
    }
    if ($('teamWhatsApp')) $('teamWhatsApp').onclick = () => openExternal(`https://wa.me/${String(currentTeam?.phone || '').replace(/\D/g, '')}`);
    if ($('teamEmail')) $('teamEmail').onclick = () => openExternal(`mailto:${encodeURIComponent(currentTeam?.email || '')}`);
    bindDynamic();
  }

  function renderMemberAvailability() {
    const root = $('memberAvailabilityPanel');
    if (!root || !isMember()) return;
    // Members can post or change their own availability for every match
    // involving their team, at any time.
    const matches = state.matches.filter(m => m.teamA === state.user.team || m.teamB === state.user.team).slice().sort((a,b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
    const mine = memberAvailabilityMap();
    root.innerHTML = `<div class="member-availability-list">${matches.length ? matches.map(m => {
      const value = mine[m.id] || state.teamAvailability?.[m.id]?.[state.user.fullName] || 'unknown';
      return `<article class="member-availability-card"><div><div class="card-kicker">WEEK ${m.week} · ${escapeHtml(String(m.status || '').toUpperCase())}</div><strong>${escapeHtml(m.teamA)} vs ${escapeHtml(m.teamB)}</strong><small>${dateLabel(m.date)} · ${escapeHtml(m.time)} · ${escapeHtml(m.venue)}</small></div><div class="availability-actions"><button class="yes member-availability-choice ${value === 'yes' ? 'active' : ''}" data-match-id="${escapeHtml(m.id)}" data-value="yes">Available</button><button class="no member-availability-choice ${value === 'no' ? 'active' : ''}" data-match-id="${escapeHtml(m.id)}" data-value="no">Unavailable</button></div></article>`;
    }).join('') : `<div class="empty-state"><strong>No team matches found</strong></div>`}</div>`;
    bindDynamic();
  }

  function renderMemberSchedule() {
    const root = $('memberSchedulePanel');
    if (!root || !isMember()) return;
    const rows = state.matches.filter(m => m.teamA === state.user.team || m.teamB === state.user.team).slice().sort((a,b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
    root.innerHTML = `<div class="member-schedule-list">${rows.length ? rows.map(m => {
      const opponent = m.teamA === state.user.team ? m.teamB : m.teamA;
      const detail = m.status === 'result' ? `${escapeHtml(m.scoreA || '')} · ${escapeHtml(m.scoreB || '')}` : m.status === 'live' ? `${escapeHtml(m.scoreA || '')} · ${escapeHtml(m.oversA || '0.0')} overs` : `${m.overs} overs`;
      return `<article class="admin-match-card ${escapeHtml(m.status || 'scheduled')}"><div class="admin-match-status"><span>${m.status === 'live' ? 'LIVE NOW' : `WEEK ${m.week}`}</span><small>${dateLabel(m.date)} · ${escapeHtml(m.time)}</small></div><div class="admin-match-teams"><strong>${escapeHtml(state.user.team)}</strong><b>VS</b><strong>${escapeHtml(opponent)}</strong><small>${escapeHtml(m.venue)} · ${detail}</small>${m.result ? `<small>${escapeHtml(m.result)}</small>` : ''}</div></article>`;
    }).join('') : `<div class="empty-state"><strong>No team matches found</strong></div>`}</div>`;
  }

  function renderMore() {
    // More is a universal navigation page for Member, Admin and Organizer.
  }

  function renderPublicAnnouncements() {
    const root = $('publicAnnouncementsList');
    if (!root) return;
    const items = Array.isArray(state.announcements) ? state.announcements.filter(announcementVisibleToCurrentUser) : [];
    root.innerHTML = items.length ? items.map(a => `<article class="announcement"><strong>${escapeHtml(a.title)}</strong><small>${escapeHtml(a.date)} · ${escapeHtml(a.text)}</small></article>`).join('') : `<div class="empty-state"><strong>No announcements yet</strong></div>`;
  }

  function renderPublicGallery() {
    const root = $('publicGalleryList');
    if (!root) return;
    const published = Array.isArray(state.mvpPosts) ? state.mvpPosts.filter(x => x && x.published !== false) : [];
    if (!published.length) {
      root.innerHTML = `<div class="empty-state"><strong>No gallery items yet</strong><small>Published ICAT media will appear here.</small></div>`;
      return;
    }
    root.innerHTML = `<div class="media-grid">${published.map(p => `<article class="media-card">${p.image ? `<img src="${p.image}" alt="ICAT gallery media">` : ''}<div><strong>${escapeHtml(p.title || 'ICAT Media')}</strong>${p.note ? `<small>${escapeHtml(p.note)}</small>` : ''}</div></article>`).join('')}</div>`;
  }

  function renderNotifications() {
    const root = $('notificationsFeed');
    if (!root) return;
    const items = currentNotifications();
    const roleLabel = isOrganizer() ? 'Organizer' : isAdmin() ? 'Admin' : 'Member';
    root.innerHTML = `<div class="card-kicker">${roleLabel.toUpperCase()} NOTIFICATIONS</div>${items.length ? items.map(a => { const date = a.createdAt ? new Date(a.createdAt).toLocaleString() : (a.date || ''); return `<article class="announcement"><strong>${escapeHtml(a.title)}</strong><small>${escapeHtml(date)}${date && a.text ? ' · ' : ''}${escapeHtml(a.text || '')}</small></article>`; }).join('') : `<div class="empty-state"><strong>No notifications</strong></div>`}`;
    refreshNotificationBadge();
  }

  function renderMedia() {
    const p = $('mediaPanel');
    if (!p) return;
    $$('.media-tabs').forEach(el => el.classList.add('hidden'));
    if ($('uploadMvpBtn')) $('uploadMvpBtn').classList.add('hidden');
    if (!Array.isArray(state.mediaDrafts)) state.mediaDrafts = [];

    if (!isAdmin()) {
      p.innerHTML = `<div class="mvp-media-empty"><strong>Captain / Admin access required.</strong><small>Media upload is kept private and is not published.</small></div>`;
      return;
    }

    const drafts = state.mediaDrafts.filter(x => !x.team || x.team === state.user.team).slice().reverse();
    p.innerHTML = `<section class="mvp-media-upload glass">
      <div class="section-row"><div><span class="card-kicker">ADMIN ACCESS · PRIVATE MEDIA</span><h3>Upload Media</h3><p class="muted">Upload media with notes for your team. Saved media is not published.</p></div><span class="status-badge">NOT PUBLISHED</span></div>
      <div class="mvp-media-form">
        <label class="mvp-media-picker">Media File<input id="privateMediaFile" type="file" accept="image/*,video/*"></label>
        <div class="mvp-preview mvp-media-preview" id="privateMediaPreview"><span class="muted">Select an image or video</span></div>
        <label>Notes<textarea id="privateMediaNotes" rows="4" maxlength="500" placeholder="Add notes..."></textarea></label>
        <button class="primary-btn full" id="privateMediaSave">Save Media</button>
      </div>
    </section>
    <section class="mvp-media-feed"><div class="section-row"><div><span class="card-kicker">PRIVATE · ${escapeHtml(state.user.team)}</span><h3>Saved Media</h3></div><span class="muted">Not published</span></div>${drafts.length ? drafts.map(x => `<article class="mvp-media-post">${x.image ? `<img src="${x.image}" alt="ICAT media">` : `<div class="mvp-media-placeholder">${escapeHtml((x.kind || 'MEDIA').toUpperCase())}</div>`}<div class="mvp-media-copy"><span class="card-kicker">${escapeHtml(x.fileName || 'MEDIA')}</span><p>${escapeHtml(x.note || '')}</p><small>${x.createdAt ? new Date(x.createdAt).toLocaleString() : ''}</small></div></article>`).join('') : `<div class="mvp-media-empty"><strong>No saved media yet.</strong><small>Uploads remain private to admin access.</small></div>`}</section>`;

    let imageData = '';
    let fileMeta = null;
    const input = $('privateMediaFile');
    const preview = $('privateMediaPreview');
    if (input) input.onchange = e => {
      const file = e.target.files?.[0];
      if (!file) return;
      fileMeta = { name: file.name, type: file.type || '', size: file.size || 0, kind: file.type?.startsWith('video/') ? 'video' : 'image' };
      if (file.type?.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          const img = new Image();
          img.onload = () => {
            const max = 1280;
            const scale = Math.min(1, max / Math.max(img.width, img.height));
            const canvas = document.createElement('canvas');
            canvas.width = Math.max(1, Math.round(img.width * scale));
            canvas.height = Math.max(1, Math.round(img.height * scale));
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            imageData = canvas.toDataURL('image/jpeg', .8);
            if (preview) preview.innerHTML = `<img src="${imageData}" alt="Media preview">`;
          };
          img.src = reader.result;
        };
        reader.readAsDataURL(file);
      } else {
        imageData = '';
        if (preview) preview.innerHTML = `<div class="mvp-media-placeholder">VIDEO</div><span class="muted">${escapeHtml(file.name)} · selected privately</span>`;
      }
    };
    if ($('privateMediaSave')) $('privateMediaSave').onclick = () => {
      const note = String($('privateMediaNotes')?.value || '').trim();
      if (!fileMeta) { toast('Select a media file'); return; }
      if (!note) { toast('Add media notes'); return; }
      if (fileMeta.kind === 'image' && !imageData) { toast('Wait for the image preview to finish loading'); return; }
      const mediaItem = { id:`media${Date.now()}`, team: state.user.team, fileName: fileMeta.name, kind: fileMeta.kind, fileType: fileMeta.type, fileSize: fileMeta.size, image: imageData, note, createdAt: new Date().toISOString(), published: false, organizerReceived: fileMeta.kind === 'image', instagramPosted: false };
      state.mediaDrafts.push(mediaItem);
      if (fileMeta.kind === 'image') {
        addAppNotification({ key:`mvp_received_${mediaItem.id}`, title:`MVP Picture Received · ${state.user.team}`, text:`${state.user.fullName} uploaded an MVP picture for organizer review.`, audience:'organizer', kind:'mvp' });
      }
      try { save(); } catch (e) { state.mediaDrafts.pop(); toast('Media is too large to save on this device'); return; }
      refreshNotificationBadge();
      renderMedia();
      toast(fileMeta.kind === 'image' ? 'MVP picture sent to organizer' : 'Media saved privately');
    };
    bindDynamic();
  }

  function renderCaptains() {
    $('captainDirectory').innerHTML = state.teams.map(t => `<div class="captain-row"><div><strong>${escapeHtml(t.name)} · ${escapeHtml(t.captain)}</strong><small>${escapeHtml(t.email)} · ${escapeHtml(t.phone)}</small></div><div><button class="text-btn captain-wa" data-phone="${t.phone}">WA</button> <button class="text-btn captain-email" data-email="${t.email}">Email</button></div></div>`).join('');
    bindDynamic();
  }

  function modal(title, body, actions = '') {
    $('modalRoot').innerHTML = `<div class="modal-backdrop"><section class="modal"><div class="modal-head"><div><div class="card-kicker">ICAT</div><h3>${escapeHtml(title)}</h3></div><button class="icon-btn" id="modalClose">×</button></div><div class="modal-body">${body}${actions ? `<div class="modal-actions">${actions}</div>` : ''}</div></section></div>`;
    $('modalClose').onclick = closeModal;
    document.querySelector('.modal-backdrop')?.addEventListener('click', e => { if (e.target.classList.contains('modal-backdrop')) closeModal(); });
  }
  function closeModal() { $('modalRoot').innerHTML = ''; }

  function matchDayName(date) {
    try { return new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { weekday: 'long' }); }
    catch { return '—'; }
  }

  function matchVenueNote(m) {
    const venue = state.venues.find(v => v.name === m.venue);
    return m.venueDetails || venue?.note || 'Venue details not provided';
  }

  function scoringSnapshotForMatch(m) {
    if (m?.scoringSnapshot?.innings) return m.scoringSnapshot;
    try {
      const selected = JSON.parse(sessionStorage.getItem(SCORING_SESSION_KEY) || 'null');
      const snapshot = JSON.parse(persistentStore.get('mk97-scoring-desk-v10') || 'null');
      if (!selected || selected.id !== m.id || !snapshot?.innings) return null;
      if (snapshot.teamA !== m.teamA || snapshot.teamB !== m.teamB) return null;
      return snapshot;
    } catch { return null; }
  }

  function inningsScoreLine(inn) {
    if (!inn) return '—';
    const balls = Number(inn.balls || 0);
    return `${Number(inn.runs || 0)}/${Number(inn.wickets || 0)} (${Math.floor(balls / 6)}.${balls % 6})`;
  }

  function matchTimeLabel(value) {
    const raw = String(value || '').trim();
    const match = raw.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return raw || '—';
    const hour = Number(match[1]);
    const minute = Number(match[2]);
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${String(minute).padStart(2, '0')} ${suffix}`;
  }

  function renderMatchInfoTab(m) {
    const xiA = m.rosterA?.length ? m.rosterA : [];
    const xiB = m.rosterB?.length ? m.rosterB : [];
    const umpires = [m.umpire1, m.umpire2].filter(Boolean);
    return `<div class="mc-info-tab">
      <div class="mc-section-title"><div><span>MATCH INFORMATION</span><strong>Match-day details</strong></div><small>${escapeHtml(m.overs || 20)} overs</small></div>
      <div class="mc-info-grid">
        <div><span>Day</span><strong>${escapeHtml(matchDayName(m.date))}</strong></div>
        <div><span>Date</span><strong>${escapeHtml(dateLong(m.date))}</strong></div>
        <div><span>Time</span><strong>${escapeHtml(matchTimeLabel(m.time))}</strong></div>
        <div><span>Venue</span><strong>${escapeHtml(m.venue || '—')}</strong></div>
        <div class="wide"><span>Venue Details</span><strong>${escapeHtml(matchVenueNote(m))}</strong></div>
        <div class="wide"><span>Umpires</span><strong>${escapeHtml(umpires.length ? umpires.join(' · ') : 'Not assigned')}</strong></div>
      </div>
      <div class="mc-section-title mc-squad-heading"><div><span>SQUADS</span><strong>Confirmed Playing XI</strong></div><small>${xiA.length + xiB.length} selected</small></div>
      <div class="mc-squads-grid">
        <section><div class="section-row"><h3>${escapeHtml(m.teamA)} · Playing XI</h3><span class="muted">${xiA.length ? `${xiA.length} players` : 'Not confirmed'}</span></div><div class="mc-xi-list">${xiA.length ? xiA.map((p,i)=>`<div><span>${i+1}</span><strong>${escapeHtml(p)}</strong></div>`).join('') : '<p class="muted">Playing XI will appear after the Admin confirms the squad in Match Center.</p>'}</div></section>
        <section><div class="section-row"><h3>${escapeHtml(m.teamB)} · Playing XI</h3><span class="muted">${xiB.length ? `${xiB.length} players` : 'Not confirmed'}</span></div><div class="mc-xi-list">${xiB.length ? xiB.map((p,i)=>`<div><span>${i+1}</span><strong>${escapeHtml(p)}</strong></div>`).join('') : '<p class="muted">Playing XI will appear after the Admin confirms the squad in Match Center.</p>'}</div></section>
      </div>
    </div>`;
  }

  function commentaryDescription(d) {
    const token = String(d?.token || '').toUpperCase();
    if (token === 'W' || /WKT|WICKET/.test(token)) return 'WICKET';
    if (/WD/.test(token) || d?.type === 'wide') return `${token || 'WD'} · Wide`;
    if (/NB/.test(token) || d?.type === 'no-ball') return `${token || 'NB'} · No Ball`;
    if (/LB/.test(token)) return `${token} · Leg Bye`;
    if (/B/.test(token) && d?.type === 'bye') return `${token} · Bye`;
    const runs = Number(d?.runs || 0);
    if (runs === 4) return 'FOUR';
    if (runs === 6) return 'SIX';
    return `${runs} run${runs === 1 ? '' : 's'}`;
  }

  function renderMatchCommentaryTab(m) {
    const snapshot = scoringSnapshotForMatch(m);
    const liveStatus = m.status === 'live' ? '<span class="mc-live-dot"></span> LIVE' : 'BALL-BY-BALL';
    if (!snapshot?.innings?.length) return `<div class="mc-live-header"><div><small>${liveStatus}</small><strong>Live Commentary</strong></div><span>${escapeHtml(m.teamA)} vs ${escapeHtml(m.teamB)}</span></div><div class="mc-empty"><strong>No commentary yet</strong><span>Ball-by-ball commentary will appear here as Live Scoring records the match.</span></div>`;
    const rows = [];
    snapshot.innings.forEach((inn, inningsIndex) => {
      let legalBalls = 0;
      (inn.deliveries || []).forEach(d => {
        const ball = `${Math.floor(legalBalls / 6)}.${(legalBalls % 6) + 1}`;
        rows.push({ inningsIndex, ball, text: commentaryDescription(d), token: d.token || '', team: inn.battingTeam });
        if (d.legal) legalBalls += 1;
      });
    });
    if (!rows.length) return `<div class="mc-live-header"><div><small>${liveStatus}</small><strong>Live Commentary</strong></div><span>${escapeHtml(m.teamA)} vs ${escapeHtml(m.teamB)}</span></div><div class="mc-empty"><strong>Match ready</strong><span>Commentary will begin with the first scored delivery.</span></div>`;
    return `<div class="mc-live-header"><div><small>${liveStatus}</small><strong>Live Commentary</strong></div><span>${rows.length} updates</span></div><div class="mc-commentary-list">${rows.reverse().map(r => `<article><b>${escapeHtml(r.ball)}</b><div><strong>${escapeHtml(r.text)}</strong><small>${escapeHtml(r.team)} · ${r.inningsIndex === 0 ? '1st Innings' : '2nd Innings'}</small></div><span>${escapeHtml(r.token || '•')}</span></article>`).join('')}</div>`;
  }

  function youtubeVideoId(url) {
    const raw = String(url || '').trim();
    if (!raw) return '';
    if (/^[A-Za-z0-9_-]{6,}$/.test(raw) && !raw.includes('.')) return raw;
    try {
      const parsed = new URL(raw);
      const host = parsed.hostname.replace(/^www\./i, '').toLowerCase();
      if (host === 'youtu.be') return parsed.pathname.split('/').filter(Boolean)[0] || '';
      if (host === 'youtube.com' || host === 'm.youtube.com') {
        if (parsed.pathname === '/watch') return parsed.searchParams.get('v') || '';
        const pathMatch = parsed.pathname.match(/^\/(?:embed|live|shorts)\/([A-Za-z0-9_-]{6,})/i);
        if (pathMatch) return pathMatch[1];
      }
    } catch {}
    const match = raw.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?[^#]*?v=|embed\/|live\/|shorts\/))([A-Za-z0-9_-]{6,})/i);
    return match ? match[1] : '';
  }

  function renderMatchWatchTab(m) {
    const streamUrl = m.youtubeUrl || m.watchUrl || m.streamUrl || '';
    const videoId = youtubeVideoId(streamUrl);
    if (m.status !== 'live') {
      return `<div class="mc-watch-shell"><div class="mc-watch-state"><span class="mc-watch-icon">▶</span><div><small>ICAT LIVE</small><strong>Broadcast not live yet</strong><p>Watch will become available here when this match has an active live stream.</p></div></div></div>`;
    }
    if (!videoId) {
      return `<div class="mc-watch-shell"><div class="mc-watch-state is-live"><span class="mc-watch-icon">▶</span><div><small><span class="mc-live-dot"></span> LIVE MATCH</small><strong>Live video is not connected yet</strong><p>The match Admin needs to attach this match's public YouTube live/watch URL in Match Center. Once connected, everyone can watch here inside ICAT.</p></div></div></div>`;
    }
    return `<div class="mc-watch-shell"><div class="mc-video-frame"><iframe src="https://www.youtube.com/embed/${encodeURIComponent(videoId)}?playsinline=1&rel=0&modestbranding=1" title="${escapeHtml(m.teamA)} vs ${escapeHtml(m.teamB)} live stream" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div><div class="mc-watch-footer"><div><span class="mc-live-dot"></span><strong>WATCHING LIVE IN ICAT</strong><small>${escapeHtml(m.teamA)} vs ${escapeHtml(m.teamB)}</small></div></div></div>`;
  }

  function renderMatchScorecardTab(m) {
    const snapshot = scoringSnapshotForMatch(m);
    if (!snapshot?.innings?.length) {
      return `<div class="mc-score-summary"><div><span>${escapeHtml(m.teamA)}</span><strong>${escapeHtml(m.scoreA || '—')}</strong></div><b>VS</b><div><span>${escapeHtml(m.teamB)}</span><strong>${escapeHtml(m.scoreB || '—')}</strong></div></div><div class="mc-empty"><span>Detailed scorecard will appear after Live Scoring starts.</span></div>`;
    }
    return `<div class="mc-scorecards">${snapshot.innings.map((inn, idx) => `<section class="mc-innings-card">
      <div class="section-row"><h3>${escapeHtml(inn.battingTeam)} · ${idx === 0 ? '1st Innings' : '2nd Innings'}</h3><strong>${escapeHtml(inningsScoreLine(inn))}</strong></div>
      <div class="mc-score-table"><div class="mc-score-head"><span>Batter</span><span>R</span><span>B</span><span>4s</span><span>6s</span><span>SR</span></div>${(inn.batters || []).map(b => `<div><span><strong>${escapeHtml(b.name)}</strong><small>${escapeHtml(b.dismissal || (b.out ? 'Out' : ''))}</small></span><span>${b.runs || 0}</span><span>${b.balls || 0}</span><span>${b.fours || 0}</span><span>${b.sixes || 0}</span><span>${b.balls ? ((b.runs / b.balls) * 100).toFixed(1) : '0.0'}</span></div>`).join('')}</div>
      <div class="mc-bowling-title">Bowling · ${escapeHtml(inn.bowlingTeam)}</div>
      <div class="mc-bowl-table"><div class="mc-bowl-head"><span>Bowler</span><span>O</span><span>R</span><span>W</span><span>WD</span><span>NB</span><span>Econ</span></div>${(inn.bowlers || []).filter(b => b.balls || b.runs || b.wickets || b.wides || b.noBalls).map(b => `<div><span><strong>${escapeHtml(b.name)}</strong></span><span>${Math.floor((b.balls||0)/6)}.${(b.balls||0)%6}</span><span>${b.runs||0}</span><span>${b.wickets||0}</span><span>${b.wides||0}</span><span>${b.noBalls||0}</span><span>${b.balls ? (b.runs/(b.balls/6)).toFixed(2) : '0.00'}</span></div>`).join('') || '<p class="muted">No bowling figures yet.</p>'}</div>
    </section>`).join('')}</div>`;
  }

  function renderMatchCenterTab(m, tab) {
    const panel = $('matchCenterTabPanel');
    if (!panel) return;
    $$('.match-center-tabs button').forEach(b => {
      const active = b.dataset.matchCenterTab === tab;
      b.classList.toggle('active', active);
      b.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    if (tab === 'watch') panel.innerHTML = renderMatchWatchTab(m);
    else if (tab === 'live') panel.innerHTML = renderMatchCommentaryTab(m);
    else if (tab === 'scorecard') panel.innerHTML = renderMatchScorecardTab(m);
    else panel.innerHTML = renderMatchInfoTab(m);
  }

  function openLiveMatchDetails(id, initialTab = '') {
    const m = state.matches.find(x => x.id === id);
    if (!m) return;
    const tab = initialTab || (m.status === 'live' ? 'live' : 'info');
    transitionNavigate(`match-center.html?match=${encodeURIComponent(m.id)}&tab=${encodeURIComponent(tab)}`);
  }

  function matchCenterHeaderMarkup(m) {
    const live = m.status === 'live';
    const result = m.status === 'result';
    const statusLabel = live ? 'LIVE' : result ? 'FINAL' : 'UPCOMING';
    return `<section class="mc-match-header">
      <div class="mc-title-row"><div><span class="mc-match-kicker">${escapeHtml(state.league.season)} · ${escapeHtml(m.overs || 20)} OVERS</span><h2>${escapeHtml(m.teamA)} <em>vs</em> ${escapeHtml(m.teamB)}</h2></div><span class="mc-status-pill ${live ? 'is-live' : result ? 'is-final' : ''}">${statusLabel}</span></div>
      <div class="mc-match-meta"><span><b>Series:</b> ${escapeHtml(state.league.name)}</span><i></i><span><b>Venue:</b> ${escapeHtml(m.venue || '—')}</span><i></i><span><b>Date &amp; Time:</b> ${escapeHtml(dateLong(m.date))}, ${escapeHtml(matchTimeLabel(m.time))}</span></div>
    </section>`;
  }

  function renderMatchCenterPage() {
    const host = $('matchCenterPage');
    if (!host) return;
    const params = new URLSearchParams(location.search);
    const requestedId = params.get('match') || '';
    const m = state.matches.find(x => x.id === requestedId) || state.matches.find(x => x.status === 'live') || state.matches[0];
    if (!m) {
      host.innerHTML = `<div class="mc-page-toolbar"><button class="mc-page-back" id="matchCenterBack">‹ <span>Matches</span></button><div><span>ICAT</span><strong>Match Center</strong></div></div><div class="mc-empty"><strong>No match available</strong><span>Return to Matches and select a fixture.</span></div>`;
      if ($('matchCenterBack')) $('matchCenterBack').onclick = () => transitionNavigate(routeUrl('matches', { tab: 'live' }));
      return;
    }
    const defaultTab = ['info','watch','live','scorecard'].includes(params.get('tab')) ? params.get('tab') : (m.status === 'live' ? 'live' : 'info');
    host.innerHTML = `<div class="match-center-page-shell">
      <div class="mc-page-toolbar"><button class="mc-page-back" id="matchCenterBack" aria-label="Back to matches">‹ <span>Matches</span></button><div><span>ICAT</span><strong>Match Center</strong></div>${canAdminScoreMatch(m) ? `<button class="mc-page-score" id="matchCenterScore">Live Scoring</button>` : '<span class="mc-page-toolbar-spacer"></span>'}</div>
      <div class="match-center-viewer match-center-page-viewer">
        ${matchCenterHeaderMarkup(m)}
        <div class="match-center-tabs" role="tablist" aria-label="Match Center"><button data-match-center-tab="info" role="tab">Info</button><button data-match-center-tab="watch" role="tab">Watch</button><button data-match-center-tab="live" role="tab">Live</button><button data-match-center-tab="scorecard" role="tab">Scorecard</button></div>
        <div id="matchCenterTabPanel" class="match-center-tab-panel"></div>
      </div>
    </div>`;
    $$('.bottom-nav.bottom-nav-v3 [data-route]').forEach(b => b.classList.toggle('active', b.dataset.route === 'matches'));
    const openTab = tab => {
      renderMatchCenterTab(m, tab);
      const url = new URL(location.href);
      url.searchParams.set('match', m.id);
      url.searchParams.set('tab', tab);
      history.replaceState({ matchCenter: true, matchId: m.id, tab }, '', `${url.pathname}${url.search}${url.hash}`);
    };
    $$('.match-center-tabs button').forEach(b => b.onclick = () => openTab(b.dataset.matchCenterTab));
    $('matchCenterBack').onclick = () => {
      if (history.length > 1 && document.referrer) history.back();
      else transitionNavigate(routeUrl('matches', { tab: m.status === 'result' ? 'recent' : m.status === 'scheduled' ? 'upcoming' : 'live' }));
    };
    if ($('matchCenterScore')) $('matchCenterScore').onclick = () => loadMatchIntoScorer(m);
    openTab(defaultTab);
  }

  function openSquad(team) {
    const squad = state.squads[team] || [];
    modal(`${team} Squad`, `<div class="modal-squad-list">${squad.map((p, i) => `<div><span>${String(i + 1).padStart(2, '0')}</span><strong>${escapeHtml(p[0])}</strong><small>${escapeHtml(p[1])}</small></div>`).join('')}</div>`);
  }

  function openStory(index) {
    const story = state.stories[Number(index)];
    if (!story) return;
    const details = [
      ['Game Day', 'Thunderbolts prepare for the next Florida West Coast Winter League fixture.', 'Open Match Center'],
      ['MVP', 'Week 3 MVP: a match-winning all-round performance from the league.', 'View Highlights'],
      ['Top 6s', 'The biggest hits from the latest week of Florida West Coast cricket.', 'View Highlights'],
      ['Fixtures', 'Week 4 fixtures are confirmed across Tampa and the west coast.', 'Open Matches'],
      ['Committee Update', 'Captains should confirm availability and final squads before the deadline.', 'Announcements']
    ][Number(index)] || [story[0], story[1], 'Close'];
    modal(details[0], `<div class="story-modal-visual"><span>${String(Number(index) + 1).padStart(2, '0')}</span></div><p class="story-modal-copy">${escapeHtml(details[1])}</p>`, `<button class="primary-btn" id="storyModalAction">${escapeHtml(details[2])}</button>`);
    $('storyModalAction').onclick = () => {
      closeModal();
      if (index === '0' || Number(index) === 0) route(isAdmin() ? 'admin' : 'matches', isAdmin() ? { tab: 'matches' } : { tab: 'upcoming' });
      else if ([1, 2].includes(Number(index))) route('media');
      else if (Number(index) === 3) route('matches', { tab: 'upcoming' });
      else route('media');
    };
  }

  function openMatchCenter(id) {
    if (!isAdmin()) { toast('Captain / Admin access is required'); return; }
    const m = state.matches.find(x => x.id === id);
    if (!m) return;
    if (!adminOwnsMatch(m)) { toast('Match Center is restricted to your team matches'); return; }
    const squadA = state.squads[m.teamA] || [];
    const squadB = state.squads[m.teamB] || [];
    const selectedA = m.rosterA?.length ? new Set(m.rosterA) : new Set(squadA.slice(0, 11).map(p => p[0]));
    const selectedB = m.rosterB?.length ? new Set(m.rosterB) : new Set(squadB.slice(0, 11).map(p => p[0]));
    modal('Match Center', `
      <div class="match-center-summary"><span class="round-chip">${m.status === 'live' ? 'LIVE MATCH' : `WEEK ${m.week}`}</span><strong>${escapeHtml(m.teamA)} <b>vs</b> ${escapeHtml(m.teamB)}</strong><small>${escapeHtml(state.league.name)}</small></div>
      <div class="form-grid two">
        <label>Match<input id="mcMatch" value="${escapeHtml(m.teamA)} vs ${escapeHtml(m.teamB)}" disabled></label>
        <label>Overs<input id="mcOvers" type="number" value="${m.overs}"></label>
        <label>Venue<input id="mcVenue" value="${escapeHtml(m.venue)}"></label>
        <label>Date<input id="mcDate" type="date" value="${m.date}"></label>
        <label>Time<input id="mcTime" type="time" value="${m.time}"></label>
        <label>Umpire 1<input id="mcUmpire1" value="${escapeHtml(m.umpire1 || '')}" placeholder="Umpire name"></label>
        <label>Umpire 2<input id="mcUmpire2" value="${escapeHtml(m.umpire2 || '')}" placeholder="Umpire name"></label>
        <label>Toss Winner<select id="mcToss"><option value="">Select</option><option ${m.tossWinner === m.teamA ? 'selected' : ''}>${escapeHtml(m.teamA)}</option><option ${m.tossWinner === m.teamB ? 'selected' : ''}>${escapeHtml(m.teamB)}</option></select></label>
        <label>Decision<select id="mcDecision"><option value="bat" ${m.decision === 'bat' ? 'selected' : ''}>Bat</option><option value="bowl" ${m.decision === 'bowl' ? 'selected' : ''}>Bowl</option></select></label>
        <label>Scorer<input id="mcScorer" value="${escapeHtml(m.scorer || state.user.name)}"></label>
        <label class="span2">Venue Details<textarea id="mcVenueDetails" rows="2" placeholder="Ground / pitch / access details">${escapeHtml(m.venueDetails || matchVenueNote(m))}</textarea></label>
        <label class="span2">Live Watch URL<input id="mcWatchUrl" type="url" value="${escapeHtml(m.youtubeUrl || m.watchUrl || '')}" placeholder="Public YouTube live/watch URL for this match"></label>
      </div>
      <div class="section-row"><h3>Playing XI · ${escapeHtml(m.teamA)}</h3><span class="muted xi-count-a">${selectedA.size}/11 selected</span></div>
      <div class="roster-select">${squadA.map(p => `<label class="check-player"><input type="checkbox" class="xi-a" value="${escapeHtml(p[0])}" ${selectedA.has(p[0]) ? 'checked' : ''}> ${escapeHtml(p[0])}</label>`).join('')}</div>
      <div class="section-row"><h3>Playing XI · ${escapeHtml(m.teamB)}</h3><span class="muted xi-count-b">${selectedB.size}/11 selected</span></div>
      <div class="roster-select">${squadB.map(p => `<label class="check-player"><input type="checkbox" class="xi-b" value="${escapeHtml(p[0])}" ${selectedB.has(p[0]) ? 'checked' : ''}> ${escapeHtml(p[0])}</label>`).join('')}</div>`,
      `<button class="ghost-btn" id="mcCancel">Cancel</button><button class="primary-btn" id="mcSaveScore">Save & Open Scorer</button>`);

    $('mcCancel').onclick = closeModal;
    const enforce = (cls, counter) => {
      $$(`.${cls}`).forEach(input => input.onchange = () => {
        const checked = $$(`.${cls}:checked`);
        if (checked.length > 11) { input.checked = false; toast('Maximum 11 players allowed'); }
        const c = document.querySelector(`.${counter}`); if (c) c.textContent = `${$$(`.${cls}:checked`).length}/11 selected`;
      });
    };
    enforce('xi-a', 'xi-count-a'); enforce('xi-b', 'xi-count-b');
    $('mcSaveScore').onclick = () => {
      const rosterA = $$('.xi-a:checked').map(x => x.value);
      const rosterB = $$('.xi-b:checked').map(x => x.value);
      if (rosterA.length < 2 || rosterB.length < 2) { toast('Select at least 2 players for each side'); return; }
      m.venue = $('mcVenue').value.trim() || m.venue;
      m.date = $('mcDate').value || m.date;
      m.time = $('mcTime').value || m.time;
      m.umpire1 = $('mcUmpire1').value.trim();
      m.umpire2 = $('mcUmpire2').value.trim();
      m.venueDetails = $('mcVenueDetails').value.trim();
      m.youtubeUrl = $('mcWatchUrl').value.trim();
      m.overs = Math.max(1, Number($('mcOvers').value) || 20);
      m.tossWinner = $('mcToss').value;
      m.decision = $('mcDecision').value;
      m.scorer = $('mcScorer').value.trim() || state.user.name;
      m.rosterA = rosterA.slice(0, 11);
      m.rosterB = rosterB.slice(0, 11);
      save();
      closeModal();
      if (!canAdminScoreMatch(m)) {
        toast(isMatchDay(m) ? `Match saved. Live Scoring is available only when ${state.user.team} is batting.` : 'Match saved. Live Scoring opens only on match day.');
        renderAdmin('matches');
        return;
      }
      loadMatchIntoScorer(m);
      toast('Match saved and loaded into Scoring Desk');
    };
  }

  function loadMatchIntoScorer(m) {
    if (!isAdmin()) { toast('Captain / Admin access is required'); return; }
    if (!adminOwnsMatch(m)) { toast('Live Scoring is restricted to your team matches'); return; }
    if (!canAdminScoreMatch(m)) { if (!isMatchDay(m)) toast('Live Scoring is available only on this match day'); else toast(`Only the batting team admin can score this match. ${currentBattingTeam(m) || 'Batting team'} has scoring control.`); return; }

    try {
      const existing = JSON.parse(sessionStorage.getItem(SCORING_SESSION_KEY) || 'null');
      if (existing && existing.id === m.id && existing.forceImport === false) {
        sessionStorage.setItem(STREAM_MATCH_KEY, m.id);
        route('score');
        return;
      }
    } catch {}

    const squadA = m.rosterA?.length ? m.rosterA : (state.squads[m.teamA] || []).slice(0, 11).map(p => p[0]);
    const squadB = m.rosterB?.length ? m.rosterB : (state.squads[m.teamB] || []).slice(0, 11).map(p => p[0]);
    let batFirst = 'A';
    if (m.tossWinner) {
      const tossA = m.tossWinner === m.teamA;
      batFirst = m.decision === 'bat' ? (tossA ? 'A' : 'B') : (tossA ? 'B' : 'A');
    }
    const battingTeam = batFirst === 'A' ? m.teamA : m.teamB;
    if (battingTeam !== state.user.team) { toast('Only the batting team admin can open Live Scoring'); return; }

    m.battingTeam = battingTeam;
    m.currentInnings = 0;
    m.innings = '1st Innings';
    if (m.status === 'scheduled') m.status = 'live';
    save();

    const payload = { ...m, playersA: squadA, playersB: squadB, batFirst, battingTeam, scorer: m.scorer || state.user.name, forceImport: true, importedAt: Date.now() };
    sessionStorage.setItem(SCORING_SESSION_KEY, JSON.stringify(payload));
    sessionStorage.setItem(STREAM_MATCH_KEY, m.id);
    $('scoringFrame').src = `scoring/index.html?v=3.2.28&match=${encodeURIComponent(m.id)}&t=${Date.now()}`;
    route('score');
  }

  function availabilityModal(id) {
    const m = state.matches.find(x => x.id === id);
    if (!m) return;
    modal('My Match Availability', `<p class="muted">${escapeHtml(m.teamA)} vs ${escapeHtml(m.teamB)} · ${dateLabel(m.date)} ${escapeHtml(m.time)}</p><div class="availability-actions" style="margin-top:14px"><button id="avYes" class="yes">Available</button><button id="avNo" class="no">Unavailable</button></div>`, `<button class="ghost-btn" id="avCancel">Cancel</button>`);
    $('avYes').onclick = () => saveMyAvailability(m.id, 'yes');
    $('avNo').onclick = () => saveMyAvailability(m.id, 'no');
    $('avCancel').onclick = closeModal;
  }

  function saveMyAvailability(matchId, value) {
    state.availability[matchId] = value;
    state.teamAvailability[matchId] ||= {};
    state.teamAvailability[matchId][state.user.fullName] = value;
    save(); closeModal(); renderTeam(); toast('Availability saved privately');
  }

  function requestPlayer() {
    if (!isAdmin()) { toast('Captain / Admin access is required'); return; }
    modal('Request Organizer to Add Player', `<div class="request-intro"><strong>Organizer approval required</strong><span>Admins cannot add players directly. This request is sent to the organizer for approval.</span></div><div class="form-grid two"><label>Full Name<input id="rpName" placeholder="Player full name"></label><label>Email<input id="rpEmail" type="email" placeholder="player@email.com"></label><label>Contact Number<input id="rpPhone" placeholder="+1..."></label><label>Team<input id="rpTeam" value="${escapeHtml(state.user.team)}" disabled></label><label class="span2">Note<textarea id="rpNote" rows="3" placeholder="Optional note to organizer"></textarea></label></div>`, `<button class="ghost-btn" id="rpCancel">Cancel</button><button class="primary-btn" id="rpSend">Send Request</button>`);
    $('rpCancel').onclick = closeModal;
    $('rpSend').onclick = () => {
      const name = $('rpName').value.trim(), email = $('rpEmail').value.trim(), phone = $('rpPhone').value.trim(), team = $('rpTeam').value, note = $('rpNote').value.trim();
      if (!name || !email || !phone) { toast('Full name, email and contact are required'); return; }
      const req = { id: `pr${Date.now()}`, action: 'add', status: 'pending', name, email, phone, team, note, requestedBy: state.user.fullName, createdAt: new Date().toISOString() };
      state.playerRequests.push(req);
      addAppNotification({ key:`player_request_${req.id}`, title:`Player Request · ${team}`, text:`${state.user.fullName} requested to add ${name}.`, audience:'organizer', kind:'request' });
      save(); refreshNotificationBadge();
      const subject = `Player Addition Request · ${team} · ${name}`;
      const body = `ICAT Organizer,\n\nPlease review this request to add a new player to ${team}.\n\nFull Name: ${name}\nEmail: ${email}\nContact: ${phone}\nTeam: ${team}\n${note ? `Note: ${note}\n` : ''}\nRequested by: ${state.user.fullName}\nLeague: ${state.league.name}\n\nThank you.`;
      closeModal();
      openExternal(`mailto:${state.organizer?.email || ORGANIZER_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
      setTimeout(() => { if (isAdmin() && document.querySelector('[data-view="admin"].active')) renderAdmin('squads'); }, 250);
      toast('Player request sent to organizer');
    };
  }

  function editCaptain(team) {
    const t = state.teams.find(x => x.name === team); if (!t) return;
    modal('Edit Captain', `<div class="form-grid two"><label>Team<input value="${escapeHtml(t.name)}" disabled></label><label>Captain Name<input id="ecName" value="${escapeHtml(t.captain)}"></label><label>Email<input id="ecEmail" type="email" value="${escapeHtml(t.email)}"></label><label>Contact<input id="ecPhone" value="${escapeHtml(t.phone)}"></label></div>`, `<button class="ghost-btn" id="ecCancel">Cancel</button><button class="primary-btn" id="ecSave">Save Captain</button>`);
    $('ecCancel').onclick = closeModal;
    $('ecSave').onclick = () => { t.captain = $('ecName').value.trim() || t.captain; t.email = $('ecEmail').value.trim() || t.email; t.phone = $('ecPhone').value.trim() || t.phone; save(); closeModal(); renderAdmin('captains'); renderCaptains(); toast('Captain updated'); };
  }

  function editPlayerRole(team, index) {
    const p = state.squads[team]?.[index]; if (!p) return;
    modal('Edit Player Role', `<div class="form-grid"><label>Player<input value="${escapeHtml(p[0])}" disabled></label><label>Role<select id="eprRole">${['Captain · Batter','Batter','Wicketkeeper','All-rounder','Bowler'].map(r => `<option ${r === p[1] ? 'selected' : ''}>${r}</option>`).join('')}</select></label></div>`, `<button class="ghost-btn" id="eprCancel">Cancel</button><button class="primary-btn" id="eprSave">Save Role</button>`);
    $('eprCancel').onclick = closeModal;
    $('eprSave').onclick = () => { state.squads[team][index][1] = $('eprRole').value; save(); closeModal(); renderAdmin('squads'); toast('Player role updated'); };
  }

  function requestPlayerRemoval(team, index) {
    if (!isAdmin()) { toast('Captain / Admin access is required'); return; }
    if (team !== state.user.team) { toast('You can request changes only for your own team'); return; }
    const p = state.squads[team]?.[index];
    if (!p) return;
    const already = (state.playerRequests || []).some(r => r.action === 'remove' && r.status === 'pending' && r.team === team && r.name === p[0]);
    if (already) { toast('A removal request is already pending for this player'); return; }
    const meta = state.playerDirectory?.[p[0]] || {};
    const req = { id:`pr${Date.now()}`, action:'remove', status:'pending', name:p[0], role:p[1], email:meta.email || '', phone:meta.phone || '', team, note:'Player removal requested by team Admin', requestedBy:state.user.fullName, createdAt:new Date().toISOString() };
    state.playerRequests ||= [];
    state.playerRequests.push(req);
    addAppNotification({ key:`player_request_${req.id}`, title:`Player Removal Request · ${team}`, text:`${state.user.fullName} requested to remove ${p[0]}.`, audience:'organizer', kind:'request' });
    save();
    refreshNotificationBadge();
    renderAdminSquadEditor();
    renderPlayerRequests();
    toast('Removal request sent to organizer');
  }

  function uploadMvp() {
    if (!isAdmin()) { toast('Captain / Admin access is required'); return; }
    route('media');
  }

  function bindDynamic() {
    bindVenueFilters();
    $$('.open-live-match').forEach(b => b.onclick = () => openLiveMatchDetails(b.dataset.matchId));
    $$('.watch-live-match').forEach(b => b.onclick = () => openLiveMatchDetails(b.dataset.matchId, 'watch'));
    $$('.score-live-match,.score-match').forEach(b => b.onclick = () => { const m = state.matches.find(x => x.id === b.dataset.matchId); if (m) loadMatchIntoScorer(m); });
    $$('.edit-match').forEach(b => b.onclick = () => openMatchCenter(b.dataset.matchId));
    $$('.availability-btn').forEach(b => b.onclick = () => availabilityModal(b.dataset.matchId));
    $$('.availability-choice').forEach(b => b.onclick = () => { state.availability[b.dataset.matchId] = b.dataset.value; state.teamAvailability[b.dataset.matchId] ||= {}; state.teamAvailability[b.dataset.matchId][state.user.fullName] = b.dataset.value; save(); renderTeam(); toast('Availability saved privately'); });
    $$('.member-availability-choice').forEach(b => b.onclick = () => { const mine = memberAvailabilityMap(); mine[b.dataset.matchId] = b.dataset.value; state.teamAvailability[b.dataset.matchId] ||= {}; state.teamAvailability[b.dataset.matchId][state.user.fullName] = b.dataset.value; save(); renderMemberAvailability(); toast('Availability saved privately'); });
    $$('.captain-wa').forEach(b => b.onclick = () => openExternal(`https://wa.me/${b.dataset.phone.replace(/\D/g, '')}`));
    $$('.captain-email').forEach(b => b.onclick = () => openExternal(`mailto:${b.dataset.email}`));
    $$('.edit-captain').forEach(b => b.onclick = () => editCaptain(b.dataset.team));
    $$('.view-squad').forEach(b => b.onclick = () => openSquad(b.dataset.team));
    $$('.venue-detail-card').forEach(card => {
      card.onclick = () => openVenueDetails(card.dataset.venueName);
      card.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openVenueDetails(card.dataset.venueName); } };
    });
    $$('.edit-player-role').forEach(b => b.onclick = () => editPlayerRole(b.dataset.team, Number(b.dataset.index)));
    $$('.request-remove-player').forEach(b => b.onclick = () => requestPlayerRemoval(b.dataset.team, Number(b.dataset.index)));
    $$('.story-action').forEach(b => { b.onclick = () => openStory(b.dataset.storyIndex); b.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openStory(b.dataset.storyIndex); } }; });
    $$('.league-go-live').forEach(b => b.onclick = () => route('matches', { tab: 'live' }));
    $$('.stats-category-btn').forEach(b => b.onclick = () => renderStatsPanel(b.dataset.statsCategory));
    $$('[data-league-panel]').forEach(b => b.onclick = () => renderLeague(b.dataset.leaguePanel));
    $$('[data-team-showcase]').forEach(b => b.onclick = () => openSquad(b.dataset.teamShowcase));
    $$('[data-organizer-shortcut]').forEach(b => b.onclick = () => route('organizer', { tab: b.dataset.organizerShortcut }));
    $$('.organizer-admin-change').forEach(b => b.onclick = () => organizerAdminPicker(b.dataset.team));
    $$('.organizer-admin-remove').forEach(b => b.onclick = () => organizerRemoveAdmin(b.dataset.team));
    $$('.resolve-admin-message').forEach(b => b.onclick = () => { const m=(state.adminMessages||[]).find(x=>x.id===b.dataset.messageId); if(m){m.status='resolved';save();renderOrganizer('inbox');toast('Message resolved');} });
    $$('.approve-player-request').forEach(b => b.onclick = () => approvePlayerRequest(b.dataset.requestId));
    $$('.reject-player-request').forEach(b => b.onclick = () => rejectPlayerRequest(b.dataset.requestId));
    $$('.mark-mvp-instagram').forEach(b => b.onclick = () => markMvpPostedOnInstagram(b.dataset.mvpId));
  }

  function watchLiveStream(matchId) {
    const m = state.matches.find(x => x.id === matchId);
    if (m) openLiveMatchDetails(m.id, 'watch');
  }

  function openExternal(url) { window.location.href = url; }

  function streamProfile() {
    const q = $('streamQuality').value;
    if (q === '4k30') return { w: 3840, h: 2160, fps: 30, bitrate: 30000000, label: '4K · 30fps', mb: '30 Mbps' };
    if (q === '1080p60') return { w: 1920, h: 1080, fps: 60, bitrate: 12000000, label: '1080p · 60fps', mb: '12 Mbps' };
    if (q === '720p60') return { w: 1280, h: 720, fps: 60, bitrate: 6000000, label: '720p · 60fps', mb: '6 Mbps' };
    return { w: 1920, h: 1080, fps: 30, bitrate: 10000000, label: '1080p · 30fps', mb: '10 Mbps' };
  }

  async function previewCamera() {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: $('streamCamera').value === 'front' ? 'user' : 'environment' }, audio: true });
      $('cameraPreview').srcObject = s; $('cameraPreview').style.display = 'block'; $('previewEmpty').style.display = 'none'; await $('cameraPreview').play(); toast('Camera preview enabled');
    } catch { toast('Camera permission is required'); }
  }

  function startNativeStream() {
    if (!isAdmin()) { toast('Captain / Admin access is required'); return; }
    const match = authorizedStreamMatch();
    if (!match) { toast('Only the batting team admin can live stream their live match'); return; }
    const endpoint = $('streamEndpoint').value.trim(); if (!endpoint) { toast('Paste the YouTube RTMPS endpoint / stream key first'); return; }
    const p = streamProfile();
    const cfg = { endpoint, width: p.w, height: p.h, fps: p.fps, bitrate: p.bitrate, audioBitrate: 128000, camera: $('streamCamera').value, title: $('streamTitle').value, matchId: match.id, battingTeam: currentBattingTeam(match), adminTeam: state.user.team };
    if (window.ICATNative && typeof window.ICATNative.startYouTubeStream === 'function') {
      window.ICATNative.startYouTubeStream(JSON.stringify(cfg)); $('streamStateBadge').textContent = 'STARTING'; $('streamStateBadge').classList.add('live'); $('startStreamBtn').disabled = true; $('stopStreamBtn').disabled = false;
    } else toast('Native RTMPS streaming runs inside the Android APK build. Web demo stays in preview mode.');
  }

  function stopNativeStream() {
    if (window.ICATNative && window.ICATNative.stopYouTubeStream) window.ICATNative.stopYouTubeStream();
    $('streamStateBadge').textContent = 'OFFLINE'; $('streamStateBadge').classList.remove('live'); $('startStreamBtn').disabled = false; $('stopStreamBtn').disabled = true; toast('Stream stopped');
  }

  function sendNotification() {
    if (!isAdmin()) return;
    const channel = $('notifyChannel').value, aud = $('notifyAudience').value, msg = $('notifyMessage').value, subject = $('notifySubject').value;
    if (!msg.trim()) { toast('Enter a message'); return; }
    const targets = aud === 'All Captains' ? state.teams : [state.teams.find(t => aud.startsWith(t.name))].filter(Boolean);
    if (channel === 'whatsapp' || channel === 'both') { const t = targets[0]; if (t) openExternal(`https://wa.me/${t.phone.replace(/\D/g, '')}?text=${encodeURIComponent(subject + '\n\n' + msg)}`); }
    if (channel === 'email' || channel === 'both') { const emails = targets.map(t => t.email).join(','); setTimeout(() => openExternal(`mailto:${emails}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(msg)}`), 250); }
    toast('Notification handoff created');
  }

  window.addEventListener('message', event => {
    const data = event?.data;
    if (!data || data.type !== 'icat-scoring-state' || !data.matchId) return;
    const m = state.matches.find(x => x.id === data.matchId);
    if (!m) return;
    if (data.battingTeam && [m.teamA, m.teamB].includes(data.battingTeam)) m.battingTeam = data.battingTeam;
    if (Number.isInteger(data.currentInnings)) m.currentInnings = data.currentInnings;
    m.innings = data.currentInnings === 1 ? '2nd Innings' : '1st Innings';
    const wasComplete = m.status === 'result';
    if (data.matchComplete) {
      m.status = 'result';
      if (!wasComplete) notifyMatchCompleted(m);
    } else m.status = 'live';
    if (data.scoringSnapshot?.innings) m.scoringSnapshot = data.scoringSnapshot;
    save();
    refreshNotificationBadge();
    if (currentPageConfig().view === 'score' && !canAdminScoreMatch(m)) {
      sessionStorage.removeItem(SCORING_SESSION_KEY);
      toast('Scoring control has moved to the batting team admin');
      window.setTimeout(() => transitionNavigate(routeUrl('admin', { tab: 'matches' })), 180);
    }
  });

  function organizerLogin(emailOverride, passwordOverride) {
    const email = String(emailOverride ?? $('loginEmail')?.value ?? '').trim().toLowerCase();
    const password = String(passwordOverride ?? $('loginPassword')?.value ?? '').trim();
    if (email !== ORGANIZER_EMAIL.toLowerCase() || password !== 'demo1234') {
      toast('Demo organizer: organizer@icat.demo / demo1234');
      return;
    }
    role = 'organizer';
    persistentStore.set(ROLE_STORAGE, role);
    persistentStore.set(LOGIN_STORAGE, '1');
    persistentStore.set(LOGIN_EMAIL_STORAGE, ORGANIZER_EMAIL);
    if ($('loginScreen')) $('loginScreen').classList.add('hidden');
    if ($('mainApp')) $('mainApp').classList.remove('hidden');
    applyRoleUI();
    renderCaptains();
    toast('Organizer Access enabled');
    window.setTimeout(() => transitionNavigate('organizer.html'), 90);
  }

  function login(asAdmin = false) {
    const email = String($('loginEmail')?.value ?? '').trim().toLowerCase();
    const password = String($('loginPassword')?.value ?? '').trim();
    if (!email || !password) { toast('Enter email and password'); return; }
    if (email === ORGANIZER_EMAIL.toLowerCase()) { toast('Use ORGANIZER ACCESS for the organizer account'); return; }

    const rosterUser = resolveRosterUser(email);
    if (!rosterUser) { toast('This email is not registered on an ICAT team roster'); return; }
    if (password !== 'demo1234') { toast('Demo password: demo1234'); return; }

    const grantedAdmin = adminGrantedForEmail(email);
    if (asAdmin && !grantedAdmin) { toast('Admin access must be granted by the organizer'); return; }

    Object.assign(state.user, rosterUser);
    // MEMBER LOGIN always creates a member session, even when this player also
    // has Organizer-granted Admin access. CAPTAIN / ADMIN ACCESS is the only
    // path that creates an admin session.
    role = asAdmin ? 'admin' : 'member';
    persistentStore.set(ROLE_STORAGE, role);
    persistentStore.set(LOGIN_STORAGE, '1');
    persistentStore.set(LOGIN_EMAIL_STORAGE, email);
    $('loginScreen').classList.add('hidden');
    $('mainApp').classList.remove('hidden');
    applyRoleUI(); renderCaptains();
    toast(asAdmin ? 'Captain / Admin Access enabled' : 'Member Access enabled');
    window.setTimeout(() => transitionNavigate('home.html'), 90);
  }

  function demoLogin() {
    toast('Use MEMBER LOGIN with your registered team email'); return;
    role = 'member'; Object.assign(state.user, clone(demo.user)); persistentStore.set(ROLE_STORAGE, role); persistentStore.set(LOGIN_STORAGE, '1'); persistentStore.set(LOGIN_EMAIL_STORAGE,'');
    $('loginScreen').classList.add('hidden'); $('mainApp').classList.remove('hidden'); applyRoleUI(); renderCaptains();
    window.setTimeout(() => transitionNavigate('home.html'), 90);
  }

  function logout() {
    persistentStore.remove(LOGIN_STORAGE); persistentStore.remove(ROLE_STORAGE); persistentStore.remove(LOGIN_EMAIL_STORAGE); role = 'member';
    $('mainApp').classList.add('hidden'); $('loginScreen').classList.remove('hidden'); applyRoleUI(); transitionNavigate('index.html', true);
  }

  function enforceStandardBottomNav() {
    const nav = document.querySelector('.bottom-nav.bottom-nav-v3');
    if (!nav) return;
    const activeRoute = nav.querySelector('[data-route].active')?.dataset.route || '';
    nav.innerHTML = `
<button data-route="home"><span>⌂</span><small>Home</small></button>
<button data-route="matches"><span>▣</span><small>Matches</small></button>
<button class="score-nav" data-route="score"><span class="live-score-nav-icon" aria-hidden="true"><i></i><i></i><i></i></span><small>Live Scoring</small></button>
<button data-route="league"><span>♕</span><small>Leagues</small></button>
<button data-route="more"><span>•••</span><small>More</small></button>`;
    if (activeRoute) nav.querySelector(`[data-route="${activeRoute}"]`)?.classList.add('active');
    nav.setAttribute('data-standard-nav', 'locked');
  }

  function init() {
    restoreVisiblePageState();
    enforceStandardBottomNav();
    const cfg = currentPageConfig();
    const loggedIn = persistentStore.get(LOGIN_STORAGE) === '1';

    applyRoleUI();
    renderCaptains();

    $$('[data-route]').forEach(b => b.addEventListener('click', () => {
      const inProfile = !!b.closest('.drawer-profile-list');
      if (inProfile && b.dataset.route === 'team' && !isOrganizer()) { transitionNavigate('teams.html?scope=my'); return; }
      if (inProfile && b.dataset.leagueShortcut === 'stats' && !isOrganizer()) { transitionNavigate(`stats.html?scope=${isMember() ? 'me' : 'team'}`); return; }
      route(b.dataset.route, b.dataset.leagueShortcut ? { tab: b.dataset.leagueShortcut } : b.dataset.adminShortcut ? { tab: b.dataset.adminShortcut } : {});
    }));
    $('menuBtn').onclick = openDrawer; $('drawerClose').onclick = closeDrawer; $('drawerBackdrop').onclick = closeDrawer; $('logoutBtn').onclick = logout; if ($('moreLogout')) $('moreLogout').onclick = logout; if ($('moreRequestPlayer')) $('moreRequestPlayer').onclick = requestPlayer;
    $('loginBtn').onclick = () => login(false); $('adminLoginBtn').onclick = () => login(true); $('organizerLoginBtn').onclick = () => organizerLogin(); if ($('demoBtn')) $('demoBtn').onclick = demoLogin;
    $$('.forgot-link').forEach(b => b.onclick = () => toast('For a login reset, contact your ICAT league organizer'));
    $$('.season-switcher-v3 button').forEach(b => b.onclick = () => toast('Winter 2026 is the active season'));
    $('topLiveBtn').onclick = () => route('matches', { tab: 'live' }); if ($('adminQuickBtn')) $('adminQuickBtn').onclick = () => route('admin'); if ($('organizerQuickBtn')) $('organizerQuickBtn').onclick = () => route('organizer');
    $('viewAllLiveBtn').onclick = () => route('matches', { tab: 'live' }); $('viewRecentBtn').onclick = () => route('matches', { tab: 'recent' });
    $$('#matchesTabs button').forEach(b => b.onclick = () => route('matches', { tab: b.dataset.matchTab }));
    $$('#leagueTabs button').forEach(b => b.onclick = () => route('league', { tab: b.dataset.tab }));
    $$('#adminTabs button').forEach(b => b.onclick = () => route('admin', { tab: b.dataset.adminTab }));
    $$('#organizerTabs button').forEach(b => b.onclick = () => route('organizer', { tab: b.dataset.organizerTab }));
    $$('.media-tabs button').forEach(b => b.onclick = () => route('media', { tab: b.dataset.media }));
    $('requestPlayerBtn').onclick = requestPlayer; if ($('uploadMvpBtn')) $('uploadMvpBtn').onclick = uploadMvp;
    // Team contact handlers are assigned by renderTeam() for the logged-in team.
    $('sendNotifyBtn').onclick = sendNotification; $('previewBtn').onclick = previewCamera; $('startStreamBtn').onclick = startNativeStream; $('stopStreamBtn').onclick = stopNativeStream;
    $('connectYoutubeBtn').onclick = () => openExternal(YOUTUBE_CHANNEL_URL); if ($('openYoutubeChannelBtn')) $('openYoutubeChannelBtn').onclick = () => openExternal(YOUTUBE_CHANNEL_URL);
    $('streamQuality').onchange = () => { const p = streamProfile(); $('streamResolutionOverlay').textContent = p.label; $('streamBitrateOverlay').textContent = p.mb; $('latencyLabel').textContent = $('streamQuality').value.startsWith('4k') ? 'Normal' : 'Normal / Low'; };
    $('selectScoreMatchBtn').onclick = () => route('admin', { tab: 'matches' });
    $$('[data-external-url]').forEach(b => b.onclick = () => openExternal(b.dataset.externalUrl));
    bindDynamic();

    if (cfg.page === 'login') {
      $('loginScreen').classList.remove('hidden'); $('mainApp').classList.add('hidden');
      if (loggedIn) transitionNavigate(isOrganizer() ? 'organizer.html' : 'home.html', true);
      return;
    }

    if (!loggedIn) { transitionNavigate('index.html', true); return; }

    // If an Organizer session is restored on the member Home page (for example
    // from an older cached route), immediately restore the Organizer Dashboard.
    if (isOrganizer() && cfg.view === 'home') {
      transitionNavigate('organizer.html', true);
      return;
    }

    $('loginScreen').classList.add('hidden'); $('mainApp').classList.remove('hidden');
    applyRoleUI();
    activateLocal(cfg.view, cfg.tab ? { tab: cfg.tab } : {});
    document.documentElement.classList.add('page-ready');
  }

  init();
})();
