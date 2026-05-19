type IconProps = {
  className?: string;
};

export function IconPencil({ className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M4 20h4l10.5-10.5a2.828 2.828 0 1 0-4-4L4 16v4" />
      <path d="m13.5 6.5 4 4" />
    </svg>
  );
}

export function IconTrash({ className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M4 7h16" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12" />
      <path d="M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" />
    </svg>
  );
}

export function IconUsers({ className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

export function IconUsersFilled({ className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden
    >
      <path fill="white" stroke="none" d="M12 7a4 4 0 1 0 8 0 4 4 0 0 0-8 0" />
      <path fill="white" stroke="none" d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
      <path
        fill="white"
        stroke="none"
        d="M16 11.5a3.5 3.5 0 1 0 7 0 3.5 3.5 0 0 0-7 0"
      />
      <path fill="white" stroke="none" d="M19.5 21v-1.5a4 4 0 0 0-3-3.87" />
    </svg>
  );
}

export function IconDesignersNav({ className }: IconProps) {
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
        d="M6.00004 1.33331C4.25337 1.33331 2.83337 2.75331 2.83337 4.49998C2.83337 6.21331 4.17337 7.59998 5.92004 7.65998C5.97337 7.65331 6.02671 7.65331 6.06671 7.65998C6.08004 7.65998 6.08671 7.65998 6.10004 7.65998C6.10671 7.65998 6.10671 7.65998 6.11337 7.65998C7.82004 7.59998 9.16004 6.21331 9.16671 4.49998C9.16671 2.75331 7.74671 1.33331 6.00004 1.33331Z"
        fill="white"
      />
      <path
        d="M9.38664 9.43323C7.52664 8.19323 4.49331 8.19323 2.61997 9.43323C1.77331 9.9999 1.30664 10.7666 1.30664 11.5866C1.30664 12.4066 1.77331 13.1666 2.61331 13.7266C3.54664 14.3532 4.77331 14.6666 5.99997 14.6666C7.22664 14.6666 8.45331 14.3532 9.38664 13.7266C10.2266 13.1599 10.6933 12.3999 10.6933 11.5732C10.6866 10.7532 10.2266 9.99323 9.38664 9.43323Z"
        fill="white"
      />
      <path
        d="M13.3266 4.89338C13.4333 6.18671 12.5133 7.32005 11.24 7.47338C11.2333 7.47338 11.2333 7.47338 11.2266 7.47338H11.2066C11.1666 7.47338 11.1266 7.47338 11.0933 7.48671C10.4466 7.52005 9.85328 7.31338 9.40662 6.93338C10.0933 6.32005 10.4866 5.40005 10.4066 4.40005C10.3599 3.86005 10.1733 3.36671 9.89328 2.94671C10.1466 2.82005 10.44 2.74005 10.74 2.71338C12.0466 2.60005 13.2133 3.57338 13.3266 4.89338Z"
        fill="white"
      />
      <path
        d="M14.66 11.0602C14.6067 11.7069 14.1933 12.2669 13.5 12.6469C12.8333 13.0136 11.9933 13.1869 11.16 13.1669C11.64 12.7336 11.92 12.1936 11.9733 11.6202C12.04 10.7936 11.6467 10.0002 10.86 9.36691C10.4133 9.01358 9.89333 8.73358 9.32666 8.52691C10.8 8.10024 12.6533 8.38691 13.7933 9.30691C14.4067 9.80024 14.72 10.4202 14.66 11.0602Z"
        fill="white"
      />
    </svg>
  );
}

export function IconLogout({ className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" x2="9" y1="12" y2="12" />
    </svg>
  );
}

export function IconPlus({ className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

export function IconChevronDown({ className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={14}
      height={14}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function IconX({ className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
