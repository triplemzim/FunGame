// A stationary office vignette. Simulation and movement arrive in later stages.
export function createOfficeShell(canvas) {
  const context = canvas.getContext('2d');
  let state = 'ready';

  function draw() {
    const bounds = canvas.getBoundingClientRect();
    if (!bounds.width || !bounds.height || !context) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(bounds.width * dpr);
    canvas.height = Math.round(bounds.height * dpr);
    const width = 640;
    const height = bounds.height / bounds.width * width;
    const ctx = context;
    ctx.setTransform(canvas.width / width, 0, 0, canvas.height / height, 0, 0);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const ink = '#363047';
    const floor = height - 48;
    const unit = Math.min(1.06, Math.max(.76, height / 390));
    const started = state === 'playing';

    function path(points, fill, stroke = ink, lineWidth = 2) {
      ctx.beginPath();
      points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
      ctx.closePath();
      if (fill) { ctx.fillStyle = fill; ctx.fill(); }
      if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lineWidth; ctx.stroke(); }
    }

    function line(x1, y1, x2, y2, color = ink, lineWidth = 2) {
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
      ctx.strokeStyle = color; ctx.lineWidth = lineWidth; ctx.stroke();
    }

    function round(x, y, w, h, radius, fill, stroke = ink, lineWidth = 2) {
      ctx.beginPath(); ctx.roundRect(x, y, w, h, radius);
      if (fill) { ctx.fillStyle = fill; ctx.fill(); }
      if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lineWidth; ctx.stroke(); }
    }

    function ellipse(x, y, rx, ry, fill, stroke = null, lineWidth = 2) {
      ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
      ctx.fillStyle = fill; ctx.fill();
      if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lineWidth; ctx.stroke(); }
    }

    function text(value, x, y, size, color, weight = '600', align = 'left') {
      ctx.font = `${weight} ${size}px ui-sans-serif, system-ui, sans-serif`;
      ctx.textAlign = align; ctx.fillStyle = color; ctx.fillText(value, x, y);
    }

    ctx.fillStyle = '#cec2ed'; ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#bbaeD4'; ctx.fillRect(0, floor, width, height - floor);
    line(0, floor, width, floor, '#9181ab', 1.5);
    line(0, floor + 8, width, floor + 8, '#cfc1e0', 2);

    // Two generous city windows, with deliberately simple local silhouettes.
    const windowTop = 15;
    const windowHeight = Math.max(124, floor - 57);
    round(60, windowTop + 5, 378, windowHeight, 7, '#b7a8d6', '#a595c2', 2);
    round(53, windowTop, 378, windowHeight, 5, '#e7e1f3', ink, 2.5);
    ctx.save();
    ctx.beginPath(); ctx.roundRect(58, windowTop + 5, 368, windowHeight - 10, 2); ctx.clip();
    const sky = ctx.createLinearGradient(0, windowTop, 0, windowTop + windowHeight);
    sky.addColorStop(0, '#e7e7f8'); sky.addColorStop(1, '#ddd4ed');
    ctx.fillStyle = sky; ctx.fillRect(58, windowTop + 5, 368, windowHeight - 10);
    ellipse(130, 52, 28, 7, '#f8f5fc'); ellipse(151, 51, 16, 9, '#f8f5fc');
    ellipse(357, 77, 31, 6, '#f8f5fc'); ellipse(338, 74, 16, 8, '#f8f5fc');
    ellipse(366, 44, 18, 18, '#f6ebc8');
    const skylineBase = windowTop + windowHeight;
    const buildings = [[65, 44, 85], [110, 49, 117], [159, 34, 74], [193, 61, 145], [254, 40, 95], [294, 59, 120], [353, 38, 83], [391, 41, 111]];
    buildings.forEach(([x, w, h], i) => {
      const buildingHeight = h * Math.min(1, windowHeight / 210);
      ctx.fillStyle = i % 2 ? '#bdb4d7' : '#ccc4df';
      ctx.fillRect(x, skylineBase - buildingHeight, w, buildingHeight);
      for (let y = skylineBase - buildingHeight + 12; y < skylineBase - 8; y += 17) {
        for (let xx = x + 8; xx < x + w - 5; xx += 13) {
          ctx.fillStyle = (Math.round(y + xx) % 3) ? '#ded7ea' : '#e9dfc8';
          ctx.fillRect(xx, y, 4, 6);
        }
      }
    });
    path([[60, 21], [126, 21], [278, skylineBase], [211, skylineBase]], '#ffffff23', null);
    ctx.restore();
    line(242, windowTop + 1, 242, windowTop + windowHeight - 1, ink, 5);
    line(55, windowTop + windowHeight * .57, 430, windowTop + windowHeight * .57, '#827095', 3);
    round(45, windowTop + windowHeight - 2, 395, 9, 2, '#eadff0', ink, 2);

    // The distant corner office is an ambition, not an active game element.
    const doorY = 21;
    const doorHeight = floor - doorY;
    round(504, doorY, 88, doorHeight, 3, '#ab9ac5', '#8d7da8', 2);
    round(511, doorY + 7, 74, doorHeight - 8, 2, '#bbaed2', '#81718f', 1.5);
    round(521, doorY + 17, 54, Math.max(40, doorHeight * .43), 2, '#cfc3e1', '#9584ac', 1.2);
    text('CORNER', 548, doorY + 39, 7, '#7f6c98', '700', 'center');
    text('OFFICE', 548, doorY + 50, 7, '#7f6c98', '700', 'center');
    text('SOMEDAY.', 548, doorY + 65, 5.8, '#9684a9', '600', 'center');
    ellipse(574, floor - 73, 3, 3, '#e9d696', '#7d6c86', 1);

    // Noticeboard: the familiar office motivational poster.
    ctx.save(); ctx.translate(467, 51); ctx.rotate(.035);
    round(-18, -17, 36, 49, 1, '#eee8de', '#8e7ba6', 1.5);
    line(-9, 3, 7, -5, '#a18ac4', 2);
    line(7, -5, 7, 1, '#a18ac4', 2); line(7, -5, 1, -5, '#a18ac4', 2);
    text('UPWARD.', 0, 17, 4.8, '#8b799e', '700', 'center');
    text('EVENTUALLY.', 0, 24, 4.1, '#aa99b7', '500', 'center');
    ellipse(0, -13, 1.5, 1.5, '#d6958b');
    ctx.restore();

    // A slightly overwatered plant keeps the office alive.
    ctx.save(); ctx.translate(88, floor + 7); ctx.scale(unit, unit);
    ellipse(3, 3, 39, 6, '#8a789633');
    line(1, -20, 3, -124, '#526d62', 3);
    line(1, -55, -16, -92, '#526d62', 2);
    line(3, -77, 25, -108, '#526d62', 2);
    ctx.save(); ctx.translate(-12, -92); ctx.rotate(-.6); ellipse(0, 0, 9, 23, '#789b7a', '#526d62', 1.5); ctx.restore();
    ctx.save(); ctx.translate(18, -109); ctx.rotate(.55); ellipse(0, 0, 10, 25, '#93ae83', '#526d62', 1.5); ctx.restore();
    ctx.save(); ctx.translate(-3, -119); ctx.rotate(-.2); ellipse(0, 0, 8, 24, '#9cb88d', '#526d62', 1.5); ctx.restore();
    ctx.save(); ctx.translate(16, -72); ctx.rotate(.8); ellipse(0, 0, 9, 23, '#769a7c', '#526d62', 1.5); ctx.restore();
    path([[-24, -35], [26, -35], [19, 1], [-17, 1]], '#d9a78e', '#786678', 2);
    round(-28, -40, 58, 9, 3, '#e6b99e', '#786678', 2);
    line(-15, -24, -11, -4, '#c68f7c', 1.5);
    ctx.restore();

    // A seated intern with an intentionally oversized first-day mug.
    ctx.save(); ctx.translate(310, floor + 7); ctx.scale(unit, unit);
    ellipse(17, 5, 149, 12, '#83729530');
    round(-29, -152, 81, 102, 21, '#81739b', ink, 2.5);
    line(12, -60, 12, -13, ink, 6);
    line(-25, -9, 47, -9, ink, 4);
    ellipse(-25, -6, 6, 4, '#393447'); ellipse(48, -6, 6, 4, '#393447');
    path([[-16, -91], [15, -91], [12, -25], [-9, -25]], '#495369', ink, 2);
    path([[15, -91], [41, -91], [44, -25], [23, -25]], '#5d6178', ink, 2);
    round(-17, -30, 32, 14, 5, '#f0e9dc', ink, 2);
    round(23, -30, 35, 14, 5, '#f0e9dc', ink, 2);
    line(-9, -23, 7, -23, '#b9adad', 1.2); line(32, -23, 50, -23, '#b9adad', 1.2);

    path([[-35, -155], [-16, -166], [31, -166], [53, -151], [61, -92], [-42, -92]], '#f1e5cc', ink, 2.5);
    path([[-12, -166], [6, -143], [25, -166]], '#faf3e4', '#b5a68f', 1.5);
    path([[0, -150], [8, -150], [13, -108], [6, -101], [-1, -108]], '#9b8ac2', '#74628d', 1.5);
    line(32, -149, 39, -122, '#b5a68f', 1.5);
    // Tiny first-day badge changes on Start Work.
    round(24, -139, 23, 16, 2, started ? '#dbe9b0' : '#e5dcec', '#a697ad', 1);
    text(started ? 'HI!' : 'NEW', 35, -129, 5.6, '#6c647b', '700', 'center');

    round(-4, -182, 24, 25, 7, '#dca480', ink, 2);
    ellipse(8, -210, 36, 40, '#e7b895', ink, 2.3);
    ellipse(-27, -208, 7, 10, '#e7b895', ink, 1.5); ellipse(43, -208, 7, 10, '#e7b895', ink, 1.5);
    // Side-parted hair and small glasses.
    ctx.beginPath(); ctx.moveTo(-25, -214); ctx.bezierCurveTo(-39, -247, -13, -257, 9, -251); ctx.bezierCurveTo(37, -260, 51, -237, 39, -214); ctx.lineTo(32, -233); ctx.bezierCurveTo(18, -228, 9, -235, 5, -240); ctx.bezierCurveTo(-3, -226, -19, -234, -25, -214); ctx.fillStyle = '#443b4a'; ctx.fill(); ctx.strokeStyle = ink; ctx.lineWidth = 2; ctx.stroke();
    round(-20, -216, 23, 16, 5, '#f8e8d633', '#554657', 1.7);
    round(13, -216, 23, 16, 5, '#f8e8d633', '#554657', 1.7);
    line(3, -210, 13, -210, '#554657', 1.5);
    ellipse(-8, -208, 1.7, 2.4, '#443b4a'); ellipse(25, -208, 1.7, 2.4, '#443b4a');
    line(8, -205, 5, -195, '#be886f', 1.4); line(5, -195, 10, -194, '#be886f', 1.4);
    ellipse(-16, -194, 5, 2.3, '#dd9e87'); ellipse(31, -194, 5, 2.3, '#dd9e87');
    ctx.beginPath(); ctx.moveTo(-1, -186); ctx.quadraticCurveTo(9, started ? -175 : -180, 19, -187); ctx.strokeStyle = '#75515a'; ctx.lineWidth = 2; ctx.stroke();
    if (started) { line(-24, -223, -15, -225, '#443b4a', 1.5); line(22, -225, 31, -223, '#443b4a', 1.5); }

    // Desk, paper clutter, and the laptop that came with the role.
    path([[-128, -114], [139, -114], [161, -96], [-149, -96]], '#e5b993', ink, 2.5);
    path([[-149, -96], [161, -96], [161, -80], [-149, -80]], '#cc9d80', ink, 2.5);
    path([[-134, -80], [-119, -80], [-119, 0], [-132, 0]], '#a48387', ink, 2);
    path([[130, -80], [145, -80], [143, 0], [130, 0]], '#a48387', ink, 2);
    line(-116, -79, -116, -17, '#e3b997', 1.5);
    round(88, -76, 56, 45, 2, '#d7a88a', '#887080', 1.5);
    line(90, -53, 142, -53, '#b48576', 1.5); line(111, -65, 122, -65, '#887080', 2); line(111, -41, 122, -41, '#887080', 2);
    path([[-83, -116], [-16, -116], [-27, -110], [-91, -110]], '#eee9de', '#b29d99', 1);
    line(-74, -114, -40, -114, '#bcb0b9', 1);
    ctx.save(); ctx.translate(-74, -118); ctx.rotate(-.09);
    round(-23, -4, 44, 6, 1, '#b9c6b7', '#7b8286', 1); ctx.restore();
    path([[-44, -169], [48, -169], [62, -111], [-31, -111]], '#aea3c8', ink, 2.2);
    path([[-40, -165], [44, -165], [55, -116], [-28, -116]], '#bdb3d4', null);
    ellipse(8, -141, 5, 5, '#d9d0e6');
    path([[-31, -111], [62, -111], [71, -106], [-41, -106]], '#d7cee1', ink, 1.5);
    round(14, -151, 22, 10, 1, '#e8e4bb', '#b6ab96', .7);
    text('you got this', 25, -144, 3.3, '#8d8082', '600', 'center');
    // Hands rest at the desk, rather than suggesting active movement.
    ellipse(-48, -120, 13, 7, '#e7b895', ink, 1.5); ellipse(76, -120, 13, 7, '#e7b895', ink, 1.5);
    ellipse(112, -118, 21, 4, '#ad827755');
    round(97, -146, 29, 28, 4, started ? '#f0d393' : '#f3e8cd', ink, 1.8);
    ctx.beginPath(); ctx.arc(127, -134, 8, -Math.PI / 2, Math.PI / 2); ctx.strokeStyle = ink; ctx.lineWidth = 3; ctx.stroke();
    text('1', 111, -128, 11, '#85717d', '750', 'center');
    if (started) {
      for (let x = 104; x <= 120; x += 8) {
        ctx.beginPath(); ctx.moveTo(x, -153); ctx.bezierCurveTo(x - 6, -159, x + 6, -164, x, -170); ctx.strokeStyle = '#f5eee5'; ctx.lineWidth = 2; ctx.stroke();
      }
    }
    // The box everyone gets on day one.
    round(-180, -43, 43, 41, 2, '#bba68e', '#7f7182', 1.5);
    path([[-183, -47], [-139, -47], [-137, -39], [-181, -39]], '#cbb9a0', '#7f7182', 1.5);
    line(-161, -44, -159, -5, '#a4917f', 4);
    text('DESK', -158, -24, 5, '#847384', '650', 'center');
    text('THINGS', -158, -17, 4.5, '#847384', '600', 'center');
    ctx.restore();
  }

  const observer = new ResizeObserver(draw);
  observer.observe(canvas);
  window.addEventListener('resize', draw, { passive: true });
  draw();

  return {
    setState(nextState) {
      if (nextState !== 'ready' && nextState !== 'playing') return;
      state = nextState;
      draw();
    },
  };
}
