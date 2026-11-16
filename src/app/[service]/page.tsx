import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  Calculator,
  CheckCircle2,
  ChevronRight,
  MessageCircle,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { JsonLd } from "@/components/json-ld";
import { LeadForm } from "@/components/lead-form";
import { ServiceIcon } from "@/components/service-icon";
import { TrackedLink } from "@/components/tracked-links";
import { getWhatsappUrl, siteConfig } from "@/config/site";
import { serviceBySlug, services } from "@/data/services";
import type { ServiceAudience } from "@/data/services";

const diagnosticPrice: Record<ServiceAudience, number> = {
  home: 3000,
  business: 5000,
};

const repairFromPrice: Record<string, number> = {
  "remont-stiralnyh-mashin": 8000,
  "remont-holodilnikov": 10000,
  "remont-posudomoechnyh-mashin": 8000,
  "remont-sushilnyh-mashin": 8000,
  "remont-duhovyh-shkafov": 8000,
  "remont-varochnyh-paneley": 8000,
  "remont-vinnyh-shkafov": 12000,
  "remont-kondicionerov": 10000,
  "ustanovka-bytovoy-tehniki": 7000,
  "commercial-equipment": 15000,
  "remont-promyshlennyh-holodilnikov": 20000,
  "remont-walk-in-cooler": 25000,
  "remont-reach-in-holodilnikov": 15000,
  "remont-ledogeneratorov": 15000,
  "remont-commercial-oven": 20000,
  "remont-friturnits": 12000,
  "remont-griley": 12000,
  "remont-promyshlennyh-posudomoechnyh-mashin": 15000,
  "remont-kofemashin": 15000,
  "remont-slush-apparatov": 15000,
  "ustanovka-restorannogo-oborudovaniya": 20000,
};

function formatTenge(value: number) {
  return `${String(value).replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0")}\u00a0₸`;
}

function pageTitle(service: { title: string; audience: ServiceAudience }) {
  return service.audience === "home"
    ? service.title.replace(" в Алматы", " на дому в Алматы")
    : service.title;
}

const brandsByAudience: Record<ServiceAudience, string> = {
  home: "Samsung, LG, Bosch, Siemens, Electrolux, Indesit, Ariston, Beko, Haier, Midea, Gorenje, Miele, Whirlpool, Atlant и другими",
  business:
    "Rational, Unox, Electrolux Professional, Hoshizaki, Scotsman, Brema, Frymaster, Hobart, Winterhalter, Polair, Carboma и другими",
};

type Props = {
  params: Promise<{ service: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return services.map((service) => ({ service: service.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { service: slug } = await params;
  const service = serviceBySlug.get(slug);

  if (!service) {
    return {};
  }

  return {
    title: pageTitle(service),
    description: service.metaDescription,
    alternates: {
      canonical: `/${service.slug}`,
    },
    openGraph: {
      title: pageTitle(service),
      description: service.metaDescription,
      url: `/${service.slug}`,
      type: "website",
      images: ["/opengraph-image"],
    },
  };
}

export default async function ServicePage({ params }: Props) {
  const { service: slug } = await params;
  const service = serviceBySlug.get(slug);

  if (!service) {
    notFound();
  }

  const whatsappMessage = `Здравствуйте! Нужна услуга: ${service.name.toLowerCase()}. Адрес находится в Алматы или Алматинской области.`;
  const diagnostic = diagnosticPrice[service.audience];
  const repairFrom = repairFromPrice[service.slug] ?? null;
  const workLabel = service.slug.startsWith("ustanovka") ? "Установка" : "Ремонт";
  const relatedServices = service.relatedSlugs
    .map((relatedSlug) => serviceBySlug.get(relatedSlug))
    .filter((item) => item !== undefined);
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        name: service.name,
        description: service.description,
        areaServed: {
          "@type": "City",
          name: siteConfig.city,
        },
        provider: {
          "@id": `${siteConfig.siteUrl}/#business`,
        },
        url: `${siteConfig.siteUrl}/${service.slug}`,
        ...(repairFrom
          ? {
              offers: {
                "@type": "Offer",
                priceCurrency: "KZT",
                price: repairFrom,
                priceSpecification: {
                  "@type": "PriceSpecification",
                  minPrice: repairFrom,
                  priceCurrency: "KZT",
                },
              },
            }
          : {}),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Главная",
            item: siteConfig.siteUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Услуги",
            item: `${siteConfig.siteUrl}/services`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: service.name,
            item: `${siteConfig.siteUrl}/${service.slug}`,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: service.faq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
    ],
  };

  return (
    <>
      <JsonLd data={schema} />
      <section className="service-hero">
        <div className="container">
          <nav className="breadcrumbs" aria-label="Хлебные крошки">
            <Link href="/">Главная</Link>
            <ChevronRight size={14} aria-hidden="true" />
            <Link href="/services">Услуги</Link>
            <ChevronRight size={14} aria-hidden="true" />
            <span>{service.shortName}</span>
          </nav>
          <div className="service-hero-grid">
            <div className="service-hero-copy">
              <div className="service-page-icon">
                <ServiceIcon name={service.icon} size={42} />
              </div>
              <h1>{pageTitle(service)}</h1>
              <p>{service.intro}</p>
              <p className="service-hero-price" style={{ fontWeight: 700 }}>
                Выезд и диагностика — {formatTenge(diagnostic)} (бесплатно при
                ремонте)
                {repairFrom
                  ? ` · ${workLabel} — от ${formatTenge(repairFrom)}`
                  : ""}
              </p>
              <div className="hero-actions">
                <Link href="#service-request" className="button button-primary">
                  Вызвать мастера
                  <ArrowRight size={19} aria-hidden="true" />
                </Link>
                <TrackedLink
                  href={getWhatsappUrl(whatsappMessage)}
                  event="whatsapp_click"
                  label={`service_hero_${service.slug}`}
                  target="_blank"
                  className="text-link"
                >
                  <MessageCircle size={20} aria-hidden="true" />
                  Написать в WhatsApp
                </TrackedLink>
              </div>
              <div className="service-trust-row">
                <span>
                  <CheckCircle2 aria-hidden="true" />
                  Опыт ремонта — 12 лет
                </span>
                <span>
                  <Calculator aria-hidden="true" />
                  Работы согласуем заранее
                </span>
                <span>
                  <ShieldCheck aria-hidden="true" />
                  Гарантия от 3 месяцев до 1 года
                </span>
              </div>
            </div>
            <div className="service-request-card" id="service-request">
              <h2>Отправить заявку</h2>
              <p>
                Укажите телефон. Заявка откроется в WhatsApp с названием
                выбранной услуги.
              </p>
              <LeadForm defaultService={service.slug} compact />
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container service-intro">
          <span className="section-label">Об услуге</span>
          <h2>{service.name}: диагностика, ремонт и проверка результата</h2>
          <p>{service.description}</p>
          <p>
            <strong>Работаем с марками:</strong>{" "}
            {brandsByAudience[service.audience]}.
          </p>
        </div>
        <div className="container two-column-section">
          <div>
            <div className="section-heading">
              <h2>С какими проблемами помогаем</h2>
              <p>
                Если вашей неисправности нет в списке, опишите ее оператору.
              </p>
            </div>
            <ul className="issue-list">
              {service.issues.map((issue) => (
                <li key={issue}>
                  <CheckCircle2 aria-hidden="true" />
                  {issue}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="section-heading">
              <h2>Какие работы выполняем</h2>
              <p>Точный перечень определяется после диагностики.</p>
            </div>
            <ul className="work-list">
              {service.workTypes.map((work, index) => (
                <li key={work}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {work}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="section service-price-section">
        <div className="container service-price-grid">
          <div>
            <h2>Сколько стоит</h2>
            <p style={{ fontSize: "1.15rem", lineHeight: 1.7 }}>
              Выезд и диагностика — <strong>{formatTenge(diagnostic)}</strong>{" "}
              (бесплатно, если вы соглашаетесь на ремонт)
              {repairFrom ? (
                <>
                  <br />
                  {workLabel} — <strong>от {formatTenge(repairFrom)}</strong>
                </>
              ) : null}
            </p>
            <p>
              Запчасти оплачиваются отдельно. Точную цену мастер называет
              после диагностики, до начала работ. Она зависит от следующего:
            </p>
          </div>
          <ul>
            {service.priceFactors.map((factor) => (
              <li key={factor}>
                <Calculator aria-hidden="true" />
                {factor}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section related-section">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="section-label">Связанные услуги</span>
              <h2>Другие работы с техникой и оборудованием</h2>
            </div>
            <p>
              Если проблема затрагивает несколько устройств, укажите это в
              заявке. Так мастер сможет лучше подготовиться к выезду.
            </p>
          </div>
          <div className="related-grid">
            {relatedServices.map((related) => (
              <Link href={`/${related.slug}`} key={related.slug}>
                <ServiceIcon name={related.icon} size={25} />
                <span>{related.name}</span>
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section faq-section">
        <div className="container faq-grid">
          <div>
            <h2>Вопросы об услуге</h2>
            <p>
              Для консультации позвоните по номеру{" "}
              <a href={siteConfig.phoneHref}>{siteConfig.phoneDisplay}</a>.
            </p>
          </div>
          <div className="faq-list">
            {service.faq.map((item) => (
              <details key={item.question}>
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="final-cta">
        <div className="container final-cta-inner">
          <div>
            <h2>{service.name} — оставить заявку</h2>
            <p>Сначала обсудим задачу, затем согласуем время выезда.</p>
          </div>
          <div className="final-cta-actions">
            <TrackedLink
              href={siteConfig.phoneHref}
              event="call_click"
              label={`service_final_${service.slug}`}
              className="button button-dark"
            >
              <Phone size={18} aria-hidden="true" />
              Позвонить
            </TrackedLink>
            <TrackedLink
              href={getWhatsappUrl(whatsappMessage)}
              event="whatsapp_click"
              label={`service_final_${service.slug}`}
              target="_blank"
              className="button button-primary"
            >
              <MessageCircle size={19} aria-hidden="true" />
              WhatsApp
            </TrackedLink>
          </div>
        </div>
      </section>
    </>
  );
}
