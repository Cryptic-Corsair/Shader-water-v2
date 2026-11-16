import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
  type Ref,
} from 'react';
import {
  Link,
  useLocation,
  useNavigate,
  type LinkProps,
} from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { getUiCopy } from '../data/uiCopy';
import { ScrollTrigger, gsap, prefersReducedMotion } from '../lib/motion';
import { useSmoothScroll } from './SmoothScrollProvider';
import { resolveTransitionLabel } from './home/versesLogic';

interface PageTransitionContextValue {
  navigateWithTransition: (to: string, label?: string) => void;
  isTransitioning: boolean;
}

const PageTransitionContext = createContext<PageTransitionContextValue>({
  navigateWithTransition: () => {},
  isTransitioning: false,
});

export function usePageTransition(): PageTransitionContextValue {
  return useContext(PageTransitionContext);
}

export function PageTransitionProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { lang } = useLanguage();
  const copy = getUiCopy(lang);
  const { scrollToTop } = useSmoothScroll();

  const curtainRef = useRef<HTMLDivElement>(null);
  const hairlineRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);

  const [isTransitioning, setIsTransitioning] = useState(false);
  const [curtainLabel, setCurtainLabel] = useState<string>(
    () => copy.transitionLabels.home
  );

  const programmaticTargetRef = useRef<string | null>(null);
  const activeTimelineRef = useRef<gsap.core.Timeline | null>(null);

  const clearCurtainImmediate = useCallback(() => {
    const curtain = curtainRef.current;
    const hairline = hairlineRef.current;
    const labelEl = labelRef.current;
    activeTimelineRef.current?.kill();
    activeTimelineRef.current = null;
    if (curtain) {
      gsap.set(curtain, {
        autoAlpha: 0,
        yPercent: 100,
        pointerEvents: 'none',
      });
    }
    if (hairline) {
      gsap.set(hairline, { scaleX: 0 });
    }
    if (labelEl) {
      gsap.set(labelEl, { opacity: 0, y: 10 });
    }
    setIsTransitioning(false);
  }, []);

  useEffect(() => {
    const currentFull = `${location.pathname}${location.search}${location.hash}`;
    if (programmaticTargetRef.current === currentFull) {
      programmaticTargetRef.current = null;
      return;
    }
    clearCurtainImmediate();
  }, [location.pathname, location.search, location.hash, clearCurtainImmediate]);

  useEffect(() => {
    return () => {
      activeTimelineRef.current?.kill();
    };
  }, []);

  const navigateWithTransition = useCallback(
    (to: string, customLabel?: string) => {
      const normalizedTarget = to.startsWith('/') ? to : `/${to}`;
      const currentFull = `${location.pathname}${location.search}${location.hash}`;
      if (normalizedTarget === currentFull) {
        scrollToTop(false);
        return;
      }

      if (prefersReducedMotion()) {
        navigate(normalizedTarget);
        return;
      }

      const curtain = curtainRef.current;
      const hairline = hairlineRef.current;
      const labelEl = labelRef.current;

      if (!curtain || !hairline || !labelEl) {
        navigate(normalizedTarget);
        return;
      }

      const targetPathOnly = normalizedTarget.split('?')[0];
      activeTimelineRef.current?.kill();
      setIsTransitioning(true);
      setCurtainLabel(customLabel ?? resolveTransitionLabel(targetPathOnly, lang));
      programmaticTargetRef.current = normalizedTarget;

      const tl = gsap.timeline({
        onComplete: () => {
          gsap.set(curtain, {
            autoAlpha: 0,
            yPercent: 100,
            pointerEvents: 'none',
          });
          setIsTransitioning(false);
          activeTimelineRef.current = null;
          ScrollTrigger.refresh();
        },
      });

      activeTimelineRef.current = tl;

      tl.set(curtain, {
        autoAlpha: 1,
        yPercent: 100,
        pointerEvents: 'auto',
      })
        .set(hairline, { scaleX: 0, transformOrigin: 'left center' })
        .set(labelEl, { opacity: 0, y: 12 })
        .to(curtain, {
          yPercent: 0,
          duration: 0.36,
          ease: 'expo.inOut',
        })
        .to(
          hairline,
          {
            scaleX: 1,
            duration: 0.32,
            ease: 'expo.inOut',
          },
          '-=0.22'
        )
        .to(
          labelEl,
          {
            opacity: 1,
            y: 0,
            duration: 0.24,
            ease: 'power3.out',
          },
          '-=0.18'
        )
        .add(() => {
          navigate(normalizedTarget);
          scrollToTop(true);
        })
        .to({}, { duration: 0.05 })
        .to(labelEl, {
          opacity: 0,
          y: -10,
          duration: 0.2,
          ease: 'power3.out',
        })
        .to(
          curtain,
          {
            yPercent: -100,
            duration: 0.4,
            ease: 'expo.out',
          },
          '-=0.1'
        );
    },
    [location.pathname, location.search, location.hash, navigate, scrollToTop, lang]
  );

  return (
    <PageTransitionContext.Provider
      value={{ navigateWithTransition, isTransitioning }}
    >
      {children}

      {/* Frosted Twilight Mist Transition Veil */}
      <div
        ref={curtainRef}
        aria-hidden="true"
        data-testid="page-transition-curtain"
        style={{
          visibility: 'hidden',
          opacity: 0,
          background:
            'radial-gradient(80% 70% at 50% 45%, rgba(103, 113, 128, 0.88) 0%, rgba(54, 62, 75, 0.92) 100%)',
          backdropFilter: 'blur(26px)',
          WebkitBackdropFilter: 'blur(26px)',
        }}
        className="pointer-events-none fixed inset-0 z-50 flex flex-col items-center justify-center px-6 text-[#F6F4EF]"
      >
        <div className="w-full max-w-md text-center">
          <div
            ref={hairlineRef}
            className="mx-auto mb-6 h-px w-full bg-[#DFBC91]/75"
          />
          <div ref={labelRef} className="space-y-2">
            <p className="font-editorial-serif text-lg text-[#DFBC91]">
              {copy.brand}
            </p>
            <p className="font-editorial-serif text-3xl font-normal text-[#F6F4EF] md:text-4xl">
              {curtainLabel}
            </p>
          </div>
        </div>
      </div>
    </PageTransitionContext.Provider>
  );
}

export interface TransitionLinkProps extends LinkProps {
  transitionLabel?: string;
  ref?: Ref<HTMLAnchorElement>;
}

export function TransitionLink({
  to,
  onClick,
  target,
  transitionLabel,
  ref,
  ...rest
}: TransitionLinkProps) {
  const { navigateWithTransition } = usePageTransition();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) {
      return;
    }

    if (
      target === '_blank' ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0
    ) {
      return;
    }

    if (typeof to === 'string') {
      event.preventDefault();
      navigateWithTransition(to, transitionLabel);
    } else if (to && typeof to === 'object' && typeof to.pathname === 'string') {
      event.preventDefault();
      const fullPath = `${to.pathname}${to.search ?? ''}${to.hash ?? ''}`;
      navigateWithTransition(fullPath, transitionLabel);
    }
  };

  return <Link ref={ref} to={to} target={target} onClick={handleClick} {...rest} />;
}
