/* =========================================================================
   MOOV — Testimonials data + placeholder "reel" engine
   -------------------------------------------------------------------------
   PLACEHOLDER CONTENT. Swap real values in later:
   - set `vimeo` to the Vimeo numeric ID  (e.g. "1095601750")
     → the engine will render a muted, looping, autoplaying iframe
       and use https://vumbnail.com/<id>.jpg as the poster.
   - leave `vimeo: null` to keep the animated placeholder surface.
   Quotes / names / roles / schools are all believable stand-ins.
   ========================================================================= */

const MOOV_ACCENTS = {
  indigo: { solid: '#6366F1', soft: 'rgba(99,102,241,0.15)', grad: 'linear-gradient(135deg,#6366F1,#3B82F6)' },
  blue:   { solid: '#3B82F6', soft: 'rgba(59,130,246,0.15)', grad: 'linear-gradient(135deg,#3B82F6,#2563EB)' },
  cyan:   { solid: '#06B6D4', soft: 'rgba(6,182,212,0.15)',  grad: 'linear-gradient(135deg,#06B6D4,#3B82F6)' },
  green:  { solid: '#22C55E', soft: 'rgba(34,197,94,0.15)',  grad: 'linear-gradient(135deg,#22C55E,#16A34A)' },
  salmon: { solid: '#FA8072', soft: 'rgba(250,128,114,0.15)',grad: 'linear-gradient(135deg,#FA8072,#FF6B6B)' },
  red:    { solid: '#EF4444', soft: 'rgba(239,68,68,0.15)',  grad: 'linear-gradient(135deg,#EF4444,#DC2626)' },
};

const TOPICS = {
  attendance: 'Attendance',
  passes: 'Hall Passes',
  safety: 'Safety',
};

/* type: 'video' | 'quote'  — stats are a separate list below */
const TESTIMONIALS = [
  {
    id: 't1', type: 'video', accent: 'indigo', topic: 'safety', duration: '0:52', vimeo: '76979871',
    quote: 'It completely changed how we run dismissal.',
    body: 'We used to have three staff members directing traffic and guessing who left. Now every exit is a checkpoint and I can see it all from one screen.',
    name: 'Maria Delgado', role: 'Assistant Principal', school: 'Huntington UFSD',
  },
  {
    id: 't2', type: 'quote', accent: 'blue', topic: 'attendance', duration: null, vimeo: null,
    quote: "We're down 87% in tardies since rolling out MOOV.",
    body: 'We did a nine-week comparison against last year. The hallways are radically different — kids tap in and get to class.',
    name: 'Dr. James Okafor', role: 'Principal', school: 'Smithtown CSD',
  },
  {
    id: 't3', type: 'video', accent: 'green', topic: 'attendance', duration: '1:08', vimeo: '1095601750',
    quote: 'Teachers got hours of their week back.',
    body: 'No more roll call, no more paper. Attendance is just done. That time goes straight back into instruction.',
    name: 'Karen Whitfield', role: 'Dean of Students', school: 'Provo City SD',
  },
  {
    id: 't4', type: 'quote', accent: 'salmon', topic: 'passes', duration: null, vimeo: null,
    quote: 'Hall passes used to be chaos. Now it\u2019s a tap.',
    body: 'Wooden blocks, paper slips, sign-out sheets — all gone. A hand raise and a head nod and the student is on their way.',
    name: 'Anthony Russo', role: 'Security Lead', school: 'Babylon UFSD',
  },
  {
    id: 't5', type: 'video', accent: 'cyan', topic: 'safety', duration: '0:47', vimeo: '76979871',
    quote: 'I always know exactly who is in my building.',
    body: 'In an emergency I can search a name and see their last known location instantly. That peace of mind is everything.',
    name: 'Lena Park', role: 'Director of Technology', school: 'Mineola UFSD',
  },
  {
    id: 't6', type: 'quote', accent: 'indigo', topic: 'attendance', duration: null, vimeo: null,
    quote: 'Our coaches finally put down the clipboards.',
    body: 'Practice, club, and extra-help attendance is automatic now. It syncs straight to our SIS without anyone lifting a finger.',
    name: 'Marcus Bell', role: 'Athletic Director', school: 'Riverhead CSD',
  },
  {
    id: 't7', type: 'video', accent: 'red', topic: 'safety', duration: '1:21', vimeo: '1095601750',
    quote: 'Visitor check-in went from minutes to seconds.',
    body: 'Every visitor is screened against the registries and gets a printed badge. The front office isn\u2019t a bottleneck anymore.',
    name: 'Priya Nair', role: 'Front Office Lead', school: 'Brentwood UFSD',
  },
  {
    id: 't8', type: 'quote', accent: 'blue', topic: 'attendance', duration: null, vimeo: null,
    quote: 'Students actually like tapping in.',
    body: 'It became part of the routine on day one. They treat it like Apple Pay — it just feels normal to them.',
    name: 'Sofia Marino', role: 'Teacher', school: 'Long Beach CSD',
  },
  {
    id: 't9', type: 'video', accent: 'green', topic: 'attendance', duration: '0:58', vimeo: '76979871',
    quote: 'MOOV paid for itself in saved instructional time.',
    body: 'When you add up five minutes a period across every classroom, every day — the math makes the decision for you.',
    name: 'Greg Tanaka', role: 'Superintendent', school: 'Kings Park CSD',
  },
  {
    id: 't10', type: 'quote', accent: 'cyan', topic: 'passes', duration: null, vimeo: null,
    quote: 'Setup was shockingly fast. We were live in a day.',
    body: 'I expected a months-long rollout. Readers went up, cards got encoded, and we were tapping students in the same afternoon.',
    name: 'Dana Cole', role: 'IT Coordinator', school: 'Hauppauge UFSD',
  },
  {
    id: 't11', type: 'video', accent: 'salmon', topic: 'safety', duration: '1:14', vimeo: '1095601750',
    quote: 'Emergency drills are completely different now.',
    body: 'We get a live, accurate roster of who is on campus in real time. No more clipboards, no more guessing during a drill.',
    name: 'Robert Hayes', role: 'Safety Coordinator', school: 'Northport-East Northport UFSD',
  },
  {
    id: 't12', type: 'video', accent: 'blue', topic: 'passes', duration: '0:43', vimeo: '76979871',
    quote: 'The handheld is a game changer for my team.',
    body: 'My guards can scan an ID anywhere and instantly see if a student belongs in that hallway. It fits right in their pocket.',
    name: 'Tasha Greene', role: 'Campus Supervisor', school: 'Baldwin UFSD',
  },
];

/* Stat callouts woven into the wall (Minga-style "87% down in tardies") */
const MOOV_STATS = [
  { value: '87%',   label: 'fewer tardies, first semester', accent: 'blue' },
  { value: '5 min', label: 'saved every single period',     accent: 'green' },
  { value: '4M',    label: 'taps per school each year',     accent: 'indigo' },
  { value: '15x',   label: 'taps per student, per day',     accent: 'cyan' },
];

/* ---------- helpers ---------- */
function moovInitials(name) {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

/* Animated placeholder "reel" surface — reads as a silent, looping clip.
   When `t.vimeo` is set, returns a real muted autoplay iframe instead.
   opts: { caption: bool (show lower-third), play: bool (mini play affordance) } */
function moovReelSurface(t, opts = {}) {
  const a = MOOV_ACCENTS[t.accent] || MOOV_ACCENTS.indigo;
  if (t.vimeo) {
    const poster = `https://vumbnail.com/${t.vimeo}.jpg`;
    if (opts.mini) {
      // lightweight: just the real thumbnail (used in playlists / filmstrips)
      return `<img class="reel-mini-poster" src="${poster}" alt="" loading="lazy"
          style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;">`;
    }
    // full tile: poster shows instantly, muted looping background video plays over it
    return `<div class="reel-vimeo" style="position:absolute;inset:0;overflow:hidden;">
        <img class="reel-poster" src="${poster}" alt="" loading="lazy"
          style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0;">
        <iframe class="reel-iframe"
          src="https://player.vimeo.com/video/${t.vimeo}?background=1&autoplay=1&loop=1&muted=1&title=0&byline=0&portrait=0"
          allow="autoplay; fullscreen; picture-in-picture" allowfullscreen loading="lazy"
          style="z-index:1;"></iframe>
      </div>`;
  }
  const cap = opts.caption === false ? '' : `
    <div class="reel-lowerthird">
      <span class="reel-avatar" style="background:${a.grad}">${moovInitials(t.name)}</span>
      <span class="reel-cap-text"><strong>${t.name}</strong>${t.role} \u00b7 ${t.school}</span>
    </div>`;
  if (opts.mini) {
    // bare animated backdrop for small thumbnails (no chrome)
    return `
      <div class="reel-ph reel-mini" style="--reel-accent:${a.solid}">
        <div class="reel-drift" style="background:
            radial-gradient(120% 80% at 30% 20%, ${a.soft}, transparent 60%),
            radial-gradient(100% 90% at 80% 90%, ${a.soft}, transparent 55%)"></div>
        <div class="reel-grain"></div>
      </div>`;
  }
  return `
    <div class="reel-ph" style="--reel-accent:${a.solid}">
      <div class="reel-drift" style="background:
          radial-gradient(120% 80% at 30% 20%, ${a.soft}, transparent 60%),
          radial-gradient(100% 90% at 80% 90%, ${a.soft}, transparent 55%)"></div>
      <div class="reel-grain"></div>
      <div class="reel-badges">
        <span class="reel-live"><i></i>PLAYING</span>
        <span class="reel-mute" title="Muted preview">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M7 3 4 6H2v4h2l3 3V3Z" fill="currentColor"/><path d="M11 6l3 4M14 6l-3 4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
        </span>
      </div>
      <div class="reel-eq"><span></span><span></span><span></span><span></span><span></span></div>
      ${t.duration ? `<span class="reel-dur">${t.duration}</span>` : ''}
      ${cap}
      <div class="reel-scrub"><i></i></div>
    </div>`;
}

if (typeof window !== 'undefined') {
  Object.assign(window, { MOOV_ACCENTS, TOPICS, TESTIMONIALS, MOOV_STATS, moovInitials, moovReelSurface });
}
