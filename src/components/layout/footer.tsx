import { SCHOOL_NAME } from '@/lib/config';
import Link from 'next/link';
import React from 'react';
import { Crest } from '../ui/logo';

const quickLinks = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about' },
  { label: 'Academics', href: '/academics' },
  { label: 'Admission', href: '/admission' },
  { label: 'Notice Board', href: '/notices' },
  { label: 'Gallery', href: '/gallery' },
];

const importantLinks = [
  { label: 'Contact Us', href: '/contact' },
  { label: 'Frequently Asked Questions', href: '/faq' },
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Terms of Use', href: '/terms-of-use' },
];

const Footer = () => {
  return (
    <footer className="border-t border-border bg-muted/20">
      <div className="mx-auto max-w-6xl px-5">

        {/* Main Footer */}
        <div className="grid grid-cols-1 gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">

          {/* School Information */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <Crest className="size-9 shrink-0" />
              <span className="text-lg font-bold text-fg">
                {SCHOOL_NAME}
              </span>
            </Link>

            <p className="text-sm leading-7 text-muted">
              Welcome to {SCHOOL_NAME}. We are committed to providing
              quality education, building strong values, and helping
              students achieve their full potential.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-5 text-base font-semibold text-fg">
              Quick Links
            </h3>

            <ul className="space-y-3">
              {quickLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted transition-colors hover:text-fg"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Important Links */}
          <div>
            <h3 className="mb-5 text-base font-semibold text-fg">
              Important Links
            </h3>

            <ul className="space-y-3">
              {importantLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted transition-colors hover:text-fg"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="mb-5 text-base font-semibold text-fg">
              Contact & Support
            </h3>

            <ul className="space-y-4 text-sm text-muted">
              <li>
                <span className="mb-1 block font-medium text-fg">
                  Address
                </span>
                Visit our Contact Us page for school location details.
              </li>

              <li>
                <span className="mb-1 block font-medium text-fg">
                  Email
                </span>
                <Link
                  href="/contact"
                  className="hover:text-fg"
                >
                  Contact School Administration
                </Link>
              </li>

              <li>
                <span className="mb-1 block font-medium text-fg">
                  Office Hours
                </span>
                Please check the Contact Us page.
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Footer */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-border py-6 text-sm text-muted sm:flex-row">

          <p className="text-center">
            © {new Date().getFullYear()} {SCHOOL_NAME}. All rights reserved.
          </p>

          <div className="flex items-center gap-5">
            <Link
              href="/privacy-policy"
              className="hover:text-fg"
            >
              Privacy
            </Link>

            <Link
              href="/terms-of-use"
              className="hover:text-fg"
            >
              Terms
            </Link>

            <Link
              href="/login"
              className="font-medium text-fg hover:opacity-70"
            >
              Sign In
            </Link>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;