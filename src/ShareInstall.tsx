import { useEffect, useState } from "react";
import { Copy, Download, QrCode, Share2, Smartphone } from "lucide-react";

export const PUBLIC_APP_URL = "https://gmlduqzhd123-lab.github.io/Volleyball/";
interface InstallPrompt extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}
function inApp() {
  return window.matchMedia("(display-mode: standalone)").matches ||
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
}

export default function ShareInstall() {
  const [qr, setQr] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [message, setMessage] = useState("");
  const [installEvent, setInstallEvent] = useState<InstallPrompt | null>(null);
  const [installed, setInstalled] = useState(inApp);
  const [installing, setInstalling] = useState(false);
  const [canShare] = useState(() => typeof navigator.share === "function");

  useEffect(() => {
    if (!expanded || qr) return;
    let active = true;
    import("qrcode").then(({ default: QRCode }) => QRCode.toDataURL(PUBLIC_APP_URL, {
      width: 360, margin: 4, errorCorrectionLevel: "M",
      color: { dark: "#194a3a", light: "#ffffff" },
    })).then((url) => { if (active) setQr(url); })
      .catch(() => { if (active) setMessage("QR코드를 불러오지 못했어요. 아래 링크를 이용해 주세요."); });
    return () => { active = false; };
  }, [expanded, qr]);

  useEffect(() => {
    const capture = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as InstallPrompt);
    };
    const complete = () => { setInstalled(true); setInstallEvent(null); };
    const mode = window.matchMedia("(display-mode: standalone)");
    const modeChange = () => setInstalled(inApp());
    window.addEventListener("beforeinstallprompt", capture);
    window.addEventListener("appinstalled", complete);
    mode.addEventListener("change", modeChange);
    return () => {
      window.removeEventListener("beforeinstallprompt", capture);
      window.removeEventListener("appinstalled", complete);
      mode.removeEventListener("change", modeChange);
    };
  }, []);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(PUBLIC_APP_URL);
      setMessage("링크를 복사했어요.");
    } catch {
      setMessage("자동 복사가 지원되지 않아요. 아래 주소를 길게 누르거나 선택해 복사해 주세요.");
    }
  }
  async function share() {
    try {
      await navigator.share({ title: "우리 모두 배구왕", text: "함께 배우고, 함께 뛰어요!", url: PUBLIC_APP_URL });
      setMessage("공유 창 사용을 마쳤어요.");
    } catch (error) {
      if ((error as Error).name !== "AbortError") setMessage("공유 창을 열지 못했어요. 링크 복사를 이용해 주세요.");
    }
  }
  async function install() {
    if (!installEvent || installing) return;
    const prompt = installEvent;
    setInstalling(true);
    try {
      await prompt.prompt();
      const choice = await prompt.userChoice;
      setMessage(choice.outcome === "accepted" ? "설치 요청을 수락했어요. 기기의 설치 완료를 기다려 주세요." : "설치를 취소했어요. 브라우저 메뉴에서도 설치할 수 있어요.");
    } catch {
      setMessage("설치 창을 열지 못했어요. 아래 설치 방법을 확인해 주세요.");
    } finally {
      setInstallEvent(null);
      setInstalling(false);
    }
  }

  return (
    <section className="share-install" aria-label="공유와 앱 설치">
      <details onToggle={(event) => setExpanded(event.currentTarget.open)}>
        <summary><QrCode size={19} /> 함께 쓰기 · QR코드와 앱 설치</summary>
        <div className="share-content">
          <div className="qr-card">
            <h2>배구왕을 함께 나눠요</h2>
            <p>카메라로 QR코드를 비추면 공개 사이트로 연결돼요.</p>
            {qr && <a href={PUBLIC_APP_URL} aria-label="QR코드의 공개 사이트 열기"><img src={qr} width="180" height="180" alt="우리 모두 배구왕 공개 사이트 QR코드" /></a>}
            {qr && <a className="button secondary small" href={qr} download="volleyball-king-qr.png"><Download size={16} /> QR 이미지 저장</a>}
          </div>
          <div className="share-options">
            <h2>함께 배우고, 더 쉽게 만나요</h2>
            <div className="share-actions">
              <button className="button secondary small" onClick={copyLink}><Copy size={16} /> 링크 복사</button>
              {canShare && <button className="button secondary small" onClick={share}><Share2 size={16} /> 기기로 공유</button>}
              {!installed && installEvent && <button className="button small" disabled={installing} onClick={install}><Smartphone size={16} /> {installing ? "설치 창 여는 중…" : "앱 설치"}</button>}
            </div>
            <label className="share-url">공개 사이트 주소<input readOnly value={PUBLIC_APP_URL} aria-label="공유 링크" onFocus={(event) => event.currentTarget.select()} /></label>
            <p className="share-status" role="status" aria-live="polite">{message}</p>
            {installed ? <p className="installed-note">설치한 앱으로 이용 중이거나 앱 설치가 완료되었어요.</p> : <details className="install-help" open={!installEvent}>
              <summary>홈 화면 · 데스크톱에 설치하는 방법</summary>
              <ul>
                <li><b>아이폰·아이패드</b> Safari에서 사이트를 열고 공유 버튼 → ‘홈 화면에 추가’를 선택하세요. ‘웹 앱으로 열기’ 항목이 있으면 켜 주세요.</li>
                <li><b>안드로이드</b> Chrome에서 메뉴(⋮) → ‘앱 설치’ 또는 ‘홈 화면에 추가’를 선택하세요.</li>
                <li><b>Windows·Mac</b> Chrome·Edge의 주소창 설치 아이콘 또는 브라우저 메뉴의 ‘앱 설치’를 이용하세요. Mac의 Safari는 파일 메뉴 → ‘Dock에 추가’를 이용하세요.</li>
              </ul>
              <p>메뉴 이름과 지원 여부는 기기·브라우저에 따라 달라요. 메신저 안에서 열었다면 Safari나 Chrome으로 다시 열어 주세요.</p>
            </details>}
            <p className="offline-note">설치 후 방문한 학습 자료는 오프라인에서도 볼 수 있어요. 유튜브 영상 재생에는 인터넷 연결이 필요해요.</p>
          </div>
        </div>
      </details>
    </section>
  );
}
