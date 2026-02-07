import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const treks = [
  {
    slug: "brahmatal-trek",
    title: "Brahmatal Trek",
    duration: "6 Days",
    difficulty: "Moderate",
    season: "Winter (Dec - Mar)",
    shortDescription:
      "A winter trek with frozen lakes and sweeping views of Trishul and Nanda Ghunti.",
    fullDescription:
      "Brahmatal is a classic winter trek offering snow-covered forests, alpine ridges, and the famous Brahmatal and Bekaltal lakes. The trail rewards you with panoramic Himalayan views, especially of Trishul and Nanda Ghunti.",
    itinerary: [
      { day: 1, title: "Lohajung Arrival", desc: "Drive from Kathgodam to Lohajung." },
      { day: 2, title: "Lohajung to Bekaltal", desc: "Trek through oak and rhododendron forests to Bekaltal." },
      { day: 3, title: "Bekaltal to Brahmatal", desc: "Climb to Brahmatal campsite with views of snow peaks." },
      { day: 4, title: "Summit Day", desc: "Summit ridge walk with views of Trishul and Nanda Ghunti." },
      { day: 5, title: "Return to Lohajung", desc: "Descend back to Lohajung." },
      { day: 6, title: "Departure", desc: "Drive back to Kathgodam." },
    ],
    price: "₹8,999",
    originalPrice: 9999,
    discountedPrice: 8999,
    coverImage: "/images/treks/brahmatal-cover.svg",
    gallery: [
      "/images/treks/brahmatal-gallery-1.svg",
      "/images/treks/brahmatal-gallery-2.svg",
      "/images/treks/brahmatal-gallery-3.svg"
    ],
  },
  {
    slug: "kedarkantha-trek",
    title: "Kedarkantha Trek",
    duration: "6 Days",
    difficulty: "Easy to Moderate",
    season: "Winter (Dec - Apr)",
    shortDescription:
      "A classic winter trek with a summit climb, offering 360-degree views of Himalayan peaks.",
    fullDescription:
      "Kedarkantha is one of the most popular winter treks in India. It is known for its beautiful campsites surrounded by giant pine trees and a summit that offers a 360-degree view of famous mountain peaks like Swargarohini, Black Peak, and Bandarpoonch. The trail is perfect for beginners, offering a mix of dense forests and open meadows covered in snow.",
    itinerary: [
      {
        day: 1,
        title: "Arrival in Sankri",
        desc: "Drive from Dehradun to Sankri (10 hrs). Overnight stay in guest house.",
      },
      {
        day: 2,
        title: "Sankri to Juda Ka Talab",
        desc: "Trek through pine forests to reach the frozen lake of Juda Ka Talab (4km).",
      },
      {
        day: 3,
        title: "Juda Ka Talab to Kedarkantha Base",
        desc: "Short trek to the base camp with stunning views of snow-capped peaks.",
      },
      {
        day: 4,
        title: "Summit Day",
        desc: "Early morning climb to the summit (12,500 ft) and descent to Hargaon.",
      },
      {
        day: 5,
        title: "Hargaon to Sankri",
        desc: "Descend back to Sankri village. Celebrate the completion of the trek.",
      },
      { day: 6, title: "Departure", desc: "Drive back to Dehradun." },
    ],
    price: "₹8,500",
    originalPrice: 9500,
    discountedPrice: 8500,
    coverImage: "/images/treks/kedarkantha-cover.svg",
    gallery: [
      "/images/treks/kedarkantha-gallery-1.svg",
      "/images/treks/kedarkantha-gallery-2.svg",
      "/images/treks/kedarkantha-gallery-3.svg"
    ],
  },
  {
    slug: "hampta-pass",
    title: "Hampta Pass Trek",
    duration: "5 Days",
    difficulty: "Moderate",
    season: "Monsoon (Jun - Sep)",
    shortDescription:
      "A dramatic crossover trek from the lush green Kullu valley to the arid Spiti valley.",
    fullDescription:
      "Hampta Pass is a unique trek that takes you through two distinct landscapes. You start in the lush green valleys of Manali, crossing varied flora, and emerge into the barren, stark landscape of Lahaul and Spiti. The pass crossing is thrilling, and the visit to Chandratal Lake is the cherry on top.",
    itinerary: [
      {
        day: 1,
        title: "Manali to Jobra",
        desc: "Drive to Jobra and short trek to Chika.",
      },
      {
        day: 2,
        title: "Chika to Balu Ka Ghera",
        desc: "Trek along the river through flower-filled meadows.",
      },
      {
        day: 3,
        title: "Crossing the Pass",
        desc: "Steep ascent to Hampta Pass (14,000 ft) and descent to Shea Goru.",
      },
      {
        day: 4,
        title: "Shea Goru to Chatru",
        desc: "Descent to the roadhead at Chatru. Drive to Chandratal Lake.",
      },
      { day: 5, title: "Departure", desc: "Drive from Chatru to Manali." },
    ],
    price: "₹10,200",
    originalPrice: 11200,
    discountedPrice: 10200,
    coverImage: "/images/treks/hampta-cover.svg",
    gallery: [
      "/images/treks/hampta-gallery-1.svg",
      "/images/treks/hampta-gallery-2.svg",
      "/images/treks/hampta-gallery-3.svg"
    ],
  },
  {
    slug: "roopkund-trek",
    title: "Roopkund Trek",
    duration: "8 Days",
    difficulty: "Difficult",
    season: "Summer & Autumn",
    shortDescription:
      "The mysterious skeleton lake trek, featuring alpine meadows and stunning views of Mt. Trishul.",
    fullDescription:
      "Roopkund is famous for its high-altitude glacial lake where hundreds of human skeletons are found. The trail passes through the twin meadows of Ali Bugyal and Bedni Bugyal, considered some of the most beautiful in Asia. The climb is challenging but rewards you with up-close views of Mt. Trishul and Nanda Ghunti.",
    itinerary: [
      {
        day: 1,
        title: "Lohajung Arrival",
        desc: "Drive from Kathgodam to Lohajung base camp.",
      },
      { day: 2, title: "Lohajung to Didna", desc: "Trek through mixed forests to Didna village." },
      { day: 3, title: "Didna to Ali Bugyal", desc: "Climb through oak forests to reach the vast meadows." },
      { day: 4, title: "Explore Bedni Bugyal", desc: "Short trek to Ghora Lotani via Bedni Bugyal." },
      { day: 5, title: "The Climb", desc: "Ascend to Bhagwabasa, the advanced base camp." },
      {
        day: 6,
        title: "Summit Day",
        desc: "Trek to Roopkund Lake and Junargali Ridge. Return to Bedni Bugyal.",
      },
      { day: 7, title: "Return", desc: "Descent to Wan village and drive to Lohajung." },
      { day: 8, title: "Departure", desc: "Drive back to Kathgodam." },
    ],
    price: "₹14,500",
    originalPrice: 15500,
    discountedPrice: 14500,
    coverImage: "/images/treks/roopkund-cover.svg",
    gallery: [
      "/images/treks/roopkund-gallery-1.svg",
      "/images/treks/roopkund-gallery-2.svg",
      "/images/treks/roopkund-gallery-3.svg"
    ],
  },
  {
    slug: "valley-of-flowers",
    title: "Valley of Flowers",
    duration: "6 Days",
    difficulty: "Moderate",
    season: "July - September",
    shortDescription:
      "A UNESCO World Heritage site known for its endemic alpine flowers and rich biodiversity.",
    fullDescription:
      "The Valley of Flowers is a fairytale land. In full bloom, the valley is a carpet of colors with flowers like Blue Poppy, Brahma Kamal, and Cobra Lily. It's a photographer's paradise and a nature lover's dream. The trek also includes a visit to the holy Sikh shrine of Hemkund Sahib.",
    itinerary: [
      { day: 1, title: "Govindghat", desc: "Drive from Rishikesh to Govindghat." },
      { day: 2, title: "Trek to Ghangaria", desc: "13km trek to the base village of Ghangaria." },
      { day: 3, title: "Valley Visit", desc: "Enter the national park and explore the valley." },
      { day: 4, title: "Hemkund Sahib", desc: "Steep climb to the gurudwara at 14,000 ft." },
      { day: 5, title: "Return", desc: "Trek back to Govindghat. Drive to Joshimath." },
      { day: 6, title: "Departure", desc: "Drive back to Rishikesh." },
    ],
    price: "₹9,800",
    originalPrice: 10900,
    discountedPrice: 9800,
    coverImage: "/images/treks/valley-of-flowers-cover.svg",
    gallery: [
      "/images/treks/valley-of-flowers-gallery-1.svg",
      "/images/treks/valley-of-flowers-gallery-2.svg",
      "/images/treks/valley-of-flowers-gallery-3.svg"
    ],
  },
  {
    slug: "kashmir-great-lakes",
    title: "Kashmir Great Lakes",
    duration: "8 Days",
    difficulty: "Moderate to Difficult",
    season: "July - September",
    shortDescription:
      "Arguably the prettiest trek in India, featuring seven turquoise alpine lakes.",
    fullDescription:
      "This trek is a visual masterpiece. Every day brings a new alpine lake, each more beautiful than the last. You walk through maple forests, cross high passes, and camp beside these pristine water bodies. The contrast of green meadows against rugged mountains and blue lakes is breathtaking.",
    itinerary: [
      { day: 1, title: "Sonamarg", desc: "Arrival in Srinagar and drive to Sonamarg." },
      { day: 2, title: "Nichnai", desc: "Trek through meadows to Nichnai campsite." },
      { day: 3, title: "Vishansar Lake", desc: "Cross Nichnai pass to reach the first major lakes." },
      { day: 4, title: "Gadsar", desc: "Cross Gadsar pass, the highest point, to reach the lake of flowers." },
      { day: 5, title: "Satsar", desc: "Short trek to the seven lakes of Satsar." },
      { day: 6, title: "Gangabal", desc: "Cross Zajibal pass for twin lakes views." },
      { day: 7, title: "Naranag", desc: "Descent to Naranag civilization." },
      { day: 8, title: "Departure", desc: "Drive to Srinagar." },
    ],
    price: "₹15,900",
    originalPrice: 16900,
    discountedPrice: 15900,
    coverImage: "/images/treks/kashmir-lakes-cover.svg",
    gallery: [
      "/images/treks/kashmir-lakes-gallery-1.svg",
      "/images/treks/kashmir-lakes-gallery-2.svg",
      "/images/treks/kashmir-lakes-gallery-3.svg"
    ],
  },
  {
    slug: "sandakphu-trek",
    title: "Sandakphu Phalut",
    duration: "7 Days",
    difficulty: "Moderate",
    season: "Oct - Apr",
    shortDescription:
      "The only trek in India from where you can see four of the world's tallest peaks.",
    fullDescription:
      "Sandakphu is the highest peak in West Bengal. This trek follows the border between India and Nepal. The highlight is the 'Sleeping Buddha' formation of Kanchenjunga and views of Mt. Everest, Lhotse, and Makalu. In spring, the trail is ablaze with rhododendrons.",
    itinerary: [
      { day: 1, title: "Manebhanjan", desc: "Drive from NJP to Manebhanjan." },
      { day: 2, title: "Tumling", desc: "Trek to Tumling in Nepal." },
      { day: 3, title: "Kalipokhri", desc: "Walk through the Singalila National Park." },
      { day: 4, title: "Sandakphu", desc: "Climb to the highest point for sunset views." },
      { day: 5, title: "Phalut", desc: "Ridge walk with constant mountain views." },
      { day: 6, title: "Gorkhey", desc: "Descend through bamboo forests." },
      { day: 7, title: "Return", desc: "Trek to Srikhola and drive back." },
    ],
    price: "₹11,500",
    originalPrice: 12500,
    discountedPrice: 11500,
    coverImage: "/images/treks/sandakphu-cover.svg",
    gallery: [
      "/images/treks/sandakphu-gallery-1.svg",
      "/images/treks/sandakphu-gallery-2.svg",
      "/images/treks/sandakphu-gallery-3.svg"
    ],
  },
  {
    slug: "kuari-pass-trek",
    title: "Kuari Pass",
    duration: "7 Days",
    difficulty: "Moderate",
    season: "Oct - Apr",
    shortDescription:
      "A classic Himalayan winter trek with stunning views and long alpine meadows.",
    fullDescription:
      "Kuari Pass is a high-altitude trek with panoramic views of Nanda Devi, Dronagiri, and the greater Himalayan range. The trail mixes dense forests, quaint villages, and open ridge walks with sweeping vistas.",
    itinerary: [
      { day: 1, title: "Joshimath Arrival", desc: "Drive from Rishikesh to Joshimath." },
      { day: 2, title: "Dhak to Gulling", desc: "Trek through terraced fields to Gulling." },
      { day: 3, title: "Gulling to Tali", desc: "Forest trail to the Tali campsite." },
      { day: 4, title: "Kuari Pass", desc: "Summit day with breathtaking Himalayan views." },
      { day: 5, title: "Tali to Auli", desc: "Descend through forests to Auli." },
      { day: 6, title: "Auli to Joshimath", desc: "Drive back to Joshimath." },
      { day: 7, title: "Departure", desc: "Drive to Rishikesh." },
    ],
    price: "₹8,499",
    originalPrice: 9499,
    discountedPrice: 8499,
    coverImage: "/images/treks/kuari-pass-cover.svg",
    gallery: [
      "/images/treks/kuari-pass-gallery-1.svg",
      "/images/treks/kuari-pass-gallery-2.svg",
      "/images/treks/kuari-pass-gallery-3.svg"
    ],
  },
];

const priceToNumber = (price: string) =>
  Number(price.replace(/[^0-9]/g, "")) || 0;

async function main() {
  console.log("🌱 Seeding database...");

  for (let i = 0; i < treks.length; i += 1) {
    const trek = treks[i];
    const basePrice = priceToNumber(trek.price);
    const start1 = new Date(2026, 2 + i, 10);
    const end1 = new Date(2026, 2 + i, 15);
    const start2 = new Date(2026, 3 + i, 5);
    const end2 = new Date(2026, 3 + i, 10);

    await prisma.trek.upsert({
      where: { slug: trek.slug },
      update: {
        title: trek.title,
        description: trek.shortDescription,
        duration: trek.duration,
        difficulty: trek.difficulty,
        season: trek.season,
        shortDescription: trek.shortDescription,
        fullDescription: trek.fullDescription,
        itinerary: trek.itinerary,
        price: trek.price,
        coverImage: trek.coverImage,
        gallery: trek.gallery,
        isActive: true,
      },
      create: {
        title: trek.title,
        slug: trek.slug,
        description: trek.shortDescription,
        duration: trek.duration,
        difficulty: trek.difficulty,
        season: trek.season,
        shortDescription: trek.shortDescription,
        fullDescription: trek.fullDescription,
        itinerary: trek.itinerary,
        price: trek.price,
        coverImage: trek.coverImage,
        gallery: trek.gallery,
        isActive: true,
        departures: {
          create: [
            {
              startDate: start1,
              endDate: end1,
              totalSeats: 20,
              pricePerSeat: (trek.discountedPrice || basePrice || 8000),
            },
            {
              startDate: start2,
              endDate: end2,
              totalSeats: 18,
              pricePerSeat: (trek.discountedPrice || basePrice || 8000),
            },
          ],
        },
      },
    });
  }

  console.log("✅ Seed completed");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
