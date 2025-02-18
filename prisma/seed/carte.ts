import { PrismaClient, Couleur } from "@prisma/client";

const prisma = new PrismaClient();

// 📌 URL du verso des cartes (à adapter si besoin)
const VERSO_CARTE_URL = "https://i.ibb.co/5MWkZdq/Verso-Carte-tarot.jpg";

// 📌 Tableau des 78 images avec les `""` ajoutés
const IMAGE_URLS = [
  "https://i.ibb.co/7CKTNf8/1-coeur.png",
  "https://i.ibb.co/xXHqGMg/2-coeur.png",
  "https://i.ibb.co/MGGCN9C/3-coeur.png",
  "https://i.ibb.co/VxzrrNg/4-coeur.png",
  "https://i.ibb.co/WkJMdNy/5-coeur.png",
  "https://i.ibb.co/TcTrwZL/6-coeur.png",
  "https://i.ibb.co/QYxNHjD/7-coeur.png",
  "https://i.ibb.co/tXT21Dh/8-coeur.png",
  "https://i.ibb.co/vhWLrcK/9-coeur.png",
  "https://i.ibb.co/3sXZPmf/10-coeur.png",
  "https://i.ibb.co/9cZdHKc/Valet.jpg",
  "https://i.ibb.co/QrbRfzG/Cavalier.jpg",
  "https://i.ibb.co/3MksV2J/Dame.jpg",
  "https://i.ibb.co/Vt9pBy9/Roi.jpg",

  "https://i.ibb.co/Hnn4TfB/1-carreau.png",
  "https://i.ibb.co/QvmYHk6/2-carreau.png",
  "https://i.ibb.co/1m10nS4/3-carreau.png",
  "https://i.ibb.co/dQ4rtDK/4-carreau.png",
  "https://i.ibb.co/SRK23K4/5-carreau.png",
  "https://i.ibb.co/jzQZQMW/6-carreau.png",
  "https://i.ibb.co/XV5vj4s/7-carreau.png",
  "https://i.ibb.co/FbtJQLP/8-carreau.png",
  "https://i.ibb.co/6tjXbJY/9-carreau.png",
  "https://i.ibb.co/YWk6XqG/10-carreau.png",
  "https://i.ibb.co/TkvxtZw/Valet.jpg",
  "https://i.ibb.co/ZKv35b0/Cavalier.jpg",
  "https://i.ibb.co/vVqvK9y/Dame.jpg",
  "https://i.ibb.co/cJXLGb7/Roi.jpg",

  "https://i.ibb.co/4JtKSLq/1-pique.png",
  "https://i.ibb.co/nR7bmRV/2-pique.png",
  "https://i.ibb.co/qM4mxT3/3-pique.png",
  "https://i.ibb.co/5MfpdxV/4-pique.png",
  "https://i.ibb.co/Cv04j2Y/5-pique.png",
  "https://i.ibb.co/GWTNR30/6-pique.png",
  "https://i.ibb.co/ckWLZjf/7-pique.png",
  "https://i.ibb.co/g6pLfLF/8-pique.png",
  "https://i.ibb.co/XpMVtk8/9-pique.png",
  "https://i.ibb.co/wCDnJD1/10-pique.png",
  "https://i.ibb.co/hXSmVnN/Valet.jpg",
  "https://i.ibb.co/wp6GV7p/Cavalier.jpg",
  "https://i.ibb.co/FHzwcBq/Dame.jpg",
  "https://i.ibb.co/N6Dqywy/Roi.jpg",

  "https://i.ibb.co/7kzXPmr/1-trefle.png",
  "https://i.ibb.co/Dw1v2BK/2-trefle.png",
  "https://i.ibb.co/7Y4GNsN/3-trefle.png",
  "https://i.ibb.co/8z1d5DN/4-trefle.png",
  "https://i.ibb.co/9bS3YSG/5-trefle.png",
  "https://i.ibb.co/Lvjy7N0/6-trefle.png",
  "https://i.ibb.co/bj0xRpr/7-trefle.png",
  "https://i.ibb.co/MnwvfjN/8-trefle.png",
  "https://i.ibb.co/bF4rTB3/9-trefle.png",
  "https://i.ibb.co/BydWzVf/10-trefle.png",
  "https://i.ibb.co/4Yht9nz/Valet.jpg",
  "https://i.ibb.co/ypyRR7h/Cavalier.jpg",
  "https://i.ibb.co/Yhfx661/Dame.jpg",
  "https://i.ibb.co/j3RGwS4/Roi.jpg",

  "https://i.ibb.co/Lxqs5KY/1-atout.jpg",
  "https://i.ibb.co/zZ5tCKQ/2-atout.jpg",
  "https://i.ibb.co/txZx551/3-atout.jpg",
  "https://i.ibb.co/5ckbdcr/4-atout.jpg",
  "https://i.ibb.co/M5qPKj6/5-atout.jpg",
  "https://i.ibb.co/jwP8mHx/6-atout.jpg",
  "https://i.ibb.co/MM4zK4J/7-atout.jpg",
  "https://i.ibb.co/PzMykzS/8-atout.jpg",
  "https://i.ibb.co/bFTgsDX/9-atout.jpg",
  "https://i.ibb.co/QnYV0wM/10-atout.jpg",
  "https://i.ibb.co/wJtLKpG/11-atout.jpg",
  "https://i.ibb.co/2SgJ4Bg/12-atout.jpg",
  "https://i.ibb.co/1vWBdBM/13-atout.jpg",
  "https://i.ibb.co/C6JnmMD/14-atout.jpg",
  "https://i.ibb.co/Zhjy8Dw/15-atout.jpg",
  "https://i.ibb.co/LpS54vz/16-atout.jpg",
  "https://i.ibb.co/X7yzNcw/17-atout.jpg",
  "https://i.ibb.co/9q9NQdB/18-atout.jpg",
  "https://i.ibb.co/xFK4cDv/19-atout.jpg",
  "https://i.ibb.co/zFf8gxw/20-atout.jpg",
  "https://i.ibb.co/V9qW0jy/21-atout.jpg",
  "https://i.ibb.co/12sqpLg/Excuse.jpg",
];

function generateCartes() {
  let id = 1;
  const cartes = [];

  const couleurs = ["COEUR", "CARREAU", "PIQUE", "TREFLE"] as Couleur[];

  for (const couleur of couleurs) {
    for (let valeur = 1; valeur <= 14; valeur++) {
      cartes.push({
        id: id,
        nom: `${valeur} ${couleur.toLowerCase()}`,
        couleur,
        valeur,
        bout: false,
        atout: false,
        points: valeur >= 11 ? valeur - 9 : 0.5,
        image1: IMAGE_URLS[id - 1], // ✅ Associe l'image correcte
        image2: VERSO_CARTE_URL,
      });
      id++;
    }
  }

  for (let valeur = 1; valeur <= 21; valeur++) {
    cartes.push({
      id: id,
      nom: `${valeur} atout`,
      couleur: "ATOUT" as Couleur,
      valeur,
      bout: [1, 21].includes(valeur),
      atout: true,
      points: [1, 21].includes(valeur) ? 5 : 0.5,
      image1: IMAGE_URLS[id - 1], // ✅ Associe l'image correcte
      image2: VERSO_CARTE_URL,
    });
    id++;
  }

  cartes.push({
    id: id,
    nom: "Excuse",
    couleur: "EXCUSE" as Couleur,
    valeur: 1,
    bout: true,
    atout: false,
    points: 5,
    image1: IMAGE_URLS[id - 1], // ✅ Associe l'image correcte
    image2: VERSO_CARTE_URL,
  });

  return cartes;
}

async function main() {
  console.log("🔄 Suppression des anciennes cartes...");
  await prisma.carte.deleteMany();

  console.log("🃏 Insertion des 78 cartes du Tarot...");
  const cartes = generateCartes();

  for (const carte of cartes) {
    await prisma.carte.create({ data: carte });
  }

  console.log("✅ Toutes les cartes ont été ajoutées avec succès !");
}

main()
  .catch((e) => {
    console.error("❌ Erreur lors du seed :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
