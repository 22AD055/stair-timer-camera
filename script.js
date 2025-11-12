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
function onScanSuccess(decodedText) {
  console.log("QR検出:", decodedText);

  // START_QRを読み取った場合
  if (stage === "wait_start" && decodedText === "START_QR") {
    startTime = Date.now();
    stage = "running";
    document.getElementById("status").innerHTML = "計測中...<br>2階のQRを読み取ってください";

    const timerDisplay = document.getElementById("timer");
    const timerInterval = setInterval(() => {
      if (stage !== "running") {
        clearInterval(timerInterval);
        return;
      }
      const elapsed = (Date.now() - startTime) / 1000;
      timerDisplay.textContent = `${elapsed.toFixed(2)} 秒`;
    }, 100);
  }

  // STOP_QRを読み取った場合
  else if (stage === "running" && decodedText === "STOP_QR") {
  stage = "finished";
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

  const statusEl = document.getElementById("status");
  statusEl.innerHTML = `<span class="result-pop" style="font-size:2.5em; font-weight:bold;">結果：${elapsed} 秒！</span>`;
  
  // アニメーションが終わったらクラスを削除（次の結果時に再適用できるように）
  const resultEl = statusEl.querySelector(".result-pop");
  resultEl.addEventListener("animationend", () => {
    resultEl.classList.remove("result-pop");
  });

  document.getElementById("timer").textContent = `${elapsed} 秒`;

  const name = prompt("名前を入力してください（ランキング用）");
  if (name) {
    sendToGoogleForm(name, elapsed);
  }

　// カメラを停止（安全に）
  if (html5QrCode) {
    html5QrCode.stop()
      .then(() => {
        html5QrCode.clear();
      })
      .catch(err => console.error("カメラ停止エラー:", err));
  }

  // カメラ領域とタイマーを非表示
  document.getElementById("reader").style.display = "none";
  document.getElementById("timer").style.display = "none";

  // ステータスの下に一言メッセージを追加（任意）
  statusEl.innerHTML += `<div style="margin-top:20px; font-size:1.2em;">ご協力ありがとうございました！</div>`;
　}
}

// --- Googleフォームに送信 ---
function sendToGoogleForm(name, time) {
  const formURL = "https://docs.google.com/forms/u/0/d/1AIB5dqPyadzNFs5uNWDdKZSxPqYBZFqcvDBDzKzZyks/formResponse";
  const formData = new FormData();
  formData.append("entry.1355586289", name); // ← 名前用 entry 番号
  formData.append("entry.1851549436", time); // ← タイム用 entry 番号

  fetch(formURL, {
    method: "POST",
    mode: "no-cors",
    body: formData
  })
  .then(() => alert("記録を送信しました！"))
  .catch(() => alert("送信に失敗しました。"));
}
