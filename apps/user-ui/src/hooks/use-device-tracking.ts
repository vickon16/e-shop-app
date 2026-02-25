'use client';

import { useEffect, useState } from 'react';
import { UAParser } from 'ua-parser-js';

export type TDeviceInfo = {
  deviceString: string;
  browser?: string;
  browserVersion?: string;
  os?: string;
  osVersion?: string;
  deviceType?: string;
  deviceVendor?: string;
  deviceModel?: string;
  cpuArchitecture?: string;
  userAgent?: string;
  language?: string;
  touchSupport?: boolean;
};

export const useDeviceInfo = () => {
  const [deviceInfo, setDeviceInfo] = useState<TDeviceInfo | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const parser = new UAParser();
    const result = parser.getResult();

    const deviceString = [
      result.device.type || 'desktop',
      result.os.name || 'unknown-os-name',
      result.os.version || 'unknown-os-version',
      result.browser.name || 'unknown-browser-name',
      result.browser.version || 'unknown-browser-version',
    ].join(' - ');

    const info: TDeviceInfo = {
      deviceString,
      browser: result.browser.name,
      browserVersion: result.browser.version,
      os: result.os.name,
      osVersion: result.os.version,
      deviceType: result.device.type || 'desktop',
      deviceVendor: result.device.vendor,
      deviceModel: result.device.model,
      cpuArchitecture: result.cpu.architecture,
      userAgent: navigator.userAgent,
      language: navigator.language,
      touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    };

    setDeviceInfo(info);
  }, []);

  return { deviceInfo };
};
