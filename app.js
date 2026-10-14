(() => {
  'use strict';
  const data = window.SITE_CONTENT;
  const sectionLabels = {overview:'About', research:'Publications', projects:'Open Source', news:'News', experience:'Experience', awards:'Awards'};
  const $ = selector => document.querySelector(selector);
  const escape = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const paths = {
    grid:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    papers:'<path d="M7 3h10l4 4v14H7zM17 3v5h4M3 7v14M11 12h6M11 16h6"/>',
    code:'<path d="m7 6-6 6 6 6m10-12 6 6-6 6M14 3l-4 18"/>',
    news:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h4v4H7zM15 8h2M15 12h2M7 16h10"/>',
    award:'<circle cx="12" cy="8" r="5"/><path d="m8 12-2 9 6-3 6 3-2-9"/>',
    briefcase:'<rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V3h8v4M3 12c5 4 13 4 18 0M12 12v4"/>',
    cap:'<path d="m2 9 10-5 10 5-10 5zM6 11v6c4 3 8 3 12 0v-6M22 9v8"/>',
    github:'<path d="M9 19c-4 1-4-2-6-2m12 4v-3c0-1 .2-2-1-3 3-.3 6-1.5 6-6 0-1.3-.5-2.5-1.3-3.3.2-1 .2-2-.2-3.2-1.5 0-3 1-3.5 1.5a12 12 0 0 0-6 0C8.5 3.5 7 2.5 5.5 2.5c-.4 1.2-.4 2.2-.2 3.2A5 5 0 0 0 4 9c0 4.5 3 5.7 6 6-1.2 1-1 2-1 3v3"/>',
    mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>',
    home:'<path d="m3 10 9-7 9 7v11h-6v-7H9v7H3z"/>',
    search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
    play:'<path d="m8 4 12 8-12 8z"/>',
    close:'<path d="m6 6 12 12M6 18 18 6"/>',
    arrow:'<path d="M6 18 18 6M6 6h12v12"/>'
  };
  const icon = name => `<svg aria-hidden="true" viewBox="0 0 24 24">${paths[name] || paths.arrow}</svg>`;
  document.querySelectorAll('[data-icon]').forEach(el => el.innerHTML = icon(el.dataset.icon));
  document.querySelectorAll('[data-social]').forEach(el => {
    el.href = el.dataset.social === 'email' ? `mailto:${data.profile.email}` : data.profile[el.dataset.social];
    if (el.dataset.social !== 'email') { el.target = '_blank'; el.rel = 'noopener noreferrer'; }
  });
  const external = (url, label, className = '') => `<a href="${escape(url)}" target="_blank" rel="noopener noreferrer" class="${className}">${label}</a>`;
  const previewArt = paper => {
    const alt = `${paper.name || paper.title} research preview`;
    if (paper.previewImages) return `<span class="preview-gallery">${paper.previewImages.map(src => `<img src="${escape(src)}" alt="${escape(alt)}" loading="lazy">`).join('')}</span>`;
    return `<img src="${escape(paper.image)}" alt="${escape(alt)}" loading="lazy" width="640" height="360">`;
  };
  const media = paper => {
    const video = paper.video && !paper.previewIsFigure;
    return `<button class="paper-media ${paper.id}" data-video="${paper.id}" ${paper.previewIsFigure ? 'data-figure="true"' : ''} aria-label="${video ? 'Watch' : 'View'} ${escape(paper.name || paper.title)} ${video ? 'video' : 'figure'}"><span class="media-art">${previewArt(paper)}</span><span class="play-icon">${icon(video ? 'play' : 'search')} ${video ? 'Watch video' : 'View image'}</span></button>`;
  };
  const authors = text => escape(text).replace('Xinying Guo', '<strong>Xinying Guo</strong>');
  const authorshipLabel = paper => {
    const role = paper.authorship?.role;
    const label = {'first':'First author', 'co-first':'Co-first author', 'core-contributor':'Core contributor'}[role] || '';
    return label + (paper.authorship?.projectLead ? ' · Project lead' : '');
  };
  const authorshipNote = paper => paper.authorNote || '';
  const paperHTML = paper => `<article id="paper-${paper.id}" class="paper" data-paper="${paper.id}">${media(paper)}<div class="paper-info"><div class="paper-meta"><span class="venue">${escape(paper.venue)}</span>${authorshipLabel(paper) ? `<span class="contribution">${escape(authorshipLabel(paper))}</span>` : ''}</div><h3>${external(paper.links.Paper, escape(paper.title))}</h3><p class="authors">${authors(paper.authors)}</p>${paper.creditGroups ? `<dl class="team-credits">${paper.creditGroups.map(group => `<div><dt>${escape(group.label)}</dt><dd>${authors(group.names)}</dd></div>`).join('')}</dl>` : ''}${authorshipNote(paper) ? `<p class="author-note">${escape(authorshipNote(paper))}</p>` : ''}<p class="paper-summary">${escape(paper.summary)}</p><div class="paper-links">${Object.entries(paper.links).map(([label,url]) => external(url, escape(label))).join('')}${paper.bibtex ? `<button data-cite="${paper.id}">BibTeX</button>` : ''}</div></div></article>`;
  let filter = 'All', query = '';
  function renderPapers() {
    const papers = data.papers.filter(p => (filter === 'All' || p.topic === filter) && `${p.name} ${p.title} ${p.authors} ${p.year} ${p.venue}`.toLowerCase().includes(query));
    const years = [...new Set(papers.map(p => p.year))].sort((a,b) => b-a);
    $('#papers-list').innerHTML = years.map(year => `<section class="paper-year" aria-labelledby="year-${year}"><h3 class="year-heading" id="year-${year}">${year}<span>${papers.filter(p => p.year === year).length}</span></h3>${papers.filter(p => p.year === year).map(paperHTML).join('')}</section>`).join('');
    $('#publication-count').textContent = `${papers.length} papers`;

    $('#empty-state').hidden = !!papers.length;
    $('#results-status').textContent = `${papers.length} publications shown`;
  }
  renderPapers();
  $('#projects-list').innerHTML = data.projects.map(project => `<article id="project-${project.id}" class="project">${media(project, 'project')}<div class="project-body"><div class="project-heading"><h3>${escape(project.title)}</h3><a class="repo-stars" data-stars="${project.id}" href="${escape(project.repo)}/stargazers" target="_blank" rel="noopener noreferrer"><span class="star-value">☆ ${project.starsSnapshot.count.toLocaleString('en-US')}</span><span class="star-status">Updating…</span></a></div><p class="project-description">${escape(project.description)}</p><div class="project-role">${escape(project.role)}<span>${escape(project.date)}</span></div><ul>${project.contributions.map(c => `<li>${escape(c)}</li>`).join('')}</ul><div class="project-links">${external(project.repo, `${icon('github')} GitHub`)}${external(project.demo, 'Project')}${project.video ? `<button data-video="${project.id}">Video</button>` : ''}${project.paperId ? `<a href="#paper-${project.paperId}" data-related-paper="${project.paperId}">Paper</a>` : ''}</div></div></article>`).join('');
  let expandedNews = false;
  function renderNews() {
    $('#news-list').innerHTML = (expandedNews ? data.news : data.news.slice(0,3)).map(n => `<article class="news-item"><div class="news-date">${escape(n.date)}<span class="news-type">${escape(n.type)}</span></div><p>${external(n.url, escape(n.text))}</p></article>`).join('');
    $('#news-toggle').innerHTML = `${expandedNews ? 'Less news' : 'More news'} <span>${expandedNews ? '−' : '↗'}</span>`;
    $('#news-toggle').setAttribute('aria-expanded', String(expandedNews));
  }
  renderNews();
  $('#news-toggle').addEventListener('click', () => { expandedNews = !expandedNews; renderNews(); });
  $('#awards-list').innerHTML = data.awards.map(a => `<article class="award-item"><span class="award-year">${escape(a.year)}</span><div><h3>${escape(a.title)}</h3><p>${escape(a.organization)}</p></div></article>`).join('');
  const institutionLogo = entry => `<a class="institution-logo" href="${escape(entry.url)}" target="_blank" rel="noopener noreferrer" aria-label="${escape(entry.place)} website"><img src="${escape(entry.logo)}" alt="${escape(entry.place)} logo" width="80" height="56" loading="lazy"></a>`;
  const doctorate = data.education[0];
  const current = data.currentResearch;
  const affiliation = a => `<a class="career-affiliation" href="${escape(a.url)}" target="_blank" rel="noopener noreferrer"><img src="${escape(a.logo)}" alt="${escape(a.name)} logo" width="62" height="36"><span><strong>${escape(a.name)}</strong><small>${escape(a.label)}${a.name.includes('A*STAR') ? ' · 2025–2029' : ''}</small></span></a>`;
  const careerRow = (entry, body, currentRole = false) => `<article class="career-row${currentRole ? ' career-current' : ''}"><div class="career-date">${currentRole ? '<span class="career-now">Current</span>' : ''}${escape(entry.date)}</div>${institutionLogo(entry)}<div class="career-body"><h3>${escape(entry.role)}</h3><p class="career-place">${external(entry.url, escape(entry.place))}</p>${body}</div></article>`;
  $('#career-list').innerHTML = careerRow(doctorate, `<p class="career-summary">${escape(current.focus)}<br>Advisor: Prof. Jianfei Yang · Expected May 2029</p><div class="career-affiliations">${current.affiliations.slice(1).map(affiliation).join('')}</div>`, true)
    + data.experience.map(e => careerRow(e, `<p class="career-summary">${escape(e.summary)}</p>`)).join('')
    + data.education.slice(1).map(e => careerRow(e, `<p class="career-summary">${e.details.map(escape).join(' · ')}</p>`)).join('');
  $('#skills-list').innerHTML = data.skills.map(skill => `<div class="skill-group"><h4>${escape(skill.label)}</h4><p>${escape(skill.text)}</p></div>`).join('');
  document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
    filter = button.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach(b => { b.classList.toggle('selected', b === button); b.setAttribute('aria-pressed', String(b === button)); });
    renderPapers();
  }));
  $('.search-toggle').addEventListener('click', () => {
    const opening = $('#search-wrap').hidden;
    $('#search-wrap').hidden = !opening;
    $('.search-toggle').setAttribute('aria-expanded', String(opening));
    if (opening) $('#research-search').focus();
    else { query = ''; $('#research-search').value = ''; renderPapers(); }
  });
  $('#research-search').addEventListener('input', e => { query = e.target.value.trim().toLowerCase(); renderPapers(); });
  $('#reset-search').addEventListener('click', () => {
    query = ''; $('#research-search').value = '';
    document.querySelector('[data-filter="All"]').click();
  });
  const mediaDialog = $('#media-dialog');
  let lastTrigger = null;
  function openVideo(id, trigger, showFigure = false) {
    const source = [...data.papers, ...data.projects].find(p => p.id === id);
    const paper = source && (showFigure ? {...source, video: null} : source);
    if (!paper) return;
    lastTrigger = trigger;
    $('#media-title').textContent = paper.name || paper.title;
    $('#media-kind').textContent = paper.video ? 'VIDEO' : (paper.previewIsFigure ? 'PROJECT TEASER' : 'PAPER FIGURE');
    $('#media-caption').textContent = paper.video?.caption || paper.summary || paper.description;
    $('#media-external').href = paper.video?.external || paper.links?.Project || paper.links?.Paper || paper.demo;
    const player = $('#media-player'); player.replaceChildren();
    if (!paper.video) {
      const image = document.createElement('img'); image.src = paper.figure || paper.image; image.alt = `${paper.name || paper.title} research figure`; player.append(image);
    } else if (paper.video.type === 'file') {
      const video = document.createElement('video');
      video.controls = true; video.playsInline = true; video.loop = !!paper.video.loop; video.muted = !!paper.video.loop; video.preload = 'metadata'; video.poster = paper.image;
      video.src = paper.video.src;
      video.addEventListener('error', () => { if (!video.isConnected) return; player.innerHTML = '<p class="media-error">This video could not be loaded. You can watch it on the original project page below.</p>'; });
      player.append(video);
    } else {
      const iframe = document.createElement('iframe');
      iframe.src = paper.video.src; iframe.title = `${paper.name || paper.title} video demonstration`;
      iframe.allow = 'fullscreen; picture-in-picture'; iframe.allowFullscreen = true;
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      player.append(iframe);
    }
    mediaDialog.showModal(); document.body.style.overflow = 'hidden';
    if (paper.video?.loop) player.querySelector('video')?.play().catch(() => {});
  }
  function cleanupMedia() {
    $('#media-player').querySelector('video')?.pause();
    $('#media-player').replaceChildren(); document.body.style.overflow = '';
    lastTrigger?.focus();
  }
  $('#close-media').addEventListener('click', () => { cleanupMedia(); mediaDialog.close(); });
  mediaDialog.addEventListener('cancel', cleanupMedia);
  mediaDialog.addEventListener('close', () => { if (!mediaDialog.open) cleanupMedia(); });
  document.addEventListener('click', e => {
    const related = e.target.closest('[data-related-paper]');
    if (related) {
      e.preventDefault(); query = ''; $('#research-search').value = '';
      document.querySelector('[data-filter="All"]').click();
      const id = `paper-${related.dataset.relatedPaper}`;
      navigateTo(id);
    }
    const video = e.target.closest('[data-video]');
    if (video) { highlightItem(video.closest('article')); openVideo(video.dataset.video, video, video.dataset.figure === 'true'); }
    const citation = e.target.closest('[data-cite]');
    if (citation) {
      highlightItem(citation.closest('article'));
      const paper = data.papers.find(p => p.id === citation.dataset.cite);
      $('#citation-text').textContent = paper.bibtex;
      $('#copy-status').textContent = ''; $('#copy-citation').textContent = 'Copy BibTeX';
      $('#citation-dialog').showModal();
    }
  });
  [mediaDialog, $('#citation-dialog')].forEach(dialog => dialog.addEventListener('click', e => {
    const r = dialog.getBoundingClientRect();
    if (e.target === dialog && (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)) dialog.close();
  }));
  $('#close-citation').addEventListener('click', () => $('#citation-dialog').close());
  $('#copy-citation').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText($('#citation-text').textContent); $('#copy-citation').textContent = 'Copied'; $('#copy-status').textContent = 'Citation copied to clipboard.'; }
    catch { $('#copy-status').textContent = 'Select the citation text above and copy it manually.'; }
  });
  document.querySelectorAll('[data-section-label]').forEach(el => { el.textContent = sectionLabels[el.dataset.sectionLabel]; });
  const navLinks = [...document.querySelectorAll('.nav a')];
  const sections = Object.keys(sectionLabels).map(id => document.getElementById(id));
  let activeSection = 'overview', navigationLock = 0, pulseTimer;
  function activate(id) {
    if (id.startsWith('paper-')) id = 'research';
    if (id.startsWith('project-')) id = 'projects';
    if (!sectionLabels[id]) return;
    activeSection = id;
    navLinks.forEach(a => {
      const active = a.dataset.section === id;
      a.classList.toggle('active', active);
      if (active) a.setAttribute('aria-current','location'); else a.removeAttribute('aria-current');
    });
    if (matchMedia('(max-width: 600px)').matches) {
      const nav = $('.nav'), link = nav.querySelector('.active');
      if (link) {
        const bounds = nav.getBoundingClientRect(), item = link.getBoundingClientRect();
        if (item.left < bounds.left || item.right > bounds.right) {
          nav.scrollLeft += item.left - bounds.left - (bounds.width - item.width) / 2;
        }
      }
    }
    sections.forEach(el => el.classList.toggle('section-active', el.id === id));
    $('.breadcrumb strong').textContent = sectionLabels[id];
  }
  function highlightItem(el) {
    document.querySelectorAll('.item-selected').forEach(item => item.classList.remove('item-selected'));
    el?.classList.add('item-selected');
  }
  function navigateTo(id, updateHash = true) {
    const target = document.getElementById(id);
    if (!target) return;
    navigationLock = Date.now() + 1200;
    activate(id);
    document.querySelectorAll('.destination-flash').forEach(el => el.classList.remove('destination-flash'));
    clearTimeout(pulseTimer);
    const marker = target.querySelector('.section-header') || (id === 'overview' ? target.querySelector('h1') : target);
    void marker.offsetWidth;
    marker.classList.add('destination-flash');
    pulseTimer = setTimeout(() => marker.classList.remove('destination-flash'), 1800);
    if (target.matches('.paper,.project')) highlightItem(target);
    const focusTarget = target.querySelector('h2,h3,h1') || target;
    focusTarget.setAttribute('tabindex','-1');
    focusTarget.focus({preventScroll:true});
    target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block:'start'});
    if (updateHash && location.hash !== `#${id}`) history.pushState(null, '', `#${id}`);
  }
  navLinks.forEach(a => { a.lastChild.textContent = sectionLabels[a.dataset.section]; });
  document.addEventListener('click', e => {
    const link = e.target.closest('a[href^="#"]');
    if (!link || link.hasAttribute('data-related-paper')) return;
    const id = link.getAttribute('href').slice(1);
    if (!sectionLabels[id]) return;
    e.preventDefault();
    navigateTo(id);
  });
  window.addEventListener('hashchange', () => navigateTo(location.hash.slice(1) || 'overview', false));
  activate(location.hash.slice(1) || 'overview');
  let scrollPending = false;
  window.addEventListener('scroll', () => {
    if (Date.now() < navigationLock || mediaDialog.open) return;
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
      activate(sections[sections.length - 1].id);
      return;
    }
    if (scrollPending) return;
    scrollPending = true;
    requestAnimationFrame(() => {
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
        activate(sections[sections.length - 1].id);
        scrollPending = false;
        return;
      }
      const positions = sections.map(el => ({el, top:el.getBoundingClientRect().top}));
      const candidates = positions.filter(item => item.top <= 150).sort((a,b) => b.top-a.top);
      if (candidates.length) {
        // Preserve the selected column when Awards and Experience share a row.
        const tied = candidates.filter(item => Math.abs(item.top-candidates[0].top) < 4);
        activate(tied.find(item => item.el.id === activeSection)?.el.id || candidates[0].el.id);
      }
      scrollPending = false;
    });
  }, {passive:true});
  $('#copyright-year').textContent = new Date().getFullYear();
})();
