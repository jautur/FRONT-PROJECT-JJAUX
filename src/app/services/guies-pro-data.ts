export interface GuiaProfessional {
  id: string;
  titol: string;
  subtitol: string;
  categoria: string;
  tempsLectura: string;
  imatge: string;
  puntsClau: string[];
  contingut: string[];
  destacat: string;
}

export const GUIES_PRO_VA: GuiaProfessional[] = [
  {
    id: 'guia-1',
    titol: "Com convertir incidències en tasques rendibles: L'estratègia del pressupost clar",
    subtitol: "Claus per redactar propostes que transmetin confiança i aconseguir un 80% d'acceptació del client.",
    categoria: "Estratègia de Negoci",
    tempsLectura: "4 min de lectura",
    imatge: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1000&q=80",
    contingut: [
      "Quan un client publica una incidència a AVISA (per exemple, una avaria de termo, un curtcircuit o una humitat), normalment busca tres coses: rapidesa de resposta, professionalitat i certesa en el cost final.",
      "Molts professionals cometen l'error d'enviar pressupostos amb una sola xifra sense cap detall. A AVISA hem comprovat que les ofertes que desglossen breument la mà d'obra, el tipus de peces que s'utilitzaran i el termini estimat d'arribada tenen una taxa d'acceptació quatre vegades superior.",
      "A més, un cop acceptada la proposta, la incidència es converteix en una TASCA oficial: això et garanteix que el client s'ha compromès amb tu i que podràs contactar-lo immediatament per telèfon."
    ],
    puntsClau: [
      "Indica sempre si el desplaçament està inclòs en el preu de l'oferta.",
      "Explica la marca o qualitat dels materials que faràs servir per donar valor afegit.",
      "Ofereix garantia per escrit de la feina (per exemple, 2 anys en canonades o quadres)."
    ],
    destacat: "Ser dels tres primers a enviar una proposta realista sobre una incidència oberta multiplica un 70% les teves opcions de ser l'escollit."
  },
  {
    id: 'guia-2',
    titol: "Publicar Ofertes fixes: La fórmula per omplir els forats d'agenda",
    subtitol: "Per què crear packs de serveis tancats atreu clients que no volen esperar pressupostos llargs.",
    categoria: "Captació Proactiva",
    tempsLectura: "3 min de lectura",
    imatge: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1000&q=80",
    contingut: [
      "El gran avantatge d'AVISA és que no estàs limitat a esperar que algú publiqui una feina. El professional pot crear de manera proactiva les seves pròpies OFERTES públiques al mercat.",
      "Pensa en serveis recurrents amb preu tancat: 'Revisió oficial de caldera i neteja de filtres (75€)', 'Instal·lació de 5 portes lacades (980€)' o 'Pintura de pis blanc llis 3 habitacions (750€)'.",
      "Quan un client navega pel mercat i veu un pack que encaixa amb el que necessita, pot sol·licitar directament la teva oferta per convertir-la en TASCA. És una entrada contínua de feina sense haver de competir en una licitació oberta."
    ],
    puntsClau: [
      "Posa títols clars amb el preu aproximat o tancat per generar atracció.",
      "Descriu exactament què inclou el servei (metres quadrats, capes de pintura, etc.).",
      "Mantingues les ofertes actualitzades segons la temporada (aire condicionat a l'estiu, calefacció a la tardor)."
    ],
    destacat: "Els professionals que mantenen 2 o 3 ofertes actives al mercat reben una mitjana de 4 contactes directes al mes sense necessitat de fer prospecció."
  },
  {
    id: 'guia-3',
    titol: "El poder de les ressenyes verificades: El teu millor anunci de pagament",
    subtitol: "Com 'coleccionar' tasques finalitzades per convertir-te en el professional de referència de la comarca.",
    categoria: "Reputació Digital",
    tempsLectura: "4 min de lectura",
    imatge: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1000&q=80",
    contingut: [
      "Avui dia, el 92% dels clients particulars consulten les opinions a internet abans de deixar entrar un paleta, lampista o electricista a casa seva.",
      "A diferència d'altres directoris on qualsevol pot escriure ressenyes falses, a AVISA les valoracions estan 100% blindades: només un client que ha tingut una TASCA real finalitzada amb tu pot puntuar-te i escriure un comentari.",
      "Aquest sistema protegeix el teu prestigi contra atacs i converteix el teu perfil en un aparador irrebatible. Un perfil amb 10 ressenyes de 5 estrelles pot cobrar un 20% més de marge perquè el client prioritza la tranquil·litat i la confiança."
    ],
    puntsClau: [
      "En acabar la feina, demana amablement al client que marqui la tasca com a Finalitzada des del seu panell.",
      "La puntualitat i la neteja de la zona de treball després de la reforma són els dos punts més valorats a les ressenyes.",
      "Respon sempre amb agraïment a les bones valoracions per mostrar professionalitat."
    ],
    destacat: "A AVISA, un professional amb més de 8 tasques finalitzades i 4.8 d'estrelles apareix de forma destacada a la portada de la web i als suggeriments recomanats."
  }
];

export const GUIES_PRO_ES: GuiaProfessional[] = [
  {
    id: 'guia-1',
    titol: "Cómo convertir incidencias en trabajos rentables: La estrategia del presupuesto claro",
    subtitol: "Claves para redactar propuestas que transmitan confianza y conseguir un 80% de aceptación del cliente.",
    categoria: "Estrategia de Negocio",
    tempsLectura: "4 min de lectura",
    imatge: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1000&q=80",
    contingut: [
      "Cuando un cliente publica una incidencia en AVISA (por ejemplo, una avería de termo, un cortocircuito o una humedad), normalmente busca tres cosas: rapidez de respuesta, profesionalidad y certidumbre en el coste final.",
      "Muchos profesionales cometen el error de enviar presupuestos con una sola cifra sin ningún detalle. En AVISA hemos comprobado que las ofertas que desglosan brevemente la mano de obra, los repuestos y el plazo estimado de llegada tienen una tasa de aceptación cuatro veces superior.",
      "Además, una vez aceptada la propuesta, la incidencia se convierte en una TAREA oficial: esto te garantiza que el cliente se ha comprometido contigo y que podrás contactarlo de inmediato por teléfono."
    ],
    puntsClau: [
      "Indica siempre si el desplazamiento está incluido en el precio de la oferta.",
      "Explica la marca o calidad de los materiales para aportar valor añadido.",
      "Ofrece garantía por escrito del trabajo (por ejemplo, 2 años en tuberías o cuadros eléctricos)."
    ],
    destacat: "Ser de los tres primeros en enviar una propuesta realista sobre una incidencia abierta multiplica un 70% tus opciones de ser el elegido."
  },
  {
    id: 'guia-2',
    titol: "Publicar Ofertas fijas: La fórmula para cubrir los huecos de agenda",
    subtitol: "Por qué crear packs de servicios cerrados atrae a clientes que no quieren esperar presupuestos largos.",
    categoria: "Captación Proactiva",
    tempsLectura: "3 min de lectura",
    imatge: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1000&q=80",
    contingut: [
      "La gran ventaja de AVISA es que no estás limitado a esperar que alguien publique un trabajo. El profesional puede crear de manera proactiva sus propias OFERTAS públicas en el mercado.",
      "Piensa en servicios recurrentes con precio cerrado: 'Revisión oficial de caldera y limpieza de filtros (75€)', 'Instalación de 5 puertas lacadas (980€)' o 'Pintura de piso blanco liso 3 habitaciones (750€)'.",
      "Cuando un cliente navega por el mercado y ve un pack que encaja con lo que necesita, puede solicitar directamente tu oferta para convertirla en TAREA. Es una entrada continua de trabajo sin tener que competir en una licitación abierta."
    ],
    puntsClau: [
      "Pon títulos claros con el precio aproximado o cerrado para generar atracción.",
      "Describe exactamente qué incluye el servicio (metros cuadrados, capas de pintura, etc.).",
      "Mantén las ofertas actualizadas según la temporada (aire acondicionado en verano, calefacción en otoño)."
    ],
    destacat: "Los profesionales que mantienen 2 o 3 ofertas activas en el mercado reciben una media de 4 contactos directos al mes sin necesidad de hacer prospección."
  },
  {
    id: 'guia-3',
    titol: "El poder de las reseñas verificadas: Tu mejor anuncio de pago",
    subtitol: "Cómo 'acumular' tareas finalizadas para convertirte en el profesional de referencia de la comarca.",
    categoria: "Reputación Digital",
    tempsLectura: "4 min de lectura",
    imatge: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1000&q=80",
    contingut: [
      "Hoy en día, el 92% de los clientes particulares consultan las opiniones en internet antes de dejar entrar a un albañil, fontanero o electricista a su casa.",
      "A diferencia de otros directorios donde cualquiera puede escribir opiniones falsas, en AVISA las valoraciones están 100% blindadas: solo un cliente que ha tenido una TAREA real finalizada contigo puede puntuarte y escribir un comentario.",
      "Este sistema protege tu prestigio contra ataques y convierte tu perfil en un escaparate imbatible. Un perfil con 10 reseñas de 5 estrellas puede cobrar un 20% más de margen porque el cliente prioriza la tranquilidad y la confianza."
    ],
    puntsClau: [
      "Al terminar el trabajo, pide amablemente al cliente que marque la tarea como Finalizada desde su panel.",
      "La puntualidad y la limpieza de la zona de trabajo tras la reforma son los dos aspectos más valorados.",
      "Responde siempre con agradecimiento a las buenas valoraciones para demostrar profesionalidad."
    ],
    destacat: "En AVISA, un profesional con más de 8 tareas completadas y 4.8 estrellas aparece de forma destacada en la portada y sugerencias recomendadas."
  }
];

export const GUIES_PRO_EN: GuiaProfessional[] = [
  {
    id: 'guia-1',
    titol: "Turning Requests into Profitable Jobs: The Transparent Quote Strategy",
    subtitol: "Keys to writing proposals that inspire trust and achieve an 80% customer acceptance rate.",
    categoria: "Business Strategy",
    tempsLectura: "4 min read",
    imatge: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1000&q=80",
    contingut: [
      "When a client posts a service request on AVISA (e.g. water heater breakdown, short circuit or moisture issue), they usually look for three things: quick response, professionalism, and certainty on total cost.",
      "Many contractors make the mistake of submitting single lump-sum figures with zero details. On AVISA, quotes breaking down labor, materials, and estimated arrival date achieve a four times higher acceptance rate.",
      "Once accepted, the request turns into an official agreed TASK: this guarantees the client is committed and immediately unlocks direct phone contact."
    ],
    puntsClau: [
      "Always state whether travel costs are included in the quote.",
      "Specify material brands and quality to justify your value proposition.",
      "Provide a written guarantee for your work (e.g. 2-year warranty on plumbing or electrical panels)."
    ],
    destacat: "Being among the first three to submit a realistic quote on an open job boosts your chance of winning the contract by 70%."
  },
  {
    id: 'guia-2',
    titol: "Publishing Fixed-Price Offers: Fill Schedule Gaps Effortlessly",
    subtitol: "Why packaged services attract clients who do not want to wait for lengthy quote negotiations.",
    categoria: "Proactive Lead Gen",
    tempsLectura: "3 min read",
    imatge: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1000&q=80",
    contingut: [
      "The major advantage of AVISA is you are not limited to waiting for clients to post jobs. You can proactively publish your own public OFFERS on the market.",
      "Think about routine fixed-price services: 'Official boiler inspection & filter cleaning (€75)', 'Installation of 5 lacquered interior doors (€980)', or 'Standard 3-bedroom interior painting (€750)'.",
      "When browsing the market, clients can directly hire your offer and convert it into a TASK. This creates a steady workflow without bidding wars."
    ],
    puntsClau: [
      "Use clear titles with upfront pricing to catch client attention.",
      "Describe exact inclusions (square meters, coats of paint, materials).",
      "Keep offers season-adjusted (AC maintenance in spring/summer, heating in autumn)."
    ],
    destacat: "Contractors maintaining 2 or 3 active offers in the market receive an average of 4 direct bookings per month without active prospecting."
  },
  {
    id: 'guia-3',
    titol: "The Power of Verified Reviews: Your Best Unpaid Advertisement",
    subtitol: "How building a track record of completed tasks turns you into the go-to specialist in your area.",
    categoria: "Digital Reputation",
    tempsLectura: "4 min read",
    imatge: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1000&q=80",
    contingut: [
      "Nowadays, 92% of homeowners check online reviews before letting a contractor into their home.",
      "Unlike other platforms with untrusted reviews, AVISA reviews are 100% verified: only clients with a completed and paid TASK can rate you and post feedback.",
      "This protects your reputation and makes your profile an indisputable showcase. A profile with 10 5-star reviews can command a 20% higher margin because clients prioritize peace of mind and reliability."
    ],
    puntsClau: [
      "Upon job completion, politely ask the client to mark the task as Completed in their dashboard.",
      "Punctuality and thorough post-job site cleanup are the two most praised aspects in reviews.",
      "Always reply with gratitude to positive ratings to exhibit high professionalism."
    ],
    destacat: "On AVISA, contractors with more than 8 completed tasks and a 4.8+ rating are featured prominently on the homepage and recommendation widgets."
  }
];
