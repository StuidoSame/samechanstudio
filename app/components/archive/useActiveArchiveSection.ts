import { useEffect, useState } from "react";

export function useActiveArchiveSection(
  sectionSelector: string,
  initialSection: string,
) {
  const [activeSection, setActiveSection] = useState(initialSection);

  useEffect(() => {
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>(sectionSelector),
    ).reverse();
    const fragment = window.location.hash;
    // The router can leave a reloaded fragment at the top of the page.
    if (fragment && window.scrollY === 0) {
      sections.find((section) => fragment === `#${section.id}`)
        ?.scrollIntoView({ block: "start", behavior: "instant" });
    }

    let scrollFrame = 0;

    const updateActiveSection = () => {
      if (scrollFrame) return;
      scrollFrame = window.requestAnimationFrame(() => {
        scrollFrame = 0;
        const activationLine = Math.max(124, window.innerHeight * 0.24);
        const currentSection = sections.find(
          (section) => section.getBoundingClientRect().top <= activationLine,
        );
        if (currentSection) setActiveSection(currentSection.id);
      });
    };

    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);
    return () => {
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
      if (scrollFrame) window.cancelAnimationFrame(scrollFrame);
    };
  }, [sectionSelector]);

  return [activeSection, setActiveSection] as const;
}
