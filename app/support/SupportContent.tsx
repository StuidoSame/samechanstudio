"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from "react";

const SUPPORT_APPS = [
  { name: "ODOW", icon: "/assets/icons/ODOW_icon.png" },
  { name: "Mapary", icon: "/assets/icons/Mapary_icon.png" },
  { name: "LOCAUNT", icon: "/assets/icons/Locaunt_icon.png" },
  { name: "Runtronome", icon: "/assets/icons/Runtronome_icon.png" },
  { name: "PepeSnap", icon: "/assets/icons/pepesnap_icon.png" },
  { name: "Tocklist", icon: "/assets/icons/tocklist_icon.png" },
  { name: "Skkoo", icon: "/assets/icons/skkoo_icon.png" },
  { name: "TeruBozu", icon: "/assets/icons/terubozu_icon.png" },
  { name: "Waesseum", icon: "/assets/icons/waesseum_icon.png" },
  { name: "Feeloo", icon: "/assets/icons/feeloo_icon.png" },
] as const;

type SupportAppName = (typeof SUPPORT_APPS)[number]["name"];

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
  const [selectedApp, setSelectedApp] = useState<SupportAppName>("Mapary");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const appRailRef = useRef<HTMLDivElement>(null);
  const scrollFrameRef = useRef<number | null>(null);
  const dragRef = useRef({
    pointerId: -1,
    startX: 0,
    startScrollLeft: 0,
    dragged: false,
  });
  const [dragging, setDragging] = useState(false);
  const [galleryOverflowing, setGalleryOverflowing] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const emailHref = useMemo(() => {
    const subject = encodeURIComponent("[SAME STUDIO] Support");
    const body = encodeURIComponent(
      `앱 이름: ${selectedApp}\n\n사용 기기:\n\nOS 버전:\n\n문의 내용:\n`,
    );
    return `mailto:contact@samestudio.kr?subject=${subject}&body=${body}`;
  }, [selectedApp]);

  const updateGalleryState = useCallback(() => {
    if (scrollFrameRef.current !== null) return;
    scrollFrameRef.current = window.requestAnimationFrame(() => {
      scrollFrameRef.current = null;
      const rail = appRailRef.current;
      if (!rail) return;
      const maxScrollLeft = Math.max(rail.scrollWidth - rail.clientWidth, 0);
      const overflowing = maxScrollLeft > 2;
      setGalleryOverflowing(overflowing);
      setCanScrollLeft(overflowing && rail.scrollLeft > 2);
      setCanScrollRight(
        overflowing && rail.scrollLeft < maxScrollLeft - 2,
      );
    });
  }, []);

  useEffect(() => {
    const rail = appRailRef.current;
    if (!rail) return;
    const observer = new ResizeObserver(updateGalleryState);
    observer.observe(rail);
    Array.from(rail.children).forEach((item) => observer.observe(item));
    updateGalleryState();

    return () => {
      observer.disconnect();
      if (scrollFrameRef.current !== null) {
        window.cancelAnimationFrame(scrollFrameRef.current);
        scrollFrameRef.current = null;
      }
      const pointerId = dragRef.current.pointerId;
      if (pointerId >= 0 && rail.hasPointerCapture(pointerId)) {
        rail.releasePointerCapture(pointerId);
      }
    };
  }, [updateGalleryState]);

  const moveGalleryByPage = (direction: -1 | 1) => {
    const rail = appRailRef.current;
    if (!rail) return;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    rail.scrollBy({
      left: rail.clientWidth * 0.7 * direction,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  };

  const onGalleryKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    moveGalleryByPage(event.key === "ArrowLeft" ? -1 : 1);
  };

  const onGalleryWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    const rail = appRailRef.current;
    if (!rail || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
    const movingRight = event.deltaY > 0;
    if (
      (movingRight && !canScrollRight) ||
      (!movingRight && !canScrollLeft)
    ) {
      return;
    }
    event.preventDefault();
    rail.scrollLeft += event.deltaY;
  };

  const startAppRailDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    const rail = appRailRef.current;
    if (!rail || rail.scrollWidth <= rail.clientWidth + 2) return;
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
    updateGalleryState();
  };

  return (
    <div className="support-card-content">
      <section className="support-section support-contact-section" aria-labelledby="support-contact-title">
        <div className="support-section-heading">
          <span className="support-eyebrow-index">01</span>
          <h2 id="support-contact-title">CONTACT</h2>
          <span className="support-heading-line" aria-hidden="true" />
        </div>
        <div
          className={`support-app-gallery${galleryOverflowing ? " is-scrollable" : ""}`}
        >
          {galleryOverflowing && (
            <button
              type="button"
              className="support-app-arrow support-app-arrow--previous"
              aria-label="이전 앱 보기"
              disabled={!canScrollLeft}
              onClick={() => moveGalleryByPage(-1)}
            >
              <span aria-hidden="true">‹</span>
            </button>
          )}
          <div
            ref={appRailRef}
            className={`support-app-rail${dragging ? " is-dragging" : ""}`}
            role="region"
            aria-label="문의할 앱 선택"
            tabIndex={0}
            onScroll={updateGalleryState}
            onKeyDown={onGalleryKeyDown}
            onWheel={onGalleryWheel}
            onPointerDown={startAppRailDrag}
            onPointerMove={moveAppRail}
            onPointerUp={finishAppRailDrag}
            onPointerCancel={finishAppRailDrag}
            onLostPointerCapture={finishAppRailDrag}
            onClickCapture={(event) => {
              if (!dragRef.current.dragged) return;
              event.preventDefault();
              event.stopPropagation();
              dragRef.current.dragged = false;
            }}
          >
            {SUPPORT_APPS.map((app) => (
              <button
                key={app.name}
                type="button"
                className="support-app-icon-button"
                aria-label={`${app.name} 선택`}
                aria-pressed={selectedApp === app.name}
                onClick={() => setSelectedApp(app.name)}
              >
                <span className="support-app-icon-frame">
                  <Image
                    src={app.icon}
                    alt={`${app.name} 앱 아이콘`}
                    width={96}
                    height={96}
                    sizes="(max-width: 680px) 66px, 88px"
                    draggable={false}
                    unoptimized
                    onLoad={updateGalleryState}
                  />
                </span>
                <span className="support-app-icon-label">{app.name}</span>
              </button>
            ))}
          </div>
          {galleryOverflowing && (
            <button
              type="button"
              className="support-app-arrow support-app-arrow--next"
              aria-label="다음 앱 보기"
              disabled={!canScrollRight}
              onClick={() => moveGalleryByPage(1)}
            >
              <span aria-hidden="true">›</span>
            </button>
          )}
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
