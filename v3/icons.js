/* ============================================================
   icons.js — أيقونات ملوّنة لأقسام التطبيق (CI)
   كل أيقونة مربع ملوّن 100×100 بزوايا مدوّرة. تُستدعى بـ ic('cphone') وغيرها.
   ============================================================ */
const CI = (() => {
  const T = (bg, inner) => `<rect width="100" height="100" rx="22" fill="${bg}"/>${inner}`;
  /* هاتف واقعي: إطار فاتح + شاشة داكنة + فتحة كاميرا */
  const PH = (x, y, w, h, inner = '') =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="9" fill="#E2E8F0"/>`
    + `<rect x="${x + 3.5}" y="${y + 3.5}" width="${w - 7}" height="${h - 7}" rx="6" fill="#0F172A"/>`
    + `<rect x="${x + w / 2 - 6}" y="${y + 6.5}" width="12" height="3" rx="1.5" fill="#334155"/>` + inner;
  const APPS = (x, y, cols) => cols.map((c, i) => `<rect x="${x + (i % 2) * 11}" y="${y + Math.floor(i / 2) * 11}" width="8" height="8" rx="2.5" fill="${c}"/>`).join('');
  const GEAR = (cx, cy, s, f, hole) => `<g transform="translate(${cx},${cy}) scale(${s})">`
    + [0, 45, 90, 135].map(a => `<rect x="-2.5" y="-12" width="5" height="24" rx="1" fill="${f}" transform="rotate(${a})"/>`).join('')
    + `<circle r="9" fill="${f}"/><circle r="3.5" fill="${hole}"/></g>`;
  const STAR = (x, y, r, f) => `<polygon points="${x},${y - r} ${x + r * .28},${y - r * .28} ${x + r},${y} ${x + r * .28},${y + r * .28} ${x},${y + r} ${x - r * .28},${y + r * .28} ${x - r},${y} ${x - r * .28},${y - r * .28}" fill="${f}"/>`;
  const FONT = 'font-family="Tahoma,Arial,sans-serif" font-weight="700"';
  return {
    /* الهواتف */
    cphone: T('#1D4ED8',
      `<rect x="16" y="18" width="38" height="64" rx="9" fill="#93C5FD"/><rect x="21" y="23" width="14" height="14" rx="4" fill="#1E3A8A"/><circle cx="26" cy="28" r="3" fill="#60A5FA"/><circle cx="31" cy="33" r="3" fill="#60A5FA"/>`
      + PH(44, 12, 40, 70, APPS(52, 30, ['#F472B6', '#FBBF24', '#34D399', '#60A5FA']))),
    /* الأنتي كاس: شاشة ملوّنة + زجاج عائم */
    cglass: T('#0E7490',
      `<rect x="20" y="20" width="40" height="66" rx="9" fill="#E2E8F0"/><rect x="23.5" y="23.5" width="33" height="59" rx="6" fill="#C026D3"/>`
      + `<path d="M23.5 64 L56.5 46 V76.5 a6 6 0 0 1 -6 6 H29.5 a6 6 0 0 1 -6 -6 Z" fill="#F472B6"/><circle cx="33" cy="35" r="5" fill="#FDE047"/>`
      + `<rect x="38" y="10" width="43" height="68" rx="10" fill="#67E8F9" fill-opacity=".3" stroke="#BAE6FD" stroke-width="3"/>`
      + `<path d="M48 68 L72 36 M58 72 L75 50" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".7" fill="none"/><circle cx="48" cy="21" r="2.5" fill="#fff" opacity=".9"/>`),
    /* البوشيط (كفران ملوّنان، مكان الكاميرا فارغ) */
    ccase: T('#7C3AED',
      `<defs><linearGradient id="gcb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#60A5FA"/><stop offset="1" stop-color="#2563EB"/></linearGradient><linearGradient id="gcf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FBBF24"/><stop offset=".55" stop-color="#FB7185"/><stop offset="1" stop-color="#EC4899"/></linearGradient></defs>`
      + `<g transform="rotate(-10 40 50)"><rect x="17" y="16" width="42" height="68" rx="11" fill="url(#gcb)"/><rect x="23" y="22" width="14" height="14" rx="4.5" fill="#E0E7FF" opacity=".75"/></g>`
      + `<g transform="rotate(8 62 50)"><rect x="40" y="12" width="44" height="72" rx="12" fill="url(#gcf)" stroke="#F472B6" stroke-width="3"/><rect x="46" y="18" width="16" height="16" rx="5" fill="#fff" opacity=".4"/></g>`),
    /* الإكسسوارات: أربعة أصناف */
    cacc: T('#16A34A',
      `<rect x="12" y="12" width="36" height="36" rx="10" fill="#ECFDF5"/><rect x="23" y="17" width="3.5" height="7" rx="1" fill="#94A3B8"/><rect x="33.5" y="17" width="3.5" height="7" rx="1" fill="#94A3B8"/><rect x="19" y="23" width="22" height="18" rx="5" fill="#334155"/><polygon points="31,25 25,33 29,33 28,39 36,31 32,31" fill="#FBBF24"/>`
      + `<rect x="52" y="12" width="36" height="36" rx="10" fill="#ECFDF5"/><path d="M60 38 V32 a10 10 0 0 1 20 0 V38" fill="none" stroke="#334155" stroke-width="3.5" stroke-linecap="round"/><rect x="57" y="34" width="8" height="12" rx="3.5" fill="#F43F5E"/><rect x="75" y="34" width="8" height="12" rx="3.5" fill="#F43F5E"/>`
      + `<rect x="12" y="52" width="36" height="36" rx="10" fill="#ECFDF5"/><path d="M22 58 H35 L41 64 V80 a3 3 0 0 1 -3 3 H22 a3 3 0 0 1 -3 -3 V61 a3 3 0 0 1 3 -3 Z" fill="#2563EB"/><rect x="23" y="60" width="2.5" height="7" fill="#FBBF24"/><rect x="28" y="60" width="2.5" height="7" fill="#FBBF24"/><rect x="33" y="60" width="2.5" height="7" fill="#FBBF24"/>`
      + `<rect x="52" y="52" width="36" height="36" rx="10" fill="#ECFDF5"/><path d="M60 80 C60 66 80 74 80 60" fill="none" stroke="#6366F1" stroke-width="3.5" stroke-linecap="round"/><rect x="57" y="78" width="7" height="6" rx="2" fill="#64748B"/><rect x="76" y="56" width="7" height="6" rx="2" fill="#64748B"/>`),
    /* التعبئة */
    ctopup: T('#0891B2',
      `<path d="M24 14 H46 L60 28 V80 a6 6 0 0 1 -6 6 H24 a6 6 0 0 1 -6 -6 V20 a6 6 0 0 1 6 -6 Z" fill="#F1F5F9"/>`
      + `<rect x="25" y="42" width="26" height="24" rx="4" fill="#FBBF24"/><path d="M25 54 h26 M38 42 v24" stroke="#B45309" stroke-width="1.8" fill="none"/>`
      + `<rect x="66" y="64" width="6" height="12" rx="2" fill="#A5F3FC"/><rect x="75" y="52" width="6" height="24" rx="2" fill="#67E8F9"/><rect x="84" y="38" width="6" height="38" rx="2" fill="#22D3EE" transform="translate(-1,0)"/>`),
    /* الصيانة */
    crepair: T('#7E22CE',
      PH(22, 10, 44, 74, `<circle cx="44" cy="47" r="19" fill="#F472B6" opacity=".18"/>`)
      + GEAR(44, 47, 1.55, '#F472B6', '#1E1B4B') + `<circle cx="40" cy="43" r="3" fill="#FBCFE8"/>`
      + `<g transform="translate(70,68) rotate(-45)"><rect x="-6" y="0" width="12" height="20" rx="5" fill="#F97316"/><rect x="-6" y="7" width="12" height="3" fill="#FDBA74"/><rect x="-2" y="-26" width="4" height="26" fill="#E2E8F0"/><rect x="-3" y="-30" width="6" height="5" rx="1" fill="#94A3B8"/></g>`
      + STAR(72, 30, 8, '#FDE047') + `<circle cx="80" cy="44" r="2.4" fill="#FDE047"/><circle cx="58" cy="24" r="2" fill="#FDE047"/>`),
    /* شراء المستعمل */
    cused: T('#0F766E',
      PH(24, 12, 44, 74, APPS(34, 30, ['#F472B6', '#FBBF24', '#34D399', '#60A5FA', '#A78BFA', '#FB923C']) + `<rect x="34" y="66" width="24" height="5" rx="2.5" fill="#334155"/>`)
      + `<rect x="67" y="32" width="2.5" height="12" rx="1" fill="#94A3B8"/>`
      + `<circle cx="70" cy="28" r="17" fill="#FBBF24" stroke="#0F766E" stroke-width="3.5"/><text x="70" y="36" text-anchor="middle" ${FONT} font-size="24" fill="#7C2D12">م</text>`),
    /* الديون */
    cdebt: T('#B45309',
      `<rect x="22" y="14" width="44" height="30" rx="4" fill="#86EFAC" stroke="#16A34A" stroke-width="2" transform="rotate(-8 44 29)"/><circle cx="42" cy="29" r="5" fill="none" stroke="#16A34A" stroke-width="2"/>`
      + `<rect x="14" y="36" width="66" height="46" rx="9" fill="#F59E0B"/><rect x="54" y="48" width="30" height="21" rx="7" fill="#92400E"/><circle cx="63" cy="58.5" r="3.5" fill="#FDE68A"/>`
      + `<circle cx="76" cy="27" r="15" fill="#EF4444" stroke="#B45309" stroke-width="3"/><rect x="74" y="18" width="4" height="12" rx="2" fill="#fff"/><circle cx="76" cy="35" r="2.6" fill="#fff"/>`),
    /* التقرير */
    creport: T('#EA580C',
      `<rect x="24" y="16" width="52" height="68" rx="9" fill="#F8FAFC"/><rect x="38" y="9" width="24" height="13" rx="4" fill="#94A3B8"/>`
      + [['#EF4444', 38], ['#F59E0B', 52], ['#22C55E', 66]].map(([c, y]) => `<circle cx="36" cy="${y}" r="4.5" fill="${c}"/><rect x="46" y="${y - 2.5}" width="22" height="5" rx="2.5" fill="#CBD5E1"/>`).join('')),
    /* الرئيسية */
    chome: T('#2563EB',
      `<path d="M20 48 L50 24 L80 48 V76 a5 5 0 0 1 -5 5 H25 a5 5 0 0 1 -5 -5 Z" fill="#F8FAFC"/><rect x="42" y="56" width="16" height="25" rx="3" fill="#60A5FA"/>`
      + `<path d="M13 50 L50 18 L87 50" fill="none" stroke="#FBBF24" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`),
    /* المزيد */
    cmore: T('#475569',
      [[28, 36, '#FBBF24'], [50, 64, '#34D399'], [72, 44, '#60A5FA']].map(([y, x, c]) => `<rect x="20" y="${y - 2.5}" width="60" height="5" rx="2.5" fill="#CBD5E1"/><circle cx="${x}" cy="${y}" r="8.5" fill="${c}" stroke="#475569" stroke-width="3"/>`).join(''))
  };
})();

/* ---------- أيقونات إضافية للعرض المضغوط والبيع السريع والروپريز (كانت في المخزون) ---------- */
Object.assign(IC, {
  rows: '<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>',
  cards: '<rect x="3" y="3" width="18" height="7" rx="1.5"/><rect x="3" y="14" width="18" height="7" rx="1.5"/>',
  zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
  swap: '<path d="m16 3 4 4-4 4"/><path d="M20 7H4"/><path d="m8 21-4-4 4-4"/><path d="M4 17h16"/>'
});

/* ---------- أيقونة ملوّنة لقسم طلبات الزبائن (كانت في الإقلاع) ---------- */
CI.creq = `<rect width="100" height="100" rx="22" fill="#E11D48"/>`
  + `<path d="M22 24 H78 a8 8 0 0 1 8 8 V60 a8 8 0 0 1 -8 8 H46 L28 82 V68 H22 a8 8 0 0 1 -8 -8 V32 a8 8 0 0 1 8 -8 Z" fill="#FFF1F2"/>`
  + `<rect x="28" y="36" width="32" height="6" rx="3" fill="#FB7185"/>`
  + `<rect x="28" y="48" width="44" height="6" rx="3" fill="#FDA4AF"/>`
  + `<circle cx="74" cy="26" r="14" fill="#FBBF24" stroke="#E11D48" stroke-width="3"/>`
  + `<path d="M74 20 v12 M68 26 h12" stroke="#78350F" stroke-width="3.5" stroke-linecap="round"/>`;
