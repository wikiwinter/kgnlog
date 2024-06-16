import { Variants } from 'framer-motion'

export const shakeAnimation: Variants = {
    initial: { x: 0 },
    shake: {
        x: [-5, 5, -5, 5, 0],
        transition: { stiffness: 1000, damping: 5, repeat: 1, duration: 0.15 },
    },
}
