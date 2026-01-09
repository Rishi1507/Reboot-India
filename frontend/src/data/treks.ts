import { Trek } from "@shared/schema";

export const treks: Trek[] = [
  {
    id: 1,
    slug: "kedarkantha-trek",
    title: "Kedarkantha Trek",
    duration: "6 Days",
    difficulty: "Easy to Moderate",
    season: "Winter (Dec - Apr)",
    shortDescription: "A classic winter trek with a summit climb, offering 360-degree views of Himalayan peaks.",
    fullDescription: "Kedarkantha is one of the most popular winter treks in India. It is known for its beautiful campsites surrounded by giant pine trees and a summit that offers a 360-degree view of famous mountain peaks like Swargarohini, Black Peak, and Bandarpoonch. The trail is perfect for beginners, offering a mix of dense forests and open meadows covered in snow.",
    itinerary: [
      { day: 1, title: "Arrival in Sankri", desc: "Drive from Dehradun to Sankri (10 hrs). Overnight stay in guest house." },
      { day: 2, title: "Sankri to Juda Ka Talab", desc: "Trek through pine forests to reach the frozen lake of Juda Ka Talab (4km)." },
      { day: 3, title: "Juda Ka Talab to Kedarkantha Base", desc: "Short trek to the base camp with stunning views of snow-capped peaks." },
      { day: 4, title: "Summit Day", desc: "Early morning climb to the summit (12,500 ft) and descent to Hargaon." },
      { day: 5, title: "Hargaon to Sankri", desc: "Descend back to Sankri village. Celebrate the completion of the trek." },
      { day: 6, title: "Departure", desc: "Drive back to Dehradun." }
    ],
    price: "₹8,500",
    coverImage: "https://images.unsplash.com/photo-1518182170546-0766ce6fec93?auto=format&fit=crop&q=80&w=1200", // Winter mountains
    gallery: [
      "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800"
    ]
  },
 {
    id: 2,
    slug: "hampta-pass",
    title: "Hampta Pass Trek",
    duration: "5 Days",
    difficulty: "Moderate",
    season: "Monsoon (Jun - Sep)",
    shortDescription: "A dramatic crossover trek from the lush green Kullu valley to the arid Spiti valley.",
    fullDescription: "Hampta Pass is a unique trek that takes you through two distinct landscapes. You start in the lush green valleys of Manali, crossing varied flora, and emerge into the barren, stark landscape of Lahaul and Spiti. The pass crossing is thrilling, and the visit to Chandratal Lake is the cherry on top.",
    itinerary: [
      { day: 1, title: "Manali to Jobra", desc: "Drive to Jobra and short trek to Chika." },
      { day: 2, title: "Chika to Balu Ka Ghera", desc: "Trek along the river through flower-filled meadows." },
      { day: 3, title: "Crossing the Pass", desc: "Steep ascent to Hampta Pass (14,000 ft) and descent to Shea Goru." },
      { day: 4, title: "Shea Goru to Chatru", desc: "Descent to the roadhead at Chatru. Drive to Chandratal Lake." },
      { day: 5, title: "Departure", desc: "Drive from Chatru to Manali." }
    ],
    price: "₹10,200",
    coverImage: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80&w=1200", // Tent camping
    gallery: [
      "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1533240332313-0db49b459ad6?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&q=80&w=800"
    ]
  },
  {
    id: 3,
    slug: "roopkund-trek",
    title: "Roopkund Trek",
    duration: "8 Days",
    difficulty: "Difficult",
    season: "Summer & Autumn",
    shortDescription: "The mysterious skeleton lake trek, featuring alpine meadows and stunning views of Mt. Trishul.",
    fullDescription: "Roopkund is famous for its high-altitude glacial lake where hundreds of human skeletons are found. The trail passes through the twin meadows of Ali Bugyal and Bedni Bugyal, considered some of the most beautiful in Asia. The climb is challenging but rewards you with up-close views of Mt. Trishul and Nanda Ghunti.",
    itinerary: [
      { day: 1, title: "Lohajung Arrival", desc: "Drive from Kathgodam to Lohajung base camp." },
      { day: 2, title: "Lohajung to Didna", desc: "Trek through mixed forests to Didna village." },
      { day: 3, title: "Didna to Ali Bugyal", desc: "Climb through oak forests to reach the vast meadows." },
      { day: 4, title: "Explore Bedni Bugyal", desc: "Short trek to Ghora Lotani via Bedni Bugyal." },
      { day: 5, title: "The Climb", desc: "Ascend to Bhagwabasa, the advanced base camp." },
      { day: 6, title: "Summit Day", desc: "Trek to Roopkund Lake and Junargali Ridge. Return to Bedni Bugyal." },
      { day: 7, title: "Return", desc: "Descent to Wan village and drive to Lohajung." },
      { day: 8, title: "Departure", desc: "Drive back to Kathgodam." }
    ],
    price: "₹14,500",
    coverImage: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1200", // High mountains
    gallery: [
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80&w=800"
    ]
  },
  {
    id: 4,
    slug: "valley-of-flowers",
    title: "Valley of Flowers",
    duration: "6 Days",
    difficulty: "Moderate",
    season: "July - September",
    shortDescription: "A UNESCO World Heritage site known for its endemic alpine flowers and rich biodiversity.",
    fullDescription: "The Valley of Flowers is a fairytale land. In full bloom, the valley is a carpet of colors with flowers like Blue Poppy, Brahma Kamal, and Cobra Lily. It's a photographer's paradise and a nature lover's dream. The trek also includes a visit to the holy Sikh shrine of Hemkund Sahib.",
    itinerary: [
      { day: 1, title: "Govindghat", desc: "Drive from Rishikesh to Govindghat." },
      { day: 2, title: "Trek to Ghangaria", desc: "13km trek to the base village of Ghangaria." },
      { day: 3, title: "Valley Visit", desc: "Enter the national park and explore the valley." },
      { day: 4, title: "Hemkund Sahib", desc: "Steep climb to the gurudwara at 14,000 ft." },
      { day: 5, title: "Return", desc: "Trek back to Govindghat. Drive to Joshimath." },
      { day: 6, title: "Departure", desc: "Drive back to Rishikesh." }
    ],
    price: "₹9,800",
    coverImage: "https://images.unsplash.com/photo-1490750967868-69c2f016be99?auto=format&fit=crop&q=80&w=1200", // Flowers
    gallery: [
      "https://images.unsplash.com/photo-1507608869274-2c330136e85e?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=800"
    ]
  },
  {
    id: 5,
    slug: "kashmir-great-lakes",
    title: "Kashmir Great Lakes",
    duration: "8 Days",
    difficulty: "Moderate to Difficult",
    season: "July - September",
    shortDescription: "Arguably the prettiest trek in India, featuring seven turquoise alpine lakes.",
    fullDescription: "This trek is a visual masterpiece. Every day brings a new alpine lake, each more beautiful than the last. You walk through maple forests, cross high passes, and camp beside these pristine water bodies. The contrast of green meadows against rugged mountains and blue lakes is breathtaking.",
    itinerary: [
      { day: 1, title: "Sonamarg", desc: "Arrival in Srinagar and drive to Sonamarg." },
      { day: 2, title: "Nichnai", desc: "Trek through meadows to Nichnai campsite." },
      { day: 3, title: "Vishansar Lake", desc: "Cross Nichnai pass to reach the first major lakes." },
      { day: 4, title: "Gadsar", desc: "Cross Gadsar pass, the highest point, to reach the lake of flowers." },
      { day: 5, title: "Satsar", desc: "Short trek to the seven lakes of Satsar." },
      { day: 6, title: "Gangabal", desc: "Cross Zajibal pass for twin lakes views." },
      { day: 7, title: "Naranag", desc: "Descent to Naranag civilization." },
      { day: 8, title: "Departure", desc: "Drive to Srinagar." }
    ],
    price: "₹15,900",
    coverImage: "https://images.unsplash.com/photo-1595878715977-2a8f8f01a3b8?auto=format&fit=crop&q=80&w=1200", // Lake
    gallery: [
      "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1433086966358-54859d0ed716?auto=format&fit=crop&q=80&w=800"
    ]
  },

  {
    id: 6,
    slug: "sandakphu-trek",
    title: "Sandakphu Phalut",
    duration: "7 Days",
    difficulty: "Moderate",
    season: "Oct - Apr",
    shortDescription: "The only trek in India from where you can see four of the world's tallest peaks.",
    fullDescription: "Sandakphu is the highest peak in West Bengal. This trek follows the border between India and Nepal. The highlight is the 'Sleeping Buddha' formation of Kanchenjunga and views of Mt. Everest, Lhotse, and Makalu. In spring, the trail is ablaze with rhododendrons.",
    itinerary: [
      { day: 1, title: "Manebhanjan", desc: "Drive from NJP to Manebhanjan." },
      { day: 2, title: "Tumling", desc: "Trek to Tumling in Nepal." },
      { day: 3, title: "Kalipokhri", desc: "Walk through the Singalila National Park." },
      { day: 4, title: "Sandakphu", desc: "Climb to the highest point for sunset views." },
      { day: 5, title: "Phalut", desc: "Ridge walk with constant mountain views." },
      { day: 6, title: "Gorkhey", desc: "Descend through bamboo forests." },
      { day: 7, title: "Return", desc: "Trek to Srikhola and drive back." }
    ],
    price: "₹11,500",
    coverImage: "https://images.unsplash.com/photo-1544198365-f5d60b6d8190?auto=format&fit=crop&q=80&w=1200", // Sunrise
    gallery: [
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1490682143684-14369e18dce8?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1517021897933-0e0319cfbc28?auto=format&fit=crop&q=80&w=800"
    ]
  },
   {
    id: 7,
    slug: "kuari-pass-trek",
    title: "Kuari Pass",
    duration: "7 Days",
    difficulty: "Moderate",
    season: "Oct - Apr",
    shortDescription: "The only trek in India from where you can see four of the world's tallest peaks.",
    fullDescription: "Sandakphu is the highest peak in West Bengal. This trek follows the border between India and Nepal. The highlight is the 'Sleeping Buddha' formation of Kanchenjunga and views of Mt. Everest, Lhotse, and Makalu. In spring, the trail is ablaze with rhododendrons.",
    itinerary: [
      { day: 1, title: "Manebhanjan", desc: "Drive from NJP to Manebhanjan." },
      { day: 2, title: "Tumling", desc: "Trek to Tumling in Nepal." },
      { day: 3, title: "Kalipokhri", desc: "Walk through the Singalila National Park." },
      { day: 4, title: "Sandakphu", desc: "Climb to the highest point for sunset views." },
      { day: 5, title: "Phalut", desc: "Ridge walk with constant mountain views." },
      { day: 6, title: "Gorkhey", desc: "Descend through bamboo forests." },
      { day: 7, title: "Return", desc: "Trek to Srikhola and drive back." }
    ],
    price: "₹8,499",
    coverImage: "https://images.unsplash.com/photo-1544198365-f5d60b6d8190?auto=format&fit=crop&q=80&w=1200", // Sunrise
    gallery: [
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1490682143684-14369e18dce8?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1517021897933-0e0319cfbc28?auto=format&fit=crop&q=80&w=800"
    ]
  }
];
