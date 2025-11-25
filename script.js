let stage = "wait_start"; // 状態管理
let startTime;
let html5QrCode;

// --- ページ読み込み時にイベントを設定 ---
window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("startButton").addEventListener("click", startCamera);
});

// --- カメラ起動処理 ---
function startCamera() {
  // Safari対策：ダイアログを1回挟む
  alert("カメラを起動します！");

  document.getElementById("startButton").style.display = "none";
  document.getElementById("reader").style.display = "block";
  document.getElementById("status").textContent = "7階のQRコードを読み込んでください";


  html5QrCode = new Html5Qrcode("reader");
  html5QrCode.start(
    { facingMode: "environment" }, // 背面カメラを使用
    { fps: 10, qrbox: 250 },
    onScanSuccess
  ).catch(err => {
    alert("カメラを起動できませんでした。設定を確認してください。");
    console.error(err);
  });
}




// --- QR読み取り時の処理 ---
// --- QRコードを検出したとき ---
function onScanSuccess(decodedText) {

    console.log("QR検出:", decodedText);

    // --- START ---
    if (stage === "wait_start" && decodedText === "START_QR") {
        stage = "running";
        startTime = Date.now();

        // ★スタート演出表示
        const effect = document.getElementById("startEffect");
        effect.style.display = "flex";
        effect.style.animation = "startFade 0.8s forwards";

        // 0.8秒後に非表示
        setTimeout(() => {
            effect.style.display = "none";
        }, 800);

        // タイマー表示開始
        document.getElementById("timer").style.display = "block";

        document.getElementById("status").innerHTML =
            "計測中...<br>2階のQRを読み取ってください";

        const timerLoop = setInterval(() => {
            if (stage !== "running") {
                clearInterval(timerLoop);
                return;
            }
            document.getElementById("timer").textContent =
                ((Date.now() - startTime) / 1000).toFixed(2) + " 秒";
        }, 80);
    }

    // --- STOP ---
    else if (stage === "running" && decodedText === "STOP_QR") {
        stage = "finished";
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

        const statusEl = document.getElementById("status");
        statusEl.innerHTML =
            `<span class="result-pop" style="font-size:2.5em; font-weight:bold;">結果：${elapsed} 秒！</span>`;

        // アニメ終了後クラス削除
        statusEl.querySelector(".result-pop")
            .addEventListener("animationend", e => {
                e.target.classList.remove("result-pop");
            });

        // カメラ停止
        if (html5QrCode) {
            html5QrCode.stop().then(() => html5QrCode.clear());
        }

        document.getElementById("reader").style.display = "none";
        document.getElementById("timer").style.display = "none";

        // 入力フォーム表示
        document.getElementById("formArea").style.display = "block";

        // 送信ボタン処理
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
                `<span style="font-size:1.6em;">送信しました！ご協力ありがとうございました！</span>`;
            document.getElementById("formArea").style.display = "none";
        };
    }
}



// --- Googleフォームに送信 ---
function sendToGoogleForm(name, time, times, habit) {
  const formURL = "https://docs.google.com/forms/d/e/【あなたのformResponseURL】/formResponse";
  const formData = new FormData();

  // Googleフォームの entry番号 をここに対応させる
  formData.append("entry.1355586289", name);
  formData.append("entry.1851549436", time);
  formData.append("entry.1542941412", times);
  formData.append("entry.889042589", habit);

  fetch(formURL, {
    method: "POST",
    mode: "no-cors",
    body: formData
  });
}
