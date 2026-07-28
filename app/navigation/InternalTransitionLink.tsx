"use client";

import Link from "next/link";
import type { ComponentProps, MouseEvent as ReactMouseEvent } from "react";
import { usePageTransition } from "./PageTransitionProvider";

type InternalTransitionLinkProps = Omit<
  ComponentProps<typeof Link>,
  "href" | "onClick"
> & {
  href: string;
  onClick?: (event: ReactMouseEvent<HTMLAnchorElement>) => void;
  onTransitionStart?: () => void;
};

export function InternalTransitionLink({
  href,
  onClick,
  onTransitionStart,
  ...props
}: InternalTransitionLinkProps) {
  const { navigateWithTransition } = usePageTransition();

  return (
    <Link
      {...props}
      href={href}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        if (navigateWithTransition(event, href)) onTransitionStart?.();
      }}
    />
  );
}
