export const SITE_URL = "https://micelo.org";

export const pages = {
  "/": ["MICE-LO | Proyectos ambientales y comunidad en Chiapas", "Conectamos naturaleza, investigación e innovación para regenerar ecosistemas en Chiapas. Conoce los proyectos, convocatorias y acciones de MICE-LO."],
  "/chiapas-por-el-clima": ["Chiapas por el Clima | MICE-LO", "Conoce iniciativas y proyectos de la comunidad que protegen la biodiversidad y fortalecen la resiliencia climática de Chiapas."],
  "/convocatorias": ["Convocatorias ambientales y sociales | MICE-LO", "Explora las convocatorias de MICE-LO y encuentra oportunidades para participar en iniciativas ambientales y sociales."],
  "/nosotros": ["Nosotros: equipo y misión | MICE-LO", "Conoce al equipo de MICE-LO, nuestra misión y nuestra visión para impulsar proyectos ambientales y sociales en Chiapas."],
  "/nuestros-objetivos": ["Objetivos ambientales y comunitarios | MICE-LO", "Conoce nuestros objetivos de regeneración de ecosistemas, educación ambiental, investigación y participación comunitaria."],
  "/familia": ["Alianzas y comunidad | Familia MICE-LO", "Conecta con la comunidad de MICE-LO y participa en alianzas para impulsar acciones ambientales y sociales."],
  "/registro-eventos": ["Registro de eventos | MICE-LO", "Consulta los eventos disponibles y registra tu participación en las actividades de MICE-LO."],
  "/donativos": ["Apoya nuestros proyectos | Donativos MICE-LO", "Conoce cómo apoyar a MICE-LO y contribuir a sus proyectos ambientales, sociales y de regeneración de ecosistemas."],
  "/seguridad": ["Seguridad y protección de tu cuenta | MICE-LO", "Consulta la información de seguridad de MICE-LO y conoce las medidas para proteger tu cuenta."],
  "/aviso-uso-de-imagen": ["Aviso de uso de imagen | MICE-LO", "Consulta cómo MICE-LO utiliza fotografías, video y audio de sus eventos."],
  "/aviso-de-privacidad": ["Aviso de privacidad | MICE-LO", "Conoce cómo MICE-LO trata y protege los datos personales recabados para organizar sus eventos."],
  "/deslinde-de-responsabilidad": ["Deslinde de responsabilidad | MICE-LO", "Consulta las condiciones y responsabilidades de participación en las actividades de MICE-LO."],
  "/terminos-de-uso": ["Términos de uso | MICE-LO", "Consulta los términos y condiciones de uso del sitio web de MICE-LO."],
};

export const privatePages = ["/administracion", "/dashboard", "/sign-up"];

export function getSeo(pathname) {
  const path = pathname.replace(/\/+$/, "") || "/";
  const page = pages[path];
  const dynamic = /^\/(proyectos|convocatorias|perfiles)\/[0-9a-f-]{36}$/i.test(path);
  const title = page?.[0] || "MICE-LO";
  const description = page?.[1] || "Conoce la comunidad y las iniciativas ambientales y sociales de MICE-LO.";
  return {
    title,
    description,
    canonical: SITE_URL + path,
    robots: page || dynamic ? "index, follow" : "noindex, follow",
  };
}

export const organization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: "MICE-LO",
  url: `${SITE_URL}/`,
  logo: `${SITE_URL}/logo1.webp`,
  description: pages["/"][1],
};

export function applySeo(pathname) {
  const seo = getSeo(pathname);
  document.title = seo.title;
  const tags = {
    description: seo.description,
    robots: seo.robots,
    "og:type": "website",
    "og:site_name": "MICE-LO",
    "og:locale": "es_MX",
    "og:title": seo.title,
    "og:description": seo.description,
    "og:url": seo.canonical,
    "og:image": `${SITE_URL}/logo1.webp`,
    "og:image:alt": "Logotipo de MICE-LO",
    "twitter:card": "summary",
    "twitter:title": seo.title,
    "twitter:description": seo.description,
    "twitter:image": `${SITE_URL}/logo1.webp`,
  };
  for (const [name, content] of Object.entries(tags)) {
    const attribute = name.startsWith("og:") ? "property" : "name";
    let tag = document.head.querySelector(`meta[${attribute}="${name}"]`);
    if (!tag) {
      tag = document.createElement("meta");
      tag.setAttribute(attribute, name);
      document.head.append(tag);
    }
    tag.content = content;
  }
  let canonical = document.head.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.append(canonical);
  }
  canonical.href = seo.canonical;
  let structuredData = document.getElementById("seo-organization");
  if (pathname === "/") {
    if (!structuredData) {
      structuredData = document.createElement("script");
      structuredData.id = "seo-organization";
      structuredData.type = "application/ld+json";
      document.head.append(structuredData);
    }
    structuredData.textContent = JSON.stringify(organization);
  } else {
    structuredData?.remove();
  }
}
