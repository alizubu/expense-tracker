import { Variants } from "framer-motion";

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.38, ease: [0.22,1,0.36,1] as [number, number, number, number] } }
};

export const fadeLeft: Variants = {
  hidden: { opacity: 0, x: -10 },
  show:   { opacity: 1, x: 0,  transition: { duration: 0.35, ease: [0.22,1,0.36,1] as [number, number, number, number] } }
};

export const staggerContainer = (staggerChildren: number = 0.05): Variants => ({
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren
    }
  }
});

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  show:   { opacity: 1, scale: 1, transition: { duration: 0.35, ease: [0.22,1,0.36,1] as [number, number, number, number] } }
};

export const progressBar = (targetWidth: string) => ({
  initial:  { width: '0%' },
  animate:  { width: targetWidth },
  transition: { duration: 0.7, ease: [0.22,1,0.36,1] }
});
