/* ══════════════ ฐานข้อมูลกลาง ══════════════ */
const AMP = {
	1.5: [19, 17, 15, 13.5, 14, 12.5, 24, 20, 27, 23, 19], 2.5: [26, 23, 20, 18, 18.5, 17, 31, 26, 35, 30, 26],
	4: [35, 31, 27, 24, 25, 23, 40, 34, 45, 38, 35], 6: [45, 40, 34, 31, 32, 29, 50, 43, 56, 48, 45],
	10: [61, 54, 46, 42, 43, 39, 66, 57, 74, 63, 61], 16: [81, 73, 62, 56, 57, 52, 85, 74, 95, 81, 81],
	25: [106, 95, 80, 73, 75, 68, 110, 95, 122, 104, 106], 35: [131, 117, 99, 89, 92, 83, 132, 115, 147, 125, 131],
	50: [158, 141, 118, 108, 110, 99, 156, 136, 174, 148, 158], 70: [200, 179, 149, 136, 139, 125, 192, 168, 213, 183, 200],
	95: [241, 216, 179, 164, 167, 150, 230, 201, 254, 218, 241], 120: [278, 249, 206, 188, 192, 172, 262, 230, 290, 249, 278],
	150: [318, 285, 236, 216, 219, 196, 296, 261, 326, 281, 318], 185: [362, 324, 268, 245, 248, 223, 335, 296, 368, 318, 362],
	240: [424, 380, 313, 286, 291, 261, 388, 343, 424, 368, 424], 300: [486, 435, 358, 328, 334, 298, 440, 391, 480, 417, 486],
	400: [561, 500, 415, 380, 385, 344, 503, 448, 546, 476, 561], 500: [656, 580, 476, 435, 441, 394, 570, 508, 617, 540, 656]
};
const XLPE_K = 1.28, AL_K = 0.78;
const R70 = {
	1.5: 14.8, 2.5: 8.91, 4: 5.57, 6: 3.71, 10: 2.24, 16: 1.41, 25: .889, 35: .641, 50: .473, 70: .328,
	95: .236, 120: .188, 150: .153, 185: .123, 240: .0943, 300: .0761, 400: .0607, 500: .0496
};
const X_L = {
	1.5: .086, 2.5: .082, 4: .079, 6: .077, 10: .075, 16: .073, 25: .072, 35: .071, 50: .071, 70: .07,
	95: .07, 120: .07, 150: .07, 185: .07, 240: .07, 300: .07, 400: .07, 500: .07
};
const OD = {
	1.5: 3.3, 2.5: 4, 4: 4.6, 6: 5.2, 10: 6.7, 16: 7.8, 25: 9.7, 35: 10.9, 50: 12.8, 70: 14.6, 95: 16.8,
	120: 18.4, 150: 20.4, 185: 22.6, 240: 25.5, 300: 28.3, 400: 31.8, 500: 35.2
};
const T_AIR = { 25: 1.2, 30: 1.15, 35: 1.08, 40: 1, 45: .91, 50: .82, 55: .71, 60: .58 };
const T_SOIL = { 20: 1.09, 25: 1.05, 30: 1, 35: .95, 40: .89, 45: .84, 50: .77, 55: .71 };
const K_GRP = { 1: 1, 2: .8, 3: .7, 4: .65, 5: .6, 6: .57, 7: .54, 9: .5, 13: .45, 16: .41 };
const CB = [6, 10, 15, 16, 20, 25, 30, 32, 40, 50, 63, 70, 80, 100, 125, 150, 160, 175, 200, 225, 250, 300, 320, 350, 400, 500, 630, 800, 1000, 1250, 1600, 2000];
const EGC = [[16, 1.5], [20, 2.5], [40, 4], [70, 6], [100, 10], [200, 16], [400, 25], [500, 35], [800, 50], [1000, 70], [1250, 95], [2000, 120]];
const GEC = [[35, 10], [50, 16], [95, 25], [185, 35], [300, 50], [500, 70], [9999, 95]];
const PIPE = [['1/2"', 15.8], ['3/4"', 20.9], ['1"', 26.6], ['1-1/4"', 35.1], ['1-1/2"', 40.9], ['2"', 52.5],
	['2-1/2"', 69.4], ['3"', 85.2], ['4"', 110.1], ['5"', 138], ['6"', 163.4]];
const KA = [4.5, 6, 10, 15, 18, 22, 25, 36, 50, 65, 85, 100, 150];
const SIZES = Object.keys(AMP).map(Number).sort((a, b) => a - b);
const $ = id => document.getElementById(id);

/* ══════════════ ฟังก์ชันร่วม ══════════════ */
function colIdx(g, ph) {
	const t = ph === 3;
	return g === 1 ? 0 : g === 2 ? 1 : g === 3 ? (t ? 3 : 2) : g === 4 ? (t ? 5 : 4) : g === 5 ? (t ? 7 : 6) : g === 6 ? (t ? 9 : 8) : 10;
}
function lookup(sz, g, ph, ins, cond) {
	let a = AMP[sz][colIdx(g, ph)];
	if (ins === 'xlpe') a *= XLPE_K; if (cond === 'al') a *= AL_K; return a;
}
function pickCB(i) { return CB.find(c => c >= i - 1e-9) || CB[CB.length - 1]; }
function pickEGC(cb) { const r = EGC.find(x => cb <= x[0]); return r ? r[1] : 185; }
function pickGEC(sz) { return GEC.find(x => sz <= x[0])[1]; }
function pickPipe(n, sz) {
	const a = n * Math.PI * Math.pow(OD[sz] / 2, 2);
	const p = PIPE.find(x => Math.PI * Math.pow(x[1] / 2, 2) * .4 >= a); return p ? p[0] : 'แยกท่อ';
}
function vDrop(sz, I, L, ph, pf) {
	const s = Math.sqrt(Math.max(0, 1 - pf * pf));
	return (ph === 3 ? Math.sqrt(3) : 2) * I * (L / 1000) * (R70[sz] * pf + X_L[sz] * s);
}
function pf_(o) { return o.pf || 0.85; }
function sizeCircuit(o) {
	const I = o.I, ph = o.ph, V = o.V, L = o.L, g = o.g, ins = o.ins || 'pvc', cond = o.cond || 'cu';
	const kT = o.kT || 1, kG = o.kG || 1, vdLim = o.vdLim || 3, cont = o.cont !== false;
	const Id = cont ? I * 1.25 : I, cb = pickCB(Id);
	for (let i = 0; i < SIZES.length; i++) {
		const sz = SIZES[i];
		const der = lookup(sz, g, ph, ins, cond) * kT * kG;
		const vv = vDrop(sz, I, L, ph, pf_(o)), vp = vv / V * 100;
		if (der >= cb && vp <= vdLim) return { sz: sz, cb: cb, der: der, vd: vv, vdp: vp, base: lookup(sz, g, ph, ins, cond) };
	}
	const sz = SIZES[SIZES.length - 1], vv = vDrop(sz, I, L, ph, pf_(o));
	return { sz: sz, cb: cb, der: lookup(sz, g, ph, ins, cond) * kT * kG, vd: vv, vdp: vv / V * 100, fail: true, base: lookup(sz, g, ph, ins, cond) };
}

/* ══════════════ TABS ══════════════ */
document.querySelectorAll('.tab').forEach(function (b) {
	b.onclick = function () {
		document.querySelectorAll('.tab').forEach(x => x.classList.remove('on'));
		document.querySelectorAll('.pane').forEach(x => x.classList.remove('on'));
		b.classList.add('on'); $(b.dataset.p).classList.add('on');
	};
});
function goPrint() {
	document.querySelectorAll('.tab').forEach(x => x.classList.remove('on'));
	document.querySelectorAll('.pane').forEach(x => x.classList.remove('on'));
	document.querySelector('[data-p="p5"]').classList.add('on'); $('p5').classList.add('on');
	window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ══════════════ MODULE 1 : WIRE ══════════════ */
function refreshTemp() {
	const g = +$('grp').value, b = (g === 5 || g === 6), t = b ? T_SOIL : T_AIR, d = b ? 30 : 40;
	$('tLbl').textContent = b ? 'อุณหภูมิดิน (°C)' : 'อุณหภูมิอากาศโดยรอบ (°C)';
	$('temp').innerHTML = Object.keys(t).map(k => '<option value="' + k + '" ' + (+k === d ? 'selected' : '') + '>' + k + ' °C (×' + t[k].toFixed(2) + ')</option>').join('');
}
function refreshLoad() {
	const m = $('mode').value;
	$('loadLbl').textContent = m === 'kw' ? 'กำลังไฟฟ้า (kW)' : m === 'kva' ? 'กำลังปรากฏ (kVA)' : 'กระแสโหลด (A)';
}
$('grp').onchange = function () { refreshTemp(); }; $('mode').onchange = refreshLoad; refreshTemp(); refreshLoad();

function wireData() {
	const sv = $('sys').value.split('|'), ph = +sv[0], V = +sv[1];
	const pf = +$('pf').value, dfx = +$('df').value, g = +$('grp').value;
	const ins = $('ins').value, cond = $('cond').value, b = (g === 5 || g === 6);
	const kT = (b ? T_SOIL : T_AIR)[$('temp').value], kG = K_GRP[$('grpN').value];
	const L = +$('len').value, vdLim = +$('vdmax').value, cont = $('cont').checked;
	let I, P, val = +$('load').value;
	if ($('mode').value === 'a') { I = val; P = (ph === 3 ? Math.sqrt(3) * V * I * pf : V * I * pf) / 1000; }
	else if ($('mode').value === 'kva') { I = ph === 3 ? val * 1000 / (Math.sqrt(3) * V) : val * 1000 / V; P = val * pf; }
	else { P = val; I = ph === 3 ? val * 1000 / (Math.sqrt(3) * V * pf) : val * 1000 / (V * pf); }
	I *= dfx;
	const Id = cont ? I * 1.25 : I, cb = pickCB(Id);
	const rows = SIZES.map(function (sz) {
		const base = lookup(sz, g, ph, ins, cond), der = base * kT * kG;
		const vv = vDrop(sz, I, L, ph, pf), vp = vv / V * 100;
		return { sz: sz, base: base, der: der, vv: vv, vp: vp, okA: der >= cb, okV: vp <= vdLim };
	});
	return {
		ph: ph, V: V, pf: pf, g: g, ins: ins, cond: cond, buried: b, kT: kT, kG: kG, L: L, vdLim: vdLim,
		cont: cont, I: I, P: P, Id: Id, cb: cb, rows: rows, pick: rows.find(r => r.okA && r.okV), only: rows.find(r => r.okA)
	};
}
function calc() {
	const d = wireData(), pick = d.pick, par = $('par').checked;
	let ptxt = '';
	if (!pick && par) for (const n of [2, 3, 4]) {
		const h = d.rows.find(r => r.der * n * .8 >= d.cb && r.vp / n <= d.vdLim);
		if (h) { ptxt = n + ' × ' + h.sz + ' mm² ต่อเฟส'; break; }
	}
	let h = '';
	if (pick) h += '<div class="result big"><div class="l">ขนาดสายไฟที่แนะนำ (ตัวนำเฟส)</div><div class="n">' + pick.sz + ' mm²</div><div class="l">' + (d.ins === 'pvc' ? 'PVC 70°C' : 'XLPE 90°C') + ' • ' + (d.cond === 'cu' ? 'ทองแดง' : 'อะลูมิเนียม') + '</div></div>';
	else if (ptxt) h += '<div class="result big" style="background:linear-gradient(135deg,#78350f,#b45309);border-left-color:var(--warn)"><div class="l">ต้องเดินสายควบ</div><div class="n" style="font-size:1.7rem">' + ptxt + '</div></div>';
	else h += '<div class="result" style="border-left-color:var(--bad)"><b style="color:#f87171">❌ ไม่มีขนาดสายเดี่ยวที่ผ่านเกณฑ์</b></div>';
	h += '<div class="result"><h3 class="sec" style="margin-top:0">▸ ขั้นตอนการคำนวณ</h3>' +
		'<div class="kv"><span>กำลังไฟฟ้า</span><b>' + d.P.toFixed(2) + ' kW</b></div>' +
		'<div class="kv"><span>กระแสโหลด I<sub>L</sub></span><b>' + d.I.toFixed(2) + ' A</b></div>' +
		'<div class="kv"><span>กระแสออกแบบ ' + (d.cont ? '(×1.25)' : '') + '</span><b>' + d.Id.toFixed(2) + ' A</b></div>' +
		'<div class="kv"><span>k<sub>T</sub> × k<sub>G</sub></span><b>' + d.kT.toFixed(2) + ' × ' + d.kG.toFixed(2) + ' = ' + (d.kT * d.kG).toFixed(3) + '</b></div>' +
		'<div class="kv"><span>พิกัดในตารางที่ต้องการ</span><b>≥ ' + (d.cb / (d.kT * d.kG)).toFixed(1) + ' A</b></div></div>';
	if (pick) {
		const nC = d.ph === 3 ? 4 : 2;
		h += '<div class="result"><h3 class="sec" style="margin-top:0">▸ ตรวจสอบสาย ' + pick.sz + ' mm²</h3>' +
			'<div class="kv"><span>พิกัดในตาราง</span><b>' + pick.base.toFixed(0) + ' A</b></div>' +
			'<div class="kv"><span>พิกัดหลังลดค่า</span><b>' + pick.der.toFixed(1) + ' A <span class="badge b-ok">≥ CB ' + d.cb + 'A ✓</span></b></div>' +
			'<div class="kv"><span>แรงดันตก</span><b>' + pick.vv.toFixed(2) + ' V (' + pick.vp.toFixed(2) + '%) <span class="badge ' + (pick.vp <= d.vdLim ? 'b-ok' : 'b-bad') + '">≤' + d.vdLim + '%</span></b></div></div>' +
			'<div class="result" style="border-left-color:var(--gold)"><h3 class="sec" style="margin-top:0">▸ อุปกรณ์ประกอบ</h3>' +
			'<div class="kv"><span>เซอร์กิตเบรกเกอร์</span><b>' + d.cb + ' A</b></div>' +
			'<div class="kv"><span>ตัวนำเฟส / นิวทรัล</span><b>' + (d.ph === 3 ? '3' : '1') + ' × ' + pick.sz + ' + N ' + pick.sz + ' mm²</b></div>' +
			'<div class="kv"><span>สายดินบริภัณฑ์ (ตาราง 4-1)</span><b>' + pickEGC(d.cb) + ' mm²</b></div>' +
			'<div class="kv"><span>สายต่อหลักดิน (ตาราง 4-2)</span><b>' + pickGEC(pick.sz) + ' mm²</b></div>' +
			'<div class="kv"><span>ท่อร้อยสาย (fill 40%)</span><b>' + pickPipe(nC + 1, pick.sz) + '</b></div></div>';
		if (d.only && d.only.sz !== pick.sz) h += '<div class="note">💡 ถ้าดูเฉพาะพิกัดกระแส สาย <b>' + d.only.sz + ' mm²</b> ก็พอ แต่ %VD = ' + d.only.vp.toFixed(2) + '% เกิน ' + d.vdLim + '% จึงต้องขยับเป็น <b>' + pick.sz + ' mm²</b></div>';
	}
	$('out').innerHTML = h;
	let t = '<table><thead><tr><th>mm²</th><th>ตาราง(A)</th><th>k<sub>T</sub>k<sub>G</sub></th><th>ใช้จริง(A)</th><th>VD(V)</th><th>%VD</th><th>กระแส</th><th>แรงดัน</th><th>สรุป</th></tr></thead><tbody>';
	d.rows.forEach(function (r) {
		const s = pick && r.sz === pick.sz;
		t += '<tr class="' + (s ? 'pick' : '') + '"><td><b>' + r.sz + '</b></td><td>' + r.base.toFixed(0) + '</td><td>' + (d.kT * d.kG).toFixed(2) + '</td>' +
			'<td>' + r.der.toFixed(1) + '</td><td>' + r.vv.toFixed(2) + '</td><td>' + r.vp.toFixed(2) + '%</td>' +
			'<td><span class="badge ' + (r.okA ? 'b-ok' : 'b-bad') + '">' + (r.okA ? 'ผ่าน' : 'ไม่ผ่าน') + '</span></td>' +
			'<td><span class="badge ' + (r.okV ? 'b-ok' : 'b-bad') + '">' + (r.okV ? 'ผ่าน' : 'ไม่ผ่าน') + '</span></td>' +
			'<td>' + (s ? '⭐ แนะนำ' : (r.okA && r.okV ? '✓' : '—')) + '</td></tr>';
	});
	$('tbl').innerHTML = t + '</tbody></table>';
}

/* ══════════════ MODULE 2 : SHORT CIRCUIT ══════════════ */
$('scSz').innerHTML = SIZES.map(s => '<option ' + (s === 120 ? 'selected' : '') + '>' + s + '</option>').join('');
$('scSrc').onchange = function () {
	const t = $('scSrc').value === 'tx';
	$('txBox').style.display = t ? 'block' : 'none'; $('gridBox').style.display = t ? 'none' : 'block';
};

let SCD = {};
function calcSC() {
	const isTx = $('scSrc').value === 'tx';
	let V, Rs, Xs, srcTxt, Isc0;
	if (isTx) {
		const S = +$('txS').value * 1000, Z = +$('txZ').value, hv = +$('hvM').value;
		V = +$('txV').value;
		const Ztx = (Z / 100) * (V * V) / S, Rtx = Ztx * 0.1, Xtx = Math.sqrt(Math.max(0, Ztx * Ztx - Rtx * Rtx));
		let Rh = 0, Xh = 0;
		if (hv > 0) { const Zh = (V * V) / (hv * 1e6); Xh = Zh * 0.995; Rh = Zh * 0.1; }
		Rs = Rtx + Rh; Xs = Xtx + Xh;
		Isc0 = V / (Math.sqrt(3) * Math.sqrt(Rs * Rs + Xs * Xs));
		srcTxt = 'หม้อแปลง ' + $('txS').value + ' kVA, Uk=' + Z + '%';
	} else {
		V = +$('gV').value; const I0 = +$('gI').value * 1000;
		const Zt = V / (Math.sqrt(3) * I0); Rs = Zt * 0.15; Xs = Math.sqrt(Math.max(0, Zt * Zt - Rs * Rs));
		Isc0 = I0; srcTxt = 'จุดต้นทาง Isc = ' + $('gI').value + ' kA';
	}
	const sz = +$('scSz').value, L = +$('scL').value, n = +$('scN').value;
	const Rc = R70[sz] * (L / 1000) / n * 0.85, Xc = X_L[sz] * (L / 1000) / n;
	const Rt = Rs + Rc, Xt = Xs + Xc, Zt = Math.sqrt(Rt * Rt + Xt * Xt);
	const I3 = V / (Math.sqrt(3) * Zt);
	const I1 = V / Math.sqrt(3) / Math.sqrt(Rt * 2 * Rt * 2 + Xt * 2 * Xt * 2);
	const XR = Xt / Rt, kap = 1.02 + 0.98 * Math.exp(-3 / XR), Ip = Math.sqrt(2) * kap * I3;
	const k = +$('scIns').value, t = +$('scT').value;
	const Smin = I3 * Math.sqrt(t) / k;
	const kaPick = KA.find(x => x >= I3 / 1000) || KA[KA.length - 1];
	const okAdi = (sz * n) >= Smin, I2t = (I3 * I3) * t / 1e6;
	SCD = {
		V: V, Rs: Rs, Xs: Xs, Rc: Rc, Xc: Xc, Zt: Zt, I3: I3, I1: I1, Ip: Ip, XR: XR, kap: kap, Smin: Smin,
		kaPick: kaPick, okAdi: okAdi, I2t: I2t, Isc0: Isc0, srcTxt: srcTxt, sz: sz, n: n, L: L, k: k, t: t
	};

	$('scOut').innerHTML =
		'<div class="result big fire"><div class="l">กระแสลัดวงจร 3 เฟสสมมาตร (I″<sub>k3</sub>)</div>' +
		'<div class="n">' + (I3 / 1000).toFixed(2) + ' kA</div><div class="l">ที่ปลายสาย ' + sz + 'mm² × ' + n + ' ยาว ' + L + ' m</div></div>' +
		'<div class="result big pur" style="padding:16px"><div class="l">พิกัดตัดกระแสของเบรกเกอร์ที่ต้องเลือก</div>' +
		'<div class="n" style="font-size:1.9rem">Icu ≥ ' + kaPick + ' kA</div>' +
		'<div class="l">ที่ ' + V + ' V, 50 Hz — ควรเลือก Icu ≥ Isc เสมอ</div></div>' +
		'<div class="result"><h3 class="sec" style="margin-top:0">▸ อิมพีแดนซ์ในวงจร</h3>' +
		'<div class="kv"><span>แหล่งจ่าย</span><b>' + srcTxt + '</b></div>' +
		'<div class="kv"><span>Z แหล่งจ่าย (R + jX)</span><b>' + (Rs * 1000).toFixed(2) + ' + j' + (Xs * 1000).toFixed(2) + ' mΩ</b></div>' +
		'<div class="kv"><span>Z สายเคเบิล (R + jX)</span><b>' + (Rc * 1000).toFixed(2) + ' + j' + (Xc * 1000).toFixed(2) + ' mΩ</b></div>' +
		'<div class="kv"><span>Z รวม |Z|</span><b>' + (Zt * 1000).toFixed(2) + ' mΩ</b></div>' +
		'<div class="kv"><span>อัตราส่วน X/R</span><b>' + XR.toFixed(2) + ' (κ = ' + kap.toFixed(3) + ')</b></div></div>' +
		'<div class="result" style="border-left-color:var(--gold)"><h3 class="sec" style="margin-top:0">▸ ค่ากระแสลัดวงจรทุกรูปแบบ</h3>' +
		'<div class="kv"><span>Isc ที่ขั้วหม้อแปลง (ไม่มีสาย)</span><b>' + (Isc0 / 1000).toFixed(2) + ' kA</b></div>' +
		'<div class="kv"><span>I″<sub>k3</sub> — 3 เฟส (สูงสุด)</span><b>' + (I3 / 1000).toFixed(2) + ' kA</b></div>' +
		'<div class="kv"><span>I<sub>k1</sub> — 1 เฟสลงนิวทรัล</span><b>' + (I1 / 1000).toFixed(2) + ' kA</b></div>' +
		'<div class="kv"><span>i<sub>p</sub> — Peak (แรงกลสูงสุด)</span><b>' + (Ip / 1000).toFixed(2) + ' kA</b></div>' +
		'<div class="kv"><span>I²t ที่ผ่านสาย</span><b>' + I2t.toFixed(2) + ' MA²s</b></div></div>' +
		'<div class="result" style="border-left-color:' + (okAdi ? 'var(--ok)' : 'var(--bad)') + '">' +
		'<h3 class="sec" style="margin-top:0">▸ ตรวจสอบความทนความร้อน (Adiabatic — IEC 60364-4-43)</h3>' +
		'<div class="kv"><span>สูตร</span><b>S ≥ I√t / k</b></div>' +
		'<div class="kv"><span>ค่า k (ฉนวน/ตัวนำ)</span><b>' + k + '</b></div>' +
		'<div class="kv"><span>เวลาตัดวงจร t</span><b>' + t + ' s</b></div>' +
		'<div class="kv"><span>พื้นที่หน้าตัดขั้นต่ำ S<sub>min</sub></span><b>' + Smin.toFixed(2) + ' mm²</b></div>' +
		'<div class="kv"><span>สายที่ใช้จริง</span><b>' + sz + ' × ' + n + ' = ' + (sz * n) + ' mm² <span class="badge ' + (okAdi ? 'b-ok' : 'b-bad') + '">' + (okAdi ? 'ผ่าน ✓' : 'ไม่ผ่าน ✗') + '</span></b></div></div>' +
		(okAdi ? '' : '<div class="note" style="border-color:var(--bad)">❌ <b>สายทนกระแสลัดวงจรไม่ไหว</b> — ต้องเพิ่มขนาดสายเป็นอย่างน้อย <b>' + (SIZES.find(s => s >= Smin) || '>500') + ' mm²</b> หรือเลือก CB ที่ตัดเร็วกว่า (Current-Limiting) เพื่อลด I²t</div>');

	let h = '<table><thead><tr><th>ระยะสาย (m)</th><th>Z รวม (mΩ)</th><th>I″k3 (kA)</th><th>Ik1 (kA)</th><th>ip Peak (kA)</th><th>Icu ที่ต้องใช้</th></tr></thead><tbody>';
	[0, 5, 10, 20, 30, 50, 75, 100, 150, 200, 300, 500].forEach(function (dd) {
		const rc = R70[sz] * (dd / 1000) / n * 0.85, xc = X_L[sz] * (dd / 1000) / n;
		const rt = Rs + rc, xt = Xs + xc, zt = Math.sqrt(rt * rt + xt * xt);
		const i3 = V / (Math.sqrt(3) * zt), i1 = V / Math.sqrt(3) / Math.sqrt(rt * 2 * rt * 2 + xt * 2 * xt * 2);
		const xr = xt / rt, kp = 1.02 + 0.98 * Math.exp(-3 / xr), ip = Math.sqrt(2) * kp * i3;
		const ka = KA.find(x => x >= i3 / 1000) || KA[KA.length - 1];
		h += '<tr class="' + (dd === L ? 'pick' : '') + '"><td>' + dd + '</td><td>' + (zt * 1000).toFixed(2) + '</td>' +
			'<td><b>' + (i3 / 1000).toFixed(2) + '</b></td><td>' + (i1 / 1000).toFixed(2) + '</td>' +
			'<td>' + (ip / 1000).toFixed(2) + '</td><td>' + ka + ' kA</td></tr>';
	});
	$('scTbl').innerHTML = h + '</tbody></table>';
}

/* ══════════════ MODULE 3 : LOAD SCHEDULE ══════════════ */
const LTYPE = {
	light: { n: 'แสงสว่าง', pf: .9, c: 1 }, recep: { n: 'เต้ารับ', pf: .85, c: 0 },
	ac: { n: 'เครื่องปรับอากาศ', pf: .85, c: 1 }, motor: { n: 'มอเตอร์', pf: .8, c: 1 },
	heat: { n: 'เครื่องทำน้ำอุ่น/ฮีตเตอร์', pf: 1, c: 1 }, misc: { n: 'อื่น ๆ', pf: .85, c: 0 }
};
let ckt = 0, LSD = {};
function addRow(d) {
	d = d || {}; ckt++;
	const tr = document.createElement('tr');
	tr.innerHTML = '<td><b>' + ckt + '</b></td>' +
		'<td><input type="text" class="c-nm" value="' + (d.nm || 'วงจร ' + ckt) + '" style="min-width:110px"></td>' +
		'<td><select class="c-ty">' + Object.keys(LTYPE).map(k => '<option value="' + k + '" ' + (d.ty === k ? 'selected' : '') + '>' + LTYPE[k].n + '</option>').join('') + '</select></td>' +
		'<td><select class="c-ph"><option value="L1" ' + (d.ph === 'L1' ? 'selected' : '') + '>L1</option>' +
		'<option value="L2" ' + (d.ph === 'L2' ? 'selected' : '') + '>L2</option>' +
		'<option value="L3" ' + (d.ph === 'L3' ? 'selected' : '') + '>L3</option>' +
		'<option value="3P" ' + (d.ph === '3P' ? 'selected' : '') + '>3P</option></select></td>' +
		'<td><input type="number" class="c-w" value="' + (d.w || 1000) + '" style="width:78px"></td>' +
		'<td><input type="number" class="c-pf" value="' + (d.pf || 0.85) + '" step="0.05" style="width:58px"></td>' +
		'<td><input type="number" class="c-l" value="' + (d.l || 20) + '" style="width:58px"></td>' +
		'<td><input type="checkbox" class="c-ct" ' + (d.ct !== false ? 'checked' : '') + '></td>' +
		'<td class="o-i">-</td><td class="o-cb">-</td><td class="o-sz">-</td>' +
		'<td class="o-g">-</td><td class="o-vd">-</td><td class="o-p">-</td>' +
		'<td><button class="del" onclick="this.closest(\'tr\').remove();renum();calcLS()">✕</button></td>';
	$('lsBody').appendChild(tr);
	tr.querySelector('.c-ty').onchange = function (e) {
		tr.querySelector('.c-pf').value = LTYPE[e.target.value].pf;
		tr.querySelector('.c-ct').checked = !!LTYPE[e.target.value].c; calcLS();
	};
	tr.querySelectorAll('input,select').forEach(x => x.onchange = calcLS);
}
function renum() { [].slice.call($('lsBody').rows).forEach((r, i) => r.cells[0].innerHTML = '<b>' + (i + 1) + '</b>'); ckt = $('lsBody').rows.length; }
function autoBalance() {
	const rows = [].slice.call($('lsBody').rows).filter(r => r.querySelector('.c-ph').value !== '3P');
	const sum = { L1: 0, L2: 0, L3: 0 };
	rows.sort((a, b) => +b.querySelector('.c-w').value - +a.querySelector('.c-w').value)
		.forEach(function (r) {
			const p = Object.keys(sum).reduce((m, k) => sum[k] < sum[m] ? k : m, 'L1');
			r.querySelector('.c-ph').value = p; sum[p] += +r.querySelector('.c-w').value;
		});
	calcLS();
}
function loadDemo() {
	$('lsBody').innerHTML = ''; ckt = 0;
	[{ nm: 'ไฟส่องสว่างชั้น 1', ty: 'light', w: 1200, pf: .9, l: 25 },
	{ nm: 'ไฟส่องสว่างชั้น 2', ty: 'light', w: 900, pf: .9, l: 35 },
	{ nm: 'เต้ารับห้องนั่งเล่น', ty: 'recep', w: 2000, pf: .85, l: 18 },
	{ nm: 'เต้ารับห้องครัว', ty: 'recep', w: 3000, pf: .85, l: 22 },
	{ nm: 'แอร์ 18,000 BTU', ty: 'ac', w: 1800, pf: .85, l: 30 },
	{ nm: 'แอร์ 24,000 BTU', ty: 'ac', w: 2400, pf: .85, l: 32 },
	{ nm: 'เครื่องทำน้ำอุ่น 6kW', ty: 'heat', w: 6000, pf: 1, l: 15 },
	{ nm: 'ปั๊มน้ำ 1.5 HP', ty: 'motor', w: 1120, pf: .8, l: 40 },
	{ nm: 'มอเตอร์ 3 เฟส 5.5kW', ty: 'motor', ph: '3P', w: 5500, pf: .8, l: 45 }].forEach(addRow);
	autoBalance();
}
function calcLS() {
	const pv = $('pnSys').value.split('|'), sysPh = +pv[0], VLL = +pv[1], VLN = Math.round(VLL / Math.sqrt(3));
	const g = +$('pnGrp').value, kT = +$('pnT').value;
	const rows = [].slice.call($('lsBody').rows);
	const keys = Object.keys(K_GRP).map(Number).filter(k => k <= rows.length);
	const kG = K_GRP[keys.length ? keys[keys.length - 1] : 1];
	const sum = { L1: 0, L2: 0, L3: 0 }; let tot = 0, cvaSum = 0;
	rows.forEach(function (r) {
		const w = +r.querySelector('.c-w').value, pf = +r.querySelector('.c-pf').value;
		const L = +r.querySelector('.c-l').value, ct = r.querySelector('.c-ct').checked;
		const ph = r.querySelector('.c-ph').value, is3 = (ph === '3P' && sysPh === 3);
		const V = is3 ? VLL : (sysPh === 3 ? VLN : VLL);
		const I = is3 ? w / (Math.sqrt(3) * V * pf) : w / (V * pf);
		const res = sizeCircuit({ I: I, ph: is3 ? 3 : 1, V: V, L: L, g: g, kT: kT, kG: kG, vdLim: 3, cont: ct, pf: pf });
		r.querySelector('.o-i').textContent = I.toFixed(1);
		r.querySelector('.o-cb').innerHTML = '<b>' + res.cb + '</b>';
		r.querySelector('.o-sz').innerHTML = '<b style="color:#38bdf8">' + res.sz + '</b>';
		r.querySelector('.o-g').textContent = pickEGC(res.cb);
		r.querySelector('.o-vd').innerHTML = '<span class="badge ' + (res.vdp <= 3 ? 'b-ok' : 'b-bad') + '">' + res.vdp.toFixed(2) + '%</span>';
		r.querySelector('.o-p').textContent = pickPipe(is3 ? 4 : 3, res.sz);
		tot += w; cvaSum += w / pf;
		if (is3) { sum.L1 += w / 3; sum.L2 += w / 3; sum.L3 += w / 3; } else sum[ph] += w;
	});
	const mx = Math.max(sum.L1, sum.L2, sum.L3), avg = (sum.L1 + sum.L2 + sum.L3) / 3;
	const imb = avg > 0 ? ((mx - avg) / avg * 100) : 0;
	const col = { L1: '#ef4444', L2: '#eab308', L3: '#3b82f6' };
	let bh = '';
	if (sysPh === 3) {
		['L1', 'L2', 'L3'].forEach(function (k) {
			const pc = mx > 0 ? sum[k] / mx * 100 : 0;
			bh += '<div class="kv" style="border:none;padding-bottom:0"><span>เฟส ' + k + '</span><b>' + (sum[k] / 1000).toFixed(2) + ' kW</b></div>' +
				'<div class="bar"><div style="width:' + pc + '%;background:' + col[k] + '">' + (sum[k] / 1000).toFixed(2) + ' kW</div></div>';
		});
		bh += '<div class="kv" style="margin-top:10px"><span>ความไม่สมดุล (Imbalance)</span><b>' + imb.toFixed(1) +
			'% <span class="badge ' + (imb <= 10 ? 'b-ok' : imb <= 20 ? 'b-warn' : 'b-bad') + '">' + (imb <= 10 ? 'ดีมาก' : imb <= 20 ? 'พอรับได้' : 'ควรจัดใหม่') + '</span></b></div>' +
			'<div class="note">เกณฑ์แนะนำ: ความไม่สมดุลระหว่างเฟสไม่ควรเกิน <b>10%</b> — กดปุ่ม "⚖️ จัดสมดุลเฟสอัตโนมัติ" เพื่อจัดใหม่</div>';
	} else bh = '<div class="note">ระบบ 1 เฟส — ไม่มีการกระจายเฟส</div>';
	$('balOut').innerHTML = bh;

	const dfp = +$('pnDF').value, FL = +$('pnFL').value;
	const kVA = cvaSum / 1000, pfAvg = cvaSum > 0 ? tot / cvaSum : 0.85;
	const demandVA = cvaSum * dfp;
	const Imain = sysPh === 3 ? demandVA / (Math.sqrt(3) * VLL) : demandVA / VLL;
	const fr = sizeCircuit({ I: Imain, ph: sysPh, V: VLL, L: FL, g: g, kT: kT, kG: 1, vdLim: 2, cont: true, pf: pfAvg });
	LSD = {
		sysPh: sysPh, VLL: VLL, rows: rows.length, tot: tot, kVA: kVA, pfAvg: pfAvg, dfp: dfp,
		demandVA: demandVA, Imain: Imain, fr: fr, kG: kG, sum: sum, imb: imb
	};
	$('mainOut').innerHTML =
		'<div class="result big" style="padding:16px"><div class="l">เมนเบรกเกอร์ / สายป้อนตู้ ' + $('pnName').value + '</div>' +
		'<div class="n" style="font-size:1.9rem">' + fr.cb + ' AT — ' + fr.sz + ' mm²</div>' +
		'<div class="l">' + (sysPh === 3 ? '3P' : '1P') + ' • สายดิน ' + pickEGC(fr.cb) + ' mm² • ท่อ ' + pickPipe(sysPh === 3 ? 5 : 3, fr.sz) + '</div></div>' +
		'<div class="result">' +
		'<div class="kv"><span>จำนวนวงจรย่อยทั้งหมด</span><b>' + rows.length + ' วงจร</b></div>' +
		'<div class="kv"><span>โหลดติดตั้งรวม (Connected)</span><b>' + (tot / 1000).toFixed(2) + ' kW / ' + kVA.toFixed(2) + ' kVA</b></div>' +
		'<div class="kv"><span>PF เฉลี่ยถ่วงน้ำหนัก</span><b>' + pfAvg.toFixed(3) + '</b></div>' +
		'<div class="kv"><span>Demand Factor</span><b>' + dfp + '</b></div>' +
		'<div class="kv"><span>โหลดตามความต้องการ (Demand)</span><b>' + (demandVA / 1000).toFixed(2) + ' kVA</b></div>' +
		'<div class="kv"><span>กระแสเมน I<sub>main</sub></span><b>' + Imain.toFixed(1) + ' A</b></div>' +
		'<div class="kv"><span>กระแสออกแบบ (×1.25)</span><b>' + (Imain * 1.25).toFixed(1) + ' A</b></div>' +
		'<div class="kv"><span>พิกัดสายป้อนหลังลดค่า</span><b>' + fr.der.toFixed(1) + ' A</b></div>' +
		'<div class="kv"><span>แรงดันตกสายป้อน</span><b>' + fr.vd.toFixed(2) + ' V (' + fr.vdp.toFixed(2) + '%) <span class="badge ' + (fr.vdp <= 2 ? 'b-ok' : 'b-warn') + '">เกณฑ์ 2%</span></b></div>' +
		'<div class="kv"><span>สายต่อหลักดิน (ตาราง 4-2)</span><b>' + pickGEC(fr.sz) + ' mm²</b></div>' +
		'<div class="kv"><span>ตัวคูณ k<sub>G</sub> วงจรย่อย (' + rows.length + ' วงจร)</span><b>' + kG.toFixed(2) + '</b></div></div>' +
		'<div class="note">💡 %VD รวมทั้งระบบ (สายป้อน + วงจรย่อย) ไม่ควรเกิน <b>5%</b> ตาม วสท. — สายป้อนจึงคุมไว้ที่ 2%</div>';
}
function exportCSV() {
	let c = 'CKT,ชื่อวงจร,ชนิด,เฟส,W,PF,ยาว(m),I(A),CB(A),สาย(mm2),สายดิน(mm2),%VD,ท่อ\n';
	[].slice.call($('lsBody').rows).forEach(function (r, i) {
		const q = s => r.querySelector(s);
		c += [i + 1, q('.c-nm').value, LTYPE[q('.c-ty').value].n, q('.c-ph').value, q('.c-w').value,
		q('.c-pf').value, q('.c-l').value, q('.o-i').textContent, q('.o-cb').textContent,
		q('.o-sz').textContent, q('.o-g').textContent, q('.o-vd').textContent, q('.o-p').textContent].join(',') + '\n';
	});
	const b = new Blob(['\ufeff' + c], { type: 'text/csv;charset=utf-8' });
	const a = document.createElement('a'); a.href = URL.createObjectURL(b);
	a.download = 'LoadSchedule_' + $('pnName').value + '.csv'; a.click();
}

/* ══════════════ MODULE 4 : REFERENCE ══════════════ */
(function () {
	let h = '<table><thead><tr><th rowspan="2">mm²</th><th>ก.1</th><th>ก.2</th><th colspan="2">ก.3 ร้อยท่ออากาศ</th>' +
		'<th colspan="2">ก.4 หลายแกนท่อ</th><th colspan="2">ก.5 ท่อฝังดิน</th><th colspan="2">ก.6 ฝังดิน</th><th rowspan="2">ก.7</th></tr>' +
		'<tr><th>-</th><th>-</th><th>1φ</th><th>3φ</th><th>1φ</th><th>3φ</th><th>1φ</th><th>3φ</th><th>1φ</th><th>3φ</th></tr></thead><tbody>';
	SIZES.forEach(s => { h += '<tr><td><b>' + s + '</b></td>' + AMP[s].map(x => '<td>' + x + '</td>').join('') + '</tr>'; });
	$('refA').innerHTML = h + '</tbody></table>';
	$('refT').innerHTML = '<h3 class="sec" style="margin-top:0">ในอากาศ (ฐาน 40°C)</h3><table><tr>' +
		Object.keys(T_AIR).map(k => '<th>' + k + '°C</th>').join('') + '</tr><tr>' +
		Object.keys(T_AIR).map(k => '<td>' + T_AIR[k].toFixed(2) + '</td>').join('') + '</tr></table>' +
		'<h3 class="sec">ใต้ดิน (ฐาน 30°C)</h3><table><tr>' +
		Object.keys(T_SOIL).map(k => '<th>' + k + '°C</th>').join('') + '</tr><tr>' +
		Object.keys(T_SOIL).map(k => '<td>' + T_SOIL[k].toFixed(2) + '</td>').join('') + '</tr></table>';
	$('refG').innerHTML = '<table><thead><tr><th>จำนวนวงจร</th><th>ตัวคูณ</th></tr></thead><tbody>' +
		Object.keys(K_GRP).map(k => '<tr><td>' + (k === '7' ? '7-8' : k === '9' ? '9-12' : k === '13' ? '13-15' : k === '16' ? '16-20' : k) + '</td><td><b>' + K_GRP[k].toFixed(2) + '</b></td></tr>').join('') + '</tbody></table>';
	$('refE').innerHTML = '<table><thead><tr><th>พิกัด CB / OCPD (A)</th><th>สายดินทองแดง (mm²)</th></tr></thead><tbody>' +
		EGC.map(x => '<tr><td>ไม่เกิน ' + x[0] + '</td><td><b>' + x[1] + '</b></td></tr>').join('') + '</tbody></table>';
	$('refGE').innerHTML = '<table><thead><tr><th>ตัวนำประธาน (mm²)</th><th>สายต่อหลักดิน (mm²)</th></tr></thead><tbody>' +
		GEC.map(x => '<tr><td>' + (x[0] === 9999 ? 'มากกว่า 500' : 'ไม่เกิน ' + x[0]) + '</td><td><b>' + x[1] + '</b></td></tr>').join('') + '</tbody></table>';
	let r = '<table><thead><tr><th>mm²</th><th>R @70°C (Ω/km)</th><th>X (Ω/km)</th><th>Ø สาย (mm)</th><th>ท่อ 3 เส้น</th><th>ท่อ 5 เส้น</th></tr></thead><tbody>';
	SIZES.forEach(s => { r += '<tr><td><b>' + s + '</b></td><td>' + R70[s] + '</td><td>' + X_L[s] + '</td><td>' + OD[s] + '</td><td>' + pickPipe(3, s) + '</td><td>' + pickPipe(5, s) + '</td></tr>'; });
	$('refR').innerHTML = r + '</tbody></table>';
})();

/* ══════════════ MODULE 5 : REPORT A4 ══════════════ */
const TH_M = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
	'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
function thDate() { const d = new Date(); return d.getDate() + ' ' + TH_M[d.getMonth()] + ' ' + (d.getFullYear() + 543); }
function gv(id) { return $(id).value || '—'; }
function tg(ok, y, n) { return '<span class="tag ' + (ok ? 't-ok' : 't-no') + '">' + (ok ? (y || 'ผ่าน') : (n || 'ไม่ผ่าน')) + '</span>'; }
function optTxt(id) { const e = $(id); return e.options[e.selectedIndex].text; }

function printReport() {
	calc(); calcSC(); calcLS();
	const HEAD = '<div class="pg-head"><div class="ttl">รายงานการคำนวณระบบไฟฟ้า</div>' +
		'<div class="std">มาตรฐานการติดตั้งทางไฟฟ้าสำหรับประเทศไทย พ.ศ. 2564<br>วสท. 022001-22 &nbsp;|&nbsp; IEC 60909 / IEC 60364</div></div>';
	const FOOT = '<div class="pg-foot"><span>เอกสารเลขที่ ' + gv('rDoc') + ' &nbsp;•&nbsp; ' + gv('rProj') + '</span>' +
		'<span>จัดทำโดย Electrical Design Suite v2.1 &nbsp;•&nbsp; ' + thDate() + '</span></div>';
	let R = '';

	/* ── ปก ── */
	R += '<div class="sheet"><h1 class="rp">รายงานการคำนวณออกแบบระบบไฟฟ้า</h1>' +
		'<div class="sub">ELECTRICAL SYSTEM DESIGN CALCULATION REPORT</div>' +
		'<h2 class="rp">ข้อมูลโครงการ</h2><table class="kvt">' +
		'<tr><td>ชื่อโครงการ</td><td colspan="3">' + gv('rProj') + '</td></tr>' +
		'<tr><td>สถานที่ตั้ง</td><td colspan="3">' + gv('rLoc') + '</td></tr>' +
		'<tr><td>เอกสารเลขที่</td><td>' + gv('rDoc') + '</td><td>วันที่จัดทำ</td><td>' + thDate() + '</td></tr>' +
		'<tr><td>ผู้คำนวณ</td><td>' + gv('rBy') + '</td><td>ผู้ตรวจสอบ</td><td>' + gv('rChk') + '</td></tr>' +
		'<tr><td>เลขทะเบียน กว.</td><td>' + gv('rLic') + '</td><td>ระบบไฟฟ้า</td><td>' + optTxt('sys') + '</td></tr></table>' +
		'<h2 class="rp">มาตรฐานและข้อกำหนดที่ใช้อ้างอิง</h2>' +
		'<table class="rp"><thead><tr><th style="width:12%">ลำดับ</th><th class="l">รายการ</th></tr></thead><tbody>' +
		'<tr><td>1</td><td class="l">มาตรฐานการติดตั้งทางไฟฟ้าสำหรับประเทศไทย พ.ศ. 2564 (วสท. 022001-22)</td></tr>' +
		'<tr class="zebra"><td>2</td><td class="l">ตารางที่ 5-20 — ขนาดกระแสของสายไฟฟ้าทองแดงหุ้มฉนวน PVC</td></tr>' +
		'<tr><td>3</td><td class="l">ตารางที่ 5-24 / 5-25 — ตัวคูณลดกระแสตามอุณหภูมิโดยรอบ</td></tr>' +
		'<tr class="zebra"><td>4</td><td class="l">ตารางที่ 5-27 — ตัวคูณลดกระแสกรณีหลายวงจรในช่องเดินสายเดียวกัน</td></tr>' +
		'<tr><td>5</td><td class="l">ตารางที่ 4-1 / 4-2 — ขนาดสายดินบริภัณฑ์และสายต่อหลักดิน</td></tr>' +
		'<tr class="zebra"><td>6</td><td class="l">มอก. 11-2553 — สายไฟฟ้าหุ้มฉนวนพอลิไวนิลคลอไรด์</td></tr>' +
		'<tr><td>7</td><td class="l">IEC 60909 — Short-circuit currents in three-phase AC systems</td></tr>' +
		'<tr class="zebra"><td>8</td><td class="l">IEC 60364-4-43 — Protection against overcurrent (Adiabatic equation)</td></tr>' +
		'</tbody></table>' +
		'<h2 class="rp">สารบัญรายงาน</h2>' +
		'<table class="rp"><thead><tr><th style="width:14%">หัวข้อ</th><th class="l">เนื้อหา</th><th style="width:24%">สถานะ</th></tr></thead><tbody>' +
		'<tr><td>1</td><td class="l">การคำนวณขนาดสายไฟฟ้าและอุปกรณ์ป้องกัน</td><td>' + ($('s1').checked ? '✔ รวมอยู่ในรายงาน' : '— ไม่รวม') + '</td></tr>' +
		'<tr class="zebra"><td>2</td><td class="l">การคำนวณกระแสลัดวงจรและพิกัดตัดกระแส</td><td>' + ($('s2').checked ? '✔ รวมอยู่ในรายงาน' : '— ไม่รวม') + '</td></tr>' +
		'<tr><td>3</td><td class="l">ตารางโหลด (Load Schedule) และสมดุลเฟส</td><td>' + ($('s3').checked ? '✔ รวมอยู่ในรายงาน' : '— ไม่รวม') + '</td></tr>' +
		'<tr class="zebra"><td>ผนวก</td><td class="l">ตารางมาตรฐานอ้างอิง</td><td>' + ($('s4').checked ? '✔ รวมอยู่ในรายงาน' : '— ไม่รวม') + '</td></tr>' +
		'</tbody></table></div>';

	/* ── หมวด 1 ── */
	if ($('s1').checked) {
		const d = wireData(), pk = d.pick;
		R += '<div class="sheet"><h2 class="rp">หมวดที่ 1 — การคำนวณขนาดสายไฟฟ้าและอุปกรณ์ป้องกัน</h2>' +
			'<h3 class="rp">1.1 ข้อมูลนำเข้าและเงื่อนไขการติดตั้ง</h3><table class="kvt">' +
			'<tr><td>ระบบไฟฟ้า</td><td>' + d.ph + ' เฟส ' + d.V + ' V</td><td>ชนิดโหลด</td><td>' + (d.cont ? 'ต่อเนื่อง (Continuous)' : 'ไม่ต่อเนื่อง') + '</td></tr>' +
			'<tr><td>กำลังไฟฟ้า</td><td>' + d.P.toFixed(2) + ' kW</td><td>ตัวประกอบกำลัง</td><td>' + d.pf + '</td></tr>' +
			'<tr><td>ชนิดฉนวน</td><td>' + (d.ins === 'pvc' ? 'PVC 70 °C' : 'XLPE 90 °C') + '</td><td>ชนิดตัวนำ</td><td>' + (d.cond === 'cu' ? 'ทองแดง' : 'อะลูมิเนียม') + '</td></tr>' +
			'<tr><td>วิธีเดินสาย</td><td colspan="3">' + optTxt('grp') + '</td></tr>' +
			'<tr><td>' + (d.buried ? 'อุณหภูมิดิน' : 'อุณหภูมิอากาศ') + '</td><td>' + $('temp').value + ' °C</td><td>จำนวนวงจรร่วมท่อ</td><td>' + optTxt('grpN') + '</td></tr>' +
			'<tr><td>ความยาวสาย</td><td>' + d.L + ' เมตร</td><td>%VD ที่ยอมให้</td><td>' + d.vdLim + ' %</td></tr></table>' +
			'<h3 class="rp">1.2 ขั้นตอนการคำนวณ</h3>' +
			'<div class="fx">' + (d.ph === 3 ? 'I<sub>L</sub> = P / (√3 × V × PF)' : 'I<sub>L</sub> = P / (V × PF)') + ' = ' + d.I.toFixed(2) + ' A</div>' +
			'<div class="fx">I<sub>design</sub> = I<sub>L</sub> × ' + (d.cont ? '1.25' : '1.00') + ' = ' + d.Id.toFixed(2) + ' A &nbsp;→&nbsp; เลือก CB = ' + d.cb + ' A</div>' +
			'<div class="fx">I<sub>allow</sub> = I<sub>table</sub> × k<sub>T</sub> × k<sub>G</sub> = I<sub>table</sub> × ' + d.kT.toFixed(2) + ' × ' + d.kG.toFixed(2) + ' ≥ ' + d.cb + ' A</div>' +
			'<div class="fx">' + (d.ph === 3 ? 'ΔV = √3 × I × L × (R·cosφ + X·sinφ)' : 'ΔV = 2 × I × L × (R·cosφ + X·sinφ)') + '</div>';
		if (pk) {
			R += '<div class="ansbox"><div class="lb">ผลการคำนวณ — ขนาดตัวนำเฟสที่เลือกใช้</div>' +
				'<div class="vl">' + pk.sz + ' mm²</div><div class="nt">พิกัดกระแสใช้งานจริง ' + pk.der.toFixed(1) +
				' A ≥ พิกัด CB ' + d.cb + ' A &nbsp;|&nbsp; แรงดันตก ' + pk.vp.toFixed(2) + '% ≤ ' + d.vdLim + '%</div></div>' +
				'<h3 class="rp">1.3 สรุปอุปกรณ์ที่ต้องใช้</h3>' +
				'<table class="rp"><thead><tr><th class="l" style="width:40%">รายการ</th><th>ขนาด / พิกัด</th><th>อ้างอิง</th><th>ผลตรวจสอบ</th></tr></thead><tbody>' +
				'<tr><td class="l">เซอร์กิตเบรกเกอร์ (OCPD)</td><td><b>' + d.cb + ' AT</b></td><td>วสท. ข้อ 3.4</td><td>' + tg(true) + '</td></tr>' +
				'<tr class="zebra"><td class="l">ตัวนำเฟส</td><td><b>' + (d.ph === 3 ? 3 : 1) + ' × ' + pk.sz + ' mm²</b></td><td>ตาราง 5-20</td><td>' + tg(pk.okA) + '</td></tr>' +
				'<tr><td class="l">ตัวนำนิวทรัล</td><td><b>1 × ' + pk.sz + ' mm²</b></td><td>วสท. ข้อ 5.1</td><td>' + tg(true) + '</td></tr>' +
				'<tr class="zebra"><td class="l">สายดินบริภัณฑ์ (EGC)</td><td><b>' + pickEGC(d.cb) + ' mm²</b></td><td>ตาราง 4-1</td><td>' + tg(true) + '</td></tr>' +
				'<tr><td class="l">สายต่อหลักดิน (GEC)</td><td><b>' + pickGEC(pk.sz) + ' mm²</b></td><td>ตาราง 4-2</td><td>' + tg(true) + '</td></tr>' +
				'<tr class="zebra"><td class="l">ท่อร้อยสาย (Fill 40%)</td><td><b>' + pickPipe((d.ph === 3 ? 4 : 2) + 1, pk.sz) + '</b></td><td>วสท. บทที่ 5</td><td>' + tg(true) + '</td></tr>' +
				'<tr><td class="l">แรงดันตกที่ปลายวงจร</td><td><b>' + pk.vv.toFixed(2) + ' V (' + pk.vp.toFixed(2) + '%)</b></td><td>วสท. ข้อ 3.5</td><td>' + tg(pk.okV) + '</td></tr>' +
				'</tbody></table>';
		} else {
			R += '<div class="ansbox red"><div class="lb">ผลการคำนวณ</div><div class="vl">ไม่ผ่านเกณฑ์</div>' +
				'<div class="nt">ไม่มีขนาดสายเดี่ยวที่รองรับได้ — ต้องเดินสายควบหรือทบทวนเงื่อนไขการติดตั้ง</div></div>';
		}
		R += '</div><div class="sheet"><h3 class="rp">1.4 ตารางเปรียบเทียบขนาดสายไฟฟ้าทุกขนาด</h3>' +
			'<table class="rp"><thead><tr><th>ขนาด<br>(mm²)</th><th>พิกัดในตาราง<br>I<sub>table</sub> (A)</th>' +
			'<th>ตัวคูณลด<br>k<sub>T</sub>×k<sub>G</sub></th><th>พิกัดใช้งานจริง<br>I<sub>allow</sub> (A)</th>' +
			'<th>แรงดันตก<br>ΔV (V)</th><th>%VD</th><th>เกณฑ์<br>กระแส</th><th>เกณฑ์<br>แรงดัน</th><th>สรุปผล</th></tr></thead><tbody>' +
			d.rows.map(function (r, i) {
				const s = pk && r.sz === pk.sz; return '<tr class="' + (s ? 'hl' : (i % 2 ? 'zebra' : '')) + '">' +
					'<td><b>' + r.sz + '</b></td><td>' + r.base.toFixed(0) + '</td><td>' + (d.kT * d.kG).toFixed(3) + '</td>' +
					'<td>' + r.der.toFixed(1) + '</td><td>' + r.vv.toFixed(2) + '</td><td>' + r.vp.toFixed(2) + '%</td>' +
					'<td>' + tg(r.okA) + '</td><td>' + tg(r.okV) + '</td>' +
					'<td>' + (s ? '★ เลือกใช้' : (r.okA && r.okV ? 'ใช้ได้' : '—')) + '</td></tr>';
			}).join('') +
			'</tbody></table>' +
			'<div class="warn">หมายเหตุ: แถวที่ไฮไลต์สีเหลืองคือขนาดสายที่เล็กที่สุดซึ่งผ่านทั้งเกณฑ์พิกัดกระแสและเกณฑ์แรงดันตกพร้อมกัน ตามหลักการออกแบบที่ประหยัดและปลอดภัยตามมาตรฐาน วสท.</div></div>';
	}

	/* ── หมวด 2 ── */
	if ($('s2').checked) {
		const S = SCD;
		R += '<div class="sheet"><h2 class="rp">หมวดที่ 2 — การคำนวณกระแสลัดวงจร (Short-Circuit Current)</h2>' +
			'<h3 class="rp">2.1 ข้อมูลแหล่งจ่ายและวงจร</h3><table class="kvt">' +
			'<tr><td>แหล่งจ่าย</td><td colspan="3">' + ($('scSrc').value === 'tx'
				? 'หม้อแปลงจำหน่าย ' + $('txS').value + ' kVA, Uk = ' + $('txZ').value + '%, ' + $('txV').value + ' V'
				: 'จุดต่อที่ทราบค่า Isc = ' + $('gI').value + ' kA ที่ ' + $('gV').value + ' V') + '</td></tr>' +
			'<tr><td>Fault Level ระบบ HV</td><td>' + ($('scSrc').value === 'tx' ? optTxt('hvM') : '—') + '</td>' +
			'<td>สายเคเบิล</td><td>' + S.sz + ' mm² × ' + S.n + ' เส้น/เฟส</td></tr>' +
			'<tr><td>ความยาวสาย</td><td>' + S.L + ' เมตร</td><td>เวลาตัดวงจร (t)</td><td>' + S.t + ' วินาที</td></tr>' +
			'<tr><td>ค่าคงที่ k</td><td colspan="3">' + optTxt('scIns') + '</td></tr></table>' +
			'<h3 class="rp">2.2 สมการที่ใช้</h3>' +
			'<div class="fx">Z<sub>tx</sub> = (U<sub>k</sub>% / 100) × V² / S &nbsp;&nbsp;|&nbsp;&nbsp; Z<sub>sys</sub> = V² / S<sub>sc</sub></div>' +
			'<div class="fx">I″<sub>k3</sub> = V / (√3 × |Z<sub>total</sub>|) &nbsp;&nbsp;|&nbsp;&nbsp; i<sub>p</sub> = √2 × κ × I″<sub>k3</sub></div>' +
			'<div class="fx">S<sub>min</sub> = I √t / k &nbsp;&nbsp; (IEC 60364-4-43 — Adiabatic)</div>' +
			'<h3 class="rp">2.3 ผลการคำนวณ</h3><div class="duo">' +
			'<div class="ansbox red"><div class="lb">กระแสลัดวงจร 3 เฟสสมมาตร I″<sub>k3</sub></div>' +
			'<div class="vl">' + (S.I3 / 1000).toFixed(2) + ' kA</div><div class="nt">ที่จุดปลายสายเคเบิล</div></div>' +
			'<div class="ansbox pur"><div class="lb">พิกัดตัดกระแสเบรกเกอร์ที่ต้องเลือก</div>' +
			'<div class="vl" style="font-size:17pt">Icu ≥ ' + S.kaPick + ' kA</div><div class="nt">ที่ ' + S.V + ' V, 50 Hz</div></div></div>' +
			'<table class="rp"><thead><tr><th class="l" style="width:52%">รายการ</th><th>ค่าที่คำนวณได้</th></tr></thead><tbody>' +
			'<tr><td class="l">Z แหล่งจ่าย (R + jX)</td><td><b>' + (S.Rs * 1000).toFixed(2) + ' + j' + (S.Xs * 1000).toFixed(2) + ' mΩ</b></td></tr>' +
			'<tr class="zebra"><td class="l">Z สายเคเบิล (R + jX)</td><td><b>' + (S.Rc * 1000).toFixed(2) + ' + j' + (S.Xc * 1000).toFixed(2) + ' mΩ</b></td></tr>' +
			'<tr><td class="l">Z รวม |Z<sub>total</sub>|</td><td><b>' + (S.Zt * 1000).toFixed(2) + ' mΩ</b></td></tr>' +
			'<tr class="zebra"><td class="l">อัตราส่วน X/R (κ)</td><td><b>' + S.XR.toFixed(2) + ' (κ = ' + S.kap.toFixed(3) + ')</b></td></tr>' +
			'<tr><td class="l">Isc ที่ขั้วแหล่งจ่าย (ไม่รวมสาย)</td><td><b>' + (S.Isc0 / 1000).toFixed(2) + ' kA</b></td></tr>' +
			'<tr class="zebra"><td class="l">I″<sub>k3</sub> — ลัดวงจร 3 เฟส (สูงสุด)</td><td><b>' + (S.I3 / 1000).toFixed(2) + ' kA</b></td></tr>' +
			'<tr><td class="l">I<sub>k1</sub> — ลัดวงจร 1 เฟสลงนิวทรัล</td><td><b>' + (S.I1 / 1000).toFixed(2) + ' kA</b></td></tr>' +
			'<tr class="zebra"><td class="l">i<sub>p</sub> — กระแสยอด (Peak)</td><td><b>' + (S.Ip / 1000).toFixed(2) + ' kA</b></td></tr>' +
			'<tr><td class="l">พลังงาน I²t ที่ผ่านตัวนำ</td><td><b>' + S.I2t.toFixed(2) + ' MA²s</b></td></tr>' +
			'</tbody></table>' +
			'<h3 class="rp">2.4 ตรวจสอบความทนความร้อนของตัวนำ (Adiabatic Check)</h3>' +
			'<table class="rp"><thead><tr><th class="l" style="width:40%">รายการตรวจสอบ</th><th>ค่า</th><th>เกณฑ์</th><th>ผล</th></tr></thead><tbody>' +
			'<tr><td class="l">ค่าคงที่วัสดุ k</td><td><b>' + S.k + '</b></td><td>IEC 60364</td><td>—</td></tr>' +
			'<tr class="zebra"><td class="l">เวลาตัดวงจร t</td><td><b>' + S.t + ' s</b></td><td>ตามพิกัด CB</td><td>—</td></tr>' +
			'<tr><td class="l">พื้นที่หน้าตัดขั้นต่ำ S<sub>min</sub> = I√t/k</td><td><b>' + S.Smin.toFixed(2) + ' mm²</b></td><td>ต้อง ≤ สายที่ใช้</td><td>—</td></tr>' +
			'<tr class="zebra"><td class="l">พื้นที่หน้าตัดที่ใช้จริง</td><td><b>' + S.sz + ' × ' + S.n + ' = ' + (S.sz * S.n) + ' mm²</b></td><td>≥ ' + S.Smin.toFixed(2) + ' mm²</td><td>' + tg(S.okAdi) + '</td></tr>' +
			'</tbody></table>' +
			(S.okAdi ? '<div class="warn">ผลการตรวจสอบผ่านเกณฑ์ — ตัวนำสามารถทนพลังงานความร้อน I²t ที่เกิดขึ้นระหว่างการลัดวงจรได้จนกว่าอุปกรณ์ป้องกันจะตัดวงจร โดยฉนวนไม่เสียหาย</div>'
				: '<div class="warn" style="border-color:#b91c1c;background:#fef2f2;color:#7f1d1d"><b>ไม่ผ่านเกณฑ์</b> — ต้องเพิ่มขนาดตัวนำเป็นอย่างน้อย ' + (SIZES.find(s => s >= S.Smin) || '>500') + ' mm² หรือเลือกอุปกรณ์ป้องกันชนิดจำกัดกระแส (Current-Limiting) เพื่อลดค่า I²t</div>') +
			'</div>' +
			'<div class="sheet land"><h3 class="rp">2.5 การลดทอนกระแสลัดวงจรตามระยะทางสายเคเบิล</h3>' +
			$('scTbl').innerHTML.replace('<table>', '<table class="rp">') +
			'<div class="warn">ค่า Isc ลดลงตามระยะทางเนื่องจากอิมพีแดนซ์ของสายเคเบิลที่เพิ่มขึ้น ใช้ตารางนี้เพื่อเลือกพิกัด Icu ของเบรกเกอร์ในแต่ละตำแหน่งของระบบได้อย่างเหมาะสมและประหยัด</div></div>';
	}

	/* ── หมวด 3 ── */
	if ($('s3').checked) {
		const rows = [].slice.call($('lsBody').rows);
		let body = '';
		rows.forEach(function (r, i) {
			const q = s => r.querySelector(s);
			body += '<tr class="' + (i % 2 ? 'zebra' : '') + '"><td>' + (i + 1) + '</td><td class="l">' + q('.c-nm').value + '</td>' +
				'<td class="l">' + LTYPE[q('.c-ty').value].n + '</td><td>' + q('.c-ph').value + '</td>' +
				'<td class="r">' + (+q('.c-w').value).toLocaleString() + '</td><td>' + q('.c-pf').value + '</td>' +
				'<td>' + q('.c-l').value + '</td><td>' + (q('.c-ct').checked ? '✔' : '–') + '</td>' +
				'<td>' + q('.o-i').innerText + '</td><td><b>' + q('.o-cb').innerText + '</b></td>' +
				'<td><b>' + q('.o-sz').innerText + '</b></td><td>' + q('.o-g').innerText + '</td>' +
				'<td>' + q('.o-vd').innerText + '</td><td>' + q('.o-p').innerText + '</td></tr>';
		});
		const L = LSD;
		R += '<div class="sheet land"><h2 class="rp">หมวดที่ 3 — ตารางโหลด (Load Schedule) : ตู้ ' + gv('pnName') + '</h2>' +
			'<table class="kvt"><tr><td>ระบบไฟฟ้า</td><td>' + optTxt('pnSys') + '</td>' +
			'<td>วิธีเดินสายวงจรย่อย</td><td>' + optTxt('pnGrp') + '</td>' +
			'<td>อุณหภูมิ</td><td>' + optTxt('pnT') + '</td>' +
			'<td>Demand Factor</td><td>' + $('pnDF').value + '</td></tr></table>' +
			'<table class="rp"><thead><tr><th>CKT</th><th class="l">ชื่อวงจร</th><th class="l">ชนิดโหลด</th><th>เฟส</th>' +
			'<th>โหลด<br>(W)</th><th>PF</th><th>ยาว<br>(m)</th><th>ต่อ<br>เนื่อง</th><th>I<sub>L</sub><br>(A)</th>' +
			'<th>CB<br>(AT)</th><th>สาย<br>(mm²)</th><th>สายดิน<br>(mm²)</th><th>%VD</th><th>ท่อ</th></tr></thead>' +
			'<tbody>' + body + '</tbody><tfoot><tr><td colspan="4">รวมโหลดติดตั้งทั้งหมด</td>' +
			'<td class="r">' + L.tot.toLocaleString() + '</td><td colspan="9" class="l">&nbsp;= ' + (L.tot / 1000).toFixed(2) + ' kW &nbsp;(' + L.rows + ' วงจร)</td></tr></tfoot></table></div>' +
			'<div class="sheet"><h2 class="rp">หมวดที่ 3 (ต่อ) — สรุปผลตู้ ' + gv('pnName') + '</h2>' +
			'<h3 class="rp">3.1 การกระจายโหลดและสมดุลเฟส</h3>';
		if (L.sysPh === 3) {
			R += '<table class="rp"><thead><tr><th>เฟส</th><th>โหลด (kW)</th><th>สัดส่วน</th></tr></thead><tbody>' +
				['L1', 'L2', 'L3'].map(function (k, i) {
					const mx = Math.max(L.sum.L1, L.sum.L2, L.sum.L3);
					return '<tr class="' + (i % 2 ? 'zebra' : '') + '"><td><b>' + k + '</b></td><td>' + (L.sum[k] / 1000).toFixed(2) + '</td>' +
						'<td>' + (mx > 0 ? (L.sum[k] / mx * 100).toFixed(1) : '0') + ' %</td></tr>';
				}).join('') +
				'<tr><td colspan="2">ความไม่สมดุลระหว่างเฟส (Imbalance)</td><td><b>' + L.imb.toFixed(1) + ' % ' +
				tg(L.imb <= 10, 'ผ่าน', 'เกินเกณฑ์') + '</b></td></tr></tbody></table>';
		} else R += '<div class="warn">ระบบไฟฟ้า 1 เฟส — ไม่มีการกระจายเฟส</div>';
		R += '<h3 class="rp">3.2 สรุปเมนเบรกเกอร์และสายป้อน</h3>' +
			'<div class="ansbox"><div class="lb">เมนเบรกเกอร์และสายป้อนที่เลือกใช้</div>' +
			'<div class="vl">' + L.fr.cb + ' AT — ' + L.fr.sz + ' mm²</div>' +
			'<div class="nt">' + (L.sysPh === 3 ? '3 เฟส 4 สาย' : '1 เฟส 2 สาย') + ' • สายดิน ' + pickEGC(L.fr.cb) +
			' mm² • ท่อ ' + pickPipe(L.sysPh === 3 ? 5 : 3, L.fr.sz) + '</div></div>' +
			'<table class="rp"><thead><tr><th class="l" style="width:55%">รายการ</th><th>ค่า</th><th>ผล</th></tr></thead><tbody>' +
			'<tr><td class="l">จำนวนวงจรย่อยทั้งหมด</td><td><b>' + L.rows + ' วงจร</b></td><td>—</td></tr>' +
			'<tr class="zebra"><td class="l">โหลดติดตั้งรวม (Connected Load)</td><td><b>' + (L.tot / 1000).toFixed(2) + ' kW / ' + L.kVA.toFixed(2) + ' kVA</b></td><td>—</td></tr>' +
			'<tr><td class="l">ตัวประกอบกำลังเฉลี่ยถ่วงน้ำหนัก</td><td><b>' + L.pfAvg.toFixed(3) + '</b></td><td>—</td></tr>' +
			'<tr class="zebra"><td class="l">Demand Factor ที่ใช้</td><td><b>' + L.dfp + '</b></td><td>วสท. บทที่ 3</td></tr>' +
			'<tr><td class="l">โหลดตามความต้องการ (Demand Load)</td><td><b>' + (L.demandVA / 1000).toFixed(2) + ' kVA</b></td><td>—</td></tr>' +
			'<tr class="zebra"><td class="l">กระแสเมน I<sub>main</sub></td><td><b>' + L.Imain.toFixed(1) + ' A</b></td><td>—</td></tr>' +
			'<tr><td class="l">กระแสออกแบบ (×1.25)</td><td><b>' + (L.Imain * 1.25).toFixed(1) + ' A</b></td><td>วสท. ข้อ 3.4</td></tr>' +
			'<tr class="zebra"><td class="l">พิกัดกระแสสายป้อนหลังลดค่า</td><td><b>' + L.fr.der.toFixed(1) + ' A</b></td><td>' + tg(L.fr.der >= L.fr.cb) + '</td></tr>' +
			'<tr><td class="l">แรงดันตกสายป้อน (เกณฑ์ 2%)</td><td><b>' + L.fr.vd.toFixed(2) + ' V (' + L.fr.vdp.toFixed(2) + '%)</b></td><td>' + tg(L.fr.vdp <= 2) + '</td></tr>' +
			'<tr class="zebra"><td class="l">สายต่อหลักดิน (ตาราง 4-2)</td><td><b>' + pickGEC(L.fr.sz) + ' mm²</b></td><td>' + tg(true) + '</td></tr>' +
			'<tr><td class="l">ตัวคูณลดกระแส k<sub>G</sub> (วงจรย่อยร่วมท่อ)</td><td><b>' + L.kG.toFixed(2) + '</b></td><td>ตาราง 5-27</td></tr>' +
			'</tbody></table>' +
			'<div class="warn">เกณฑ์ควบคุม: แรงดันตกสายป้อนไม่เกิน 2% และวงจรย่อยไม่เกิน 3% รวมทั้งระบบจากหม้อแปลงถึงจุดใช้ไฟไม่เกิน 5% ตามข้อกำหนด วสท. 2564 ข้อ 3.5 &nbsp;•&nbsp; ความไม่สมดุลระหว่างเฟสไม่ควรเกิน 10%</div></div>';
	}

	/* ── ภาคผนวก ── */
	if ($('s4').checked) {
		R += '<div class="sheet land"><h2 class="rp">ภาคผนวก ก — ตารางพิกัดกระแสสายทองแดงหุ้มฉนวน PVC 70 °C</h2>' +
			'<div style="font-size:8.5pt;color:#555;margin-bottom:2mm">อ้างอิง วสท. 2564 ตารางที่ 5-20 (อุณหภูมิอากาศ 40 °C / อุณหภูมิดิน 30 °C) หน่วย: แอมแปร์</div>' +
			$('refA').innerHTML.replace('<table>', '<table class="rp">') + '</div>' +
			'<div class="sheet"><h2 class="rp">ภาคผนวก ข — ตัวคูณลดกระแสและขนาดสายดิน</h2>' +
			'<h3 class="rp">ข.1 ตัวคูณลดกระแสตามอุณหภูมิ (ตารางที่ 5-24 / 5-25)</h3>' +
			$('refT').innerHTML.replace(/<table>/g, '<table class="rp">').replace(/<h3 class="sec"[^>]*>/g, '<h3 class="rp">') +
			'<h3 class="rp">ข.2 ตัวคูณลดกระแสตามจำนวนวงจร (ตารางที่ 5-27)</h3>' +
			$('refG').innerHTML.replace('<table>', '<table class="rp">') +
			'<div class="duo" style="margin-top:4mm">' +
			'<div><h3 class="rp">ข.3 สายดินบริภัณฑ์ (ตารางที่ 4-1)</h3>' + $('refE').innerHTML.replace('<table>', '<table class="rp">') + '</div>' +
			'<div><h3 class="rp">ข.4 สายต่อหลักดิน (ตารางที่ 4-2)</h3>' + $('refGE').innerHTML.replace('<table>', '<table class="rp">') + '</div>' +
			'</div></div>' +
			'<div class="sheet"><h2 class="rp">ภาคผนวก ค — ค่าคงที่ตัวนำและขนาดท่อร้อยสาย</h2>' +
			$('refR').innerHTML.replace('<table>', '<table class="rp">') + '</div>';
	}

	/* ── ลงนาม ── */
	R += '<div class="sheet"><h2 class="rp">การรับรองผลการคำนวณ</h2><table class="kvt">' +
		'<tr><td>ชื่อโครงการ</td><td colspan="3">' + gv('rProj') + '</td></tr>' +
		'<tr><td>เอกสารเลขที่</td><td>' + gv('rDoc') + '</td><td>วันที่</td><td>' + thDate() + '</td></tr></table>' +
		($('sSig').checked ? '<div class="sig">' +
			'<div><div class="ln"></div>( ' + gv('rBy') + ' )<br>ผู้คำนวณ / ผู้จัดทำ<br>วันที่ ......../......../........</div>' +
			'<div><div class="ln"></div>( ' + gv('rChk') + ' )<br>วิศวกรไฟฟ้าผู้ตรวจสอบและรับรอง<br>ใบอนุญาตเลขที่ ' + gv('rLic') + '<br>วันที่ ......../......../........</div>' +
			'</div>' : '') +
		'<div class="disc"><b>ข้อจำกัดความรับผิดชอบ (Disclaimer)</b><br>' +
		'รายงานฉบับนี้จัดทำโดยโปรแกรมช่วยคำนวณอัตโนมัติ ผลลัพธ์เป็นการประมาณการเชิงวิศวกรรมเบื้องต้น ' +
		'อ้างอิงตารางและสมการตามมาตรฐานการติดตั้งทางไฟฟ้าสำหรับประเทศไทย พ.ศ. 2564 (วสท. 022001-22) ' +
		'ร่วมกับ IEC 60909 และ IEC 60364-4-43<br><br>' +
		'ผู้ใช้งานมีหน้าที่ตรวจสอบความถูกต้องของข้อมูลนำเข้า เงื่อนไขการติดตั้งจริง ค่าพิกัดจากผู้ผลิตอุปกรณ์ ' +
		'และตารางมาตรฐานฉบับสมบูรณ์ก่อนนำไปใช้งาน การนำผลการคำนวณไปใช้ในการก่อสร้างหรือติดตั้งจริง ' +
		'ต้องได้รับการตรวจสอบและลงนามรับรองโดยวิศวกรไฟฟ้าผู้ได้รับใบอนุญาตประกอบวิชาชีพวิศวกรรมควบคุม (กว.) ' +
		'ตามพระราชบัญญัติวิศวกร พ.ศ. 2542 เท่านั้น</div></div>';

	$('report').innerHTML = HEAD + FOOT + '<div class="rp-body">' + R + '</div>';
	setTimeout(function () { window.print(); }, 150);
}

/* ══════════════ INIT ══════════════ */
calc(); calcSC(); loadDemo();
