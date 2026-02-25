export function $<T extends keyof HTMLElementTagNameMap>(
  name: T,
  {
    style,
    events,
    className,
    innerHTML,
  }: {
    className?: string[];
    style?: Partial<CSSStyleDeclaration>;
    events?: Record<string, (e: any) => void>;
    innerHTML?: string;
  } = {},
  children: HTMLElement[] = [],
): HTMLElementTagNameMap[T] {
  const element = document.createElement(name);
  if (style) {
    Object.keys(style).forEach((key) => {
      if (!style[key as keyof CSSStyleDeclaration]) return;
      element.style.setProperty(
        key,
        style[key as keyof CSSStyleDeclaration] as string,
      );
    });
  }
  if (events) {
    Object.keys(events).forEach((key) => {
      element.addEventListener(key, events[key]);
    });
  }
  children?.forEach((item) => element.appendChild(item));
  className?.forEach((name) => element.classList.add(name));
  if (innerHTML) element.innerHTML = innerHTML;
  return element;
}
