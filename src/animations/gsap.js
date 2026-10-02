/**
 * Ponto único de registro do GSAP. Importe sempre daqui:
 *   import { gsap, ScrollTrigger, SplitText } from './gsap.js';
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);
gsap.defaults({ ease: 'power3.out' });

export { gsap, ScrollTrigger, SplitText };
