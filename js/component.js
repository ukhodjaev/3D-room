// Sahna mantiqi (terminal, quvvat, kamera, telefon paroli, VR olami)
class Component extends DCLogic {
  constructor(...args) {
    super(...args);
    this.PARTS = {
      monitor: { cat: 'Displey', name: "34″ ultrawide monitor", tip: 'Monitor', desc: "Kompyuter qulflangan: Windows parol so'raydi.", specs: [['Diagonal', '34″ · 21:9'], ['Egrilik', '1500R'], ['Ruxsat', '3440 × 1440'], ['Chastota', '144 Hz']] },
      pc: { cat: 'Tizim bloki', name: "O'yin kompyuteri", tip: "O'yin kompyuteri", desc: "Shisha panelli korpus: suyuq sovutish, uch ventilyatorli videokarta va RGB xotira. Yuqoridagi quvvat tugmasi ishlaydi.", specs: [['Korpus', 'Mid-tower, shisha'], ['Sovutish', '240 mm AIO'], ['Ventilyator', '7 × 120 mm RGB'], ['Videokarta', '3 fan · 2.5 slot']] },
      keyboard: { cat: 'Kiritish', name: 'Mexanik klaviatura', tip: 'Klaviatura', desc: "To'liq o'lchamli, oq PBT qopqoqli. Tugmalarni bosing — matn monitorga yoziladi. Haqiqiy klaviaturangiz ham ishlaydi.", specs: [['Tugmalar', '104'], ['Qopqoqlar', 'Oq PBT'], ['Yoritish', 'RGB pastki nur']] },
      mouse: { cat: 'Boshqaruv', name: "O'yin sichqonchasi", tip: 'Sichqoncha', desc: "Chap tugmasi ekran manzarasini almashtiradi, o'ng tugmasi yozilgan matnni tozalaydi.", specs: [['Shakl', 'Ergonomik'], ['Tugmalar', "2 + g'ildirak"], ['Yoritish', 'RGB']] },
      deck: { cat: 'Boshqaruv', name: 'Stream-pult', tip: 'Stream-pult', desc: "15 ta ekranli tugma. Birinchi qatordagilar: musiqa, neon yorug'lik, manzara, tozalash va quvvat.", specs: [['Tugmalar', '15 LCD'], ['Faol amallar', '5']] },
      vr: { cat: 'Aksessuar', name: 'VR shlem', tip: 'VR shlem', desc: "Virtual reallik shlemi: ikki linza, yumshoq yuz yostiqchasi va sozlanadigan tasmalar.", specs: [['Linzalar', '2 × asferik'], ['Kuzatish', '4 ichki kamera'], ['Tasma', 'Sozlanadigan']] },
      plant: { cat: 'Dekor', name: 'Sansevieriya', tip: "O'simlik", desc: "Kam parvarish talab qiladigan xona o'simligi — stolga jonli rang qo'shadi.", specs: [['Tuvak', 'Sirlangan keramika'], ["Sug'orish", '2–3 haftada bir']] },
      painting: { cat: 'Dekor', name: 'Devordagi rasm', tip: 'Rasm', desc: '', specs: [] },
      sign: { cat: 'Dekor', name: 'Neon yozuv', tip: 'Neon · Umar', desc: '', specs: [] },
      clouds: { cat: 'Dekor', name: 'Bulut chiroqlar', tip: 'Bulut chiroqlar', desc: '', specs: [] },
      phone: { cat: 'Aksessuar', name: 'iPhone 18 Pro Max', tip: 'iPhone 18 Pro Max', desc: '', specs: [] },
      arcade: { cat: 'Dekor', name: 'Mini arkada', tip: 'Mini arkada', desc: "Stol ustidagi kichik retro avtomat. Ekrani kompyuter bilan birga yonadi.", specs: [['Uslub', 'Retro, 1980-yillar']] },
    };
    this.VIEWS = [['overview', 'Umumiy'], ['pc', 'Kompyuter'], ['monitor', 'Monitor'], ['desk', 'Aksessuarlar']];
    this.RGB_CYCLE = ['#8fd4ff', '#ff4fd8', '#7dff8a', '#ffb347'];
    this.state = { focus: 'overview', hover: null, camera: 'off', camMsg: '', sys: 'on', lines: this.welcome(), input: '', rgbOn: true, power: true, theme: 0, music: false, lamp: true, caps: false, rgb: null, ready: false, curtain: true, failed: false, failMsg: '', vr: false, vrFade: false, vrHover: null, vrMsg: '' };
    this.api = null; this.canvas = null; this.root = null; this.tip = null;
    this.setCanvas = (el) => { if (el === this.canvas) return; this.canvas = el; if (el) this.boot(); else this.teardown(); };
    this.setRoot = (el) => { this.root = el; };
    this.setVideo = (el) => { this.video = el; if (this.api && this.api.setVideo) this.api.setVideo(el); };
    this.setTip = (el) => { this.tip = el; };
  }

  // ---------- lifecycle ----------
  boot() {
    if (this.api || !this.canvas) return;
    if (!window.Setup3D) {
      this.tries = (this.tries || 0) + 1;
      if (this.tries > 200) { this.fail("3D dvigatel fayli yuklanmadi. Internet aloqasini tekshirib, qayta urinib ko'ring."); return; }
      this.bootTimer = setTimeout(() => this.boot(), 100);
      return;
    }
    if (window.Setup3D.supported && !window.Setup3D.supported()) { this.fail("Brauzeringiz WebGL 2 ni qo'llab-quvvatlamaydi. Chrome, Edge, Firefox yoki Safari'ning yangi versiyasini ishlating."); return; }
    try {
      this.api = window.Setup3D.create(this.canvas, {
        onPick: (part, d) => this.onPick(part, d || {}),
        onHover: (part, x, y, sub) => this.onHover(part, x, y, sub),
        onAnyDown: () => this.focusRoot(),
        onDrop: (k, what) => { this.tone((what === 'keyboard' ? 70 : what === 'vr' ? 80 : 90) + k * 40, 0.12, 'sine', 0.05 + k * 0.12); this.tone(1200, 0.02, 'square', 0.01 * k); },
        onMonitorWrong: () => { this.tone(220, 0.12, 'sine', 0.05); setTimeout(() => this.tone(165, 0.22, 'sine', 0.05), 130); },
        onPhoneTap: () => this.tone(1500, 0.03, 'sine', 0.03),
        onPhoneWrong: () => { this.tone(180, 0.16, 'square', 0.035); setTimeout(() => this.tone(150, 0.2, 'square', 0.035), 170); },
        onVrLink: (k) => this.openLink(k),
        onVrHover: (k) => { if (k !== this.state.vrHover) this.setState({ vrHover: k }); if (k) this.tone(880, 0.05, 'sine', 0.02); },
        onStats: (st) => { if (this.props.showFps ?? true) this.setState({ stats: st }); },
        onReady: () => { this.setState({ ready: true }); this.focusRoot(); this.curtainTimer = setTimeout(() => this.setState({ curtain: false }), 650); },
      });
      if (this.api.setVideo) this.api.setVideo(this.video);
      if (this.api.setPainting) this.api.setPainting('assets/painting.jpg');
      if (this.api.setPhoto) this.api.setPhoto('assets/phone_photo.jpg');
      if (this.api.setVrPhoto) this.api.setVrPhoto('assets/vr_photo.jpg');
      if (this.api.redrawNeon && document.fonts && document.fonts.load) document.fonts.load('400 120px "Neonderthaw"').then(() => this.api && this.api.redrawNeon()).catch(() => {});
      this.api.update(this.sceneState());
    } catch (e) {
      this.fail('Grafik kontekstni yaratib bo‘lmadi. Boshqa brauzerda yoki apparat tezlashtirish yoqilgan holda urinib ko‘ring.');
    }
  }
  fail(msg) { this.setState({ failed: true, failMsg: msg, curtain: true, ready: false }); }
  teardown() {
    clearTimeout(this.bootTimer); clearTimeout(this.curtainTimer); (this.vrTimers || []).forEach(clearTimeout);
    if (this.api) { try { this.api.dispose(); } catch (e) {} this.api = null; }
  }
  retry() {
    if (!window.Setup3D) { try { window.location.reload(); } catch (e) {} return; }
    this.teardown(); this.tries = 0;
    this.setState({ failed: false, failMsg: '', curtain: true, ready: false }, () => this.boot());
  }
  componentWillUnmount() { this.teardown(); this.stopMusic(); clearTimeout(this.sysTimer); this.stopCamera(); }

  sceneState() {
    const s = this.state;
    return { camera: s.camera, camMsg: s.camMsg, power: s.power, sys: s.sys, lines: s.lines.slice(-80), input: s.input, rgbOn: s.rgbOn, theme: s.theme, music: s.music, lamp: s.lamp, focus: s.focus, accent: this.props.accent ?? '#3ee0c5', rgb: s.rgb || (this.props.rgb ?? '#8fd4ff') };
  }
  componentDidUpdate(prevProps, prev) {
    if (!this.api) return;
    const s = this.state;
    if (prev.focus !== s.focus) this.api.focus(s.focus);
    if (prev.focus !== s.focus || prev.power !== s.power || prev.theme !== s.theme || prev.sys !== s.sys || prev.camera !== s.camera || prev.camMsg !== s.camMsg || prev.lines !== s.lines || prev.input !== s.input || prev.rgbOn !== s.rgbOn || prev.music !== s.music || prev.lamp !== s.lamp || prev.rgb !== s.rgb || prevProps.accent !== this.props.accent || prevProps.rgb !== this.props.rgb) {
      this.api.update(this.sceneState());
    }
  }

  // ---------- hover tooltip (position written straight to the element; state only changes with the part) ----------
  onHover(part, x, y, sub) {
    sub = sub || null;
    if (part !== this.state.hover || sub !== this.state.hoverSub) this.setState({ hover: part, hoverSub: sub });
    if (this.tip && part) {
      const w = this.root ? this.root.clientWidth : 9999;
      const tx = Math.min(x + 14, w - 180);
      this.tip.style.transform = 'translate(' + Math.round(tx) + 'px,' + Math.round(y + 16) + 'px)';
    }
  }

  // ---------- audio ----------
  ctx() {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      if (!this.ac) this.ac = new AC();
      if (this.ac.state === 'suspended') this.ac.resume();
      return this.ac;
    } catch (e) { return null; }
  }
  tone(freq, dur, type, vol) {
    const ac = this.ctx(); if (!ac) return;
    const t = ac.currentTime, o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + dur + 0.02);
  }
  click() { this.tone(2400, 0.025, 'square', 0.018); this.tone(140, 0.04, 'sine', 0.04); }
  startMusic() {
    if (!this.ctx()) return;
    const notes = [220, 277.18, 329.63, 440, 392, 329.63, 277.18, 329.63]; let i = 0;
    this.stopMusic();
    this.musicTimer = setInterval(() => { this.tone(notes[i % notes.length], 0.34, 'triangle', 0.07); if (i % 2 === 0) this.tone(55, 0.22, 'sine', 0.2); i++; }, 230);
  }
  stopMusic() { if (this.musicTimer) { clearInterval(this.musicTimer); this.musicTimer = null; } }

  // ---------- actions ----------
  focusTo(name) { this.setState({ focus: name }); }
  // ---------- power: boot / shutdown sequence ----------
  welcome() { return [{ t: 'Windows PowerShell' }, { t: "Buyruqlar ro'yxati uchun help yozing.", c: '#8a8a96' }, { t: '' }]; }
  togglePower() {
    clearTimeout(this.sysTimer);
    const s = this.state;
    if (s.power && s.sys !== 'shutting') {
      if (s.music) { this.stopMusic(); this.setState({ music: false }); }
      if (s.camera !== 'off') { this.stopCamera(); this.setState({ camera: 'off', camMsg: '' }); }
      this.tone(330, 0.18, 'sine', 0.07);
      this.setState({ sys: 'shutting' });
      this.sysTimer = setTimeout(() => this.setState({ power: false, sys: 'off', input: '' }), 1400);
    } else if (!s.power) {
      this.tone(660, 0.18, 'sine', 0.07);
      this.setState({ power: true, sys: 'booting' });
      this.sysTimer = setTimeout(() => this.setState({ sys: 'on', lines: this.welcome(), input: '' }), 2600);
    }
  }
  restart() {
    clearTimeout(this.sysTimer);
    this.setState({ sys: 'shutting' });
    this.sysTimer = setTimeout(() => { this.setState({ sys: 'booting' }); this.sysTimer = setTimeout(() => this.setState({ sys: 'on', lines: this.welcome(), input: '' }), 2400); }, 1200);
  }
  // ---------- real device camera (webcam click) ----------
  async toggleCamera() {
    if (this.state.camera === 'on' || this.state.camera === 'error' || this.state.camera === 'pending') { this.stopCamera(); this.setState({ camera: 'off', camMsg: '' }); return; }
    if (!this.state.power || this.state.sys !== 'on') return;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { this.setState({ camera: 'error', camMsg: "Bu brauzer kamerani qo'llab-quvvatlamaydi" }); return; }
    this.setState({ camera: 'pending', camMsg: '' });
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' }, audio: false });
      if (this.state.camera !== 'pending') { stream.getTracks().forEach((t) => t.stop()); return; }
      this.stream = stream;
      if (this.video) { this.video.srcObject = stream; try { await this.video.play(); } catch (e) {} }
      this.setState({ camera: 'on' });
    } catch (e) {
      const n = e && e.name;
      const msg = n === 'NotAllowedError' || n === 'SecurityError' ? "Kameraga ruxsat berilmadi (yoki bu sahifada bloklangan)" : n === 'NotFoundError' || n === 'OverconstrainedError' ? 'Kamera topilmadi' : n === 'NotReadableError' ? "Kamera boshqa dastur tomonidan band" : "Kamerani ochib bo'lmadi";
      this.setState({ camera: 'error', camMsg: msg });
    }
  }
  stopCamera() {
    if (this.stream) { this.stream.getTracks().forEach((t) => t.stop()); this.stream = null; }
    if (this.video) { try { this.video.srcObject = null; } catch (e) {} }
  }
  toggleRgb() { this.click(); this.setState({ rgbOn: !this.state.rgbOn }); }
  toggleMusic() { const music = !this.state.music; if (music) this.startMusic(); else this.stopMusic(); this.setState({ music }); }
  toggleLamp() { this.click(); this.setState({ lamp: !this.state.lamp }); }
  nextTheme() { this.click(); this.setState({ theme: (this.state.theme + 1) % 3 }); }
  clearText() { this.click(); this.setState({ lines: [], input: '' }); }
  nextRgb() {
    const cur = this.state.rgb || (this.props.rgb ?? '#8fd4ff');
    const i = this.RGB_CYCLE.indexOf(cur);
    this.click(); this.setState({ rgb: this.RGB_CYCLE[(i + 1) % this.RGB_CYCLE.length] });
  }
  // mechanical switch sound: click (filtered noise) + thock (body resonance) + bottom-out
  mechKey(id) {
    const ac = this.ctx(); if (!ac) return;
    if (!this.noiseBuf || this.noiseBuf.sampleRate !== ac.sampleRate) {
      const n = Math.floor(ac.sampleRate * 0.12), b = ac.createBuffer(1, n, ac.sampleRate), d = b.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
      this.noiseBuf = b;
    }
    const big = id === 'SP' || id === 'EN' || id === 'NEN' || id === 'BS' || id === 'LSHIFT' || id === 'CAPS';
    const t = ac.currentTime, jit = 0.9 + Math.random() * 0.2;
    const out = ac.createGain(); out.gain.value = big ? 0.9 : 0.75; out.connect(ac.destination);
    const burst = (at, dur, freq, q, vol) => {
      const src = ac.createBufferSource(); src.buffer = this.noiseBuf;
      const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq * jit; f.Q.value = q;
      const g = ac.createGain(); g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(vol, at + 0.0015); g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
      src.connect(f); f.connect(g); g.connect(out); src.start(at, Math.random() * 0.05); src.stop(at + dur + 0.01);
    };
    const thock = (at, freq, dur, vol) => {
      const o = ac.createOscillator(), g = ac.createGain(); o.type = 'sine';
      o.frequency.setValueAtTime(freq * jit * 1.6, at); o.frequency.exponentialRampToValueAtTime(freq * jit, at + 0.02);
      g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(vol, at + 0.002); g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
      o.connect(g); g.connect(out); o.start(at); o.stop(at + dur + 0.01);
    };
    burst(t, 0.012, 4200, 1.2, 0.22);                    // switch click
    burst(t + 0.006, 0.035, big ? 900 : 1600, 0.9, 0.16); // keycap clack
    thock(t + 0.006, big ? 120 : 190, big ? 0.09 : 0.06, big ? 0.32 : 0.22); // case thock
    if (big) burst(t + 0.018, 0.03, 2600, 2, 0.08);      // stabilizer rattle
    burst(t + 0.07 + Math.random() * 0.02, 0.018, 3000, 1.5, 0.07); // key release
  }
  typeKey(id, ch) {
    if (this.api) this.api.pressKey(id);
    this.mechKey(id);
    if (id === 'CAPS') { this.setState({ caps: !this.state.caps }); return; }
    if (!this.state.power || this.state.sys !== 'on') return;
    // the monitor shows a locked Windows sign-in screen: typing goes into its password box
    if (this.api && this.api.monitorKey) {
      const c = ch != null ? (this.state.caps && /^[a-z]$/.test(ch) ? ch.toUpperCase() : ch) : (id.length === 1 ? (this.state.caps ? id.toUpperCase() : id.toLowerCase()) : null);
      this.api.monitorKey(id, c);
      return;
    }
    let input = this.state.input;
    if (id === 'EN' || id === 'NEN' || id === 'NEN2') { this.runCommand(input); return; }
    if (id === 'BS') input = input.slice(0, -1);
    else if (id === 'SP') input = input + ' ';
    else if (id === 'TAB') return;
    else if (ch != null) input = input + (this.state.caps && /^[a-z]$/.test(ch) ? ch.toUpperCase() : ch);
    else if (id.length === 1) input = input + (this.state.caps ? id.toUpperCase() : id.toLowerCase());
    else return;
    this.setState({ input: input.slice(0, 120) });
  }

  // ---------- terminal commands ----------
  runCommand(raw) {
    const cmdLine = raw.trim();
    const out = [{ t: 'PS C:\\Users\\Setap> ' + raw }];
    const say = (t, c) => out.push(c ? { t, c } : { t });
    const parts = cmdLine.split(/\s+/); const cmd = (parts[0] || '').toLowerCase(); const arg = cmdLine.slice(parts[0] ? parts[0].length : 0).trim();
    const d = new Date(), pad = (n) => String(n).padStart(2, '0');
    let after = null, lines = this.state.lines;
    if (!cmd) { /* empty line */ }
    else if (cmd === 'cls' || cmd === 'clear') { this.setState({ lines: [], input: '' }); return; }
    else if (cmd === 'help') {
      [['help', "buyruqlar ro'yxati"], ['cls', 'ekranni tozalash'], ['dir', "fayllar ro'yxati"], ['echo <matn>', 'matnni chiqarish'], ['date / time', 'sana va vaqt'], ['whoami', 'foydalanuvchi'], ['sysinfo', 'kompyuter haqida'], ['ver', 'tizim versiyasi'], ['camera', 'kamerani ochish/yopish'], ['rgb', "RGB chiroqlarni yoqish/o'chirish"], ['neon', "xona neonini yoqish/o'chirish"], ['music', 'musiqa'], ['theme', 'fon rasmini almashtirish'], ['restart', 'qayta ishga tushirish'], ['shutdown', "kompyuterni o'chirish"]]
        .forEach((h) => say('  ' + h[0].padEnd(14) + h[1]));
    }
    else if (cmd === 'dir' || cmd === 'ls') {
      say(''); say('    Directory: C:\\Users\\Setap', '#8a8a96'); say('');
      say('Mode     LastWriteTime        Length  Name', '#5fd7ff'); say('----     -------------        ------  ----', '#5fd7ff');
      const dt = pad(d.getDate()) + '.' + pad(d.getMonth() + 1) + '.' + d.getFullYear();
      [['d-----', 'Desktop'], ['d-----', 'Documents'], ['d-----', 'Downloads'], ['d-----', 'Games'], ['-a----', 'notes.txt', '1 KB']].forEach((f) => say(f[0] + '   ' + dt + ' 09:41   ' + (f[2] || '').padStart(6) + '  ' + f[1]));
      say('');
    }
    else if (cmd === 'echo') say(arg);
    else if (cmd === 'date') say(pad(d.getDate()) + '.' + pad(d.getMonth() + 1) + '.' + d.getFullYear());
    else if (cmd === 'time') say(pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds()));
    else if (cmd === 'whoami') say('setap-pc\\setap');
    else if (cmd === 'ver' || cmd === 'winver') say('Windows 11 (simulyatsiya) — Setap/3D');
    else if (cmd === 'sysinfo' || cmd === 'systeminfo') {
      [['OS', 'Windows 11 (simulyatsiya)'], ['Protsessor', '8 yadroli, suyuq sovutish'], ['Videokarta', '3 ventilyatorli, 2.5 slot'], ['Xotira', '4 × RGB modul'], ['Monitor', '34″ 3440×1440, 144 Hz'], ['RGB', this.state.rgbOn ? 'yoqilgan' : "o'chiq"]].forEach((r) => say(r[0].padEnd(12) + ': ' + r[1]));
    }
    else if (cmd === 'camera' || cmd === 'kamera') { after = () => this.toggleCamera(); say(this.state.camera === 'on' ? 'Kamera yopildi.' : 'Kamera ochilmoqda…', '#7dff8a'); }
    else if (cmd === 'rgb') { after = () => this.toggleRgb(); say('RGB chiroqlar ' + (this.state.rgbOn ? "o'chirildi" : 'yoqildi') + '.', '#7dff8a'); }
    else if (cmd === 'neon') { after = () => this.toggleLamp(); say('Neon ' + (this.state.lamp ? "o'chirildi" : 'yoqildi') + '.', '#7dff8a'); }
    else if (cmd === 'music') { after = () => this.toggleMusic(); say('Musiqa ' + (this.state.music ? "to'xtatildi" : 'yoqildi') + '.', '#7dff8a'); }
    else if (cmd === 'theme' || cmd === 'color') { after = () => this.nextTheme(); say('Fon rasmi almashtirildi.', '#7dff8a'); }
    else if (cmd === 'shutdown' || cmd === 'exit') { say("Kompyuter o'chirilmoqda…", '#f2c94c'); this.sysTimer = setTimeout(() => this.togglePower(), 500); }
    else if (cmd === 'restart' || cmd === 'reboot') { say('Qayta ishga tushirilmoqda…', '#f2c94c'); setTimeout(() => this.restart(), 500); }
    else say(parts[0] + " : '" + parts[0] + "' buyrug'i topilmadi. help yozing.", '#ff6b6b');
    this.setState({ lines: lines.concat(out).slice(-200), input: '' });
    if (after) after();
  }
  // ---------- VR world ----------
  vrLater(fn, ms) { (this.vrTimers = this.vrTimers || []).push(setTimeout(fn, ms)); }
  enterVr() {
    if (this.state.vr || this.state.vrFade || !this.api || !this.api.enterVR) return;
    this.tone(220, 0.5, 'sine', 0.05); this.tone(330, 0.7, 'sine', 0.035);
    this.setState({ focus: 'vr' });
    this.vrLater(() => this.setState({ vrFade: true }), 650);
    this.vrLater(() => {
      this.api.enterVR();
      this.setState({ vr: true, hover: null, hoverSub: null });
      this.tone(110, 1.4, 'sine', 0.08); this.tone(440, 1.2, 'triangle', 0.025); this.tone(660, 1.6, 'sine', 0.02);
      this.vrLater(() => this.setState({ vrFade: false }), 120);
    }, 1250);
  }
  exitVr() {
    if (!this.state.vr || this.state.vrFade) return;
    this.tone(330, 0.35, 'sine', 0.04);
    this.setState({ vrFade: true });
    this.vrLater(() => {
      if (this.api && this.api.exitVR) this.api.exitVR();
      this.setState({ vr: false, vrHover: null, vrMsg: '', focus: 'overview' });
      this.vrLater(() => this.setState({ vrFade: false }), 150);
    }, 600);
  }
  linkUrl(k) {
    const raw = String(this.props[k] ?? '').trim();
    if (!raw) return '';
    if (k === 'phone') { const d = raw.replace(/[^\d+]/g, ''); return d ? 'tel:' + d : ''; }
    if (/^https?:\/\//i.test(raw)) return raw;
    const h = raw.replace(/^@/, '').replace(/^(www\.)?(instagram\.com|t\.me)\//i, '');
    return k === 'instagram' ? 'https://instagram.com/' + h : 'https://t.me/' + h;
  }
  openLink(k) {
    this.tone(990, 0.08, 'sine', 0.04); this.tone(1320, 0.12, 'sine', 0.03);
    const url = this.linkUrl(k);
    const name = k === 'instagram' ? 'Instagram' : k === 'telegram' ? 'Telegram' : 'Telefon';
    clearTimeout(this.vrMsgTimer);
    if (!url) { this.setState({ vrMsg: name + ' havolasi hali qo‘shilmagan' }); this.vrMsgTimer = setTimeout(() => this.setState({ vrMsg: '' }), 2600); return; }
    this.setState({ vrMsg: name + ' ochilmoqda…' }); this.vrMsgTimer = setTimeout(() => this.setState({ vrMsg: '' }), 2200);
    let ok = false;
    if (k !== 'phone') { try { ok = !!window.open(url, '_blank', 'noopener'); } catch (e) {} }
    if (!ok) {
      try { const a = document.createElement('a'); a.href = url; a.target = k === 'phone' ? '_top' : '_blank'; a.rel = 'noopener'; document.body.appendChild(a); a.click(); a.remove(); } catch (e) {}
    }
  }
  onPick(part, d) {
    const f = this.state.focus;
    if (this.root && this.root.focus) { try { this.root.focus({ preventScroll: true }); } catch (e) {} }
    if (this.state.vr) return;
    if (part === 'overview') { this.focusTo('overview'); return; }
    if (part === 'phone' && d.phoneTap) return;
    if (part === 'vr' && !d.dbl) { this.enterVr(); return; }
    if (d.dbl) { if (part !== f) this.focusTo(part); return; }
    if (part === 'keyboard' && d.key) { this.typeKey(d.key, d.ch); return; }
    if (part === 'mouse' && d.button && (f === 'mouse' || f === 'desk')) { if (d.button === 'left') this.nextTheme(); else this.clearText(); return; }
    if (part === 'pc' && d.power) { this.togglePower(); return; }
    if (part === 'pc' && d.rgbBtn) { this.toggleRgb(); return; }
    if (part === 'clouds') { this.click(); this.cloudsOn = this.cloudsOn === false; if (this.api && this.api.setClouds) this.api.setClouds(this.cloudsOn); return; }
    if (part === 'sign') { this.click(); this.signOn = this.signOn === false; if (this.api && this.api.setSign) this.api.setSign(this.signOn); return; }
    if (part === 'monitor' && d.webcam) { this.click(); this.toggleCamera(); return; }
    if (part === 'deck' && (f === 'deck' || f === 'desk') && d.btn != null) {
      if (d.btn === 0) this.toggleMusic(); else if (d.btn === 1) this.toggleLamp(); else if (d.btn === 2) this.nextTheme(); else if (d.btn === 3) this.clearText(); else if (d.btn === 4) this.togglePower(); else if (d.btn === 5) this.toggleRgb(); else this.click();
      return;
    }
    if (part !== f) this.focusTo(part);
  }
  focusRoot() { if (this.root && this.root.focus && document.activeElement !== this.root) { try { this.root.focus({ preventScroll: true }); } catch (e) {} } }
  onKeyH(e) {
    const f = this.state.focus;
    if (this.state.vr) { if (e.key === 'Escape') this.exitVr(); return; }
    if (this.state.vrFade) return;
    if (e.key === 'Escape') { this.setState({ focus: 'overview' }); return; }
    if (f === 'phone' && !e.metaKey && !e.ctrlKey && !e.altKey && this.api && this.api.phoneKey) {
      if (/^[0-9]$/.test(e.key)) { e.preventDefault(); this.api.phoneKey(e.key); return; }
      if (e.key === 'Backspace') { e.preventDefault(); this.api.phoneKey('del'); return; }
      if (e.key.length === 1 || e.key === 'Enter') { e.preventDefault(); return; }
    }
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.target && e.target.tagName === 'BUTTON' && (e.key === ' ' || e.key === 'Enter')) return;
    const map = { Backspace: 'BS', Enter: 'EN', ' ': 'SP', Tab: 'TAB', CapsLock: 'CAPS', Shift: 'LSHIFT' };
    if (map[e.key]) { if (e.key !== 'Tab') e.preventDefault(); if (e.key === 'Tab') return; this.typeKey(map[e.key]); return; }
    if (e.key.length === 1) { e.preventDefault(); this.typeKey(e.key.toUpperCase(), e.key); }
  }

  renderVals() {
    const s = this.state;
    if (s.focus === 'painting') this.spotOpened = true;
    const accent = this.props.accent ?? '#3ee0c5';
    const p = this.PARTS[s.focus];
    const A = {
      monitor: [{ label: 'Manzarani almashtirish', fn: () => this.nextTheme() }, { label: s.power ? "Ekranni o'chirish" : 'Ekranni yoqish', fn: () => this.togglePower(), pressed: !s.power }],
      pc: [{ label: s.power ? "Kompyuterni o'chirish" : 'Kompyuterni yoqish', fn: () => this.togglePower(), pressed: s.power }, { label: 'RGB rangini almashtirish', fn: () => this.nextRgb() }],
      keyboard: [{ label: s.caps ? 'Caps: yoqilgan' : "Caps: o'chiq", fn: () => this.typeKey('CAPS'), pressed: s.caps }, { label: 'Matnni tozalash', fn: () => this.clearText() }],
      mouse: [{ label: 'Chap tugma', fn: () => this.nextTheme() }, { label: "O'ng tugma", fn: () => this.clearText() }],
      deck: [{ label: s.music ? "Musiqani to'xtatish" : 'Musiqani yoqish', fn: () => this.toggleMusic(), pressed: s.music }, { label: s.lamp ? "Neonni o'chirish" : 'Neonni yoqish', fn: () => this.toggleLamp(), pressed: s.lamp }],
    };
    const actions = (A[s.focus] || []).map((a) => ({ label: a.label, fn: a.fn, pressed: a.pressed ? 'true' : 'false' }));
    const hp = s.hover ? this.PARTS[s.hover] : null;
    const views = this.VIEWS.map((v) => {
      const active = s.focus === v[0];
      return { label: v[1], active: active ? 'true' : 'false', pick: () => this.setState({ focus: v[0] }), style: active ? 'background:' + accent + ';color:#08201c;font-weight:600' : '' };
    });
    return {
      accent,
      setCanvas: this.setCanvas, setRoot: this.setRoot, setTip: this.setTip, setVideo: this.setVideo,
      onKey: (e) => this.onKeyH(e),
      onRootDown: (e) => { const t = e && e.target; if (t && t.closest && t.closest('button')) return; this.focusRoot(); },
      tipText: s.hoverSub === 'power' ? (s.power ? "Quvvat tugmasi · o'chirish" : 'Quvvat tugmasi · yoqish') : s.hoverSub === 'webcam' ? (s.camera === 'on' ? 'Kamera · yopish' : 'Kamera · ochish') : s.hoverSub === 'rgb' ? (s.rgbOn ? "RGB tugmasi · o'chirish" : 'RGB tugmasi · yoqish') : hp ? hp.tip : '', tipOpacity: hp && !s.vr ? 1 : 0,
      isFocused: s.focus !== 'overview' && !s.vr && !s.vrFade,
      spotMounted: !!this.spotOpened, spotClass: s.focus === 'painting' && !s.vr && !s.vrFade ? 'spot' : 'spot off', spotHidden: s.focus === 'painting' ? 'false' : 'true',
      inVr: s.vr, vrFadeOpacity: s.vrFade ? 1 : 0, vrFadePE: s.vrFade ? 'auto' : 'none', vrFadeScale: s.vrFade ? 1 : 1.6, exitVr: () => this.exitVr(),
      vrLabel: s.vrHover === 'instagram' ? 'Instagram sahifasiga o‘tish' : s.vrHover === 'telegram' ? 'Telegramda yozish' : s.vrHover === 'phone' ? 'Qo‘ng‘iroq qilish' : 'Atrofga qarash uchun suring · belgini bosing',
      vrMsg: s.vrMsg, hasVrMsg: !!s.vrMsg, hasPanel: !!p, pCat: p ? p.cat : '', pName: p ? p.name : '', pDesc: p ? p.desc : '',
      pSpecs: p ? p.specs.map((x) => ({ k: x[0], v: x[1] })) : [],
      hasActions: actions.length > 0, actions,
      views,
      goOverview: () => this.setState({ focus: 'overview' }),
      showCurtain: s.curtain, curtainOpacity: s.ready && !s.failed ? 0 : 1,
      loadingNow: !s.failed, failed: s.failed, failMsg: s.failMsg,
      retry: () => this.retry(),
      showFps: (this.props.showFps ?? true) && s.ready,
      fpsText: s.stats ? String(s.stats.fps) : '--',
      fpsColor: !s.stats ? '#888888' : s.stats.fps >= 50 ? '#5ee08a' : s.stats.fps >= 30 ? '#f2c94c' : '#ff6b6b',
      fpsInfo: s.stats ? ('Sifat: ' + (['Past', "O'rta", 'Yuqori', 'Ultra'][s.stats.quality] || 'Yuqori') + ' · ' + s.stats.pr.toFixed(2).replace(/0$/, '') + '×') : 'o\u2018lchanmoqda…',
    };
  }
}
