import { Article } from '../models/article.model';

/**
 * Articles del Blog d'AVISA en Valencià (idioma original).
 */
export const ARTICLES_VA: Article[] = [
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
 * Artículos del Blog de AVISA traducidos al Español (ES).
 */
export const ARTICLES_ES: Article[] = [
  {
    ...ARTICLES_VA[0],
    titol: '¿Cuánto cuesta reformar una casa de pueblo o un piso en el sur de Valencia? Guía de presupuestos 2026',
    subtitol: 'Desglose de costes, elección de materiales resistentes a la humedad y permisos municipales en Xàtiva, Ontinyent, Gandia y Alzira.',
    resum: 'Desglose práctico de mano de obra comarcal, licencias de obra menor, renovación de instalaciones en casas tradicionales de pueblo y acabados recomendados en la Costera, Vall d\'Albaida, Safor y Ribera.',
    categoria: 'Reformas y Obras',
    tempsLectura: '6 min de lectura',
    data: '14 Octubre 2026',
    sectorZona: 'Sector Construcción y Reformas (La Costera, Vall d\'Albaida, Safor y Ribera)',
    categoriaServeiRecomanat: 'Reformas y Obras',
    autor: {
      nom: 'Elena Pons',
      carrec: 'Arquitecta Técnica y Aparejadora Colegiada',
      avatar: ARTICLES_VA[0].autor.avatar
    },
    imatgePeu: 'Reforma de un baño con plato de ducha de resina mineral antideslizante y alicatado cerámico en casa de pueblo.',
    tags: ['Reformas', 'Casas de pueblo', 'Baño', 'Cocina', 'Presupuestos', 'Licencia de obra', 'Xàtiva', 'Ontinyent'],
    seccions: [
      {
        subtitol: '1. Diagnóstico del parque de viviendas en nuestras comarcas',
        paragrafs: [
          'En las comarcas de la Costera, Vall d\'Albaida, Safor y Ribera encontramos una gran concentración de **casas tradicionales de pueblo** de dos o tres alturas (con muros maestros de tapial o ladrillo macizo, vigas de madera y patio interior), junto con bloques de pisos construidos entre 1970 y 2000 en ciudades como Xàtiva, Ontinyent, Alzira o Gandia.',
          'En estos inmuebles es habitual encontrar tuberías antiguas de plomo o hierro galvanizado calcificadas, además de bañeras encastradas de obra. La rehabilitación no solo revaloriza la vivienda más de un 15%, sino que sanea las instalaciones ocultas.'
        ],
        puntsClau: [
          'Sustituir tuberías viejas por tubos multicapa o polietileno reticulado (PEX) inmunes a la cal.',
          'Sustitución de bañera por plato de ducha extraplano de resina mineral clase 3 antideslizante.',
          'Refuerzo con cartón-yeso hidrófugo (pladur verde) para proteger de la humedad por capilaridad.'
        ]
      },
      {
        subtitol: '2. Estimación de precios medios en la zona para este 2026',
        paragrafs: [
          'El coste de una reforma en nuestras comarcas es más competitivo que en la capital provincial gracias a la red de oficios autónomos locales:'
        ],
        taulaPreus: [
          { concepte: 'Cambio exprés de bañera por plato de ducha de resina', preuAproximat: '790€ - 1.250€', consell: 'Se ejecuta en 24-48 horas por profesionales de la comarca sin licencia compleja.' },
          { concepte: 'Reforma integral de baño estándar (hasta 5 m²)', preuAproximat: '2.100€ - 3.600€', consell: 'Incluye demolición, fontanería nueva, plato de resina, mampara, sanitarios y cerámica.' },
          { concepte: 'Reforma integral de cocina media (hasta 9 m²)', preuAproximat: '4.500€ - 8.800€', consell: 'Incluye fontanería, puntos eléctricos, encimera de silestone o porcelánico y muebles a medida.' },
          { concepte: 'Adecuación de patio o corral interior con pavimento antideslizante', preuAproximat: '1.200€ - 2.400€', consell: 'Muy solicitado en casas de pueblo de la Costera y la Vall para disfrutar del exterior.' }
        ],
        destacatConsell: 'En AVISA recomendamos solicitar siempre presupuesto a profesionales locales de tu comarca. Ahorra desplazamientos y garantiza atención rápida.'
      },
      {
        subtitol: '3. Trámites municipales: ¿Se necesita licencia de obra?',
        paragrafs: [
          'En los ayuntamientos de Xàtiva, Ontinyent, Gandia, Alzira, Canals u Oliva, las reformas interiores de baños y cocinas sin afección estructural se tramitan mediante **Declaración Responsable de Obra Menor** telemática.',
          'Permite comenzar el trabajo desde el mismo momento de presentación y pago del ICIO (2%-4% del presupuesto).'
        ]
      }
    ]
  },
  {
    ...ARTICLES_VA[1],
    titol: 'Climatización ante el calor extremo de la Costera y la humedad de la Safor: Guía de ahorro',
    subtitol: 'Cómo soportar los 40°C de verano en Xàtiva o el bochorno de Gandia sin que la factura de la luz se dispare con bombas de calor y aerotermia.',
    resum: 'Consejos de especialistas homologados para municipios con máximas extremas como Xàtiva, Canals o Alzira y ambiente salino en Gandia u Oliva: filtros, gas R-32 y aislamiento térmico.',
    categoria: 'Climatización',
    tempsLectura: '5 min de lectura',
    data: '12 Octubre 2026',
    sectorZona: 'Sector Climatización y Eficiencia Energética (Costera, Vall d\'Albaida, Safor y Ribera)',
    categoriaServeiRecomanat: 'Climatització',
    autor: {
      nom: 'Anna Prat',
      carrec: 'Ingeniera Técnica e Instaladora Frigorista Homologada RITE',
      avatar: ARTICLES_VA[1].autor.avatar
    },
    imatgePeu: 'Montaje de equipo split inverter A+++ con tratamiento anticorrosión Gold Fin.',
    tags: ['Climatización', 'Aire Acondicionado', 'Calor Extremo', 'Xàtiva', 'Gandia', 'Aerotermia', 'RITE'],
    seccions: [
      {
        subtitol: '1. El reto del clima al sur de Valencia: calor canicular vs humedad marina',
        paragrafs: [
          'En la Costera y la Ribera (**Xàtiva supera habitualmente los 40°C-42°C en verano**), los equipos funcionan a máximo rendimiento durante olas de calor sostenidas.',
          'En la Safor (Gandia, Oliva), la humedad superior al 80% y el salitre oxidan condensadoras sin protección *Gold Fin*. En la Vall d\'Albaida, los inviernos fríos hacen ideal la bomba de calor reversible.'
        ],
        puntsClau: [
          'Elegir equipos con SEER superior a 8,5 (clase A+++) para reducir hasta un 40% el consumo en verano.',
          'Protección anticorrosiva en la unidad exterior en zonas costeras.',
          'Instalación de soportes antivibratorios homologados para evitar ruidos en muros de carga.'
        ]
      },
      {
        subtitol: '2. Mantenimiento preventivo antes de las olas de calor',
        paragrafs: [
          'Esperar a la primera ola de calor de junio para encender el aire es un error. Filtros sucios y fugas de gas duplican el consumo y provocan averías.',
          'Una revisión en primavera con desinfección y medición de presiones por un técnico RITE asegura rendimiento óptimo.'
        ],
        taulaPreus: [
          { concepte: 'Mantenimiento completo de split (limpieza, desinfección y gas)', preuAproximat: '55€ - 85€', consell: 'Recomendado entre marzo y mayo antes de las altas temperaturas.' },
          { concepte: 'Instalación básica de equipo split 1x1 (hasta 4 m de línea frigorífica)', preuAproximat: '220€ - 350€', consell: 'Requiere instalador certificado para conservar la garantía oficial.' },
          { concepte: 'Sistema de Aerotermia para casa de pueblo o chalet', preuAproximat: '5.800€ - 9.800€', consell: 'Muy demandado para sustituir calderas de gasoil o biomasa.' }
        ]
      }
    ]
  },
  {
    ...ARTICLES_VA[2],
    titol: 'Boletín eléctrico (CIE) en la Comunidad Valenciana: Cuándo es obligatorio y cómo proteger tu hogar',
    subtitol: 'Todo lo que debes saber para dar de alta la luz con Iberdrola (i-DE), ampliar potencia o proteger la instalación de tormentas y DANA.',
    resum: 'Guía clara de exigencias de la Conselleria de Industria para el Certificado de Instalación Eléctrica (CIE), diferenciales superinmunizados y protección contra rayos.',
    categoria: 'Electricidad',
    tempsLectura: '5 min de lectura',
    data: '08 Octubre 2026',
    sectorZona: 'Sector Instalaciones Eléctricas y Seguridad Industrial (Comunidad Valenciana)',
    categoriaServeiRecomanat: 'Electricitat',
    autor: {
      nom: 'Marc Soler',
      carrec: 'Instalador Eléctrico Autorizado en Baja Tensión',
      avatar: ARTICLES_VA[2].autor.avatar
    },
    imatgePeu: 'Renovación de cuadro general de distribución con protector de sobretensiones.',
    tags: ['Electricidad', 'Boletín Eléctrico', 'CIE', 'Sobretensiones', 'DANA', 'Iberdrola', 'Comunidad Valenciana'],
    seccions: [
      {
        subtitol: '1. ¿Cuándo te pedirá la distribuidora (i-DE) el CIE?',
        paragrafs: [
          'En la Comunidad Valenciana, la Dirección General de Energía regula la emisión del CIE oficial.',
          'Se exige en: altas nuevas o reactivación tras más de 2 meses de baja, cambios de titular en instalaciones de más de 20 años, o aumento de potencia superior al boletín vigente.'
        ],
        destacatConsell: 'Solo un instalador autorizado en el registro de Industria puede firmar y tramitar el CIE telemático oficial.'
      },
      {
        subtitol: '2. Sobretensiones por tormentas de verano y DANA',
        paragrafs: [
          'Las tormentas eléctricas y gotas frías causan picos bruscos de tensión que queman placas electrónicas de calderas, aires y televisores.',
          'El protector contra sobretensiones permanentes y transitorias es la mejor defensa.'
        ],
        taulaPreus: [
          { concepte: 'Tramitación telemática de CIE (Boletín Eléctrico) para vivienda', preuAproximat: '110€ - 170€', consell: 'Incluye revisión previa in situ y registro oficial en 24-48h.' },
          { concepte: 'Instalación de protector combinado de sobretensiones', preuAproximat: '120€ - 190€', consell: 'Imprescindible para evitar daños por rayos y cortes en la red.' },
          { concepte: 'Renovación completa de cuadro eléctrico según normativa REBT', preuAproximat: '320€ - 580€', consell: 'Incluye caja estanca/empotrada, IGA, diferenciales y nuevos circuitos.' }
        ]
      }
    ]
  },
  {
    ...ARTICLES_VA[3],
    titol: 'El agua dura del Júcar, Serpis y Clariano: Cómo evitar que la cal arruine calderas y grifos',
    subtitol: 'Por qué en municipios como Alzira, Xàtiva, Ontinyent o Gandia el agua supera los 40 ºfH y qué soluciones alargan la vida de tus electrodomésticos.',
    resum: 'Descubre por qué las cuencas fluviales del sur de Valencia tienen índices de cal muy altos y cómo proteger tu vivienda ahorrando hasta 400€ al año en reparaciones.',
    categoria: 'Fontanería',
    tempsLectura: '5 min de lectura',
    data: '05 Octubre 2026',
    sectorZona: 'Sector Fontanería, Saneamiento y Tratamiento de Agua (Ribera, Costera, Vall y Safor)',
    categoriaServeiRecomanat: 'Lampisteria',
    autor: {
      nom: 'Pere Font',
      carrec: 'Maestro Fontanero y Técnico en Tratamiento de Agua',
      avatar: ARTICLES_VA[3].autor.avatar
    },
    imatgePeu: 'Descalcificador volumétrico y ósmosis inversa instalados para agua de red con alta dureza.',
    tags: ['Fontanería', 'Cal', 'Júcar', 'Descalcificador', 'Ósmosis', 'Termos', 'Xàtiva', 'Alzira', 'Gandia'],
    seccions: [
      {
        subtitol: '1. ¿Por qué el agua tiene tanta cal en nuestras comarcas?',
        paragrafs: [
          'La cuenca calcárea de los ríos Júcar, Clariano y Serpis genera agua con durezas superiores a los 40-55 ºfH (agua extremadamente dura).',
          'Al calentarse en termos o calderas, el carbonato de calcio precipita creando costras que aumentan hasta un 30% el consumo energético y queman resistencias.'
        ],
        puntsClau: [
          'Termos eléctricos sin mantenimiento pueden averiarse en 3 o 4 años.',
          'La cal obstruye atomizadores de grifos y deja manchas en mamparas.',
          'Resta eficacia a detergentes obligando a usar más dosis.'
        ]
      },
      {
        subtitol: '2. Soluciones eficaces: Descalcificador volumétrico y Ósmosis inversa',
        paragrafs: [
          'El descalcificador volumétrico en la acometida protege toda la instalación, mientras la ósmosis en la cocina elimina cloro y sales para agua de beber perfecta.'
        ],
        taulaPreus: [
          { concepte: 'Instalación de descalcificador volumétrico compacto', preuAproximat: '690€ - 1.150€', consell: 'Alarga la vida de electrodomésticos y reduce gasto energético.' },
          { concepte: 'Instalación de equipo de ósmosis inversa compacta con grifo', preuAproximat: '190€ - 350€', consell: 'Filtros de recambio anual económico (menos de 35€/año).' },
          { concepte: 'Cambio de ánodo de magnesio y limpieza de cal en termo', preuAproximat: '75€ - 130€', consell: 'Recomendado cada 2 años para evitar perforación del calderín.' }
        ]
      }
    ]
  },
  {
    ...ARTICLES_VA[4],
    titol: 'Seguridad en chalets, casas de campo y apartamentos: Cerraduras antibumping en Bixquert o Gandia',
    subtitol: 'Cómo blindar segundas residencias contra aperturas silenciosas y consejos de cerrajería de urgencia sin intermediarios abusivos.',
    resum: 'Guía de seguridad residencial para chalets y casas de campo en Xàtiva, Alzira, Ontinyent o playa de Gandia con bombines de alta gama y escudos acorazados.',
    categoria: 'Cerrajería',
    tempsLectura: '4 min de lectura',
    data: '02 Octubre 2026',
    sectorZona: 'Sector Cerrajería Técnica y Seguridad Residencial (Sur de Valencia)',
    categoriaServeiRecomanat: 'Serralleria',
    autor: {
      nom: 'David Morales',
      carrec: 'Maestro Cerrajero Especialista en Seguridad Residencial',
      avatar: ARTICLES_VA[4].autor.avatar
    },
    imatgePeu: 'Bombín antibumping y antiextracción con puente reforzado y escudo protector.',
    tags: ['Cerrajería', 'Seguridad', 'Antibumping', 'Chalets', 'Bixquert', 'Gandia', 'Urgencias 24h'],
    seccions: [
      {
        subtitol: '1. El punto débil de chalets y segundas residencias',
        paragrafs: [
          'En urbanizaciones como Bixquert, la Garrofera o apartamentos de playa en Gandia y Cullera, muchas viviendas quedan vacías días laborables o en invierno.',
          'Más del 65% conservan cerraduras convencionales vulnerables al *bumping* o ganzuado rápido sin rotura.'
        ],
        puntsClau: [
          'Instalar bombines con protección antibumping, antirotura y pasadores anti-taladro.',
          'Añadir escudo acorazado exterior para evitar extracción directa con tenazas.',
          'Revisar cerrojos de rejas y puertas de garaje en viviendas aisladas.'
        ]
      },
      {
        subtitol: '2. Cerrajeros de urgencia locales: cómo evitar intermediarios abusivos',
        paragrafs: [
          'En AVISA conectas directamente con cerrajeros profesionales de tu comarca con precios claros y aperturas limpias sin dañar la puerta.'
        ],
        taulaPreus: [
          { concepte: 'Apertura de urgencia de puerta de golpe (llaves puestas por dentro)', preuAproximat: '60€ - 90€', consell: 'Apertura por ganzuado en minutos sin rotura de bombín.' },
          { concepte: 'Instalación de bombín de alta seguridad antibumping', preuAproximat: '135€ - 220€', consell: 'Incluye 5 llaves incopiables con tarjeta de seguridad acreditativa.' },
          { concepte: 'Montaje de escudo acorazado protector magnético', preuAproximat: '100€ - 170€', consell: 'Impide el acceso a la ranura de la cerradura ante herramientas de torsión.' }
        ]
      }
    ]
  },
  {
    ...ARTICLES_VA[5],
    titol: 'Carpintería y aislamiento en casas de pueblo: Confort térmico con parquet AC5 y puertas macizas',
    subtitol: 'Eliminar el frío del terrazo antiguo y aislar del ruido en viviendas históricas de Ontinyent, Xàtiva o Bocairent.',
    resum: 'Descubre cómo la carpintería a medida y los suelos laminados de alta resistencia mejoran el aislamiento térmico y acústico en viviendas tradicionales.',
    categoria: 'Carpintería',
    tempsLectura: '4 min de lectura',
    data: '28 Septiembre 2026',
    sectorZona: 'Sector Carpintería Tradicional, Ebanistería e Interiorismo',
    categoriaServeiRecomanat: 'Fusteria',
    autor: {
      nom: 'Joan Valls',
      carrec: 'Carpintero Ebanista Artesano e Instalador de Suelos',
      avatar: ARTICLES_VA[5].autor.avatar
    },
    imatgePeu: 'Colocación de suelo laminado AC5 sobre manta aislante antihumedad.',
    tags: ['Carpintería', 'Parquet AC5', 'Puertas macizas', 'Casas de pueblo', 'Ontinyent', 'Xàtiva', 'Aislamiento'],
    seccions: [
      {
        subtitol: '1. El suelo como barrera ante el frío en casas tradicionales',
        paragrafs: [
          'En centros históricos los suelos de terrazo antiguo sobre forjados transmiten sensación de frío.',
          'El suelo laminado AC5/AC6 sobre manta aislante con barrera de vapor frena la humedad, aporta calidez y reduce hasta 20 dB el ruido de impacto.'
        ],
        puntsClau: [
          'Clasificación AC5 de alta resistencia a arañazos y ranuras hidrófugas.',
          'Puertas macizas lacadas con junta de goma isofónica.',
          'Armarios a medida de suelo a techo aprovechando techos altos.'
        ]
      },
      {
        subtitol: '2. Estimación de precios con carpinteros de la zona',
        paragrafs: [
          'Presupuestos claros con rebaje de puertas y rodapié perimetral lacado incluido:'
        ],
        taulaPreus: [
          { concepte: 'Instalación de parquet laminado AC5 con manta aislante (piso 70-90 m²)', preuAproximat: '1.450€ - 2.500€', consell: 'Incluye base antihumedad, rebaje de puertas y rodapié lacado.' },
          { concepte: 'Sustitución de 5 puertas de paso por macizas lacadas con manillas', preuAproximat: '890€ - 1.380€', consell: 'Aislamiento acústico y cierre magnético suave superior.' },
          { concepte: 'Armario empotrado a medida bajo escalera o rincón de techo alto', preuAproximat: '1.100€ - 2.200€', consell: 'Aprovechamiento óptimo del espacio en casas tradicionales.' }
        ]
      }
    ]
  }
];

/**
 * English translations of AVISA Blog articles (EN).
 */
export const ARTICLES_EN: Article[] = [
  {
    ...ARTICLES_VA[0],
    titol: 'How much does it cost to renovate a townhouse or apartment in southern Valencia? 2026 Budget Guide',
    subtitol: 'Cost breakdown, moisture-resistant materials, and municipal permits in Xàtiva, Ontinyent, Gandia, and Alzira.',
    resum: 'Practical breakdown of local labor rates, minor work permits, traditional house updates, and recommended finishes in Valencia.',
    categoria: 'Renovations & Works',
    tempsLectura: '6 min read',
    data: '14 October 2026',
    sectorZona: 'Construction and Renovation Sector (Valencia South)',
    categoriaServeiRecomanat: 'Reformes i Obres',
    autor: {
      nom: 'Elena Pons',
      carrec: 'Chartered Technical Architect and Building Surveyor',
      avatar: ARTICLES_VA[0].autor.avatar
    },
    imatgePeu: 'Bathroom renovation with anti-slip mineral resin shower tray and ceramic tiling in a traditional townhouse.',
    tags: ['Renovations', 'Townhouses', 'Bathroom', 'Kitchen', 'Budgets', 'Building permits', 'Xàtiva', 'Ontinyent'],
    seccions: [
      {
        subtitol: '1. Housing assessment across our districts',
        paragrafs: [
          'In our region, there is a large stock of **traditional townhouses** (solid clay walls, wooden beams, and private courtyards), alongside apartments built between 1970 and 2000 in cities like Xàtiva, Ontinyent, Alzira, or Gandia.',
          'Old lead or galvanized pipes are frequently calcified, and sunken tubs limit senior mobility. Renovation revalues property by over 15% and upgrades hidden plumbing.'
        ],
        puntsClau: [
          'Replace aging pipes with limescale-immune multilayer or PEX pipes.',
          'Replace bathtubs with ultra-flat class 3 anti-slip mineral resin shower trays.',
          'Reinforce walls with moisture-resistant plasterboard to block rising damp.'
        ]
      },
      {
        subtitol: '2. Average 2026 local price estimates',
        paragrafs: [
          'Renovation rates in southern Valencia are highly competitive thanks to the direct local contractor network on AVISA:'
        ],
        taulaPreus: [
          { concepte: 'Express tub-to-shower conversion (with partial tiling)', preuAproximat: '€790 - €1,250', consell: 'Completed in 24-48 hours by local specialists with no complex paperwork.' },
          { concepte: 'Full standard bathroom renovation (up to 5 m²)', preuAproximat: '€2,100 - €3,600', consell: 'Includes demolition, new plumbing, resin tray, tempered glass enclosure, and tiles.' },
          { concepte: 'Full medium kitchen renovation (up to 9 m²)', preuAproximat: '€4,500 - €8,800', consell: 'Includes plumbing, electrical outlets, quartz/porcelain countertop, and custom cabinets.' },
          { concepte: 'Courtyard or patio renovation with anti-slip pavers', preuAproximat: '€1,200 - €2,400', consell: 'Popular in townhouses to optimize outdoor enjoyment during summer.' }
        ],
        destacatConsell: 'At AVISA, we advise hiring local contractors in your district to eliminate travel charges and guarantee swift follow-up.'
      },
      {
        subtitol: '3. Municipal permits: Do you need a license?',
        paragrafs: [
          'In Xàtiva, Ontinyent, Gandia, Alzira, or Oliva, non-structural bathroom and kitchen remodels are handled via online **Minor Works Responsible Declarations**.',
          'Work can begin as soon as paperwork and the municipal building tax (2%-4% ICIO) are submitted.'
        ]
      }
    ]
  },
  {
    ...ARTICLES_VA[1],
    titol: 'HVAC Solutions for Extreme Heat and Coastal Humidity: Energy Saving Guide',
    subtitol: 'How to handle 40°C summer heat in Xàtiva or intense humidity in Gandia without inflated electricity bills using heat pumps and aerothermal systems.',
    resum: 'Expert advice for towns with extreme summer peaks (Xàtiva, Alzira) and saline coastal air (Gandia, Oliva): filters, R-32 eco-refrigerant, and efficient thermal insulation.',
    categoria: 'HVAC / AC',
    tempsLectura: '5 min read',
    data: '12 October 2026',
    sectorZona: 'HVAC and Energy Efficiency Sector (Valencia South)',
    categoriaServeiRecomanat: 'Climatització',
    autor: {
      nom: 'Anna Prat',
      carrec: 'Technical Engineer & Certified RITE Refrigeration Installer',
      avatar: ARTICLES_VA[1].autor.avatar
    },
    imatgePeu: 'A+++ inverter split unit assembly with Gold Fin anti-corrosion protection.',
    tags: ['HVAC', 'Air Conditioning', 'Extreme Heat', 'Xàtiva', 'Gandia', 'Aerothermal', 'RITE'],
    seccions: [
      {
        subtitol: '1. Regional climate challenges: Canicular heat vs coastal humidity',
        paragrafs: [
          'In inland valleys (where **Xàtiva frequently hits 40°C-42°C in summer**), air conditioning runs under extreme load during tropical nights.',
          'Along the coast (Gandia, Oliva), relative humidity above 80% and sea salt rust outdoor coils without *Gold Fin* protection. In higher valleys, reversible heat pumps provide reliable year-round warmth.'
        ],
        puntsClau: [
          'Select systems with SEER above 8.5 (A+++ class) to cut summer electricity usage up to 40%.',
          'Ensure protective anti-corrosion coating for outdoor units near coastal areas.',
          'Install certified anti-vibration rubber mounts to prevent wall resonance in townhouses.'
        ]
      },
      {
        subtitol: '2. Preventative servicing before heatwaves strike',
        paragrafs: [
          'Waiting until June to start air conditioning is a common mistake. Clogged filters and minor refrigerant leaks force compressors to overwork, doubling power consumption.',
          'A spring tune-up with antibacterial foam cleaning and pressure tests by a certified RITE technician ensures quiet, reliable cooling.'
        ],
        taulaPreus: [
          { concepte: 'Full split unit servicing (filters, coil sanitizing, gas check)', preuAproximat: '€55 - €85', consell: 'Recommended between March and May before hot weather begins.' },
          { concepte: 'Basic 1x1 split installation (up to 4 meters copper piping)', preuAproximat: '€220 - €350', consell: 'Requires certified installer to preserve official manufacturer warranty.' },
          { concepte: 'Aerothermal heating and cooling system for house or villa', preuAproximat: '€5,800 - €9,800', consell: 'Highly popular in inland villas to replace oil or biomass boilers.' }
        ]
      }
    ]
  },
  {
    ...ARTICLES_VA[2],
    titol: 'Electrical Certificates (CIE) in Valencia: When is it mandatory and how to protect against storms',
    subtitol: 'Everything you need to know to activate power with Iberdrola (i-DE), increase contracted capacity, or safeguard electronics against DANA storms.',
    resum: 'Clear guide on Industry Department rules for the Electrical Installation Certificate (CIE), super-immunized RCDs, and lightning surge arresters in Valencia.',
    categoria: 'Electrical',
    tempsLectura: '5 min read',
    data: '08 October 2026',
    sectorZona: 'Electrical Installations and Industrial Safety Sector',
    categoriaServeiRecomanat: 'Electricitat',
    autor: {
      nom: 'Marc Soler',
      carrec: 'Certified Low Voltage Electrical Contractor',
      avatar: ARTICLES_VA[2].autor.avatar
    },
    imatgePeu: 'Main electrical distribution panel upgrade with surge protector and super-immunized breakers.',
    tags: ['Electrical', 'CIE Certificate', 'Surge Protection', 'DANA', 'Iberdrola', 'Valencia'],
    seccions: [
      {
        subtitol: '1. When will the utility company (i-DE) request a CIE?',
        paragrafs: [
          'In the Valencian Community, the Directorate of Energy regulates official CIE certificates proving the installation complies with national electrical codes (REBT).',
          'It is compulsory for: new meter setups or activations after 2+ months inactive, contract name transfers for installations older than 20 years, or power capacity upgrades exceeding the last certificate.'
        ],
        destacatConsell: 'Only an officially registered electrical installer can sign and submit the official electronic CIE.'
      },
      {
        subtitol: '2. Lightning surges from summer storms and DANA events',
        paragrafs: [
          'Severe thunderstorms and autumn cold drops (DANA) trigger severe voltage spikes across the distribution grid, destroying electronics in air conditioners, computers, and heating pumps.',
          'Installing a combined permanent and transient surge protector in your home panel is the single best safeguard for all home appliances.'
        ],
        taulaPreus: [
          { concepte: 'Electronic CIE certificate processing for residential property', preuAproximat: '€110 - €170', consell: 'Includes safety inspection and official registry submission within 24-48 hours.' },
          { concepte: 'Installation of permanent and transient surge protection device', preuAproximat: '€120 - €190', consell: 'Essential to shield electronics against lightning spikes.' },
          { concepte: 'Complete electrical panel replacement according to modern REBT codes', preuAproximat: '€320 - €580', consell: 'Includes enclosure, main breaker, RCDs, and dedicated circuit lines.' }
        ]
      }
    ]
  },
  {
    ...ARTICLES_VA[3],
    titol: 'Hard Water in Valencia Basins: How to stop limescale from ruining boilers and faucets',
    subtitol: 'Why tap water in towns like Alzira, Xàtiva, Ontinyent, and Gandia exceeds 40 ºfH and proven solutions to double appliance lifespans.',
    resum: 'Learn why southern Valencia river basins carry heavy mineral concentrations and how to protect your home while saving up to €400 annually in repair bills.',
    categoria: 'Plumbing',
    tempsLectura: '5 min read',
    data: '05 October 2026',
    sectorZona: 'Plumbing, Sanitation, and Domestic Water Treatment Sector',
    categoriaServeiRecomanat: 'Lampisteria',
    autor: {
      nom: 'Pere Font',
      carrec: 'Master Plumber and Water Treatment Specialist',
      avatar: ARTICLES_VA[3].autor.avatar
    },
    imatgePeu: 'Automatic volumetric water softener and reverse osmosis system installed for high-hardness tap water.',
    tags: ['Plumbing', 'Limescale', 'Water Softener', 'Reverse Osmosis', 'Boilers', 'Xàtiva', 'Gandia'],
    seccions: [
      {
        subtitol: '1. Why does tap water carry so much limescale?',
        paragrafs: [
          'Limestone bedrock across the Júcar, Clariano, and Serpis river basins causes tap water hardness to frequently exceed 40-55 ºfH (classified as extremely hard water).',
          'When heated past 50°C in electric boilers or water heaters, calcium carbonate quickly coats heating elements, insulating heat and driving up electric and gas consumption by up to 30%.'
        ],
        puntsClau: [
          'Unserviced electric water heaters in our area can burn out in under 3-4 years.',
          'Limescale clogs faucet aerators and leaves stubborn white marks on shower glass.',
          'Significantly reduces detergent effectiveness, requiring higher cleaning product dosages.'
        ]
      },
      {
        subtitol: '2. Effective solutions: Whole-house volumetric softener vs Kitchen reverse osmosis',
        paragrafs: [
          'Combining two complementary systems provides complete protection: a volumetric salt softener at the main inlet shields 100% of pipes and appliances, while a multi-stage under-sink reverse osmosis system delivers pure drinking water.'
        ],
        taulaPreus: [
          { concepte: 'Compact whole-house volumetric water softener installation', preuAproximat: '€690 - €1,150', consell: 'Protects all water-using appliances and cuts heating electricity consumption.' },
          { concepte: 'Under-sink 5-stage reverse osmosis system with service tap', preuAproximat: '€190 - €350', consell: 'Simple annual filter changes with replacement costs under €35/year.' },
          { concepte: 'Magnesium anode replacement and boiler descaling service', preuAproximat: '€75 - €130', consell: 'Recommended every 2 years in hard water regions to prevent tank corrosion.' }
        ]
      }
    ]
  },
  {
    ...ARTICLES_VA[4],
    titol: 'Security for Country Houses and Holiday Villas: Anti-bumping locks in Valencia',
    subtitol: 'How to protect second homes against silent break-ins and key tips for 24h emergency locksmiths without overpriced dispatchers.',
    resum: 'Residential security guide for country homes and coastal apartments in Xàtiva, Alzira, Ontinyent, or Gandia beach using certified cylinders and armored escutcheons.',
    categoria: 'Locksmithing',
    tempsLectura: '4 min read',
    data: '02 October 2026',
    sectorZona: 'Technical Locksmithing and Residential Security Sector',
    categoriaServeiRecomanat: 'Serralleria',
    autor: {
      nom: 'David Morales',
      carrec: 'Master Locksmith & Physical Residential Security Specialist',
      avatar: ARTICLES_VA[4].autor.avatar
    },
    imatgePeu: 'High-security anti-bumping, anti-extraction cylinder with reinforced steel bridge and armored magnetic shield.',
    tags: ['Locksmithing', 'Security', 'Anti-bumping', 'Villas', 'Gandia', '24h Emergency'],
    seccions: [
      {
        subtitol: '1. Common security vulnerabilities in holiday homes and villas',
        paragrafs: [
          'In rural developments and beach apartments across Gandia, Cullera, and Xàtiva hills, properties remain unattended during weekdays or winter months.',
          'Over 65% retain outdated cylinders vulnerable to silent *bumping* or lock picking within under 60 seconds without noisy physical damage.'
        ],
        puntsClau: [
          'Upgrade to certified cylinders featuring anti-bumping, anti-snap, and anti-drill pins.',
          'Add a heavy-duty external armored shield to block cylinder extraction with pliers.',
          'Inspect window grills and garage entry latches on secluded properties.'
        ]
      },
      {
        subtitol: '2. Local emergency locksmiths: How to avoid excessive middleman fees',
        paragrafs: [
          'On AVISA you connect directly with verified local locksmiths based in your district with transparent quotes upfront and clean non-destructive door opening methods.'
        ],
        taulaPreus: [
          { concepte: 'Emergency door opening (keys left inside, lock not engaged)', preuAproximat: '€60 - €90', consell: 'Opened cleanly in minutes via picking without damaging door or lock.' },
          { concepte: 'High-security anti-bumping cylinder installation with owner security card', preuAproximat: '€135 - €220', consell: 'Includes 5 duplicate-protected keys reproducible only with the security card.' },
          { concepte: 'Heavy-duty magnetic armored protector shield installation', preuAproximat: '€100 - €170', consell: 'Blocks keyway access and stops levering tools.' }
        ]
      }
    ]
  },
  {
    ...ARTICLES_VA[5],
    titol: 'Carpentry and Insulation in Townhouses: Achieving thermal comfort with AC5 laminate and solid doors',
    subtitol: 'Eliminating cold from antique terrazzo flooring and insulating street noise in heritage homes in Ontinyent, Xàtiva, or Bocairent.',
    resum: 'Discover how custom carpentry and high-density laminate floors improve thermal and acoustic comfort in traditional heritage homes.',
    categoria: 'Carpentry',
    tempsLectura: '4 min read',
    data: '28 September 2026',
    sectorZona: 'Traditional Carpentry, Cabinetmaking and Interior Design Sector',
    categoriaServeiRecomanat: 'Fusteria',
    autor: {
      nom: 'Joan Valls',
      carrec: 'Master Cabinetmaker & Certified Floor Installer',
      avatar: ARTICLES_VA[5].autor.avatar
    },
    imatgePeu: 'AC5 laminate flooring installation over moisture-barrier underlay in a restored townhouse.',
    tags: ['Carpentry', 'AC5 Parquet', 'Solid Doors', 'Townhouses', 'Ontinyent', 'Xàtiva', 'Insulation'],
    seccions: [
      {
        subtitol: '1. Flooring as a shield against damp and cold in heritage properties',
        paragrafs: [
          'In historical quarters, antique terrazzo laid directly over old ground beams radiates cold throughout winter.',
          'Installing **AC5/AC6 high-density laminate** over vapor-barrier acoustic underlay stops rising chill, provides immediate foot warmth, and lowers impact noise by up to 20 dB.'
        ],
        puntsClau: [
          'AC5 scratch resistance rating with waterproof groove sealing for kitchens and corridors.',
          'Lacquered solid core doors with acoustic perimeter rubber seals.',
          'Floor-to-ceiling built-in wardrobes leveraging high traditional ceilings.'
        ]
      },
      {
        subtitol: '2. Cost estimates with local carpentry craftsmen',
        paragrafs: [
          'Transparent estimates from AVISA carpenters including door trims and matching lacquered baseboards:'
        ],
        taulaPreus: [
          { concepte: 'AC5 laminate flooring installation with insulating underlay (70-90 m² apartment)', preuAproximat: '€1,450 - €2,500', consell: 'Includes moisture barrier, door undercut trimming, and matching lacquered skirting.' },
          { concepte: 'Replacement of 5 interior doors with solid lacquered doors & handles', preuAproximat: '€890 - €1,380', consell: 'Significantly higher soundproofing and soft magnetic latching.' },
          { concepte: 'Custom built-in wardrobe under stairs or high ceiling alcove', preuAproximat: '€1,100 - €2,200', consell: 'Craftsman tailoring that maximizes usable storage in townhouses.' }
        ]
      }
    ]
  }
];
