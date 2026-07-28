"use client";

import {
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

const SUPPORT_APPS = [
  "ODOW",
  "Mapary",
  "LOCAUNT",
  "Runtronome",
  "PepeSnap",
  "Tocklist",
  "Skkoo",
  "TeruBozu",
  "Waesseum",
  "Feeloo",
] as const;

const FAQ_ITEMS = [
  {
    question: "앱에서 오류가 발생했어요.",
    answer:
      "앱과 기기를 다시 시작한 뒤 최신 버전인지 확인해주세요. 문제가 계속되면 사용 기기, OS 버전, 오류가 발생한 순서를 함께 보내주시면 확인에 도움이 됩니다.",
  },
  {
    question: "구매를 복원하고 싶어요.",
    answer:
      "구매 당시 사용한 App Store 또는 Google Play 계정으로 로그인한 뒤 앱의 구매 복원 기능을 이용해주세요. 복원이 되지 않으면 구매 플랫폼과 영수증 정보를 이메일로 보내주세요.",
  },
  {
    question: "개인정보 삭제를 요청하고 싶어요.",
    answer:
      "EMAIL SUPPORT 버튼을 통해 사용 중인 앱 이름과 삭제를 원하는 정보를 알려주세요. 필요한 확인 절차와 처리 방법을 순서대로 안내해드립니다.",
  },
] as const;

export function SupportContent() {
  const [selectedApp, setSelectedApp] = useState<(typeof SUPPORT_APPS)[number]>(
    "Mapary",
  );
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const appRailRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({
    pointerId: -1,
    startX: 0,
    startScrollLeft: 0,
    dragged: false,
  });
  const [dragging, setDragging] = useState(false);

  const emailHref = useMemo(() => {
    const subject = encodeURIComponent("[SAME STUDIO] Support");
    const body = encodeURIComponent(
      `앱 이름: ${selectedApp}\n\n사용 기기:\n\nOS 버전:\n\n문의 내용:\n`,
    );
    return `mailto:contact@samestudio.kr?subject=${subject}&body=${body}`;
  }, [selectedApp]);

  const startAppRailDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    const rail = appRailRef.current;
    if (!rail) return;
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startScrollLeft: rail.scrollLeft,
      dragged: false,
    };
    setDragging(true);
    rail.setPointerCapture(event.pointerId);
  };

  const moveAppRail = (event: ReactPointerEvent<HTMLDivElement>) => {
    const rail = appRailRef.current;
    const drag = dragRef.current;
    if (!rail || drag.pointerId !== event.pointerId) return;
    const distance = event.clientX - drag.startX;
    if (Math.abs(distance) > 5) drag.dragged = true;
    rail.scrollLeft = drag.startScrollLeft - distance;
  };

  const finishAppRailDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const rail = appRailRef.current;
    if (dragRef.current.pointerId !== event.pointerId) return;
    if (rail?.hasPointerCapture(event.pointerId)) {
      rail.releasePointerCapture(event.pointerId);
    }
    dragRef.current.pointerId = -1;
    setDragging(false);
  };

  return (
    <div className="support-card-content">
      <section className="support-section support-contact-section" aria-labelledby="support-contact-title">
        <div className="support-section-heading">
          <span className="support-eyebrow-index">01</span>
          <h2 id="support-contact-title">CONTACT</h2>
          <span className="support-heading-line" aria-hidden="true" />
        </div>
        <p className="support-section-intro">
          도움이 필요한 앱을 선택해주세요.
        </p>
        <div
          ref={appRailRef}
          className={`support-app-rail${dragging ? " is-dragging" : ""}`}
          aria-label="문의할 앱 선택"
          onPointerDown={startAppRailDrag}
          onPointerMove={moveAppRail}
          onPointerUp={finishAppRailDrag}
          onPointerCancel={finishAppRailDrag}
          onClickCapture={(event) => {
            if (!dragRef.current.dragged) return;
            event.preventDefault();
            event.stopPropagation();
            dragRef.current.dragged = false;
          }}
        >
          {SUPPORT_APPS.map((app) => (
            <button
              key={app}
              type="button"
              className="support-app-pill"
              aria-pressed={selectedApp === app}
              onClick={() => setSelectedApp(app)}
            >
              {app}
            </button>
          ))}
        </div>
      </section>

      <section className="support-section support-form-section" aria-labelledby="support-form-title">
        <div className="support-section-heading">
          <span className="support-eyebrow-index">02</span>
          <h2 id="support-form-title">SUPPORT DETAILS</h2>
          <span className="support-heading-line" aria-hidden="true" />
        </div>
        <div className="support-form-grid" aria-label="문의 내용 안내">
          <div className="support-form-field">
            <span className="support-form-label">앱 이름</span>
            <strong className="support-form-selected">{selectedApp}</strong>
            <span className="support-form-example">예: Mapary</span>
          </div>
          <div className="support-form-field">
            <span className="support-form-label">사용 기기</span>
            <span className="support-form-example">예: iPhone 17 Pro / Galaxy S26</span>
          </div>
          <div className="support-form-field">
            <span className="support-form-label">OS 버전</span>
            <span className="support-form-example">예: iOS 26.5 / Android 16</span>
          </div>
          <div className="support-form-field support-form-field--message">
            <span className="support-form-label">문의 내용</span>
            <span className="support-form-example">
              예:<br />
              앱 실행 후 사진을 저장하면<br />
              상세 화면에서 이미지가 보이지 않습니다.
            </span>
          </div>
        </div>
        <a className="support-email-cta" href={emailHref}>
          <span>EMAIL SUPPORT</span>
          <span aria-hidden="true">→</span>
        </a>
      </section>

      <aside className="support-response-card" aria-labelledby="support-response-title">
        <span className="support-response-dot" aria-hidden="true" />
        <div>
          <h2 id="support-response-title">RESPONSE TIME</h2>
          <p>문의는 영업일 기준 순차적으로 확인합니다.</p>
          <p>문의 내용에 따라 답변까지 시간이 조금 걸릴 수 있습니다.</p>
        </div>
      </aside>

      <section className="support-section support-faq-section" aria-labelledby="support-faq-title">
        <div className="support-section-heading">
          <span className="support-eyebrow-index">03</span>
          <h2 id="support-faq-title">FAQ</h2>
          <span className="support-heading-line" aria-hidden="true" />
        </div>
        <div className="support-faq-list">
          {FAQ_ITEMS.map((item, index) => {
            const open = openFaqIndex === index;
            const panelId = `support-faq-panel-${index}`;
            return (
              <div className="support-faq-item" key={item.question}>
                <h3>
                  <button
                    type="button"
                    aria-expanded={open}
                    aria-controls={panelId}
                    onClick={() => setOpenFaqIndex(open ? null : index)}
                  >
                    <span>{item.question}</span>
                    <span className="support-faq-symbol" aria-hidden="true">
                      {open ? "−" : "+"}
                    </span>
                  </button>
                </h3>
                <div
                  id={panelId}
                  className="support-faq-answer"
                  role="region"
                  aria-hidden={!open}
                >
                  <div><p>{item.answer}</p></div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
