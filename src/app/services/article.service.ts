import { Injectable } from '@angular/core';
import { Article } from '../models/article.model';

/**
 * Servei per a la gestió d'articles del Blog d'AVISA.
 * Analitza els sectors professionals clau de la zona (Catalunya, comarques de Girona i Barcelona)
 * i ofereix consells tècnics, preus orientatius i bones pràctiques.
 */
@Injectable({
  providedIn: 'root'
})
export class ArticleService {

  private readonly articles: Article[] = [
    {
      id: 1,
      slug: 'guia-reformes-bany-cuina-catalunya-2026',
      titol: 'Quant costa reformar un bany o una cuina a la nostra zona? Guia de pressupostos i materials 2026',
      subtitol: 'Desglossament de costos, elecció de materials duradors i permisos municipals per planificar la teva reforma sense sorpreses.',
      resum: 'Desglossament pràctic de mà d\'obra, permisos d\'obra, instal·lacions de lampisteria i materials recomanats per planificar la teva reforma amb transparència.',
      categoria: 'Reformes i Obres',
      tempsLectura: '6 min de lectura',
      data: '14 Octubre 2026',
      sectorZona: 'Sector Construcció i Reformes (Girona, Barcelona i Maresme)',
      categoriaServeiRecomanat: 'Reformes i Obres',
      autor: {
        nom: 'Elena Pons',
        carrec: 'Arquitecta Tècnica i Aparelladora Col·legiada',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80'
      },
      imatge: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80',
      imatgePeu: 'Reforma integral d\'un bany amb plat de dutxa de resina antilliscant i enrajolat ceràmic rectificat.',
      tags: ['Reformes', 'Bany', 'Cuina', 'Pressupostos', 'Llicència d\'obra', 'Pladur'],
      seccions: [
        {
          subtitol: '1. Diagnòstic del parc d\'habitatges a la comarca',
          paragrafs: [
            'A les nostres comarques, una gran part dels edificis residencials van ser construïts entre 1970 i 2000. Això fa que molts habitatges comptin encara amb instal·lacions de canonades de coure o fins i tot plom, juntament amb banyeres de ferro colat que dificulten l\'accessibilitat de la gent gran i generen un consum excessiu d\'aigua.',
            'L\'actualització d\'un bany o d\'una cuina no només revalora la propietat entre un 12% i un 18% en el mercat de compra i lloguer local, sinó que és l\'ocasió ideal per renovar les instal·lacions elèctriques i de fontaneria darrere de les parets abans que es produeixi una fuita o derivació.'
          ],
          puntsClau: [
            'Substituir canonades velles per tubs multicapa o polietilè reticulat (PEX).',
            'Substitució de la banyera per un plat de dutxa extraplà de resina mineral classe 3 antilliscant.',
            'Aprofitament d\'envans de cartró-guix hidròfug (pladur verd) per encastar aixetes i cisternes.'
          ]
        },
        {
          subtitol: '2. Estimació de preus mitjans a la zona per a aquest 2026',
          paragrafs: [
            'El cost d\'una reforma depèn principalment de la qualitat dels revestiments i de si cal modificar la distribució dels punts d\'aigua i desguàs. A continuació presentem un desglossament estimat segons les feines executades a la plataforma AVISA:'
          ],
          taulaPreus: [
            { concepte: 'Canvi exprés de banyera per plat de dutxa (amb rajola fins a 1,20m)', preuAproximat: '850€ - 1.350€', consell: 'Es realitza normalment en 24-48 hores sense necessitat de llicència complexa.' },
            { concepte: 'Reforma integral de bany estàndard (fins a 5 m²)', preuAproximat: '2.200€ - 3.800€', consell: 'Inclou demolició, fontaneria nova, plat de dutxa, mampara, sanitaris i ceràmica.' },
            { concepte: 'Reforma integral de cuina mitjana (fins a 9 m²)', preuAproximat: '4.800€ - 9.200€', consell: 'Inclou fontaneria, punts de llum, enrajolat, mobles alts i baixos i taulell de silestone o porcellànic.' }
          ],
          destacatConsell: 'A AVISA recomanem demanar com a mínim 3 pressupostos a professionals diferents. Fixar el preu de la mà d\'obra amb el desglossament de materials evita el típic suplement d\'obra no previst.'
        },
        {
          subtitol: '3. Tràmits municipals: Cal permís d\'obra?',
          paragrafs: [
            'A la majoria d\'ajuntaments de Catalunya (com Barcelona, Girona, Mataró, Terrassa o Figueres), les reformes de banys i cuines sense modificació d\'elements estructurals ni canvi de distribució d\'envans mestres es tramiten mitjançant una **Comunicació Prèvia d\'Obra Menor** o un **Assabentat d\'Obres** telemàtic.',
            'Aquest tràmit sol tenir una taxa mínima o bonificada i et permet iniciar la feina l\'endemà mateix de presentar-la. Si contractes un contenidor per a runes a la via pública, el paleta s\'encarregarà de tramitar la reserva d\'estacionament corresponent.'
          ]
        }
      ]
    },
    {
      id: 2,
      slug: 'climatitzacio-aerotermia-eficiencia-costa-interior',
      titol: 'Climatització i aerotèrmia a la costa i l\'interior: Com reduir fins a un 50% la factura energètica',
      subtitol: 'Claus tècniques per triar entre bomba de calor split o aerotèrmia centralitzada segons el clima de la teva comarca.',
      resum: 'Consells d\'especialistes homologats per detectar sobreescalfaments al quadre elèctric, mantenir bombes de calor i reduir la despesa energètica anual.',
      categoria: 'Climatització',
      tempsLectura: '5 min de lectura',
      data: '12 Octubre 2026',
      sectorZona: 'Sector Climatització i Energies Renovables',
      categoriaServeiRecomanat: 'Climatització',
      autor: {
        nom: 'Anna Prat',
        carrec: 'Enginyera Tècnica i Instal·ladora Frigorista Homologada RITE',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80'
      },
      imatge: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=80',
      imatgePeu: 'Muntatge certificat d\'una unitat exterior de climatització d\'alta eficiència A+++ amb suport antivibratori.',
      tags: ['Climatització', 'Aire Condicionat', 'Aerotèrmia', 'Estalvi Energètic', 'RITE', 'Bombes de Calor'],
      seccions: [
        {
          subtitol: '1. El repte del clima mediterrani: humitat costanera vs fred d\'interior',
          paragrafs: [
            'El comportament tèrmic dels habitatges a la nostra zona varia de forma notable entre la línia de costa (amb estius xafogosos i humitats superiors al 75%) i les zones d\'interior o prelitoral (amb hiverns de temperatures properes als 0°C).',
            'Per a la costa, la funció de deshumidificació eficient d\'un bon split inverter de classe A+++ és capaç de proporcionar confort tèrmic amb un consum inferior a 0,5 kW/h. En canvi, a l\'interior, l\'aerotèrmia reversible connectada a radiadors de baixa temperatura o terra radiant s\'ha consolidat com la millor alternativa per substituir el gasoil.'
          ],
          puntsClau: [
            'Optar sempre per equips amb gas refrigerant ecològic R-32, que ofereix major rendiment amb menys càrrega.',
            'Important mantenir la distància de seguretat entre unitat interior i exterior per evitar pèrdues de rendiment.',
            'Instal·lació de suports antivibratoris homologats per complir amb les ordenances municipals de soroll nocturn.'
          ]
        },
        {
          subtitol: '2. Manteniment preventiu: Per què netejar els filtres i revisar el circuit?',
          paragrafs: [
            'L\'acumulació de pols, pol·len i àcars als filtres d\'aire no només empitjora la qualitat de l\'aire respirat per a nens i persones al·lèrgiques, sinó que força el compressor a treballar un 25% més per aconseguir la mateixa temperatura.',
            'A més, un circuit que hagi perdut una petita fracció de gas refrigerant consumirà el doble d\'electricitat i corre el risc de cremar el compressor. Una revisió anual amb manòmetres i prova d\'estanquitat evita avaries que superen els 600€.'
          ],
          taulaPreus: [
            { concepte: 'Manteniment anual d\'split (neteja de filtres, desinfecció i comprovació de gas)', preuAproximat: '60€ - 95€', consell: 'Es recomana fer a la primavera abans de l\'arribada de les onades de calor.' },
            { concepte: 'Instal·lació d\'equip split 1x1 estàndard (fins a 4 metres de línia)', preuAproximat: '250€ - 380€ (sense màquina)', consell: 'Requereix instal·lador certificat amb carnet RITE per conservar la garantia del fabricant.' },
            { concepte: 'Instal·lació integral de sistema d\'Aerotèrmia per a habitatge unifamiliar', preuAproximat: '6.500€ - 11.000€', consell: 'Amortitzable en 4-6 anys gràcies a l\'estalvi mensual de calefacció i aigua calenta.' }
          ]
        }
      ]
    },
    {
      id: 3,
      slug: 'normativa-quadre-electric-butlletins-catalunya',
      titol: 'Normativa elèctrica i butlletins a Catalunya: Quan és obligatori el Butlletí Blau o Blanc (CIE/BRIE)?',
      subtitol: 'Tot el que has de saber per canviar de titular, contractar més potència, instal·lar plaques solars o carregar el cotxe elèctric.',
      resum: 'Guia clara de les exigències de les companyies elèctriques a la zona, el funcionament dels diferencials superimmunitzats i els costos de certificació.',
      categoria: 'Electricitat',
      tempsLectura: '5 min de lectura',
      data: '08 Octubre 2026',
      sectorZona: 'Sector Instal·lacions Elèctriques i Seguretat Industrial',
      categoriaServeiRecomanat: 'Electricitat',
      autor: {
        nom: 'Marc Soler',
        carrec: 'Instal·lador Elèctric Autoritzat en Baixa Tensió',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
      },
      imatge: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
      imatgePeu: 'Renovació completa d\'un quadre general de protecció amb diferencials superimmunitzats i descarregador de sobretensions.',
      tags: ['Electricitat', 'Butlletí Elèctric', 'BRIE', 'CIE', 'Sobretensions', 'Vehicle Elèctric'],
      seccions: [
        {
          subtitol: '1. Diferències entre el BRIE (Butlletí Blau) i el CIE (Butlletí Blanc)',
          paragrafs: [
            'A Catalunya regeix una normativa específica de la Direcció General d\'Energia i Mines que cal conèixer quan es vol donar d\'alta un subministrament elèctric o modificar el contracte existent:',
            '• **BRIE (Butlletí de Reconeixement d\'Instal·lacions Elèctriques)**: Conegut popularment com a *butlletí blau*. S\'utilitza per a modificacions senzilles, canvis de titular amb més de 20 anys d\'antiguitat o petits augments de potència que no superin la màxima admissible de la instal·lació.',
            '• **CIE (Certificat d\'Instal·lació Elèctrica en Baixa Tensió)**: Conegut com a *butlletí blanc*. És obligatori en altes noves, obres de reforma integral, augments de potència substancials o quan la instal·lació té defectes greus de seguretat que obliguen a refer el quadre.'
          ],
          destacatConsell: 'Només un instal·lador certificat i donat d\'alta al RASIC (Registre d\'Agents de la Seguretat Industrial de Catalunya) pot signar aquests butlletins. A AVISA tots els nostres electricistes tenen la certificació vigent.'
        },
        {
          subtitol: '2. Elements obligatoris en qualsevol quadre elèctric modern',
          paragrafs: [
            'Si el teu habitatge té més de 15 anys, és molt probable que no compleixi amb l\'actual Reglament Electrotècnic de Baixa Tensió (REBT). Els elements imprescindibles avui dia són:',
            '1. **IGA (Interruptor General Automàtic)** adaptat a la potència màxima del cable d\'escomesa.',
            '2. **Protector contra sobretensions permanents i transitòries**: Protegeix televisors, ordinadors, electrodomèstics i la placa de la caldera davant descàrregues de llamps o anomalies a la xarxa elèctrica de distribució.',
            '3. **Diferencials Superimmunitzats (Tipus A o F)**: Imprescindibles si a casa tens ordinadors, cotxe elèctric o rentadores amb motor inverter. Eviten que el diferencial salti sol sense motiu aparent a qualsevol hora.'
          ],
          taulaPreus: [
            { concepte: 'Tramitació de BRIE telemàtic a Canal Empresa', preuAproximat: '90€ - 150€', consell: 'Inclou revisió prèvia de seguretat i registre oficial en 24 hores.' },
            { concepte: 'Certificat CIE complet amb memòria tècnica de disseny', preuAproximat: '140€ - 220€', consell: 'Exigit per les companyies distribuïdores per a potències noves o canvis majors.' },
            { concepte: 'Renovació completa de quadre elèctric segons REBT', preuAproximat: '350€ - 650€', consell: 'Inclou quadre nou, automàtics de primeres marques (Schneider, Hager) i protecció de sobretensions.' }
          ]
        }
      ]
    },
    {
      id: 4,
      slug: 'aigua-dura-calc-mediterrani-descalcificadors-osmosi',
      titol: 'L\'aigua dura a les nostres comarques: Com protegir calderes, aixetes i canonades de la calç',
      subtitol: 'L\'impacte real de la duresa de l\'aigua a la teva factura i les millors solucions: descalcificadors volumètrics i osmosi sota l\'aigüera.',
      resum: 'Descobreix per què l\'aigua de la zona té índexs de duresa elevats i com allargar la vida útil dels teus electrodomèstics estalviant fins a 400€ anuals en reparacions.',
      categoria: 'Lampisteria',
      tempsLectura: '5 min de lectura',
      data: '05 Octubre 2026',
      sectorZona: 'Sector Fontaneria, Sanejament i Tractament d\'Aigua',
      categoriaServeiRecomanat: 'Lampisteria',
      autor: {
        nom: 'Pere Font',
        carrec: 'Mestre Lampista i Tècnic en Tractament d\'Aigua Domèstica',
        avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80'
      },
      imatge: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=1200&q=80',
      imatgePeu: 'Instal·lació neta d\'un equip de descalcificació per intercanvi iònic i sistema d\'osmosi compacta de 5 etapes.',
      tags: ['Lampisteria', 'Calç', 'Descalcificador', 'Osmosi', 'Calderes', 'Aixetes'],
      seccions: [
        {
          subtitol: '1. Per què la nostra aigua té tanta calç?',
          paragrafs: [
            'La composició geològica de les conques fluvials del litoral català fa que l\'aigua de xarxa contingui concentracions molt elevades de carbonat de calci i magnesi. En molts municipis de la zona es registren valors superiors a 35-50 ºfH (graus francesos), el que es cataloga oficialment com a **aigua molt dura**.',
            'L\'escalfament de l\'aigua a més de 55°C provoca la precipitació accelerada de la calç. Aquest sediment crea una capa aïllant al voltant de la resistència del termo elèctric o de l\'intercanviador de la caldera, forçant un consum de gas o llum fins a un 30% superior per escalfar el mateix volum d\'aigua.'
          ],
          puntsClau: [
            'La calç bloqueja cartutxos ceràmics d\'aixetes termostàtiques i atomitzadors.',
            'Fa malbé les resistències de rentadores i rentavaixelles en menys de 4 anys.',
            'Resta eficàcia als detergents i gels de dutxa, ressecant la pell i els cabells.'
          ]
        },
        {
          subtitol: '2. Solucions reals: Descalcificador volumètric vs Osmosi inversa',
          paragrafs: [
            'Per resoldre el problema cal distingir entre l\'aigua que utilitzem per a neteja i higiene (tota la casa) i l\'aigua que bevem i fem servir per cuinar:',
            '• **Descalcificador d\'intercanvi iònic**: S\'instal·la a l\'entrada general de l\'habitatge. Retira el calci i magnesi de tota la casa mitjançant resines regenerades amb sal pastilla. Protegeix el 100% de les canonades, sanitaris i calderes.',
            '• **Osmosi inversa de 5 etapes compacta**: S\'instal·la sota l\'aigüera de la cuina. Elimina el 98% de sals, clor, microplàstics i possibles impureses químiques, produint una aigua de mineralització dèbil perfecta per beure, estalviant la compra de centenars d\'ampolles de plàstic a l\'any.'
          ],
          taulaPreus: [
            { concepte: 'Instal·lació de descalcificador volumètric compacte de baix consum', preuAproximat: '750€ - 1.250€', consell: 'Amortitzable ràpidament per l\'allargament de vida de la caldera i l\'estalvi en productes de neteja.' },
            { concepte: 'Equip d\'osmosi inversa compacta amb aixeta de 1 o 3 vies', preuAproximat: '220€ - 390€', consell: 'Filtres de fàcil recanvi anual (cost recanvis: 35€/any).' },
            { concepte: 'Reparació urgent de fuita en canonada general o canvi de vàlvula de pas', preuAproximat: '80€ - 160€', consell: 'Servei prioritari d\'urgència a través dels professionals verificats d\'AVISA.' }
          ]
        }
      ]
    },
    {
      id: 5,
      slug: 'serralleria-seguretat-panys-antibumping-urgencies',
      titol: 'Seguretat a la llar: Panys antibumping, escuts cuirassats i consells per a primers i segons habitatges',
      subtitol: 'Com evitar les tècniques d\'obertura silenciosa més habituals i gestionar amb tranquil·litat qualsevol pèrdua de claus.',
      resum: 'Guia de seguretat residencial per a la protecció d\'habitatges habituals i segones residències davant les tècniques modernes de robatori silenciós.',
      categoria: 'Serralleria',
      tempsLectura: '4 min de lectura',
      data: '02 Octubre 2026',
      sectorZona: 'Sector Serralleria Tècnica i Seguretat Física',
      categoriaServeiRecomanat: 'Serralleria',
      autor: {
        nom: 'David Morales',
        carrec: 'Mestre Serraller Especialista en Seguretat Física Residencial',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80'
      },
      imatge: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1200&q=80',
      imatgePeu: 'Bombí d\'alta seguretat amb certificació antibumping, pont d\'acer reforçat i escut cuirassat magnètic.',
      tags: ['Serralleria', 'Seguretat', 'Antibumping', 'Obertura 24h', 'Portes Blindades', 'Bombins'],
      seccions: [
        {
          subtitol: '1. Com operen els lladres actualment? Bumping i impresioning',
          paragrafs: [
            'Més del 70% de les portes d\'habitatges a la nostra zona disposen encara de bombins convencionals de serreta o de punts antics. Aquests cilindres poden ser oberts en menys de 60 segons sense fer gens de soroll mitjançant les tècniques de *bumping* o *impresioning*, sense deixar cap marca visible a la porta ni trencar el marc.',
            'Aquesta circumstància és especialment crítica en blocs de pisos cèntrics i en zones de xalets o segones residències (molt freqüents al litoral i a les urbanitzacions de la rodalia) durant els mesos d\'hivern o caps de setmana.'
          ],
          puntsClau: [
            'Comprova que el teu bombí disposi de targeta de propietat per al duplicat de claus controlat.',
            'Un escut exterior cuirassat és imprescindible: impedeix l\'extracció mecànica amb mordassa o el trepat directe.',
            'Revisa sempre que el tancament de la porta tingui com a mínim 3 punts de bloqueig perimetral.'
          ]
        },
        {
          subtitol: '2. Preus transparents en serralleria d\'urgència: evita els abusos',
          paragrafs: [
            'El sector de la serralleria d\'urgències ha patit durant anys la presència d\'enganxines publicitàries i anuncis opacs amb tarifes desorbitades en casos d\'oblit de claus un diumenge o a la nit.',
            'A la plataforma AVISA tots els professionals estan plenament identificats amb preus pactats per endavant abans de desplaçar-se. Els serrallers d\'AVISA utilitzen tècniques de rossinyolament net sense danyar la fusta ni l\'estructura de la porta en cas d\'haver-te deixat les claus posades per dins.'
          ],
          taulaPreus: [
            { concepte: 'Obertura senzilla de porta de cop (claus a l\'interior, sense tancar amb clau)', preuAproximat: '65€ - 95€', consell: 'S\'obre de manera neta en menys de 10 minuts sense trencar el pany.' },
            { concepte: 'Substitució per bombí d\'alta seguretat antibumping, antirotura i antiganzúa', preuAproximat: '140€ - 240€', consell: 'Inclou 5 claus patentades amb targeta de seguretat exclusiva.' },
            { concepte: 'Instal·lació d\'escut de seguretat cuirassat amb tecnologia magnètica', preuAproximat: '110€ - 180€', consell: 'Impedeix que ningú pugui introduir cola, escuradents o eines al pany.' }
          ]
        }
      ]
    },
    {
      id: 6,
      slug: 'fusteria-parquets-portes-aillament-habitabilitat',
      titol: 'Aïllament acústic i tèrmic amb fusteria contemporània: Parquet laminat AC5 i portes massisses',
      subtitol: 'Com millorar el confort a la llar, aïllar del soroll del carrer i guanyar espai amb portes corredisses encastades.',
      resum: 'Descobreix com la bona fusteria transforma l\'aspecte estètic de l\'habitatge i millora l\'aïllament tèrmic i acústic reduint el soroll exterior.',
      categoria: 'Fusteria',
      tempsLectura: '4 min de lectura',
      data: '28 Setembre 2026',
      sectorZona: 'Sector Fusteria, Ebenisteria i Interiorisme',
      categoriaServeiRecomanat: 'Fusteria',
      autor: {
        nom: 'Joan Valls',
        carrec: 'Fuster Ebenista Artesà i Instal·lador de Sòls',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80'
      },
      imatge: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=1200&q=80',
      imatgePeu: 'Col·locació mil·limètrica de parquet laminat d\'alta resistència AC5 amb base aïllant d\'alta densitat.',
      tags: ['Fusteria', 'Parquet', 'Portes', 'Aïllament Acústic', 'Armaris a mida', 'Pladur'],
      seccions: [
        {
          subtitol: '1. El sòl i les portes com a barrera tèrmica i acústica',
          paragrafs: [
            'Molts habitatges amb paviment de terratzo antic transmeten fred als peus durant els mesos d\'hivern i amplifiquen el soroll de passes o cops cap al pis inferior. La col·locació d\'un bon sòl laminat flotant sobre una manta aïllant acústica de polietilè reticulat o cautxú redueix el soroll d\'impacte fins a 21 decibels.',
            'De la mateixa manera, substituir les velles portes buides d\'aglomerat per portes de pas massisses lacades amb junta de goma isofònica al marc redueix dràsticament el soroll procedent de zones comunes o entre habitacions, millorant el descans nocturn.'
          ],
          puntsClau: [
            'Classificació AC5 o AC6 per a resistència a rascades de mascotes i trànsit intens.',
            'Tractament hidroresistent a les juntes per a col·locació amb seguretat a cuines i banys.',
            'Guanya fins a 1,5 m² d\'espai útil a habitacions i banys instal·lant portes corredisses encastades en envans de pladur.'
          ]
        },
        {
          subtitol: '2. Estimació de preus a la nostra comarca',
          paragrafs: [
            'A AVISA treballem amb fusters i instal·ladors de sòls que ofereixen pressupostos clars de material i mà d\'obra amb garantia d\'ajust perfecte i rematades de sòcol:'
          ],
          taulaPreus: [
            { concepte: 'Substitució de 5 portes de pas massisses lacades en blanc amb manetes noves', preuAproximat: '950€ - 1.450€', consell: 'Inclou desmuntatge de portes antigues, ajust, tapajuntes i tancament silenciós.' },
            { concepte: 'Instal·lació de parquet laminat AC5 (per a pis de 70-90 m²)', preuAproximat: '1.600€ - 2.800€', consell: 'Inclou base aïllant, retall de marcs de portes i sòcol a joc.' },
            { concepte: 'Armari encastat a mida de terra a sostre amb distribució interior', preuAproximat: '1.200€ - 2.400€', consell: 'Maximitza l\'espai d\'emmagatzematge en racons difícils o sota escales.' }
          ]
        }
      ]
    }
  ];

  /**
   * Retorna tots els articles disponibles al blog.
   */
  getArticles(): Article[] {
    return this.articles;
  }

  /**
   * Cerca un article pel seu identificador únic.
   */
  getArticleById(id: number | string): Article | undefined {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    return this.articles.find(a => a.id === numericId);
  }

  /**
   * Retorna articles recomanats excloent l'article actual.
   */
  getArticlesRelacionats(currentId: number | string, limit: number = 3): Article[] {
    const numericId = idCurrent(currentId);
    return this.articles
      .filter(a => a.id !== numericId)
      .slice(0, limit);
  }
}

function idCurrent(val: number | string): number {
  return typeof val === 'string' ? parseInt(val, 10) : val;
}
