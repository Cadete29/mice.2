import styles from "./LegalPage.module.css";
const legalDocuments = {
  imagen: {
    eyebrow: "Consentimiento informado",
    title: "Aviso de uso de imagen",
    intro:
      "Este aviso explica cómo MICE-LO podrá captar y utilizar fotografías, video y audio de los eventos organizados por MICE-LO.",
    sections: [
      {
        title: "Responsable y finalidad",
        paragraphs: [
          "MICE-LO, con sede en Chiapas, México, podrá realizar fotografías, grabaciones de video y audio durante la actividad con fines de documentación, memoria institucional, difusión de resultados y promoción de futuras acciones socioambientales.",
        ],
      },
      {
        title: "Medios de difusión",
        paragraphs: [
          "El material podrá publicarse en el sitio web, redes sociales, informes, presentaciones, materiales educativos y medios institucionales de MICE-LO, en México o en otros países, sin que ello implique un uso distinto a las finalidades aquí descritas.",
        ],
      },
      {
        title: "Alcance de la autorización",
        paragraphs: [
          "La autorización se concede de manera gratuita y no exclusiva. MICE-LO podrá realizar ajustes razonables de formato, tamaño, color o duración, sin alterar el contexto ni utilizar la imagen de forma denigrante, engañosa o contraria a la dignidad de la persona.",
          "La autorización no transfiere la identidad ni otros derechos personales de quien participa.",
        ],
      },
      {
        title: "Revocación y menores de edad",
        paragraphs: [
          "Puedes solicitar que no se capte tu imagen o pedir la revocación para usos futuros escribiendo a contacto@micelo.org. La revocación no tendrá efectos retroactivos sobre materiales ya producidos o difundidos legítimamente.",
          "Cuando participe una persona menor de edad, la autorización deberá ser otorgada por su madre, padre o persona tutora. MICE-LO aplicará medidas reforzadas para proteger su identidad e interés superior.",
        ],
      },
    ],
  },
  privacidad: {
    eyebrow: "Protección de datos personales",
    title: "Aviso de privacidad",
    intro:
      "MICE-LO protege los datos personales recabados para organizar los eventos organizados por MICE-LO.",
    sections: [
      {
        title: "Identidad y contacto del responsable",
        paragraphs: [
          "MICE-LO, con sede en Chiapas, México, es responsable del tratamiento de tus datos personales. Para cualquier asunto relacionado con privacidad puedes escribir a contacto@micelo.org.",
        ],
      },
      {
        title: "Datos que recabamos",
        paragraphs: ["Podremos recabar los siguientes datos:"],
        items: [
          "Primer y segundo nombre, apellidos y fecha de nacimiento.",
          "CURP.",
          "Teléfono, lada, país asociado al teléfono y correo electrónico.",
          "Información sobre necesidad de transporte o disponibilidad de vehículo.",
          "Consentimientos relacionados con privacidad, uso de imagen y participación en la actividad.",
        ],
      },
      {
        title: "Finalidades del tratamiento",
        paragraphs: ["Utilizaremos tus datos para:"],
        items: [
          "Registrar y confirmar tu participación.",
          "Verificar identidad y, cuando corresponda, edad o acompañamiento de una persona adulta.",
          "Coordinar transporte, punto de encuentro, horarios y medidas de seguridad.",
          "Contactarte antes, durante o después de la jornada para asuntos relacionados con la actividad.",
          "Mantener constancias administrativas y atender obligaciones legales o requerimientos de autoridad competente.",
        ],
      },
      {
        title: "Transferencias y conservación",
        paragraphs: [
          "MICE-LO no venderá tus datos. Podrá compartir únicamente la información indispensable con proveedores de transporte, personal organizador, servicios de emergencia o autoridades competentes cuando sea necesario para la actividad, la seguridad de las personas o el cumplimiento de una obligación legal.",
          "Los datos se conservarán únicamente durante el tiempo necesario para cumplir estas finalidades y las obligaciones aplicables; después se eliminarán o anonimizarán de forma segura.",
        ],
      },
      {
        title: "Tus derechos y revocación",
        paragraphs: [
          "Puedes solicitar acceso, rectificación, cancelación u oposición al tratamiento de tus datos, así como revocar tu consentimiento o limitar su uso, mediante un correo a contacto@micelo.org. Incluye tu nombre, un medio para recibir respuesta, el derecho que deseas ejercer y la información que permita localizar tu registro. Podremos pedirte documentación para acreditar tu identidad.",
        ],
      },
      {
        title: "Cambios al aviso",
        paragraphs: [
          "Las modificaciones relevantes a este aviso se publicarán en esta misma página. La versión vigente indicará siempre su fecha de actualización.",
        ],
      },
    ],
  },
  terminos: {
    eyebrow: "Condiciones de la cuenta",
    title: "Términos de uso",
    intro:
      "Estos términos regulan la creación y utilización de una cuenta en la plataforma MICE-LO.",
    sections: [
      {
        title: "Uso de la cuenta",
        paragraphs: [
          "La cuenta es personal. Debes proporcionar información verdadera, mantener tus credenciales seguras y notificarnos si detectas un acceso no autorizado.",
          "No puedes utilizar la plataforma para suplantar identidades, vulnerar sistemas, distribuir contenido ilícito ni realizar actividades contrarias a los fines sociales y ambientales de MICE-LO.",
        ],
      },
      {
        title: "Seguridad y disponibilidad",
        paragraphs: [
          "Podremos suspender temporalmente una cuenta para proteger a la comunidad, investigar actividad irregular, cumplir obligaciones legales o realizar mantenimiento. Procuraremos restablecer el servicio cuando desaparezca la causa de la suspensión.",
        ],
      },
      {
        title: "Contenido y servicios externos",
        paragraphs: [
          "Las convocatorias, enlaces y contenidos de terceros pueden estar sujetos a condiciones adicionales. MICE-LO no controla los servicios externos y su inclusión no constituye una garantía sobre su disponibilidad o funcionamiento.",
        ],
      },
      {
        title: "Terminación de la cuenta",
        paragraphs: [
          "Puedes solicitar la cancelación de tu cuenta escribiendo a contacto@micelo.org. MICE-LO podrá conservar la información indispensable durante los plazos legales, de seguridad o de resolución de controversias aplicables.",
        ],
      },
      {
        title: "Cambios a los términos",
        paragraphs: [
          "Las modificaciones relevantes se publicarán en esta página con una nueva versión. Cuando corresponda, solicitaremos una nueva aceptación antes de continuar utilizando funciones protegidas.",
        ],
      },
    ],
  },
  responsabilidad: {
    eyebrow: "Participación segura",
    title: "Deslinde de responsabilidad",
    intro:
      "Este documento informa los riesgos propios de un evento organizado por MICE-LO y establece compromisos básicos de participación responsable.",
    sections: [
      {
        title: "Participación voluntaria",
        paragraphs: [
          "Declaro que participo de manera libre y voluntaria. Entiendo que las actividades y sus riesgos varían según el evento. En actividades al aire libre pueden incluir terreno irregular, exposición al sol, calor, lluvia y otros riesgos del entorno. Me comprometo a consultar las indicaciones específicas del equipo organizador.",
        ],
      },
      {
        title: "Condiciones personales y deber de cuidado",
        paragraphs: [
          "Declaro que, según mi leal saber y entender, cuento con condiciones físicas compatibles con la actividad. Me comprometo a seguir las indicaciones del equipo organizador, utilizar el equipo de protección proporcionado o recomendado, no manipular residuos peligrosos y avisar de inmediato sobre cualquier incidente o condición que pueda ponerme en riesgo.",
        ],
      },
      {
        title: "Atención en caso de emergencia",
        paragraphs: [
          "Autorizo al personal organizador a solicitar primeros auxilios o servicios de emergencia cuando razonablemente lo considere necesario. Los gastos médicos o de traslado que no estén cubiertos expresamente por MICE-LO serán responsabilidad de la persona participante, conforme resulte legalmente aplicable.",
        ],
      },
      {
        title: "Objetos personales y transporte",
        paragraphs: [
          "Cada participante es responsable del cuidado de sus objetos personales. Si utiliza vehículo propio, declara que este se encuentra en condiciones adecuadas, que cuenta con la documentación exigible y que respetará las normas de tránsito. La coordinación de transporte no convierte a MICE-LO en aseguradora de las personas participantes.",
        ],
      },
      {
        title: "Límites de este deslinde",
        paragraphs: [
          "La aceptación reconoce los riesgos inherentes de la actividad, pero no libera a MICE-LO ni a terceros de responsabilidad por dolo, negligencia, incumplimiento de obligaciones legales o cualquier derecho que no pueda renunciarse conforme a la legislación aplicable.",
          "Las personas menores de edad deberán participar acompañadas y bajo autorización de su madre, padre o persona tutora.",
        ],
      },
    ],
  },
};
const LegalPage = ({ documentType }) => {
  const document = legalDocuments[documentType];
  return (
    <main className={styles.page}>
      <header className={styles.hero}>
        <div>
          <p>{document.eyebrow}</p>
          <h1>{document.title}</h1>
          <span>{document.intro}</span>
        </div>
      </header>

      <article className={styles.document}>
        <div className={styles.meta}>
          <span>Última actualización</span>
          <strong>
            {documentType === "terminos"
              ? "8 de agosto de 2026"
              : "17 de julio de 2026"}
          </strong>
        </div>

        <aside className={styles.notice}>
          Documento base sujeto a revisión legal y a la incorporación del
          domicilio completo y la denominación jurídica definitiva de la
          organización antes de su publicación oficial.
        </aside>

        {document.sections.map((section) => (
          <section key={section.title}>
            <h2>{section.title}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            {section.items && (
              <ul>
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </section>
        ))}

        <div className={styles.contact}>
          <strong>Contacto</strong>
          <a href="mailto:contacto@micelo.org">contacto@micelo.org</a>
          <span>Chiapas, México</span>
        </div>

        <a
          className={styles.backLink}
          href={
            documentType === "terminos"
              ? "/sign-up"
              : "/registro-eventos"
          }
        >
          ← Volver al registro
        </a>
      </article>
    </main>
  );
};
export default LegalPage;
