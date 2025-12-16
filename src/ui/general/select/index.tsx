"use client";

import * as React from "react";
import "./style.scss";
import { ChevronDown, Check } from "lucide-react";

export type SelectSize = "sm" | "md" | "lg";
export type SelectVariant = "outline" | "filled" | "ghost";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  id?: string;
  label?: string;
  placeholder?: string;
  options: SelectOption[];
  value?: string | null;
  onChange?: (value: string | null, option?: SelectOption | null) => void;
  defaultValue?: string | null;
  disabled?: boolean;
  size?: SelectSize;
  variant?: SelectVariant;
  fullWidth?: boolean;
  className?: string;
}

export const Select = ({
                         id,
                         label,
                         placeholder = "Select…",
                         options,
                         value,
                         onChange,
                         defaultValue = null,
                         disabled,
                         size = "md",
                         variant = "outline",
                         fullWidth,
                         className,
                       }: SelectProps) => {
  const internalId = React.useId();
  const selectId = id ?? internalId;

  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = React.useState<string | null>(defaultValue);
  const currentValue = isControlled ? value ?? null : internalValue;

  const [isOpen, setIsOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(-1);

  const wrapperRef = React.useRef<HTMLDivElement>(null);

  const currentOption = React.useMemo(
      () => options.find((o) => o.value === currentValue) ?? null,
      [options, currentValue]
  );

  const setValue = React.useCallback(
      (next: string | null) => {
        const option = options.find((o) => o.value === next) ?? null;
        if (!isControlled) setInternalValue(next);
        onChange?.(next, option);
      },
      [isControlled, onChange, options]
  );

  React.useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const moveActive = (dir: 1 | -1) => {
    if (!isOpen) {
      setIsOpen(true);
      return;
    }
    let i = activeIndex;
    const len = options.length;
    for (let step = 0; step < len; step++) {
      i = (i + dir + len) % len;
      if (!options[i].disabled) {
        setActiveIndex(i);
        break;
      }
    }
  };

  const commitActive = () => {
    if (activeIndex < 0 || activeIndex >= options.length) return;
    const opt = options[activeIndex];
    if (!opt.disabled) {
      setValue(opt.value);
      setIsOpen(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;

    switch (e.key) {
      case " ":
      case "Enter":
        e.preventDefault();
        if (!isOpen) setIsOpen(true);
        else commitActive();
        break;
      case "ArrowDown":
        e.preventDefault();
        moveActive(1);
        break;
      case "ArrowUp":
        e.preventDefault();
        moveActive(-1);
        break;
      case "Home":
        e.preventDefault();
        setIsOpen(true);
        setActiveIndex(options.findIndex((o) => !o.disabled));
        break;
      case "End":
        e.preventDefault();
        setIsOpen(true);
        for (let i = options.length - 1; i >= 0; i--) {
          if (!options[i].disabled) {
            setActiveIndex(i);
            break;
          }
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        break;
    }
  };

  React.useEffect(() => {
    if (!isOpen) return;
    const idx = options.findIndex((o) => o.value === currentValue && !o.disabled);
    setActiveIndex(idx >= 0 ? idx : Math.max(0, options.findIndex((o) => !o.disabled)));
  }, [isOpen, options, currentValue]);

  const rootClassName = ["select", className ?? ""].filter(Boolean).join(" ");
  const controlClassName = [
    "select_control",
    `select_control_variant_${variant}`,
    `select_control_size_${size}`,
    isOpen && "is_open",
    disabled && "is_disabled",
  ]
      .filter(Boolean)
      .join(" ");

  return (
      <div
          ref={wrapperRef}
          className={rootClassName}
          style={fullWidth ? { width: "100%" } : undefined}
      >
        {label ? (
            <label htmlFor={selectId} className="select_label">
              {label}
            </label>
        ) : null}

        <button
            id={selectId}
            type="button"
            className={controlClassName}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            aria-controls={`${selectId}_listbox`}
            onClick={() => !disabled && setIsOpen((o) => !o)}
            onKeyDown={onKeyDown}
            disabled={disabled}
        >
        <span className={currentOption ? "select_value" : "select_placeholder"}>
          {currentOption ? currentOption.label : placeholder}
        </span>
          <span className="select_icon" aria-hidden="true">
          <ChevronDown size={16} />
        </span>
        </button>

        {isOpen ? (
            <ul
                id={`${selectId}_listbox`}
                role="listbox"
                className="select_list"
            >
              {options.map((opt, i) => {
                const selected = currentValue === opt.value;
                const active = i === activeIndex;

                const optionClassName = [
                  "select_option",
                  selected && "is_selected",
                  active && "is_active",
                  opt.disabled && "is_disabled",
                ]
                    .filter(Boolean)
                    .join(" ");

                return (
                    <li
                        key={opt.value}
                        role="option"
                        aria-selected={selected}
                        className={optionClassName}
                        onMouseEnter={() => !opt.disabled && setActiveIndex(i)}
                        onClick={() => {
                          if (opt.disabled) return;
                          setValue(opt.value);
                          setIsOpen(false);
                        }}
                    >
                      <span>{opt.label}</span>
                      {selected ? <Check size={16} aria-hidden="true" /> : null}
                    </li>
                );
              })}
            </ul>
        ) : null}
      </div>
  );
};