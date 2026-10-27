#!/usr/bin/env node

/**
 * Script per a executar l'actualització de la base de dades PostgreSQL (jjaux_db)
 * Inserint 10 empreses professionals homologades i 10 clients reals amb foto de perfil i logo de fons.
 */

let pg;
try {
  pg = require('pg');
} catch (e) {
  try {
    const path = require('path');
    pg = require(path.join(__dirname, 'node_modules', 'pg'));
  } catch (e2) {
    try {
      pg = require('/home/jautursis/Escriptori/FRONT-PROJECT-JJAUX/node_modules/pg');
    } catch (e3) {
      console.error('❌ No s\'ha trobat el mòdul "pg".');
      process.exit(1);
    }
  }
}
const { Client } = pg;

const config = {
  host: process.env.PGHOST || 'localhost',
  port: parseInt(process.env.PGPORT || '5432', 10),
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD !== undefined ? process.env.PGPASSWORD : (process.env.DB_PASSWORD || ''),
  database: process.env.PGDATABASE || 'jjaux_db'
};

async function execute() {
  let client = new Client(config);
  try {
    await client.connect();
  } catch (err) {
    if (config.password === '' && (err.code === '28P01' || (err.message && err.message.toLowerCase().includes('password')))) {
      client = new Client({ ...config, password: 'postgres' });
      await client.connect();
    } else {
      throw err;
    }
  }

  console.log('✅ Connectat amb èxit a PostgreSQL (jjaux_db)');

  try {
    await client.query('BEGIN');

    // 1. Assegurar columnes foto_perfil i logo a usuaris
    console.log('1. Verificant i afegint columnes foto_perfil i logo...');
    await client.query(`
      ALTER TABLE usuaris ADD COLUMN IF NOT EXISTS foto_perfil TEXT;
      ALTER TABLE usuaris ADD COLUMN IF NOT EXISTS logo TEXT;
    `);

    // 2. Eliminar dades anteriors per netejar i evitar col·lisions de claus
    console.log('2. Neteja prèvia de registres temporals...');
    await client.query(`
      DELETE FROM resenyes;
      DELETE FROM pressupostos;
      DELETE FROM tasques;
      DELETE FROM incidencies;
      DELETE FROM ofertes;
      DELETE FROM publicacions;
      DELETE FROM avisos;
      DELETE FROM usuaris WHERE id NOT IN ('u-admin');
    `);

    // 3. Inserció dels 10 Professionals (Empreses)
    console.log('3. Inserint 10 empreses professionals homologades...');
    const empreses = [
      {
        id: 'u-pro-fontanals',
        nom: 'Fontanals Lampisteria & Climatització S.L.',
        email: 'contacte@fontanals.es',
        password: 'password123',
        rol: 'professional',
        telefon: '963112233',
        bio: 'Empresa líder en lampisteria urgent 24h, descalcificadors, reparació de fuites, termos elèctrics i calderes a València i l\'Horta. Més de 15 anys de garantia i resposta immediata.',
        percentil: 5,
        verificat: true,
        sollicitud_verificacio: false,
        foto: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=800&auto=format&fit=crop&q=80',
        foto_perfil: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=300&auto=format&fit=crop&q=80',
        logo: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=800&auto=format&fit=crop&q=80'
      },
      {
        id: 'u-pro-electromartinez',
        nom: 'ElectroMartínez Instal·lacions Elèctriques S.L.',
        email: 'info@electromartinez.es',
        password: 'password123',
        rol: 'professional',
        telefon: '963223344',
        bio: 'Enginyeria i muntatges elèctrics homologats. Butlletins oficials (CIE), quadres industrials, domòtica domèstica, panells solars fotovoltaics i punts de recàrrega de cotxe elèctric.',
        percentil: 5,
        verificat: true,
        sollicitud_verificacio: false,
        foto: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop&q=80',
        foto_perfil: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=300&auto=format&fit=crop&q=80',
        logo: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop&q=80'
      },
      {
        id: 'u-pro-solerpintures',
        nom: 'Soler Pintura & Alta Decoració S.L.',
        email: 'pressupost@solerpintures.com',
        password: 'password123',
        rol: 'professional',
        telefon: '963334455',
        bio: 'Especialistes en pintura decorativa, tractament antihumitat, eliminació de gotelé, microciment, façanes i lacat de portes i finestres. Acabats impecables i neteja extrema.',
        percentil: 4,
        verificat: true,
        sollicitud_verificacio: false,
        foto: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&auto=format&fit=crop&q=80',
        foto_perfil: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=300&auto=format&fit=crop&q=80',
        logo: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&auto=format&fit=crop&q=80'
      },
      {
        id: 'u-pro-climabeneyto',
        nom: 'ClimaBeneyto Climatització & Aerotèrmia S.L.',
        email: 'serveis@climabeneyto.es',
        password: 'password123',
        rol: 'professional',
        telefon: '963445566',
        bio: 'Instal·lació i manteniment oficial d\'equips d\'aire condicionat per conductes, sistemes d\'aerotèrmia d\'alta eficiència A+++ i terra radiant. Servei tècnic multimarca acreditat.',
        percentil: 5,
        verificat: true,
        sollicitud_verificacio: false,
        foto: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&auto=format&fit=crop&q=80',
        foto_perfil: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
        logo: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&auto=format&fit=crop&q=80'
      },
      {
        id: 'u-pro-fusteriaribes',
        nom: 'Fusteria Artesana Ribes & Fills S.L.',
        email: 'info@fusteriaribes.com',
        password: 'password123',
        rol: 'professional',
        telefon: '963556677',
        bio: 'Taller familiar de fusteria i ebenisteria amb més de 30 anys d\'ofici. Cuines de disseny a mida, armaris encastats, portes massisses, tarimes flotants i parquets naturals.',
        percentil: 4,
        verificat: true,
        sollicitud_verificacio: false,
        foto: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=800&auto=format&fit=crop&q=80',
        foto_perfil: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80',
        logo: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=800&auto=format&fit=crop&q=80'
      },
      {
        id: 'u-pro-llevant',
        nom: 'Llevant Reformes & Obres Integrals S.L.',
        email: 'obres@llevantreformes.com',
        password: 'password123',
        rol: 'professional',
        telefon: '963667788',
        bio: 'Constructora especialitzada en reformes integrals claus en mà de vivendes, locals comercials i banys. Gestió de llicències municipals, arquitectura tècnica i coordinació gremial.',
        percentil: 5,
        verificat: true,
        sollicitud_verificacio: false,
        foto: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&auto=format&fit=crop&q=80',
        foto_perfil: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=300&auto=format&fit=crop&q=80',
        logo: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&auto=format&fit=crop&q=80'
      },
      {
        id: 'u-pro-serralleriaval',
        nom: 'Serralleria Seguretat València 24H S.L.',
        email: 'urgencies@serralleriavalencia.com',
        password: 'password123',
        rol: 'professional',
        telefon: '963778899',
        bio: 'Obertura de portes sense danys en menys de 25 minuts. Instal·lació de bombins antibumping de màxima seguretat, escuts cuirassats, panys invisibles i persianes metàl·liques de comerços.',
        percentil: 5,
        verificat: true,
        sollicitud_verificacio: false,
        foto: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=800&auto=format&fit=crop&q=80',
        foto_perfil: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
        logo: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=800&auto=format&fit=crop&q=80'
      },
      {
        id: 'u-pro-cristalleriaalvent',
        nom: 'Cristalleria & Finestres Alumini Alvent S.L.',
        email: 'info@alventcristalls.com',
        password: 'password123',
        rol: 'professional',
        telefon: '963889900',
        bio: 'Fabricació pròpia de finestres de PVC i alumini amb trencament de pont tèrmic (RPT). Doble acristallament Climalit, mampares de bany de vidre temperat i baranes de seguretat.',
        percentil: 4,
        verificat: true,
        sollicitud_verificacio: false,
        foto: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80',
        foto_perfil: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80',
        logo: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80'
      },
      {
        id: 'u-pro-ecojardi',
        nom: 'EcoJardí Paisatgisme & Manteniment S.L.',
        email: 'projectes@ecojardi.es',
        password: 'password123',
        rol: 'professional',
        telefon: '963990011',
        bio: 'Projectes de xerojardineria mediterrània sostenible, gespa artificial d\'alta gamma, sistemes automàtics de reg intel·ligent, poda en alçada de palmeres i tractament de plagues.',
        percentil: 4,
        verificat: true,
        sollicitud_verificacio: false,
        foto: 'https://images.unsplash.com/photo-1558904541-efa8c4a08931?w=800&auto=format&fit=crop&q=80',
        foto_perfil: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
        logo: 'https://images.unsplash.com/photo-1558904541-efa8c4a08931?w=800&auto=format&fit=crop&q=80'
      },
      {
        id: 'u-pro-netegesmaritima',
        nom: 'Neteges Industrials & Desinfeccions Marítima S.L.',
        email: 'serveis@netegesmaritima.com',
        password: 'password123',
        rol: 'professional',
        telefon: '963001122',
        bio: 'Empresa homologada per a neteges finals d\'obra, higienització de conductes, neteja integral de comunitats de veïns, pàrquings i poliment de terres de marbre i terratzo.',
        percentil: 5,
        verificat: true,
        sollicitud_verificacio: false,
        foto: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=80',
        foto_perfil: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
        logo: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=80'
      }
    ];

    for (const p of empreses) {
      await client.query(`
        INSERT INTO usuaris (id, nom, email, password, rol, telefon, bio, percentil, verificat, sollicitud_verificacio, foto, foto_perfil, logo)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (id) DO UPDATE SET
          nom = EXCLUDED.nom,
          email = EXCLUDED.email,
          rol = EXCLUDED.rol,
          telefon = EXCLUDED.telefon,
          bio = EXCLUDED.bio,
          percentil = EXCLUDED.percentil,
          verificat = EXCLUDED.verificat,
          foto = EXCLUDED.foto,
          foto_perfil = EXCLUDED.foto_perfil,
          logo = EXCLUDED.logo
      `, [p.id, p.nom, p.email, p.password, p.rol, p.telefon, p.bio, p.percentil, p.verificat, p.sollicitud_verificacio, p.foto, p.foto_perfil, p.logo]);
    }

    // Inserir o actualitzar el compte de test 'u-pro' perquè apunti a Llevant Reformes
    await client.query(`
      INSERT INTO usuaris (id, nom, email, password, rol, telefon, bio, percentil, verificat, sollicitud_verificacio, foto, foto_perfil, logo)
      VALUES (
        'u-pro',
        'Llevant Reformes & Obres Integrals S.L.',
        'pro@avisa.com',
        'propro',
        'professional',
        '963667788',
        'Constructora especialitzada en reformes integrals claus en mà de vivendes, locals comercials i banys.',
        5,
        TRUE,
        FALSE,
        'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=300&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&auto=format&fit=crop&q=80'
      )
      ON CONFLICT (id) DO UPDATE SET
        nom = EXCLUDED.nom,
        email = EXCLUDED.email,
        password = EXCLUDED.password,
        foto = EXCLUDED.foto,
        foto_perfil = EXCLUDED.foto_perfil,
        logo = EXCLUDED.logo;
    `);

    // 4. Inserció dels 10 Clients reals
    console.log('4. Inserint 10 clients particulars...');
    const clients = [
      {
        id: 'u-cli-joan',
        nom: 'Joan Albors i Vidal',
        email: 'joan.albors@gmail.com',
        password: 'password123',
        rol: 'client',
        telefon: '611223344',
        bio: 'Propietari d\'un pis al barri de Russafa (València). Cercant serveis de millora i manteniment d\'alta qualitat.',
        foto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80',
        foto_perfil: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80'
      },
      {
        id: 'u-cli-marta',
        nom: 'Marta Navarro Beltran',
        email: 'marta.navarro@gmail.com',
        password: 'password123',
        rol: 'client',
        telefon: '622334455',
        bio: 'Veïna de Benimaclet. Arquitecta d\'interiors contractant professionals certificats per a reformes i manteniment.',
        foto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
        foto_perfil: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80'
      },
      {
        id: 'u-cli-pau',
        nom: 'Pau Climent Soler',
        email: 'pau.climent@outlook.com',
        password: 'password123',
        rol: 'client',
        telefon: '633445566',
        bio: 'Propietari d\'un xalet a Torrent (Vedat). Interessat en climatització eficient, aerotèrmia i panells solars.',
        foto: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=300&auto=format&fit=crop&q=80',
        foto_perfil: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=300&auto=format&fit=crop&q=80'
      },
      {
        id: 'u-cli-laura',
        nom: 'Laura Giménez Ortiz',
        email: 'laura.gimenez@yahoo.es',
        password: 'password123',
        rol: 'client',
        telefon: '644556677',
        bio: 'Resident al barri del Carme (Ciutat Vella). En procés de rehabilitació d\'un immoble antic.',
        foto: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80',
        foto_perfil: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80'
      },
      {
        id: 'u-cli-andreu',
        nom: 'Andreu Soriano Puig',
        email: 'andreu.soriano@gmail.com',
        password: 'password123',
        rol: 'client',
        telefon: '655667788',
        bio: 'Propietari a Gandia platja. Gestió d\'apartaments de temporada i reformes integrals.',
        foto: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=300&auto=format&fit=crop&q=80',
        foto_perfil: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=300&auto=format&fit=crop&q=80'
      },
      {
        id: 'u-cli-silvia',
        nom: 'Sílvia Fuster Montaner',
        email: 'silvia.fuster@gmail.com',
        password: 'password123',
        rol: 'client',
        telefon: '666778899',
        bio: 'Resident a Alzira (la Ribera Alta). Contractació periòdica de fusteria, pintura i electricitat.',
        foto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
        foto_perfil: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80'
      },
      {
        id: 'u-cli-marc',
        nom: 'Marc Vila Segarra',
        email: 'marc.vila@hotmail.com',
        password: 'password123',
        rol: 'client',
        telefon: '677889900',
        bio: 'Emplaçat a Castelló de la Plana. Reforma de cuines i banys amb materials de proximitat.',
        foto: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80',
        foto_perfil: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80'
      },
      {
        id: 'u-cli-carla',
        nom: 'Carla Revert Llopis',
        email: 'carla.revert@gmail.com',
        password: 'password123',
        rol: 'client',
        telefon: '688990011',
        bio: 'Propietària a Alacant (zona Sant Joan). Renovació d\'espais exteriors, jardí i tancaments d\'alumini.',
        foto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
        foto_perfil: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'
      },
      {
        id: 'u-cli-voro',
        nom: 'Vicent Barberà Camps',
        email: 'voro.barbera@gmail.com',
        password: 'password123',
        rol: 'client',
        telefon: '699001122',
        bio: 'Empresari autònom a Paterna. Gestió d\'instal·lacions comercials i oficines de negocis.',
        foto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
        foto_perfil: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80'
      },
      {
        id: 'u-cli-elena',
        nom: 'Elena Domènech Sancho',
        email: 'elena.domenech@gmail.com',
        password: 'password123',
        rol: 'client',
        telefon: '610112233',
        bio: 'Enginyera industrial a Sagunt. Usuària habitual d\'AVISA per a manteniments integrals d\'habitatge.',
        foto: 'https://images.unsplash.com/photo-1548142813-c348350df52b?w=300&auto=format&fit=crop&q=80',
        foto_perfil: 'https://images.unsplash.com/photo-1548142813-c348350df52b?w=300&auto=format&fit=crop&q=80'
      }
    ];

    for (const c of clients) {
      await client.query(`
        INSERT INTO usuaris (id, nom, email, password, rol, telefon, bio, percentil, verificat, sollicitud_verificacio, foto, foto_perfil, logo)
        VALUES ($1, $2, $3, $4, $5, $6, $7, 3, false, false, $8, $9, null)
        ON CONFLICT (id) DO UPDATE SET
          nom = EXCLUDED.nom,
          email = EXCLUDED.email,
          rol = EXCLUDED.rol,
          telefon = EXCLUDED.telefon,
          bio = EXCLUDED.bio,
          foto = EXCLUDED.foto,
          foto_perfil = EXCLUDED.foto_perfil
      `, [c.id, c.nom, c.email, c.password, c.rol, c.telefon, c.bio, c.foto, c.foto_perfil]);
    }

    // Inserir o actualitzar el compte de test 'u-cli' perquè apunti a Joan Albors
    await client.query(`
      INSERT INTO usuaris (id, nom, email, password, rol, telefon, bio, percentil, verificat, sollicitud_verificacio, foto, foto_perfil)
      VALUES (
        'u-cli',
        'Joan Albors i Vidal',
        'cli@avisa.com',
        'clicli',
        'client',
        '611223344',
        'Propietari d''un pis al barri de Russafa (València).',
        3,
        FALSE,
        FALSE,
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80'
      )
      ON CONFLICT (id) DO UPDATE SET
        nom = EXCLUDED.nom,
        email = EXCLUDED.email,
        password = EXCLUDED.password,
        foto = EXCLUDED.foto,
        foto_perfil = EXCLUDED.foto_perfil;
    `);

    // 5. Inserció d'Ofertes (Packs de Serveis) de les 10 empreses
    console.log('5. Inserint ofertes i packs de serveis per a les 10 empreses...');
    const ofertes = [
      {
        id: 'O-101',
        professional: 'Fontanals Lampisteria & Climatització S.L.',
        categoria: 'lampisteria',
        price: '120€',
        estat: 'Disponible',
        note: 'Manteniment complet de caldera i revisió de gas — Neteja de cremador, mesura de combustió, segellat de juntes i emissió de butlletí oficial RITE.'
      },
      {
        id: 'O-102',
        professional: 'Fontanals Lampisteria & Climatització S.L.',
        categoria: 'lampisteria',
        price: '480€',
        estat: 'Disponible',
        note: 'Instal·lació de descalcificador domèstic d\'aigua — Inclou equip d\'alta eficiència, vàlvula volumètrica, bypass i 25 kg de sal marina.'
      },
      {
        id: 'O-103',
        professional: 'ElectroMartínez Instal·lacions Elèctriques S.L.',
        categoria: 'electricitat',
        price: '650€',
        estat: 'Disponible',
        note: 'Muntatge de punt de recàrrega de vehicle elèctric (Wallbox) — Cablejat fins al comptador, proteccions diferencials, equip de 7.4 kW i certificat oficial CIE.'
      },
      {
        id: 'O-104',
        professional: 'ElectroMartínez Instal·lacions Elèctriques S.L.',
        categoria: 'electricitat',
        price: '150€',
        estat: 'Disponible',
        note: 'Revisió i butlletí elèctric oficial d\'habitatge (CIE) — Comprovació de presa de terra, aïllaments, actualització de potència i tramitació a la Conselleria.'
      },
      {
        id: 'O-105',
        professional: 'Soler Pintura & Alta Decoració S.L.',
        categoria: 'pintura',
        price: '890€',
        estat: 'Disponible',
        note: 'Pintura plàstica llisa blanca per a pis complet (fins a 90m²) — Sanejament d\'esquerdes, dues capes de pintura rentable premium, protecció de terres i neteja total.'
      },
      {
        id: 'O-106',
        professional: 'Soler Pintura & Alta Decoració S.L.',
        categoria: 'pintura',
        price: '1250€',
        estat: 'Disponible',
        note: 'Tractament i aplicació de microciment decoratiu en banys — Acabat continu impermeable sense juntes sobre rajoles existents amb segellat poliuretà.'
      },
      {
        id: 'O-107',
        professional: 'ClimaBeneyto Climatització & Aerotèrmia S.L.',
        categoria: 'climatitzacio',
        price: '380€',
        estat: 'Disponible',
        note: 'Instal·lació d\'aire condicionat split 1x1 inverter A+++ — Connexions frigorífiques fins a 4 metres, suport antivibratori exterior, buit i posada en marxa.'
      },
      {
        id: 'O-108',
        professional: 'ClimaBeneyto Climatització & Aerotèrmia S.L.',
        categoria: 'climatitzacio',
        price: '4200€',
        estat: 'Disponible',
        note: 'Estudi d\'eficiència i instal·lació d\'aerotèrmia domèstica — Substitució de caldera de gasoil/gas per bomba de calor reversible per a aigua calenta i calefacció.'
      },
      {
        id: 'O-109',
        professional: 'Fusteria Artesana Ribes & Fills S.L.',
        categoria: 'fusteria',
        price: '24€',
        estat: 'Disponible',
        note: 'Instal·lació de tarima flotant AC5 laminada (preu per m²) — Inclou aïllament tèrmic i acústic sota làmines, retall de portes de pas i sòcols perimetrals.'
      },
      {
        id: 'O-110',
        professional: 'Fusteria Artesana Ribes & Fills S.L.',
        categoria: 'fusteria',
        price: '210€',
        estat: 'Disponible',
        note: 'Portes massisses lacades blanques amb ferratges magnètics — Fabricació i muntatge amb premarc, tapajuntes de 7cm, pany magnètic silenciós i manetes d\'acer inoxidable.'
      },
      {
        id: 'O-111',
        professional: 'Llevant Reformes & Obres Integrals S.L.',
        categoria: 'reformes',
        price: '2800€',
        estat: 'Disponible',
        note: 'Reforma integral de bany complet amb canvi de banyera a plat — Demolicions, plat de resina antilliscant, rajolat ceràmic, aixetes termostàtiques i moble de bany amb mirall led.'
      },
      {
        id: 'O-112',
        professional: 'Llevant Reformes & Obres Integrals S.L.',
        categoria: 'reformes',
        price: '7500€',
        estat: 'Disponible',
        note: 'Reforma integral de cuina de disseny amb illa central — Mobiliari estratificat antirostoll, bancada de quars Silestone, fontaneria i electricitat noves amb garantia 5 anys.'
      },
      {
        id: 'O-113',
        professional: 'Serralleria Seguretat València 24H S.L.',
        categoria: 'serralleria',
        price: '140€',
        estat: 'Disponible',
        note: 'Canvi de bombí de seguretat antibumping i antirotura — Inclou cilindre d\'alta gamma amb targeta de propietat, 5 claus incopiables i escut protector cuirassat.'
      },
      {
        id: 'O-114',
        professional: 'Serralleria Seguretat València 24H S.L.',
        categoria: 'serralleria',
        price: '85€',
        estat: 'Disponible',
        note: 'Obertura urgent de porta blindada sense trencar el pany — Arribada en menys de 25 minuts a tota l\'àrea metropolitana. Obertura neta mitjançant eines de precisió.'
      },
      {
        id: 'O-115',
        professional: 'Cristalleria & Finestres Alumini Alvent S.L.',
        categoria: 'cristalleria',
        price: '290€',
        estat: 'Disponible',
        note: 'Finestra de PVC oscil·lobatent amb vidre doble acústic 4/16/4 — Perfileria alemanya Kömmerling de 5 cambres, aïllament tèrmic i acústic extrem, persiana d\'alumini tèrmic integrada.'
      },
      {
        id: 'O-116',
        professional: 'Cristalleria & Finestres Alumini Alvent S.L.',
        categoria: 'cristalleria',
        price: '340€',
        estat: 'Disponible',
        note: 'Mampara de dutxa de vidre temperat de 8mm anticalç — Full fix + porta corredissa suau, perfileria d\'alumini anoditzat brillant i tractament anticalç de fàbrica.'
      },
      {
        id: 'O-117',
        professional: 'EcoJardí Paisatgisme & Manteniment S.L.',
        categoria: 'jardineria',
        price: '28€',
        estat: 'Disponible',
        note: 'Instal·lació de gespa artificial d\'alta densitat 40mm (preu/m²) — Inclou preparació de terreny, malla geotèxtil antiherves, arena de sílice i raspallat mecànic.'
      },
      {
        id: 'O-118',
        professional: 'EcoJardí Paisatgisme & Manteniment S.L.',
        categoria: 'jardineria',
        price: '390€',
        estat: 'Disponible',
        note: 'Projecte i muntatge de reg per goteig automatitzat — Programador digital per zones amb sensor de pluja, canonades subterrànies i degotadors autocompensants.'
      },
      {
        id: 'O-119',
        professional: 'Neteges Industrials & Desinfeccions Marítima S.L.',
        categoria: 'neteja',
        price: '260€',
        estat: 'Disponible',
        note: 'Neteja de fi d\'obra profunda per a habitatge reformat — Eliminació de residus de guix, ciment, pintura i pols. Desinfecció integral de vidres, sanitaris, marcs i terres.'
      },
      {
        id: 'O-120',
        professional: 'Neteges Industrials & Desinfeccions Marítima S.L.',
        categoria: 'neteja',
        price: '320€',
        estat: 'Disponible',
        note: 'Poliment i cristal·litzat brillant de terra de marbre o terratzo — Decapat de brutícia antiga, diamantat de juntes i segellat químic de màxima brillantor i durabilitat.'
      }
    ];

    for (const o of ofertes) {
      await client.query(`
        INSERT INTO ofertes (id, professional, categoria, price, estat, note)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO UPDATE SET
          professional = EXCLUDED.professional,
          categoria = EXCLUDED.categoria,
          price = EXCLUDED.price,
          estat = EXCLUDED.estat,
          note = EXCLUDED.note
      `, [o.id, o.professional, o.categoria, o.price, o.estat, o.note]);
    }

    // 6. Inserció d'Incidències dels 10 Clients
    console.log('6. Inserint incidències obertes dels 10 clients...');
    const incidencies = [
      {
        id: 'INC-201',
        clientId: 'u-cli-joan',
        clientNom: 'Joan Albors i Vidal',
        titol: 'Avaria persistent al termo elèctric i pèrdua de pressió d\'aigua calenta',
        categoria: 'lampisteria',
        budget: '180€',
        descripcio: 'El termo elèctric de 80L goteja per la vàlvula de seguretat i fa salts a la pressió de l\'aigua calenta a la dutxa. Necessitem revisió urgent a Russafa.'
      },
      {
        id: 'INC-202',
        clientId: 'u-cli-marta',
        clientNom: 'Marta Navarro Beltran',
        titol: 'Instal·lació de línia dedicada i quadre secundari per a climatització',
        categoria: 'electricitat',
        budget: '290€',
        descripcio: 'Volem instal·lar una màquina d\'aire per conductes i cal portar una línia directa de 6mm des del quadre principal amb diferencial propi.'
      },
      {
        id: 'INC-203',
        clientId: 'u-cli-pau',
        clientNom: 'Pau Climent Soler',
        titol: 'Eliminació de gotelé i allisat de parets a menjador i passadís',
        categoria: 'pintura',
        budget: '750€',
        descripcio: 'Aproximadament 65m² de paret amb gotelé tradicional que volem allisar completament i pintar en blanc trencat mat.'
      },
      {
        id: 'INC-204',
        clientId: 'u-cli-laura',
        clientNom: 'Laura Giménez Ortiz',
        titol: 'Substitució de persianes velles de fusta per persianes d\'alumini tèrmic',
        categoria: 'cristalleria',
        budget: '450€',
        descripcio: 'Tres finestrals al centre històric amb cintes trencades i lames deteriorades. Cal canvi a alumini amb aïllant interior de poliuretà.'
      },
      {
        id: 'INC-205',
        clientId: 'u-cli-andreu',
        clientNom: 'Andreu Soriano Puig',
        titol: 'Muntatge d\'armari encastat a mida de 3 cossos amb calaixeres',
        categoria: 'fusteria',
        budget: '980€',
        descripcio: 'Hueco d\'obra de 2.60m d\'alçada per 2.10m d\'amplada. Portes corredisses blanques i distribució interior amb barres i prestatgeries.'
      },
      {
        id: 'INC-206',
        clientId: 'u-cli-silvia',
        clientNom: 'Sílvia Fuster Montaner',
        titol: 'Canvi de banyera per plat de dutxa de resina antilliscant',
        categoria: 'reformes',
        budget: '1200€',
        descripcio: 'Retirar banyera existent de ferro fos de 1.40m, col·locar plat de dutxa extraplà, aixeta termostàtica i enrajolat de la zona afectada.'
      },
      {
        id: 'INC-207',
        clientId: 'u-cli-marc',
        clientNom: 'Marc Vila Segarra',
        titol: 'Instal·lació de pany invisible de seguretat amb comandament',
        categoria: 'serralleria',
        budget: '190€',
        descripcio: 'Volem reforçar la porta principal de la vivenda amb un pany electrònic invisible complementari al bombí existent.'
      },
      {
        id: 'INC-208',
        clientId: 'u-cli-carla',
        clientNom: 'Carla Revert Llopis',
        titol: 'Poda i neteja de palmeres i bardissa perimetral de xiprer',
        categoria: 'jardineria',
        budget: '320€',
        descripcio: 'Jardí privat amb 2 palmeres que requereixen sanejament de fulles seques i 30 metres de bardissa que necessita retallat de forma.'
      },
      {
        id: 'INC-209',
        clientId: 'u-cli-voro',
        clientNom: 'Vicent Barberà Camps',
        titol: 'Neteja de xoc i desgreixat de cuina i cambres de bany',
        categoria: 'neteja',
        budget: '220€',
        descripcio: 'Entrem a viure a un immoble de lloguer i requerim neteja exhaustiva de rajoles, forn, campana extractora i sanitaris.'
      },
      {
        id: 'INC-210',
        clientId: 'u-cli-elena',
        clientNom: 'Elena Domènech Sancho',
        titol: 'Substitució de radiadors antics per unitats d\'alta emissió tèrmica',
        categoria: 'climatitzacio',
        budget: '600€',
        descripcio: 'Canvi de 4 radiadors d\'alumini per millorar el rendiment de la calefacció central i instal·lació de vàlvules termostàtiques.'
      }
    ];

    for (const inc of incidencies) {
      await client.query(`
        INSERT INTO incidencies (id, client_id, client_nom, titol, categoria, budget, estat, descripcio, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, 'Oberta', $7, NOW())
        ON CONFLICT (id) DO UPDATE SET
          client_id = EXCLUDED.client_id,
          client_nom = EXCLUDED.client_nom,
          titol = EXCLUDED.titol,
          categoria = EXCLUDED.categoria,
          budget = EXCLUDED.budget,
          estat = EXCLUDED.estat,
          descripcio = EXCLUDED.descripcio
      `, [inc.id, inc.clientId, inc.clientNom, inc.titol, inc.categoria, inc.budget, inc.descripcio]);
    }

    // 7. Inserció de Tasques en curs / convingudes
    console.log('7. Inserint tasques acordades en curs...');
    const tasquesConvergides = [
      {
        id: 'T-301',
        titol: 'Reparació integral de canonada baixant d\'aigües pluvials',
        clientNom: 'Joan Albors i Vidal',
        categoria: 'lampisteria',
        budget: '450€',
        estat: 'En curs',
        preuAcordat: '450€',
        descripcio: 'Sanejament d\'arqueta i substitució del tram deteriorat del baixant comunitari a la façana interior.'
      },
      {
        id: 'T-302',
        titol: 'Reforma d\'escomesa elèctrica i instal·lació de quadre d\'automàtics',
        clientNom: 'Marta Navarro Beltran',
        categoria: 'electricitat',
        budget: '820€',
        estat: 'En curs',
        preuAcordat: '820€',
        descripcio: 'Substitució de la línia repartidora i instal·lació de nou quadre general amb protecció contra sobretensions permanents i transitòries.'
      },
      {
        id: 'T-303',
        titol: 'Pintura d\'interiors i impermeabilització de terrassa transitable',
        clientNom: 'Pau Climent Soler',
        categoria: 'pintura',
        budget: '1150€',
        estat: 'Finalitzada',
        preuAcordat: '1150€',
        descripcio: 'Aplicació de membrana de poliuretà líquid amb fibra de vidre a la coberta i pintura plàstica antifongs a les habitacions.'
      }
    ];

    for (const t of tasquesConvergides) {
      await client.query(`
        INSERT INTO tasques (id, titol, descripcio, categoria, client_nom, budget, estat, preu_acordat, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
        ON CONFLICT (id) DO UPDATE SET
          titol = EXCLUDED.titol,
          descripcio = EXCLUDED.descripcio,
          categoria = EXCLUDED.categoria,
          client_nom = EXCLUDED.client_nom,
          budget = EXCLUDED.budget,
          estat = EXCLUDED.estat,
          preu_acordat = EXCLUDED.preu_acordat
      `, [t.id, t.titol, t.descripcio, t.categoria, t.clientNom, t.budget, t.estat, t.preuAcordat]);
    }

    // 8. Inserció de Ressenyes reals
    console.log('8. Inserint ressenyes reals d\'usuaris sobre les empreses...');
    const resenyes = [
      {
        id: 'REV-401',
        treballadorId: 'u-pro-fontanals',
        professionalNom: 'Fontanals Lampisteria & Climatització S.L.',
        clientId: 'u-cli-joan',
        puntuacio: 5,
        comentari: 'Servei excel·lent! Varen vindre en menys de 40 minuts un dissabte de matí per una fuita d\'aigua greu. Molt professionals, nets i amb preu raonable.',
        descripcio: 'Reparació urgent de fuita d\'aigua'
      },
      {
        id: 'REV-402',
        treballadorId: 'u-pro-electromartinez',
        professionalNom: 'ElectroMartínez Instal·lacions Elèctriques S.L.',
        clientId: 'u-cli-marta',
        puntuacio: 5,
        comentari: 'Molt recomanables per a la instal·lació del punt de recàrrega del cotxe. Ens varen tramitar tot el butlletí sense cap complicació.',
        descripcio: 'Punt de recàrrega de vehicle elèctric'
      },
      {
        id: 'REV-403',
        treballadorId: 'u-pro-solerpintures',
        professionalNom: 'Soler Pintura & Alta Decoració S.L.',
        clientId: 'u-cli-pau',
        puntuacio: 5,
        comentari: 'Una feina de pintura impecable. Parets totalment llises i van deixar el pis netíssim. Sens dubte tornarem a comptar amb ells.',
        descripcio: 'Pintura d\'interiors completa'
      },
      {
        id: 'REV-404',
        treballadorId: 'u-pro-climabeneyto',
        professionalNom: 'ClimaBeneyto Climatització & Aerotèrmia S.L.',
        clientId: 'u-cli-laura',
        puntuacio: 5,
        comentari: 'Ens varen instal·lar l\'aire condicionat per conductes. Silenciós, eficient i un equip humà de deu.',
        descripcio: 'Climatització per conductes'
      },
      {
        id: 'REV-405',
        treballadorId: 'u-pro-fusteriaribes',
        professionalNom: 'Fusteria Artesana Ribes & Fills S.L.',
        clientId: 'u-cli-andreu',
        puntuacio: 4,
        comentari: 'Armaris fets amb fusta de gran qualitat i ajustats al mil·límetre. Grans professionals de la fusta tradicional.',
        descripcio: 'Mobiliari a mida'
      },
      {
        id: 'REV-406',
        treballadorId: 'u-pro-llevant',
        professionalNom: 'Llevant Reformes & Obres Integrals S.L.',
        clientId: 'u-cli-silvia',
        puntuacio: 5,
        comentari: 'Vam fer la reforma del bany i de la cuina. Van complir els terminis acordats al contracte i els acabats són de revista.',
        descripcio: 'Reforma integral de cuina i bany'
      },
      {
        id: 'REV-407',
        treballadorId: 'u-pro-serralleriaval',
        professionalNom: 'Serralleria Seguretat València 24H S.L.',
        clientId: 'u-cli-marc',
        puntuacio: 5,
        comentari: 'Ens vam deixar les claus posades per dins i van obrir la porta en un tres i no res sense ratllar ni el marc ni el pany. Ràpids i eficaços.',
        descripcio: 'Obertura urgent de porta blindada'
      },
      {
        id: 'REV-408',
        treballadorId: 'u-pro-cristalleriaalvent',
        professionalNom: 'Cristalleria & Finestres Alumini Alvent S.L.',
        clientId: 'u-cli-carla',
        puntuacio: 5,
        comentari: 'La mampara de bany a mida ha quedat espectacular. Materials resistents i instal·ladors molt curosos.',
        descripcio: 'Mampara de vidre temperat'
      },
      {
        id: 'REV-409',
        treballadorId: 'u-pro-ecojardi',
        professionalNom: 'EcoJardí Paisatgisme & Manteniment S.L.',
        clientId: 'u-cli-voro',
        puntuacio: 4,
        comentari: 'La instal·lació de gespa artificial i el reg automàtic han transformat completament el xalet. Molt bons consells de manteniment.',
        descripcio: 'Gespa artificial i reg per goteig'
      },
      {
        id: 'REV-410',
        treballadorId: 'u-pro-netegesmaritima',
        professionalNom: 'Neteges Industrials & Desinfeccions Marítima S.L.',
        clientId: 'u-cli-elena',
        puntuacio: 5,
        comentari: 'Neteja de fi d\'obra excel·lent. Van retirar tota la pols del guix i van deixar el marbre brillant com un espill.',
        descripcio: 'Neteja final d\'obra'
      }
    ];

    for (const r of resenyes) {
      await client.query(`
        INSERT INTO resenyes (id, treballador_id, professional_nom, client_id, puntuacio, comentari, descripcio, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW() - interval '2 days')
        ON CONFLICT (id) DO UPDATE SET
          treballador_id = EXCLUDED.treballador_id,
          professional_nom = EXCLUDED.professional_nom,
          client_id = EXCLUDED.client_id,
          puntuacio = EXCLUDED.puntuacio,
          comentari = EXCLUDED.comentari,
          descripcio = EXCLUDED.descripcio
      `, [r.id, r.treballadorId, r.professionalNom, r.clientId, r.puntuacio, r.comentari, r.descripcio]);
    }

    // 9. Inserció a la taula publicacions (tipus 'OFERTA' i 'INCIDENCIA')
    console.log('9. Sincronitzant taula publicacions...');
    for (const o of ofertes) {
      const parts = o.note.split(' — ');
      const titol = parts[0] || o.categoria;
      const desc = parts[1] || o.note;
      await client.query(`
        INSERT INTO publicacions (id, usuari_id, usuari_nom, tipus, titol, descripcio, categoria, preu_o_pressupost, created_at)
        VALUES ($1, 'u-pro', $2, 'OFERTA', $3, $4, $5, $6, NOW())
        ON CONFLICT (id) DO UPDATE SET
          usuari_nom = EXCLUDED.usuari_nom,
          titol = EXCLUDED.titol,
          descripcio = EXCLUDED.descripcio,
          categoria = EXCLUDED.categoria,
          preu_o_pressupost = EXCLUDED.preu_o_pressupost
      `, [o.id, o.professional, titol, desc, o.categoria, o.price]);
    }

    await client.query('COMMIT');
    console.log('🎉 Operació completada amb èxit! 10 empreses i 10 clients inserits a jjaux_db!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error durant l\'execució de la transacció:', err);
    throw err;
  } finally {
    await client.end();
  }
}

execute().catch(e => {
  console.error(e);
  process.exit(1);
});
