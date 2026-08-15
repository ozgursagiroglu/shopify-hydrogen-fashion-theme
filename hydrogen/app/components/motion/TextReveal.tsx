'use client';

import {motion} from 'framer-motion';
import {clsx} from 'clsx';

interface TextRevealProps {
  text: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span';
  className?: string;
  delay?: number;
}

export function TextReveal({
  text,
  as: Tag = 'h2',
  className,
  delay = 0,
}: TextRevealProps) {
  return (
    <Tag className={clsx('overflow-hidden', className)}>
      <motion.span
        className="block"
        initial={{y: '100%'}}
        whileInView={{y: 0}}
        viewport={{once: true}}
        transition={{
          duration: 0.8,
          delay,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {text}
      </motion.span>
    </Tag>
  );
}
