function loadModal(modalContainer, modalUrl, progressContainer, progressUrl, callback) {
    // Jika modal belum ada, load
    if ($(modalContainer).children().length === 0) {
        $(modalContainer).load(modalUrl, function () {
            const modal = $(this).find(".modal");
            if (!modal.length) {
                console.error("❌ Modal gagal diload");
                return;
            }

            // Load progress modal opsional
            if (progressContainer && progressUrl) {
                $(progressContainer).load(progressUrl, function () {
                    console.log("⏳ Progress modal loaded");
                    if (typeof callback === "function") callback(modal);
                });
            } else {
                if (typeof callback === "function") callback(modal);
            }
        });
    } else {
        // Jika modal sudah ada, langsung callback
        const modal = $(modalContainer).find(".modal");
        if (typeof callback === "function") callback(modal);
    }
}
