    // ── Shared state ──
    let THREE, OrbitControls;
    let geometry = null, visibleAttr = null, points = null, REPOS, COMMITS;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');

    // ── Fetch all content from JSON ──
    let CONTENT;
    try {
      [CONTENT, COMMITS] = await Promise.all([
        fetch('content.json').then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }),
        fetch('commits.json').then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      ]);
    } catch (err) {
      document.getElementById('loading').innerHTML = `<div style="max-width:400px;text-align:center;"><h2 style="color:var(--danger);margin-bottom:1rem;">System Offline</h2><p style="color:var(--fg-muted);margin-bottom:1.5rem;">Failed to load timeline data. Please verify your connection or visit the GitHub repositories directly.</p><a href="https://github.com/baruntayenjam" style="color:var(--accent-on);background:var(--accent);padding:8px 16px;text-decoration:none;font-weight:bold;border-radius:4px;">GitHub Profile →</a></div>`;
      document.getElementById('intro').classList.add('fade');
      throw err;
    }
    if (!Array.isArray(COMMITS) || !COMMITS.length) {
      document.getElementById('loading').textContent = 'no commits to show — timeline is empty';
      document.getElementById('intro').classList.add('fade');
      throw new Error('empty commit data');
    }
    if (!CONTENT || !CONTENT.person || !CONTENT.repos) {
      document.getElementById('loading').textContent = 'profile data incomplete — check content.json';
      document.getElementById('intro').classList.add('fade');
      throw new Error('invalid content data');
    }

    // ── Populate SEO meta from JSON ──
    document.title = `${CONTENT.person.name} // Chrononaut's Codex`;
    document.getElementById('meta-desc').setAttribute('content', CONTENT.seo.description);
    document.getElementById('meta-keywords').setAttribute('content', CONTENT.seo.keywords);
    document.getElementById('og-title').setAttribute('content', CONTENT.seo.ogTitle);
    document.getElementById('og-desc').setAttribute('content', CONTENT.seo.ogDescription);
    if (CONTENT.seo.ogImage) {
      document.getElementById('og-image').setAttribute('content', CONTENT.seo.ogImage);
      document.getElementById('tw-image').setAttribute('content', CONTENT.seo.ogImage);
    }
    document.getElementById('tw-title').setAttribute('content', CONTENT.seo.ogTitle);
    document.getElementById('tw-desc').setAttribute('content', CONTENT.seo.ogDescription);

    // ── Intro animation ──
    const introText = document.querySelector('.intro-text');
    const intro = document.getElementById('intro');
    const fullText = CONTENT.person.introLine || 'SHIPPING FASTER, REDUCING TOIL.';

    // Auto-typing effect
    let i = 0;
    const type = () => {
        if (i < fullText.length) {
            introText.textContent += fullText.charAt(i);
            i++;
            setTimeout(type, 50);
        } else {
            // Wait 1.5s then auto-dismiss
            setTimeout(() => intro.classList.add('fade'), 1500);
        }
    };
    type();
    // ── Populate Hero section ──
    document.getElementById('hero-name').textContent = CONTENT.person.name;
    document.getElementById('hero-title').textContent = CONTENT.person.title;
    if (CONTENT.person.headline) document.getElementById('hero-headline').textContent = CONTENT.person.headline;

    // ── Impact stats ──
    const statsEl = document.getElementById('impact-stats');
    (CONTENT.impactStats || []).forEach(s => {
      const d = document.createElement('div');
      d.className = 'stat';
      d.setAttribute('role', 'listitem');
      d.innerHTML = `<div class="v">${s.value}<small>${s.unit}</small></div><div class="l">${s.label}</div>`;
      statsEl.appendChild(d);
    });

    // ── CTA row — resume, blog ──
    const ctaRow = document.getElementById('cta-row');
    const resumeLabel = (CONTENT.cta && CONTENT.cta.secondaryLabel) || 'View resume';
    ctaRow.appendChild(Object.assign(document.createElement('button'), { className: 'ghost', textContent: resumeLabel }));
    if (CONTENT.links && CONTENT.links.blog) {
      ctaRow.appendChild(Object.assign(document.createElement('a'), { href: CONTENT.links.blog, target: '_blank', rel: 'noopener', className: 'blog', textContent: 'Tech Lead Notes →' }));
    }
    ctaRow.querySelector('button.ghost').addEventListener('click', () => { window.showResume(); if (window.trackContact) window.trackContact('resume_view'); });

    window.trackContact = function(method) {
      if (typeof gtag === 'function') gtag('event', 'contact_intent', { method });
    };

    // ── Skills tags ──
    const skillsBar = document.getElementById('skills-bar');
    CONTENT.skills.forEach(s => {
      const el = document.createElement('span');
      el.textContent = s.label;
      // Using computed styles for colors to support the variable system
      el.style.cssText = `font-size:0.6rem;font-family:monospace;padding:2px 8px;border:1px solid var(--border);border-radius:3px;`;
      el.style.color = s.category === 'ai' ? 'var(--accent)' : 'var(--support)';
      skillsBar.appendChild(el);
    });

    // ── Contact links ──
    const cl = document.getElementById('contact-links');
    if (CONTENT.links.github) cl.innerHTML += `<a href="${CONTENT.links.github}" target="_blank" rel="noopener" style="color:var(--fg-subtle);text-decoration:none;border:1px solid var(--border);padding:4px 10px;border-radius:3px;">github</a>`;
    if (CONTENT.links.linkedin) cl.innerHTML += `<a href="${CONTENT.links.linkedin}" target="_blank" rel="noopener" style="color:var(--fg-subtle);text-decoration:none;border:1px solid var(--border);padding:4px 10px;border-radius:3px;">linkedin</a>`;

    // ── Contact info ──
    if (CONTENT.contact) {
      if (CONTENT.contact.email) document.getElementById('contact-email').innerHTML = `<span style="color:var(--support);">email:</span> <a href="mailto:${CONTENT.contact.email}" style="color:var(--fg);text-decoration:none;">${CONTENT.contact.email}</a>`;
      if (CONTENT.contact.location) document.getElementById('contact-location').innerHTML = `<span style="color:var(--support);">location:</span> ${CONTENT.contact.location}`;
    }

    // ── Hide loading ──
    document.getElementById('loading').classList.add('hide');

    REPOS = CONTENT.repos;
    const repoOrder = Object.keys(REPOS);

    // ── Project panel ──
    function openProject(repo) {
      const meta = REPOS[repo] || { title: repo, desc: '', path: '', stack: [] };
      const repoCommits = COMMITS.filter(c => c.repo === repo);
      const totalAdd = repoCommits.reduce((s,c) => s + c.add, 0);
      const totalDel = repoCommits.reduce((s,c) => s + c.del, 0);
      const recent5 = repoCommits.slice(-5).reverse();

      document.getElementById('proj-title').textContent = meta.title;
      document.getElementById('proj-path').textContent = meta.path;
      document.getElementById('proj-desc').textContent = meta.desc;
      document.getElementById('proj-stack').textContent = (meta.stack || []).join(' · ');
      document.getElementById('proj-stats').innerHTML = `
        <div class="stat"><div class="v">${repoCommits.length}</div><div class="k">commits</div></div>
        <div class="stat"><div class="v">+${(totalAdd/1000).toFixed(1)}k</div><div class="k">added</div></div>
        <div class="stat"><div class="v">-${(totalDel/1000).toFixed(1)}k</div><div class="k">deleted</div></div>
      `;
      document.getElementById('proj-recent').innerHTML = recent5.map(c =>
        `<li>${c.date.slice(0,10)} — ${c.msg.slice(0,60)}</li>`
      ).join('');
      document.getElementById('proj-link').href = meta.url || `https://${meta.path}`;
      const panel = document.getElementById('project-panel');
      panel.classList.add('open');
      trapFocus(panel);

      document.querySelectorAll('#hud .repo-list span').forEach(s => {
        s.classList.toggle('hl', s.dataset.repo === repo);
      });
    }

    // ── Focus trap for open panels ──
    const trapFocus = (panel) => {
      const focusables = panel.querySelectorAll('a[href], button, [tabindex="0"], .close');
      if (!focusables.length) return;
      focusables[0].focus();
      const handler = e => {
        if (!panel.classList.contains('open')) {
          panel.removeEventListener('keydown', handler);
          return;
        }
        if (e.key !== 'Tab') return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      };
      panel.addEventListener('keydown', handler);
    };

    // ── ESC close both panels ──
    window.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
          document.getElementById('project-panel').classList.remove('open');
          document.getElementById('resume-panel').classList.remove('open');
        }
    });

    // ── Resume loader ──
    window.showResume = function() {
      const c = CONTENT;
      const vprops = (c.valueProps || []).map(v => `
        <div style="background:rgba(74,163,127,0.06);border:1px solid rgba(74,163,127,0.2);border-radius:5px;padding:0.8rem;margin-bottom:0.6rem">
          <div style="color:var(--accent);font-size:0.85rem;font-weight:bold;margin-bottom:0.3rem">${v.title}</div>
          <div style="color:var(--fg-muted);font-size:0.78rem;line-height:1.6">${v.desc}</div>
        </div>`).join('');
      const quotes = (c.testimonials || []).length ? `
        <h3 style="color:var(--accent);margin-top:2rem">What people say</h3>
        ${c.testimonials.map(t => `
          <blockquote style="border-left:2px solid rgba(240,166,60,0.5);margin:0 0 1rem;padding-left:0.9rem;color:var(--fg);font-size:0.82rem;line-height:1.7;font-style:italic">"${t.quote}"<br><span style="color:var(--fg-subtle);font-size:0.7rem;font-style:normal">— ${t.author}</span></blockquote>
        `).join('')}` : '';
      const dlBtn = (c.cta && c.cta.resumePdf) ? `<a href="${c.cta.resumePdf}" download style="display:inline-block;margin-top:1.5rem;color:var(--accent-on);background:var(--accent);font-family:monospace;font-size:0.78rem;text-decoration:none;padding:0.6rem 1.2rem;border-radius:4px;font-weight:bold">⬇ Download full résumé (PDF)</a>` : '';
      const html = `
        <h3 style="color:var(--accent)">What I deliver</h3>
        ${vprops}
        <h3 style="color:var(--accent);margin-top:2rem">Experience</h3>
        ${c.experience.map(e => `
          <div style="margin-bottom:1.5rem">
            <div style="font-weight:bold">${e.role} @ ${e.company}</div>
            <div style="font-size:0.7rem;color:var(--fg-subtle);margin-bottom:0.4rem">${e.period}</div>
            <ul style="font-size:0.8rem;padding-left:1.2rem;color:var(--fg-muted);line-height:1.7">${e.achievements.map(a => `<li>${a}</li>`).join('')}</ul>
          </div>
        `).join('')}
        ${quotes}
        <h3 style="color:var(--accent);margin-top:2rem">Education</h3>
        ${c.education.map(e => `
          <div style="margin-bottom:1rem">
            <div style="font-size:0.85rem">${e.degree}</div>
            <div style="font-size:0.7rem;color:var(--fg-subtle)">${e.institution} · ${e.year}</div>
          </div>
        `).join('')}
        ${dlBtn}
      `;
      document.getElementById('resume-content').innerHTML = html;
      document.getElementById('resume-panel').classList.add('open');
    }

    // ── HUD repo list + mobile legend (data-only, no 3D needed) ──
    const hudList = document.getElementById('repo-list');
    const mobileLegend = document.getElementById('mobile-legend');
    const repoCounts = {};
    COMMITS.forEach(c => repoCounts[c.repo] = (repoCounts[c.repo]||0) + 1);
    Object.entries(repoCounts).sort((a,b) => b[1]-a[1]).forEach(([repo, count]) => {
      // Desktop HUD
      const el = document.createElement('span');
      el.textContent = `${REPOS[repo]?.title || repo} · ${count}`;
      el.dataset.repo = repo;
      el.setAttribute('role', 'button');
      el.setAttribute('tabindex', '0');
      el.addEventListener('click', () => openProject(repo));
      el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openProject(repo); } });
      hudList.appendChild(el);
      // Mobile Legend
      const mob = document.createElement('div');
      mob.textContent = `${REPOS[repo]?.title || repo}`;
      mob.style.padding = '2px 0';
      mob.addEventListener('click', () => openProject(repo));
      mobileLegend.appendChild(mob);
    });
    // Show legend on touch devices
    if ('ontouchstart' in window) mobileLegend.style.display = 'block';

    document.getElementById('visible-count').textContent = COMMITS.length;

    // ── Time slider (no-ops when 3D skipped) ──
    const slider = document.getElementById('time-slider');
    let dateMin = null, dateMax = null;
    slider.addEventListener('input', e => {
      if (!geometry || !visibleAttr) return;
      const timeFilter = parseFloat(e.target.value) / 100;
      const cutoff = dateMin + (dateMax - dateMin) * timeFilter;
      let vis = 0;
      for (let j = 0; j < COMMITS.length; j++) {
        const commitDate = new Date(COMMITS[j].date).getTime();
        const isVisible = commitDate <= cutoff ? 1 : 0;
        visibleAttr[j] = isVisible;
        vis += isVisible;
      }
      geometry.attributes.visible.needsUpdate = true;
      document.getElementById('visible-count').textContent = vis;
      document.getElementById('time-val').textContent = timeFilter < 0.99 ? new Date(cutoff).toISOString().slice(0,7) : 'all time';
    });

    // ── Three.js galaxy — dynamically imported only when motion is allowed ──
    if (!prefersReduced.matches) {
      try {
        THREE = await import('./vendor/three.module.js');
        ({ OrbitControls } = await import('./vendor/OrbitControls.js'));
      } catch (err) {
        console.error('3D module load failed:', err);
      }
    }

    if (THREE && OrbitControls) {
      const supportColor = getComputedStyle(document.documentElement).getPropertyValue('--support').trim();
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 2000);
      const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
      renderer.setSize(window.innerWidth, window.innerHeight);
      document.getElementById('canvas-container').appendChild(renderer.domElement);
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      camera.position.set(0, 30, 120);

      const repoClusters = {};
      repoOrder.forEach((r,idx) => repoClusters[r] = idx);

      // Shader
      const material = new THREE.ShaderMaterial({
          uniforms: { time: { value: 0 }, uPixelRatio: { value: window.devicePixelRatio } },
          vertexShader: `
              attribute float size;
              attribute float visible;
              varying vec3 vColor;
              varying float vVisible;
              void main() {
                  vColor = color;
                  vVisible = visible;
                  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                  gl_PointSize = size * (300.0 / -mvPosition.z);
                  gl_Position = projectionMatrix * mvPosition;
              }
          `,
          fragmentShader: `
              uniform float time;
              varying vec3 vColor;
              varying float vVisible;
              void main() {
                  if (vVisible < 0.5) discard;
                  float r = distance(gl_PointCoord, vec2(0.5));
                  if (r > 0.5) discard;
                  float glow = 1.0 - (r * 2.0);
                  float twinkle = 0.7 + 0.3 * sin(time * 2.0 + gl_FragCoord.x * 0.01);
                  gl_FragColor = vec4(vColor * twinkle, glow);
              }
          `,
          transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, vertexColors: true
      });

      const N = COMMITS.length;
      const positions = new Float32Array(N * 3);
      const colors = new Float32Array(N * 3);
      const sizes = new Float32Array(N);
      visibleAttr = new Float32Array(N);

      COMMITS.sort((a,b) => a.date < b.date ? -1 : a.date > b.date ? 1 : 0);

      const dates = COMMITS.map(c => new Date(c.date).getTime()).sort((a,b) => a-b);
      dateMin = dates[0];
      dateMax = dates[dates.length-1];
      document.getElementById('time-min').textContent = new Date(dateMin).getFullYear();
      document.getElementById('time-max').textContent = new Date(dateMax).getFullYear();

      COMMITS.forEach((c, idx) => {
          const cluster = repoClusters[c.repo] ?? 0;
          const angle = (cluster / repoOrder.length) * Math.PI * 2;
          const radius = 50;
          positions[idx*3]   = Math.cos(angle) * radius + (Math.random() - 0.5) * 15;
          positions[idx*3+1] = Math.sin(angle) * radius + (Math.random() - 0.5) * 15;
          positions[idx*3+2] = ((new Date(c.date).getTime() - dateMin) / (dateMax - dateMin) - 0.5) * 200;

          const hex = REPOS[c.repo]?.color || supportColor;
          const col = new THREE.Color(hex);
          colors[idx*3] = col.r; colors[idx*3+1] = col.g; colors[idx*3+2] = col.b;
          sizes[idx] = 2.0 + Math.log(c.add + 1) * 0.8;
          visibleAttr[idx] = 1.0;
      });

      geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
      geometry.setAttribute('visible', new THREE.BufferAttribute(visibleAttr, 1));
      points = new THREE.Points(geometry, material);
      scene.add(points);

      // ── Hover + click ──
      const raycaster = new THREE.Raycaster();
      raycaster.params.Points.threshold = 1.5;
      const mouse = new THREE.Vector2();
      let hoveredIndex = -1;

      const pickAt = (x, y) => {
          mouse.x = (x / window.innerWidth) * 2 - 1;
          mouse.y = -(y / window.innerHeight) * 2 + 1;
          raycaster.setFromCamera(mouse, camera);
          const hits = raycaster.intersectObject(points);
          if (hits.length > 0 && visibleAttr[hits[0].index] > 0.5) return hits[0].index;
          return -1;
      };
      const tooltip = document.getElementById('tooltip');

      window.addEventListener('mousemove', e => {
          // Prevent hover logic when over UI components
          if (e.target.closest('#overlay') || e.target.closest('.project-panel') || e.target.closest('#hud')) {
              tooltip.style.opacity = 0;
              return;
          }
          const idx = pickAt(e.clientX, e.clientY);
          if (idx !== hoveredIndex) {
              hoveredIndex = idx;
              if (idx >= 0) {
                  const c = COMMITS[idx];
                  tooltip.innerHTML = `<span style="color:${REPOS[c.repo]?.color || supportColor}">${REPOS[c.repo]?.title || c.repo}</span><br>${c.date}<br><span style="color:var(--fg)">${c.msg}</span>`;
              }
          }
          if (idx >= 0) {
              tooltip.style.opacity = 1;
              tooltip.style.left = e.clientX + 15 + 'px';
              tooltip.style.top = e.clientY + 15 + 'px';
          } else {
              tooltip.style.opacity = 0;
          }
      });

      // Tap on touch devices (no hover) → open the project panel directly
      window.addEventListener('touchstart', e => {
          if (e.touches.length !== 1) return;
          const idx = pickAt(e.touches[0].clientX, e.touches[0].clientY);
          if (idx >= 0) {
              e.preventDefault();
              openProject(COMMITS[idx].repo);
          }
      }, { passive: false });

      window.addEventListener('click', e => {
        if (e.target.closest('.project-panel') || e.target.closest('#overlay') || e.target.closest('#hud') || e.target.closest('#time-slider-wrap') || e.target.closest('#mobile-legend') || e.target.closest('#contact-links')) return;
        if (hoveredIndex >= 0) {
          openProject(COMMITS[hoveredIndex].repo);
          hoveredIndex = -1;
        }
      });

      function animate(t) {
          requestAnimationFrame(animate);
          material.uniforms.time.value = t * 0.001;
          points.rotation.y += 0.0005;
          controls.update();
          renderer.render(scene, camera);
      }
      animate();
    } else {
      // Reduced motion: static view, hide interactive 3D affordances
      document.getElementById('time-slider-wrap').style.display = 'none';
      document.getElementById('tooltip').style.display = 'none';
    }
