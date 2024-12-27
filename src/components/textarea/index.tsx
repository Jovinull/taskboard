import { TextareaHTMLAttributes } from "react";
import styles from "./styles.module.css";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

export function Textarea({ className, ...rest }: TextareaProps) {
    return (
        <textarea
            className={`${styles.textarea} ${className || ""}`.trim()}
            {...rest}
        ></textarea>
    );
}
