let stage = "wait_start";
let startTime;
let html5QrCode;

// --- ページロード時 ---
window.addEventListener("DOMContentLoaded", () => {
    document.getElementById("startButton").addEventListener("click", startCamera);
});

// --- カメラ起動 ---
function startCamera() {

    alert("カメラを起動します！");

    // 1. ボタン押した直後に起動（← iPhone で必須）
    html5QrCode = new Html5Qrcode("reader");

    html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        onScanSuccess
    ).then(() => {
        // 2. 成功したら UI を出す（iPhoneはこの順番が必要）
        document.getElementById("startButton").style.display = "none";
        document.getElementById("reader").style.display = "block";

        const timerEl = document.getElementById("timer");
        timerEl.style.display = "block";
        timerEl.textContent = "0.00 秒";

        document.getElementById("status").innerHTML =
            "7階のQRコードを<br>読み取ってください";
    }).catch(err => {
        alert("カメラを起動できませんでした。権限設定を確認してください。");
        console.error(err);
    });
}


// --- QR読み取り ---
function onScanSuccess(decodedText) {
    console.log("QR:", decodedText);

    /* -------- START -------- */
    if (stage === "wait_start" && decodedText === "START_QR") {

        stage = "running";
        startTime = Date.now();

        const effect = document.getElementById("startEffect");
        effect.style.display = "flex";
        effect.style.animation = "none";
        void effect.offsetWidth;
        effect.style.animation = "startFade 3.0s forwards";

        setTimeout(() => { effect.style.display = "none"; }, 3000);

        document.getElementById("status").innerHTML =
            "階段を降りて、<br>2階の停止コードを<br>読み込んでください！";

        const timerEl = document.getElementById("timer");
        timerEl.textContent = "0.00 秒";

        const timerLoop = setInterval(() => {
            if (stage !== "running") { clearInterval(timerLoop); return; }
            timerEl.textContent =
                ((Date.now() - startTime) / 1000).toFixed(2) + " 秒";
        }, 80);
    }

    /* -------- STOP -------- */
    else if (stage === "running" && decodedText === "STOP_QR") {

        stage = "finished";
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

        const statusEl = document.getElementById("status");
        statusEl.innerHTML =
            `<span class="result-pop" style="font-size:1.8em; font-weight:bold;">結果：${elapsed} 秒！</span>`;

        html5QrCode.stop().then(() => html5QrCode.clear());

        document.getElementById("reader").style.display = "none";
        document.getElementById("timer").style.display = "none";
        document.getElementById("formArea").style.display = "block";

        document.getElementById("submitRecord").onclick = () => {
    const name = document.getElementById("inputName").value;
    const times = document.getElementById("inputTimes").value;
    const habit = document.getElementById("inputHabit").value;

    if (!name) {
        alert("名前を入力してください！");
        return;
    }

    sendToGoogleForm(name, elapsed, times, habit);

    statusEl.innerHTML =
    `<div class="finish-message">
        記録を送信しました！<br>お疲れ様でした！
     </div>`;

    document.getElementById("formArea").style.display = "none";

    // ★★★ ここからアンケート案内表示 ★★★
    const survey = document.getElementById("surveyArea");
    const link = document.getElementById("surveyLink");

    survey.style.display = "block";
    link.href = "https://docs.google.com/forms/d/e/1FAIpQLSfo3chqeLfie63jbyLHMCJ5aqdk-jrstxEsAMmUoUqKNfkO_A/viewform?usp=header";
};

    }
}

function sendToGoogleForm(name, time, times, habit) {

    const formURL = "https://docs.google.com/forms/u/0/d/1AIB5dqPyadzNFs5uNWDdKZSxPqYBZFqcvDBDzKzZyks/formResponse";

    const fd = new FormData();
    fd.append("entry.1355586289", name);
    fd.append("entry.1851549436", time);
    fd.append("entry.1542941412", times);
    fd.append("entry.889042589", habit);

    fetch(formURL, { method: "POST", mode: "no-cors", body: fd });
}
