"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const cards = [
  "https://i.ibb.co/12sqpLg/Excuse.jpg",
  "https://i.ibb.co/V9qW0jy/21-atout.jpg",
  "https://i.ibb.co/Lxqs5KY/1-atout.jpg",
];

export default function AnimatedTarotCards() {
  return (
    <div className="flex flex-row justify-center items-center space-x-4 h-64 my-16 overflow-hidden">
      {cards.map((card, index) => (
        <motion.div
          key={index}
          initial={{ rotate: 0, x: 0 }}
          animate={{
            rotate: [-5, 5, -5],
            x: [0, 10, -10, 0],
          }}
          transition={{
            duration: 5,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
            delay: index * 0.2,
          }}
        >
          <Image
            src={card || "/placeholder.svg"}
            alt={`Tarot Card ${index + 1}`}
            width={150}
            height={250}
            className="rounded-lg shadow-lg"
          />
        </motion.div>
      ))}
    </div>
  );
}
