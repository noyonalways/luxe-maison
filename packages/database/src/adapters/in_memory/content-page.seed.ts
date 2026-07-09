import type { ContentPage } from '@luxe-maison/core';

const now = new Date().toISOString();

export const defaultContentPages: ContentPage[] = [
  {
    slug: 'privacy',
    title: 'Privacy Policy',
    metaDescription: 'How MAISON collects, uses, and protects your personal information.',
    published: true,
    updatedAt: now,
    body: `Last updated: January 2026

MAISON ("we", "our", or "us") respects your privacy. This policy explains what information we collect when you shop with us, how we use it, and the choices you have.

Information we collect
We collect information you provide directly, such as your name, email address, shipping address, phone number, and payment details when you place an order or create an account. We also collect technical data such as browser type, device information, and pages visited to improve our storefront experience.

How we use your information
We use your information to process orders, provide customer support, send order updates, personalize your experience, prevent fraud, and comply with legal obligations. With your consent, we may send marketing communications about new collections and offers.

Sharing your information
We do not sell your personal information. We share data only with trusted service providers who help us operate our store—such as payment processors, shipping carriers, and email platforms—under strict confidentiality agreements.

Your rights
Depending on your location, you may have the right to access, correct, delete, or restrict the use of your personal data. Contact us at privacy@maison.com to make a request.

Security
We use industry-standard safeguards to protect your information. No method of transmission over the internet is completely secure, but we continuously review our practices to keep your data safe.

Contact
If you have questions about this policy, email privacy@maison.com.`,
  },
  {
    slug: 'terms',
    title: 'Terms of Service',
    metaDescription: 'Terms and conditions for shopping at MAISON.',
    published: true,
    updatedAt: now,
    body: `Last updated: January 2026

Welcome to MAISON. By accessing our website or placing an order, you agree to these Terms of Service.

Use of our website
You may use our site for lawful shopping and browsing purposes. You agree not to misuse the site, attempt unauthorized access, or interfere with its operation.

Orders and pricing
All prices are listed in USD unless otherwise stated. We reserve the right to correct pricing errors and to limit quantities. An order confirmation email does not guarantee acceptance; we may cancel orders affected by stock, pricing, or fraud concerns.

Payment
Payment is due at checkout. We accept the payment methods displayed during checkout. You represent that you are authorized to use the payment method provided.

Shipping and returns
Delivery timelines and return eligibility are described on our Shipping & Returns page. Risk of loss passes to you upon delivery to the carrier unless otherwise required by law.

Intellectual property
All content on this site—including logos, photography, product descriptions, and design—is owned by MAISON or its licensors and may not be copied or reused without permission.

Limitation of liability
To the fullest extent permitted by law, MAISON is not liable for indirect, incidental, or consequential damages arising from your use of the site or products purchased from us.

Changes
We may update these terms from time to time. Continued use of the site after changes are posted constitutes acceptance of the revised terms.

Contact
Questions about these terms may be sent to legal@maison.com.`,
  },
  {
    slug: 'cookies',
    title: 'Cookie Policy',
    metaDescription: 'How MAISON uses cookies and similar technologies.',
    published: true,
    updatedAt: now,
    body: `Last updated: January 2026

This Cookie Policy explains how MAISON uses cookies and similar technologies on our website.

What are cookies?
Cookies are small text files stored on your device when you visit a website. They help the site remember your preferences and understand how visitors use our pages.

How we use cookies
We use cookies to keep you signed in, remember items in your bag, measure site performance, and improve our shopping experience. Some cookies are essential for the site to function; others help us understand usage patterns.

Types of cookies we use
• Essential cookies — required for checkout, account access, and security.
• Preference cookies — remember choices such as region or display settings.
• Analytics cookies — help us understand traffic and improve our collections presentation.

Managing cookies
You can control cookies through your browser settings. Disabling certain cookies may affect site functionality, including checkout and saved preferences.

Updates
We may revise this policy as our site evolves. Material changes will be reflected on this page.

Contact
For cookie-related questions, contact privacy@maison.com.`,
  },
];

export function getDefaultContentPage(slug: ContentPage['slug']): ContentPage {
  const page = defaultContentPages.find((item) => item.slug === slug);
  if (!page) throw new Error(`Unknown content page slug: ${slug}`);
  return structuredClone(page);
}
