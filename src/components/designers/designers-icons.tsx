type IconProps = { className?: string };

/** Редактировать (Element.svg) */
export function IconDesignerEdit({ className }: IconProps) {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        d="M4 20H8L18.5 9.5L14.5 5.5L4 16V20Z"
        stroke="white"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.5 6.5L17.5 10.5"
        stroke="white"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Удалить (Element-1.svg) */
export function IconDesignerDelete({ className }: IconProps) {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        d="M4 7H20"
        stroke="white"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <path
        d="M9 7V5C9 4.44772 9.44772 4 10 4H14C14.5523 4 15 4.44772 15 5V7"
        stroke="white"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <path
        d="M7 7L8 18C8.1 19.1 9 20 10.1 20H13.9C15 20 15.9 19.1 16 18L17 7"
        stroke="white"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Опросник (Dashboard.svg) */
export function IconQuestionnaireNav({ className }: IconProps) {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <rect x="1.33331" y="1.33331" width="5.33333" height="5.33333" rx="1" fill="currentColor" />
      <rect x="9.33331" y="1.33331" width="5.33333" height="5.33333" rx="1" fill="currentColor" />
      <rect x="1.33331" y="9.33331" width="5.33333" height="5.33333" rx="1" fill="currentColor" />
      <rect x="9.33331" y="9.33331" width="5.33333" height="5.33333" rx="1" fill="currentColor" />
    </svg>
  );
}

/** Стрелка дропдауна (Arrows.svg) */
export function IconSelectArrow({ className }: IconProps) {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        d="M4 6L8 10L12 6"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Плюс для «Добавить дизайнера» */
export function IconDesignerAdd({ className }: IconProps) {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        d="M12 5V19M5 12H19"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
      />
    </svg>
  );
}
