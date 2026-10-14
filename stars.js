(() => {
  'use strict';
  const freshness = 15 * 60 * 1000;
  const valid = value => value && Number.isSafeInteger(value.count) && value.count >= 0 && Number.isFinite(Date.parse(value.fetchedAt)) && Date.parse(value.fetchedAt) <= Date.now() + 60000;
  const projects = window.SITE_CONTENT.projects;
  const state = new Map();
  const storageKey = repo => `xg:github-stars:v1:${repo}`;

  function render(project, value, status) {
    const el = document.querySelector(`[data-stars="${project.id}"]`);
    if (!el || !valid(value)) return;
    const number = value.count.toLocaleString('en-US');
    const date = new Date(value.fetchedAt);
    el.querySelector('.star-value').textContent = `☆ ${number}`;
    el.querySelector('.star-status').textContent = status === 'fresh' ? 'GitHub stars' : `Saved · ${date.toLocaleDateString('en-GB', {day:'numeric', month:'short'})}`;
    el.dataset.status = status;
    el.title = `${number} GitHub stars · checked ${date.toLocaleString()}`;
    el.setAttribute('aria-label', el.title + (status === 'saved' ? ' · saved count; refresh unavailable' : ''));
  }

  async function refresh(project) {
    const repo = new URL(project.repo).pathname.slice(1).replace(/\/$/, '');
    let record = state.get(repo);
    if (!record) {
      let cached;
      try { cached = JSON.parse(localStorage.getItem(storageKey(repo))); } catch {}
      record = {value: valid(cached) ? cached : project.starsSnapshot, fetched: valid(cached), busy:false, nextAttempt:0};
      state.set(repo, record);
    }
    const isFresh = record.fetched && Date.now() - Date.parse(record.value.fetchedAt) < freshness;
    render(project, record.value, isFresh ? 'fresh' : 'saved');
    if (record.busy || isFresh || Date.now() < record.nextAttempt) return;
    record.busy = true;
    record.nextAttempt = Date.now() + freshness;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    try {
      const response = await fetch(`https://api.github.com/repos/${repo}`, {headers:{Accept:'application/vnd.github+json'}, signal:controller.signal, credentials:'omit'});
      if (!response.ok) throw new Error('GitHub unavailable');
      const result = await response.json();
      const value = {count:result.stargazers_count, fetchedAt:new Date().toISOString()};
      if (!valid(value)) throw new Error('Invalid star count');
      record.value = value;
      record.fetched = true;
      render(project, value, 'fresh');
      try { localStorage.setItem(storageKey(repo), JSON.stringify(value)); } catch {}
    } catch {
      render(project, record.value, 'saved');
    } finally {
      clearTimeout(timeout);
      record.busy = false;
    }
  }

  const refreshAll = () => { if (!document.hidden) projects.forEach(refresh); };
  refreshAll();
  document.addEventListener('visibilitychange', refreshAll);
  window.addEventListener('online', refreshAll);
  setInterval(refreshAll, freshness);
})();
