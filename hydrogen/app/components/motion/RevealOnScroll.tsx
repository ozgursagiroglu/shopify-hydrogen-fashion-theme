'use client';

import {motion} from 'framer-motion';
import type {ReactNode} from 'react';

const directionOffsets = {
  up: {y: 40},
  down: {y: -40},
  left: {x: -40},
  right: {x: 40},
} as const;

interface RevealOnScrollProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: keyof typeof directionOffsets;
  duration?: number;
}

export function RevealOnScroll({
  children,
  className,
  delay = 0,
  direction = 'up',
  duration = 0.6,
}: RevealOnScrollProps) {
  const offset = directionOffsets[direction];

  return (
    <motion.div
      className={className}
      initial={{opacity: 0, ...offset}}
      whileInView={{opacity: 1, x: 0, y: 0}}
      viewport={{once: true, margin: '-80px'}}
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
