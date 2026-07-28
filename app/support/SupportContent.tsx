"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
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
      "먼저 앱과 기기를 완전히 종료한 뒤 다시 실행하고, 앱이 최신 버전인지 확인해주세요. 문제가 계속되면 앱 이름, 사용 기기, OS 버전, 오류가 발생한 순서와 스크린샷을 함께 보내주시면 확인에 도움이 됩니다. 특정 동작에서 반복되는 문제라면 재현 과정을 순서대로 작성해주세요.",
  },
  {
    question: "구매한 항목을 복원하고 싶어요.",
    answer:
      "앱의 설정 또는 구매 화면에 있는 ‘구매 복원’ 기능을 먼저 이용해주세요. 구매할 때 사용한 Apple ID 또는 Google 계정으로 로그인되어 있어야 정상적으로 복원됩니다. 복원이 되지 않으면 앱 이름과 구매 시 사용한 스토어 정보를 함께 보내주세요.",
  },
  {
    question: "개인정보 삭제를 요청하고 싶어요.",
    answer:
      "contact@samestudio.kr로 앱 이름과 개인정보 삭제 요청 내용을 보내주세요. 본인 확인이나 계정 식별을 위해 필요한 최소한의 정보를 추가로 요청할 수 있습니다. 확인이 끝나면 해당 앱의 처리 절차에 따라 순차적으로 안내해드립니다.",
  },
  {
    question: "앱이 실행되지 않거나 바로 종료돼요.",
    answer:
      "기기를 재시작하고 앱을 최신 버전으로 업데이트한 뒤 다시 실행해주세요. 저장 공간이 부족하거나 OS 버전이 오래된 경우에도 앱이 정상적으로 실행되지 않을 수 있습니다. 계속 종료된다면 사용 기기, OS 버전, 앱 버전과 발생 시점을 보내주세요.",
  },
  {
    question: "알림이 오지 않아요.",
    answer:
      "기기의 설정에서 해당 앱의 알림 권한이 허용되어 있는지 먼저 확인해주세요. 배터리 절약 모드, 집중 모드, 백그라운드 제한 설정 때문에 알림이 지연되거나 차단될 수 있습니다. 앱 내부의 알림 시간과 반복 설정도 함께 확인해주세요.",
  },
  {
    question: "사진이나 데이터가 저장되지 않아요.",
    answer:
      "앱의 사진, 카메라 또는 저장 공간 권한이 허용되어 있는지 확인해주세요. 네트워크 연결이 필요한 기능이라면 Wi-Fi 또는 모바일 데이터 상태도 함께 확인해주세요. 문제가 반복되면 어떤 화면에서 저장을 시도했는지와 오류 화면을 보내주세요.",
  },
  {
    question: "다른 기기로 데이터를 옮기고 싶어요.",
    answer:
      "앱에서 백업, 복원 또는 계정 동기화 기능을 제공하는 경우 먼저 해당 기능을 이용해주세요. 같은 Apple ID, Google 계정 또는 앱 계정으로 로그인해야 데이터가 연결되는 앱도 있습니다. 지원 여부는 앱마다 다르므로 앱 이름과 이전·새 기기 정보를 함께 문의해주세요.",
  },
  {
    question: "광고 제거 구매가 적용되지 않아요.",
    answer:
      "구매에 사용한 동일한 스토어 계정으로 로그인되어 있는지 확인한 뒤 구매 복원을 실행해주세요. 결제 직후라면 스토어 반영에 시간이 조금 걸릴 수 있으므로 잠시 후 다시 확인해주세요. 중복 결제를 시도하지 말고 계속 적용되지 않으면 앱 이름과 구매 시점을 보내주세요.",
  },
  {
    question: "앱 사용 방법이나 기능이 궁금해요.",
    answer:
      "문의할 앱을 선택하고 궁금한 화면이나 기능 이름을 구체적으로 작성해주세요. 어떤 작업을 하려는지와 현재 막힌 단계까지 함께 설명하면 더 정확하게 안내할 수 있습니다. 가능하면 해당 화면의 스크린샷도 함께 보내주세요.",
  },
  {
    question: "새로운 기능을 제안하고 싶어요.",
    answer:
      "contact@samestudio.kr로 앱 이름과 원하는 기능, 해당 기능이 필요한 이유를 보내주세요. 모든 제안은 검토하지만 개발 일정이나 앱 방향에 따라 바로 반영되지 않을 수 있습니다. 비슷한 기능이 이미 계획되어 있는 경우에도 별도의 출시 일정을 확정해서 안내하기는 어렵습니다.",
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

  const openEmailSupport = (event: ReactMouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    window.location.href = emailHref;
  };

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
        <a
          className="support-email-cta"
          href={emailHref}
          aria-label="이메일로 고객지원 문의하기"
          onClick={openEmailSupport}
        >
          <span>EMAIL SUPPORT</span>
          <span aria-hidden="true">→</span>
        </a>
        <a
          className="support-email-address"
          href={emailHref}
          aria-label="contact@samestudio.kr로 고객지원 문의하기"
          onClick={openEmailSupport}
        >
          contact@samestudio.kr
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
