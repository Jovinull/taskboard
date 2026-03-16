import { TextareaHTMLAttributes } from "react";
import styles from "./styles.module.css";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className, ...rest }: TextareaProps) {
  return (
    <textarea
      className={`${styles.textarea} ${className || ""}`.trim()}
      {...rest}
    />
  );
}
