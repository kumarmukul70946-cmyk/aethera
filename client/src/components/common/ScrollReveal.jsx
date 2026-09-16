import React, { useRef, useEffect, useState } from "react";

/**
 * ScrollReveal Component
 * Reveals content as it enters viewport:
 * - opacity: 0 -> 1
 * - transform: translateY(30px) -> translateY(0)
 * - Duration: 700ms
 * - Easing: cubic-bezier(0.22, 1, 0.36, 1)
 * Supports sequential child delays without altering existing layout.
 */
export default function ScrollReveal({
  children,
  delay = 0,
  className = "",
  as = "div",
  threshold = 0.1,
  rootMargin = "0px 0px -40px 0px",
  style = {},
  ...props
}) {
  const elementRef = useRef(null);
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return true;
    }
    return false;
  });

  useEffect(() => {
    if (isVisible) return;
    if (typeof window === "undefined") return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    const el = elementRef.current;
    if (el) {
      observer.observe(el);
    }

    return () => {
      if (el) observer.unobserve(el);
    };
  }, [isVisible, threshold, rootMargin]);

  const Component = as;

  return (
    <Component
      ref={elementRef}
      className={className}
      style={{
        ...style,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(30px)",
        transition: `opacity 700ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, transform 700ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
        willChange: isVisible ? "auto" : "opacity, transform"
      }}
      {...props}
    >
      {children}
    </Component>
  );
}
