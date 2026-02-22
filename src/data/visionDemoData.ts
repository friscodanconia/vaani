export interface VisionDocument {
  title: string;
  era: string;
  description: string;
  imageUrl: string;
  imageAspect?: string;
  extractedText: string;
  language: string;
}

export const VISION_DOCUMENTS: VisionDocument[] = [
  {
    title: "The Constitution of India",
    era: "Republic, 1950",
    description: "The original hand-calligraphed Preamble — written by Prem Behari Narain Raizada, illustrated by Nandalal Bose.",
    imageUrl: "/constitution-preamble.jpg",
    extractedText:
      "THE CONSTITUTION OF INDIA\n\nWE, THE PEOPLE OF INDIA, having solemnly resolved to constitute India into a SOVEREIGN DEMOCRATIC REPUBLIC and to secure to all its citizens:\n\nJUSTICE, social, economic and political;\nLIBERTY of thought, expression, belief, faith and worship;\nEQUALITY of status and of opportunity;\n\nand to promote among them all FRATERNITY assuring the dignity of the individual and the unity of the Nation.",
    language: "English (Calligraphed)",
  },
  {
    title: "Tamil Sangam Poetry Manuscript",
    era: "Classical, ~300 BCE",
    description: "Ancient Tamil poetry from the Sangam period, one of the oldest literary traditions in India.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/8/82/Tamil_palm-leaf_manuscript_of_Tolk%C4%81ppiyam.jpg",
    imageAspect: "wide",
    extractedText:
      "யாதும் ஊரே யாவரும் கேளிர்\nதீதும் நன்றும் பிறர் தர வாரா\nநோதலும் தணிதலும் அவற்றோர் அன்ன\n\nEvery country is my own, and every person my kin.\nGood and evil do not come from others.\nPain and its relief are of the same nature.",
    language: "Tamil",
  },
  {
    title: "Bengali Land Revenue Record",
    era: "Colonial, 1857",
    description: "A Permanent Settlement era land revenue document from Bengal, written in Bengali script.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/%E0%A6%9A%E0%A6%B0%E0%A7%8D%E0%A6%AF%E0%A6%BE%E0%A6%AA%E0%A6%A6-%E0%A6%8F%E0%A6%B0_%E0%A7%A9%E0%A7%AF_%E0%A6%A8%E0%A6%82_%E0%A6%AA%E0%A7%83%E0%A6%B7%E0%A7%8D%E0%A6%A0%E0%A6%BE%3B_%E0%A6%AA%E0%A7%8D%E0%A6%B0%E0%A6%BE%E0%A6%9A%E0%A7%80%E0%A6%A8_%E0%A6%AC%E0%A6%BE%E0%A6%82%E0%A6%B2%E0%A6%BE_%E0%A6%AD%E0%A6%BE%E0%A6%B7%E0%A6%BE%E0%A6%B0_%E0%A6%A8%E0%A6%BF%E0%A6%A6%E0%A6%B0%E0%A7%8D%E0%A6%B6%E0%A6%A8_-_Page-39_of_the_Charyapad_manuscript%2C_a_sign_of_the_Bengali_or_Old_Bengali_language.jpg/800px-thumbnail.jpg",
    extractedText:
      "জমিদারি রাজস্ব নথি — বাংলা প্রেসিডেন্সি\n\nমৌজা: কালীঘাট, পরগণা: ২৪ পরগণা\nখতিয়ান নং: ৪৫৭\nজমির পরিমাণ: ১২ বিঘা ৩ কাঠা\nবার্ষিক রাজস্ব: ৪৫ টাকা ৮ আনা\n\nZamindari Revenue Record — Bengal Presidency\nMouza: Kalighat, Pargana: 24 Parganas\nPlot No: 457\nLand Area: 12 bigha 3 katha\nAnnual Revenue: 45 rupees 8 annas",
    language: "Bengali + English",
  },
];
