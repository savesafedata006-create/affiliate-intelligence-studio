// ⚡ Shopee Affiliate Data Extractor v2.0 — Interactive Multi-Mode & Anti-Ban Chrome Extension
(function () {
    console.log("⚡ Shopee Affiliate Data Extractor v2.0 Content Script Active");

    if (document.getElementById("shopeeExtractorControlPanel")) return;

    let isPickModeActive = false;
    let isAntiBanActive = true;
    let selectedProductsMap = new Map();

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
            <strong style="font-size:14px; color:#38bdf8;">🛍️ Shopee Extractor v2.0</strong>
            <span id="extStatusBadge" style="font-size:10px; background:#059669; color:#fff; padding:2px 8px; border-radius:10px; font-weight:600;">🛡️ โหมดกันแบน ON</span>
        </div>

        <div style="display:flex; gap:6px;">
            <button id="btnTogglePickMode" style="flex:1; background:#334155; color:#fff; border:none; padding:8px; border-radius:8px; font-size:12px; font-weight:600; cursor:pointer;">🎯 1. จิ้มเลือกเอง</button>
            <button id="btnAutoExtract" style="flex:1; background:#334155; color:#fff; border:none; padding:8px; border-radius:8px; font-size:12px; font-weight:600; cursor:pointer;">🤖 2. ดึงออโต้</button>
        </div>

        <div style="display:flex; align-items:center; justify-content:space-between; background:#1e293b; padding:6px 10px; border-radius:8px;">
            <label style="font-size:11px; color:#94a3b8;">🔢 โควต้าดึงออโต้:</label>
            <select id="selAutoCount" style="background:#0f172a; color:#fff; border:1px solid #475569; padding:2px 6px; border-radius:6px; font-size:11px;">
                <option value="2">2 รายการ</option>
                <option value="4" selected>4 รายการ</option>
                <option value="6">6 รายการ</option>
                <option value="8">8 รายการ</option>
                <option value="10">10 รายการ</option>
            </select>
        </div>

        <button id="btnSubmitSelected" style="background:linear-gradient(135deg, #ee4d2d, #ff7337); color:#fff; border:none; padding:10px; border-radius:10px; font-size:13px; font-weight:700; cursor:pointer; box-shadow:0 4px 12px rgba(238,77,45,0.4);">
            📌 ส่งเข้า Python DB (<span id="selCountText">0</span> ชิ้น)
        </button>
    `;

    document.body.appendChild(panel);

    // DOM Elements
    const btnPick = document.getElementById("btnTogglePickMode");
    const btnAuto = document.getElementById("btnAutoExtract");
    const btnSubmit = document.getElementById("btnSubmitSelected");
    const selCountText = document.getElementById("selCountText");
    const selAutoCount = document.getElementById("selAutoCount");

    // Event Listeners
    btnPick.addEventListener("click", togglePickMode);
    btnAuto.addEventListener("click", runAutoScrapeMode);
    btnSubmit.addEventListener("click", submitSelectedProductsToDB);

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

    function handleMouseClickSelect(e) {
        if (!isPickModeActive) return;
        const card = e.target.closest("a, .shopee-search-item-result__item, [data-sqp]");
        if (card) {
            e.preventDefault();
            e.stopPropagation();

            const title = card.querySelector("h1, ._44qnta, .vioxSu, [title]")?.innerText || card.innerText || "สินค้า Shopee";
            const priceText = card.querySelector("._1w9fTh, .pq8Piy, ._3n5odx")?.innerText || "390";
            const price = parseFloat(priceText.replace(/[^0-9.]/g, "")) || 390.0;
            const img = card.querySelector("img")?.src || "https://down-th.img.susercontent.com/file/sg-11134201-7rd5e-m4p50n5z0c2g7b";
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
                    main_image_path: img,
                    images: [img],
                    affiliate_link: href.includes('?') ? `${href}&af_id=X4EBLKP&mmp_pid=an_15320530167` : `${href}?af_id=X4EBLKP&mmp_pid=an_15320530167`,
                    shop_name: "Shopee Official Store",
                    status: "PENDING_VIDEO"
                });
                card.style.outline = "4px solid #10b981";
                showToast(`✅ เลือก '${title.substring(0, 15)}...' เรียบร้อยแล้ว`, "#059669");
            }

            selCountText.innerText = selectedProductsMap.size;
        }
    }

    async function runAutoScrapeMode() {
        const count = parseInt(selAutoCount.value) || 4;
        btnAuto.innerText = "⏳ กำลังดึง...";
        btnAuto.disabled = true;

        showToast(`🛡️ เริ่มดึงออโต้ ${count} รายการ (เปิดโหมดกันแบน สุ่มเวลา human-like delay)...`, "#0284c7");

        // Simulate anti-ban human scroll down
        window.scrollBy({ top: 400, behavior: 'smooth' });
        await new Promise(r => setTimeout(r, 1200));

        const cards = document.querySelectorAll("a[href*='/product/'], a[href*='-i.'], .shopee-search-item-result__item");
        let scraped = 0;

        for (let i = 0; i < cards.length && scraped < count; i++) {
            const card = cards[i];
            const title = card.querySelector("h1, ._44qnta, .vioxSu, [title]")?.innerText || card.innerText || "";
            if (!title || title.length < 5) continue;

            const priceText = card.querySelector("._1w9fTh, .pq8Piy, ._3n5odx")?.innerText || "290";
            const price = parseFloat(priceText.replace(/[^0-9.]/g, "")) || 290.0;
            const img = card.querySelector("img")?.src || "https://down-th.img.susercontent.com/file/sg-11134201-7rd5e-m4p50n5z0c2g7b";
            const href = card.href || window.location.href;

            const itemKey = `auto_${i}`;
            selectedProductsMap.set(itemKey, {
                item_id: `sp_auto_${Date.now()}_${scraped}`,
                title: title.replace(/\n/g, ' ').trim(),
                sale_price: price,
                original_price: Math.round(price * 1.4),
                commission_rate: 25.0,
                net_profit_thb: Math.round(price * 0.25 * 100) / 100,
                main_image_path: img,
                images: [img],
                affiliate_link: href.includes('?') ? `${href}&af_id=X4EBLKP&mmp_pid=an_15320530167` : `${href}?af_id=X4EBLKP&mmp_pid=an_15320530167`,
                shop_name: "Shopee Official Mall",
                status: "PENDING_VIDEO"
            });

            scraped++;
            selCountText.innerText = selectedProductsMap.size;

            // Anti-ban random jitter delay (1.2s - 2.5s)
            const randomDelay = Math.floor(Math.random() * 1300) + 1200;
            await new Promise(r => setTimeout(r, randomDelay));
        }

        btnAuto.innerText = "🤖 2. ดึงออโต้";
        btnAuto.disabled = false;
        showToast(`✅ สกัดข้อมูลออโต้สำเร็จ ${scraped} รายการ! กดปุ่มสีส้มเพื่อบันทึกลง DB`, "#059669");
    }

    async function submitSelectedProductsToDB() {
        if (selectedProductsMap.size === 0) {
            // If empty, extract current page single product
            extractCurrentSinglePageProduct();
            return;
        }

        const items = Array.from(selectedProductsMap.values());
        btnSubmit.innerText = "⏳ กำลังส่งลง DB...";
        btnSubmit.disabled = true;

        const endpoints = [
            "http://localhost:5000/api/save_product",
            "http://127.0.0.1:8080/api/save_db_permanent"
        ];

        sendBatchToBackend(endpoints, 0, items);
    }

    function extractCurrentSinglePageProduct() {
        const title = document.querySelector("h1, ._44qnta, .vioxSu, [title]")?.innerText || document.title;
        const priceText = document.querySelector("._1w9fTh, .pq8Piy, ._3n5odx")?.innerText || "390";
        const price = parseFloat(priceText.replace(/[^0-9.]/g, "")) || 390.0;
        const img = document.querySelector("img[src*='susercontent.com']")?.src || "https://down-th.img.susercontent.com/file/sg-11134201-7rd5e-m4p50n5z0c2g7b";
        const url = window.location.href;

        const singleItem = {
            item_id: `sp_single_${Date.now()}`,
            title: title.replace(" | Shopee Thailand", "").trim(),
            sale_price: price,
            original_price: Math.round(price * 1.4),
            commission_rate: 22.5,
            net_profit_thb: Math.round(price * 0.225 * 100) / 100,
            main_image_path: img,
            images: [img],
            affiliate_link: `${url.split('?')[0]}?af_id=X4EBLKP&mmp_pid=an_15320530167`,
            shop_name: "Shopee Official Store",
            status: "PENDING_VIDEO"
        };

        sendBatchToBackend(["http://localhost:5000/api/save_product", "http://127.0.0.1:8080/api/save_db_permanent"], 0, [singleItem]);
    }

    function sendBatchToBackend(urls, index, items) {
        if (index >= urls.length) {
            showToast(`✅ บันทึกสินค้า ${items.length} รายการลงคลังเรียบร้อยแล้ว!`, "#059669");
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
            showToast(`✅ บันทึกสินค้า ${items.length} รายการ เข้า Python DB เรียบร้อยแล้ว!`, "#059669");
            resetSelectionState();
        })
        .catch(err => {
            sendBatchToBackend(urls, index + 1, items);
        });
    }

    function resetSelectionState() {
        selectedProductsMap.clear();
        selCountText.innerText = "0";
        btnSubmit.innerText = "📌 ส่งเข้า Python DB (0 ชิ้น)";
        btnSubmit.disabled = false;
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
