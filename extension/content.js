// ⚡ Shopee Affiliate Data Extractor v4.0 — Multi-Image Gallery Extraction Engine
(function () {
    console.log("⚡ Shopee Affiliate Data Extractor v4.0 Active");

    if (document.getElementById("shopeeExtractorControlPanel")) return;

    let isPickModeActive = false;
    let selectedProductsMap = new Map();
    let extractedTitlesInServerDB = new Set();

    function syncExistingProductsFromDB() {
        fetch("http://127.0.0.1:8080/api/fetch_products")
            .then(res => res.json())
            .then(data => {
                if (data && data.items) {
                    extractedTitlesInServerDB.clear();
                    data.items.forEach(item => {
                        if (item.title) {
                            extractedTitlesInServerDB.add(item.title.trim());
                        }
                    });
                    console.log(`⚡ Extension synced ${extractedTitlesInServerDB.size} existing DB products!`);
                    markAlreadyExtractedProductsOnPage();
                }
            })
            .catch(err => console.log("DB sync note:", err));
    }

    function isProductAlreadyInDB(title) {
        if (!title) return false;
        const clean = title.replace(/\n/g, ' ').trim();
        return extractedTitlesInServerDB.has(clean);
    }

    function markCardAsAlreadyExtracted(card) {
        if (!card) return;
        card.style.outline = "2px dashed #0284c7";
        card.style.outlineOffset = "-2px";
        card.style.opacity = "0.75";
        
        if (!card.querySelector(".ext-already-badge")) {
            const badge = document.createElement("div");
            badge.className = "ext-already-badge";
            badge.style.cssText = `
                position: absolute;
                top: 6px;
                right: 6px;
                z-index: 9999;
                background: #0284c7;
                color: #ffffff;
                font-size: 10px;
                font-weight: 700;
                padding: 2px 6px;
                border-radius: 6px;
                box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                font-family: sans-serif;
            `;
            badge.innerText = "📦 มีใน DB แล้ว";
            if (window.getComputedStyle(card).position === 'static') {
                card.style.position = 'relative';
            }
            card.appendChild(badge);
        }
    }

    function markAlreadyExtractedProductsOnPage() {
        const cards = document.querySelectorAll("a[href*='/product/'], a[href*='-i.'], .shopee-search-item-result__item");
        cards.forEach(card => {
            const rawTitle = card.querySelector("h1, ._44qnta, .vioxSu, [title]")?.innerText || card.innerText || "";
            const cleanTitle = rawTitle.replace(/\n/g, ' ').trim();
            if (cleanTitle && isProductAlreadyInDB(cleanTitle)) {
                markCardAsAlreadyExtracted(card);
            }
        });
    }

    // ✅ UNIVERSAL CARD FINDER — ค้นหาการ์ดสินค้าจาก Shopee CDN image + walk up DOM
    // ใช้ได้ทุกหน้า Shopee/Affiliate ไม่ขึ้นกับ class name
    function findProductCardsOnPage() {
        // Step 1: Find all Shopee CDN product images
        const productImgs = Array.from(document.querySelectorAll('img')).filter(img => {
            const src = img.src || img.currentSrc || img.getAttribute('data-src') || '';
            return src.includes('susercontent.com') || src.includes('shopee.com/file/');
        });

        const cardSet = new Set();
        const cards = [];

        productImgs.forEach(img => {
            let el = img.parentElement;

            // Walk up DOM from image to find card container (has price text ฿)
            while (el && el !== document.body && el !== document.documentElement) {
                const text = el.innerText || '';
                const hasPrice = /฿\s*[\d,]+/.test(text) || /[\d,]+\s*บาท/.test(text);

                if (hasPrice) {
                    // Make sure this isn't a large container with multiple products
                    const imgCount = el.querySelectorAll('img[src*="susercontent"]').length;
                    if (imgCount <= 2 && !cardSet.has(el)) {
                        cardSet.add(el);
                        cards.push(el);
                    }
                    break;
                }
                el = el.parentElement;
            }
        });

        console.log(`⚡ findProductCardsOnPage: found ${cards.length} product cards`);
        return cards;
    }

    // Run DB sync on extension start
    syncExistingProductsFromDB();

    // Helper: Convert Image Element or URL to Base64 Data URI
    function getImageBase64(imgEl) {
        return new Promise((resolve) => {
            if (!imgEl || !imgEl.src) {
                resolve("");
                return;
            }
            try {
                const canvas = document.createElement("canvas");
                canvas.width = imgEl.naturalWidth || imgEl.width || 300;
                canvas.height = imgEl.naturalHeight || imgEl.height || 300;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(imgEl, 0, 0, canvas.width, canvas.height);
                const dataURL = canvas.toDataURL("image/jpeg", 0.85);
                resolve(dataURL);
            } catch (e) {
                resolve(imgEl.src);
            }
        });
    }

    function cleanShopeeHDImageUrl(rawUrl) {
        if (!rawUrl) return "";
        let url = rawUrl.trim();
        if (url.startsWith("//")) url = "https:" + url;
        url = url.replace(/_tn(?:\.jpg|\.png)?$/i, "")
                 .replace(/_tn$/i, "")
                 .replace(/@resize_[^?#]+/i, "");
        return url;
    }

    // Helper: Extract ALL Multi-Image Gallery URLs for a product card or page
    async function extractProductGalleryImages(container) {
        const gallery = [];
        const urlsSet = new Set();
        const root = container || document.body;

        // 1. Scan <img> elements
        const imgEls = root.querySelectorAll("img");
        for (const img of imgEls) {
            let src = img.currentSrc || img.src || img.getAttribute("srcset") || "";
            if (!src) continue;
            let hdUrl = cleanShopeeHDImageUrl(src);
            if ((hdUrl.includes("susercontent") || hdUrl.includes("file/")) && !urlsSet.has(hdUrl) && !hdUrl.includes("avatar") && !hdUrl.includes("icon") && !hdUrl.includes("logo")) {
                urlsSet.add(hdUrl);
                gallery.push(hdUrl);
            }
            if (gallery.length >= 10) break;
        }

        // 2. Scan background-image elements for gallery thumbnails
        if (gallery.length < 6) {
            const bgEls = root.querySelectorAll("[style*='background-image'], [style*='susercontent']");
            for (const el of bgEls) {
                const bg = el.style.backgroundImage || "";
                const match = bg.match(/url\(['"]?(.*?)['"]?\)/);
                if (match && match[1]) {
                    let hdUrl = cleanShopeeHDImageUrl(match[1]);
                    if ((hdUrl.includes("susercontent") || hdUrl.includes("file/")) && !urlsSet.has(hdUrl) && !hdUrl.includes("avatar") && !hdUrl.includes("icon")) {
                        urlsSet.add(hdUrl);
                        gallery.push(hdUrl);
                    }
                }
                if (gallery.length >= 10) break;
            }
        }

        if (gallery.length === 0) {
            const mainImg = root.querySelector("img");
            if (mainImg && mainImg.src) gallery.push(cleanShopeeHDImageUrl(mainImg.src));
        }

        return gallery;
    }

    // Create Floating Control Panel Toolbar
    const panel = document.createElement("div");
    panel.id = "shopeeExtractorControlPanel";
    // Restore saved position from localStorage
    const savedPanelPos = (() => { try { return JSON.parse(localStorage.getItem('ext_panel_pos')); } catch(e) { return null; } })();
    const panelRight = savedPanelPos ? null : '20px';
    const panelBottom = savedPanelPos ? null : '20px';
    panel.style.cssText = `
        position: fixed;
        bottom: ${savedPanelPos ? savedPanelPos.bottom + 'px' : '20px'};
        right: ${savedPanelPos ? savedPanelPos.right + 'px' : '20px'};
        z-index: 999999;
        background: #0f172a;
        color: #ffffff;
        border: 1px solid #334155;
        border-radius: 16px;
        padding: 14px 18px;
        font-family: 'Kanit', -apple-system, sans-serif;
        box-shadow: 0 20px 40px rgba(0,0,0,0.5);
        display: flex;
        flex-direction: column;
        gap: 10px;
        width: 320px;
        backdrop-filter: blur(10px);
        user-select: none;
        cursor: default;
    `;

    panel.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
            <strong style="font-size:14px; color:#38bdf8;">🛍️ Shopee Extractor v4.0</strong>
            <div style="display:flex; align-items:center; gap:6px;">
                <span id="extStatusBadge" style="font-size:10px; background:#059669; color:#fff; padding:2px 6px; border-radius:10px; font-weight:600;">🖼️ HD ON</span>
                <button id="btnMinimizePanel" style="background:#334155; color:#cbd5e1; border:none; width:22px; height:22px; border-radius:6px; font-size:12px; font-weight:bold; cursor:pointer; display:flex; align-items:center; justify-content:center;" title="พับเก็บแผงควบคุม (Minimize)">➖</button>
            </div>
        </div>

        <!-- Mode Indicator Display Banner -->
        <div id="extModeDisplayBanner" style="background:#1e293b; border:1px solid #0284c7; border-radius:10px; padding:8px 10px; text-align:center; font-size:11px; font-weight:700; color:#38bdf8; transition:all 0.3s ease;">
            ⚪ โหมดปัจจุบัน: Ready (พร้อมดึงสินค้าเข้าคลัง DB)
        </div>

        <!-- 4 Extraction Mode Buttons -->
        <div style="display:flex; gap:4px; flex-wrap:wrap;">
            <button id="btnTogglePickMode" style="flex:1; background:#334155; color:#fff; border:none; padding:7px 4px; border-radius:8px; font-size:11px; font-weight:600; cursor:pointer; min-width:85px;">🎯 1. จิ้มเลือกเอง</button>
            <button id="btnAutoExtract" style="flex:1; background:#334155; color:#fff; border:none; padding:7px 4px; border-radius:8px; font-size:11px; font-weight:600; cursor:pointer; min-width:85px;">📥 2. ดึงลง DB ทั้งหน้า</button>
            <button id="btnAutoClickerMode" style="flex:1; background:linear-gradient(135deg,#7c3aed,#a855f7); color:#fff; border:none; padding:7px 4px; border-radius:8px; font-size:11px; font-weight:700; cursor:pointer; min-width:95px;">🤖 3. ออโต้ดึงลง DB</button>
        </div>

        <div style="display:flex; align-items:center; justify-content:space-between; background:#1e293b; padding:6px 10px; border-radius:8px; gap:6px;">
            <label style="font-size:11px; color:#94a3b8; white-space:nowrap;">🔢 จำนวนดึงออโต้:</label>
            <select id="inpAutoQuota" style="background:#0f172a; color:#38bdf8; border:1px solid #475569; padding:5px 8px; border-radius:6px; font-size:11px; font-weight:700; flex:1; cursor:pointer;">
                <option value="4">4 รายการ</option>
                <option value="10" selected>10 รายการ (แนะนำ)</option>
                <option value="20">20 รายการ</option>
                <option value="30">30 รายการ</option>
                <option value="50">50 รายการ (สูงสุด)</option>
            </select>
        </div>

        <div style="display:flex; align-items:center; justify-content:space-between; background:#1e293b; padding:6px 10px; border-radius:8px; gap:6px;">
            <label style="font-size:11px; color:#94a3b8; white-space:nowrap;">📂 ติดหมวดหมู่:</label>
            <select id="selExtCategory" style="background:#0f172a; color:#38bdf8; border:1px solid #475569; padding:5px 6px; border-radius:6px; font-size:11px; flex:1; cursor:pointer;">
                <option value="🏠 เครื่องใช้ในบ้าน" selected>🏠 เครื่องใช้ในบ้าน</option>
                <option value="💄 ความงาม & สกินแคร์">💄 ความงาม & สกินแคร์</option>
                <option value="📱 ไอที & อิเล็กทรอนิกส์">📱 ไอที & อิเล็กทรอนิกส์</option>
                <option value="👗 แฟชั่น">👗 แฟชั่น</option>
                <option value="📦 สินค้าคัดสรร">📦 สินค้าคัดสรรทั่วไป</option>
            </select>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; font-size:10px; color:#94a3b8; background:#1e293b; padding:5px 10px; border-radius:6px;">
            <span>🏆 AI Best Winner Filter</span>
            <span style="color:#10b981; font-weight:700;">🟢 คัดชิ้นเด็ดสุด 1 เดียว</span>
        </div>


        <!-- AUTO CLICK NATIVE SHOPEE BUTTONS ON PAGE -->
        <button id="btnAutoClickNative" style="width:100%; background:linear-gradient(135deg,#0284c7,#38bdf8); color:#fff; border:none; padding:10px; border-radius:10px; font-size:12px; font-weight:700; cursor:pointer; box-shadow:0 4px 12px rgba(2,132,199,0.3);">
            🖱️ กดปุ่ม "เพิ่มลงคลัง" ในหน้าตรงๆ (Auto-Click)
        </button>

        <!-- DIRECT PUSH TO MY COLLECTION BUTTON -->
        <button id="btnDirectPushCollection" style="width:100%; background:linear-gradient(135deg,#059669,#10b981); color:#fff; border:none; padding:10px; border-radius:10px; font-size:12px; font-weight:700; cursor:pointer; box-shadow:0 4px 12px rgba(16,185,129,0.3);">
            📤 ดึงส่งเข้าคลังบัญชี Shopee ออนไลน์ (My Collection)
        </button>

        <div style="display:flex; gap:6px;">
            <button id="btnSubmitSelected" style="flex:2; background:linear-gradient(135deg, #ee4d2d, #ff7337); color:#fff; border:none; padding:9px; border-radius:10px; font-size:11px; font-weight:700; cursor:pointer; box-shadow:0 4px 12px rgba(238,77,45,0.4);">
                📌 ส่งเข้า DB (<span id="selCountText">0</span>)
            </button>
            <button id="btnCopyLinks" style="flex:1; background:#0284c7; color:#fff; border:none; padding:9px; border-radius:10px; font-size:11px; font-weight:700; cursor:pointer;" title="คัดลอกลิงก์พร้อมโพสต์ในโซเชียลทันที">
                📋 ก๊อปลิงก์
            </button>
            <button id="btnResetAll" style="background:#475569; color:#fff; border:none; padding:9px 8px; border-radius:10px; font-size:11px; font-weight:700; cursor:pointer;" title="ล้างรายการที่เลือกไว้ทั้งหมดเตรียมดึงรอบใหม่">
                🧹 รีเซ็ต
            </button>
        </div>
    `;

    document.body.appendChild(panel);

    // Create Small Floating Trigger Pill for Minimized Mode
    const triggerPill = document.createElement("div");
    triggerPill.id = "shopeeExtractorTriggerPill";
    triggerPill.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 999999;
        background: linear-gradient(135deg, #0f172a, #1e293b);
        color: #38bdf8;
        border: 1.5px solid #0284c7;
        border-radius: 20px;
        padding: 8px 14px;
        font-family: 'Kanit', sans-serif;
        font-size: 12px;
        font-weight: 700;
        box-shadow: 0 8px 24px rgba(0,0,0,0.5);
        cursor: pointer;
        display: none;
        align-items: center;
        gap: 6px;
        backdrop-filter: blur(10px);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
    `;
    triggerPill.innerHTML = `🛍️ Extractor <span id="pillCountBadge" style="background:#ee4d2d; color:#fff; font-size:10px; padding:2px 7px; border-radius:10px; font-weight:800;">0</span> ⚡`;
    document.body.appendChild(triggerPill);

    const btnPick = document.getElementById("btnTogglePickMode");
    const btnAuto = document.getElementById("btnAutoExtract");
    const btnSubmit = document.getElementById("btnSubmitSelected");
    const btnCopyLinks = document.getElementById("btnCopyLinks");
    const btnResetAll = document.getElementById("btnResetAll");
    const btnMinimizePanel = document.getElementById("btnMinimizePanel");
    let selCountText = document.getElementById("selCountText");
    const pillCountBadge = document.getElementById("pillCountBadge");
    const inpAutoQuota = document.getElementById("inpAutoQuota");
    const selExtCategory = document.getElementById("selExtCategory");

    function collapsePanel() {
        panel.style.display = "none";
        triggerPill.style.display = "flex";
        sessionStorage.setItem("shopee_ext_panel_collapsed", "true");
    }

    function expandPanel() {
        panel.style.display = "flex";
        triggerPill.style.display = "none";
        sessionStorage.setItem("shopee_ext_panel_collapsed", "false");
    }

    if (btnMinimizePanel) btnMinimizePanel.addEventListener("click", collapsePanel);
    if (triggerPill) triggerPill.addEventListener("click", expandPanel);

    // Restore user preferred state
    if (sessionStorage.getItem("shopee_ext_panel_collapsed") === "true") {
        collapsePanel();
    }

    // ✋ DRAG TO MOVE — ลากวางแผงควบคุมได้อิสระ!
    function makeDraggable(el, handleEl) {
        let isDragging = false, startX, startY, startRight, startBottom;
        handleEl.style.cursor = 'grab';
        handleEl.addEventListener('mousedown', (e) => {
            if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            const rect = el.getBoundingClientRect();
            startRight = window.innerWidth - rect.right;
            startBottom = window.innerHeight - rect.bottom;
            handleEl.style.cursor = 'grabbing';
            e.preventDefault();
        });
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            const newRight = Math.max(0, Math.min(window.innerWidth - 50, startRight - dx));
            const newBottom = Math.max(0, Math.min(window.innerHeight - 50, startBottom - dy));
            el.style.right = newRight + 'px';
            el.style.bottom = newBottom + 'px';
            el.style.left = 'auto';
            el.style.top = 'auto';
        });
        document.addEventListener('mouseup', () => {
            if (!isDragging) return;
            isDragging = false;
            handleEl.style.cursor = 'grab';
            // Save position for this element
            const key = el.id === 'shopeeExtractorControlPanel' ? 'ext_panel_pos' : 'ext_pill_pos';
            localStorage.setItem(key, JSON.stringify({
                right: parseFloat(el.style.right),
                bottom: parseFloat(el.style.bottom)
            }));
        });
    }

    // Attach drag to panel header row (top title bar)
    const panelHeader = panel.querySelector('div');
    if (panelHeader) makeDraggable(panel, panelHeader);

    // Attach drag to trigger pill itself
    makeDraggable(triggerPill, triggerPill);

    const btnAutoClicker = document.getElementById("btnAutoClickerMode");
    const modeBanner = document.getElementById("extModeDisplayBanner");

    let currentExtMode = 'ready'; // 'ready', 'pick', 'autoscrape', 'autoclicker'
    let isAutoClickerRunning = false;

    function updateModeBanner(mode) {
        currentExtMode = mode;
        if (!modeBanner) return;

        if (mode === 'ready') {
            modeBanner.innerText = "⚪ โหมดปัจจุบัน: Ready (พร้อมทำงาน)";
            modeBanner.style.background = "#1e293b";
            modeBanner.style.borderColor = "#0284c7";
            modeBanner.style.color = "#38bdf8";
        } else if (mode === 'pick') {
            modeBanner.innerText = "🎯 โหมดปัจจุบัน: 🎯 จิ้มเลือกสินค้าเอง";
            modeBanner.style.background = "#7c3aed22";
            modeBanner.style.borderColor = "#7c3aed";
            modeBanner.style.color = "#c4b5fd";
        } else if (mode === 'autoscrape') {
            modeBanner.innerText = "⚡ โหมดปัจจุบัน: ⚡ ดึงสินค้าทั้งหน้า";
            modeBanner.style.background = "#05966922";
            modeBanner.style.borderColor = "#059669";
            modeBanner.style.color = "#6ee7b7";
        } else if (mode === 'autoclicker') {
            modeBanner.innerText = "🤖 โหมดปัจจุบัน: 🤖 Auto-Clicker ดึงสินค้าลง DB ต่อเนื่อง...";
            modeBanner.style.background = "#a855f722";
            modeBanner.style.borderColor = "#a855f7";
            modeBanner.style.color = "#f0abfc";
        }
    }

    const btnPushCollection = document.getElementById("btnDirectPushCollection");
    if (btnPushCollection) btnPushCollection.addEventListener("click", directPushSelectedToMyCollection);

    const btnAutoClickNative = document.getElementById("btnAutoClickNative");
    if (btnAutoClickNative) btnAutoClickNative.addEventListener("click", autoClickShopeeNativeAddButtons);

    btnPick.addEventListener("click", togglePickMode);
    btnAuto.addEventListener("click", runAutoScrapeMode);
    if (btnAutoClicker) btnAutoClicker.addEventListener("click", toggleAutoClickerExtractorMode);
    btnSubmit.addEventListener("click", submitSelectedProductsToDB);
    btnCopyLinks.addEventListener("click", copySelectedAffiliateLinksToClipboard);
    if (btnResetAll) btnResetAll.addEventListener("click", () => { 
        resetSelectionState(); 
        updateModeBanner('ready');
        showToast("🧹 ล้างรายการเรียบร้อย พร้อมดึงสินค้ารอบใหม่แล้ว!", "#0284c7"); 
    });

    // ===================================================
    // 🖱️ AUTO-CLICK NATIVE SHOPEE BUTTONS ON CURRENT PAGE
    // กดปุ่ม "เพิ่มลงคลัง" ในแต่ละการ์ดโดยตรง ไม่ต้องเปิดหน้าใหม่
    // ===================================================
    async function autoClickShopeeNativeAddButtons() {
        updateModeBanner('autoclicker');
        const quota = parseInt(document.getElementById('inpAutoQuota')?.value || '10');

        // Step 1: หาการ์ดสินค้าทั้งหมดบนหน้า
        const cards = findProductCardsOnPage();
        showToast(`🔍 พบ ${cards.length} การ์ดสินค้าบนหน้า กำลังกดปุ่มเพิ่มลงคลัง...`, '#0284c7');

        if (cards.length === 0) {
            showToast('⚠️ ไม่พบการ์ดสินค้าบนหน้านี้ ลองเลื่อนหน้าให้สินค้าโหลดก่อนครับ', '#eab308');
            updateModeBanner('ready');
            return;
        }

        let added = 0;

        for (const card of cards) {
            if (added >= quota) break;

            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            await new Promise(r => setTimeout(r, 600));

            // หาปุ่มในการ์ด — ลอง keyword หลายแบบ
            const allBtns = Array.from(card.querySelectorAll('button, [role="button"], a[class*="btn"]'));
            const addBtn = allBtns.find(btn => {
                const t = (btn.innerText || btn.textContent || btn.getAttribute('aria-label') || '').trim();
                return /เพิ่ม|คลัง|เพิ่มลง|add|collect|marketing|เลือก/i.test(t);
            }) || allBtns[allBtns.length - 1]; // fallback: ปุ่มสุดท้ายในการ์ด

            if (addBtn) {
                clickElementReal(addBtn);
                highlightSelectedCard(card);
                added++;
                showToast(`✅ กดเพิ่มลงคลัง ${added}/${quota} แล้ว`, '#059669');

                // Anti-ban: delay 1.5–3.0 วินาที
                const delay = Math.floor(Math.random() * 1500) + 1500;
                await new Promise(r => setTimeout(r, delay));
            }
        }

        updateModeBanner('ready');
        showToast(`🎉 กดเพิ่มลงคลังสำเร็จ ${added} รายการ! ตรวจสอบที่ My Collection ได้เลยครับ`, '#059669');
    }

    async function directPushSelectedToMyCollection() {
        if (selectedProductsMap.size === 0) {
            // Auto scrape page first if nothing selected
            await runAutoScrapeMode();
        }

        const items = Array.from(selectedProductsMap.values());
        if (items.length === 0) {
            showToast("⚠️ ไม่พบสินค้าบนหน้าจอ กรุณาเลือกสินค้าก่อนครับ", "#eab308");
            return;
        }

        const queue = items.map(p => ({
            title: p.title,
            price: p.sale_price,
            comm: p.commission_rate,
            profit: p.net_profit_thb,
            link: p.affiliate_link
        }));

        localStorage.setItem('collection_queue', JSON.stringify(queue));
        localStorage.setItem('collection_queue_idx', '0');

        showToast(`📤 กำลังส่งสินค้า ${queue.length} รายการเข้าคลังบัญชี Shopee...`, "#059669");
        setTimeout(() => {
            window.open('https://affiliate.shopee.co.th/my-collection', '_blank');
        }, 1200);
    }

    // ===================================================
    // 🤖 REAL PHYSICAL MOUSE CLICK & BACKGROUND TICK ENGINE
    // ===================================================
    function clickElementReal(el) {
        if (!el) return false;
        try {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            const events = ['mouseenter', 'mouseover', 'mousedown', 'mouseup', 'click'];
            events.forEach(type => {
                const ev = new MouseEvent(type, {
                    bubbles: true,
                    cancelable: true,
                    view: window,
                    buttons: 1
                });
                el.dispatchEvent(ev);
            });
            if (typeof el.click === 'function') el.click();
            return true;
        } catch(e) {
            console.log("Click element real note:", e);
            return false;
        }
    }

    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
        chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
            if (msg.action === "AUTO_CLICKER_BACKGROUND_TICK") {
                if (isAutoClickerRunning) {
                    runAutoClickerLoop();
                }
                if (typeof runAntiBanAutoClickStep === 'function' && window.isMyCollectionAutoClickerActive) {
                    runAntiBanAutoClickStep();
                }
                sendResponse({ status: "tick_received" });
            }
            return true;
        });
    }

    function togglePickMode() {
        if (isAutoClickerRunning) stopAutoClickerExtractor();

        isPickModeActive = !isPickModeActive;
        if (isPickModeActive) {
            btnPick.style.background = "#7c3aed";
            btnPick.innerText = "🎯 กำลังเลือก...";
            updateModeBanner('pick');
            showToast("🎯 เปิดโหมดจิ้มเลือก: นำเมาส์ไปคลิกที่สินค้าบนหน้าจอได้เลยครับ!", "#7c3aed");
            enableClickToSelectHighlighter();
        } else {
            btnPick.style.background = "#334155";
            btnPick.innerText = "🎯 จิ้มเลือกเอง";
            updateModeBanner('ready');
            showToast("🛑 ปิดโหมดจิ้มเลือกเรียบร้อยแล้ว", "#475569");
            disableClickToSelectHighlighter();
        }
    }

    // ===================================================
    // 🤖 AUTO-CLICKER EXTRACTOR ENGINE (Shopee -> DB Auto)
    // ===================================================
    function toggleAutoClickerExtractorMode() {
        if (isPickModeActive) togglePickMode();

        isAutoClickerRunning = !isAutoClickerRunning;
        if (isAutoClickerRunning) {
            btnAutoClicker.style.background = "#991b1b";
            btnAutoClicker.innerText = "⏹️ หยุด Auto-Clicker";
            updateModeBanner('autoclicker');
            showToast("🤖 เริ่มโหมด Auto-Clicker: กำลังดึงสินค้าและส่งเข้า DB อัตโนมัติ...", "#7c3aed");
            runAutoClickerLoop();
        } else {
            stopAutoClickerExtractor();
        }
    }

    function stopAutoClickerExtractor() {
        isAutoClickerRunning = false;
        if (btnAutoClicker) {
            btnAutoClicker.style.background = "linear-gradient(135deg,#7c3aed,#a855f7)";
            btnAutoClicker.innerText = "🤖 ออโต้คลิกเกอร์ DB";
        }
        updateModeBanner('ready');
        showToast("⏹️ หยุดทำงาน Auto-Clicker Extractor เรียบร้อยแล้ว", "#475569");
    }

    function extractSingleProductFromCard(card) {
        if (!card) return null;

        // ─── 1. TITLE ─── ลองหาชื่อสินค้าจากหลาย selector เรียงตามความแม่นยำ
        const titleSelectors = [
            "._44qnta", ".vioxSu", ".product-name", ".offer-name",
            "h1", "h2", "h3", "h4",
            "div[class*='title']", "span[class*='title']",
            "div[class*='name']",  "span[class*='name']",
            "p[class*='name']",    "p[class*='title']",
            "[title]", "div[class*='product'] span", "div[class*='offer'] span"
        ];
        let cleanTitle = "";
        for (const sel of titleSelectors) {
            const el = card.querySelector(sel);
            const raw = el?.getAttribute("title") || el?.innerText || "";
            const t = raw.replace(/\n/g, " ").trim();
            if (t.length >= 8) { cleanTitle = t; break; }
        }

        // fallback: ใช้ innerText ทั้ง card แต่เอาแค่บรรทัดแรกที่ยาวพอ
        if (!cleanTitle) {
            const lines = (card.innerText || "").split("\n").map(l => l.trim()).filter(l => l.length >= 8);
            cleanTitle = lines[0] || "";
        }

        if (!isValidProductTitle(cleanTitle)) return null;

        // ─── 2. PRICE ─── ค้นหาราคาจากหลายรูปแบบ
        const fullText = card.innerText || "";
        const priceSelectors = ["._1w9fTh", ".pq8Piy", "._3n5odx",
            "div[class*='price']", "span[class*='price']", "p[class*='price']"];
        let price = 0;
        for (const sel of priceSelectors) {
            const el = card.querySelector(sel);
            if (el) {
                const m = el.innerText.match(/[\d,.]+/);
                if (m) { price = parseFloat(m[0].replace(/,/g, "")); break; }
            }
        }
        if (!price) {
            const m = fullText.match(/฿\s*([\d,.]+)/) ||
                      fullText.match(/([\d,.]+)\s*บาท/) ||
                      fullText.match(/(\d{2,6})/);
            price = m ? parseFloat(m[1].replace(/,/g, "")) : 290.0;
        }
        if (price <= 0) price = 290.0;

        // ─── 3. COMMISSION ───
        const commMatch = fullText.match(/อัตราค่าคอมมิชชัน\s*([\d.]+)%/) ||
                          fullText.match(/คอม\s*([\d.]+)%/) ||
                          fullText.match(/([\d.]+)%/);
        const commRate = commMatch ? parseFloat(commMatch[1]) : 20.0;

        // ─── 4. IMAGE ───
        const imgEl = card.querySelector("img");
        const imgSrc = imgEl?.src || imgEl?.dataset?.src ||
            "https://down-th.img.susercontent.com/file/sg-11134201-7rd5e-m4p50n5z0c2g7b";

        // ─── 5. LINK ─── ค้นหา href จากหลายแหล่ง
        const linkEl = card.querySelector("a[href*='shopee']") ||
                       card.querySelector("a[href*='product']") ||
                       card.querySelector("a[href]") ||
                       (card.tagName === "A" ? card : null);
        const href = linkEl?.href || window.location.href;
        const affLink = href.includes("af_id=") ? href :
                        href.includes("?") ?
                        `${href}&af_id=X4EBLKP&mmp_pid=an_15320530167` :
                        `${href}?af_id=X4EBLKP&mmp_pid=an_15320530167`;

        const titleHash = Math.abs(
            cleanTitle.split("").reduce((acc, c) => (acc << 5) - acc + c.charCodeAt(0), 0)
        ).toString(36);

        return {
            item_id: `sp_offer_${titleHash}`,
            title: cleanTitle,
            sale_price: price,
            original_price: Math.round(price * 1.3),
            commission_rate: commRate,
            net_profit_thb: Math.round(price * (commRate / 100) * 100) / 100,
            main_image_path: imgSrc,
            images: [imgSrc],
            affiliate_link: affLink,
            shop_name: "Shopee Affiliate Mall",
            status: "PENDING_VIDEO"
        };
    }

    // ✅ highlightSelectedCard — กรอบสีเขียวบนการ์ดสินค้าที่ถูกเลือก
    function highlightSelectedCard(card) {
        if (!card) return;
        card.style.outline = "4px solid #10b981";
        card.style.outlineOffset = "-4px";
        card.style.boxShadow = "0 0 16px rgba(16, 185, 129, 0.6)";
        card.style.transition = "all 0.3s ease";
        card.dataset.autoScraped = "true";
        if (!card.querySelector(".ext-selected-badge")) {
            const badge = document.createElement("div");
            badge.className = "ext-selected-badge";
            badge.style.cssText = `
                position:absolute; top:6px; left:6px; z-index:9999;
                background:#10b981; color:#fff; font-size:11px;
                font-weight:700; padding:3px 8px; border-radius:6px;
                box-shadow:0 4px 10px rgba(0,0,0,0.3); font-family:sans-serif;
            `;
            badge.innerText = `✅ #${selectedProductsMap.size}`;
            if (window.getComputedStyle(card).position === "static") card.style.position = "relative";
            card.appendChild(badge);
        }
    }

    // ✅ updateSelectionUI — อัปเดตตัวเลขนับสินค้าในปุ่มและ Pill
    function updateSelectionUI() {
        const size = selectedProductsMap.size;
        const countEl = document.getElementById("selCountText");
        const pillEl = document.getElementById("pillCountBadge");
        if (countEl) countEl.innerText = size;
        if (pillEl) pillEl.innerText = size;
    }

    async function runAutoClickerLoop() {
        if (!isAutoClickerRunning) return;

        // 1. Smooth scroll down to trigger lazy loading
        window.scrollBy({ top: 350, behavior: 'smooth' });
        await new Promise(r => setTimeout(r, 1000));

        // 2. หา product cards บนทุกหน้า Shopee/Affiliate — ใช้ Universal Finder
        const quota = parseInt(document.getElementById("inpAutoQuota")?.value || "10");
        const cards = findProductCardsOnPage();

        showToast(`🔍 พบ ${cards.length} การ์ดบนหน้า กำลังดึง...`, "#0284c7");

        for (const card of cards) {
            if (!isAutoClickerRunning) break;
            const prodData = extractSingleProductFromCard(card);
            if (prodData && prodData.title) {
                const titleKey = prodData.title.trim();
                if (!selectedProductsMap.has(titleKey) && !isProductAlreadyInDB(titleKey)) {
                    selectedProductsMap.set(titleKey, prodData);
                    highlightSelectedCard(card);
                }
            }
            if (selectedProductsMap.size >= quota) break;
        }

        updateSelectionUI();

        // 3. Auto-submit to DB if we have items
        if (selectedProductsMap.size > 0) {
            await submitSelectedProductsToDB();
        } else {
            showToast("⚠️ ยังไม่พบสินค้าบนหน้านี้ เลื่อนหน้าต่อ...", "#eab308");
        }

        // 4. Continue loop after human-like random delay (2.5s to 4.5s)
        if (isAutoClickerRunning) {
            const randomDelay = Math.floor(Math.random() * 2000) + 2500;
            setTimeout(runAutoClickerLoop, randomDelay);
        }
    }

    function enableClickToSelectHighlighter() {
        document.addEventListener("mouseover", handleMouseOverHighlighter);
        document.addEventListener("click", handleMouseClickSelect, true);
    }

    function disableClickToSelectHighlighter() {
        document.removeEventListener("mouseover", handleMouseOverHighlighter);
        document.removeEventListener("click", handleMouseClickSelect, true);
    }

    function handleMouseOverHighlighter(e) {
        if (!isPickModeActive) return;
        const card = e.target.closest("a, .shopee-search-item-result__item, [data-sqp], div[class*='card'], div[class*='offer'], div[class*='product']") || 
                     (e.target.tagName === 'IMG' ? e.target.closest('div') : null);
        if (card && !card.dataset.extBound) {
            card.style.outline = "3px solid #7c3aed";
            card.style.outlineOffset = "-3px";
            card.style.transition = "outline 0.2s ease";
        }
    }

    function isValidProductTitle(title) {
        if (!title) return false;
        const clean = title.trim();
        if (clean.length <= 4) return false;
        const junkWords = ["เปิดร้านค้า", "เข้าสู่ระบบ", "ตะกร้าสินค้า", "ดูทั้งหมด", "หน้าแรก", "Shopee Thailand", "ช่วยเหลือ", "แชทกับเรา", "หมวดหมู่"];
        if (junkWords.some(word => clean.includes(word))) return false;
        return true;
    }

    async function handleMouseClickSelect(e) {
        if (!isPickModeActive) return;
        // Don't intercept clicks inside extension control panel
        if (e.target.closest('#shopeeExtractorControlPanel')) return;

        const card = e.target.closest("a, .shopee-search-item-result__item, [data-sqp], div[class*='card'], div[class*='offer'], div[class*='product']") ||
                     (e.target.tagName === 'IMG' ? e.target.closest('div') : e.target);

        if (card) {
            e.preventDefault();
            e.stopPropagation();

            const prodData = extractSingleProductFromCard(card);
            if (!prodData || !prodData.title) {
                showToast("⚠️ ไม่สามารถดึงข้อมูลจากการ์ดนี้ได้ กรุณาลองคลิกส่วนอื่นของสินค้า", "#eab308");
                return;
            }

            const title = prodData.title;
            const itemKey = `pick_${prodData.item_id}`;

            if (selectedProductsMap.has(itemKey)) {
                selectedProductsMap.delete(itemKey);
                card.style.outline = "none";
                card.style.boxShadow = "none";
                const badge = card.querySelector('.ext-selected-badge');
                if (badge) badge.remove();
                showToast(`❌ ยกเลิกเลือก '${title.substring(0, 15)}...'`, "#dc2626");
            } else {
                selectedProductsMap.set(itemKey, prodData);
                highlightSelectedCard(card);
                showToast(`✅ เลือก '${title.substring(0, 15)}...' เรียบร้อยแล้ว`, "#059669");
            }
            updateExtSelectionCount();
        }
    }

    function updateExtSelectionCount() {
        const size = selectedProductsMap.size;
        const countEl = document.getElementById("selCountText");
        const pillEl = document.getElementById("pillCountBadge");
        if (countEl) countEl.innerText = size;
        if (pillEl) pillEl.innerText = size;
    }

    async function runAutoScrapeMode() {
        if (isAutoClickerRunning) stopAutoClickerExtractor();
        updateModeBanner('autoscrape');
        const count = parseInt(document.getElementById("inpAutoQuota")?.value) || 10;
        btnAuto.innerText = "⏳ กำลังดึง...";
        btnAuto.disabled = true;

        showToast(`🛡️ เริ่มดึงออโต้ ${count} รายการ (เปิดระบบป้องกัน Anti-Ban)...`, "#0284c7");

        window.scrollBy({ top: 400, behavior: 'smooth' });
        await new Promise(r => setTimeout(r, 1200));

        // ✅ ใช้ Universal Card Finder แทน CSS selector — ทำงานได้ทุกหน้า Shopee/Affiliate
        const cards = findProductCardsOnPage();
        if (cards.length === 0) {
            showToast('⚠️ ไม่พบสินค้าบนหน้านี้ ลองเลื่อนหน้าให้โหลดก่อนครับ', '#eab308');
            btnAuto.innerText = "📥 2. ดึงลง DB ทั้งหน้า";
            btnAuto.disabled = false;
            updateModeBanner('ready');
            return;
        }
        showToast(`🔍 พบ ${cards.length} การ์ดสินค้า กำลังดึง...`, '#0284c7');
        const seenNormTitlesList = [];
        const startSize = selectedProductsMap.size;

        for (let i = 0; i < cards.length && (selectedProductsMap.size - startSize) < count; i++) {
            const card = cards[i];
            const rawTitle = card.querySelector("h1, ._44qnta, .vioxSu, [title]")?.innerText || card.innerText || "";
            const cleanTitle = rawTitle.replace(/\n/g, ' ').trim();

            // ✅ FRONT-END DEDUPLICATION — ข้ามรายการที่ดึงไปแล้วในรอบนี้ 100%
            if (!isValidProductTitle(cleanTitle)) continue;

            // 🏆 AI SMART FILTER — สแกนความคล้ายของชื่อสินค้า ข้ามซ้ำ
            const normTitle = cleanTitleForMatching(cleanTitle);
            let isDuplicateOnScreen = false;
            for (const existingNorm of seenNormTitlesList) {
                if (computeStringSimilarity(normTitle, existingNorm) > 0.65) {
                    isDuplicateOnScreen = true;
                    break;
                }
            }
            if (isDuplicateOnScreen) continue;
            seenNormTitlesList.push(normTitle);

            // ✅ CHECK IF ALREADY IN DB — ข้ามสินค้าที่มีใน DB แล้วอัตโนมัติ
            if (isProductAlreadyInDB(cleanTitle)) {
                markCardAsAlreadyExtracted(card);
                continue;
            }

            const priceText = card.querySelector("._1w9fTh, .pq8Piy, ._3n5odx")?.innerText || "290";
            const price = parseFloat(priceText.replace(/[^0-9.]/g, "")) || 290.0;

            // กรองรายการที่ไม่มีราคา
            if (price <= 0) continue;
            
            // Extract Multi-Image Gallery
            const gallery = await extractProductGalleryImages(card);
            const mainImg = gallery[0] || "https://down-th.img.susercontent.com/file/sg-11134201-7rd5e-m4p50n5z0c2g7b";
            const href = card.href || window.location.href;

            // Deterministic hash-based item_id for duplicate prevention
            const titleHash = Math.abs(cleanTitle.split('').reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0)).toString(36);
            const item_id = `sp_item_${titleHash}`;

            const itemKey = `auto_${titleHash}`;
            selectedProductsMap.set(itemKey, {
                item_id: item_id,
                title: cleanTitle,
                sale_price: price,
                original_price: Math.round(price * 1.4),
                commission_rate: 25.0,
                net_profit_thb: Math.round(price * 0.25 * 100) / 100,
                main_image_path: mainImg,
                images: gallery,
                affiliate_link: href.includes('?') ? `${href}&af_id=X4EBLKP&mmp_pid=an_15320530167` : `${href}?af_id=X4EBLKP&mmp_pid=an_15320530167`,
                shop_name: "Shopee Official Mall",
                status: "PENDING_VIDEO"
            });

            // ✅ HIGHLIGHT BORDER & BADGE — ใช้ฟังก์ชันกลาง highlightSelectedCard
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            highlightSelectedCard(card);
            updateExtSelectionCount();

            // 🛡️ ANTI-BAN HUMAN-LIKE JITTER DELAY — สุ่มดีเลย์แบบมนุษย์ป้องกันการโดนบล็อก (1.2s - 2.5s)
            const antiBanDelay = Math.floor(Math.random() * 1300) + 1200;
            await new Promise(r => setTimeout(r, antiBanDelay));

            // พักสายตา 2.5 วินาที ทุกๆ 10 สินค้า (จำลองพฤติกรรมมนุษย์)
            const addedSoFar = selectedProductsMap.size - startSize;
            if (addedSoFar > 0 && addedSoFar % 10 === 0 && addedSoFar < count) {
                showToast(`🛡️ Anti-Ban: พักจำลองพฤติกรรมมนุษย์ 2.5 วินาที...`, "#0284c7");
                await new Promise(r => setTimeout(r, 2500));
            }
        }

        btnAuto.innerText = "📥 2. ดึงลง DB ทั้งหน้า";
        btnAuto.disabled = false;
        updateModeBanner('ready');
        showToast(`✅ สกัดข้อมูลออโต้สำเร็จ ${selectedProductsMap.size - startSize} รายการ! กดปุ่มสีแดง "ส่งเข้า DB" ได้เลยครับ`, "#059669");
    }

    async function submitSelectedProductsToDB() {
        if (selectedProductsMap.size === 0) {
            await extractCurrentSinglePageProduct();
            return;
        }

        const items = Array.from(selectedProductsMap.values());
        btnSubmit.innerText = "⏳ กำลังส่งลง DB...";
        btnSubmit.disabled = true;

        sendBatchToBackend(["http://127.0.0.1:8080/api/save_product"], 0, items);
    }

    async function extractCurrentSinglePageProduct() {
        const title = document.querySelector("h1, ._44qnta, .vioxSu, [title]")?.innerText || document.title;
        const priceText = document.querySelector("._1w9fTh, .pq8Piy, ._3n5odx")?.innerText || "390";
        const price = parseFloat(priceText.replace(/[^0-9.]/g, "")) || 390.0;
        
        // Extract Multi-Image Gallery for Single Product Page
        const gallery = await extractProductGalleryImages(document.body);
        const mainImg = gallery[0] || "https://down-th.img.susercontent.com/file/sg-11134201-7rd5e-m4p50n5z0c2g7b";
        const url = window.location.href;

        const singleItem = {
            item_id: `sp_single_${Date.now()}`,
            title: title.replace(" | Shopee Thailand", "").trim(),
            sale_price: price,
            original_price: Math.round(price * 1.4),
            commission_rate: 22.5,
            net_profit_thb: Math.round(price * 0.225 * 100) / 100,
            main_image_path: mainImg,
            images: gallery,
            affiliate_link: `${url.split('?')[0]}?af_id=X4EBLKP&mmp_pid=an_15320530167`,
            shop_name: "Shopee Official Store",
            status: "PENDING_VIDEO"
        };

        sendBatchToBackend(["http://127.0.0.1:8080/api/save_product"], 0, [singleItem]);
    }

    function sendBatchToBackend(urls, index, items) {
        if (index >= urls.length) {
            showToast(`✅ บันทึกสินค้า ${items.length} รายการลง DB เรียบร้อยแล้ว!`, "#059669");
            resetSelectionState();
            return;
        }

        fetch(urls[index], {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(items)
        })
        .then(res => res.json())
        .then(data => {
            showToast(`✅ บันทึกสินค้า ${items.length} รายการ เข้า DB เรียบร้อยแล้ว!`, "#059669");
            resetSelectionState();

            // 🚀 Smart Focus or Open Web App tab (Reuses existing tab if open)
            if (document.getElementById("chkAutoOpenWeb")?.checked) {
                setTimeout(() => {
                    window.open("http://127.0.0.1:8080/#centraldb", "AffiliateStudioTab");
                }, 300);
            }
        })
        .catch(err => {
            sendBatchToBackend(urls, index + 1, items);
        });
    }

    function copySelectedAffiliateLinksToClipboard() {
        if (selectedProductsMap.size === 0) {
            showToast("⚠️ ยังไม่ได้เลือกสินค้า กรุณาเลือกสินค้าก่อนก๊อปลิงก์ครับ", "#eab308");
            return;
        }

        const items = Array.from(selectedProductsMap.values());
        const formattedText = items.map((item, idx) => {
            return `${idx + 1}. 🛍️ ${item.title}\n💰 ราคา: ฿${item.sale_price}\n🔗 พิกัดซื้อ: ${item.affiliate_link}\n`;
        }).join("\n");

        navigator.clipboard.writeText(formattedText).then(() => {
            showToast(`📋 คัดลอกแคปชัน & ลิงก์ ${items.length} รายการลง Clipboard แล้ว!`, "#0284c7");
        }).catch(err => {
            showToast("❌ ไม่สามารถคัดลอกลง Clipboard ได้", "#dc2626");
        });
    }

    function resetSelectionState() {
        selectedProductsMap.clear();

        if (btnSubmit) {
            btnSubmit.innerHTML = '📌 ส่งเข้า DB (<span id="selCountText">0</span>)';
            btnSubmit.disabled = false;
            btnSubmit.style.opacity = "1";
        }

        // Re-get selCountText element reference
        selCountText = document.getElementById("selCountText");
        if (selCountText) selCountText.innerText = "0";

        if (btnAuto) {
            btnAuto.innerText = "📥 2. ดึงลง DB ทั้งหน้า";
            btnAuto.disabled = false;
        }

        // Clear visual green borders, highlights, and badges from product cards
        document.querySelectorAll("[data-auto-scraped]").forEach(card => {
            card.style.outline = "none";
            card.style.boxShadow = "none";
            delete card.dataset.autoScraped;
        });
        document.querySelectorAll(".ext-selected-badge").forEach(b => b.remove());

        if (isPickModeActive) togglePickMode();
    }

    function showToast(msg, bg = "#059669") {
        const toast = document.createElement("div");
        toast.style.cssText = `
            position: fixed;
            bottom: 180px;
            right: 20px;
            z-index: 999999;
            background: ${bg};
            color: #fff;
            padding: 10px 16px;
            border-radius: 10px;
            font-family: 'Kanit', sans-serif;
            font-size: 13px;
            font-weight: 600;
            box-shadow: 0 10px 25px rgba(0,0,0,0.3);
        `;
        toast.innerText = msg;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3500);
    }

    function cleanTitleForMatching(t) {
        if (!t) return "";
        let s = t.replace(/-?\d+%/g, "")
                 .replace(/\[.*?\]|\(.*?\)|【.*?】/g, "")
                 .replace(/฿\s*\d+.*/g, "")
                 .replace(/ร้านไทย|พร้อมส่ง|ขายดี|ช้อปปี้ถูกชัวร์|ราคาโรงงาน|โปรเด็ด|ขั้นต่ำ\s*\d+\s*ชิ้น/gi, "")
                 .replace(/[^\w\s\u0E00-\u0E7F]/g, " ")
                 .trim().toLowerCase();
        return s.replace(/\s+/g, " ");
    }

    function computeStringSimilarity(s1, s2) {
        if (!s1 || !s2) return 0;
        if (s1 === s2) return 1.0;
        const longer = s1.length > s2.length ? s1 : s2;
        const shorter = s1.length > s2.length ? s2 : s1;
        if (longer.length === 0) return 1.0;

        if (shorter.length >= 8 && longer.includes(shorter)) return 0.85;

        const bigrams1 = getBigrams(s1);
        const bigrams2 = getBigrams(s2);
        if (bigrams1.size === 0 || bigrams2.size === 0) return 0;
        let intersection = 0;
        bigrams1.forEach(bg => { if (bigrams2.has(bg)) intersection++; });
        return (2.0 * intersection) / (bigrams1.size + bigrams2.size);
    }

    function getBigrams(str) {
        const set = new Set();
        for (let i = 0; i < str.length - 1; i++) {
            set.add(str.substring(i, i + 2));
        }
        return set;
    }

    // ========================================================
    // 📤 MY COLLECTION AUTO-FILL HELPER (affiliate.shopee.co.th)
    // ========================================================
    if (window.location.hostname.includes('affiliate.shopee.co.th')) {
        initMyCollectionAutoFillHelper();
    }

    function initMyCollectionAutoFillHelper() {
        let queue = [];
        let currentIdx = 0;

        try {
            queue = JSON.parse(localStorage.getItem('collection_queue') || '[]');
            currentIdx = parseInt(localStorage.getItem('collection_queue_idx') || '0');
        } catch (e) {}

        if (!queue || queue.length === 0) return;

        const widget = document.createElement('div');
        widget.id = 'shopeeCollectionHelperWidget';
        widget.style.cssText = `
            position: fixed;
            top: 70px;
            right: 20px;
            z-index: 999999;
            background: #0f172a;
            color: #ffffff;
            border: 2px solid #ee4d2d;
            border-radius: 14px;
            padding: 14px 18px;
            width: 310px;
            font-family: 'Kanit', -apple-system, sans-serif;
            box-shadow: 0 20px 50px rgba(238,77,45,0.4);
        `;

        let isAutoClickingActive = false;

        function renderWidgetContent() {
            const item = queue[currentIdx];
            if (!item) {
                widget.innerHTML = `
                    <div style="font-weight:700; color:#10b981; margin-bottom:6px;">🎉 เพิ่มสินค้าครบทุกชิ้นแล้ว!</div>
                    <button id="btnFinishQueue" style="width:100%; background:#334155; color:#fff; border:none; padding:8px; border-radius:8px; cursor:pointer; font-size:12px;">✖ ปิดผู้ช่วย</button>
                `;
                document.getElementById('btnFinishQueue')?.addEventListener('click', () => {
                    localStorage.removeItem('collection_queue');
                    widget.remove();
                });
                return;
            }

            widget.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                    <strong style="color:#ee4d2d; font-size:13px;">📤 My Collection Assistant</strong>
                    <span style="font-size:11px; background:#ee4d2d22; color:#ee4d2d; padding:2px 8px; border-radius:10px; font-weight:700;">${currentIdx + 1}/${queue.length}</span>
                </div>
                <div style="font-size:12px; color:#e2e8f0; font-weight:600; margin-bottom:4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${item.title}</div>
                <div style="font-size:11px; color:#10b981; margin-bottom:8px;">฿${item.price} | คอม ${item.comm}% | กำไร +฿${parseFloat(item.profit||0).toFixed(0)}</div>

                <div style="display:flex; flex-direction:column; gap:6px;">
                    <button id="btnAntiBanAutoClick" style="background:${isAutoClickingActive ? '#991b1b' : 'linear-gradient(135deg,#059669,#10b981)'}; color:#fff; border:none; padding:9px; border-radius:8px; font-size:12px; font-weight:700; cursor:pointer;">
                        ${isAutoClickingActive ? '⏹️ หยุด Auto-Click (Anti-Ban)' : '🤖 เพิ่มออโต้ทั้งคิว (Anti-Ban Mode)'}
                    </button>
                    <button id="btnAutoPasteLink" style="background:linear-gradient(135deg,#ee4d2d,#ff7337); color:#fff; border:none; padding:8px; border-radius:8px; font-size:11px; font-weight:700; cursor:pointer;">⚡ หยอดลิงก์ใส่ช่องออโต้ (ทีละชิ้น)</button>
                    <div style="display:flex; gap:6px;">
                        <button id="btnCopyOnly" style="flex:1; background:#0284c7; color:#fff; border:none; padding:7px; border-radius:8px; font-size:11px; font-weight:700; cursor:pointer;">📋 ก๊อปลิงก์</button>
                        <button id="btnNextItem" style="flex:1; background:#334155; color:#fff; border:none; padding:7px; border-radius:8px; font-size:11px; font-weight:700; cursor:pointer;">⏩ ข้ามชิ้นถัดไป</button>
                    </div>
                </div>
            `;

            document.getElementById('btnAntiBanAutoClick')?.addEventListener('click', toggleAntiBanAutoClick);
            document.getElementById('btnAutoPasteLink')?.addEventListener('click', () => autoFillLinkToPage(item.link));
            document.getElementById('btnCopyOnly')?.addEventListener('click', () => {
                navigator.clipboard.writeText(item.link);
                showToast("📋 คัดลอกลิงก์สำเร็จ! วางในช่องได้เลยครับ", "#0284c7");
            });
            document.getElementById('btnNextItem')?.addEventListener('click', () => {
                currentIdx++;
                localStorage.setItem('collection_queue_idx', currentIdx.toString());
                renderWidgetContent();
            });
        }

        function toggleAntiBanAutoClick() {
            isAutoClickingActive = !isAutoClickingActive;
            window.isMyCollectionAutoClickerActive = isAutoClickingActive;

            if (isAutoClickingActive) {
                showToast("🤖 เริ่มต้น Auto-Click Anti-Ban Mode (ทำงานฉากหลัง + คลิกเมาส์จริง)...", "#059669");
                if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
                    chrome.runtime.sendMessage({ action: "START_BACKGROUND_AUTO_CLICKER" });
                }
                runAntiBanAutoClickStep();
            } else {
                showToast("⏹️ หยุดการทำงาน Auto-Click เรียบร้อย", "#991b1b");
                if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
                    chrome.runtime.sendMessage({ action: "STOP_BACKGROUND_AUTO_CLICKER" });
                }
            }
            renderWidgetContent();
        }

        function runAntiBanAutoClickStep() {
            if (!isAutoClickingActive && !window.isMyCollectionAutoClickerActive) return;
            const item = queue[currentIdx];
            if (!item) {
                isAutoClickingActive = false;
                window.isMyCollectionAutoClickerActive = false;
                showToast("🎉 เพิ่มสินค้าทั้งคิวเสร็จสิ้นสมบูรณ์!", "#10b981");
                renderWidgetContent();
                return;
            }

            // Fill link
            autoFillLinkToPage(item.link);

            // Random delay between 2.4s to 4.2s (Human-like behavior to prevent bot ban)
            const randomDelay = Math.floor(Math.random() * 1800) + 2400;

            setTimeout(() => {
                // Find & click Submit button automatically using REAL PHYSICAL MOUSE CLICK
                const buttons = Array.from(document.querySelectorAll('button, div[role="button"], input[type="submit"]'));
                const submitBtn = buttons.find(b => 
                    b.innerText.includes('เพิ่ม') || 
                    b.innerText.includes('บันทึก') || 
                    b.innerText.includes('Add') || 
                    b.innerText.includes('Save') ||
                    b.innerText.includes('Confirm')
                );

                if (submitBtn) {
                    clickElementReal(submitBtn);
                }

                currentIdx++;
                localStorage.setItem('collection_queue_idx', currentIdx.toString());
                renderWidgetContent();

                if (isAutoClickingActive || window.isMyCollectionAutoClickerActive) {
                    setTimeout(runAntiBanAutoClickStep, 1500);
                }
            }, randomDelay);
        }

        function autoFillLinkToPage(linkUrl) {
            // หา input ที่รับลิงก์สินค้า (placeholder ต่างๆ)
            const inputs = Array.from(document.querySelectorAll('input[type="text"], input:not([type]), textarea'));
            let targetInput = inputs.find(inp =>
                inp.placeholder?.toLowerCase().includes('http') ||
                inp.placeholder?.toLowerCase().includes('ลิงก์') ||
                inp.placeholder?.toLowerCase().includes('link') ||
                inp.placeholder?.toLowerCase().includes('url') ||
                inp.value?.includes('shopee')
            ) || inputs[0];

            if (targetInput) {
                targetInput.focus();
                targetInput.scrollIntoView({ behavior: 'smooth', block: 'center' });

                // ✅ React-compatible: ใช้ nativeInputValueSetter เพื่อให้ React รับค่าจริง
                const nativeSetter = Object.getOwnPropertyDescriptor(
                    window.HTMLInputElement.prototype, 'value'
                )?.set || Object.getOwnPropertyDescriptor(
                    window.HTMLTextAreaElement.prototype, 'value'
                )?.set;

                if (nativeSetter) {
                    nativeSetter.call(targetInput, linkUrl);
                } else {
                    targetInput.value = linkUrl;
                }

                // Dispatch events ที่ React ต้องการ
                ['input', 'change', 'keyup', 'blur'].forEach(type => {
                    targetInput.dispatchEvent(new Event(type, { bubbles: true }));
                });

                showToast(`✅ วางลิงก์ใส่ช่องแล้ว! กดปุ่ม "เพิ่ม" ใน Shopee ได้เลยครับ`, "#059669");
            } else {
                // fallback: copy to clipboard
                navigator.clipboard.writeText(linkUrl).then(() => {
                    showToast(`📋 ก๊อปลิงก์แล้ว! วางลง (Ctrl+V) ในช่อง URL ของ Shopee ด้วยมือครับ`, "#0284c7");
                });
            }
        }

        document.body.appendChild(widget);
        renderWidgetContent();
    }
})();

