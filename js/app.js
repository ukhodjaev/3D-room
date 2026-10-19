// Kichik ishga tushirgich: komponent holatini oddiy DOM ga bog'laydi
class DCLogic {
  constructor(props) { this.props = props || {}; this.state = {}; this._mounted = false; }
  setState(patch, cb) {
    const prev = this.state;
    const next = typeof patch === 'function' ? patch(prev, this.props) : patch;
    this.state = Object.assign({}, prev, next);
    if (this._mounted) { if (this.componentDidUpdate) this.componentDidUpdate(this.props, prev); this._render(); }
    if (cb) cb();
  }
}
window.DCLogic = DCLogic;

(function () {
  const $ = (id) => document.getElementById(id);
  // elements laid out with flex keep their display value when shown again (data-d)
  const show = (el, on) => { el.style.display = on ? (el.getAttribute('data-d') || '') : 'none'; };
  function start() {
    const comp = new Component(Object.assign({}, window.SETUP_CONFIG || {}));
    let v = {};
    comp._render = function () {
      v = comp.renderVals();
      show($('fps'), v.showFps);
      $('fpsDot').style.background = v.fpsColor; $('fpsText').textContent = v.fpsText; $('fpsInfo').textContent = v.fpsInfo;
      $('tip').textContent = v.tipText; $('tip').style.opacity = v.tipOpacity;
      show($('back'), v.isFocused);
      show($('curtain'), v.showCurtain); $('curtain').style.opacity = v.curtainOpacity;
      show($('loading'), v.loadingNow); show($('failed'), v.failed); $('failMsg').textContent = v.failMsg;
      $('blocked').style.display = v.blocked ? 'flex' : 'none'; $('copyLink').textContent = v.copyLabel;
      show($('vrUi'), v.inVr); show($('vrMsg'), v.hasVrMsg); $('vrMsg').textContent = v.vrMsg; $('vrLabel').textContent = v.vrLabel;
      const sp = $('spot');
      if (v.spotMounted && !sp.firstChild) { const fr = document.createElement('iframe'); fr.title = 'Spotify: ABBA \u2014 Lay All Your Love On Me'; fr.src = 'https://open.spotify.com/embed/track/4euAGZTszWPrriggYK0HG9?utm_source=generator&theme=0'; fr.allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture'; fr.loading = 'lazy'; sp.appendChild(fr); }
      sp.className = v.spotClass; sp.setAttribute('aria-hidden', v.spotHidden);
      const f = $('vrFade'); f.style.opacity = v.vrFadeOpacity; f.style.pointerEvents = v.vrFadePE; $('vrLens').style.transform = 'scale(' + v.vrFadeScale + ')';
    };
    const root = $('root');
    root.addEventListener('keydown', (e) => v.onKey && v.onKey(e));
    root.addEventListener('pointerdown', (e) => v.onRootDown && v.onRootDown(e));
    $('back').addEventListener('click', () => v.goOverview && v.goOverview());
    $('retry').addEventListener('click', () => v.retry && v.retry());
    $('copyLink').addEventListener('click', () => v.copyLink && v.copyLink());
    $('vrExit').addEventListener('click', () => v.exitVr && v.exitVr());
    comp._mounted = true;
    comp._render();
    comp.setRoot(root); comp.setTip($('tip')); comp.setVideo($('video'));
    comp.setCanvas($('canvas'));
    window.addEventListener('beforeunload', () => comp.componentWillUnmount && comp.componentWillUnmount());
    window.setup = comp;
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
