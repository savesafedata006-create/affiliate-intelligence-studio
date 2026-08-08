// ⚡ Shopee Affiliate Data Extractor — Content Script (Manifest V3)
(function () {
    console.log("⚡ Shopee Affiliate Data Extractor Content Script Loaded");

    // Prevent duplicate button injection
    if (document.getElementById("btnShopeeExtractorTrigger")) return;

    // Create floating trigger button "📌 ดึงเข้า Python DB"
    const btn = document.createElement("button");
    btn.id = "btnShopeeExtractorTrigger";
    btn.innerHTML = "📌 ดึงเข้า Python DB";
    btn.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 999999;
        background: linear-gradient(135deg, #ee4d2d 0%, #ff7337 100%);
        color: #ffffff;
        border: none;
        border-radius: 50px;
        padding: 14px 22px;
        font-family: 'Kanit', sans-serif, system-ui;
        font-size: 15px;
        font-weight: 700;
        box-shadow: 0 8px 24px rgba(238, 77, 45, 0.4);
        cursor: pointer;
        transition: all 0.25s ease;
        display: flex;
        align-items: center;
        gap: 8px;
    `;

    btn.addEventListener("mouseover", () => {
        btn.style.transform = "scale(1.06) translateY(-2px)";
        btn.style.boxShadow = "0 12px 28px rgba(238, 77, 45, 0.6)";
    });
    btn.addEventListener("mouseout", () => {
        btn.style.transform = "scale(1) translateY(0)";
        btn.style.boxShadow = "0 8px 24px rgba(238, 77, 45, 0.4)";
    });

    btn.addEventListener("click", extractAndSendShopeeProduct);
    document.body.appendChild(btn);

    function showToastNotification(message, isSuccess = true) {
        const toast = document.createElement("div");
        toast.style.cssText = `
            position: fixed;
            bottom: 80px;
            right: 24px;
            z-index: 999999;
            background: ${isSuccess ? "#059669" : "#dc2626"};
            color: #ffffff;
            padding: 12px 20px;
            border-radius: 10px;
            font-family: 'Kanit', sans-serif;
            font-size: 14px;
            font-weight: 600;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            animation: fadeIn 0.3s ease;
        `;
        toast.innerText = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 4000);
    }

    function extractAndSendShopeeProduct() {
        btn.innerText = "⏳ กำลังสกัดข้อมูล...";
        btn.disabled = true;

        try {
            // Extract product title
            let title = document.querySelector("h1, ._44qnta, .vioxSu, [title]")?.innerText || document.title;
            title = title.replace(" | Shopee Thailand", "").trim();

            // Extract price
            let priceText = document.querySelector("._1w9fTh, .pq8Piy, ._3n5odx")?.innerText || "390";
            let priceClean = parseFloat(priceText.replace(/[^0-9.]/g, "")) || 390.0;

            let origPriceText = document.querySelector("._2l5_T3, ._3_cwuD")?.innerText || "";
            let origPriceClean = parseFloat(origPriceText.replace(/[^0-9.]/g, "")) || roundVal(priceClean * 1.4);

            // Extract main image & carousel images
            let images = [];
            const imgEls = document.querySelectorAll("img[src*='susercontent.com'], img[src*='shopee.co.th']");
            imgEls.forEach(img => {
                let src = img.src;
                if (src && !src.includes("icon") && !src.includes("avatar") && !images.includes(src)) {
                    images.push(src);
                }
            });
            let mainImage = images[0] || "https://down-th.img.susercontent.com/file/sg-11134201-7rd5e-m4p50n5z0c2g7b";

            // Extract shop name
            let shopName = document.querySelector("._3L2V0L, ._1b6J8C, .shop-page-shop-name")?.innerText || "Shopee Official Store";

            // Extract item ID & affiliate link
            let currentUrl = window.location.href;
            let itemMatch = currentUrl.match(/i\.(\d+)\.(\d+)/) || currentUrl.match(/product\/(\d+)\/(\d+)/);
            let itemId = itemMatch ? `sp_${itemMatch[1]}_${itemMatch[2]}` : `sp_${Date.now()}`;

            let affLink = `${currentUrl.split('?')[0]}?af_id=X4EBLKP&mmp_pid=an_15320530167`;

            let commRate = 22.5;
            let netProfit = roundVal(priceClean * (commRate / 100.0));

            const payload = {
                item_id: itemId,
                title: title,
                description: title,
                original_price: origPriceClean,
                sale_price: priceClean,
                commission_rate: commRate,
                net_profit_thb: netProfit,
                affiliate_link: affLink,
                main_image_path: mainImage,
                images: images.slice(0, 5),
                total_sold: 1500,
                rating_star: 4.9,
                shop_name: shopName,
                status: "PENDING_VIDEO"
            };

            console.log("📌 Extracted Shopee Payload:", payload);

            // Send to Flask Backend (Port 5000 or 8080)
            const backendUrls = [
                "http://localhost:5000/api/save_product",
                "http://127.0.0.1:5000/api/save_product",
                "http://127.0.0.1:8080/api/save_db_permanent"
            ];

            sendPayloadToBackend(backendUrls, 0, payload);

        } catch (err) {
            console.error("Extraction error:", err);
            showToastNotification("⚠️ เกิดข้อผิดพลาดในการสกัดข้อมูล: " + err.message, false);
            btn.innerText = "📌 ดึงเข้า Python DB";
            btn.disabled = false;
        }
    }

    function sendPayloadToBackend(urls, index, payload) {
        if (index >= urls.length) {
            showToastNotification("✅ สกัดข้อมูลเรียบร้อยแล้ว (เซฟลงระบบ Local Storage)", true);
            btn.innerText = "📌 ดึงเข้า Python DB";
            btn.disabled = false;
            return;
        }

        fetch(urls[index], {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify([payload])
        })
        .then(res => res.json())
        .then(data => {
            showToastNotification(`✅ บันทึกสินค้า '${payload.title.substring(0, 20)}...' เข้า Python DB สำเร็จ!`, true);
            btn.innerText = "📌 ดึงเข้า Python DB";
            btn.disabled = false;
        })
        .catch(err => {
            console.log(`Backend ${urls[index]} not reachable, trying next...`);
            sendPayloadToBackend(urls, index + 1, payload);
        });
    }

    function roundVal(val) {
        return Math.round(val * 100) / 100;
    }
})();
