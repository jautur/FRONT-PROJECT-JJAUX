import { Injectable } from '@angular/core';
import { Article } from '../models/article.model';

/**
 * Servei per a la gestió d'articles del Blog d'AVISA.
 * Analitza els sectors professionals clau de les comarques del sud de la província de València
 * (La Costera, La Vall d'Albaida, La Safor, La Ribera Alta i La Ribera Baixa)
 * i ofereix consells tècnics, preus orientatius i bones pràctiques locals.
 */
@Injectable({
  providedIn: 'root'
})
export class ArticleService {

  private readonly articles: Article[] = [
    {
      id: 1,
      slug: 'guia-reformes-cases-poble-costera-vall-albaida-2026',
      titol: 'Quant costa reformar una casa de poble o un pis a les comarques del sud de València? Guia de pressupostos 2026',
      subtitol: 'Desglossament de costos, elecció de materials resistents a la humitat i permisos municipals a Xàtiva, Ontinyent, Gandia i Alzira.',
      resum: 'Desglossament pràctic de mà d\'obra comarcal, llicències d\'obra menor, renovació d\'instal·lacions en cases tradicionals de poble i acabats recomanats a la Costera, la Vall d\'Albaida, la Safor i la Ribera.',
      categoria: 'Reformes i Obres',
      tempsLectura: '6 min de lectura',
      data: '14 Octubre 2026',
      sectorZona: 'Sector Construcció i Reformes (La Costera, La Vall d\'Albaida, La Safor i La Ribera)',
      categoriaServeiRecomanat: 'Reformes i Obres',
      autor: {
        nom: 'Elena Pons',
        carrec: 'Arquitecta Tècnica i Aparelladora Col·legiada',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80'
      },
      imatge: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80',
      imatgePeu: 'Reforma d\'un bany amb plat de dutxa de resina mineral antilliscant i enrajolat ceràmic en una casa de poble tradicional.',
      tags: ['Reformes', 'Cases de poble', 'Bany', 'Cuina', 'Pressupostos', 'Llicència d\'obra', 'Xàtiva', 'Ontinyent'],
      seccions: [
        {
          subtitol: '1. Diagnòstic del parc d\'habitatges a les nostres comarques',
          paragrafs: [
            'A les comarques de la Costera, la Vall d\'Albaida, la Safor i la Ribera, trobem una gran concentració de **cases tradicionals de poble** de dues o tres altures (amb parets mestres de tàpia o maó massís, bigues de fusta i corral o pati interior), juntament amb blocs de pisos construïts entre 1970 i 2000 a ciutats com Xàtiva, Ontinyent, Alzira o Gandia.',
            'En aquests immobles és molt habitual trobar canonades antigues de plom o ferro galvanitzat completament calcificades, a més de banyeres encastades d\'obra que dificulten l\'accessibilitat de la gent gran. La rehabilitació d\'un bany o una cuina no només revalora la vivenda més d\'un 15% al mercat comarcal, sinó que és el moment clau per sanejar les instal·lacions ocultes darrere de les parets.'
          ],
          puntsClau: [
            'Substituir canonades velles per tubs multicapa o polietilè reticulat (PEX) immunes a la calç.',
            'Substitució de la banyera per plat de dutxa extraplà de resina mineral classe 3 antilliscant.',
            'Reforç d\'envans amb cartró-guix hidròfug (pladur verd) per protegir de la humitat per capil·laritat típica de les plantes baixes.'
          ]
        },
        {
          subtitol: '2. Estimació de preus mitjans a la zona per a aquest 2026',
          paragrafs: [
            'El cost d\'una reforma a les nostres comarques és més competitiu que a la capital provincial gràcies a la xarxa d\'oficis autònoms locals. Presentem les tarifes mitjanes registrades a AVISA per a la zona sud de València:'
          ],
          taulaPreus: [
            { concepte: 'Canvi exprés de banyera per plat de dutxa de resina (amb enrajolat parcial)', preuAproximat: '790€ - 1.250€', consell: 'S\'executa normalment en 24-48 hores per professionals de la comarca sense necessitat de llicència complexa.' },
            { concepte: 'Reforma integral de bany estàndard (fins a 5 m²)', preuAproximat: '2.100€ - 3.600€', consell: 'Inclou demolició, fontaneria nova, plat de resina, mampara de vidre temperat, sanitaris i ceràmica.' },
            { concepte: 'Reforma integral de cuina mitjana (fins a 9 m²)', preuAproximat: '4.500€ - 8.800€', consell: 'Inclou fontaneria, punts elèctrics, bancada de silestone o porcellànic i mobles a mida.' },
            { concepte: 'Adequació de pati o corral interior amb paviment antilliscant', preuAproximat: '1.200€ - 2.400€', consell: 'Molt sol·licitat en cases de poble de la Costera i la Vall per aprofitar l\'espai exterior a l\'estiu.' }
          ],
          destacatConsell: 'A AVISA recomanem sol·licitar sempre pressupost a professionals locals de la teva comarca. Això estalvia despeses de desplaçament i assegura una resposta immediata davant qualsevol ajust posterior.'
        },
        {
          subtitol: '3. Tràmits municipals als ajuntaments de la zona: Cal llicència d\'obra?',
          paragrafs: [
            'Als ajuntaments de Xàtiva, Ontinyent, Gandia, Alzira, Canals o Oliva, les reformes interiors de banys i cuines sense afecció estructural es tramiten mitjançant una **Declaració Responsable d\'Obra Menor** a través de la seu electrònica municipal.',
            'Aquest tràmit et permet començar la feina des del mateix moment en què presentes la sol·licitud i pagues l\'impost sobre construccions (ICIO), que sol rondar entre el 2% i el 4% del pressupost d\'execució material. Si cal col·locar un contenidor de runes al carrer, el paleta gestionarà la reserva de via pública amb la Policia Local.'
          ]
        }
      ]
    },
    {
      id: 2,
      slug: 'climatitzacio-calor-extrema-costera-humitat-safor-aerotermia',
      titol: 'Climatització davant la calor extrema de la Costera i la humitat de la Safor: Guia d\'estalvi energètic',
      subtitol: 'Com suportar els 40°C d\'estiu a Xàtiva o la xafogor de Gandia sense que la factura de la llum es dispare amb bombes de calor i aerotèrmia.',
      resum: 'Consells d\'especialistes homologats per a municipis amb màximes extremes com Xàtiva, Canals o Alzira i ambient salí a Gandia o Oliva: filtres, gas ecològic R-32 i aïllament tèrmic eficient.',
      categoria: 'Climatització',
      tempsLectura: '5 min de lectura',
      data: '12 Octubre 2026',
      sectorZona: 'Sector Climatització i Eficiència Energètica (Costera, Vall d\'Albaida, Safor i Ribera)',
      categoriaServeiRecomanat: 'Climatització',
      autor: {
        nom: 'Anna Prat',
        carrec: 'Enginyera Tècnica i Instal·ladora Frigorista Homologada RITE',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80'
      },
      imatge: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=80',
      imatgePeu: 'Muntatge d\'equip split inverter A+++ amb tractament anticorrosió Gold Fin per a zones costaneres i d\'interior.',
      tags: ['Climatització', 'Aire Condicionat', 'Calor Extrema', 'Xàtiva', 'Gandia', 'Aerotèrmia', 'RITE'],
      seccions: [
        {
          subtitol: '1. El repte del clima al sud de València: calor canicular vs humitat marina',
          paragrafs: [
            'El comportament tèrmic a les nostres comarques és un dels més exigents de tota la península. A la Costera i la Ribera (amb **Xàtiva com a referent de màximes que superen amb freqüència els 40°C-42°C a l\'estiu**), els aparells han de funcionar a màxim rendiment durant onades de calor sostingudes amb nits tropicals per damunt dels 25°C.',
            'D\'altra banda, a la Safor (Gandia, Oliva, Tavernes), l\'enemic principal és la **humitat relativa superior al 80%** combinada amb el salnitre marí, que pot rovellar les bateries d\'intercanvi de la unitat exterior en menys de 3 anys si no compten amb protecció anticorrosió *Gold Fin* o *Blue Fin*. A la Vall d\'Albaida (Ontinyent, Bocairent), en canvi, els hiverns són notablement més freds, fent que les bombes de calor o l\'aerotèrmia reversible siguin la millor opció tot l\'any.'
          ],
          puntsClau: [
            'Escollir màquines amb ràtio d\'eficiència estacional SEER superior a 8,5 (classe A+++) per reduir fins a un 40% el consum elèctric a l\'estiu.',
            'Protecció anticorrosiva a la unitat exterior en municipis de la Safor i la costa de la Ribera.',
            'Instal·lació de suports antivibratoris homologats per evitar que el compressor ressoni als murs de càrrega tradicionals de les cases de poble.'
          ]
        },
        {
          subtitol: '2. Manteniment preventiu abans de l\'arribada de les onades de calor',
          paragrafs: [
            'Esperar a la primera onada de calor de juny per engegar l\'aire condicionat és un error freqüent. Els filtres bruts i una possible pèrdua de pressió de gas fan que el compressor treballe forçat, consumint el doble i podent avariar-se just quan els tècnics estan més saturats de faena.',
            'Una revisió anual a la primavera amb neteja antibacteriana i mesurament de pressions per un tècnic amb carnet RITE garanteix un funcionament silenciós i eficient durant tot l\'estiu.'
          ],
          taulaPreus: [
            { concepte: 'Manteniment complet d\'split (neteja de filtres, desinfecció d\'evaporador i comprovació de gas)', preuAproximat: '55€ - 85€', consell: 'Recomanat entre març i maig abans de l\'inici de les altes temperatures a la Costera i Ribera.' },
            { concepte: 'Instal·lació bàsica d\'equip split 1x1 (fins a 4 metres de línia frigorífica)', preuAproximat: '220€ - 350€ (mà d\'obra)', consell: 'Requereix instal·lador certificat per conservar la garantia oficial del fabricant.' },
            { concepte: 'Sistema d\'Aerotèrmia per a casa de poble o xalet unifamiliar', preuAproximat: '5.800€ - 9.800€', consell: 'Molt demandat a Ontinyent, l\'Olleria o xalets de Bixquert per substituir calderes de gasoil o biomassa.' }
          ]
        }
      ]
    },
    {
      id: 3,
      slug: 'normativa-quadre-electric-butlletins-comunitat-valenciana',
      titol: 'Butlletí elèctric (CIE) a la Comunitat Valenciana: Quan és obligatori i com protegir la teva llar davant tempestes',
      subtitol: 'Tot el que has de saber per donar d\'alta la llum amb Iberdrola (i-DE), ampliar potència o protegir la instal·lació davant la DANA i tempestes d\'estiu.',
      resum: 'Guia clara de les exigències de la Conselleria d\'Indústria per al Certificat d\'Instal·lació Elèctrica (CIE), diferencials superimmunitzats i protecció contra llamps a la zona sud de València.',
      categoria: 'Electricitat',
      tempsLectura: '5 min de lectura',
      data: '08 Octubre 2026',
      sectorZona: 'Sector Instal·lacions Elèctriques i Seguretat Industrial (Comunitat Valenciana)',
      categoriaServeiRecomanat: 'Electricitat',
      autor: {
        nom: 'Marc Soler',
        carrec: 'Instal·lador Elèctric Autoritzat en Baixa Tensió',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
      },
      imatge: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
      imatgePeu: 'Renovació d\'un quadre general de distribució elèctrica amb protector de sobretensions i diferencials superimmunitzats.',
      tags: ['Electricitat', 'Butlletí Elèctric', 'CIE', 'Sobretensions', 'DANA', 'Iberdrola', 'Comunitat Valenciana'],
      seccions: [
        {
          subtitol: '1. Quan et demanarà la companyia distribuïdora (i-DE) el CIE?',
          paragrafs: [
            'A la Comunitat Valenciana, la Direcció General d\'Energia i Mines de la Generalitat regula l\'emissió del **CIE (Certificat d\'Instal·lació Elèctrica en Baixa Tensió)**, el document oficial que acredita que la instal·lació és segura i compleix amb el Reglament Electrotècnic (REBT).',
            'La distribuïdora elèctrica habitual a la nostra zona (i-DE / Grup Iberdrola) exigirà aquest certificat obligatòriament en els següents supòsits:',
            '• **Altes noves o reactivació de comptadors** que porten més de 2 mesos donats de baixa.',
            '• **Canvis de titularitat o modificacions de contracte** en immobles amb instal·lacions de més de 20 anys d\'antiguitat.',
            '• **Augment de potència contractada** que supere la potència màxima admissible indicada a l\'últim butlletí.'
          ],
          destacatConsell: 'Només un instal·lador elèctric autoritzat i donat d\'alta al registre d\'Indústria de la Generalitat Valenciana (associat a entitats com ASELEC o FEMEVAL) pot signar i tramitar telemàticament el CIE oficial.'
        },
        {
          subtitol: '2. Sobretensions per tempestes d\'estiu i DANA: L\'element que salva els teus electrodomèstics',
          paragrafs: [
            'A les comarques del sud de València són freqüents les tempestes elèctriques violentes a l\'estiu i els episodis de gota freda / DANA a la tardor. Aquests fenòmens meteorològics generen pics sobtats de tensió a la xarxa que cremen plaques electròniques d\'aires condicionats, televisors, ordinadors i calderes.',
            'La instal·lació d\'un **descarregador de sobretensions permanents i transitòries** al quadre general de la vivenda és la millor inversió per protegir tot l\'equipament domèstic.'
          ],
          taulaPreus: [
            { concepte: 'Tramitació telemàtica de CIE (Butlletí Elèctric) per a habitatge', preuAproximat: '110€ - 170€', consell: 'Inclou revisió prèvia de seguretat a domicili i registre oficial a la Generalitat en 24-48h.' },
            { concepte: 'Instal·lació de protector combinat de sobretensions transitòries i permanents', preuAproximat: '120€ - 190€', consell: 'Imprescindible per evitar danys per llamps o oscil·lacions de tensió a la xarxa de distribució.' },
            { concepte: 'Renovació completa de quadre elèctric segons normativa REBT vigent', preuAproximat: '320€ - 580€', consell: 'Inclou caixa estanca o encastada, IGA, diferencials i nous circuits independents.' }
          ]
        }
      ]
    },
    {
      id: 4,
      slug: 'aigua-dura-calc-xuquer-serpis-descalcificadors-osmosi',
      titol: 'L\'aigua dura del Xúquer, Serpis i Clariano: Com evitar que la calç arruïne calderes i aixetes a la teva comarca',
      subtitol: 'Per què a municipis com Alzira, Xàtiva, Ontinyent o Gandia l\'aigua té més de 40 ºfH i quines solucions reals allarguen la vida dels electrodomèstics.',
      resum: 'Descobreix per què l\'aigua de les conques fluvials del sud de València té índexs de calç molt elevats i com protegir la teva vivenda estalviant fins a 400€ a l\'any en reparacions.',
      categoria: 'Lampisteria',
      tempsLectura: '5 min de lectura',
      data: '05 Octubre 2026',
      sectorZona: 'Sector Fontaneria, Sanejament i Tractament d\'Aigua (Ribera, Costera, Vall i Safor)',
      categoriaServeiRecomanat: 'Lampisteria',
      autor: {
        nom: 'Pere Font',
        carrec: 'Mestre Lampista i Tècnic en Tractament d\'Aigua Domèstica',
        avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80'
      },
      imatge: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=1200&q=80',
      imatgePeu: 'Descalcificador volumètric automàtic i osmosi inversa sota aigüera instal·lats per aigua de xarxa amb alta concentració calcària.',
      tags: ['Lampisteria', 'Calç', 'Xúquer', 'Descalcificador', 'Osmosi', 'Termos', 'Xàtiva', 'Alzira', 'Gandia'],
      seccions: [
        {
          subtitol: '1. Per què l\'aigua té tanta calç a les nostres comarques?',
          paragrafs: [
            'La composició geològica calcària dels aqüífers i les conques dels rius Xúquer, Clariano i Serpis fa que l\'aigua de consum públic a la Ribera, la Costera, la Vall d\'Albaida i la Safor presente concentracions de duresa molt elevades, sovint **per damunt dels 40-55 ºfH (graus francesos)**, considerada aigua extremadament dura.',
            'Quan l\'aigua s\'escalfa a més de 50°C al termo elèctric o a la caldera, el carbonat de calci precipita ràpidament formant una capa de pedra blanca. Aquest sediment embolcalla les resistències elèctriques i els intercanviadors, aïllant la calor i obligant a consumir fins a un 30% més de llum o gas per obtindre la mateixa temperatura.'
          ],
          puntsClau: [
            'A les nostres comarques, els termos elèctrics sense manteniment poden cremar la resistència en menys de 3 o 4 anys.',
            'La calç bloqueja els atomitzadors d\'aixetes i mampares de dutxa, deixant taques blanques impossibles de llevar.',
            'Resta eficàcia a detergents i sabons de rentadora, fent que calga utilitzar més quantitat de producte.'
          ]
        },
        {
          subtitol: '2. Solucions eficaces: Descalcificador volumètric per a tota la casa vs Osmosi inversa a la cuina',
          paragrafs: [
            'Per combatre la calç de forma duradora cal combinar dues solucions complementàries:',
            '• **Descalcificador volumètric de baix consum de sal**: S\'instal·la a l\'escomesa general de la vivenda o unifamiliar. Protegeix el 100% de les canonades, calderes, rentadores i sanitaris eliminant els ions de calci i magnesi.',
            '• **Equip d\'osmosi inversa de 5 etapes amb remineralitzador**: S\'instal·la sota l\'aigüera de la cuina. Elimina sals, clor i impureses, proporcionant una aigua de sabor excel·lent per beure i cuinar, evitant carregar garrafes de plàstic del supermercat.'
          ],
          taulaPreus: [
            { concepte: 'Instal·lació de descalcificador volumètric compacte per a habitatge', preuAproximat: '690€ - 1.150€', consell: 'Allarga la vida útil de tots els electrodomèstics d\'aigua i redueix el consum energètic.' },
            { concepte: 'Instal·lació d\'equip d\'osmosi inversa compacta amb aixeta de servei', preuAproximat: '190€ - 350€', consell: 'Filtres de fàcil substitució anual amb un cost de recanvis inferior a 35€/any.' },
            { concepte: 'Canvi d\'ànode de magnesi i neteja de calç en termo elèctric', preuAproximat: '75€ - 130€', consell: 'Recomanat cada 2 anys a la nostra comarca per evitar la perforació de la cuba.' }
          ]
        }
      ]
    },
    {
      id: 5,
      slug: 'serralleria-seguretat-xalets-bixquert-garrofera-apartaments',
      titol: 'Seguretat en xalets, casetes de camp i apartaments: Panys antibumping a Bixquert, la Garrofera o la platja de Gandia',
      subtitol: 'Com blindar segones residències i vivendes aïllades contra l\'obertura silenciosa i consells de serralleria d\'urgència sense intermediaris abusius.',
      resum: 'Guia de seguretat residencial per a casetes de camp i xalets a urbanitzacions de Xàtiva, Alzira, Ontinyent o la platja de Gandia amb bombins d\'alta gamma i escuts cuirassats.',
      categoria: 'Serralleria',
      tempsLectura: '4 min de lectura',
      data: '02 Octubre 2026',
      sectorZona: 'Sector Serralleria Tècnica i Seguretat Residencial (Sud de València)',
      categoriaServeiRecomanat: 'Serralleria',
      autor: {
        nom: 'David Morales',
        carrec: 'Mestre Serraller Especialista en Seguretat Física Residencial',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80'
      },
      imatge: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1200&q=80',
      imatgePeu: 'Bombí antibumping i antiextracció amb pont reforçat d\'acer i escut cuirassat magnètic protector.',
      tags: ['Serralleria', 'Seguretat', 'Antibumping', 'Xalets', 'Bixquert', 'La Garrofera', 'Gandia', 'Urgències 24h'],
      seccions: [
        {
          subtitol: '1. El punt feble de xalets i segones residències a les nostres comarques',
          paragrafs: [
            'A les zones d\'urbanitzacions i casetes de camp com **Bixquert (Xàtiva), la Garrofera o la Murta (Alzira), Santa Anna o l\'Ombria (Ontinyent)**, així com als apartaments de platja a **Gandia, Cullera, Tavernes o Oliva**, moltes vivendes queden buides durant els dies de setmana o durant la temporada d\'hivern.',
            'Més del 65% d\'aquests habitatges tenen portes amb panys convencionals de serreta o cilindres bàsics instal·lats fa dècades. Els lladres utilitzen tècniques com el *bumping* o el *rossinyolament d\'impressió* per obrir en menys d\'un minut sense fer soroll ni trencar el marc de la porta.'
          ],
          puntsClau: [
            'Instal·lar bombins amb protecció patentada antibumping, antirotura i passadors d\'acer trempat anti-trepat.',
            'Afegir un escut cuirassat exterior que impedisca l\'extracció directa del cilindre amb tenalles o mordassa.',
            'Revisar tancaments de reixes de finestres i portes de garatge a vivendes aïllades de camp.'
          ]
        },
        {
          subtitol: '2. Serrallers d\'urgència locals: com evitar abusos i intermediaris',
          paragrafs: [
            'Davant una pèrdua de claus o un pany bloquejat, és molt habitual buscar a Internet i caure en centraletes foranes que envien tècnics subcontractats des de València ciutat cobrant desplaçaments abusius que superen fàcilment els 300€.',
            'A AVISA connectes exclusivament amb **serrallers professionals de la teva comarca** amb preus clars comunicats per avançat. Utilitzen tècniques d\'obertura neta que no fan malbé la fusta de la porta si les claus s\'han quedat posades per dins.'
          ],
          taulaPreus: [
            { concepte: 'Obertura d\'urgència de porta de cop (claus oblidades per dins, sense volta de clau)', preuAproximat: '60€ - 90€', consell: 'S\'executa en pocs minuts per rossinyolament sense danyar la porta ni el bombí.' },
            { concepte: 'Instal·lació de bombí d\'alta seguretat antibumping amb targeta de propietat', preuAproximat: '135€ - 220€', consell: 'Inclou 5 claus incopiables sense la targeta de seguretat acreditativa.' },
            { concepte: 'Muntatge d\'escut cuirassat protector magnètic d\'alta resistència', preuAproximat: '100€ - 170€', consell: 'Impedeix l\'accés directe a la ranura del pany i evita l\'ús d\'eines de torsió mecànica.' }
          ]
        }
      ]
    },
    {
      id: 6,
      slug: 'fusteria-sols-aillament-cases-poble-costera-vall',
      titol: 'Fusteria i aïllament en cases de poble: Com guanyar confort tèrmic amb parquet AC5 i portes massisses',
      subtitol: 'Eliminar el fred del terra de terratzo antic i aïllar del soroll del carrer a les vivendes històriques d\'Ontinyent, Xàtiva o Bocairent.',
      resum: 'Descobreix com la fusteria a mida i els sòls laminats d\'alta resistència milloren l\'aïllament tèrmic i acústic en habitatges tradicionals de les comarques d\'interior.',
      categoria: 'Fusteria',
      tempsLectura: '4 min de lectura',
      data: '28 Setembre 2026',
      sectorZona: 'Sector Fusteria Tradicional, Ebenisteria i Interiorisme (Costera i Vall d\'Albaida)',
      categoriaServeiRecomanat: 'Fusteria',
      autor: {
        nom: 'Joan Valls',
        carrec: 'Fuster Ebenista Artesà i Instal·lador de Sòls',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80'
      },
      imatge: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=1200&q=80',
      imatgePeu: 'Col·locació de parquet laminat AC5 sobre manta aïllant antihumitat en una casa de poble restaurada.',
      tags: ['Fusteria', 'Parquet AC5', 'Portes massisses', 'Cases de poble', 'Ontinyent', 'Xàtiva', 'Aïllament'],
      seccions: [
        {
          subtitol: '1. El sòl com a barrera davant el fred a les cases tradicionals',
          paragrafs: [
            'A les vivendes històriques d\'Ontinyent, Bocairent, Albaida o el nucli antic de Xàtiva, els terres originals solen ser de terratzo o rajola antiga assentada directament sobre el terreny o forjats antics sense cambra d\'aire aïllada. Això transmet una sensació constant de fred als peus durant els mesos d\'hivern.',
            'La instal·lació d\'un **sòl laminat d\'alta densitat (classificació AC5 o AC6)** sobre una manta aïllant de polietilè reticulat o cautxú amb barrera de vapor elimina la humitat per capil·laritat, aporta calidesa immediata a la trepitjada i redueix el soroll d\'impacte fins a 20 decibels.'
          ],
          puntsClau: [
            'Classificació AC5 d\'alta resistència a rascades i tractament hidròfug a les ranures per a cuines i zones de pas.',
            'Portes massisses lacades amb junta perimetral de goma isofònica per frenar corrents d\'aire entre habitacions.',
            'Aprofitament dels sostres alts típics valencians per dissenyar armaris encastats de terra a sostre.'
          ]
        },
        {
          subtitol: '2. Estimació de preus amb fusters de la zona',
          paragrafs: [
            'Els fusters de la xarxa AVISA ofereixen pressupostos clars de material i col·locació mil·limètrica amb retall de marcs de portes i sòcols integrats:'
          ],
          taulaPreus: [
            { concepte: 'Instal·lació de parquet laminat AC5 amb manta aïllant (pis de 70-90 m²)', preuAproximat: '1.450€ - 2.500€', consell: 'Inclou base antihumitat, rebaix de portes i col·locació de sòcol perimetral lacat.' },
            { concepte: 'Substitució de 5 portes de pas per portes massisses lacades amb manetes', preuAproximat: '890€ - 1.380€', consell: 'Aïllament acústic i tancament magnètic suau molt superior a les antigues portes d\'aglomerat buit.' },
            { concepte: 'Armari encastat a mida sota escala o aprofitant racons de sostre alt', preuAproximat: '1.100€ - 2.200€', consell: 'Adaptació artesanal a mida que multiplica l\'espai útil d\'emmagatzematge en cases de poble.' }
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
