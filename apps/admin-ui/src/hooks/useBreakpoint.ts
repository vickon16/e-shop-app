import { useEffect, useState } from 'react';

type Breakpoint = {
  isSmallMobile: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;
};

const breakpoints = {
  smallMobile: '(max-width: 479px)',
  mobile: '(max-width: 767px)',
  tablet: '(min-width: 768px) and (max-width: 1024px)',
  desktop: '(min-width: 1025px)',
  largeDesktop: '(min-width: 1440px)',
};

function useBreakpoint(): Breakpoint {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>({
    isSmallMobile: false,
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isLargeDesktop: false,
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      console.error('matchMedia is not supported');
      return;
    }

    const controller = new AbortController();

    try {
      const smallMobileQuery = window.matchMedia(breakpoints.smallMobile);
      const mobileQuery = window.matchMedia(breakpoints.mobile);
      const tabletQuery = window.matchMedia(breakpoints.tablet);
      const desktopQuery = window.matchMedia(breakpoints.desktop);
      const largeDesktopQuery = window.matchMedia(breakpoints.largeDesktop);

      const updateBreakpoint = () => {
        setBreakpoint({
          isSmallMobile: smallMobileQuery.matches,
          isMobile: mobileQuery.matches,
          isTablet: tabletQuery.matches,
          isDesktop: desktopQuery.matches,
          isLargeDesktop: largeDesktopQuery.matches,
        });
      };

      updateBreakpoint();

      const queries = [
        smallMobileQuery,
        mobileQuery,
        tabletQuery,
        desktopQuery,
        largeDesktopQuery,
      ];
      queries.forEach((query) => {
        query.addEventListener('change', updateBreakpoint, {
          signal: controller.signal,
        });
      });

      return () => {
        controller.abort();
        queries.forEach((query) => {
          query.removeEventListener('change', updateBreakpoint);
        });
      };
    } catch (error) {
      console.error('Error setting up media queries:', error);
    }
  }, []);

  return breakpoint;
}

export default useBreakpoint;
