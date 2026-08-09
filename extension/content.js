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
    panel.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
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
    `;

    panel.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
            <strong style="font-size:14px; color:#38bdf8;">🛍️ Shopee Extractor v4.0</strong>
            <span id="extStatusBadge" style="font-size:10px; background:#059669; color:#fff; padding:2px 8px; border-radius:10px; font-weight:600;">🖼️ คลังหลายภาพ ON</span>
        </div>

        <div style="display:flex; gap:6px;">
            <button id="btnTogglePickMode" style="flex:1; background:#334155; color:#fff; border:none; padding:8px; border-radius:8px; font-size:12px; font-weight:600; cursor:pointer;">🎯 1. จิ้มเลือกเอง</button>
            <button id="btnAutoExtract" style="flex:1; background:#334155; color:#fff; border:none; padding:8px; border-radius:8px; font-size:12px; font-weight:600; cursor:pointer;">🤖 2. ดึงออโต้</button>
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

        <div style="display:flex; align-items:center; background:#1e293b; padding:4px 10px; border-radius:6px;">
            <label style="font-size:11px; color:#38bdf8; cursor:pointer; display:flex; align-items:center; gap:6px;">
                <input type="checkbox" id="chkAutoOpenWeb" checked style="cursor:pointer;"> 
                🚀 ส่งเข้า DB แล้วเปิด/สลับไปหน้าเว็บทันที
            </label>
        </div>

        <div style="display:flex; gap:6px;">
            <button id="btnSubmitSelected" style="flex:2; background:linear-gradient(135deg, #ee4d2d, #ff7337); color:#fff; border:none; padding:10px; border-radius:10px; font-size:12px; font-weight:700; cursor:pointer; box-shadow:0 4px 12px rgba(238,77,45,0.4);">
                📌 ส่งเข้า DB (<span id="selCountText">0</span>)
            </button>
            <button id="btnCopyLinks" style="flex:1; background:#0284c7; color:#fff; border:none; padding:10px; border-radius:10px; font-size:11px; font-weight:700; cursor:pointer;" title="คัดลอกลิงก์พร้อมโพสต์ในโซเชียลทันที">
                📋 ก๊อปลิงก์
            </button>
            <button id="btnResetAll" style="background:#475569; color:#fff; border:none; padding:10px 8px; border-radius:10px; font-size:11px; font-weight:700; cursor:pointer;" title="ล้างรายการที่เลือกไว้ทั้งหมดเตรียมดึงรอบใหม่">
                🧹 รีเซ็ต
            </button>
        </div>
    `;

    document.body.appendChild(panel);

    const btnPick = document.getElementById("btnTogglePickMode");
    const btnAuto = document.getElementById("btnAutoExtract");
    const btnSubmit = document.getElementById("btnSubmitSelected");
    const btnCopyLinks = document.getElementById("btnCopyLinks");
    const btnResetAll = document.getElementById("btnResetAll");
    let selCountText = document.getElementById("selCountText");
    const inpAutoQuota = document.getElementById("inpAutoQuota");
    const selExtCategory = document.getElementById("selExtCategory");

    btnPick.addEventListener("click", togglePickMode);
    btnAuto.addEventListener("click", runAutoScrapeMode);
    btnSubmit.addEventListener("click", submitSelectedProductsToDB);
    btnCopyLinks.addEventListener("click", copySelectedAffiliateLinksToClipboard);
    if (btnResetAll) btnResetAll.addEventListener("click", () => { resetSelectionState(); showToast("🧹 ล้างรายการเรียบร้อย พร้อมดึงสินค้ารอบใหม่แล้ว!", "#0284c7"); });

    function togglePickMode() {
        isPickModeActive = !isPickModeActive;
        if (isPickModeActive) {
            btnPick.style.background = "#7c3aed";
            btnPick.innerText = "🎯 กำลังเลือก (คลิกสินค้า)";
            showToast("🎯 เปิดโหมดจิ้มเลือก: นำเมาส์ไปคลิกที่สินค้าบนหน้าจอได้เลยครับ!", "#7c3aed");
            enableClickToSelectHighlighter();
        } else {
            btnPick.style.background = "#334155";
            btnPick.innerText = "🎯 1. จิ้มเลือกเอง";
            showToast("🛑 ปิดโหมดจิ้มเลือกเรียบร้อยแล้ว", "#475569");
            disableClickToSelectHighlighter();
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
        const card = e.target.closest("a, .shopee-search-item-result__item, [data-sqp]");
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
        const card = e.target.closest("a, .shopee-search-item-result__item, [data-sqp]");
        if (card) {
            e.preventDefault();
            e.stopPropagation();

            const title = card.querySelector("h1, ._44qnta, .vioxSu, [title]")?.innerText || card.innerText || "";
            if (!isValidProductTitle(title)) {
                showToast("⚠️ องค์ประกอบนี้ไม่ใช่สินค้า กรุณาคลิกเลือกตัวสินค้าครับ", "#eab308");
                return;
            }
            if (isProductAlreadyInDB(title)) {
                markCardAsAlreadyExtracted(card);
                showToast(`📦 สินค้า '${title.substring(0, 15)}...' มีในฐานข้อมูลอยู่แล้ว`, "#0284c7");
            }
            const priceText = card.querySelector("._1w9fTh, .pq8Piy, ._3n5odx")?.innerText || "390";
            const price = parseFloat(priceText.replace(/[^0-9.]/g, "")) || 390.0;
            
            // Extract Multi-Image Gallery
            const gallery = await extractProductGalleryImages(card);
            const mainImg = gallery[0] || "https://down-th.img.susercontent.com/file/sg-11134201-7rd5e-m4p50n5z0c2g7b";
            const href = card.href || window.location.href;

            const itemKey = `pick_${title.substring(0, 15)}`;
            if (selectedProductsMap.has(itemKey)) {
                selectedProductsMap.delete(itemKey);
                card.style.outline = "none";
                showToast(`❌ ยกเลิกเลือก '${title.substring(0, 15)}...'`, "#dc2626");
            } else {
                selectedProductsMap.set(itemKey, {
                    item_id: `sp_custom_${Date.now()}_${selectedProductsMap.size}`,
                    title: title.replace(/\n/g, ' ').trim(),
                    sale_price: price,
                    original_price: Math.round(price * 1.4),
                    commission_rate: 22.5,
                    net_profit_thb: Math.round(price * 0.225 * 100) / 100,
                    main_image_path: mainImg,
                    images: gallery,
                    affiliate_link: href.includes('?') ? `${href}&af_id=X4EBLKP&mmp_pid=an_15320530167` : `${href}?af_id=X4EBLKP&mmp_pid=an_15320530167`,
                    shop_name: "Shopee Official Store",
                    status: "PENDING_VIDEO"
                });
                card.style.outline = "4px solid #10b981";
                showToast(`✅ เลือก '${title.substring(0, 15)}...' พร้อมคลัง ${gallery.length} ภาพเรียบร้อยแล้ว`, "#059669");
            }

            selCountText.innerText = selectedProductsMap.size;
        }
    }

    async function runAutoScrapeMode() {
        const count = parseInt(document.getElementById("inpAutoQuota")?.value) || 10;
        btnAuto.innerText = "⏳ กำลังดึง...";
        btnAuto.disabled = true;

        showToast(`🛡️ เริ่มดึงออโต้ ${count} รายการ (เปิดระบบป้องกัน Anti-Ban)...`, "#0284c7");

        window.scrollBy({ top: 400, behavior: 'smooth' });
        await new Promise(r => setTimeout(r, 1200));

        const cards = document.querySelectorAll("a[href*='/product/'], a[href*='-i.'], .shopee-search-item-result__item");
        let scraped = 0;
        const seenTitlesSet = new Set();

        for (let i = 0; i < cards.length && scraped < count; i++) {
            const card = cards[i];
            const rawTitle = card.querySelector("h1, ._44qnta, .vioxSu, [title]")?.innerText || card.innerText || "";
            const cleanTitle = rawTitle.replace(/\n/g, ' ').trim();

            // ✅ FRONT-END DEDUPLICATION — ข้ามรายการที่ดึงไปแล้วในรอบนี้ 100%
            if (!isValidProductTitle(cleanTitle)) continue;
            if (seenTitlesSet.has(cleanTitle)) continue;
            seenTitlesSet.add(cleanTitle);

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

            // ✅ HIGHLIGHT BORDER & BADGE OVERLAY — กรอบไฮไลท์สีเขียวสดใสบอกรายการที่ถูกเลือก
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            card.style.outline = "4px solid #10b981";
            card.style.outlineOffset = "-4px";
            card.style.boxShadow = "0 0 16px rgba(16, 185, 129, 0.7)";
            card.style.transition = "all 0.3s ease";
            card.dataset.autoScraped = "true";

            // สร้างป้ายบอกลำดับ #1, #2...
            if (!card.querySelector(".ext-selected-badge")) {
                const badge = document.createElement("div");
                badge.className = "ext-selected-badge";
                badge.style.cssText = `
                    position: absolute;
                    top: 6px;
                    left: 6px;
                    z-index: 9999;
                    background: #10b981;
                    color: #ffffff;
                    font-size: 11px;
                    font-weight: 700;
                    padding: 3px 8px;
                    border-radius: 6px;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.3);
                    font-family: sans-serif;
                `;
                badge.innerText = `✅ ดึงออโต้ #${scraped + 1}`;
                if (window.getComputedStyle(card).position === 'static') {
                    card.style.position = 'relative';
                }
                card.appendChild(badge);
            }

            scraped++;
            selCountText.innerText = selectedProductsMap.size;

            // 🛡️ ANTI-BAN HUMAN-LIKE JITTER DELAY — สุ่มดีเลย์แบบมนุษย์ป้องกันการโดนบล็อก (1.2s - 2.5s)
            const antiBanDelay = Math.floor(Math.random() * 1300) + 1200;
            await new Promise(r => setTimeout(r, antiBanDelay));

            // พักสายตา 2.5 วินาที ทุกๆ 10 สินค้า (จำลองพฤติกรรมมนุษย์)
            if (scraped % 10 === 0 && scraped < count) {
                showToast(`🛡️ Anti-Ban: พักจำลองพฤติกรรมมนุษย์ 2.5 วินาที...`, "#0284c7");
                await new Promise(r => setTimeout(r, 2500));
            }
        }

        btnAuto.innerText = "🤖 2. ดึงออโต้";
        btnAuto.disabled = false;
        showToast(`✅ สกัดข้อมูลออโต้สำเร็จ ${scraped} รายการ!`, "#059669");
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

            // 🚀 Auto-Open / Focus Web App tab if checkbox is checked
            if (document.getElementById("chkAutoOpenWeb")?.checked) {
                setTimeout(() => {
                    window.open("http://127.0.0.1:8080/#catalog", "_blank");
                }, 400);
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
            btnAuto.innerText = "🤖 2. ดึงออโต้";
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
})();
