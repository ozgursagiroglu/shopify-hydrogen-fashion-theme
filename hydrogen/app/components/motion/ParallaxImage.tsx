'use client';

import {motion, useScroll, useTransform} from 'framer-motion';
import {useRef} from 'react';
import {clsx} from 'clsx';

interface ParallaxImageProps {
  src: string;
  alt: string;
  className?: string;
  speed?: number;
}

export function ParallaxImage({
  src,
  alt,
  className,
  speed = 0.3,
}: ParallaxImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const {scrollYProgress} = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    [`-${speed * 100}%`, `${speed * 100}%`],
  );

  return (
    <div ref={ref} className={clsx('overflow-hidden', className)}>
      <motion.img
        src={src}
        alt={alt}
        style={{y}}
        className="w-full h-full object-cover scale-[1.15]"
        loading="lazy"
      />
    </div>
  );
}
