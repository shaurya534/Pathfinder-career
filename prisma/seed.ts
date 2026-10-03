import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TEACHERS = [
  {
    name: "Ananya Rao",
    headline: "Ex-Amazon SDE-2 · DSA & System Design coach",
    subjects: "DSA, System Design, Interview Preparation",
    bio: "6 years at Amazon, has coached 200+ candidates through FAANG-style interviews. Focuses on pattern-based problem solving.",
    rating: 4.9,
    reviewCount: 182,
    hourlyRate: 1499,
    currency: "INR",
  },
  {
    name: "Rahul Mehta",
    headline: "DBMS & SQL specialist, ex-TCS",
    subjects: "DBMS, Computer Networks, SQL",
    bio: "8 years building backend systems at TCS and a fintech startup. Explains DBMS internals with real production war stories.",
    rating: 4.8,
    reviewCount: 96,
    hourlyRate: 999,
    currency: "INR",
  },
  {
    name: "Priya Nair",
    headline: "Full-stack mentor · React & Node",
    subjects: "Web Development, JavaScript, Node.js",
    bio: "Freelance full-stack engineer and bootcamp instructor. Great for portfolio/project review sessions.",
    rating: 4.7,
    reviewCount: 64,
    hourlyRate: 1199,
    currency: "INR",
  },
  {
    name: "Dr. Sameer Iyer",
    headline: "Operating Systems & C++ professor",
    subjects: "Operating Systems, C++, OOP",
    bio: "University professor with 15 years teaching systems courses. Known for making OS internals click.",
    rating: 4.9,
    reviewCount: 210,
    hourlyRate: 899,
    currency: "INR",
  },
  {
    name: "Kavya Sharma",
    headline: "Data Science & ML interview coach",
    subjects: "Data Science, AI/ML, Python",
    bio: "ML engineer at a Series-B startup, previously Flipkart. Covers ML fundamentals through to case-study interviews.",
    rating: 4.8,
    reviewCount: 71,
    hourlyRate: 1699,
    currency: "INR",
  },
  {
    name: "Arjun Verma",
    headline: "Communication & HR interview coach",
    subjects: "Communication Skills, Interview Preparation, HR",
    bio: "Former HR business partner turned coach. Specializes in behavioral storytelling and confident delivery.",
    rating: 4.9,
    reviewCount: 143,
    hourlyRate: 799,
    currency: "INR",
  },
];

async function main() {
  for (const t of TEACHERS) {
    await prisma.teacher.create({ data: t });
  }
  console.log(`Seeded ${TEACHERS.length} teachers.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
