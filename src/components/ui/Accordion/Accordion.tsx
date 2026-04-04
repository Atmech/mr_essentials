'use client';

import React, { useState } from 'react';
import styles from './Accordion.module.css';

interface AccordionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export const Accordion: React.FC<AccordionProps> = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={styles.accordion}>
      <button 
        className={styles.header} 
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <h3 className={styles.title}>{title}</h3>
        <span className={styles.icon}>{isOpen ? '—' : '+'}</span>
      </button>
      <div 
        className={`${styles.contentWrapper} ${isOpen ? styles.open : ''}`}
      >
        <div className={styles.content}>
          {children}
        </div>
      </div>
    </div>
  );
};
