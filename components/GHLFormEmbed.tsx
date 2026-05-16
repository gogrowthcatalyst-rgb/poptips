'use client';

import { useEffect } from 'react';
import Script from 'next/script';
import { track } from '@/lib/analytics';

interface GHLFormEmbedProps {
  /** GHL form ID — the unique string from the embed snippet */
  formId: string;
  /** Display name for accessibility / analytics */
  formName: string;
  /** Which side of the marketplace this form is for (drives signup_form_viewed event) */
  role: 'tipper' | 'recipient';
  /** Initial iframe height; the form_embed.js script auto-resizes after load */
  height?: number;
}

/**
 * GHL inline form embed. Renders the standard GHL iframe pattern and loads
 * the postMessage-based auto-resize script.
 *
 * Flow as of Session 3 skeleton:
 *  1. User submits form → GHL creates contact in your CRM
 *  2. GHL shows its own "thanks" message inside the iframe (default)
 *  3. (Session 3+) GHL form's "redirect on submit" URL points to our app
 *     with `?gid={{contact.id}}` so we can pick up the handoff and run
 *     the recipient's profile-completion step.
 *
 * `signup_completed` analytics event fires later via the webhook handler
 * since cross-origin iframes can't call our `track()` directly.
 */
export function GHLFormEmbed({ formId, formName, role, height = 623 }: GHLFormEmbedProps) {
  useEffect(() => {
    track('signup_form_viewed', { role });
  }, [role]);

  return (
    <>
      <iframe
        src={`https://api.leadconnectorhq.com/widget/form/${formId}`}
        id={`inline-${formId}`}
        title={formName}
        style={{ width: '100%', minHeight: `${height}px`, border: 'none', display: 'block' }}
        data-layout='{"id":"INLINE"}'
        data-trigger-type="alwaysShow"
        data-trigger-value=""
        data-activation-type="alwaysActivated"
        data-activation-value=""
        data-deactivation-type="neverDeactivate"
        data-deactivation-value=""
        data-form-name={formName}
        data-height={String(height)}
        data-layout-iframe-id={`inline-${formId}`}
        data-form-id={formId}
      />
      <Script
        src="https://link.msgsndr.com/js/form_embed.js"
        strategy="afterInteractive"
      />
    </>
  );
}
