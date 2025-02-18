"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import AnimatedTarotCards from "./AnimatedTarotCards";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-900 to-emerald-700 text-white">
      <header className="container mx-auto py-6 flex justify-between items-center">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl font-bold"
        >
          Tarot Mystique
        </motion.h1>
        <nav>
          <Button variant="ghost" asChild className="hover:bg-green-800">
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-16">
        <section className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-5xl font-bold mb-4"
          >
            Discover the Magic of Tarot
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-xl mb-8"
          >
            Unlock the secrets of the cards and explore your destiny
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Button
              asChild
              size="lg"
              className="bg-green-600 hover:bg-green-700"
            >
              <Link href="/dashboard">Start Your Journey</Link>
            </Button>
          </motion.div>
        </section>

        <AnimatedTarotCards />

        <section className="grid md:grid-cols-3 gap-8 my-16">
          {[
            {
              title: "Règles",
              description: "Apprenez les règles du jeu de Tarot",
              link: "/regles",
            },
            {
              title: "Jouer",
              description: "Commencez une nouvelle partie",
              link: "/dashboard",
            },
            {
              title: "Statistiques",
              description: "Consultez vos statistiques de jeu",
              link: "/statistiques",
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 * index }}
            >
              <Link href={feature.link} className="block">
                <div className="bg-green-800/30 backdrop-blur-lg p-6 rounded-lg hover:bg-green-700/50 transition-colors">
                  <h3 className="text-2xl font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p>{feature.description}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </section>
      </main>

      <footer className="bg-green-950 py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2023 Tarot Mystique. All rights reserved.</p>
          <div className="mt-4">
            <Link
              href="/about"
              className="text-green-300 hover:text-white mx-2"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-green-300 hover:text-white mx-2"
            >
              Contact
            </Link>
            <Link
              href="/privacy"
              className="text-green-300 hover:text-white mx-2"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
