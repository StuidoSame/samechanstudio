"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CosmicInteractionLayer } from "../components/CosmicInteractionLayer";
import { SectionCosmos } from "../components/SectionCosmos";
import { usePageTransition } from "../navigation/PageTransitionProvider";

const SUMMARY_ITEMS = [
  {
    label: "SERVICE",
    title: "서비스 이용",
    text: "SAME STUDIO의 작은 앱들을 안전하고 올바른 방식으로 이용하기 위한 기본 원칙입니다.",
  },
  {
    label: "YOUR CONTENT",
    title: "사용자의 콘텐츠",
    text: "앱에 기록하거나 저장한 콘텐츠의 권리와 책임은 사용자에게 있습니다.",
  },
  {
    label: "SAFETY",
    title: "안전과 보호",
    text: "개인정보와 서비스의 안정성을 지키기 위해 필요한 범위에서 보호 조치를 적용합니다.",
  },
] as const;

const TERMS_SECTIONS = [
  {
    id: "using-service",
    number: "01",
    eyebrow: "USING THE SERVICE",
    title: "서비스 이용",
    paragraphs: [
      "SAME STUDIO가 제공하는 앱과 서비스는 개인적이고 적법한 목적 안에서 이용할 수 있습니다. 사용자는 각 앱에서 안내하는 기능과 이용 방법을 존중해야 합니다.",
      "서비스의 정상적인 운영을 방해하거나 다른 사용자의 권리를 침해하는 행위, 관련 법령에 위반되는 방식의 이용은 허용되지 않습니다. 앱의 기능이나 보안을 부당하게 우회하거나 악용해서도 안 됩니다.",
    ],
  },
  {
    id: "account",
    number: "02",
    eyebrow: "ACCOUNT",
    title: "계정",
    paragraphs: [
      "일부 앱은 스토어 계정, 기기 계정 또는 앱 안에서 생성한 계정을 이용할 수 있습니다. 사용자는 정확한 정보를 제공하고 자신의 계정과 인증 정보를 안전하게 관리해야 합니다.",
      "계정의 분실이나 무단 사용이 의심되는 경우 즉시 관련 플랫폼의 보호 절차를 이용하고 SAME STUDIO에 알려주세요. 계정 기능과 지원 범위는 앱에 따라 다를 수 있습니다.",
    ],
  },
  {
    id: "content",
    number: "03",
    eyebrow: "CONTENT",
    title: "콘텐츠",
    paragraphs: [
      "사용자가 앱에서 작성하거나 저장한 사진, 기록, 텍스트 등 콘텐츠에 대한 권리는 사용자에게 유지됩니다. 사용자는 자신이 저장하는 콘텐츠를 적법하게 사용할 권한이 있어야 합니다.",
      "SAME STUDIO는 기능 제공에 필요한 범위에서만 콘텐츠를 처리합니다. 타인의 권리나 개인정보를 침해하는 콘텐츠를 입력하거나 공유해서는 안 되며, 콘텐츠의 보관과 백업 책임은 각 앱의 안내를 따릅니다.",
    ],
  },
  {
    id: "payments",
    number: "04",
    eyebrow: "PAYMENTS",
    title: "결제",
    paragraphs: [
      "유료 기능, 구독 또는 앱 내 구매는 Apple App Store나 Google Play 등 해당 스토어의 결제 정책과 이용 조건에 따라 처리됩니다. 표시되는 가격과 결제 통화는 스토어 또는 지역 설정에 따라 달라질 수 있습니다.",
      "구매 복원은 결제에 사용한 동일한 스토어 계정으로 진행해야 합니다. 환불, 결제 취소와 구독 관리는 각 스토어가 제공하는 절차를 따르며, 중복 결제 전에 구매 내역을 먼저 확인해주세요.",
    ],
  },
  {
    id: "privacy",
    number: "05",
    eyebrow: "PRIVACY",
    title: "개인정보",
    paragraphs: [
      "개인정보는 SAME STUDIO의 개인정보처리방침과 각 앱 안의 안내에 따라 처리됩니다. 앱 권한은 사진 저장, 알림 등 사용자가 선택한 기능을 제공하는 데 필요한 범위에서 요청합니다.",
      "사용자는 기기 설정에서 권한을 언제든 변경할 수 있지만, 필수 권한을 제한하면 일부 기능이 정상적으로 동작하지 않을 수 있습니다. 개인정보 관련 문의와 삭제 요청은 지원 이메일로 접수할 수 있습니다.",
    ],
  },
  {
    id: "liability",
    number: "06",
    eyebrow: "LIABILITY",
    title: "책임",
    paragraphs: [
      "SAME STUDIO는 서비스를 안정적으로 제공하기 위해 노력합니다. 다만 유지보수, 네트워크 장애, 스토어 또는 운영체제 변경과 같이 합리적으로 통제하기 어려운 사유로 서비스가 일시 중단될 수 있습니다.",
      "사용자의 설정이나 오용, 외부 서비스의 문제로 발생한 손해에 대해서는 관련 법령이 허용하는 범위에서 책임이 제한될 수 있습니다. 소비자에게 반드시 적용되는 법적 권리는 이 약관보다 우선합니다.",
    ],
  },
  {
    id: "contact",
    number: "07",
    eyebrow: "CONTACT",
    title: "문의",
    paragraphs: [
      "약관이나 앱 이용에 관한 문의는 contact@samestudio.kr로 보내주세요. 앱 이름, 사용 기기, 운영체제 버전과 문의 내용을 함께 알려주시면 확인에 도움이 됩니다.",
      "약관이 변경되는 경우 사이트 또는 앱에서 적용 시점과 주요 내용을 안내합니다. 변경된 약관은 별도로 정한 시행일부터 적용됩니다.",
    ],
  },
] as const;

const COSMOS_VARIANTS = [
  "about",
  "phone",
  "tablet",
  "watch",
  "contact",
  "phone",
  "about",
] as const;

function ArchiveQuote({ eyebrow, children }: { eyebrow: string; children: string }) {
  return (
    <blockquote className="terms-quote">
      <span>{eyebrow}</span>
      <p>{children}</p>
    </blockquote>
  );
}

export function TermsArchive() {
  const { navigateWithTransition } = usePageTransition();
  const [activeSection, setActiveSection] = useState<string>(
    TERMS_SECTIONS[0].id,
  );
  const [revealedSections, setRevealedSections] = useState<Set<string>>(
    () => new Set(),
  );
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => setReducedMotion(mediaQuery.matches);
    updateMotionPreference();
    mediaQuery.addEventListener("change", updateMotionPreference);
    return () => mediaQuery.removeEventListener("change", updateMotionPreference);
  }, []);

  useEffect(() => {
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("[data-terms-section]"),
    );
    const revealObserver = new IntersectionObserver(
      (entries) => {
        const newlyVisible = entries
          .filter((entry) => entry.isIntersecting)
          .map((entry) => entry.target.id);
        if (!newlyVisible.length) return;
        setRevealedSections((current) => {
          const next = new Set(current);
          newlyVisible.forEach((id) => next.add(id));
          return next;
        });
      },
      { rootMargin: "0px 0px -12%", threshold: 0.16 },
    );

    const navigationObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveSection(visible[0].target.id);
      },
      { rootMargin: "-24% 0px -62%", threshold: 0 },
    );

    sections.forEach((section) => {
      revealObserver.observe(section);
      navigationObserver.observe(section);
    });

    return () => {
      revealObserver.disconnect();
      navigationObserver.disconnect();
    };
  }, [reducedMotion]);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
      block: "start",
    });
  };

  return (
    <article className="archive-document terms-document" aria-labelledby="terms-title">
      <CosmicInteractionLayer reducedMotion={reducedMotion} />

      <header className="terms-hero">
        <SectionCosmos variant="hero" />
        <div className="terms-hero-content">
          <div className="terms-kicker" aria-label="Legal archive section 02">
            <span>02</span>
            <span>LEGAL ARCHIVE</span>
            <i aria-hidden="true" />
          </div>
          <h1 id="terms-title">TERMS</h1>
          <p className="terms-hero-description">
            SAME STUDIO의 앱과 서비스를 이용하기 전에 알아두어야 할 약속을 정리했습니다.
            작은 기록과 소중한 순간이 안전하게 이어질 수 있도록 아래 내용을 확인해주세요.
          </p>
          <p className="terms-updated">LAST UPDATED · 2026.07.28</p>
        </div>
      </header>

      <section className="terms-summary" aria-label="약관 핵심 요약">
        {SUMMARY_ITEMS.map((item, index) => (
          <article className="terms-summary-card" key={item.label}>
            <span className="terms-summary-index">0{index + 1}</span>
            <p className="terms-summary-label">{item.label}</p>
            <h2>{item.title}</h2>
            <p>{item.text}</p>
          </article>
        ))}
      </section>

      <div className="terms-archive-layout">
        <nav className="terms-contents" aria-label="약관 목차">
          <p>CONTENTS</p>
          <div className="terms-contents-list">
            {TERMS_SECTIONS.map((section) => (
              <button
                type="button"
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                aria-current={activeSection === section.id ? "location" : undefined}
              >
                <span>{section.number}</span>
                {section.title}
              </button>
            ))}
          </div>
        </nav>

        <div className="terms-route" aria-label="이용약관 상세 내용">
          {TERMS_SECTIONS.map((section, index) => {
            const isRevealed = reducedMotion || revealedSections.has(section.id);
            return (
              <div className="terms-route-unit" key={section.id}>
                <section
                  id={section.id}
                  className={`terms-section${isRevealed ? " is-revealed" : ""}`}
                  data-terms-section=""
                  aria-labelledby={`${section.id}-title`}
                >
                  <span className="terms-route-node" aria-hidden="true" />
                  <div className="terms-card">
                    <SectionCosmos variant={COSMOS_VARIANTS[index]} />
                    <div className="terms-card-content">
                      <div className="terms-card-heading">
                        <span>{section.number}</span>
                        <p>{section.eyebrow}</p>
                        <i aria-hidden="true" />
                      </div>
                      <h2 id={`${section.id}-title`}>{section.title}</h2>
                      <div className="terms-copy">
                        {section.paragraphs.map((paragraph) => (
                          <p key={paragraph}>{paragraph}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                {index < TERMS_SECTIONS.length - 1 ? (
                  <svg
                    className={`terms-connector${isRevealed ? " is-drawn" : ""}`}
                    viewBox="0 0 220 150"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <path
                      pathLength="1"
                      d={index % 2 === 0 ? "M18 0 C18 75 202 72 202 150" : "M202 0 C202 78 18 72 18 150"}
                    />
                  </svg>
                ) : null}

                {index === 1 ? (
                  <ArchiveQuote eyebrow="USING SAME STUDIO">
                    Small apps, made with a lot of care.
                  </ArchiveQuote>
                ) : null}
                {index === 4 ? (
                  <ArchiveQuote eyebrow="YOUR MOMENTS">
                    Every record begins with a small moment.
                  </ArchiveQuote>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      <Link
        className="archive-back terms-back"
        href="/"
        onClick={(event) => navigateWithTransition(event, "/")}
      >
        BACK
      </Link>
    </article>
  );
}
