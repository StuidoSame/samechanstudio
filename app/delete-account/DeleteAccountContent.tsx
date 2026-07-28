"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { CosmicInteractionLayer } from "../components/CosmicInteractionLayer";
import { SectionCosmos } from "../components/SectionCosmos";
import { useI18n } from "../i18n/I18nProvider";
import { InternalTransitionLink } from "../navigation/InternalTransitionLink";
import {
  ACCOUNT_DELETION_APPS,
  DELETE_ACCOUNT_MESSAGES,
} from "./deleteAccountMessages";

type FormErrors = Partial<Record<"app" | "email" | "login" | "consent", true>>;

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
}

function maskEmail(value: string) {
  const [local, domain] = value.split("@");
  if (!local || !domain) return "";
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}${"•".repeat(Math.max(2, Math.min(6, local.length - visible.length)))}@${domain}`;
}

function createReference() {
  return `DEL-${window.crypto.randomUUID().replaceAll("-", "").slice(0, 12).toUpperCase()}`;
}

export function DeleteAccountContent() {
  const { locale } = useI18n();
  const messages = DELETE_ACCOUNT_MESSAGES[locale];
  const [appId, setAppId] = useState("");
  const [email, setEmail] = useState("");
  const [loginMethod, setLoginMethod] = useState("");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [result, setResult] = useState<{ reference: string; email: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState(false);
  const submittingRef = useRef(false);
  const submitTimerRef = useRef<number | null>(null);

  const selectedApp = ACCOUNT_DELETION_APPS.find((app) => app.id === appId);

  useEffect(() => {
    document.title = messages.metadataTitle;
    document
      .querySelector<HTMLMetaElement>('meta[name="description"]')
      ?.setAttribute("content", messages.metadataDescription);
  }, [messages]);

  useEffect(
    () => () => {
      if (submitTimerRef.current !== null) {
        window.clearTimeout(submitTimerRef.current);
      }
    },
    [],
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submittingRef.current) return;

    const nextErrors: FormErrors = {};
    if (!selectedApp?.accountDeletionSupported) nextErrors.app = true;
    if (!isValidEmail(email.trim())) nextErrors.email = true;
    if (!selectedApp?.loginMethods.includes(loginMethod as never)) nextErrors.login = true;
    if (!consent) nextErrors.consent = true;
    setErrors(nextErrors);
    setResult(null);
    setSubmissionError(false);
    if (Object.keys(nextErrors).length > 0 || !selectedApp) return;

    submittingRef.current = true;
    setIsSubmitting(true);
    const reference = createReference();
    const loginName = messages.form.loginNames[loginMethod] ?? loginMethod;
    const subject = `${messages.form.subject} · ${selectedApp.name} · ${reference}`;
    const body = [
      `${messages.form.app}: ${selectedApp.name}`,
      `${messages.form.email}: ${email.trim()}`,
      `${messages.form.login}: ${loginName}`,
      `${messages.form.requestType}: ${messages.form.fullDeletion}`,
      `${messages.form.reference}: ${reference}`,
      "",
      `${messages.form.message}:`,
      message.trim(),
      "",
      messages.form.consent,
    ].join("\n");
    const mailto = `mailto:contact@samestudio.kr?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    try {
      setResult({ reference, email: maskEmail(email.trim()) });
      window.location.assign(mailto);
      submitTimerRef.current = window.setTimeout(() => {
        submittingRef.current = false;
        setIsSubmitting(false);
        submitTimerRef.current = null;
      }, 1000);
    } catch {
      submittingRef.current = false;
      setIsSubmitting(false);
      setSubmissionError(true);
    }
  };

  return (
    <article className="archive-document deletion-document" aria-labelledby="delete-account-title">
      <CosmicInteractionLayer reducedMotion={false} />

      <header className="deletion-hero">
        <SectionCosmos variant="hero" />
        <div className="deletion-hero-orbit" aria-hidden="true" />
        <div className="deletion-kicker"><span>04</span><span>{messages.hero.label}</span><i aria-hidden="true" /></div>
        <h1 id="delete-account-title">{messages.hero.title}</h1>
        <p>{messages.hero.description}</p>
        <InternalTransitionLink href="/privacy/" className="deletion-text-link">{messages.hero.privacy} →</InternalTransitionLink>
      </header>

      <section className="deletion-notice-grid" aria-label={messages.hero.title}>
        {messages.notices.map((notice, index) => (
          <article className="deletion-glass-card deletion-notice" key={notice.eyebrow}>
            <span>0{index + 1} · {notice.eyebrow}</span><h2>{notice.title}</h2><p>{notice.text}</p>
          </article>
        ))}
      </section>

      <section className="deletion-section" aria-labelledby="deletion-steps-title">
        <div className="deletion-section-heading"><span>{messages.steps.eyebrow}</span><h2 id="deletion-steps-title">{messages.steps.title}</h2></div>
        <ol className="deletion-steps">
          {messages.steps.items.map((step, index) => <li key={step.title}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{step.title}</h3><p>{step.text}</p></div></li>)}
        </ol>
      </section>

      <div className="deletion-main-grid">
        <section className="deletion-glass-card deletion-form-card" aria-labelledby="deletion-form-title">
          <div className="deletion-section-heading"><span>{messages.form.eyebrow}</span><h2 id="deletion-form-title">{messages.form.title}</h2><p>{messages.form.intro}</p></div>
          <form onSubmit={handleSubmit} noValidate>
            <div className="deletion-field">
              <label htmlFor="deletion-app">{messages.form.app} <span aria-hidden="true">*</span></label>
              <select id="deletion-app" value={appId} onChange={(event) => { setAppId(event.target.value); setErrors((current) => ({ ...current, app: undefined })); }} aria-invalid={Boolean(errors.app)} aria-describedby={errors.app ? "deletion-app-error" : undefined} required>
                <option value="">—</option>
                {ACCOUNT_DELETION_APPS.map((app) => <option value={app.id} key={app.id}>{app.name}</option>)}
              </select>
              {errors.app ? <p className="deletion-error" id="deletion-app-error">{messages.form.errors.app}</p> : null}
            </div>
            <div className="deletion-field">
              <label htmlFor="deletion-email">{messages.form.email} <span aria-hidden="true">*</span></label>
              <input id="deletion-email" type="email" inputMode="email" autoComplete="email" maxLength={254} value={email} placeholder={messages.form.emailPlaceholder} onChange={(event) => { setEmail(event.target.value); setErrors((current) => ({ ...current, email: undefined })); }} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "deletion-email-error" : undefined} required />
              {errors.email ? <p className="deletion-error" id="deletion-email-error">{messages.form.errors.email}</p> : null}
            </div>
            <div className="deletion-field">
              <label htmlFor="deletion-login">{messages.form.login} <span aria-hidden="true">*</span></label>
              <select id="deletion-login" value={loginMethod} disabled={!selectedApp} onChange={(event) => { setLoginMethod(event.target.value); setErrors((current) => ({ ...current, login: undefined })); }} aria-invalid={Boolean(errors.login)} aria-describedby={errors.login ? "deletion-login-error" : undefined} required>
                <option value="">{messages.form.loginPlaceholder}</option>
                {selectedApp?.loginMethods.map((method) => <option value={method} key={method}>{messages.form.loginNames[method]}</option>)}
              </select>
              {errors.login ? <p className="deletion-error" id="deletion-login-error">{messages.form.errors.login}</p> : null}
            </div>
            <div className="deletion-field">
              <label htmlFor="deletion-type">{messages.form.requestType}</label>
              <input id="deletion-type" value={messages.form.fullDeletion} readOnly />
            </div>
            <div className="deletion-field deletion-field-wide">
              <label htmlFor="deletion-message">{messages.form.message}</label>
              <textarea id="deletion-message" rows={5} maxLength={1200} value={message} placeholder={messages.form.messagePlaceholder} onChange={(event) => setMessage(event.target.value)} />
            </div>
            <label className="deletion-consent">
              <input type="checkbox" checked={consent} onChange={(event) => { setConsent(event.target.checked); setErrors((current) => ({ ...current, consent: undefined })); }} aria-invalid={Boolean(errors.consent)} aria-describedby={errors.consent ? "deletion-consent-error" : "deletion-privacy-notice"} required />
              <span>{messages.form.consent}</span>
            </label>
            {errors.consent ? <p className="deletion-error" id="deletion-consent-error">{messages.form.errors.consent}</p> : null}
            <p className="deletion-privacy-notice" id="deletion-privacy-notice">{messages.form.privacyNotice} <InternalTransitionLink href="/privacy/">{messages.form.privacyLink}</InternalTransitionLink></p>
            <button className="deletion-submit" type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>{isSubmitting ? messages.form.submitting : messages.form.submit} <span aria-hidden="true">→</span></button>
          </form>
          {submissionError ? (
            <div className="deletion-submit-error" role="alert">
              <strong>{messages.form.errors.submitFailed}</strong>
              <span>{messages.form.errors.retry}</span>
            </div>
          ) : null}
          {result ? (
            <div className="deletion-result" role="status" aria-live="polite">
              <h3>{messages.form.draftReady}</h3><p>{messages.form.draftInstruction}</p>
              <dl><div><dt>{messages.form.reference}</dt><dd>{result.reference}</dd></div><div><dt>{messages.form.maskedEmail}</dt><dd>{result.email}</dd></div></dl>
            </div>
          ) : null}
          <a className="deletion-direct-email" href="mailto:contact@samestudio.kr" aria-label={messages.form.mailAria}>{messages.form.directEmail}</a>
        </section>

        <div className="deletion-info-column">
          <section className="deletion-glass-card" aria-labelledby="deletion-scope-title">
            <div className="deletion-section-heading"><span>{messages.scope.eyebrow}</span><h2 id="deletion-scope-title">{messages.scope.title}</h2></div>
            <h3>{messages.scope.deletedTitle}</h3><ul>{messages.scope.deleted.map((item) => <li key={item}>{item}</li>)}</ul>
            <h3>{messages.scope.retainedTitle}</h3><ul>{messages.scope.retained.map((item) => <li key={item}>{item}</li>)}</ul>
            <h3>{messages.scope.localTitle}</h3><p>{messages.scope.localText}</p>
          </section>
          <section className="deletion-glass-card" aria-labelledby="deletion-verification-title">
            <div className="deletion-section-heading"><span>{messages.verification.eyebrow}</span><h2 id="deletion-verification-title">{messages.verification.title}</h2></div>
            <ol className="deletion-verification-list">{messages.verification.items.map((item, index) => <li key={item}><span>{index + 1}</span>{item}</li>)}</ol><p>{messages.verification.relay}</p>
          </section>
          <section className="deletion-glass-card" aria-labelledby="deletion-channel-title">
            <div className="deletion-section-heading"><span>{messages.inApp.eyebrow}</span><h2 id="deletion-channel-title">{messages.inApp.title}</h2></div><p>{messages.inApp.text}</p>
          </section>
        </div>
      </div>

      <section className="deletion-section deletion-faq" aria-labelledby="deletion-faq-title">
        <div className="deletion-section-heading"><span>{messages.faq.eyebrow}</span><h2 id="deletion-faq-title">{messages.faq.title}</h2></div>
        <div className="deletion-faq-list">{messages.faq.items.map((item) => <details key={item.question}><summary>{item.question}<span aria-hidden="true" /></summary><p>{item.answer}</p></details>)}</div>
      </section>

      <nav className="deletion-related-links" aria-label={messages.links.ariaLabel}>
        <InternalTransitionLink href="/privacy/">{messages.links.privacy}</InternalTransitionLink>
        <InternalTransitionLink href="/support/">{messages.links.support}</InternalTransitionLink>
        <InternalTransitionLink href="/">{messages.links.home}</InternalTransitionLink>
      </nav>
    </article>
  );
}
