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
  purple: { solid: '#8B5CF6', soft: 'rgba(139,92,246,0.15)', grad: 'linear-gradient(135deg,#8B5CF6,#6D28D9)' },
  gold:   { solid: '#F59E0B', soft: 'rgba(245,158,11,0.15)', grad: 'linear-gradient(135deg,#FBBF24,#D97706)' },
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
    id: 't1', type: 'video', accent: 'gold', topic: 'passes', duration: '1:08', vimeo: '1202450248',
    quote: 'My frequent fliers is literally my home screen.',
    body: 'I can see exactly which students are out the most, and I act on it before it becomes a pattern. It is the first thing I check every morning.',
    name: "Ra'Ven Pritchard", role: 'Assistant Principal', school: 'Comsewogue High School',
  },
  {
    id: 't2', type: 'quote', accent: 'blue', topic: 'attendance', duration: null, vimeo: null,
    quote: 'It has changed our sign-in to school process significantly.',
    body: 'It cut it at least in half of the time. Students are able to quickly come into school, scan in, get their pass, and move to their first period class.',
    name: 'Reanna Fulton', role: 'Director of Technology', school: 'Cold Spring Harbor',
  },
  {
    id: 't3', type: 'video', accent: 'purple', topic: 'safety', duration: '3:06', vimeo: '1202453159',
    quote: 'In the event of an emergency, I know which classrooms are being used, and which students are in which classrooms.',
    body: "Knowing exactly who's in the building, knowing exactly where our students are at any given time.",
    name: 'Meghan Stern', role: 'Principal', school: 'Islip Middle School',
  },
  {
    id: 't4', type: 'video', accent: 'salmon', topic: 'attendance', duration: null, vimeo: '1202459540',
    quote: "It's so easy to find someone.",
    body: "Just type in a name, it's right there. I can log tap-in times.",
    name: 'Jen Greco', role: 'Attendance Office', school: 'Kings Park High School',
  },
  {
    id: 't5', type: 'video', accent: 'gold', topic: 'safety', duration: null, vimeo: '1202467156',
    quote: 'We know every single person walking into this building, which is important to a principal.',
    body: '',
    name: 'Dr. Mike Mosca', role: 'Principal', school: 'Comsewogue High School',
  },
  {
    id: 't6', type: 'video', accent: 'indigo', topic: 'attendance', duration: null, vimeo: '1202467107',
    quote: 'It makes our lives just 10 times easier.',
    body: '',
    name: 'Joel Sutherland', role: 'Math Teacher', school: 'Comsewogue High School',
  },
  {
    id: 't7', type: 'video', accent: 'red', topic: 'safety', duration: null, vimeo: '1202467096',
    quote: 'No matter where you are, no matter what time of the day, an adult will know where you are.',
    body: '',
    name: 'Grace, Juliana, & Presley', role: '11th Grade Students', school: 'Kings Park High School',
  },
  {
    id: 't8', type: 'video', accent: 'blue', topic: 'attendance', duration: '1:13', vimeo: '1202467112',
    quote: 'It cuts attendance down from a 1-2 minute affair to like 10 seconds maximum.',
    body: 'It saves a lot of time for me.',
    name: 'Justin Schwartz', role: 'Science Teacher', school: 'John F. Kennedy Middle School',
  },
  {
    id: 't9', type: 'video', accent: 'green', topic: 'attendance', duration: '1:30', vimeo: '1202467051',
    quote: 'Every single time they tap into class, attendance is at the forefront of their thinking.',
    body: "And I think that's part of the reason why we've seen some shifts in attendance and being on time to class in a positive direction.",
    name: 'Charlie Rizzuto', role: 'Assistant Principal', school: 'Islip High School',
  },
  {
    id: 't10', type: 'video', accent: 'cyan', topic: 'passes', duration: '1:00', vimeo: '1202467049',
    quote: "If we're in the hallway, we're able to spot check them when they're walking by to make sure that they were in the hallway for a legitimate reason.",
    body: '',
    name: 'Frank Gmelin', role: 'Director of Security', school: 'Comsewogue School District',
  },
  {
    id: 't11', type: 'video', accent: 'salmon', topic: 'attendance', duration: null, vimeo: '1202467052',
    quote: "From my technical point of view, it's super easy to use.",
    body: "It's a very user-friendly platform that doesn't require a lot of training.",
    name: 'Ernesto Narvaez', role: 'Network & Systems Technician', school: 'Comsewogue High School',
  },
  {
    id: 't12', type: 'video', accent: 'blue', topic: 'attendance', duration: null, vimeo: '1202467050',
    quote: 'We keep track of all the kids with their extracurriculars for clubs.',
    body: "And that's really nice because the advisors don't have to just manually take attendance.",
    name: 'Corey Mammolito', role: 'Assistant Principal', school: 'Kings Park High School',
  },
];

/* Stat callouts woven into the wall (Minga-style "87% down in tardies") */
const MOOV_STATS = [
  { value: '900%',  label: 'quicker attendance', accent: 'blue', by: 'Justin Schwartz', school: 'Comsewogue High School' },
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
    if (opts.enlarged) {
      // full-screen player: real sound, native controls, no loop (auto-advances on end)
      return `<iframe class="reel-iframe reel-fullplayer"
          src="https://player.vimeo.com/video/${t.vimeo}?autoplay=1&loop=0&muted=0&title=0&byline=0&portrait=0&controls=1&playsinline=1"
          allow="autoplay; fullscreen; picture-in-picture; clipboard-write" allowfullscreen loading="eager"
          style="position:absolute;inset:0;width:100%;height:100%;border:0;z-index:2;"></iframe>`;
    }
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
