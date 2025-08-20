'use client';

import Link from "next/link";
import styles from "./not_found/not-found.module.css";

export default function NotFound() {
  return (
    <div className={styles.container}>
      <div className={styles.errorWindow}>
        <div className={styles.content}>
          <h1 className={styles.errorCode}>404</h1>
          <h2 className={styles.errorTitle}>Страница не найдена</h2>
          
          <div className={styles.messageContainer}>
            <p className={styles.message}>
              Извините, запрашиваемая страница не существует или была перемещена.
            </p>
            
            <div className={styles.buttonContainer}>
              <Link href="/" className={styles.button}>
                Вернуться на главную
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 