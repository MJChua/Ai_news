"use client";

import { Children, type ReactNode, useId } from "react";

type MobileShowMoreProps = {
  as?: "div" | "ol";
  buttonLabel?: string;
  children: ReactNode;
  className: string;
  limit: 1 | 2 | 3;
};

export default function MobileShowMore({
  as: Component = "div",
  buttonLabel = "顯示更多",
  children,
  className,
  limit,
}: MobileShowMoreProps) {
  const toggleId = useId();
  const items = Children.toArray(children);
  const canExpand = items.length > limit;
  const limitClassName = [
    className,
    "mobile-limit",
    `mobile-limit--limit-${limit}`,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      {canExpand ? (
        <input
          aria-label={buttonLabel}
          className="mobile-limit__toggle"
          id={toggleId}
          type="checkbox"
        />
      ) : null}
      <Component className={limitClassName}>{items}</Component>
      {canExpand ? (
        <label
          className="mobile-limit__button"
          htmlFor={toggleId}
        >
          {buttonLabel}
        </label>
      ) : null}
    </>
  );
}
